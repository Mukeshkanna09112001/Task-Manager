'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getAllTasks, createTask, updateTask, deleteTask } from '../../action/tasks';
import { getAllUsers } from '../../action/users';
import { fetchCommentsByTaskId, addComment } from '../../action/comments'
import {
  setTasks,
  setError,
  setLoading,
  addTask,
} from '../features/tasks/taskSlice';
import { Task, User } from '../types';
import styles from './task.module.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: string;
  role: 'admin' | 'user';
  exp: number;
}

const decodeToken = (): User | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return {
      _id: decoded.id,
      email: '',
      firstName: '',
      lastName: '',
      role: decoded.role,
    };
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};

const TaskPage = () => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);

  const [users, setUsers] = useState<User[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [showCommentModal, setShowCommentModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'TODO',
  });

  useEffect(() => {
    const user = decodeToken();
    setLoggedInUser(user);
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      fetchTasks();
    }
  }, [loggedInUser, statusFilter, userFilter]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenComment = async (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowCommentModal(true);
    try {
      const data = await fetchCommentsByTaskId(taskId);
      setComments(data);
      if (data.length > 0) {
        setCommentText(data[0].text);
      } else {
        setCommentText('');
      }
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };


  const handleAddComment = async () => {
  if (!commentText.trim() || !selectedTaskId) return;

  try {
    const newComment = await addComment(selectedTaskId, commentText);
    
    setComments([newComment]);
    setCommentText('');

    fetchTasks();

    setShowCommentModal(false)

  } catch (err) {
    console.error('Error adding comment:', err);
    alert('Error adding comment');
  }
};

  const fetchTasks = async () => {
    if (!loggedInUser) {
      console.warn('No logged-in user found. Aborting fetchTasks.');
      return;
    }

    dispatch(setLoading(true));
    try {
      const filters: { [key: string]: string | undefined } = {
        status: statusFilter || undefined,
      };

      if (loggedInUser.role === 'user') {
        filters['assignedTo'] = loggedInUser._id;
      } else if (userFilter) {
        filters['assignedTo'] = userFilter;
      }

      const data = await getAllTasks(filters);

      dispatch(setTasks(data));
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.description || !newTask.assignedTo) {
      alert('Please fill in all fields');
      return;
    }

    try {
      if (editingTaskId) {
        await updateTask(editingTaskId, newTask);
      } else {
        const created = await createTask(newTask);
        dispatch(addTask(created));
      }

      setShowModal(false);
      setNewTask({ title: '', description: '', assignedTo: '', status: 'TODO' });
      setEditingTaskId(null);
      fetchTasks();
    } catch (err: any) {
      alert(err.message || 'Error saving task');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTaskId(task._id);
    setNewTask({
      title: task.title,
      description: task.description,
      assignedTo: typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo._id,
      status: task.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (taskId: string) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this task?');
    if (!shouldDelete) return;

    try {
      await deleteTask(taskId);
      fetchTasks();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const paginatedTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  if (!loggedInUser) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Task</h2>

      {/* Filters */}
      <div className={styles.filters}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="TODO">TODO</option>
          <option value="IN-PROGRESS">IN-PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>

        {loggedInUser.role === 'admin' && (
          <>
            <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>

            <button onClick={() => setShowModal(true) } className={styles.createButton}>
              + Create Task
            </button>
          </>
        )}
      </div>

      {/* Task Table */}
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Description</th>
                <th>Assigned To</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTasks.map((task) => (
                <tr key={task._id}>
                  <td>{task.title}</td>
                  <td>{task.status}</td>
                  <td>{task.description}</td>
                  <td>
                    {typeof task.assignedTo === 'object'
                      ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                      : users.find((u) => u._id === task.assignedTo)?.firstName || task.assignedTo}
                  </td>
                  <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                  <td>
                    <FaEdit onClick={() => handleEdit(task)} className={styles.iconButton} />
                    <FaTrash onClick={() => handleDelete(task._id)} className={styles.iconButton} />
                    <button onClick={() => handleOpenComment(task._id)} className={styles.commentButton}>
                      Comment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className={styles.pagination}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={currentPage === index + 1 ? styles.activePage : ''}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </>
      )}

      {showCommentModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.wrapper}>
            <div className={styles.card}>
              <h3 className={styles.title}>Comments</h3>
              <textarea
                className={styles.commentInput}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write or edit comment"
              />

              <div className={styles.modalActions}>
                <button onClick={() => setShowCommentModal(false)} className={styles.cancelButton}>
                  Close
                </button>
                <button onClick={handleAddComment} className={styles.button}>
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.wrapper}>
            <div className={styles.card}>
              <h3 className={styles.title}>{editingTaskId ? 'Update New Task' : 'Create New Task'}</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>Title</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.input}
                  placeholder="Description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Assign To</label>
                <select
                  className={styles.input}
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Status</label>
                <select
                  className={styles.input}
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                >
                  <option value="TODO">TODO</option>
                  <option value="IN-PROGRESS">IN-PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button className={styles.cancelButton} onClick={() => {
                    setShowModal(false);
                    setNewTask({ title: '', description: '', assignedTo: '', status: 'TODO' });
                    setEditingTaskId(null);
                  }}
                >
                  Cancel
                </button>
                <button className={styles.button} onClick={handleCreateTask}>
                  {editingTaskId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPage;

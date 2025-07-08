'use client';
import React, { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import { getAllTasks, createTask, updateTask } from '../../action/tasks';
import { getAllUsers } from '../../action/users';
import { Task, User } from '../types';
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from '@hello-pangea/dnd';
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

const DashboardPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
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
    }, [statusFilter, userFilter, loggedInUser]);

   useEffect(() => {
        fetchUsers();
    }, []);

    const fetchTasks = async () => {
        if (!loggedInUser) return;

        const filters: { [key: string]: string | undefined } = {
            status: statusFilter || undefined,
        };

        if (loggedInUser.role === 'user') {
            filters['assignedTo'] = loggedInUser._id;
        } else if (userFilter) {
            filters['assignedTo'] = userFilter;
        }

        const data = await getAllTasks(filters);
        setTasks(data);
    };

    const fetchUsers = async () => {
        const data = await getAllUsers();
        setUsers(data);
    };

    const handleCreateOrUpdate = async () => {
        const { title, description, assignedTo } = newTask;
        if (!title || !description || !assignedTo) {
            alert('All fields are required');
            return;
        }

        if (editingTaskId) {
            await updateTask(editingTaskId, newTask);
        } else {
            await createTask(newTask);
        }

        setShowModal(false);
        setNewTask({ title: '', description: '', assignedTo: '', status: 'TODO' });
        setEditingTaskId(null);
        fetchTasks();
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination || destination.droppableId === source.droppableId) return;

        const shouldDelete = window.confirm('Are you sure you want to delete this task?');
        if (!shouldDelete) return;

        const task = tasks.find((t) => t._id === draggableId);
        if (!task) return;

        await updateTask(task._id, { ...task, status: destination.droppableId });
        fetchTasks();
    };

    const groupedTasks = {
        TODO: tasks.filter((task) => task.status === 'TODO'),
        'IN-PROGRESS': tasks.filter((task) => task.status === 'IN-PROGRESS'),
        DONE: tasks.filter((task) => task.status === 'DONE'),
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Dashboard</h2>

            <div className={styles.filters}>
                {loggedInUser?.role === 'admin' && (
                    <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                        <option value="">All Users</option>
                        {users.map((u) => (
                            <option key={u._id} value={u._id}>
                                {u.firstName} {u.lastName}
                            </option>
                        ))}
                    </select>
                )}

                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="TODO">TODO</option>
                    <option value="IN-PROGRESS">IN-PROGRESS</option>
                    <option value="DONE">DONE</option>
                </select>

                {loggedInUser?.role === 'admin' && (
                    <button onClick={() => setShowModal(true)} className={styles.createButton}>
                        + Create Task
                    </button>
                )}
            </div>


            <DragDropContext onDragEnd={onDragEnd}>
                <div className={styles.groupContainer}>
                    {['TODO', 'IN-PROGRESS', 'DONE'].map((status) => (
                        <Droppable droppableId={status} key={status}>
                            {(provided) => (
                                <div
                                    className={styles.group}
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <h3>{status}</h3>
                                    {groupedTasks[status as keyof typeof groupedTasks].map((task, index) => (
                                        <Draggable key={task._id} draggableId={task._id} index={index}>
                                            {(provided) => (
                                                <div
                                                    className={styles.taskCard}
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <h4>{task.title}</h4>
                                                    <p>{task.description}</p>
                                                    <p>
                                                        {typeof task.assignedTo === 'object'
                                                            ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                                                            : users.find((u) => u._id === task.assignedTo)?.firstName || task.assignedTo}
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            setEditingTaskId(task._id);
                                                            setNewTask({
                                                                title: task.title,
                                                                description: task.description,
                                                                assignedTo:
                                                                    typeof task.assignedTo === 'string'
                                                                        ? task.assignedTo
                                                                        : task.assignedTo._id,
                                                                status: task.status,
                                                            });
                                                            setShowModal(true);
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>

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
                                <button
                                    className={styles.cancelButton}
                                    onClick={() => {
                                        setShowModal(false);
                                        setNewTask({ title: '', description: '', assignedTo: '', status: 'TODO' });
                                        setEditingTaskId(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button className={styles.button} onClick={handleCreateOrUpdate}>
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

export default DashboardPage;
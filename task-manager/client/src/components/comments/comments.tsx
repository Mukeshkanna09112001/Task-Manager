'use client';
import React, { useEffect, useState } from 'react';
import styles from './comments.module.css';
import {
    getAllComments,
    createComment,
    updateComment,
    deleteComment,
} from '../../action/comments';
import { getAllTasks } from '../../action/tasks';
import { Comment, User, Task } from '../types';
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

const CommentsPage = () => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

    useEffect(() => {
        const user = decodeToken();
        setLoggedInUser(user);
    }, []);

    useEffect(() => {
        fetchComments();
        fetchTasks();
    }, []);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const data = await getAllComments();
            console.log('data', data);
            setComments(data);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const data = await getAllTasks();
            setTasks(data);
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        }
    };


    const handleCreateOrUpdate = async () => {
        if (!newComment.trim() || !selectedTaskId) {
            alert('Please provide a comment and select a task');
            return;
        }

        try {
            if (editingCommentId) {
                await updateComment(editingCommentId, newComment);
            } else {
                await createComment({ text: newComment, taskId: selectedTaskId });
            }

            fetchComments();
            setShowModal(false);
            setNewComment('');
            setSelectedTaskId('');
            setEditingCommentId(null);
        } catch (err) {
            alert('Failed to save comment');
        }
    };

    const handleEdit = (comment: Comment) => {
        setEditingCommentId(comment._id);
        setNewComment(comment.text);
        setSelectedTaskId(typeof comment.taskId === 'string' ? comment.taskId : comment.taskId._id);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        const confirmDelete = window.confirm('Delete this comment?');
        if (!confirmDelete) return;

        try {
            await deleteComment(id);
            fetchComments();
        } catch (err) {
            alert('Failed to delete comment');
        }
    };

    if (!loggedInUser) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Comments</h2>

            <div className={styles.filters}>
                <button className={styles.createButton} onClick={() => {
                    setNewComment('');
                    setSelectedTaskId('');
                    setEditingCommentId(null);
                    setShowModal(true);
                }}>
                    + Add Comment
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Comment</th>
                            <th>Task</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.map((comment) => {
                            const matchedTask = tasks.find((task) => {
                                if (typeof comment.taskId === 'string') return task._id === comment.taskId;
                                return task._id === comment.taskId._id;
                            });

                            return (
                                <tr key={comment._id}>
                                    <td>{comment.text}</td>
                                    <td>{matchedTask?.title || 'Unknown Task'}</td>
                                    <td>{new Date(comment.createdAt).toLocaleDateString()}</td>
                                   <td>
  <FaEdit className={styles.iconButton} onClick={() => handleEdit(comment)} />
  <FaTrash className={styles.iconButton} onClick={() => handleDelete(comment._id)} />
</td>

                                </tr>
                            );
                        })}
                    </tbody>

                </table>
            )}

            {showModal && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.wrapper}>
                        <div className={styles.card}>
                            <h3 className={styles.title}>{editingCommentId ? 'Edit Comment' : 'Add Comment'}</h3>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Comment</label>
                                <textarea
                                    className={styles.commentInput}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Select Task</label>
                                <select
                                    className={styles.input}
                                    value={selectedTaskId}
                                    onChange={(e) => setSelectedTaskId(e.target.value)}
                                >
                                    <option value="">-- Select Task --</option>
                                    {tasks.map((task) => (
                                        <option key={task._id} value={task._id}>
                                            {task.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.modalActions}>
                                <button
                                    className={styles.cancelButton}
                                    onClick={() => {
                                        setShowModal(false);
                                        setNewComment('');
                                        setSelectedTaskId('');
                                        setEditingCommentId(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button className={styles.button} onClick={handleCreateOrUpdate}>
                                    {editingCommentId ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentsPage;

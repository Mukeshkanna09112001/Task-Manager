import API from '../components/services/api';

export const fetchCommentsByTaskId = async (taskId: string) => {
  const res = await API.get(`/tasks/${taskId}/comments`);
  return res.data;
};

export const addComment = async (taskId: string, text: string) => {
  const res = await API.post(`/tasks/${taskId}/comments`, { text });
  return res.data;
};

export const getAllComments = async () => {
  const res = await API.get('/comments');
  return res.data;
};

export const createComment = async (data: { text: string; taskId: string }) => {
  const res = await API.post(`/tasks/${data.taskId}/comments`, { text: data.text });
  return res.data;
};

export const updateComment = async (commentId: string, text: string) => {
  const res = await API.put(`/comments/${commentId}`, { text });
  return res.data;
};

export const deleteComment = async (commentId: string) => {
  const res = await API.delete(`/comments/${commentId}`);
  return res.data;
};

import API from '../components/services/api';

export const getAllTasks = async (filters = {}) => {
  const res = await API.get('/tasks', { params: filters });
  return res.data;
};

export const createTask = async (task: any) => {
  const res = await API.post('/tasks', task);
  return res.data;
};

export const updateTask = async (id: string, task: any) => {
  const res = await API.put(`/tasks/${id}`, task);
  return res.data;
};

export const deleteTask = async (id: string) => {
  const res = await API.delete(`/tasks/${id}`);
  return res.data;
};

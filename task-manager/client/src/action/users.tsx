import API from '../components/services/api';

export const getAllUsers = async () => {
  const res = await API.get('/users');
  return res.data;
};

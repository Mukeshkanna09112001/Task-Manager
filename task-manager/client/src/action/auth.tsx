import API from '../components/services/api';

export const loginUser = async (credentials: { email: string; password: string }) => {
  const res = await API.post('/auth/login', credentials);
  return res.data;
};

export const registerUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}) => {
  console.log('user data', userData);
  const res = await API.post('/auth/register', userData);
  return res.data;
};

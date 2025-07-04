import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './app/login/page';
import RegisterPage from './app/register/page';
import DashboardPage from './app/dashboard/page';
import TaskDetailPage from './app/task/page';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/task" element={<TaskDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { Routes, Route, Navigate } from 'react-router-dom';

import HomeView from '../views/HomeView.jsx';
import LoginView from '../views/LoginView.jsx';
import RegisterView from '../views/RegisterView.jsx';
import ForgotPasswordView from '../views/ForgotPasswordView.jsx';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/home" replace={true} />} />
    <Route path="/home" element={<HomeView />} />
    <Route path="/login" element={<LoginView />} />
    <Route path="/register" element={<RegisterView />} />
    <Route path="/forgot-password" element={<ForgotPasswordView />} />
  </Routes>
);

export default AppRoutes;
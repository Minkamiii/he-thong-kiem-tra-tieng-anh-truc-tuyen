import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

import HomeView from '../views/HomeView.jsx';
import LoginView from '../views/LoginView.jsx';
import RegisterView from '../views/RegisterView.jsx';
import ForgotPasswordView from '../views/ForgotPasswordView.jsx';
import TestView from '../views/TestView.jsx';
import TestDetailPage from '../views/components/TestDetailPage.jsx';
import UserProfileView from '../views/UserProfileView.jsx';


const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/home" replace={true} />} />
    <Route path="/home" element={<HomeView />} />
    <Route path="/login" element={<LoginView />} />
    <Route path="/register" element={<RegisterView />} />
    <Route path="/forgot-password" element={<ForgotPasswordView />} />
    <Route path="/test/" element={<TestView isLoggedIn={false} user={null} />} />
    <Route path="/test/:testId" element={<TestDetailPage isLoggedIn={false} user={null} />} />
    <Route path="/profile" element={<UserProfileView />} />
  </Routes>
);

export default AppRoutes;
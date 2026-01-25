import { Routes, Route, Navigate } from 'react-router-dom';

import RegisterView from '../views/RegisterView.jsx';
import ForgotPasswordView from '../views/ForgotPasswordView.jsx';
import TestDetailPage from '../views/components/TestDetailPage.jsx';
import BaseTestPage from '../views/components/BaseTestPage.jsx';
import TestView from '../views/TestView.jsx';
import HomeView from '../views/HomeView.jsx';
import LoginView from '../views/LoginView.jsx';
import HistoryView from '../views/HistoryView.js'
import UserProfileView from '../views/UserProfileView.jsx';
import HistoryDetailView from '../views/HistoryDetailView.jsx';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/home" replace={true} />} />
    <Route path="/home" element={<HomeView />} />
    <Route path="/profile" element={<UserProfileView />} />

    <Route path="/login" element={<LoginView />} />
    <Route path="/register" element={<RegisterView />} />
    <Route path="/forgot-password" element={<ForgotPasswordView />} />

    <Route path="/test" element={<TestView />} />
    <Route path="/test/:testId" element={<TestDetailPage />} />
    <Route path="/test/:testId/take" element={<BaseTestPage />} />    
    <Route path="/history" element={<HistoryView />} />
    <Route path="/history/:id" element={<HistoryDetailView />} />

  </Routes>
);

export default AppRoutes;
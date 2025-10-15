import { Routes, Route, Navigate } from 'react-router-dom';

import RegisterView from '../views/RegisterView.jsx';
import ForgotPasswordView from '../views/ForgotPasswordView.jsx';
import TestView from '../views/TestView.jsx';
import TestDetailPage from '../views/components/TestDetailPage.jsx';
import UserProfileView from '../views/UserProfileView.jsx';
import BaseTestPage from '../views/components/BaseTestPage.jsx';
import LoginPage from '../page/LoginPage.jsx';
import HomePage from '../page/HomePage.jsx';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/home" replace={true} />} />
    <Route path="/home" element={<HomePage />} />
    <Route path="/profile" element={<UserProfileView />} />

    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterView />} />
    <Route path="/forgot-password" element={<ForgotPasswordView />} />

    <Route path="/test" element={<TestView isLoggedIn={false} user={null} />} />
    <Route path="/test/:testId" element={<TestDetailPage isLoggedIn={false} user={null} />} />
    <Route path="/test/:testId/take" element={<BaseTestPage isLoggedIn={false} user={null} />} />    

  </Routes>
);

export default AppRoutes;
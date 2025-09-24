import { Routes, Route } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Login";
import Home from "../pages/Home";
import HomeLayout from "../layouts/HomeLayout";
import Reading from "../pages/Reading";
import DetailPage from "../pages/Detail";
import UserDetail from "../pages/UserDetail";
import UserList from "../pages/UserList";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Route cho login */}
      <Route element={<AuthLayout />}>
        <Route path="" element={<Login />} />
      </Route>

      {/* Route cho các trang bên trong khi đã login */}
      <Route element={<HomeLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/users/:id" element={<UserDetail />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/reading/detail" element={<DetailPage />} />
        <Route path="/listening" element={<div> Listening Page </div>} />
        <Route path="/writing" element={<div> Writing Page </div>} />
      </Route>

    </Routes>
  );
}

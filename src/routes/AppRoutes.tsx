import { Routes, Route } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Login";
import Home from "../pages/Home";
import HomeLayout from "../layouts/HomeLayout";
import Reading from "../pages/ListTest";
import DetailPage from "../pages/Detail";
import UserDetail from "../pages/UserDetail";
import UserList from "../pages/UserList";
import UpdateTest from "../pages/UpdateTest";
import ModifyTestPage from "../pages/ModifyTest";

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
        <Route path="/reading" element={<Reading type="reading" />} />
        <Route path="/listening" element={<Reading type="listening" />} />
        <Route path="/writing" element={<Reading type="writing" />} />
        <Route path="/test/detail/:id" element={<DetailPage />} />
        <Route path="/test/update/:id" element={<UpdateTest />} />
        <Route path="/test/modify" element={<ModifyTestPage />} />
      </Route>

    </Routes>
  );
}

import { Outlet } from "react-router-dom";
import "./css/AuthLayout.css";

export default function AuthLayout() {
  return (
    <div className="container">
      <div className="content">
        {/* Các page con như Login/Register sẽ hiển thị ở đây */}
        <Outlet />
      </div>
    </div>
  );
}

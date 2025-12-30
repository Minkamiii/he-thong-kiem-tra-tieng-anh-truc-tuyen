import { Outlet } from "react-router-dom";
import "./css/AuthLayout.css";

export default function AuthLayout() {
  return (
    <div className="container">
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

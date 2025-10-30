import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./css/Sidebar.css";

import authApi from "../api/AuthApi";

export default function Sidebar() {
  const [openCategory, setOpenCategory] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await authApi.logout({ accessToken: localStorage.getItem("accessToken") || "" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
    localStorage.clear();
    alert("Logout successful");
    navigate("/");
  };

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Menu</h2>

      <NavLink to="/home" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
        Home
      </NavLink>

      <NavLink to="/users" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
        Customer
      </NavLink>

      <button className="sidebar-link dropdown-btn" onClick={() => setOpenCategory(!openCategory)}>
        Category {openCategory ? "▼" : "▶"}
      </button>

      {openCategory && (
        <div className="submenu">
          <NavLink to="reading" className="submenu-link">Reading</NavLink>
          <NavLink to="listening" className="submenu-link">Listening</NavLink>
          <NavLink to="writing" className="submenu-link">Writing</NavLink>
        </div>
      )}

      <div className="logout-section">
        <button className="login-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

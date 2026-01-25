import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./css/Sidebar.css";
import { Button } from "@mui/material";

import authApi from "../api/AuthApi";

export default function Sidebar() {
  const [openCategory, setOpenCategory] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout({ token: localStorage.getItem("refreshToken") || "" });
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
        User
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
        <Button variant="contained" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
}

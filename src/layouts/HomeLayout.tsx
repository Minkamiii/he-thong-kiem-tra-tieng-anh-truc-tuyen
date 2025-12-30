import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./css/HomeLayout.css";

export default function HomeLayout() {
  return (
    <div className="home-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

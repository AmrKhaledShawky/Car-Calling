import {
  Home,
  Car,
  PlusCircle,
  Package,
  Settings,
  LogOut,
  Menu
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./sidebar.css";

export default function Sidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      
      {/* Toggle Button */}
      <div className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        <Menu size={20} />
      </div>

      <h2 className="sidebar-logo">Car Calling</h2>

      <nav className="sidebar-menu">
        <NavLink to="/landlord/dashboard">
          <Home size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/landlord/my-cars">
          <Car size={18} />
          <span>My Cars</span>
        </NavLink>


        <NavLink to="/landlord/rental-requests">
          <Package size={18} />
          <span>Rental Requests</span>
        </NavLink>

        <NavLink to="/landlord/settings">
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={18} />
        <span>Logout</span>
      </div>
    </div>
  );
}

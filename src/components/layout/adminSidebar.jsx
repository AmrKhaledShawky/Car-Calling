import { NavLink, useNavigate } from "react-router-dom";
import { 
  FaBars, FaTachometerAlt, FaUserFriends, FaCar, 
  FaExchangeAlt, FaExclamationTriangle, FaStar, FaFileAlt 
} from "react-icons/fa";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./adminSidebar.css";

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/admin/dashboard" },
    { name: "Passengers", icon: <FaUserFriends />, path: "/admin/passengers" },
    { name: "Car Owners", icon: <FaCar />, path: "/admin/carowner" },
    { name: "Rental Transactions", icon: <FaExchangeAlt />, path: "/admin/transaction" },
    { name: "Car Issues", icon: <FaExclamationTriangle />, path: "/admin/carissues" },
    { name: "Review", icon: <FaStar />, path: "/admin/review" },
    { name: "Report", icon: <FaFileAlt />, path: "/admin/report" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      
      {/* Toggle Button */}
      <div className="admin-sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        <FaBars className="toggle-icon" />
        {!collapsed && (
          <div className="admin-sidebar-title">
            CarCalling
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="admin-sidebar-menu">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => 
              isActive ? "admin-sidebar-item active" : "admin-sidebar-item"
            }
          >
            <span className="admin-sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="admin-sidebar-text">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div
        className="admin-sidebar-logout"
        onClick={handleLogout}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleLogout();
          }
        }}
      >
        <span className="admin-sidebar-icon">
          <LogOut size={18} />
        </span>
        {!collapsed && <span className="admin-sidebar-text">Logout</span>}
      </div>
    </div>
  );
};

export default AdminSidebar;

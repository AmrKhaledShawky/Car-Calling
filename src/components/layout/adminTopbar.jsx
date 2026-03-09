import { FaUserCircle } from "react-icons/fa"; // أيقونة البروفايل
import { useNavigate } from "react-router-dom";
import "./adminTopbar.css";

const AdminTopBar = () => {
  const navigate = useNavigate();

  const goToProfile = () => {
    navigate("/admin/profile");
  };

  return (
    <div className="admin-topbar">
      <h1 className="admin-title">Admin Management</h1>
      <FaUserCircle className="admin-icon" onClick={goToProfile} />
    </div>
  );
};

export default AdminTopBar;
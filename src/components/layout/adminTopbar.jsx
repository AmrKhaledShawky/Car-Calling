import { FaUserCircle } from "react-icons/fa"; // أيقونة البروفايل
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./adminTopbar.css";

const AdminTopBar = () => {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);

  const goToProfile = () => {
    navigate("/admin/profile");
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastY && currentY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      setLastY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastY]);

  return (
    <div className={`admin-topbar ${hidden ? "hidden" : ""}`}>
      <div className="admin-topbar-left">
        <h1 className="admin-title">Admin Management</h1>
      </div>

      <div className="admin-topbar-right">
        <FaUserCircle className="admin-icon" onClick={goToProfile} />
      </div>
    </div>
  );
};

export default AdminTopBar;
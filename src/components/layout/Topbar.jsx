import { Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Topbar.css";

export default function Topbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayUser = user || { name: "Landlord Name", role: "landlord" };

  return (
    <div className="topbar">
      <div className="topbar-identity">
        <h2>{displayUser.name}</h2>
        <span className="topbar-role">{displayUser.role}</span>
      </div>

      <div className="topbar-right">
        <Bell size={20} className="topbar-icon" />

        <User
          size={20}
          className="topbar-icon"
          onClick={() => navigate("/landlord/profile")}
        />
      </div>
    </div>
  );
}

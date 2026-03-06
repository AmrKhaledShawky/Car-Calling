import { Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Topbar.css";

export default function Topbar() {
  const navigate = useNavigate();

  // derive user info (could come from context or storage)
  const stored = localStorage.getItem("user");
  const user = stored
    ? JSON.parse(stored)
    : { name: "Landlord Name", role: "Landlord" };

  return (
    <div className="topbar">
      <div className="topbar-identity">
        <h2>{user.name}</h2>
        <span className="topbar-role">{user.role}</span>
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
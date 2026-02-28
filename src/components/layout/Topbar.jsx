import { Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./topbar.css";

export default function Topbar() {
  const navigate = useNavigate();

  return (
    <div className="topbar">
      <h2>Landlord Panel</h2>

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
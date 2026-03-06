import { Search } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  return (
    <div className="navbar">
      <div className="logo">
        🚗 <span>Car Calling</span>
      </div>

      <div className="nav-links">
        <a>Home</a>
        <a className="active">Vehicles</a>
        <a>Services</a>
        <a>About Us</a>
      </div>

      <div className="nav-right">
        <Search size={18} />
        <button className="sign-btn">Sign In</button>
      </div>
    </div>
  );
}
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = ({ transparent = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className={`main-navbar ${transparent ? 'transparent' : ''}`}>
      <Link to="/" className="navbar-logo">
        Car <span>Calling</span>
      </Link>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/browse-cars" className="nav-link">Browse Cars</Link>
        <a href="#about" className="nav-link">About</a>
        <a href="#contact" className="nav-link">Contact</a>
      </div>
      <div className="nav-auth">
        {isAuthenticated ? (
          <button type="button" className="btn-register btn-signout" onClick={handleLogout}>
            Sign Out
          </button>
        ) : (
          <>
            <Link to="/login" className="btn-login">Login</Link>
            <Link to="/auth/register" className="btn-register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ transparent = false }) => {
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
        <Link to="/login" className="btn-login">Login</Link>
        <Link to="/auth/register" className="btn-register">Register</Link>
      </div>
    </nav>
  );
};

export default Navbar;
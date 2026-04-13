import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = ({ transparent = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
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
          <div className="nav-user-menu" ref={menuRef}>
            <button
              type="button"
              className="btn-register btn-user-menu"
              onClick={() => setMenuOpen((current) => !current)}
            >
              {user?.name ? `Hi, ${user.name.split(" ")[0]}` : "My Account"}
            </button>

            {menuOpen ? (
              <div className="nav-user-dropdown">
                <Link to="/my-rents" className="nav-user-item">My Rents</Link>
                <Link to="/profile" className="nav-user-item">Profile</Link>
                <button type="button" className="nav-user-item nav-user-logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : null}
          </div>
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

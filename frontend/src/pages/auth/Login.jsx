import React, { useState } from "react";
import "./login.css";
import car from "../../assets/login.png";
import { Eye, EyeOff } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(location.state?.redirectTo || result.redirectTo || "/");
    }
  };

  return (
    <div className="login-page">
      {/* LEFT HERO */}
      <div className="login-left">
        <Link to="/" className="navbar-logo">
          Car <span>Calling</span>
        </Link>

        <div className="login-left-content">
          <img src={car} alt="car" className="login-car-image" />
          <h2>Experience the Redline.</h2>
          <p>Premium rentals for those who demand excellence on every mile.</p>
        </div>
      </div>

      {/* RIGHT LOGIN FORM */}
      <div className="login-right">
        <div className="login-box">
          <h1>Welcome Back</h1>
          <p className="login-subtitle">
            Please enter your details to access your account.
          </p>

          <form onSubmit={handleSubmit}>
            {/* EMAIL */}
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* PASSWORD */}
            <div className="password-header">
              <label htmlFor="password">Password</label>
              <span className="login-forgot">Forgot Password?</span>
            </div>

            <div className="login-password-input">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* LOGIN BUTTON */}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Starting Engine..." : "⚡ Start Engine"}
            </button>
          </form>

          {/* SIGNUP */}
          <p className="login-signup">
            Don't have an account?
            <Link to="/auth/register" state={location.state}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

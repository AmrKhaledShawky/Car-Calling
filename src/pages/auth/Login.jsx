import React, { useState } from "react";
import "./login.css";
import car from "../../assets/login.png";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-page">

      {/* LEFT HERO */}
      <div className="login-left">

        <div className="login-brand">
          🚗 Car Calling...
        </div>

        <div className="login-left-content">

          <img src={car} alt="car" className="login-car-image" />

          <h2>Experience the Redline.</h2>

          <p>
            Premium rentals for those who demand excellence on every mile.
          </p>

        </div>

      </div>


      {/* RIGHT LOGIN FORM */}
      <div className="login-right">

        <div className="login-box">

          <h1>Welcome Back</h1>

          <p className="login-subtitle">
            Please enter your details to access your account.
          </p>

          {/* EMAIL */}
          <label>Email Address</label>
          <input
            type="email"
            placeholder="name@company.com"
          />

          {/* PASSWORD */}
          <div className="password-header">
            <label>Password</label>

            <span className="login-forgot">
              Forgot Password?
            </span>
          </div>

          <div className="login-password-input">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>

          </div>

          {/* LOGIN BUTTON */}
          <button className="login-btn">
            ⚡ Start Engine
          </button>

          {/* SIGNUP */}
          <p className="login-signup">

            Don't have an account?

            <Link to="/auth/register">
              Sign Up
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}
import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import carImage from "../../assets/car.png";
import "../../index.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login-container">
        <div className="bottom-circle"></div>
      {/* Decorative Dots (Gray Area) */}
      <div className="dot dot1"></div>
      <div className="dot dot2"></div>

      {/* Top Nav */}
      <div className="top-nav">
        <div className="logo">
          C<span>a</span>r C<span>a</span>lling...
        </div>
        <div className="nav-links">
          <span>About Car Calling</span>
          <span>Contact Us</span>
          <span>FAQ</span>
        </div>
      </div>

      {/* Left Side */}
      <div className="login-left">
        
        <h2>Welcome To</h2>
        <h1 className="brand">Car Calling</h1>

        <div className="input-group">
          <label>Email</label>
            <div className="input-wrapper">
    <Mail className="input-icon" size={18} />
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
            </div>
          <div className="footer">
  <span>© Car Calling 2026</span>
  <span className="privacy">Privacy Policy</span>
</div>
        </div>

        <div className="input-group">
          <label>Password</label>
            <div className="input-wrapper">
    <Lock className="input-icon" size={18} />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
            </div>
        </div>

        <button className="login-btn">Start Engine</button>

        <p className="signup-text">
          Don’t Have An Account? <span>SIGN UP</span>
        </p>
      </div>

      {/* Right Side */}
      <div className="login-right">
        <div className="circle"></div>
        <img src={carImage} alt="Car" />
        <div className="slogan">
          Power in Your <span>Hands.</span>
        </div>
      </div>

    </div>
    
    
  );
}
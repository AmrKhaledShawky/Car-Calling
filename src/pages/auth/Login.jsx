import { Mail, Lock } from "lucide-react";
import { useState } from "react";
import carImage from "../../assets/car.png";
import "../../index.css";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      console.log("Server Response:", data);

      // ⚠️ Do NOT navigate yet
      // Navigation should happen only after backend validates user

    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="bottom-circle"></div>
      <div className="dot dot1"></div>
      <div className="dot dot2"></div>

      {/* Top Nav */}
      <div className="login-top-nav">
        <div className="logo">
          C<span>a</span>r C<span>a</span>lling...
        </div>
      </div>

      {/* Left Side */}
      <div className="login-left">
        <h2>Welcome To</h2>
        <h1 className="brand">Car Calling</h1>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Starting..." : "Start Engine"}
          </button>
        </form>

        <p className="signup-text">
  Don’t Have An Account?{" "}
  <Link to="/auth/register" className="signup-link">
    SIGN UP
  </Link>
</p>
        

        <div className="footer">
          <span>© Car Calling 2026</span>
          <Link to="/Privacy" className="privacy">
            Privacy Policy
          </Link>
        </div>
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
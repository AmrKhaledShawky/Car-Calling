import React, { useState } from "react";
import "./register.css";
import { Camera } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const [role, setRole] = useState("user");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setFormData({
      ...formData,
      role: selectedRole
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      return;
    }
    if (!formData.email.trim()) {
      return;
    }
    if (!formData.password) {
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    if (formData.password.length < 6) {
      return;
    }

    setLoading(true);
    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.role
    );
    setLoading(false);

    if (result.success) {
      navigate(result.redirectTo || "/");
    }
  };

  return (
    <div className="register-page">

      {/* LEFT SIDE */}
      <div className="register-left">

        <div className="register-left-inner">

          <Link to="/" className="navbar-logo">
            Car <span>Calling</span>
          </Link>

          <h2>
            Experience the Peak
            <br />
            of Premium Mobility.
          </h2>

          <p>
            Join our exclusive community of premium
            car enthusiasts and logistics professionals.
          </p>

          <div className="register-members">

            <div className="register-avatars">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <span className="register-members-text">
              Joined by 2,000+ elite members
            </span>

          </div>

        </div>

      </div>


      {/* RIGHT SIDE */}
      <div className="register-right">

        <div className="register-box">

          <form onSubmit={handleSubmit}>

            <div className="register-header">

              <div>
                <h1>Create Your Account</h1>
                <p>Enter your details to get started with Car Calling.</p>
              </div>

              <div
                className="register-avatar-upload"
                onClick={() => document.getElementById('avatar-input').click()}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="avatar-preview" />
                ) : (
                  <Camera size={18} />
                )}
              </div>

              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />

            </div>

            {/* FORM */}
            <div className="register-input-group">
              <label>FULL NAME</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="register-input-group">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                required
              />
            </div>


            {/* ROLE SELECT */}
            <label className="register-role-label">SELECT YOUR ROLE</label>

            <div className="register-role-select">

              <button
                type="button"
                className={role === "user" ? "register-role active" : "register-role"}
                onClick={() => handleRoleChange("user")}
              >
                User
              </button>

              <button
                type="button"
                className={role === "landlord" ? "register-role active" : "register-role"}
                onClick={() => handleRoleChange("landlord")}
              >
                Landlord
              </button>

            </div>


            <div className="register-form-row">

              <div className="register-input-group">
                <label>PASSWORD</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="register-input-group">
                <label>CONFIRM PASSWORD</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                />
              </div>

            </div>


            {/* BUTTON */}
            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Register →"}
            </button>

          </form>


          <p className="register-login-link">

            Already have an account?
            <Link to="/login">
              Log In
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

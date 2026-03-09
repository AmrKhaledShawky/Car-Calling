import React, { useState } from "react";
import "./register.css";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
import { Link } from "react-router-dom";

export default function Register() {

  const [role, setRole] = useState("tenant");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "tenant"
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!formData.password) {
      toast.error("Please enter a password");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Prepare data for backend
    const submitData = new FormData();
    submitData.append("fullName", formData.fullName);
    submitData.append("phone", formData.phone);
    submitData.append("email", formData.email);
    submitData.append("password", formData.password);
    submitData.append("role", formData.role);
    if (avatar) {
      submitData.append("avatar", avatar);
    }

    // Log data for now (ready to be sent to backend)
    console.log("Form Data Ready to Submit:", {
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      avatar: avatar ? avatar.name : null
    });

    // TODO: Send to backend API
    // Example:
    // fetch('/api/register', {
    //   method: 'POST',
    //   body: submitData
    // })
    // .then(res => res.json())
    // .then(data => {
    //   // Handle response
    //   console.log(data);
    //   toast.success("Account created successfully! 🎉");
    // })
    // .catch(err => {
    //   console.error(err);
    //   toast.error("Registration failed. Please try again.");
    // });

    toast.success("Account created successfully! 🎉");
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
            <div className="register-form-row">

              <div className="register-input-group">
                <label>FULL NAME</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </div>

              <div className="register-input-group">
                <label>PHONE NUMBER</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

            </div>


            <div className="register-input-group">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
              />
            </div>


            {/* ROLE SELECT */}
            <label className="register-role-label">SELECT YOUR ROLE</label>

            <div className="register-role-select">

              <button
                type="button"
                className={role === "tenant" ? "register-role active" : "register-role"}
                onClick={() => handleRoleChange("tenant")}
              >
                Tenant
              </button>

              <button
                type="button"
                className={role === "landlord" ? "register-role active" : "register-role"}
                onClick={() => handleRoleChange("landlord")}
              >
                Landlord
              </button>

              <button
                type="button"
                className={role === "delivery" ? "register-role active" : "register-role"}
                onClick={() => handleRoleChange("delivery")}
              >
                Delivery
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
                />
              </div>

            </div>


            {/* BUTTON */}
            <button type="submit" className="register-btn">
              Register →
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
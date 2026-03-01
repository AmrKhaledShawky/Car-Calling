import { useState } from "react";
import { Mail, Lock, User, Phone, Globe, MapPin } from "lucide-react";
import carImage from "../../assets/RegCar.png";
import "../../Structure.css";

export default function Registration() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    country: "",
    city: "",
    password: "",
    confirmPassword: "",
    gender: "male",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="main-wrapper">

      {/* 🔥 TOP NAVIGATION */}
  <div className="top-nav">
  <div className="links">
    <span>About CarCalling</span>
    <span>Contact Us</span>
    <span>FAQ</span>
    </div>
    </div>
      {/* LEFT SIDE: form */}
      <div className="left-side">
        <h1>
          CarCalling <span>.....</span>
        </h1>

        <form className="form-grid">
          {/* Full Name */}
          <div className="field">
            <label>Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                type="text"
                name="fullName"
                placeholder="Full Name e.g (Jony Depp)"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div className="field">
            <label>Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="field">
            <label>Phone Number</label>
            <div className="input-wrapper">
              <Phone className="input-icon" />
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Country */}
          <div className="field">
            <label>Country</label>
            <div className="input-wrapper">
              <Globe className="input-icon" />
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* City */}
          <div className="field">
            <label>City</label>
            <div className="input-wrapper">
              <MapPin className="input-icon" />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div className="field">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="field full-width">
            <label>Confirm Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Gender */}
          <div className="gender-row full-width">
            <label>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === "male"}
                onChange={handleChange}
              />
              Male
            </label>

            <label>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === "female"}
                onChange={handleChange}
              />
              Female
            </label>
          </div>

          {/* Submit */}
          <button type="submit" className="submit-btn">
            Pick Up
          </button>

          {/* Already have account */}
          <div className="already">
            Already have an account? <a href="#">Sign in</a>
          </div>
        </form>
      </div>

      {/* RIGHT SIDE */}
      <div className="right-side half-circle-bg">
        <div className="circle-bg"></div>
        <img src={carImage} alt="Car" className="car-image" />
      </div>

    </div>
  );
}
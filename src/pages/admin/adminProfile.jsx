import React from "react";
import { Check, User } from "lucide-react"; 
import "./Adminprofile.css"; 

const UserProfile = () => {
  return (
    <div className="userprofile-page">
      
      {/* Main Container */}
      <div className="userprofile-container">
        
        {/* Header */}
        <div className="userprofile-header">
          <h2 className="userprofile-username">ِAdmin</h2>
          <button className="userprofile-save-btn">
            <Check className="userprofile-save-icon" />
            Save
          </button>
        </div>

        {/* Profile Section */}
        <div className="userprofile-profile">
          
          {/* Avatar */}
          <div className="userprofile-avatar">
            <User className="userprofile-avatar-icon" />
          </div>

          {/* Profile Info */}
          <div className="userprofile-info">
            <h3 className="userprofile-name">John Doe</h3>
            <a href="mailto:john.doe@example.com" className="userprofile-email">
              john.doe@example.com
            </a>
          </div>
        </div>

        {/* Form Section */}
        <div className="userprofile-form-section">
          <h3 className="userprofile-form-title">Account</h3>
          <hr className="userprofile-divider" />

          <form className="userprofile-form">
            
            {/* Username */}
            <label>Username</label>
            <input type="text" placeholder="Username" />

            {/* Email */}
            <label>Email <span>*</span></label>
            <input type="email" placeholder="Email" required />

            {/* Password */}
            <label>Password</label>
            <input type="password" placeholder="Password" />

            {/* Full Name */}
            <label>Full Name <span>*</span></label>
            <input type="text" placeholder="Full Name" required />

            {/* Title */}
            <label>Title</label>
            <input type="text" placeholder="Title" />

            {/* Language */}
            <label>Language</label>
            <select>
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </form>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
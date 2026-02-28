import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import toast from "react-hot-toast";
import "./profile.css";

export default function Profile() {
  const [formData, setFormData] = useState({
    name: "Black Goast",
    email: "H4cker@email.com",
    phone: "+20 123456789",
    company: "Car Calling Rentals"
  });

  const [photo, setPhoto] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    console.log("Profile Saved:", formData);

    toast.success("Profile updated successfully!");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setPhoto(imageURL);
      toast.success("Profile photo updated!");
    }
  };

  return (
    <DashboardLayout>
      <div className="profile-container">
        <h2>My Profile</h2>

        <div className="profile-card">
          {/* Avatar */}
          <div className="profile-avatar">
            {photo ? (
              <img src={photo} alt="Profile" className="avatar-image" />
            ) : (
              <div className="avatar-circle">
                {formData.name.charAt(0)}
              </div>
            )}

            <label className="change-photo-btn">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                hidden
              />
            </label>
          </div>

          {/* Form */}
          <div className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Company</label>
              <input
                name="company"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <button className="save-profile-btn" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
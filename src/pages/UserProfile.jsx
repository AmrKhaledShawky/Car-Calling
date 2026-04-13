import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { useAuth } from "../context/AuthContext";
import "./userPages.css";

export default function UserProfile() {
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    gender: user?.gender || "",
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
  });

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      gender: user?.gender || "",
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone || undefined,
        gender: formData.gender || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
      });

      toast.success("Profile updated successfully.");
    } catch (saveError) {
      toast.error(saveError.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="user-page-shell">
      <Navbar />
      <main className="user-page-container">
        <div className="user-page-header">
          <h1>My Profile</h1>
          <p>Update your personal details and keep your rental account current.</p>
        </div>

        <form className="profile-card-form" onSubmit={handleSave}>
          <label>
            <span>Full Name</span>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>

          <label>
            <span>Email</span>
            <input value={user?.email || ""} disabled />
          </label>

          <label>
            <span>Phone</span>
            <input name="phone" value={formData.phone} onChange={handleChange} />
          </label>

          <label>
            <span>Gender</span>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label>
            <span>Date of Birth</span>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
          </label>

          <button type="submit" className="user-primary-button" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}

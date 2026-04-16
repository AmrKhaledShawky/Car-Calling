import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import "./profile.css";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    city: "",
    state: ""
  });

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      businessName: user?.businessName || "",
      city: user?.address?.city || "",
      state: user?.address?.state || ""
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        businessName: formData.businessName.trim() || undefined,
        address: {
          city: formData.city.trim(),
          state: formData.state.trim()
        }
      });
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to update landlord profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="profile-container">
        <h2>My Profile</h2>

        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {formData.name?.charAt(0)?.toUpperCase() || "L"}
            </div>
          </div>

          <form className="profile-form" onSubmit={handleSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input name="email" value={formData.email} disabled />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Business Name</label>
              <input name="businessName" value={formData.businessName} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>City</label>
              <input name="city" value={formData.city} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>State</label>
              <input name="state" value={formData.state} onChange={handleChange} />
            </div>

            <button className="save-profile-btn" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

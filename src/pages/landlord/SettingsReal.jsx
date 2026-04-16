import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import toast from "react-hot-toast";
import { apiCall } from "../../utils/api";
import "./settings.css";

export default function SettingsReal() {
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPassword((current) => ({
      ...current,
      [name]: value
    }));
  };

  const updatePassword = async () => {
    if (!password.currentPassword || !password.newPassword || !password.confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      await apiCall("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: password.currentPassword,
          newPassword: password.newPassword
        })
      });

      toast.success("Password updated successfully.");
      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      toast.error(error.message || "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="settings-container">
        <h2>Account Settings</h2>

        <div className="settings-card">
          <h3>Change Password</h3>

          <div className="settings-grid">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={password.currentPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={password.newPassword}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={password.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
          </div>

          <button className="save-btn" onClick={updatePassword} disabled={saving}>
            {saving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

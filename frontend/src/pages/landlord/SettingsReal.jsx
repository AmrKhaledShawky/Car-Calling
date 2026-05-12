import { useEffect, useState } from "react";
import { AlertTriangle, KeyRound, LoaderCircle, ShieldOff, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../utils/api";
import "./settings.css";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

const createPasswordState = () => ({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});

export default function SettingsReal() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();
  const [password, setPassword] = useState(createPasswordState());
  const [savingPassword, setSavingPassword] = useState(false);
  const [accountDialog, setAccountDialog] = useState(null);
  const [accountPassword, setAccountPassword] = useState("");
  const [processingAccountAction, setProcessingAccountAction] = useState(false);

  useEffect(() => {
    if (!accountDialog) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !processingAccountAction) {
        setAccountDialog(null);
        setAccountPassword("");
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountDialog, processingAccountAction]);

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPassword((current) => ({
      ...current,
      [name]: value
    }));
  };

  const updatePassword = async (event) => {
    event.preventDefault();

    if (!password.currentPassword || !password.newPassword || !password.confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (password.newPassword !== password.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    if (password.currentPassword === password.newPassword) {
      toast.error("New password must be different from the current password.");
      return;
    }

    if (!PASSWORD_RULE.test(password.newPassword)) {
      toast.error("New password must be at least 6 characters and include uppercase, lowercase, and a number.");
      return;
    }

    try {
      setSavingPassword(true);
      const response = await apiCall("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: password.currentPassword,
          newPassword: password.newPassword
        })
      });

      toast.success(response.message || "Password updated successfully.");
      setPassword(createPasswordState());
    } catch (error) {
      toast.error(error.message || "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const closeAccountDialog = () => {
    if (processingAccountAction) {
      return;
    }

    setAccountDialog(null);
    setAccountPassword("");
  };

  const handleAccountAction = async () => {
    if (!accountDialog) {
      return;
    }

    if (!accountPassword) {
      toast.error("Please enter your current password to continue.");
      return;
    }

    try {
      setProcessingAccountAction(true);

      const response = await apiCall(
        accountDialog === "delete" ? "/auth/account" : "/auth/account/deactivate",
        {
          method: accountDialog === "delete" ? "DELETE" : "PUT",
          body: JSON.stringify({ currentPassword: accountPassword })
        }
      );

      clearSession();
      toast.success(response.message || (accountDialog === "delete" ? "Account deleted." : "Account deactivated."));
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Failed to update your account.");
    } finally {
      setProcessingAccountAction(false);
    }
  };

  const isDeleteAction = accountDialog === "delete";

  return (
    <DashboardLayout>
      <div className="landlord-settings-page">
        <div className="landlord-settings-header">
          <div>
            <h2>Account Settings</h2>
            <p>Keep your password current and control what happens to your landlord account.</p>
          </div>
        </div>

        <div className="landlord-settings-summary-card">
          <div className="landlord-settings-summary-icon">
            <KeyRound size={20} />
          </div>
          <div className="landlord-settings-summary-copy">
            <strong>{user?.name || "Landlord Account"}</strong>
            <span>{user?.email || "No email address available"}</span>
          </div>
          <div className="landlord-settings-summary-badge">
            {(user?.role || "landlord").toUpperCase()}
          </div>
        </div>

        <section className="landlord-settings-card">
          <div className="landlord-settings-card-header">
            <div>
              <h3>Change Password</h3>
              <p>Use a password with at least 6 characters, including uppercase, lowercase, and a number.</p>
            </div>
          </div>

          <form className="landlord-settings-form" onSubmit={updatePassword}>
            <label className="landlord-settings-field">
              <span>Current Password</span>
              <input
                type="password"
                name="currentPassword"
                value={password.currentPassword}
                onChange={handlePasswordChange}
                autoComplete="current-password"
              />
            </label>

            <label className="landlord-settings-field">
              <span>New Password</span>
              <input
                type="password"
                name="newPassword"
                value={password.newPassword}
                onChange={handlePasswordChange}
                autoComplete="new-password"
              />
            </label>

            <label className="landlord-settings-field">
              <span>Confirm New Password</span>
              <input
                type="password"
                name="confirmPassword"
                value={password.confirmPassword}
                onChange={handlePasswordChange}
                autoComplete="new-password"
              />
            </label>

            <div className="landlord-settings-actions">
              <button type="submit" className="landlord-settings-primary-btn" disabled={savingPassword}>
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </section>

        <section className="landlord-settings-card landlord-settings-danger-card">
          <div className="landlord-settings-card-header">
            <div>
              <h3>Danger Zone</h3>
              <p>Deactivate your account to step away for now, or permanently delete it when you no longer need it.</p>
            </div>
          </div>

          <div className="landlord-settings-danger-grid">
            <article className="landlord-settings-danger-item">
              <div className="landlord-settings-danger-copy">
                <div className="landlord-settings-danger-icon warning">
                  <ShieldOff size={18} />
                </div>
                <div>
                  <strong>Deactivate Account</strong>
                  <p>Your profile and cars stay in the system, but you will be signed out and blocked from logging in.</p>
                </div>
              </div>
              <button
                type="button"
                className="landlord-settings-warning-btn"
                onClick={() => setAccountDialog("deactivate")}
              >
                Deactivate
              </button>
            </article>

            <article className="landlord-settings-danger-item">
              <div className="landlord-settings-danger-copy">
                <div className="landlord-settings-danger-icon danger">
                  <Trash2 size={18} />
                </div>
                <div>
                  <strong>Delete Account</strong>
                  <p>This permanently removes your account and related landlord data when no active booking work is blocking deletion.</p>
                </div>
              </div>
              <button
                type="button"
                className="landlord-settings-danger-btn"
                onClick={() => setAccountDialog("delete")}
              >
                Delete
              </button>
            </article>
          </div>
        </section>

        {accountDialog ? (
          <div className="landlord-settings-dialog-backdrop" onClick={closeAccountDialog}>
            <div
              className="landlord-settings-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="account-action-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="landlord-settings-dialog-close"
                onClick={closeAccountDialog}
                disabled={processingAccountAction}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>

              <div className={`landlord-settings-dialog-icon ${isDeleteAction ? "danger" : "warning"}`}>
                {isDeleteAction ? <Trash2 size={22} /> : <AlertTriangle size={22} />}
              </div>

              <div className="landlord-settings-dialog-copy">
                <p className="landlord-settings-dialog-kicker">Confirm action</p>
                <h3 id="account-action-title">
                  {isDeleteAction ? "Delete your account?" : "Deactivate your account?"}
                </h3>
                <p>
                  {isDeleteAction
                    ? "Deleting your account is permanent. If you still have pending, confirmed, or active bookings, the request will be blocked."
                    : "Deactivating signs you out immediately and prevents future logins until an admin reactivates the account."}
                </p>
              </div>

              <label className="landlord-settings-dialog-field">
                <span>Current Password</span>
                <input
                  type="password"
                  value={accountPassword}
                  onChange={(event) => setAccountPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </label>

              <div className="landlord-settings-actions">
                <button
                  type="button"
                  className="landlord-settings-secondary-btn"
                  onClick={closeAccountDialog}
                  disabled={processingAccountAction}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={isDeleteAction ? "landlord-settings-danger-btn" : "landlord-settings-warning-btn"}
                  onClick={handleAccountAction}
                  disabled={processingAccountAction}
                >
                  {processingAccountAction ? (
                    <>
                      <LoaderCircle size={16} className="landlord-settings-spin" />
                      Working...
                    </>
                  ) : isDeleteAction ? (
                    "Delete account"
                  ) : (
                    "Deactivate account"
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

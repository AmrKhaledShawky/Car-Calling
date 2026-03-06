import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import toast from "react-hot-toast";
import "./settings.css";

export default function Settings() {

  const [password, setPassword] = useState({
    current: "",
    newPass: "",
    confirm: ""
  });

  const [wallet, setWallet] = useState({
    provider: "",
    account: ""
  });

  const handlePasswordChange = (e) => {
    setPassword({
      ...password,
      [e.target.name]: e.target.value
    });
  };

  const handleWalletChange = (e) => {
    setWallet({
      ...wallet,
      [e.target.name]: e.target.value
    });
  };

  const updatePassword = () => {

    if (password.newPass !== password.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    toast.success("Password updated successfully 🔐");

    setPassword({
      current: "",
      newPass: "",
      confirm: ""
    });
  };

  const saveWallet = () => {

    if (!wallet.provider || !wallet.account) {
      toast.error("Please enter wallet details");
      return;
    }

    toast.success("Wallet added successfully 💳");
  };

  const deactivateAccount = () => {
    toast("Account deactivated");
  };

  const deleteAccount = () => {
    toast.error("Account deleted");
  };

  return (
    <DashboardLayout>

      <div className="settings-container">

        <h2>Account Settings</h2>

        {/* CHANGE PASSWORD */}

        <div className="settings-card">

          <h3>Change Password</h3>

          <div className="settings-grid">

            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="current"
                value={password.current}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPass"
                value={password.newPass}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirm"
                value={password.confirm}
                onChange={handlePasswordChange}
              />
            </div>

          </div>

          <button className="save-btn" onClick={updatePassword}>
            Update Password
          </button>

        </div>


        {/* PAYMENT WALLET */}

        <div className="settings-card">

          <h3>Payment Wallet</h3>

          <div className="settings-grid">

            <div className="form-group">
              <label>Wallet Provider</label>

              <select
                name="provider"
                value={wallet.provider}
                onChange={handleWalletChange}
              >
                <option value="">Select Wallet</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
                <option value="bank">Bank Account</option>
              </select>

            </div>

            <div className="form-group">
              <label>Account Email / IBAN</label>
              <input
                name="account"
                value={wallet.account}
                onChange={handleWalletChange}
                placeholder="Enter wallet account"
              />
            </div>

          </div>

          <button className="save-btn" onClick={saveWallet}>
            Save Wallet
          </button>

        </div>


        {/* ACCOUNT ACTIONS */}

        <div className="settings-card danger-zone">

          <h3>Danger Zone</h3>

          <p>You can deactivate or permanently delete your account.</p>

          <div className="danger-buttons">

            <button
              className="deactivate-btn"
              onClick={deactivateAccount}
            >
              Deactivate Account
            </button>

            <button
              className="delete-btn"
              onClick={deleteAccount}
            >
              Delete Account
            </button>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}
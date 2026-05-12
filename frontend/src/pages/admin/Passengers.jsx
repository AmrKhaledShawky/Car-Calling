import React, { useCallback, useEffect, useState } from "react";
import {
  LoaderCircle,
  Pencil,
  Plus,
  ShieldCheck,
  ShieldX,
  Trash2,
  UserCheck,
  UserCog,
  Users,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../utils/api";
import { toast } from "react-toastify";
import "./Passengers.css";

const formatRole = (role) => {
  if (!role) return "User";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const getUserId = (user) => user?._id || user?.id;
const isUserActive = (user) => user?.isActive !== false;

const Passengers = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdatingId, setStatusUpdatingId] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [dialogSubmitting, setDialogSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiCall("/admin/users");
      setUsers(response.data || []);
    } catch (loadError) {
      const errorMsg = loadError.message || "Failed to load users.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (!confirmDialog) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !dialogSubmitting) {
        setConfirmDialog(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [confirmDialog, dialogSubmitting]);

  const closeConfirmDialog = () => {
    if (dialogSubmitting) {
      return;
    }

    setConfirmDialog(null);
  };

  const deleteUser = async (id) => {
    if (!id) {
      toast.error("User id is missing.");
      return;
    }

    try {
      await apiCall(`/admin/users/${id}`, { method: "DELETE" });
      toast.success("User deleted successfully!");
      setUsers((currentUsers) => currentUsers.filter((user) => getUserId(user) !== id));
    } catch (deleteError) {
      toast.error("Failed to delete user: " + deleteError.message);
    }
  };

  const toggleUserStatus = async (user) => {
    const id = getUserId(user);
    const nextIsActive = !isUserActive(user);
    const action = nextIsActive ? "activate" : "deactivate";

    if (!id) {
      toast.error("User id is missing.");
      return;
    }

    try {
      setStatusUpdatingId(id);
      const response = await apiCall(`/admin/users/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ isActive: nextIsActive })
      });

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          getUserId(currentUser) === id
            ? {
                ...currentUser,
                ...(response.data || {}),
                isActive: response.data?.isActive ?? nextIsActive
              }
            : currentUser
        )
      );

      toast.success(`User ${nextIsActive ? "activated" : "deactivated"} successfully!`);
    } catch (statusError) {
      toast.error(`Failed to ${action} user: ${statusError.message}`);
    } finally {
      setStatusUpdatingId("");
    }
  };

  const handleEdit = (id) => {
    if (!id) {
      toast.error("User id is missing.");
      return;
    }

    navigate(`/editpassenger/${id}`);
  };

  const handleAddUser = () => {
    navigate("/addpassenger");
  };

  const openDeleteDialog = (user) => {
    const id = getUserId(user);

    if (!id) {
      toast.error("User id is missing.");
      return;
    }

    setConfirmDialog({
      type: "delete",
      user
    });
  };

  const openStatusDialog = (user) => {
    const id = getUserId(user);

    if (!id) {
      toast.error("User id is missing.");
      return;
    }

    setConfirmDialog({
      type: "status",
      user
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog?.user) {
      return;
    }

    const id = getUserId(confirmDialog.user);

    try {
      setDialogSubmitting(true);

      if (confirmDialog.type === "delete") {
        await deleteUser(id);
      } else {
        await toggleUserStatus(confirmDialog.user);
      }

      setConfirmDialog(null);
    } finally {
      setDialogSubmitting(false);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => isUserActive(user)).length;
  const adminUsers = users.filter((user) => user.role === "admin").length;
  const landlordUsers = users.filter((user) => user.role === "landlord").length;
  const selectedUser = confirmDialog?.user || null;
  const nextIsActive = selectedUser ? !isUserActive(selectedUser) : false;
  const dialogIcon =
    confirmDialog?.type === "delete"
      ? Trash2
      : nextIsActive
        ? ShieldCheck
        : ShieldX;
  const dialogTitle =
    confirmDialog?.type === "delete"
      ? `Delete ${selectedUser?.name || "this user"}?`
      : `${nextIsActive ? "Activate" : "Deactivate"} ${selectedUser?.name || "this user"}?`;
  const dialogDescription =
    confirmDialog?.type === "delete"
      ? "This removes the account from the users list. Make sure this person no longer needs access before continuing."
      : nextIsActive
        ? "This will restore access immediately so the user can sign in and use the platform again."
        : "This will block sign-in for this account until you activate it again from the admin panel.";
  const dialogConfirmLabel =
    confirmDialog?.type === "delete"
      ? "Delete user"
      : nextIsActive
        ? "Activate user"
        : "Deactivate user";
  const dialogTone =
    confirmDialog?.type === "delete"
      ? "danger"
      : nextIsActive
        ? "success"
        : "warning";
  const DialogIcon = dialogIcon;

  return (
    <AdminLayout>
      <div className="passenger-content">
        <div className="passenger-header">
          <div className="passenger-header-copy">
            <h2>Users</h2>
            <p>Manage accounts, access status, and profile details without losing the page layout on wide tables.</p>
          </div>
          <button className="passenger-add-btn" onClick={handleAddUser}>
            <Plus size={18} />
            Add User
          </button>
        </div>

        {!loading && !error ? (
          <div className="passenger-metrics" aria-label="Users summary">
            <article className="passenger-metric-card">
              <div className="passenger-metric-icon">
                <Users size={18} />
              </div>
              <div>
                <span>Total users</span>
                <strong>{totalUsers}</strong>
              </div>
            </article>
            <article className="passenger-metric-card">
              <div className="passenger-metric-icon success">
                <UserCheck size={18} />
              </div>
              <div>
                <span>Active accounts</span>
                <strong>{activeUsers}</strong>
              </div>
            </article>
            <article className="passenger-metric-card">
              <div className="passenger-metric-icon alert">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span>Admins</span>
                <strong>{adminUsers}</strong>
              </div>
            </article>
            <article className="passenger-metric-card">
              <div className="passenger-metric-icon info">
                <UserCog size={18} />
              </div>
              <div>
                <span>Landlords</span>
                <strong>{landlordUsers}</strong>
              </div>
            </article>
          </div>
        ) : null}

        {loading && <div className="passenger-loading">Loading users...</div>}
        {error && <div className="passenger-error">{error}</div>}

        {!loading && !error && (
          <div className="passenger-table-card">
            <div className="passenger-table-scroll">
              <table className="passenger-table">
                <thead>
                  <tr>
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Usage</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const id = getUserId(user);
                    const active = isUserActive(user);
                    const isUpdating = statusUpdatingId === id;
                    const isCurrentUser = id === (currentUser?._id || currentUser?.id);

                    return (
                      <tr key={id}>
                        <td>
                          {user.profile || user.avatar ? (
                            <img
                              src={user.profile || user.avatar}
                              alt={user.name}
                              className="profile-pic"
                            />
                          ) : (
                            <div className="profile-pic-placeholder">
                              {user.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          )}
                        </td>
                        <td>{user.name}</td>
                        <td>
                          <span className={`role-badge ${user.role || "user"}`}>
                            {formatRole(user.role)}
                          </span>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.phone || "N/A"}</td>
                        <td>
                          <div className="usage-cell">
                            <span>{user.bookingCount || user.trips || 0} bookings</span>
                            <span>{user.carCount || 0} cars</span>
                          </div>
                        </td>
                        <td>
                          <span className={`user-status ${active ? "active" : "inactive"}`}>
                            {active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="passenger-actions">
                          <button
                            className="passenger-action-btn edit"
                            title="Edit user details"
                            aria-label={`Edit ${user.name || "user"}`}
                            onClick={() => handleEdit(id)}
                          >
                            <Pencil size={16} />
                            <span>Edit</span>
                          </button>
                          <button
                            className={`passenger-action-btn ${active ? "deactivate" : "activate"}`}
                            title={
                              isCurrentUser
                                ? "You cannot change your own status"
                                : active
                                  ? "Deactivate this account"
                                  : "Activate this account"
                            }
                            aria-label={active ? `Deactivate ${user.name || "user"}` : `Activate ${user.name || "user"}`}
                            onClick={() => openStatusDialog(user)}
                            disabled={isUpdating || isCurrentUser}
                          >
                            {isUpdating ? <LoaderCircle size={16} className="passenger-spin" /> : active ? <ShieldX size={16} /> : <ShieldCheck size={16} />}
                            <span>{isUpdating ? "Saving" : active ? "Deactivate" : "Activate"}</span>
                          </button>
                          <button
                            className="passenger-action-btn delete"
                            title={isCurrentUser ? "You cannot delete your own account" : "Delete this account"}
                            aria-label={`Delete ${user.name || "user"}`}
                            onClick={() => openDeleteDialog(user)}
                            disabled={isCurrentUser}
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && !loading && (
                    <tr>
                      <td colSpan={8} className="passenger-no-data">
                        No users found. <button className="passenger-add-inline" onClick={handleAddUser}>Add first user</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {confirmDialog && selectedUser ? (
          <div className="passenger-dialog-backdrop" role="presentation" onClick={closeConfirmDialog}>
            <div
              className="passenger-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="passenger-dialog-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="passenger-dialog-close"
                onClick={closeConfirmDialog}
                aria-label="Close confirmation dialog"
                disabled={dialogSubmitting}
              >
                <X size={18} />
              </button>

              <div className={`passenger-dialog-icon ${dialogTone}`}>
                <DialogIcon size={22} />
              </div>

              <div className="passenger-dialog-copy">
                <p className="passenger-dialog-kicker">Confirm action</p>
                <h3 id="passenger-dialog-title">{dialogTitle}</h3>
                <p>{dialogDescription}</p>
              </div>

              <div className="passenger-dialog-user">
                {selectedUser.profile || selectedUser.avatar ? (
                  <img
                    src={selectedUser.profile || selectedUser.avatar}
                    alt={selectedUser.name}
                    className="passenger-dialog-avatar"
                  />
                ) : (
                  <div className="passenger-dialog-avatar">
                    {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="passenger-dialog-user-copy">
                  <strong>{selectedUser.name || "Unnamed user"}</strong>
                  <span>{selectedUser.email || "No email provided"}</span>
                </div>
                <div className="passenger-dialog-badges">
                  <span className={`role-badge ${selectedUser.role || "user"}`}>{formatRole(selectedUser.role)}</span>
                  <span className={`user-status ${isUserActive(selectedUser) ? "active" : "inactive"}`}>
                    {isUserActive(selectedUser) ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="passenger-dialog-actions">
                <button
                  type="button"
                  className="passenger-dialog-btn secondary"
                  onClick={closeConfirmDialog}
                  disabled={dialogSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`passenger-dialog-btn ${dialogTone}`}
                  onClick={handleConfirmAction}
                  disabled={dialogSubmitting}
                >
                  {dialogSubmitting ? "Working..." : dialogConfirmLabel}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default Passengers;

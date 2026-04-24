import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "./deletePassenger.css"; 

const DeletePassenger = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [passenger, setPassenger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPassenger = async () => {
      try {
        const response = await apiCall(`/admin/passengers/${id}`);
        setPassenger(response.data);
      } catch (error) {
        toast.error("Failed to load passenger data");
      } finally {
        setLoading(false);
      }
    };
    fetchPassenger();
  }, [id]);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await apiCall(`/admin/passengers/${id}`, { method: "DELETE" });
      toast.success("Passenger deleted successfully! 🗑️");
      setTimeout(() => {
        navigate("/admin/passengers");
      }, 1500);
    } catch (error) {
      toast.error("Failed to delete passenger: " + (error.message || "Unknown error"));
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/passengers");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="delete-passenger-container">
          <div className="loading">Loading...</div>
        </div>
      </AdminLayout>
    );
  }


  return (
    <AdminLayout>
      <div className="delete-passenger-container">
        <ToastContainer position="top-right" autoClose={3000} />
        {passenger ? (
          <>
            <h2>Delete Passenger</h2>
            <div className="delete-passenger-card">
              <div className="passenger-info">
                <strong>{passenger.name}</strong>
                <span>{passenger.email}</span>
                {passenger.phone && <span>{passenger.phone}</span>}
              </div>
              <p className="delete-warning">
                <i className="fa-solid fa-triangle-exclamation"></i>
                Are you sure you want to delete this passenger? This action cannot be undone.
              </p>
              <div className="delete-form-actions">
                <button 
                  type="button" 
                  onClick={handleConfirm} 
                  className="confirm-btn"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Confirm Delete"}
                </button>
                <button 
                  type="button" 
                  onClick={handleCancel} 
                  className="cancel-btn"
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="error">Passenger not found</div>
        )}
      </div>

    </AdminLayout>
  );
};

export default DeletePassenger;

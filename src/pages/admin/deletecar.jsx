import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./deletecar.css";

const DeleteCar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const response = await apiCall(`/cars/${id}`);
        setCar(response.data);
      } catch (error) {
        toast.error("Failed to load car: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await apiCall(`/admin/cars/${id}`, { method: "DELETE" });
      toast.success("Car deleted successfully!");
      setTimeout(() => {
        navigate("/admin/cars");
      }, 1500);
    } catch (error) {
      toast.error("Failed to delete car: " + error.message);
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/cars");
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="delete-car-container">
          <div className="loading">Loading car data...</div>
        </div>
      </AdminLayout>
    );
  }

  const carName = car ? `${car.year} ${car.make} ${car.model}` : `Car #${id}`;

  return (
    <AdminLayout>
      <div className="delete-car-container">
        <ToastContainer position="top-center" autoClose={2000} />
        <h2>Delete Car</h2>
        <div className="delete-car-form">
          <p>Are you sure you want to delete <strong>{carName}</strong>?</p>
          {car && (
            <div className="car-info">
              <p><strong>License Plate:</strong> {car.licensePlate || "N/A"}</p>
              <p><strong>Owner:</strong> {car.owner?.name || "Unknown"}</p>
              <p><strong>Status:</strong> {car.status}</p>
            </div>
          )}
          <p className="warning-text">This action cannot be undone.</p>

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
      </div>
    </AdminLayout>
  );
};

export default DeleteCar;

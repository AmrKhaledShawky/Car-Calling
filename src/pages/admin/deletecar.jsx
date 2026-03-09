import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./deletecar.css"; // ممكن تستخدم نفس CSS أو تعمل deleteCar.css

const DeleteCar = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleConfirm = () => {
    toast.success(`Car ${id} deleted successfully 🗑️`);

    setTimeout(() => {
      navigate("/admin/carowner");
    }, 2000);
  };

  const handleCancel = () => {
    navigate("/admin/carowner");
  };

  return (
    <div className="delete-car-container">
      <ToastContainer position="top-center" autoClose={2000} />
      <h2>Delete Car</h2>
      <form className="delete-car-form">
        <p>Are you sure you want to delete this car?</p>

        <div className="delete-form-actions">
          <button type="button" onClick={handleConfirm} className="confirm-btn">
            Confirm Delete
          </button>
          <button type="button" onClick={handleCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeleteCar;
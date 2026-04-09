import React from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./deletePassenger.css"; 

const DeletePassenger = () => {
  const { id } = useParams();
  const navigate = useNavigate();

 const handleConfirm = () => {
    toast.success(`Passenger ${id} deleted successfully 🗑️`);

    setTimeout(() => {
      navigate("/admin/passengers");
    }, 2000);
  };

  const handleCancel = () => {
    navigate("/admin/passengers");
  };

  return (
    <AdminLayout>
      <div className="delete-passenger-container">
       <ToastContainer position="top-center" autoClose={2000} />
      <h2>Delete Passenger</h2>
      <form className="delete-passenger-form">
        <p>Are you sure you want to delete this passenger?</p>

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
    </AdminLayout>
  );
};

export default DeletePassenger;
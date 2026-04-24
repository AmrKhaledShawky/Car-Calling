import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Passengers.css";

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "No trips yet");

const Passengers = () => {
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPassengers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiCall("/admin/passengers");
      setPassengers(response.data || []);
    } catch (loadError) {
      const errorMsg = loadError.message || "Failed to load passengers.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPassengers();
  }, [fetchPassengers]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await apiCall(`/admin/passengers/${id}`, { method: "DELETE" });
        toast.success("Passenger deleted successfully!");
        fetchPassengers();
      } catch (error) {
        toast.error("Failed to delete passenger: " + error.message);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/editpassenger/${id}`);
  };

  const handleAddPassenger = () => {
    navigate("/addpassenger");
  };

  return (
    <AdminLayout>
      <div className="passenger-content">
        <ToastContainer position="top-right" autoClose={3000} />
        
        <div className="passenger-header">
          <h2>Passengers</h2>
          <button className="add-btn" onClick={handleAddPassenger}>
            <i className="fa-solid fa-plus"></i>
            Add Passenger
          </button>
        </div>

        {loading && <div className="loading">Loading passengers...</div>}
        {error && <div className="error">{error}</div>}
        
        {!loading && !error && (
          <div className="table-container">
            <table className="passenger-table">
              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Trips</th>
                  <th>Last Trip</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((passenger) => (
                  <tr key={passenger._id || passenger.id}>
                    <td>
                      {passenger.profile || passenger.avatar ? (
                        <img 
                          src={passenger.profile || passenger.avatar} 
                          alt={passenger.name} 
                          className="profile-pic" 
                        />
                      ) : (
                        <div className="profile-pic-placeholder">
                          {passenger.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                    </td>
                    <td>{passenger.name}</td>
                    <td>{passenger.email}</td>
                    <td>{passenger.phone || "N/A"}</td>
                    <td>{passenger.trips || passenger.bookingCount || 0}</td>
                    <td>{formatDate(passenger.lastTrip || passenger.lastBookingDate)}</td>
                    <td className="actions">
                      <button 
                        className="action-icon edit"
                        title="Edit passenger"
                        onClick={() => handleEdit(passenger._id || passenger.id)}
                      >
                        <i className="fa-solid fa-edit"></i>
                        <span>Edit</span>
                      </button>
                      <button 
                        className="action-icon delete"
                        title="Delete passenger"
                        onClick={() => handleDelete(passenger._id || passenger.id, passenger.name)}
                      >
                        <i className="fa-solid fa-trash"></i>
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {passengers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="no-data">
                      No passengers found. <button className="add-btn-inline" onClick={handleAddPassenger}>Add first passenger</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default Passengers;

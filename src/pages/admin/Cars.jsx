import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Cars.css";

const Cars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiCall("/admin/cars");
      setCars(response.data || []);
    } catch (loadError) {
      const errorMsg = loadError.message || "Failed to load cars.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleDelete = async (id, carName) => {
    if (window.confirm(`Are you sure you want to delete ${carName}?`)) {
      try {
        await apiCall(`/admin/cars/${id}`, { method: "DELETE" });
        toast.success("Car deleted successfully!");
        fetchCars();
      } catch (error) {
        toast.error("Failed to delete car: " + error.message);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/editcar/${id}`);
  };

  const handleAddCar = () => {
    navigate("/addcar");
  };

  const getCarName = (car) => {
    return `${car.year || ''} ${car.make || ''} ${car.model || ''}`.trim() || 'Unknown Car';
  };

  return (
    <AdminLayout>
      <div className="cars-content">
        <ToastContainer position="top-right" autoClose={3000} />
        
        <div className="cars-header">
          <h2>Cars Management</h2>
          <button className="add-btn" onClick={handleAddCar}>
            <i className="fa-solid fa-plus"></i>
            Add Car
          </button>
        </div>

        {loading && <div className="loading">Loading cars...</div>}
        {error && <div className="error">{error}</div>}
        
        {!loading && !error && (
          <div className="table-container">
            <table className="cars-table">
              <thead>
                <tr>
                  <th>Car Name</th>
                  <th>Model</th>
                  <th>Plate Number</th>
                  <th>Belongs To</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((car) => (
                  <tr key={car._id || car.id}>
                    <td>{getCarName(car)}</td>
                    <td>{car.model || "N/A"}</td>
                    <td>{car.licensePlate || "N/A"}</td>
                    <td>
                      <div className="owner-cell">
                        {car.owner?.avatar ? (
                          <img 
                            src={car.owner.avatar} 
                            alt={car.owner.name} 
                            className="owner-avatar" 
                          />
                        ) : (
                          <div className="owner-avatar-placeholder">
                            {car.owner?.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}
                        <span className="owner-name">{car.owner?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${car.status || 'unknown'}`}>
                        {car.status || "Unknown"}
                      </span>
                    </td>
                    <td className="actions">
                      <button 
                        className="action-icon edit"
                        title="Edit car"
                        onClick={() => handleEdit(car._id || car.id)}
                      >
                        <i className="fa-solid fa-edit"></i>
                        <span>Edit</span>
                      </button>
                      <button 
                        className="action-icon delete"
                        title="Delete car"
                        onClick={() => handleDelete(car._id || car.id, getCarName(car))}
                      >
                        <i className="fa-solid fa-trash"></i>
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {cars.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="no-data">
                      No cars found. <button className="add-btn-inline" onClick={handleAddCar}>Add first car</button>
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

export default Cars;

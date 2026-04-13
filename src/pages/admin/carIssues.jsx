import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";
import "./carIssues.css";
import { FaEye } from "react-icons/fa";

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "N/A");

const CarIssues = () => {
  const [selectedCar, setSelectedCar] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCars = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiCall("/admin/cars");
        setCars(response.data || []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load car issues.");
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, []);

  const issueCars = useMemo(
    () =>
      cars.filter((car) => car.status !== "available" || (car.notes && car.notes.trim()) || car.condition === "poor" || car.condition === "fair"),
    [cars]
  );

  return (
    <AdminLayout>
      <div className="car-issues-container">
        {loading ? <p>Loading car issues...</p> : null}
        {error ? <p>{error}</p> : null}
        {!loading && !error ? (
          <table className="issues-table">
            <thead>
              <tr>
                <th>Owner</th>
                <th>Phone</th>
                <th>Car Model</th>
                <th>Car Number</th>
                <th>Year</th>
                <th>Status</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {issueCars.map((car) => (
                <tr key={car._id}>
                  <td>{car.owner?.name || "Unknown owner"}</td>
                  <td>{car.owner?.phone || "N/A"}</td>
                  <td>{`${car.make} ${car.model}`}</td>
                  <td>{car.licensePlate || "No plate"}</td>
                  <td>{car.year}</td>
                  <td>{car.status}</td>
                  <td className="action-buttons">
                    <button className="view-btn" onClick={() => setSelectedCar(car)} title="View Details">
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
              {issueCars.length === 0 ? (
                <tr>
                  <td colSpan={7}>No live car issues found in the database.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        ) : null}

        {selectedCar ? (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Car Status Details</h3>
              <div className="owner-info">
                <p><b>Owner:</b> {selectedCar.owner?.name || "Unknown owner"}</p>
                <p><b>Email:</b> {selectedCar.owner?.email || "N/A"}</p>
                <p><b>Phone:</b> {selectedCar.owner?.phone || "N/A"}</p>
                <p><b>Car Number:</b> {selectedCar.licensePlate || "No plate"}</p>
                <p><b>Color:</b> {selectedCar.color || "Unknown"}</p>
                <p><b>Condition:</b> {selectedCar.condition || "Unknown"}</p>
                <p><b>Status:</b> {selectedCar.status}</p>
                <p><b>Created:</b> {formatDate(selectedCar.createdAt)}</p>
                <p><b>Notes:</b> {selectedCar.notes || "No notes recorded."}</p>
              </div>
              <button className="close-btn" onClick={() => setSelectedCar(null)}>Close</button>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default CarIssues;

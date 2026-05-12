import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";
import "./Carowner.css";

const CarOwner = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOwners = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiCall("/admin/users?role=landlord");
        setOwners(response.data || []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load car owners.");
      } finally {
        setLoading(false);
      }
    };

    loadOwners();
  }, []);

  return (
    <AdminLayout>
      <div className="carowner-content">
        {loading ? <p>Loading car owners...</p> : null}
        {error ? <p>{error}</p> : null}
        {!loading && !error ? (
          <table className="carowner-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Cars Owned</th>
                <th>Last Car</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr key={owner._id}>
                  <td>{owner.name}</td>
                  <td>{owner.email}</td>
                  <td>{owner.phone || "N/A"}</td>
                  <td>{owner.carCount || 0}</td>
                  <td>{owner.lastCar ? `${owner.lastCar.model} (${owner.lastCar.year})` : "No cars yet"}</td>
                  <td className={`status ${owner.isActive ? "active" : "inactive"}`}>
                    {owner.isActive ? "Active" : "Inactive"}
                  </td>
                </tr>
              ))}
              {owners.length === 0 ? (
                <tr>
                  <td colSpan={6}>No car owners found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default CarOwner;

import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";
import "./Passengers.css";

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "No trips yet");

const Passengers = () => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPassengers = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiCall("/admin/users?role=user");
        setPassengers(response.data || []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load passengers.");
      } finally {
        setLoading(false);
      }
    };

    loadPassengers();
  }, []);

  return (
    <AdminLayout>
      <div className="passenger-content">
        {loading ? <p>Loading passengers...</p> : null}
        {error ? <p>{error}</p> : null}
        {!loading && !error ? (
          <table className="passenger-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Trips</th>
                <th>Last Trip</th>
              </tr>
            </thead>
            <tbody>
              {passengers.map((passenger) => (
                <tr key={passenger._id}>
                  <td>
                    {passenger.avatar ? (
                      <img src={passenger.avatar} alt={passenger.name} className="profile-pic" />
                    ) : (
                      <div className="profile-pic" style={{ display: "grid", placeItems: "center", background: "#f2f4f7" }}>
                        {passenger.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </td>
                  <td>{passenger.name}</td>
                  <td>{passenger.email}</td>
                  <td>{passenger.phone || "N/A"}</td>
                  <td>{passenger.bookingCount || 0}</td>
                  <td>{formatDate(passenger.lastBookingDate)}</td>
                </tr>
              ))}
              {passengers.length === 0 ? (
                <tr>
                  <td colSpan={6}>No passengers found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default Passengers;

import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

import "./editPassenger.css"; 

const EditPassenger = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [passenger, setPassenger] = useState({

    name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    city: "",
    country: "",
    role: "user"
  });

  useEffect(() => {
    const fetchPassenger = async () => {
      try {
        setLoading(true);
        const response = await apiCall(`/admin/users/${id}`);
        const data = response.data;
        
        setPassenger({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.address?.street || "",
          city: data.address?.city || "",
          country: data.address?.country || "",
          role: data.role || "user",
          password: ""
        });
      } catch (err) {
        setError("Failed to load user data");
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchPassenger();
  }, [id]);

  const handleChange = (e) => {
    setPassenger({
      ...passenger,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = { ...passenger };
      if (!payload.password) {
        delete payload.password;
      }

      await apiCall(`/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      toast.success("User updated successfully!");
      setTimeout(() => {
        navigate("/admin/passengers");
      }, 1500);
    } catch (error) {
      const errorMsg = error.message || "Failed to update user";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="edit-passenger-container">
        <h2>Edit User</h2>
        {loading && <div className="loading">Loading user data...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && (
      <form className="edit-passenger-form" onSubmit={handleSubmit}>


        <div className="input-wrapper">
          <i className="fa-solid fa-user"></i>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={passenger.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-wrapper">
          <i className="fa-solid fa-envelope"></i>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={passenger.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-wrapper">
          <i className="fa-solid fa-user-shield"></i>
          <select
            name="role"
            value={passenger.role}
            onChange={handleChange}
            required
          >
            <option value="user">User</option>
            <option value="landlord">Landlord</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="input-wrapper">
          <i className="fa-solid fa-phone"></i>
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={passenger.phone}
            onChange={handleChange}
          />
        </div>

        <div className="input-wrapper">
          <i className="fa-solid fa-location-dot"></i>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={passenger.location}
            onChange={handleChange}
          />
        </div>

        <div className="input-wrapper">
          <i className="fa-solid fa-lock"></i>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={passenger.password}
            onChange={handleChange}
          />
        </div>

        <div className="input-wrapper">
          <i className="fa-solid fa-city"></i>
          <input
            type="text"
            name="city"
            placeholder="City"
            value={passenger.city}
            onChange={handleChange}
          />
        </div>

        <div className="input-wrapper">
          <i className="fa-solid fa-flag"></i>
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={passenger.country}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={saving || loading}>
            {saving ? "Saving..." : "Update User"}
          </button>
        </div>

      </form>
        )}
      </div>

    </AdminLayout>
  );
};

export default EditPassenger;

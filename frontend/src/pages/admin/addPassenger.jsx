import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";
import { toast } from "react-toastify";
import "./addPassenger.css";


const AddPassenger = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  const handleChange = (e) => {
    setPassenger({
      ...passenger,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiCall("/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passenger)
      });

      toast.success("User added successfully!");
      setTimeout(() => {
        navigate("/admin/passengers");
      }, 1500);
    } catch (error) {
      toast.error("Failed to add user: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };


  return (
    <AdminLayout>
      <div className="add-passenger-container">
      <h2>Add User</h2>
      <form className="add-passenger-form" onSubmit={handleSubmit}>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={passenger.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={passenger.email}
          onChange={handleChange}
          required
        />

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

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={passenger.phone}
          onChange={handleChange}
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={passenger.location}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={passenger.password}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={passenger.city}
          onChange={handleChange}
        />

        <input
          type="text"
          name="country"
          placeholder="Country"
          value={passenger.country}
          onChange={handleChange}
        />

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Save User"}
          </button>
        </div>


      </form>
    </div>
  </AdminLayout>
  );
};

export default AddPassenger;

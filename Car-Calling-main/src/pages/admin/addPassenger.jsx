import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./addPassenger.css";

const AddPassenger = () => {
  const navigate = useNavigate();

  const [passenger, setPassenger] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    city: "",
    country: ""
  });

  const handleChange = (e) => {
    setPassenger({
      ...passenger,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    toast.success("Passenger added successfully ✅");

    setTimeout(() => {
      navigate("/admin/passengers");
    }, 2000);
  };

  return (
    <AdminLayout>
      <div className="add-passenger-container">
       <ToastContainer position="top-center" autoClose={2000} />
      <h2>Add Passenger</h2>
      <form className="add-passenger-form" onSubmit={handleSubmit}>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={passenger.name}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={passenger.email}
          onChange={handleChange}
        />

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
          <button type="submit">Save</button>
        </div>

      </form>
    </div>
  </AdminLayout>
  );
};

export default AddPassenger;
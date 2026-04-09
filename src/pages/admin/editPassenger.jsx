import React, { useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./editPassenger.css"; 

const EditPassenger = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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

  toast.success(`Passenger ${id} updated successfully 🔄`);

  setTimeout(() => {
    navigate("/admin/passengers");
  }, 2000);
};
  return (
    <AdminLayout>
      <div className="edit-passenger-container">
        <ToastContainer position="top-center" autoClose={2000} />
        <h2>Edit Passenger</h2>
      <form className="edit-passenger-form" onSubmit={handleSubmit}>

        <div className="input-wrapper">
          <i className="fa-solid fa-user"></i>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={passenger.name}
            onChange={handleChange}
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
          />
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
          <button type="submit">Save</button>
        </div>

      </form>
      </div>
    </AdminLayout>
  );
};

export default EditPassenger;
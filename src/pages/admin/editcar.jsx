import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./editcar.css"; // ممكن تستخدم نفس الـ CSS

const EditCar = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [car, setCar] = useState({
    name: "",
    type: "Sedan",
    price: "",
    status: "Ready",
    seats: "",
    year: "",
    mileage: "",
    fuel: "Petrol",
    engine: "",
    description: ""
  });

  const handleChange = (e) => {
    setCar({
      ...car,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success(`Car ${id} updated successfully 🔄`);
    setTimeout(() => {
      navigate("/admin/carowner");
    }, 2000);
  };

  return (
    <div className="edit-car-container">
      <ToastContainer position="top-center" autoClose={2000} />
      <h2>Edit Car</h2>
      <form className="edit-car-form" onSubmit={handleSubmit}>

        <div className="input-wrapper">
          <i className="fa-solid fa-car"></i>
          <input
            type="text"
            name="name"
            placeholder="Car Name"
            value={car.name}
            onChange={handleChange}
          />
        </div>

        <div className="input-wrapper">
          <i className="fa-solid fa-car-side"></i>
          <input
            type="text"
            name="type"
            placeholder="Car Type"
            value={car.type}
            onChange={handleChange}
          />
        </div>

        <div className="input-wrapper">
          <i className="fa-solid fa-dollar-sign"></i>
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={car.price}
            onChange={handleChange}
          />
        </div>

        <div className="input-wrapper">
          <i className="fa-solid fa-circle-check"></i>
          <input
            type="text"
            name="status"
            placeholder="Status"
            value={car.status}
            onChange={handleChange}
          />
        </div>

        <div className="input-wrapper">
          <i className="fa-solid fa-chair"></i>
          <input
            type="number"
            name="seats"
            placeholder="Seats"
            value={car.seats}
            onChange={handleChange}
          />
        </div>

        <div className="input-wrapper">
          <i className="fa-solid fa-calendar"></i>
          <input
            type="number"
            name="year"
            placeholder="Year"
            value={car.year}
            onChange={handleChange}
          />
        </div>

        <div className="input-wrapper">
          <i className="fa-solid fa-tachometer-alt"></i>
          <input
            type="number"
            name="mileage"
            placeholder="Mileage"
            value={car.mileage}
            onChange={handleChange}
          />
        </div>

        <div className="input-wrapper">
          <i className="fa-solid fa-gas-pump"></i>
          <input
            type="text"
            name="fuel"
            placeholder="Fuel"
            value={car.fuel}
            onChange={handleChange}
          />
        </div>

        <div className="input-wrapper">
          <i className="fa-solid fa-cogs"></i>
          <input
            type="text"
            name="engine"
            placeholder="Engine"
            value={car.engine}
            onChange={handleChange}
          />
        </div>

        <div className="input-wrapper">
          <i className="fa-solid fa-align-left"></i>
          <textarea
            name="description"
            placeholder="Description"
            value={car.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="form-actions">
          <button type="submit">Save</button>
        </div>

      </form>
    </div>
  );
};

export default EditCar;
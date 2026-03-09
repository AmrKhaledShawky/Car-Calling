import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./addcar.css"; 

const AddCar = () => {
  const navigate = useNavigate();

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

    toast.success("Car added successfully ✅");

    setTimeout(() => {
      navigate("/admin/carowner");
    }, 2000);
  };

  return (
    <div className="add-car-container">
      <ToastContainer position="top-center" autoClose={2000} />
      <h2>Add Car</h2>
      <form className="add-car-form" onSubmit={handleSubmit}>

        <input
          type="text"
          name="name"
          placeholder="Car Name"
          value={car.name}
          onChange={handleChange}
        />

        <input
          type="text"
          name="type"
          placeholder="Car Type"
          value={car.type}
          onChange={handleChange}
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={car.price}
          onChange={handleChange}
        />

        <input
          type="text"
          name="status"
          placeholder="Status"
          value={car.status}
          onChange={handleChange}
        />

        <input
          type="number"
          name="seats"
          placeholder="Seats"
          value={car.seats}
          onChange={handleChange}
        />

        <input
          type="number"
          name="year"
          placeholder="Year"
          value={car.year}
          onChange={handleChange}
        />

        <input
          type="number"
          name="mileage"
          placeholder="Mileage"
          value={car.mileage}
          onChange={handleChange}
        />

        <input
          type="text"
          name="fuel"
          placeholder="Fuel"
          value={car.fuel}
          onChange={handleChange}
        />

        <input
          type="text"
          name="engine"
          placeholder="Engine"
          value={car.engine}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={car.description}
          onChange={handleChange}
        ></textarea>

        <div className="form-actions">
          <button type="submit">Save</button>
        </div>

      </form>
    </div>
  );
};

export default AddCar;
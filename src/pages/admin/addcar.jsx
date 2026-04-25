import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";
import { toast } from "react-toastify";
import "./addcar.css";

const AddCar = () => {
  const navigate = useNavigate();
  const [landlords, setLandlords] = useState([]);
  const [loadingLandlords, setLoadingLandlords] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [car, setCar] = useState({
    make: "",
    model: "",
    year: "",
    vin: "",
    licensePlate: "",
    category: "sedan",
    fuelType: "gasoline",
    transmission: "automatic",
    seats: "",
    color: "",
    mileage: "",
    dailyRate: "",
    owner: "",
    status: "available",
    notes: ""
  });

  useEffect(() => {
    const fetchLandlords = async () => {
      try {
        setLoadingLandlords(true);
        const response = await apiCall("/admin/landlords");
        setLandlords(response.data || []);
      } catch (error) {
        toast.error("Failed to load landlords: " + error.message);
      } finally {
        setLoadingLandlords(false);
      }
    };

    fetchLandlords();
  }, []);

  const handleChange = (e) => {
    setCar({
      ...car,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const carData = {
        ...car,
        location: {
          city: "Unknown"
        }
      };

      await apiCall("/admin/cars", {
        method: "POST",
        body: JSON.stringify(carData)
      });

      toast.success("Car added successfully!");
      setTimeout(() => {
        navigate("/admin/cars");
      }, 1500);
    } catch (error) {
      toast.error("Failed to add car: " + error.message);
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="add-car-container">
        <h2>Add Car</h2>
        <form className="add-car-form" onSubmit={handleSubmit}>

          <div className="input-wrapper">
            <i className="fa-solid fa-car"></i>
            <input
              type="text"
              name="make"
              placeholder="Make (e.g. Toyota)"
              value={car.make}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-car-side"></i>
            <input
              type="text"
              name="model"
              placeholder="Model (e.g. Camry)"
              value={car.model}
              onChange={handleChange}
              required
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
              required
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-fingerprint"></i>
            <input
              type="text"
              name="vin"
              placeholder="VIN (17 characters)"
              value={car.vin}
              onChange={handleChange}
              required
              maxLength="17"
            />
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-id-card"></i>
            <input
              type="text"
              name="licensePlate"
              placeholder="License Plate"
              value={car.licensePlate}
              onChange={handleChange}
            />
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-list"></i>
            <select name="category" value={car.category} onChange={handleChange} required>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="truck">Truck</option>
              <option value="coupe">Coupe</option>
              <option value="convertible">Convertible</option>
              <option value="hatchback">Hatchback</option>
              <option value="wagon">Wagon</option>
              <option value="van">Van</option>
              <option value="luxury">Luxury</option>
              <option value="sports">Sports</option>
            </select>
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-gas-pump"></i>
            <select name="fuelType" value={car.fuelType} onChange={handleChange} required>
              <option value="gasoline">Gasoline</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
              <option value="plug-in hybrid">Plug-in Hybrid</option>
            </select>
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-gears"></i>
            <select name="transmission" value={car.transmission} onChange={handleChange} required>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
              <option value="cvt">CVT</option>
              <option value="dct">DCT</option>
            </select>
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-chair"></i>
            <input
              type="number"
              name="seats"
              placeholder="Seats"
              value={car.seats}
              onChange={handleChange}
              required
              min="1"
              max="9"
            />
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-palette"></i>
            <input
              type="text"
              name="color"
              placeholder="Color"
              value={car.color}
              onChange={handleChange}
            />
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-road"></i>
            <input
              type="number"
              name="mileage"
              placeholder="Mileage"
              value={car.mileage}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-dollar-sign"></i>
            <input
              type="number"
              name="dailyRate"
              placeholder="Daily Rate"
              value={car.dailyRate}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-user-tie"></i>
            <select 
              name="owner" 
              value={car.owner} 
              onChange={handleChange} 
              required
              disabled={loadingLandlords}
            >
              <option value="">
                {loadingLandlords ? "Loading landlords..." : "Select Owner (Landlord)"}
              </option>
              {landlords.map((landlord) => (
                <option key={landlord._id} value={landlord._id}>
                  {landlord.name} ({landlord.email})
                </option>
              ))}
            </select>
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-circle-check"></i>
            <select name="status" value={car.status} onChange={handleChange} required>
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-align-left"></i>
            <textarea
              name="notes"
              placeholder="Notes"
              value={car.notes}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>

        </form>
      </div>
    </AdminLayout>
  );
};

export default AddCar;

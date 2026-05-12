import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";
import { toast } from "react-toastify";
import "./addcar.css";

const MIN_CAR_YEAR = 1900;
const getMaxCarYear = () => new Date().getFullYear() + 1;
const VIN_PATTERN = /^[A-Z0-9]{17}$/;

const FIELD_LABELS = {
  make: "Make",
  model: "Model",
  year: "Year",
  vin: "VIN",
  seats: "Seats",
  mileage: "Mileage",
  dailyRate: "Daily Rate",
  city: "City",
  "location.city": "City",
  owner: "Owner"
};

const isBlank = (value) => value === undefined || value === null || String(value).trim() === "";

const getFormFieldName = (field) => {
  if (field === "location.city" || field === "location[city]") {
    return "city";
  }

  return field?.replace("[]", "") || "";
};

const getFieldLabel = (field) => (
  FIELD_LABELS[field] || FIELD_LABELS[getFormFieldName(field)] || field
);

const normalizeValidationDetails = (details = []) => details
  .filter(Boolean)
  .map((item) => ({
    field: item.field || "",
    message: item.message || "Fix this value."
  }));

const validateCar = (car) => {
  const errors = [];
  const maxYear = getMaxCarYear();
  const year = Number(car.year);
  const vin = car.vin.trim().toUpperCase();

  const addError = (field, message) => errors.push({ field, message });

  if (isBlank(car.make)) addError("make", "Enter the car make, for example Toyota.");
  if (isBlank(car.model)) addError("model", "Enter the car model, for example Corolla.");

  if (isBlank(car.year)) {
    addError("year", "Enter the car model year.");
  } else if (!Number.isInteger(year) || year < MIN_CAR_YEAR || year > maxYear) {
    addError("year", `Enter a year between ${MIN_CAR_YEAR} and ${maxYear}.`);
  }

  if (isBlank(vin)) {
    addError("vin", "Enter the VIN.");
  } else if (!VIN_PATTERN.test(vin)) {
    addError("vin", "Enter exactly 17 VIN characters using letters A-Z and digits 0-9.");
  }

  if (!Number.isInteger(Number(car.seats)) || Number(car.seats) < 1 || Number(car.seats) > 9) {
    addError("seats", "Seats must be a whole number from 1 to 9.");
  }

  if (!isBlank(car.mileage) && (!Number.isFinite(Number(car.mileage)) || Number(car.mileage) < 0)) {
    addError("mileage", "Mileage must be 0 or more.");
  }

  if (isBlank(car.dailyRate)) {
    addError("dailyRate", "Enter the daily rental price.");
  } else if (!Number.isFinite(Number(car.dailyRate)) || Number(car.dailyRate) < 0) {
    addError("dailyRate", "Daily rate must be 0 or more.");
  }

  if (isBlank(car.city)) addError("city", "Enter the city where renters can pick up the car.");
  if (isBlank(car.owner)) addError("owner", "Select the landlord who owns this car.");

  return errors;
};

const AddCar = () => {
  const navigate = useNavigate();
  const [landlords, setLandlords] = useState([]);
  const [loadingLandlords, setLoadingLandlords] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

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
    city: "",
    state: "",
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
    setValidationErrors([]);
    setCar({
      ...car,
      [e.target.name]: e.target.value
    });
  };

  const fieldHasError = (...fields) => {
    const normalizedFields = fields.map(getFormFieldName);
    return validationErrors.some((item) => normalizedFields.includes(getFormFieldName(item.field)));
  };

  const focusFirstInvalidField = (errors) => {
    const fieldName = getFormFieldName(errors[0]?.field);
    if (!fieldName) return;

    window.requestAnimationFrame(() => {
      document.querySelector(`[name="${fieldName}"]`)?.focus();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors([]);

    const clientErrors = validateCar(car);

    if (clientErrors.length > 0) {
      setValidationErrors(clientErrors);
      focusFirstInvalidField(clientErrors);
      toast.error(clientErrors[0].message);
      return;
    }

    try {
      setSubmitting(true);
      const carData = {
        ...car,
        vin: car.vin.trim().toUpperCase(),
        licensePlate: car.licensePlate.trim().toUpperCase(),
        category: car.category.toLowerCase(),
        fuelType: car.fuelType.toLowerCase(),
        transmission: car.transmission.toLowerCase(),
        status: car.status.toLowerCase(),
        location: {
          city: car.city.trim(),
          state: car.state.trim()
        }
      };

      delete carData.city;
      delete carData.state;

      await apiCall("/admin/cars", {
        method: "POST",
        body: JSON.stringify(carData)
      });

      toast.success("Car added successfully!");
      setSubmitting(false);
      navigate("/admin/cars");
    } catch (error) {
      const details = normalizeValidationDetails(error.details);
      setValidationErrors(details);
      focusFirstInvalidField(details);
      toast.error(details[0]?.message || "Failed to add car: " + error.message);
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="add-car-container">
        <h2>Add Car</h2>
        <form className="add-car-form" onSubmit={handleSubmit} noValidate>

          <div className="input-wrapper">
            <i className="fa-solid fa-car"></i>
            <input
              type="text"
              name="make"
              placeholder="Make (e.g. Toyota)"
              value={car.make}
              onChange={handleChange}
              aria-invalid={fieldHasError("make") ? "true" : undefined}
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
              aria-invalid={fieldHasError("model") ? "true" : undefined}
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
              aria-invalid={fieldHasError("year") ? "true" : undefined}
              required
              min={MIN_CAR_YEAR}
              max={getMaxCarYear()}
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
              aria-invalid={fieldHasError("vin") ? "true" : undefined}
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
              aria-invalid={fieldHasError("seats") ? "true" : undefined}
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
              aria-invalid={fieldHasError("mileage") ? "true" : undefined}
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
              aria-invalid={fieldHasError("dailyRate") ? "true" : undefined}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-city"></i>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={car.city}
              onChange={handleChange}
              aria-invalid={fieldHasError("city", "location.city") ? "true" : undefined}
              required
            />
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-map"></i>
            <input
              type="text"
              name="state"
              placeholder="State"
              value={car.state}
              onChange={handleChange}
            />
          </div>

          <div className="input-wrapper">
            <i className="fa-solid fa-user-tie"></i>
            <select 
              name="owner" 
              value={car.owner} 
              onChange={handleChange} 
              aria-invalid={fieldHasError("owner") ? "true" : undefined}
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

          {validationErrors.length > 0 ? (
            <div className="add-car-validation-list" role="alert" aria-live="polite">
              <strong>Fix these fields:</strong>
              {validationErrors.map((item, index) => (
                <p key={`${item.field || "error"}-${index}`}>
                  {(item.field ? `${getFieldLabel(item.field)}: ` : "") + item.message}
                </p>
              ))}
            </div>
          ) : null}

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

import { useEffect, useRef, useState } from "react";
import {
  CarFront,
  CircleDollarSign,
  LoaderCircle,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Wrench,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiCall } from "../../utils/api";
import "./mycars.css";

const CATEGORY_OPTIONS = ["sedan", "suv", "truck", "coupe", "convertible", "hatchback", "wagon", "van", "luxury", "sports"];
const FUEL_OPTIONS = ["gasoline", "diesel", "electric", "hybrid", "plug-in hybrid"];
const TRANSMISSION_OPTIONS = ["manual", "automatic", "cvt", "dct"];
const STATUS_OPTIONS = ["available", "maintenance", "inactive"];
const FEATURE_OPTIONS = [
  "air-conditioning",
  "bluetooth",
  "backup-camera",
  "gps-navigation",
  "cruise-control",
  "apple-carplay",
  "android-auto",
  "sunroof",
  "heated-seats",
  "keyless-entry"
];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MIN_CAR_YEAR = 1900;
const getMaxCarYear = () => new Date().getFullYear() + 1;
const VIN_PATTERN = /^[A-Z0-9]{17}$/;

const createInitialFormData = () => ({
  make: "",
  model: "",
  year: "",
  vin: "",
  licensePlate: "",
  category: "sedan",
  fuelType: "gasoline",
  transmission: "automatic",
  seats: 5,
  doors: 4,
  color: "",
  mileage: 0,
  dailyRate: "",
  city: "",
  state: "",
  status: "available",
  features: []
});

const formatLabel = (value) => {
  if (!value) return "N/A";

  return value
    .toString()
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;
const getCarName = (car) => `${car?.year || ""} ${car?.make || ""} ${car?.model || ""}`.trim() || "Unknown car";
const getCarStatus = (car) => (car?.status || "unknown").toLowerCase();
const getCarImage = (car) => car?.primaryImage?.url || car?.images?.[0]?.url || "";

const FIELD_LABELS = {
  make: "Make",
  model: "Model",
  year: "Year",
  vin: "VIN",
  licensePlate: "License Plate",
  category: "Category",
  fuelType: "Fuel Type",
  transmission: "Transmission",
  seats: "Seats",
  doors: "Doors",
  mileage: "Mileage",
  dailyRate: "Daily Rate",
  city: "City",
  "location.city": "City",
  status: "Status",
  owner: "Owner"
};

const isBlank = (value) => value === undefined || value === null || String(value).trim() === "";

const isWholeNumberInRange = (value, min, max) => {
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max;
};

const isNumberAtLeast = (value, min) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= min;
};

const getFormFieldName = (field) => {
  if (field === "location.city" || field === "location[city]") {
    return "city";
  }

  return field?.replace("[]", "") || "";
};

const getValidationLabel = (field) => (
  FIELD_LABELS[field] || FIELD_LABELS[getFormFieldName(field)] || formatLabel(field)
);

const normalizeValidationDetails = (details = []) => details
  .filter(Boolean)
  .map((item) => ({
    field: item.field || "",
    message: item.message || "Fix this value."
  }));

const validateCarForm = (data) => {
  const errors = [];
  const maxYear = getMaxCarYear();
  const year = Number(data.year);
  const vin = data.vin.trim().toUpperCase();

  const addError = (field, message) => {
    errors.push({ field, message });
  };

  if (isBlank(data.make)) {
    addError("make", "Enter the car make, for example Toyota.");
  } else if (data.make.trim().length > 50) {
    addError("make", "Make must be 50 characters or fewer.");
  }

  if (isBlank(data.model)) {
    addError("model", "Enter the car model, for example Corolla.");
  } else if (data.model.trim().length > 50) {
    addError("model", "Model must be 50 characters or fewer.");
  }

  if (isBlank(data.year)) {
    addError("year", "Enter the car model year.");
  } else if (!Number.isInteger(year) || year < MIN_CAR_YEAR || year > maxYear) {
    addError("year", `Enter a year between ${MIN_CAR_YEAR} and ${maxYear}.`);
  }

  if (isBlank(vin)) {
    addError("vin", "Enter the VIN.");
  } else if (!VIN_PATTERN.test(vin)) {
    addError("vin", "Enter exactly 17 VIN characters using letters A-Z and digits 0-9.");
  }

  if (!isWholeNumberInRange(data.seats, 1, 9)) {
    addError("seats", "Seats must be a whole number from 1 to 9.");
  }

  if (!isWholeNumberInRange(data.doors, 2, 5)) {
    addError("doors", "Doors must be a whole number from 2 to 5.");
  }

  if (!isBlank(data.mileage) && !isNumberAtLeast(data.mileage, 0)) {
    addError("mileage", "Mileage must be 0 or more.");
  }

  if (isBlank(data.dailyRate)) {
    addError("dailyRate", "Enter the daily rental price.");
  } else if (!isNumberAtLeast(data.dailyRate, 0)) {
    addError("dailyRate", "Daily rate must be 0 or more.");
  }

  if (isBlank(data.city)) {
    addError("city", "Enter the city where renters can pick up the car.");
  }

  return errors;
};

export default function MyCarsReal() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCarId, setEditingCarId] = useState("");
  const [deleteDialogCar, setDeleteDialogCar] = useState(null);
  const [deletingCarId, setDeletingCarId] = useState("");
  const [statusLocked, setStatusLocked] = useState(false);
  const [formData, setFormData] = useState(createInitialFormData());
  const [imagePreview, setImagePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const fieldHasError = (...fields) => {
    const normalizedFields = fields.map(getFormFieldName);
    return validationErrors.some((item) => {
      const fieldName = getFormFieldName(item.field);
      return normalizedFields.includes(fieldName);
    });
  };

  const focusFirstInvalidField = (errors) => {
    const fieldName = getFormFieldName(errors[0]?.field);

    if (!fieldName) {
      return;
    }

    window.requestAnimationFrame(() => {
      document.querySelector(`[name="${fieldName}"]`)?.focus();
    });
  };

  const loadCars = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiCall("/owner/cars?limit=100");
      setCars(response.data || []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load your cars.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  useEffect(() => {
    const overlayOpen = isEditorOpen || Boolean(deleteDialogCar);
    document.body.style.overflow = overlayOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [deleteDialogCar, isEditorOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setError("");
    setValidationErrors([]);
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleFeatureToggle = (feature) => {
    setError("");
    setValidationErrors([]);
    setFormData((current) => ({
      ...current,
      features: current.features.includes(feature)
        ? current.features.filter((item) => item !== feature)
        : [...current.features, feature]
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    setError("");
    setValidationErrors([]);

    if (!file) {
      setImagePreview("");
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("Photo must be 5 MB or smaller.");
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(typeof reader.result === "string" ? reader.result : "");
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData(createInitialFormData());
    setStatusLocked(false);
    setImagePreview("");
    setSelectedFile(null);
    setValidationErrors([]);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeEditor = (force = false) => {
    if (submitting && !force) {
      return;
    }

    setIsEditorOpen(false);
    setEditingCarId("");
    resetForm();
  };

  const openAddEditor = () => {
    resetForm();
    setIsEditorOpen(true);
  };

  const openEditEditor = (car) => {
    setError("");
    setValidationErrors([]);
    setEditingCarId(car._id);
    setStatusLocked(Boolean(car.statusLocked));
    setFormData({
      make: car.make || "",
      model: car.model || "",
      year: car.year || "",
      vin: car.vin || "",
      licensePlate: car.licensePlate || "",
      category: car.category || "sedan",
      fuelType: car.fuelType || "gasoline",
      transmission: car.transmission || "automatic",
      seats: car.seats || 5,
      doors: car.doors || 4,
      color: car.color || "",
      mileage: car.mileage ?? 0,
      dailyRate: car.dailyRate || "",
      city: car.location?.city || "",
      state: car.location?.state || "",
      status: car.status || "available",
      features: Array.isArray(car.features) ? car.features : []
    });
    setImagePreview(getCarImage(car));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsEditorOpen(true);
  };

  const createPayload = () => {
    const data = new FormData();
    data.append("make", formData.make.trim());
    data.append("model", formData.model.trim());
    data.append("year", formData.year);
    data.append("vin", formData.vin.trim().toUpperCase());
    data.append("licensePlate", formData.licensePlate.trim().toUpperCase());
    data.append("category", formData.category.toLowerCase());
    data.append("fuelType", formData.fuelType.toLowerCase());
    data.append("transmission", formData.transmission.toLowerCase());
    data.append("seats", formData.seats);
    data.append("doors", formData.doors);
    data.append("color", formData.color.trim());
    data.append("mileage", formData.mileage);
    data.append("dailyRate", formData.dailyRate);
    data.append("status", formData.status.toLowerCase());
    
    // Location needs to be handled carefully in FormData
    data.append("location[city]", formData.city.trim());
    data.append("location[state]", formData.state.trim());
    data.append("location[address]", "");
    data.append("location[zipCode]", "");

    if (selectedFile) {
      data.append("image", selectedFile);
    }

    formData.features.forEach((feature) => {
      data.append("features[]", feature);
    });

    return data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setValidationErrors([]);

    const clientErrors = validateCarForm(formData);

    if (clientErrors.length > 0) {
      setValidationErrors(clientErrors);
      setError("Fix the listed car details before saving.");
      focusFirstInvalidField(clientErrors);
      toast.error(clientErrors[0].message);
      return;
    }

    try {
      setSubmitting(true);

      const payload = createPayload();
      const response = await apiCall(editingCarId ? `/owner/cars/${editingCarId}` : "/owner/cars", {
        method: editingCarId ? "PUT" : "POST",
        body: payload
      });

      if (editingCarId) {
        setCars((current) =>
          current.map((car) =>
            car._id === editingCarId
              ? { ...response.data, statusLocked: car.statusLocked }
              : car
          )
        );
        toast.success("Car updated successfully.");
      } else {
        setCars((current) => [{ ...response.data, statusLocked: false }, ...current]);
        toast.success("Car added successfully.");
      }

      closeEditor(true);
    } catch (submitError) {
      const details = normalizeValidationDetails(submitError.details);
      const fallbackMessage = submitError.message || "Failed to save the car.";
      const message = details.length > 0 ? "Fix the listed car details and try again." : fallbackMessage;

      setValidationErrors(details);
      setError(message);
      focusFirstInvalidField(details);
      toast.error(details[0]?.message || fallbackMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialogCar?._id) {
      toast.error("Car id is missing.");
      return;
    }

    try {
      setDeletingCarId(deleteDialogCar._id);
      await apiCall(`/owner/cars/${deleteDialogCar._id}`, { method: "DELETE" });
      setCars((current) => current.filter((car) => car._id !== deleteDialogCar._id));
      toast.success("Car deleted successfully.");
      setDeleteDialogCar(null);
    } catch (deleteError) {
      toast.error(deleteError.message || "Failed to delete the car.");
    } finally {
      setDeletingCarId("");
    }
  };

  const totalCars = cars.length;
  const availableCars = cars.filter((car) => getCarStatus(car) === "available").length;
  const lockedCars = cars.filter((car) => car.statusLocked).length;
  const attentionCars = cars.filter((car) => ["maintenance", "inactive"].includes(getCarStatus(car))).length;

  return (
    <DashboardLayout>
      <div className="landlord-cars-page">
        <div className="landlord-cars-header">
          <div className="landlord-cars-header-copy">
            <h2>My Cars</h2>
            <p>Manage your listings, keep availability current, and update details from one cleaner workspace.</p>
          </div>
          <button type="button" className="landlord-cars-add-btn" onClick={openAddEditor}>
            <Plus size={18} />
            Add Car
          </button>
        </div>

        {!loading && !error ? (
          <div className="landlord-cars-metrics">
            <article className="landlord-cars-metric-card">
              <div className="landlord-cars-metric-icon">
                <CarFront size={18} />
              </div>
              <div>
                <span>Total cars</span>
                <strong>{totalCars}</strong>
              </div>
            </article>
            <article className="landlord-cars-metric-card">
              <div className="landlord-cars-metric-icon success">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span>Available now</span>
                <strong>{availableCars}</strong>
              </div>
            </article>
            <article className="landlord-cars-metric-card">
              <div className="landlord-cars-metric-icon info">
                <CircleDollarSign size={18} />
              </div>
              <div>
                <span>Booked or locked</span>
                <strong>{lockedCars}</strong>
              </div>
            </article>
            <article className="landlord-cars-metric-card">
              <div className="landlord-cars-metric-icon alert">
                <Wrench size={18} />
              </div>
              <div>
                <span>Needs attention</span>
                <strong>{attentionCars}</strong>
              </div>
            </article>
          </div>
        ) : null}

        {loading ? <p className="landlord-cars-status-card">Loading your cars...</p> : null}
        {error && !isEditorOpen ? <p className="landlord-cars-status-card landlord-cars-status-error">{error}</p> : null}

        {!loading && !error && cars.length === 0 ? (
          <div className="landlord-cars-empty-state">
            <h3>No cars yet</h3>
            <p>Your landlord account does not have any listed cars yet.</p>
            <button type="button" className="landlord-cars-add-btn" onClick={openAddEditor}>
              <Plus size={18} />
              Add your first car
            </button>
          </div>
        ) : null}

        {!loading && !error && cars.length > 0 ? (
          <div className="landlord-cars-table-card">
            <div className="landlord-cars-table-scroll">
              <table className="landlord-cars-table">
                <thead>
                  <tr>
                    <th>Car</th>
                    <th>Category</th>
                    <th>Specs</th>
                    <th>Location</th>
                    <th>Rate</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => {
                    const isDeleting = deletingCarId === car._id;

                    return (
                      <tr key={car._id}>
                        <td>
                          <div className="landlord-cars-name-cell">
                            {getCarImage(car) ? (
                              <img
                                src={getCarImage(car)}
                                alt={getCarName(car)}
                                className="landlord-cars-thumb"
                              />
                            ) : (
                              <div className="landlord-cars-thumb-placeholder">
                                <CarFront size={18} />
                              </div>
                            )}
                            <div className="landlord-cars-name-copy">
                              <strong>{getCarName(car)}</strong>
                              <span>{car.licensePlate || "No plate number"}</span>
                            </div>
                          </div>
                        </td>
                        <td>{formatLabel(car.category)}</td>
                        <td>
                          <div className="landlord-cars-specs">
                            <span>{car.seats || "N/A"} seats</span>
                            <span>{formatLabel(car.fuelType)}</span>
                            <span>{formatLabel(car.transmission)}</span>
                            <span>{Number(car.mileage ?? 0).toLocaleString()} mi</span>
                          </div>
                        </td>
                        <td>{[car.location?.city, car.location?.state].filter(Boolean).join(", ") || "N/A"}</td>
                        <td>{formatMoney(car.dailyRate)} / day</td>
                        <td>
                          <div className="landlord-cars-status-cell">
                            <span className={`landlord-cars-status-badge ${getCarStatus(car)}`}>
                              {formatLabel(car.status)}
                            </span>
                            {car.statusLocked ? <span className="landlord-cars-lock-note">Status locked by an active rental</span> : null}
                          </div>
                        </td>
                        <td className="landlord-cars-actions">
                          <button
                            type="button"
                            className="landlord-cars-action-btn edit"
                            onClick={() => openEditEditor(car)}
                          >
                            <Pencil size={16} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            className="landlord-cars-action-btn delete"
                            onClick={() => setDeleteDialogCar(car)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? <LoaderCircle size={16} className="landlord-cars-spin" /> : <Trash2 size={16} />}
                            <span>{isDeleting ? "Deleting" : "Delete"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {isEditorOpen ? (
          <div className="landlord-cars-modal-backdrop" onClick={(event) => event.target.classList.contains("landlord-cars-modal-backdrop") && closeEditor()}>
            <div className="landlord-cars-modal">
              <div className="landlord-cars-modal-header">
                <div>
                  <h3>{editingCarId ? "Edit Car Details" : "Add New Car"}</h3>
                  <p>
                    {editingCarId
                      ? "Update the listing details below. Status changes stay locked while a confirmed or active rental is still running."
                      : "Add the main car details first. You can come back later to refine the listing if needed."}
                  </p>
                </div>
                <button type="button" className="landlord-cars-close-btn" onClick={closeEditor}>
                  <X size={18} />
                </button>
              </div>

              <form className="landlord-cars-form" onSubmit={handleSubmit} noValidate>
                <div className="landlord-cars-form-grid">
                  <label className="landlord-cars-field">
                    <span>Make</span>
                    <input name="make" value={formData.make} onChange={handleChange} aria-invalid={fieldHasError("make") ? "true" : undefined} required />
                  </label>

                  <label className="landlord-cars-field">
                    <span>Model</span>
                    <input name="model" value={formData.model} onChange={handleChange} aria-invalid={fieldHasError("model") ? "true" : undefined} required />
                  </label>

                  <label className="landlord-cars-field">
                    <span>Year</span>
                    <input type="number" name="year" value={formData.year} onChange={handleChange} min={MIN_CAR_YEAR} max={getMaxCarYear()} aria-invalid={fieldHasError("year") ? "true" : undefined} required />
                  </label>

                  <label className="landlord-cars-field">
                    <span>VIN</span>
                    <input name="vin" value={formData.vin} onChange={handleChange} maxLength={17} aria-invalid={fieldHasError("vin") ? "true" : undefined} required />
                  </label>

                  <label className="landlord-cars-field">
                    <span>License Plate</span>
                    <input name="licensePlate" value={formData.licensePlate} onChange={handleChange} placeholder="Optional" aria-invalid={fieldHasError("licensePlate") ? "true" : undefined} />
                  </label>

                  <label className="landlord-cars-field">
                    <span>Category</span>
                    <select name="category" value={formData.category} onChange={handleChange} aria-invalid={fieldHasError("category") ? "true" : undefined} required>
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option} value={option}>{formatLabel(option)}</option>
                      ))}
                    </select>
                  </label>

                  <label className="landlord-cars-field">
                    <span>Fuel Type</span>
                    <select name="fuelType" value={formData.fuelType} onChange={handleChange} aria-invalid={fieldHasError("fuelType") ? "true" : undefined}>
                      {FUEL_OPTIONS.map((option) => (
                        <option key={option} value={option}>{formatLabel(option)}</option>
                      ))}
                    </select>
                  </label>

                  <label className="landlord-cars-field">
                    <span>Transmission</span>
                    <select name="transmission" value={formData.transmission} onChange={handleChange} aria-invalid={fieldHasError("transmission") ? "true" : undefined}>
                      {TRANSMISSION_OPTIONS.map((option) => (
                        <option key={option} value={option}>{formatLabel(option)}</option>
                      ))}
                    </select>
                  </label>

                  <label className="landlord-cars-field">
                    <span>Seats</span>
                    <input type="number" name="seats" value={formData.seats} onChange={handleChange} min="1" max="9" aria-invalid={fieldHasError("seats") ? "true" : undefined} required />
                  </label>

                  <label className="landlord-cars-field">
                    <span>Doors</span>
                    <input type="number" name="doors" value={formData.doors} onChange={handleChange} min="2" max="5" aria-invalid={fieldHasError("doors") ? "true" : undefined} required />
                  </label>

                  <label className="landlord-cars-field">
                    <span>Color</span>
                    <input name="color" value={formData.color} onChange={handleChange} placeholder="Optional" />
                  </label>

                  <label className="landlord-cars-field">
                    <span>Mileage</span>
                    <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} min="0" aria-invalid={fieldHasError("mileage") ? "true" : undefined} />
                  </label>

                  <label className="landlord-cars-field">
                    <span>Daily Rate</span>
                    <input type="number" name="dailyRate" value={formData.dailyRate} onChange={handleChange} min="0" step="0.01" aria-invalid={fieldHasError("dailyRate") ? "true" : undefined} required />
                  </label>

                  <label className="landlord-cars-field">
                    <span>City</span>
                    <input name="city" value={formData.city} onChange={handleChange} aria-invalid={fieldHasError("city", "location.city") ? "true" : undefined} required />
                  </label>

                  <label className="landlord-cars-field">
                    <span>State</span>
                    <input name="state" value={formData.state} onChange={handleChange} placeholder="Optional" />
                  </label>

                  <label className="landlord-cars-field">
                    <span>Status</span>
                    <select name="status" value={formData.status} onChange={handleChange} aria-invalid={fieldHasError("status") ? "true" : undefined} disabled={statusLocked}>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>{formatLabel(option)}</option>
                      ))}
                    </select>
                    {statusLocked ? <small>This car has a confirmed or active rental, so its status cannot change yet.</small> : null}
                  </label>

                  <div className="landlord-cars-field landlord-cars-field-wide">
                    <span>Features</span>
                    <div className="landlord-cars-pill-list">
                      {FEATURE_OPTIONS.map((feature) => (
                        <button
                          key={feature}
                          type="button"
                          className={`landlord-cars-pill ${formData.features.includes(feature) ? "selected" : ""}`}
                          onClick={() => handleFeatureToggle(feature)}
                        >
                          {formatLabel(feature)}
                        </button>
                      ))}
                    </div>
                    <small>Choose every feature that matches this car.</small>
                  </div>

                  <div className="landlord-cars-field landlord-cars-field-wide">
                    <span>Car Photo</span>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} />
                    <small>Choose an image smaller than 5 MB.</small>
                    {imagePreview ? <img src={imagePreview} alt="Car preview" className="landlord-cars-preview" /> : null}
                  </div>

                  {error ? <p className="landlord-cars-form-error">{error}</p> : null}
                  {validationErrors.length > 0 ? (
                    <div className="landlord-cars-validation-list" role="alert" aria-live="polite">
                      <strong>Fix these fields:</strong>
                      {validationErrors.map((item, index) => (
                        <p key={`${item.field || "error"}-${index}`}>
                          {(item.field ? `${getValidationLabel(item.field)}: ` : "") + item.message}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="landlord-cars-modal-actions">
                  <button type="button" className="landlord-cars-secondary-btn" onClick={closeEditor}>
                    Cancel
                  </button>
                  <button type="submit" className="landlord-cars-primary-btn" disabled={submitting}>
                    {submitting ? (editingCarId ? "Saving..." : "Adding...") : editingCarId ? "Save Changes" : "Add Car"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {deleteDialogCar ? (
          <div className="landlord-cars-modal-backdrop" onClick={(event) => event.target.classList.contains("landlord-cars-modal-backdrop") && !deletingCarId && setDeleteDialogCar(null)}>
            <div className="landlord-cars-delete-modal">
              <div className="landlord-cars-delete-icon">
                <Trash2 size={20} />
              </div>
              <h3>Delete {getCarName(deleteDialogCar)}?</h3>
              <p>
                This removes the listing permanently. Cars with confirmed or active bookings cannot be deleted.
              </p>
              <div className="landlord-cars-delete-summary">
                <strong>{getCarName(deleteDialogCar)}</strong>
                <span>{deleteDialogCar.licensePlate || "No plate number"}</span>
                <span className={`landlord-cars-status-badge ${getCarStatus(deleteDialogCar)}`}>
                  {formatLabel(deleteDialogCar.status)}
                </span>
              </div>
              <div className="landlord-cars-modal-actions">
                <button
                  type="button"
                  className="landlord-cars-secondary-btn"
                  onClick={() => setDeleteDialogCar(null)}
                  disabled={Boolean(deletingCarId)}
                >
                  Keep car
                </button>
                <button
                  type="button"
                  className="landlord-cars-danger-btn"
                  onClick={handleDelete}
                  disabled={Boolean(deletingCarId)}
                >
                  {deletingCarId === deleteDialogCar._id ? "Deleting..." : "Delete car"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

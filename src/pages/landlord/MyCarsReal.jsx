import { useEffect, useRef, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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

const createInitialFormData = () => ({
  make: "",
  model: "",
  year: "",
  vin: "",
  category: "sedan",
  fuelType: "gasoline",
  transmission: "automatic",
  seats: 5,
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

export default function MyCarsReal() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCarId, setEditingCarId] = useState("");
  const [deletingCarId, setDeletingCarId] = useState("");
  const [statusLocked, setStatusLocked] = useState(false);
  const [formData, setFormData] = useState(createInitialFormData());
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  const loadCars = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiCall("/cars/owner/my-cars");
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
    document.body.style.overflow = isAddOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isAddOpen]);

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
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError("Photo must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

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
    setValidationErrors([]);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeModal = () => {
    setIsAddOpen(false);
    setEditingCarId("");
    resetForm();
  };

  const openModal = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEditModal = (car) => {
    setError("");
    setValidationErrors([]);
    setEditingCarId(car._id);
    setStatusLocked(Boolean(car.statusLocked));
    setFormData({
      make: car.make || "",
      model: car.model || "",
      year: car.year || "",
      vin: car.vin || "",
      category: car.category || "sedan",
      fuelType: car.fuelType || "gasoline",
      transmission: car.transmission || "automatic",
      seats: car.seats || 5,
      dailyRate: car.dailyRate || "",
      city: car.location?.city || "",
      state: car.location?.state || "",
      status: car.status || "available",
      features: Array.isArray(car.features) ? car.features : []
    });
    setImagePreview(car.primaryImage?.url || car.images?.[0]?.url || "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsAddOpen(true);
  };

  const createPayload = () => ({
    make: formData.make.trim(),
    model: formData.model.trim(),
    year: Number(formData.year),
    vin: formData.vin.trim().toUpperCase(),
    category: formData.category,
    fuelType: formData.fuelType,
    transmission: formData.transmission,
    seats: Number(formData.seats),
    dailyRate: Number(formData.dailyRate),
    location: {
      city: formData.city.trim(),
      state: formData.state.trim(),
      address: "",
      zipCode: ""
    },
    images: imagePreview
      ? [
          {
            url: imagePreview,
            alt: `${formData.year} ${formData.make} ${formData.model}`.trim(),
            isPrimary: true
          }
        ]
      : [],
    status: formData.status,
    features: formData.features
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setValidationErrors([]);
      const payload = createPayload();
      const response = await apiCall(editingCarId ? `/cars/${editingCarId}` : "/cars", {
        method: editingCarId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });

      if (editingCarId) {
        setCars((current) => current.map((car) => (car._id === editingCarId ? response.data : car)));
        toast.success("Car updated successfully.");
      } else {
        setCars((current) => [response.data, ...current]);
        toast.success("Car added successfully.");
      }
      closeModal();
    } catch (submitError) {
      const details = Array.isArray(submitError.details) ? submitError.details : [];
      setValidationErrors(details);
      setError(submitError.message || "Failed to add the car.");
      toast.error(submitError.message || "Failed to add the car.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (carId) => {
    try {
      setDeletingCarId(carId);
      await apiCall(`/cars/${carId}`, { method: "DELETE" });
      setCars((current) => current.filter((car) => car._id !== carId));
      toast.success("Car deleted successfully.");
    } catch (deleteError) {
      toast.error(deleteError.message || "Failed to delete the car.");
    } finally {
      setDeletingCarId("");
    }
  };

  return (
    <DashboardLayout>
      <div className="mycars-header">
        <h2>My Cars</h2>
        <button type="button" className="add-car-btn" onClick={openModal}>
          <Plus size={18} />
          Add Car
        </button>
      </div>

      {loading ? <p className="cars-page-status">Loading your cars...</p> : null}
      {error && !isAddOpen ? <p className="cars-page-status cars-page-error">{error}</p> : null}

      {!loading && !error && cars.length === 0 ? (
        <div className="cars-empty-state">
          <h3>No cars yet</h3>
          <p>Your landlord account does not have any listed cars yet.</p>
        </div>
      ) : null}

      {!loading && !error && cars.length > 0 ? (
        <div className="cars-table-wrapper">
          <table className="cars-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Year</th>
                <th>Seats</th>
                <th>Price / Day</th>
                <th>Status</th>
                <th>Mileage</th>
                <th>Fuel</th>
                <th>Transmission</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car._id}>
                  <td>
                    {car.primaryImage?.url || car.images?.[0]?.url ? (
                      <img
                        src={car.primaryImage?.url || car.images?.[0]?.url}
                        alt={`${car.year} ${car.make} ${car.model}`}
                        className="car-thumb"
                      />
                    ) : null}
                  </td>
                  <td>{`${car.year} ${car.make} ${car.model}`}</td>
                  <td>{formatLabel(car.category)}</td>
                  <td>{car.year}</td>
                  <td>{car.seats}</td>
                  <td>${Number(car.dailyRate || 0).toFixed(2)}</td>
                  <td>
                    <span className={`status ${(car.status || "unknown").toLowerCase()}`}>
                      {formatLabel(car.status)}
                    </span>
                    {car.statusLocked ? <p className="status-lock-note">Booked now</p> : null}
                  </td>
                  <td>{car.mileage}</td>
                  <td>{formatLabel(car.fuelType)}</td>
                  <td>{formatLabel(car.transmission)}</td>
                  <td className="cars-table-actions">
                    <button type="button" className="table-action-btn" onClick={() => openEditModal(car)}>
                      <Pencil size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="table-action-btn delete"
                      onClick={() => handleDelete(car._id)}
                      disabled={deletingCarId === car._id}
                    >
                      <Trash2 size={16} />
                      <span>{deletingCarId === car._id ? "Deleting..." : "Delete"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {isAddOpen ? (
        <div className="modal-overlay" onClick={(event) => event.target.classList.contains("modal-overlay") && closeModal()}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingCarId ? "Edit Car Details" : "Add New Car"}</h3>
              <button type="button" className="close-btn" onClick={closeModal}>X</button>
            </div>

            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-group form-group-wide form-intro">
                <p>
                  {editingCarId
                    ? "Update your car details here. If the car already has a confirmed or active rental, its status stays locked until that booking period ends."
                    : "Add the basics first. You can list the car without a plate number, and if something is wrong we will tell you exactly what needs fixing."}
                </p>
              </div>

              <div className="form-group">
                <label>Make</label>
                <input name="make" value={formData.make} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Model</label>
                <input name="model" value={formData.model} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Year</label>
                <input type="number" name="year" value={formData.year} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>VIN</label>
                <input name="vin" value={formData.vin} onChange={handleChange} maxLength={17} required />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>{formatLabel(option)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fuel Type</label>
                <select name="fuelType" value={formData.fuelType} onChange={handleChange}>
                  {FUEL_OPTIONS.map((option) => (
                    <option key={option} value={option}>{formatLabel(option)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Transmission</label>
                <select name="transmission" value={formData.transmission} onChange={handleChange}>
                  {TRANSMISSION_OPTIONS.map((option) => (
                    <option key={option} value={option}>{formatLabel(option)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Seats</label>
                <input type="number" name="seats" value={formData.seats} onChange={handleChange} min="1" max="9" required />
              </div>

              <div className="form-group">
                <label>Daily Rate</label>
                <input type="number" name="dailyRate" value={formData.dailyRate} onChange={handleChange} min="0" step="0.01" required />
              </div>

              <div className="form-group">
                <label>City</label>
                <input name="city" value={formData.city} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>State</label>
                <input name="state" value={formData.state} onChange={handleChange} placeholder="Optional" />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} disabled={statusLocked}>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{formatLabel(option)}</option>
                  ))}
                </select>
                {statusLocked ? (
                  <small className="form-help-text">This car has a confirmed or active rental, so its status cannot be changed yet.</small>
                ) : null}
              </div>

              <div className="form-group form-group-wide">
                <label>Features</label>
                <div className="feature-pill-list">
                  {FEATURE_OPTIONS.map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      className={`feature-pill ${formData.features.includes(feature) ? "selected" : ""}`}
                      onClick={() => handleFeatureToggle(feature)}
                    >
                      {formatLabel(feature)}
                    </button>
                  ))}
                </div>
                <small className="form-help-text">Tap the features that match this car.</small>
              </div>

              <div className="form-group form-group-wide">
                <label>Car Photo</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} />
                <small className="form-help-text">Choose a photo from your device. Max size: 5 MB.</small>
                {imagePreview ? (
                  <img src={imagePreview} alt="Car preview" className="car-upload-preview" />
                ) : null}
              </div>

              {error ? <p className="cars-form-error">{error}</p> : null}
              {validationErrors.length > 0 ? (
                <div className="cars-validation-list">
                  {validationErrors.map((item, index) => (
                    <p key={`${item.field || "error"}-${index}`}>
                      {(item.field ? `${formatLabel(item.field.split(".").pop())}: ` : "") + item.message}
                    </p>
                  ))}
                </div>
              ) : null}

              <div className="modal-footer modal-footer-inline">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="save-btn" disabled={submitting}>
                  {submitting ? (editingCarId ? "Saving..." : "Adding...") : editingCarId ? "Save Changes" : "Add Car"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}

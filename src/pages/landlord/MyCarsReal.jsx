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

  const createPayload = () => ({
    make: formData.make.trim(),
    model: formData.model.trim(),
    year: Number(formData.year),
    vin: formData.vin.trim().toUpperCase(),
    licensePlate: formData.licensePlate.trim().toUpperCase(),
    category: formData.category,
    fuelType: formData.fuelType,
    transmission: formData.transmission,
    seats: Number(formData.seats),
    doors: Number(formData.doors),
    color: formData.color.trim(),
    mileage: Number(formData.mileage),
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
      const details = Array.isArray(submitError.details) ? submitError.details : [];
      setValidationErrors(details);
      setError(submitError.message || "Failed to save the car.");
      toast.error(submitError.message || "Failed to save the car.");
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
      await apiCall(`/cars/${deleteDialogCar._id}`, { method: "DELETE" });
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

              <form className="landlord-cars-form" onSubmit={handleSubmit}>
                <div className="landlord-cars-form-grid">
                  <label className="landlord-cars-field">
                    <span>Make</span>
                    <input name="make" value={formData.make} onChange={handleChange} required />
                  </label>

                  <label className="landlord-cars-field">
                    <span>Model</span>
                    <input name="model" value={formData.model} onChange={handleChange} required />
                  </label>

                  <label className="landlord-cars-field">
                    <span>Year</span>
                    <input type="number" name="year" value={formData.year} onChange={handleChange} min="1900" max={new Date().getFullYear() + 1} required />
                  </label>

                  <label className="landlord-cars-field">
                    <span>VIN</span>
                    <input name="vin" value={formData.vin} onChange={handleChange} maxLength={17} required />
                  </label>

                  <label className="landlord-cars-field">
                    <span>License Plate</span>
                    <input name="licensePlate" value={formData.licensePlate} onChange={handleChange} placeholder="Optional" />
                  </label>

                  <label className="landlord-cars-field">
                    <span>Category</span>
                    <select name="category" value={formData.category} onChange={handleChange} required>
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option} value={option}>{formatLabel(option)}</option>
                      ))}
                    </select>
                  </label>

                  <label className="landlord-cars-field">
                    <span>Fuel Type</span>
                    <select name="fuelType" value={formData.fuelType} onChange={handleChange}>
                      {FUEL_OPTIONS.map((option) => (
                        <option key={option} value={option}>{formatLabel(option)}</option>
                      ))}
                    </select>
                  </label>

                  <label className="landlord-cars-field">
                    <span>Transmission</span>
                    <select name="transmission" value={formData.transmission} onChange={handleChange}>
                      {TRANSMISSION_OPTIONS.map((option) => (
                        <option key={option} value={option}>{formatLabel(option)}</option>
                      ))}
                    </select>
                  </label>

                  <label className="landlord-cars-field">
                    <span>Seats</span>
                    <input type="number" name="seats" value={formData.seats} onChange={handleChange} min="1" max="9" required />
                  </label>

                  <label className="landlord-cars-field">
                    <span>Doors</span>
                    <input type="number" name="doors" value={formData.doors} onChange={handleChange} min="2" max="5" required />
                  </label>

                  <label className="landlord-cars-field">
                    <span>Color</span>
                    <input name="color" value={formData.color} onChange={handleChange} placeholder="Optional" />
                  </label>

                  <label className="landlord-cars-field">
                    <span>Mileage</span>
                    <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} min="0" />
                  </label>

                  <label className="landlord-cars-field">
                    <span>Daily Rate</span>
                    <input type="number" name="dailyRate" value={formData.dailyRate} onChange={handleChange} min="0" step="0.01" required />
                  </label>

                  <label className="landlord-cars-field">
                    <span>City</span>
                    <input name="city" value={formData.city} onChange={handleChange} required />
                  </label>

                  <label className="landlord-cars-field">
                    <span>State</span>
                    <input name="state" value={formData.state} onChange={handleChange} placeholder="Optional" />
                  </label>

                  <label className="landlord-cars-field">
                    <span>Status</span>
                    <select name="status" value={formData.status} onChange={handleChange} disabled={statusLocked}>
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
                    <div className="landlord-cars-validation-list">
                      {validationErrors.map((item, index) => (
                        <p key={`${item.field || "error"}-${index}`}>
                          {(item.field ? `${formatLabel(item.field.split(".").pop())}: ` : "") + item.message}
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

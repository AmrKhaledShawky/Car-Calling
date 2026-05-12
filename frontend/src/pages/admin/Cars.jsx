import React, { useCallback, useEffect, useState } from "react";
import {
  CarFront,
  LoaderCircle,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
  Wrench,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";
import { toast } from "react-toastify";
import "./Cars.css";

const getCarId = (car) => car?._id || car?.id;
const getOwnerId = (car) => car?.owner?._id || car?.owner?.id || car?.owner;

const formatStatus = (value) => {
  if (!value) {
    return "Unknown";
  }

  return value
    .toString()
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getCarName = (car) =>
  `${car?.year || ""} ${car?.make || ""} ${car?.model || ""}`.trim() || "Unknown Car";

const getStatusClass = (car) => (car?.status || "unknown").toLowerCase();

const Cars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialogCar, setDeleteDialogCar] = useState(null);
  const [deletingCarId, setDeletingCarId] = useState("");

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiCall("/admin/cars");
      setCars(response.data || []);
    } catch (loadError) {
      const errorMsg = loadError.message || "Failed to load cars.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  useEffect(() => {
    if (!deleteDialogCar) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !deletingCarId) {
        setDeleteDialogCar(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteDialogCar, deletingCarId]);

  const closeDeleteDialog = () => {
    if (deletingCarId) {
      return;
    }

    setDeleteDialogCar(null);
  };

  const deleteCar = async (car) => {
    const id = getCarId(car);

    if (!id) {
      toast.error("Car id is missing.");
      return;
    }

    try {
      setDeletingCarId(id);
      await apiCall(`/admin/cars/${id}`, { method: "DELETE" });
      toast.success("Car deleted successfully!");
      setCars((currentCars) => currentCars.filter((currentCar) => getCarId(currentCar) !== id));
      setDeleteDialogCar(null);
    } catch (deleteError) {
      toast.error("Failed to delete car: " + deleteError.message);
    } finally {
      setDeletingCarId("");
    }
  };

  const handleEdit = (id) => {
    navigate(`/editcar/${id}`);
  };

  const handleAddCar = () => {
    navigate("/addcar");
  };

  const totalCars = cars.length;
  const availableCars = cars.filter((car) => getStatusClass(car) === "available").length;
  const ownersCount = new Set(cars.map((car) => getOwnerId(car)).filter(Boolean)).size;
  const attentionCars = cars.filter((car) => ["maintenance", "inactive"].includes(getStatusClass(car))).length;

  return (
    <AdminLayout>
      <div className="cars-content">
        <div className="cars-header">
          <div className="cars-header-copy">
            <h2>Cars Management</h2>
            <p>Track listings, watch ownership coverage, and handle edits or removals with the same cleaner admin workflow.</p>
          </div>
          <button className="cars-add-btn" onClick={handleAddCar}>
            <Plus size={18} />
            Add Car
          </button>
        </div>

        {!loading && !error ? (
          <div className="cars-metrics" aria-label="Cars summary">
            <article className="cars-metric-card">
              <div className="cars-metric-icon">
                <CarFront size={18} />
              </div>
              <div>
                <span>Total cars</span>
                <strong>{totalCars}</strong>
              </div>
            </article>
            <article className="cars-metric-card">
              <div className="cars-metric-icon success">
                <ShieldCheck size={18} />
              </div>
              <div>
                <span>Available now</span>
                <strong>{availableCars}</strong>
              </div>
            </article>
            <article className="cars-metric-card">
              <div className="cars-metric-icon info">
                <Users size={18} />
              </div>
              <div>
                <span>Managed owners</span>
                <strong>{ownersCount}</strong>
              </div>
            </article>
            <article className="cars-metric-card">
              <div className="cars-metric-icon alert">
                <Wrench size={18} />
              </div>
              <div>
                <span>Needs attention</span>
                <strong>{attentionCars}</strong>
              </div>
            </article>
          </div>
        ) : null}

        {loading ? <div className="cars-loading">Loading cars...</div> : null}
        {error ? <div className="cars-error">{error}</div> : null}

        {!loading && !error ? (
          <div className="cars-table-card">
            <div className="cars-table-scroll">
              <table className="cars-table">
                <thead>
                  <tr>
                    <th>Car</th>
                    <th>Model</th>
                    <th>Plate Number</th>
                    <th>Belongs To</th>
                    <th>Usage</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => {
                    const carId = getCarId(car);
                    const isDeleting = deletingCarId === carId;
                    const statusClass = getStatusClass(car);

                    return (
                      <tr key={carId}>
                        <td>{getCarName(car)}</td>
                        <td>{car.model || "N/A"}</td>
                        <td>{car.licensePlate || "N/A"}</td>
                        <td>
                          <div className="cars-owner-cell">
                            {car.owner?.avatar ? (
                              <img
                                src={car.owner.avatar}
                                alt={car.owner.name}
                                className="cars-owner-avatar"
                              />
                            ) : (
                              <div className="cars-owner-avatar-placeholder">
                                {car.owner?.name?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                            )}
                            <div className="cars-owner-copy">
                              <strong>{car.owner?.name || "Unknown owner"}</strong>
                              <span>{car.owner?.email || "No owner email"}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="cars-usage-cell">
                            <span>{car.bookingCount || 0} bookings</span>
                            <span>${Number(car.dailyRate || 0).toFixed(2)} / day</span>
                          </div>
                        </td>
                        <td>
                          <span className={`cars-status-badge ${statusClass}`}>
                            {formatStatus(car.status)}
                          </span>
                        </td>
                        <td className="cars-actions">
                          <button
                            className="cars-action-btn edit"
                            title="Edit car details"
                            aria-label={`Edit ${getCarName(car)}`}
                            onClick={() => handleEdit(carId)}
                          >
                            <Pencil size={16} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="cars-action-btn delete"
                            title="Delete this car"
                            aria-label={`Delete ${getCarName(car)}`}
                            onClick={() => setDeleteDialogCar(car)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? <LoaderCircle size={16} className="cars-spin" /> : <Trash2 size={16} />}
                            <span>{isDeleting ? "Deleting" : "Delete"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {cars.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={7} className="cars-no-data">
                        No cars found.
                        <button className="cars-add-inline" onClick={handleAddCar}>Add first car</button>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {deleteDialogCar ? (
          <div className="cars-dialog-backdrop" role="presentation" onClick={closeDeleteDialog}>
            <div
              className="cars-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cars-dialog-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="cars-dialog-close"
                onClick={closeDeleteDialog}
                aria-label="Close confirmation dialog"
                disabled={Boolean(deletingCarId)}
              >
                <X size={18} />
              </button>

              <div className="cars-dialog-icon danger">
                <Trash2 size={22} />
              </div>

              <div className="cars-dialog-copy">
                <p className="cars-dialog-kicker">Confirm action</p>
                <h3 id="cars-dialog-title">Delete {getCarName(deleteDialogCar)}?</h3>
                <p>
                  This removes the listing from the admin cars page. Cars with confirmed or active bookings cannot be deleted, so review the usage details before continuing.
                </p>
              </div>

              <div className="cars-dialog-car">
                <div className="cars-dialog-car-avatar">
                  <CarFront size={20} />
                </div>
                <div className="cars-dialog-car-copy">
                  <strong>{getCarName(deleteDialogCar)}</strong>
                  <span>{deleteDialogCar.licensePlate || "No plate number"}</span>
                </div>
                <div className="cars-dialog-badges">
                  <span className={`cars-status-badge ${getStatusClass(deleteDialogCar)}`}>
                    {formatStatus(deleteDialogCar.status)}
                  </span>
                  <span className="cars-info-badge">{deleteDialogCar.bookingCount || 0} bookings</span>
                </div>
              </div>

              <div className="cars-dialog-owner">
                <strong>Owner</strong>
                <span>{deleteDialogCar.owner?.name || "Unknown owner"}</span>
                <span>{deleteDialogCar.owner?.email || "No owner email"}</span>
              </div>

              <div className="cars-dialog-actions">
                <button
                  type="button"
                  className="cars-dialog-btn secondary"
                  onClick={closeDeleteDialog}
                  disabled={Boolean(deletingCarId)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="cars-dialog-btn danger"
                  onClick={() => deleteCar(deleteDialogCar)}
                  disabled={Boolean(deletingCarId)}
                >
                  {deletingCarId === getCarId(deleteDialogCar) ? "Deleting..." : "Delete car"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default Cars;

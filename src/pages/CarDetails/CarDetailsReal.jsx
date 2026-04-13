import React, { useEffect, useMemo, useState } from "react";
import {
  Star,
  Share2,
  Heart,
  MapPin,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { apiCall } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import "./CarDetails.css";

const getCarImage = (car) => car?.primaryImage?.url || car?.images?.[0]?.url || "";

const getTomorrowDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};

const getDefaultEndDate = () => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 3);
  return endDate.toISOString().split("T")[0];
};

const formatCurrency = (value) => `E£ ${Number(value || 0).toFixed(2)}`;

export default function CarDetailsReal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [activeImg, setActiveImg] = useState(0);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookingResult, setBookingResult] = useState(null);
  const [formData, setFormData] = useState({
    startDate: getTomorrowDate(),
    endDate: getDefaultEndDate(),
    insuranceType: "basic",
    gps: false,
    childSeat: false,
    additionalDriver: false,
    specialRequests: "",
  });

  useEffect(() => {
    const loadCar = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiCall(`/cars/${id}`);
        setCar(response.data);
      } catch (fetchError) {
        setError(fetchError.message || "Failed to load the selected car.");
      } finally {
        setLoading(false);
      }
    };

    loadCar();
  }, [id]);

  useEffect(() => {
    if (location.state?.message) {
      toast.info(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const bookingPreview = useMemo(() => {
    if (!car) return null;

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const isValidRange =
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(endDate.getTime()) &&
      endDate > startDate;

    const duration = isValidRange
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      : 0;

    const subtotal = Number(car.dailyRate || 0) * duration;
    const serviceFee = subtotal * 0.05;
    const insuranceFee =
      formData.insuranceType === "premium"
        ? duration * 20
        : formData.insuranceType === "basic"
          ? duration * 10
          : 0;
    const extras =
      (formData.gps ? 10 : 0) +
      (formData.childSeat ? 15 : 0) +
      (formData.additionalDriver ? 25 : 0);
    const tax = (subtotal + serviceFee + insuranceFee + extras) * 0.1;

    return {
      duration,
      subtotal,
      serviceFee,
      insuranceFee,
      extras,
      tax,
      totalAmount: subtotal + serviceFee + insuranceFee + extras + tax,
      isValidRange,
    };
  }, [car, formData]);

  const images = useMemo(
    () => (car?.images?.length ? car.images.map((image) => image.url) : []),
    [car]
  );

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBooking = async () => {
    if (!car) return;

    if (!isAuthenticated) {
      navigate("/auth/register", {
        state: {
          message: "Create an account first to send a booking request and track your rental.",
          redirectTo: `/car/${id}`,
        },
      });
      return;
    }

    if (!bookingPreview?.isValidRange || bookingPreview.duration < 1) {
      toast.error("Please choose a valid booking date range.");
      return;
    }

    if (car.owner?._id === user?._id || car.owner?.id === user?._id) {
      toast.error("You cannot rent your own car.");
      return;
    }

    const additionalServices = [];
    if (formData.gps) additionalServices.push({ name: "gps", quantity: 1 });
    if (formData.childSeat) additionalServices.push({ name: "child_seat", quantity: 1 });
    if (formData.additionalDriver) additionalServices.push({ name: "additional_driver", quantity: 1 });

    try {
      setSubmitting(true);
      const response = await apiCall("/bookings", {
        method: "POST",
        body: JSON.stringify({
          car: car._id,
          startDate: formData.startDate,
          endDate: formData.endDate,
          insuranceType: formData.insuranceType,
          additionalServices,
          specialRequests: formData.specialRequests.trim(),
        }),
      });

      setBookingResult(response.data);
      toast.success("Booking request created successfully.");
    } catch (bookingError) {
      const detailMessage = Array.isArray(bookingError.details) && bookingError.details.length > 0
        ? bookingError.details[0].message
        : "";
      toast.error(detailMessage || bookingError.message || "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="car-details-page">
        <Navbar />
        <div className="car-details-container">
          <p className="car-page-status">Loading car details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="car-details-page">
        <Navbar />
        <div className="car-details-container">
          <p className="car-page-status car-page-error">{error || "Car not found."}</p>
          <Link to="/browse-cars" className="back-link">Back to browse cars</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="car-details-page">
      <Navbar />

      <div className="car-details-container">
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <Link to="/browse-cars">Available Cars</Link>
          <ChevronRight size={14} />
          <span className="current">{car.year} {car.make} {car.model}</span>
        </nav>

        <div className="car-main-layout">
          <div className="car-info-column">
            <section className="gallery-section">
              <div className="main-image-container">
                {images.length ? (
                  <img
                    src={images[activeImg] || images[0]}
                    alt={`${car.make} ${car.model}`}
                    className="main-image"
                  />
                ) : (
                  <div className="main-image car-image-fallback">No image available</div>
                )}
                <button className="wishlist-btn" type="button" aria-label="Save car">
                  <Heart size={20} />
                </button>
              </div>

              {images.length > 1 ? (
                <div className="thumbnail-grid">
                  {images.slice(0, 4).map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className={`thumbnail-item ${activeImg === index ? "active" : ""}`}
                      onClick={() => setActiveImg(index)}
                    >
                      <img src={image} alt={`${car.make} ${car.model} ${index + 1}`} />
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="details-section">
              <h2 className="section-title">Features</h2>
              <div className="features-grid">
                {(car.features?.length ? car.features : ["No extra features listed"]).map((feature) => (
                  <div key={feature} className="feature-chip">
                    <span className="feature-icon"><ShieldCheck size={16} /></span>
                    <span className="feature-name">{feature}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="details-section">
              <div className="reviews-header">
                <h2 className="section-title">Car Details</h2>
                <div className="overall-rating">
                  <Star size={18} fill="#f59e0b" color="#f59e0b" />
                  <span className="rating-val">{Number(car.averageRating || 0).toFixed(1)}</span>
                  <span className="rating-count">({car.totalReviews || 0} reviews)</span>
                </div>
              </div>

              <div className="review-card">
                <div className="details-copy-grid">
                  <p><strong>Category:</strong> {car.category}</p>
                  <p><strong>Color:</strong> {car.color}</p>
                  <p><strong>VIN:</strong> {car.vin}</p>
                  <p><strong>License Plate:</strong> {car.licensePlate}</p>
                  <p><strong>Condition:</strong> {car.condition}</p>
                  <p><strong>Location:</strong> {car.location?.address}</p>
                </div>
                {car.notes ? <p className="comment-text">{car.notes}</p> : null}
              </div>
            </section>
          </div>

          <div className="car-sidebar-column">
            <div className="sticky-booking-card">
              <div className="title-share">
                <h1>{car.year} {car.make} {car.model}</h1>
                <button className="share-icon-btn" type="button" aria-label="Share car">
                  <Share2 size={20} />
                </button>
              </div>

              <div className="price-tag">
                <span className="currency">E£</span>
                <span className="price">{car.dailyRate}</span>
                <span className="per-day">/ day</span>
              </div>

              <div className="quick-specs-grid">
                <div className="spec-item"><span className="spec-label">YEAR</span><span className="spec-value">{car.year}</span></div>
                <div className="spec-item"><span className="spec-label">MILEAGE</span><span className="spec-value">{car.mileage} km</span></div>
                <div className="spec-item"><span className="spec-label">TRANSMISSION</span><span className="spec-value">{car.transmission}</span></div>
                <div className="spec-item"><span className="spec-label">FUEL</span><span className="spec-value">{car.fuelType}</span></div>
                <div className="spec-item"><span className="spec-label">SEATS</span><span className="spec-value">{car.seats}</span></div>
                <div className="spec-item"><span className="spec-label">STATUS</span><span className="spec-value">{car.status}</span></div>
              </div>

              <div className="description-box">
                <h3>Description</h3>
                <p>
                  {car.make} {car.model} is available from {car.location?.city}, {car.location?.state}.
                  Pricing is calculated server-side when you submit the booking.
                </p>
              </div>

              <div className="landlord-small-card">
                <div className="landlord-flex">
                  <div className="l-avatar l-avatar-fallback">{car.owner?.name?.charAt(0) || "L"}</div>
                  <div className="l-info">
                    <div className="l-name-badge">
                      <h4>{car.owner?.name || "Landlord"}</h4>
                      {car.owner?.isVerifiedLandlord ? <CheckCircle size={14} className="v-icon" /> : null}
                    </div>
                    <div className="l-stats">
                      <MapPin size={12} />
                      <span>{car.location?.city}, {car.location?.state}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="booking-form">
                <div className="booking-field-grid">
                  <label className="booking-field">
                    <span>Start date</span>
                    <input type="date" name="startDate" value={formData.startDate} min={getTomorrowDate()} onChange={handleInputChange} />
                  </label>
                  <label className="booking-field">
                    <span>End date</span>
                    <input type="date" name="endDate" value={formData.endDate} min={formData.startDate || getTomorrowDate()} onChange={handleInputChange} />
                  </label>
                </div>

                <label className="booking-field">
                  <span>Insurance</span>
                  <select name="insuranceType" value={formData.insuranceType} onChange={handleInputChange}>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="none">None</option>
                  </select>
                </label>

                <div className="service-options">
                  <label><input type="checkbox" name="gps" checked={formData.gps} onChange={handleInputChange} /> GPS</label>
                  <label><input type="checkbox" name="childSeat" checked={formData.childSeat} onChange={handleInputChange} /> Child seat</label>
                  <label><input type="checkbox" name="additionalDriver" checked={formData.additionalDriver} onChange={handleInputChange} /> Additional driver</label>
                </div>

                <label className="booking-field">
                  <span>Special requests</span>
                  <textarea
                    name="specialRequests"
                    rows="3"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Pickup timing, notes, or anything the owner should know."
                  />
                </label>

                {bookingPreview ? (
                  <div className="pricing-preview">
                    <div><span>Duration</span><strong>{bookingPreview.duration || 0} day(s)</strong></div>
                    <div><span>Subtotal</span><strong>{formatCurrency(bookingPreview.subtotal)}</strong></div>
                    <div><span>Service fee</span><strong>{formatCurrency(bookingPreview.serviceFee)}</strong></div>
                    <div><span>Insurance</span><strong>{formatCurrency(bookingPreview.insuranceFee)}</strong></div>
                    <div><span>Extras</span><strong>{formatCurrency(bookingPreview.extras)}</strong></div>
                    <div><span>Tax</span><strong>{formatCurrency(bookingPreview.tax)}</strong></div>
                    <div className="pricing-total"><span>Total</span><strong>{formatCurrency(bookingPreview.totalAmount)}</strong></div>
                  </div>
                ) : null}

                <button className="action-rent-btn" type="button" onClick={handleBooking} disabled={submitting}>
                  {submitting ? "Submitting..." : isAuthenticated ? "Rent Now" : "Sign Up To Rent"}
                  <ArrowRight size={20} className="r-arrow" />
                </button>
              </div>

              {bookingResult ? (
                <div className="booking-success-card">
                  <h3>Booking Created</h3>
                  <p>Reference: {bookingResult.bookingReference}</p>
                  <p>Status: {bookingResult.status}</p>
                  <p>Total: {formatCurrency(bookingResult.pricing?.totalAmount)}</p>
                </div>
              ) : null}

              <p className="cancellation-note">
                {isAuthenticated
                  ? "Your booking is saved as pending until the owner confirms it."
                  : "Visitors must create an account before sending a booking request."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

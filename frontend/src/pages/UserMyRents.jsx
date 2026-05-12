import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { apiCall } from "../utils/api";
import "./userPages.css";

const CANCELLATION_WINDOW_HOURS = 48;

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
};

const formatMoney = (value) => `E£ ${Number(value || 0).toFixed(2)}`;

const formatLabel = (value) => {
  if (!value) return "N/A";
  return value.replaceAll("_", " ");
};

const canCancelBooking = (booking) => {
  if (!booking || !["pending", "confirmed"].includes(booking.status)) {
    return false;
  }

  const startDate = new Date(booking.startDate);

  if (Number.isNaN(startDate.getTime())) {
    return false;
  }

  return startDate.getTime() - Date.now() >= CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000;
};

export default function UserMyRents() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeBookingId, setActiveBookingId] = useState("");

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiCall("/private/bookings");
      setBookings(response.data || []);
    } catch (fetchError) {
      setError(fetchError.message || "Failed to load your rentals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const cancelBooking = async (bookingId) => {
    try {
      setActiveBookingId(bookingId);
      await apiCall(`/private/bookings/${bookingId}/cancel`, {
        method: "PUT",
        body: JSON.stringify({ reason: "customer_request" }),
      });
      toast.success("Booking cancelled successfully.");
      await loadBookings();
    } catch (requestError) {
      toast.error(requestError.message || "Failed to cancel booking.");
    } finally {
      setActiveBookingId("");
    }
  };

  return (
    <div className="user-page-shell">
      <Navbar />
      <main className="user-page-container">
        <div className="user-page-header">
          <h1>My Rents</h1>
          <p>Track your pending, confirmed, and completed bookings in one place.</p>
        </div>

        {loading ? <p className="user-page-status">Loading your rentals...</p> : null}
        {error ? <p className="user-page-status user-page-error">{error}</p> : null}

        {!loading && !error && bookings.length === 0 ? (
          <div className="user-empty-state">
            <h2>No bookings yet</h2>
            <p>Your rentals will appear here once you book a car.</p>
            <Link to="/browse-cars" className="user-primary-link">Browse Cars</Link>
          </div>
        ) : null}

        {!loading && !error && bookings.length > 0 ? (
          <div className="user-card-grid">
            {bookings.map((booking) => (
              <article key={booking._id} className="user-card">
                <div className="user-card-top">
                  <div>
                    <h2>{booking.car?.year} {booking.car?.make} {booking.car?.model}</h2>
                    <p>{booking.bookingReference}</p>
                  </div>
                  <span className={`booking-status booking-status-${booking.status}`}>
                    {formatLabel(booking.status)}
                  </span>
                </div>

                <div className="user-card-details">
                  <p><strong>From:</strong> {formatDate(booking.startDate)}</p>
                  <p><strong>To:</strong> {formatDate(booking.endDate)}</p>
                  <p><strong>Total:</strong> {formatMoney(booking.totalAmount)}</p>
                  <p><strong>Owner:</strong> {booking.owner?.name || booking.owner?.email || "N/A"}</p>
                  {booking.confirmedAt ? <p><strong>Confirmed:</strong> {formatDate(booking.confirmedAt)}</p> : null}
                  {booking.completedAt ? <p><strong>Completed:</strong> {formatDate(booking.completedAt)}</p> : null}
                  {booking.cancelledAt ? <p><strong>Cancelled:</strong> {formatDate(booking.cancelledAt)}</p> : null}
                  {booking.cancellationReason ? <p><strong>Reason:</strong> {formatLabel(booking.cancellationReason)}</p> : null}
                </div>

                {canCancelBooking(booking) ? (
                  <div className="user-card-actions">
                    <button
                      type="button"
                      className="user-secondary-button"
                      onClick={() => cancelBooking(booking._id)}
                      disabled={activeBookingId === booking._id}
                    >
                      {activeBookingId === booking._id ? "Cancelling..." : "Cancel booking"}
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

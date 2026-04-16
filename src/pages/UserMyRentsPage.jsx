import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { apiCall } from "../utils/api";
import "./userPages.css";

const CANCELLABLE_STATUSES = ["pending", "confirmed", "active"];

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
};

const formatMoney = (value) => `EGP ${Number(value || 0).toFixed(2)}`;

const formatLabel = (value) => {
  if (!value) return "N/A";
  return value.replaceAll("_", " ");
};

const canCancelBooking = (booking) => Boolean(booking && CANCELLABLE_STATUSES.includes(booking.status));

const hasPenalty = (booking) => ["confirmed", "active"].includes(booking?.status);

const getPenaltyAmount = (booking) => (hasPenalty(booking) ? Number(booking?.totalAmount || 0) * 0.1 : 0);

export default function UserMyRentsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeBookingId, setActiveBookingId] = useState("");
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancellationDetails, setCancellationDetails] = useState("");

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiCall("/bookings/my-bookings");
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

  const openCancellationDialog = (booking) => {
    setBookingToCancel(booking);
    setCancellationDetails("");
  };

  const closeCancellationDialog = () => {
    if (activeBookingId) {
      return;
    }

    setBookingToCancel(null);
    setCancellationDetails("");
  };

  const cancelBooking = async () => {
    if (!bookingToCancel) {
      return;
    }

    const trimmedReason = cancellationDetails.trim();

    if (!trimmedReason) {
      toast.error("Please enter the reason for cancellation.");
      return;
    }

    try {
      setActiveBookingId(bookingToCancel._id);
      const response = await apiCall(`/bookings/${bookingToCancel._id}/cancel`, {
        method: "PUT",
        body: JSON.stringify({
          reason: "customer_request",
          cancellationDetails: trimmedReason,
        }),
      });

      const penaltyAmount = Number(response?.data?.cancellationFee || 0);
      toast.success(
        penaltyAmount > 0
          ? `Booking cancelled. Penalty applied: ${formatMoney(penaltyAmount)}`
          : "Booking cancelled successfully with no penalty."
      );

      await loadBookings();
      closeCancellationDialog();
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
                  {booking.cancellationDetails ? <p><strong>Your note:</strong> {booking.cancellationDetails}</p> : null}
                  {booking.status === "cancelled" ? <p><strong>Penalty:</strong> {formatMoney(booking.cancellationFee)}</p> : null}
                </div>

                {canCancelBooking(booking) ? (
                  <div className="user-card-actions">
                    <p className={`user-cancel-note ${hasPenalty(booking) ? "user-cancel-note-warning" : ""}`}>
                      {hasPenalty(booking)
                        ? `This rental was approved. Cancelling now applies a ${formatMoney(getPenaltyAmount(booking))} penalty.`
                        : "Pending rentals can be cancelled without a penalty."}
                    </p>
                    <button
                      type="button"
                      className="user-secondary-button"
                      onClick={() => openCancellationDialog(booking)}
                      disabled={activeBookingId === booking._id}
                    >
                      {activeBookingId === booking._id ? "Cancelling..." : "Cancel rental"}
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}

        {bookingToCancel ? (
          <div className="user-modal-backdrop" role="presentation" onClick={closeCancellationDialog}>
            <div
              className="user-modal-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cancel-rental-title"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="cancel-rental-title">Cancel Rental</h2>
              <p>
                {bookingToCancel.car?.year} {bookingToCancel.car?.make} {bookingToCancel.car?.model}
              </p>

              <div className={`user-modal-alert ${hasPenalty(bookingToCancel) ? "warning" : "success"}`}>
                {hasPenalty(bookingToCancel)
                  ? `This rental was already approved by the landlord. If you continue, a penalty of ${formatMoney(getPenaltyAmount(bookingToCancel))} will be charged.`
                  : "This rental is still waiting for landlord approval, so you can cancel it with no penalty."}
              </div>

              <label className="user-modal-field" htmlFor="cancellation-details">
                Reason for cancellation
              </label>
              <textarea
                id="cancellation-details"
                className="user-modal-textarea"
                value={cancellationDetails}
                onChange={(event) => setCancellationDetails(event.target.value)}
                placeholder="Tell us why you want to cancel this rental."
                rows={4}
                maxLength={500}
              />

              <div className="user-modal-actions">
                <button type="button" className="user-secondary-button" onClick={closeCancellationDialog} disabled={Boolean(activeBookingId)}>
                  Keep booking
                </button>
                <button
                  type="button"
                  className="user-primary-button"
                  onClick={cancelBooking}
                  disabled={activeBookingId === bookingToCancel._id}
                >
                  {activeBookingId === bookingToCancel._id ? "Cancelling..." : "Confirm cancellation"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

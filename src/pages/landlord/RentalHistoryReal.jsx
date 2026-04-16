import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiCall } from "../../utils/api";
import "./rentalHistory.css";

const HISTORY_FILTERS = [
  { id: "all", label: "All History" },
  { id: "active", label: "Active" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
  { id: "rejected", label: "Rejected" }
];

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
};

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

const formatStatus = (value) => {
  if (!value) return "Unknown";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getHistoryStatusClass = (booking) => (booking.status || "unknown").toLowerCase();

export default function RentalHistoryReal() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiCall("/bookings/owner-bookings?limit=100");
        setBookings(response.data || []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load rental history.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const historyBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        if (["confirmed", "active", "completed", "rejected"].includes(booking.status)) {
          return true;
        }
        return false;
      }),
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") {
      return historyBookings;
    }

    if (activeFilter === "active") {
      return historyBookings.filter((booking) => booking.status === "active");
    }

    if (activeFilter === "confirmed") {
      return historyBookings.filter((booking) => booking.status === "confirmed");
    }

    if (activeFilter === "completed") {
      return historyBookings.filter((booking) => booking.status === "completed");
    }

    if (activeFilter === "rejected") {
      return historyBookings.filter((booking) => booking.status === "rejected");
    }

    return historyBookings;
  }, [activeFilter, historyBookings]);

  const stats = useMemo(
    () => ({
      active: historyBookings.filter((booking) => booking.status === "active").length,
      confirmed: historyBookings.filter((booking) => booking.status === "confirmed").length,
      completed: historyBookings.filter((booking) => booking.status === "completed").length,
      rejected: historyBookings.filter((booking) => booking.status === "rejected").length
    }),
    [historyBookings]
  );

  return (
    <DashboardLayout>
      <div className="history-header">
        <div>
          <h2>Rental History</h2>
          <p>Track the confirmed, active, completed, and rejected bookings for your cars.</p>
        </div>
      </div>

      {loading ? <p className="history-page-status">Loading rental history...</p> : null}
      {error ? <p className="history-page-status history-page-error">{error}</p> : null}

      {!loading && !error ? (
        <>
          <div className="history-stats-grid">
            <div className="history-stat-card">
              <span>Active Rentals</span>
              <strong>{stats.active}</strong>
            </div>
            <div className="history-stat-card">
              <span>Confirmed Rentals</span>
              <strong>{stats.confirmed}</strong>
            </div>
            <div className="history-stat-card">
              <span>Completed Rentals</span>
              <strong>{stats.completed}</strong>
            </div>
            <div className="history-stat-card">
              <span>Rejected Requests</span>
              <strong>{stats.rejected}</strong>
            </div>
          </div>

          <div className="history-filter-row">
            {HISTORY_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`history-filter-btn ${activeFilter === filter.id ? "active" : ""}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="history-empty-state">
              <h3>No rentals in this section</h3>
              <p>Once bookings are confirmed, active, completed, or rejected, they will appear here.</p>
            </div>
          ) : (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Car</th>
                    <th>Pickup</th>
                    <th>Return</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{booking.customer?.name || booking.customer?.email || "Unknown customer"}</td>
                      <td>{`${booking.car?.year || ""} ${booking.car?.make || ""} ${booking.car?.model || ""}`.trim()}</td>
                      <td>{formatDate(booking.startDate)}</td>
                      <td>{formatDate(booking.endDate)}</td>
                      <td>{formatMoney(booking.totalAmount)}</td>
                      <td>
                        <span className={`status ${getHistoryStatusClass(booking)}`}>
                          {formatStatus(booking.status)}
                        </span>
                      </td>
                      <td>{formatDate(booking.updatedAt || booking.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { apiCall } from "../../utils/api";
import { Link } from "react-router-dom";
import "./rentalRequests.css";

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

export default function RentalRequestsReal() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiCall("/bookings/owner-bookings?status=pending");
      setRequests(response.data || []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load rental requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const approveRequest = async (id) => {
    try {
      setActiveId(id);
      await apiCall(`/bookings/${id}/confirm`, { method: "PUT" });
      toast.success("Rental request approved.");
      await loadRequests();
    } catch (requestError) {
      toast.error(requestError.message || "Failed to approve request.");
    } finally {
      setActiveId("");
    }
  };

  const rejectRequest = async (id) => {
    try {
      setActiveId(id);
      await apiCall(`/bookings/${id}/cancel`, {
        method: "PUT",
        body: JSON.stringify({ reason: "owner_rejected" }),
      });
      toast.success("Rental request rejected.");
      await loadRequests();
    } catch (requestError) {
      toast.error(requestError.message || "Failed to reject request.");
    } finally {
      setActiveId("");
    }
  };

  return (
    <DashboardLayout>
      <div className="requests-header">
        <div>
          <h2>Rental Requests</h2>
          <p>Approve or reject new booking requests for your cars.</p>
        </div>
        <Link to="/landlord/rental-history" className="requests-history-link">
          View History
        </Link>
      </div>

      {loading ? <p className="requests-page-status">Loading rental requests...</p> : null}
      {error ? <p className="requests-page-status requests-page-error">{error}</p> : null}

      {!loading && !error && requests.length === 0 ? (
        <div className="requests-empty-state">
          <h3>No pending requests</h3>
          <p>New booking requests for your cars will appear here.</p>
        </div>
      ) : null}

      {!loading && !error && requests.length > 0 ? (
        <div className="requests-table-wrapper">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Car</th>
                <th>Pickup</th>
                <th>Return</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.customer?.name || request.customer?.email || "Unknown customer"}</td>
                  <td>{`${request.car?.year || ""} ${request.car?.make || ""} ${request.car?.model || ""}`.trim()}</td>
                  <td>{formatDate(request.startDate)}</td>
                  <td>{formatDate(request.endDate)}</td>
                  <td>{formatMoney(request.totalAmount)}</td>
                  <td>
                    <span className={`status ${(request.status || "unknown").toLowerCase()}`}>
                      {formatStatus(request.status)}
                    </span>
                  </td>
                  <td className="actions">
                    {request.status === "pending" ? (
                      <>
                        <Check
                          size={18}
                          className="approve-icon"
                          onClick={() => approveRequest(request._id)}
                          aria-disabled={activeId === request._id}
                        />
                        <X
                          size={18}
                          className="reject-icon"
                          onClick={() => rejectRequest(request._id)}
                          aria-disabled={activeId === request._id}
                        />
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </DashboardLayout>
  );
}

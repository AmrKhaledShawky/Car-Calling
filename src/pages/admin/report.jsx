import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";
import "./report.css";
import { FaEye } from "react-icons/fa";

const buildReports = (bookings = []) =>
  bookings
    .filter((booking) => booking.cancellationReason || booking.specialRequests || booking.returnCondition?.damageReported)
    .map((booking) => ({
      id: booking._id,
      userName: booking.customer?.name || "Unknown user",
      userEmail: booking.customer?.email || "N/A",
      userPhone: booking.customer?.phone || "N/A",
      carModel: `${booking.car?.make || ""} ${booking.car?.model || ""}`.trim() || "Unknown car",
      tripFrom: booking.pickupLocation?.address || booking.car?.location?.city || "Owner location",
      tripTo: booking.returnLocation?.address || booking.car?.location?.city || "Owner location",
      reason: booking.cancellationReason || (booking.returnCondition?.damageReported ? "damage_reported" : "special_request"),
      reportText: booking.specialRequests || booking.returnCondition?.damageDescription || "Booking flagged for admin review.",
      createdAt: booking.createdAt,
      status: booking.status
    }));

const AdminReports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiCall("/admin/bookings");
        setReports(buildReports(response.data || []));
      } catch (loadError) {
        setError(loadError.message || "Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const reportSummary = useMemo(() => reports.length, [reports]);

  return (
    <AdminLayout>
      <div className="reports-container">
        {loading ? <p>Loading reports...</p> : null}
        {error ? <p>{error}</p> : null}
        {!loading && !error ? (
          <>
            <p style={{ marginBottom: 16 }}>Live booking-related reports found: {reportSummary}</p>
            <table className="reports-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Car</th>
                  <th>Trip</th>
                  <th>Reason</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.userName}</td>
                    <td>{report.userEmail}</td>
                    <td>{report.userPhone}</td>
                    <td>{report.carModel}</td>
                    <td>{report.tripFrom} - {report.tripTo}</td>
                    <td>{report.reason}</td>
                    <td>
                      <button className="view-btn" onClick={() => setSelectedReport(report)}>
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No live reports found in the database.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </>
        ) : null}

        {selectedReport ? (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Report by {selectedReport.userName}</h3>
              <p><b>Email:</b> {selectedReport.userEmail}</p>
              <p><b>Phone:</b> {selectedReport.userPhone}</p>
              <p><b>Car:</b> {selectedReport.carModel}</p>
              <p><b>Trip:</b> {selectedReport.tripFrom} - {selectedReport.tripTo}</p>
              <p><b>Reason:</b> {selectedReport.reason}</p>
              <p><b>Report:</b> {selectedReport.reportText}</p>
              <p><b>Status:</b> {selectedReport.status}</p>
              <p><b>Created:</b> {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleDateString() : "N/A"}</p>
              <button className="close-btn" onClick={() => setSelectedReport(null)}>Close</button>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default AdminReports;

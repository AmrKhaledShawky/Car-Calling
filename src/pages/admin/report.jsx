import { useState, useMemo } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import "./report.css";
import { FaEye, FaReply } from "react-icons/fa";

const AdminReports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [notification, setNotification] = useState("");

  const [reports, setReports] = useState(useMemo(() => [
    {
      id: 1,
      userName: "Ahmed Ali",
      userEmail: "ahmed@gmail.com",
      userPhone: "01012345678",
      carModel: "Toyota Corolla",
      tripFrom: "Cairo",
      tripTo: "Alexandria",
      reason: "معاملة سيئة",
      reportText: "Driver was rude and late.",
      reply: ""
    },
    {
      id: 2,
      userName: "Sara Mohamed",
      userEmail: "sara@gmail.com",
      userPhone: "01198765432",
      carModel: "Hyundai Elantra",
      tripFrom: "Giza",
      tripTo: "Cairo",
      reason: "خدمة سيئة",
      reportText: "Car AC was not working properly.",
      reply: ""
    }
  ], []));

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleReply = (reportId, replyText) => {
    const report = reports.find(r => r.id === reportId);

    // Simulate notifying the user
    alert(`Notification sent to ${report.userName}: Admin replied to your report!`);

    // Update report with reply
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return { ...r, reply: replyText };
      }
      return r;
    }));

    showNotification(`You replied to report: "${report.reportText}"`);
  };

  return (
    <AdminLayout>
      <div className="reports-container">

        {notification && <div className="notification">{notification}</div>}

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
            {reports.map(report => (
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
          </tbody>
        </table>

        {/* Modal for Report */}
        {selectedReport && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Report by {selectedReport.userName}</h3>
              <p><b>Email:</b> {selectedReport.userEmail}</p>
              <p><b>Phone:</b> {selectedReport.userPhone}</p>
              <p><b>Car:</b> {selectedReport.carModel}</p>
              <p><b>Trip:</b> {selectedReport.tripFrom} - {selectedReport.tripTo}</p>
              <p><b>Reason:</b> {selectedReport.reason}</p>
              <p><b>Report:</b> {selectedReport.reportText}</p>

              {selectedReport.reply ? (
                <p><b>Your Reply:</b> {selectedReport.reply}</p>
              ) : (
                <div className="reply-section">
                  <textarea placeholder="Write your reply..." id="replyText"></textarea>
                  <button 
                    className="reply-btn"
                    onClick={() => {
                      const text = document.getElementById("replyText").value;
                      if(text.trim() === "") return alert("Reply cannot be empty");
                      handleReply(selectedReport.id, text);
                      setSelectedReport(null);
                    }}
                  >
                    <FaReply /> Reply
                  </button>
                </div>
              )}

              <button className="close-btn" onClick={() => setSelectedReport(null)}>Close</button>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminReports;
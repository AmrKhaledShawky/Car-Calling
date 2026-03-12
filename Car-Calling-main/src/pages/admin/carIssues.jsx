import { useState, useMemo } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import "./carIssues.css";
import { FaEye, FaPlus, FaEdit, FaUserPlus } from "react-icons/fa";

const CarIssues = () => {
  const [selectedCar, setSelectedCar] = useState(null);
  const [addIssueCar, setAddIssueCar] = useState(null);
  const [editIssue, setEditIssue] = useState(null);
  const [assignMechanicIssue, setAssignMechanicIssue] = useState(null);
  const [notification, setNotification] = useState("");

  const cars = useMemo(() => [
    {
      id: 1,
      ownerName: "Ahmed Ali",
      ownerPhone: "01012345678",
      ownerEmail: "ahmed@gmail.com",
      carModel: "Toyota Corolla",
      carNumber: "ABC-123",
      carColor: "Black",
      carYear: 2020,
      issues: [
        { id: 1, problem: "Engine overheating", date: "2026-03-01", status: "Open", mechanic: "" },
        { id: 2, problem: "Brake issue", date: "2026-03-05", status: "Resolved", mechanic: "Ali" }
      ]
    },
    {
      id: 2,
      ownerName: "Sara Mohamed",
      ownerPhone: "01198765432",
      ownerEmail: "sara@gmail.com",
      carModel: "Hyundai Elantra",
      carNumber: "XYZ-456",
      carColor: "White",
      carYear: 2022,
      issues: [
        { id: 1, problem: "AC not working", date: "2026-02-10", status: "Open", mechanic: "" }
      ]
    }
  ], []);

  // ---------------- Notifications ----------------
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000); // تختفي بعد 3 ثواني
  };

  // ---------------- Action Handlers ----------------
  const handleAddIssue = (car) => {
    setAddIssueCar(car);
    showNotification(`Opening Add Issue modal for ${car.carModel}`);
  };

  const handleEditIssue = (issue) => {
    setEditIssue(issue);
    showNotification(`Editing status of issue: "${issue.problem}"`);
  };

  const handleAssignMechanic = (issue) => {
    setAssignMechanicIssue(issue);
    showNotification(`Assigning mechanic for issue: "${issue.problem}"`);
  };

  return (
    <AdminLayout>
      <div className="car-issues-container">

        {/* Notification */}
        {notification && <div className="notification">{notification}</div>}

        <table className="issues-table">
          <thead>
            <tr>
              <th>Owner</th>
              <th>Phone</th>
              <th>Car Model</th>
              <th>Car Number</th>
              <th>Year</th>
              <th>Total Issues</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {cars.map((car) => (
              <tr key={car.id}>
                <td>{car.ownerName}</td>
                <td>{car.ownerPhone}</td>
                <td>{car.carModel}</td>
                <td>{car.carNumber}</td>
                <td>{car.carYear}</td>
                <td>{car.issues.length}</td>
                <td className="action-buttons">
                  <button className="view-btn" onClick={() => setSelectedCar(car)} title="View Issues">
                    <FaEye />
                  </button>
                  <button className="add-btn" onClick={() => handleAddIssue(car)} title="Add Issue">
                    <FaPlus />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* باقي المودالز زي ما هما */}
        {selectedCar && <ViewIssuesModal car={selectedCar} close={() => setSelectedCar(null)} handleEditIssue={handleEditIssue} handleAssignMechanic={handleAssignMechanic} />}
        {addIssueCar && <AddIssueModal car={addIssueCar} close={() => setAddIssueCar(null)} showNotification={showNotification} />}
        {editIssue && <EditIssueModal issue={editIssue} close={() => setEditIssue(null)} showNotification={showNotification} />}
        {assignMechanicIssue && <AssignMechanicModal issue={assignMechanicIssue} close={() => setAssignMechanicIssue(null)} showNotification={showNotification} />}

      </div>
    </AdminLayout>
  );
};

export default CarIssues;

// ----------------- المودالز الصغيرة -----------------
const ViewIssuesModal = ({ car, close, handleEditIssue, handleAssignMechanic }) => (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Car Issues for {car.carModel}</h3>
      <div className="owner-info">
        <p><b>Owner:</b> {car.ownerName}</p>
        <p><b>Email:</b> {car.ownerEmail}</p>
        <p><b>Phone:</b> {car.ownerPhone}</p>
        <p><b>Car Number:</b> {car.carNumber}</p>
        <p><b>Color:</b> {car.carColor}</p>
      </div>
      <table className="issues-details">
        <thead>
          <tr>
            <th>Problem</th>
            <th>Date</th>
            <th>Status</th>
            <th>Mechanic</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {car.issues.map(issue => (
            <tr key={issue.id}>
              <td>{issue.problem}</td>
              <td>{issue.date}</td>
              <td className={`status ${issue.status}`}>{issue.status}</td>
              <td>{issue.mechanic || "-"}</td>
              <td className="modal-action-buttons">
                <button className="edit-btn" onClick={() => handleEditIssue(issue)}>Edit</button>
                <button className="assign-btn" onClick={() => handleAssignMechanic(issue)}>Assign</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="close-btn" onClick={close}>Close</button>
    </div>
  </div>
);

const AddIssueModal = ({ car, close, showNotification }) => (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Add Issue for {car.carModel}</h3>
      <form onSubmit={e => { e.preventDefault(); showNotification("Issue added successfully!"); close(); }}>
        <label>Problem:</label>
        <input type="text" placeholder="Describe the issue..." required/>
        <label>Status:</label>
        <select>
          <option>Open</option>
          <option>Resolved</option>
        </select>
        <button type="submit" className="save-btn">Add Issue</button>
      </form>
      <button className="close-btn" onClick={close}>Close</button>
    </div>
  </div>
);

const EditIssueModal = ({ issue, close, showNotification }) => (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Change Status for Issue</h3>
      <p><b>Problem:</b> {issue.problem}</p>
      <select>
        <option>Open</option>
        <option>Resolved</option>
      </select>
      <button className="save-btn" onClick={() => { showNotification("Status updated successfully!"); close(); }}>Save</button>
      <button className="close-btn" onClick={close}>Close</button>
    </div>
  </div>
);

const AssignMechanicModal = ({ issue, close, showNotification }) => (
  <div className="modal-overlay">
    <div className="modal">
      <h3>Assign Mechanic</h3>
      <p><b>Problem:</b> {issue.problem}</p>
      <input type="text" placeholder="Mechanic Name" />
      <button className="save-btn" onClick={() => { showNotification("Mechanic assigned successfully!"); close(); }}>Assign</button>
      <button className="close-btn" onClick={close}>Close</button>
    </div>
  </div>
);
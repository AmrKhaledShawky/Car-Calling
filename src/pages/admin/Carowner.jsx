import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/adminSidebar";
import Topbar from "../../components/layout/adminTopbar";
import { Edit, Trash2, Plus } from "lucide-react";
import "./CarOwner.css";

const initialCarOwners = [
  {
    id: 1,
    name: "Ahmed Ali",
    email: "ahmed@example.com",
    phone: "01012345678",
    cars: 2,
    status: "Active",
    lastCar: { model: "BMW X5", year: 2024 }
  },
  {
    id: 2,
    name: "Sara Mohamed",
    email: "sara@example.com",
    phone: "01098765432",
    cars: 1,
    status: "Pending",
    lastCar: { model: "Audi A4", year: 2023 }
  },
  {
    id: 3,
    name: "Omar Hassan",
    email: "omar@example.com",
    phone: "01122334455",
    cars: 3,
    status: "Inactive",
    lastCar: { model: "Toyota Corolla", year: 2025 }
  }
];

const CarOwner = () => {
  const [owners, setOwners] = useState(initialCarOwners);
  const navigate = useNavigate();

  const handleAdd = () => {
    navigate("/addcar"); // رابط Add Car Owner
  };

  const handleEdit = (id) => {
    navigate(`/editcar/${id}`); // رابط Edit Car Owner
  };

  const handleDelete = (id) => {
    navigate(`/deletecar/${id}`); // رابط Delete Car Owner
  };

  return (
    <div className="carowner-page">
      <Sidebar />
      <div className="carowner-content">
        <Topbar />
        <div className="carowner-header">
          <button className="add-btn" onClick={handleAdd}>
            <Plus size={16} /> Add Car Owner
          </button>
        </div>

        <table className="carowner-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Cars Owned</th>
              <th>Last Car</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((owner) => (
              <tr key={owner.id}>
                <td>{owner.name}</td>
                <td>{owner.email}</td>
                <td>{owner.phone}</td>
                <td>{owner.cars}</td>
                <td>{owner.lastCar.model} ({owner.lastCar.year})</td>
                <td className={`status ${owner.status.replace(" ","").toLowerCase()}`}>
                  {owner.status}
                </td>
                <td>
                  <Edit
                    className="action-icon edit"
                    onClick={() => handleEdit(owner.id)}
                  />
                  <Trash2
                    className="action-icon delete"
                    onClick={() => handleDelete(owner.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CarOwner;
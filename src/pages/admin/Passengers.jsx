import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/adminSidebar";
import Topbar from "../../components/layout/adminTopbar";
import { Edit, Trash2, Plus } from "lucide-react";
import "./Passengers.css";

const initialPassengers = [
    {
    id: 1,
    name: "Ahmed Ali",
    email: "ahmed@example.com",
    phone: "01012345678",
    trips: 5,
    profilePic: "https://i.pravatar.cc/150?img=1",
    lastTrip: { date: "2026-03-01", location: "Cairo" }
  },
  {
    id: 2,
    name: "Sara Mohamed",
    email: "sara@example.com",
    phone: "01098765432",
    trips: 3,
    profilePic: "https://i.pravatar.cc/150?img=2",
    lastTrip: { date: "2026-02-25", location: "Giza" }
  },
  {
    id: 3,
    name: "Omar Hassan",
    email: "omar@example.com",
    phone: "01122334455",
    trips: 7,
    profilePic: "https://i.pravatar.cc/150?img=3",
    lastTrip: { date: "2026-03-04", location: "Alexandria" }
  },
  {
    id: 4,
    name: "Mona Samir",
    email: "mona@example.com",
    phone: "01233445566",
    trips: 2,
    profilePic: "https://i.pravatar.cc/150?img=4",
    lastTrip: { date: "2026-03-02", location: "Cairo" }
  },
  {
    id: 5,
    name: "Youssef Tamer",
    email: "youssef@example.com",
    phone: "01099887766",
    trips: 4,
    profilePic: "https://i.pravatar.cc/150?img=5",
    lastTrip: { date: "2026-03-03", location: "Sharm El-Sheikh" }
  },
  {
    id: 6,
    name: "Fatma Nabil",
    email: "fatma@example.com",
    phone: "01155667788",
    trips: 6,
    profilePic: "https://i.pravatar.cc/150?img=6",
    lastTrip: { date: "2026-03-05", location: "Hurghada" }
  },
  {
    id: 7,
    name: "Khaled Mahmoud",
    email: "khaled@example.com",
    phone: "01033445522",
    trips: 3,
    profilePic: "https://i.pravatar.cc/150?img=7",
    lastTrip: { date: "2026-02-28", location: "Cairo" }
  },
  {
    id: 8,
    name: "Laila Fathy",
    email: "laila@example.com",
    phone: "01211223344",
    trips: 8,
    profilePic: "https://i.pravatar.cc/150?img=8",
    lastTrip: { date: "2026-03-06", location: "Alexandria" }
  }
];

const Passengers = () => {
  const [passengers, setPassengers] = useState(initialPassengers);
  const navigate = useNavigate();

  const handleAdd = () => {
    navigate("/addpassenger"); // رابط صفحة Add Passenger
  };

  const handleDelete = () => {
    navigate("/deletepassenger/:id"); // رابط صفحة Delete Passenger
  };

  const handleEdit = () => {
    navigate("/editpassenger/id"); // رابط صفحة Edit Passenger
  };

  return (
    <div className="passenger-page">
      <Sidebar />
      <div className="passenger-content">
        <Topbar />
        <div className="passenger-header">
          <button className="add-btn" onClick={handleAdd}>
            <Plus size={16} /> Add Passenger
          </button>
        </div>

        <table className="passenger-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Trips</th>
              <th>Last Trip</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((p) => (
              <tr key={p.id}>
                <td>
                  <img
                    src={p.profilePic}
                    alt={p.name}
                    className="profile-pic"
                  />
                </td>
                <td>{p.name}</td>
                <td>{p.email}</td>
                <td>{p.phone}</td>
                <td>{p.trips}</td>
                <td>{p.lastTrip.date} - {p.lastTrip.location}</td>
              <td>
                  <Edit
                    className="action-icon edit"
                    onClick={() => handleEdit(p.id)}
                  />
                  <Trash2
                    className="action-icon delete"
                    onClick={() => handleDelete(p.id)}
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

export default Passengers;
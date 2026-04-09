import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";
import "./rentalRequests.css";

export default function RentalRequests() {

  const initialRequests = [
    {
      id: 1,
      customer: "John Smith",
      car: "BMW X5",
      pickup: "2026-06-10",
      return: "2026-06-15",
      total: 600,
      status: "Pending"
    },
    {
      id: 2,
      customer: "Sarah Lee",
      car: "Audi A6",
      pickup: "2026-06-12",
      return: "2026-06-18",
      total: 840,
      status: "Pending"
    }
  ];

  const [requests, setRequests] = useState(initialRequests);

  const approveRequest = (id) => {

    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: "Approved" } : req
      )
    );

    toast.success("Rental request approved ✅");
  };

  const rejectRequest = (id) => {

    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: "Rejected" } : req
      )
    );

    toast.error("Rental request rejected ❌");
  };

  return (
    <DashboardLayout>

      <div className="requests-header">
        <h2>Rental Requests</h2>
      </div>

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

            {requests.map((req) => (

              <tr key={req.id}>

                <td>{req.customer}</td>

                <td>{req.car}</td>

                <td>{req.pickup}</td>

                <td>{req.return}</td>

                <td>${req.total}</td>

                <td>
                  <span className={`status ${req.status.toLowerCase()}`}>
                    {req.status}
                  </span>
                </td>

                <td className="actions">

                  {req.status === "Pending" && (
                    <>
                      <Check
                        size={18}
                        className="approve-icon"
                        onClick={() => approveRequest(req.id)}
                      />

                      <X
                        size={18}
                        className="reject-icon"
                        onClick={() => rejectRequest(req.id)}
                      />
                    </>
                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </DashboardLayout>
  );
}
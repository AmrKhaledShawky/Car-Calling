import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";
import { apiCall } from "../../utils/api";
import "./dashboard.css";

const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });

const buildMonthlyEarnings = (bookings) => {
  const monthlyTotals = new Map();

  bookings.forEach((booking) => {
    if (!["confirmed", "active", "completed"].includes(booking.status)) {
      return;
    }

    const date = booking.createdAt ? new Date(booking.createdAt) : new Date();
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const current = monthlyTotals.get(monthKey) || { month: monthFormatter.format(date), earnings: 0 };
    current.earnings += Number(booking.totalAmount || 0);
    monthlyTotals.set(monthKey, current);
  });

  return Array.from(monthlyTotals.values())
    .slice(-6)
    .map((item) => ({
      ...item,
      earnings: Number(item.earnings.toFixed(2))
    }));
};

const buildRentalsPerCar = (bookings) => {
  const counts = new Map();

  bookings.forEach((booking) => {
    if (!["confirmed", "active", "completed"].includes(booking.status)) {
      return;
    }

    const carId = booking.car?._id;
    const carName = `${booking.car?.make || ""} ${booking.car?.model || ""}`.trim() || "Unknown";

    if (!carId) {
      return;
    }

    counts.set(carId, {
      name: carName,
      rentals: (counts.get(carId)?.rentals || 0) + 1
    });
  });

  return Array.from(counts.values()).slice(0, 6);
};

export default function LandlordDashboardReal() {
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [carsResponse, bookingsResponse] = await Promise.all([
          apiCall("/cars/owner/my-cars"),
          apiCall("/bookings/owner-bookings?limit=100"),
        ]);

        setCars(carsResponse.data || []);
        setBookings(bookingsResponse.data || []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const activeRentals = bookings.filter((booking) => ["confirmed", "active"].includes(booking.status)).length;
  const pendingRequests = bookings.filter((booking) => booking.status === "pending").length;
  const completedRentals = bookings.filter((booking) => booking.status === "completed").length;
  const monthlyEarnings = bookings
    .filter((booking) => ["confirmed", "active", "completed"].includes(booking.status))
    .reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);
  const earningsData = buildMonthlyEarnings(bookings);
  const rentalsData = buildRentalsPerCar(bookings);

  return (
    <DashboardLayout>
      {loading ? <p className="dashboard-status">Loading dashboard...</p> : null}
      {error ? <p className="dashboard-status dashboard-error">{error}</p> : null}

      {!loading && !error ? (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Cars</h3>
              <p>{cars.length}</p>
            </div>

            <div className="stat-card">
              <h3>Active Rentals</h3>
              <p>{activeRentals}</p>
            </div>

            <div className="stat-card">
              <h3>Total Earnings</h3>
              <p>${monthlyEarnings.toFixed(2)}</p>
            </div>

            <div className="stat-card">
              <h3>Pending Requests</h3>
              <p>{pendingRequests}</p>
            </div>

            <div className="stat-card">
              <h3>Completed Rentals</h3>
              <p>{completedRentals}</p>
            </div>
          </div>

          <div className="dashboard-analytics">
            <div className="chart-card">
              <h3>Booking Earnings</h3>
              {earningsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={earningsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="earnings" stroke="#6B0202" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="dashboard-empty-text">No booking earnings yet.</p>
              )}
            </div>

            <div className="chart-card">
              <h3>Rentals Per Car</h3>
              {rentalsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={rentalsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rentals" fill="#6B0202" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="dashboard-empty-text">No rentals yet.</p>
              )}
            </div>
          </div>
        </>
      ) : null}
    </DashboardLayout>
  );
}

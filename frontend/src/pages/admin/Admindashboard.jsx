import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";

import { 
  DollarSign,
  Car,
  Users,
  Truck,
  CheckCircle,
  AlertCircle
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

import "./Admindashboard.css";

const COLORS = ["#4CAF50", "#FF9800", "#2196F3"];

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "N/A");

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiCall("/admin/dashboard/stats");
        setDashboardData(response.data);
      } catch (loadError) {
        setError(loadError.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const kpis = dashboardData?.kpis || {};
  const monthlyData = dashboardData?.monthlyData || [];
  const profitData = dashboardData?.profitData || [];
  const recentBookings = dashboardData?.recentBookings || [];
  const kpiCards = [
    { title: "Total Revenue", value: kpis.totalRevenue || 0, icon: <DollarSign size={28}/> },
    { title: "Total Cars", value: kpis.totalCars || 0, icon: <Car size={28}/> },
    { title: "Total Users", value: kpis.totalUsers || 0, icon: <Users size={28}/> },
    { title: "Total Landlords", value: kpis.totalLandlords || 0, icon: <Truck size={28}/> },
    { title: "Cars Available", value: kpis.totalCarsAvailable || 0, icon: <CheckCircle size={28}/> },
    { title: "Cars Rented", value: kpis.totalCarsRented || 0, icon: <Car size={28}/> },
    { title: "Overdue Bookings", value: kpis.overdueBookings || 0, icon: <AlertCircle size={28}/> }
  ];

  return (
    <AdminLayout>
      {loading ? <p>Loading dashboard...</p> : null}
      {error ? <p>{error}</p> : null}
      {!loading && !error ? (
        <>
      {/* KPI CARDS */}
      <div className="kpi-grid">
  {kpiCards.map((card, index) => (
    <div key={index} className="kpi-card">

      <div className="kpi-header">
        {card.icon}
        <h4 className="kpi-title">{card.title}</h4>
      </div>

      <p className="kpi-value">
        {Number(card.value || 0).toLocaleString()}
      </p>

    </div>
  ))}
</div>

        {/* CHARTS */}
        <div className="charts-grid">

          {/* Revenue / Cost / Overdue */}
          <div className="chart-box">
            <h3>Financial Overview</h3>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Line type="monotone" dataKey="revenue" stroke="#4CAF50" />
                <Line type="monotone" dataKey="cost" stroke="#FF9800" />
                <Line type="monotone" dataKey="overdue" stroke="#F44336" />

              </LineChart>
            </ResponsiveContainer>

          </div>
          

          {/* USERS BAR CHART */}
          <div className="chart-box">

            <h3>Total Users</h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />

                <Bar dataKey="users" fill="#2196F3" />

              </BarChart>
            </ResponsiveContainer>

          </div>


          {/* PROFIT PIE */}
          <div className="chart-box">

            <h3>Profit Analysis</h3>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>

                <Pie
                  data={profitData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >

                  {profitData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>
          <div className="drivers-table-box">
          <h3>Recent Rentals</h3>
          <table className="drivers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Car</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Total</th>
                  <th>Created</th>
                  <th>Status</th>
                  </tr>
                  </thead>
                  <tbody>
          {recentBookings.map((booking)=>(
            <tr key={booking.id}>
              <td>{booking.customer}</td>
              <td>{booking.car}</td>
              <td>{formatDate(booking.startDate)}</td>
              <td>{formatDate(booking.endDate)}</td>
              <td>${Number(booking.totalAmount || 0).toFixed(2)}</td>
              <td>{formatDate(booking.createdAt)}</td>
              <td className={`status ${String(booking.status || "").replace(" ","").toLowerCase()}`}>
                {booking.status}
                </td>
              </tr>
            ))}
            {recentBookings.length === 0 ? (
              <tr>
                <td colSpan={7}>No bookings found.</td>
              </tr>
            ) : null}
        </tbody>
</table>
</div>

        </div>
        </>
      ) : null}
    </AdminLayout>
  );
};

export default AdminDashboard;

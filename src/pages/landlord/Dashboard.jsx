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
import "./dashboard.css";

const earningsData = [
  { month: "Jan", earnings: 1200 },
  { month: "Feb", earnings: 2100 },
  { month: "Mar", earnings: 1800 },
  { month: "Apr", earnings: 2400 },
  { month: "May", earnings: 3000 },
  { month: "Jun", earnings: 3240 }
];

const rentalsData = [
  { name: "BMW X5", rentals: 8 },
  { name: "Corolla", rentals: 5 },
  { name: "Audi A6", rentals: 6 },
  { name: "Tesla 3", rentals: 9 }
];

export default function LandlordDashboard() {
  return (
    <DashboardLayout>

      {/* ===== Stats Cards ===== */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Cars</h3>
          <p>12</p>
        </div>

        <div className="stat-card">
          <h3>Active Rentals</h3>
          <p>4</p>
        </div>

        <div className="stat-card">
          <h3>Monthly Earnings</h3>
          <p>$3,240</p>
        </div>

        <div className="stat-card">
          <h3>Pending Requests</h3>
          <p>3</p>
        </div>
      </div>

      {/* ===== Charts Section ===== */}
      <div className="dashboard-analytics">

        <div className="chart-card">
          <h3>Monthly Earnings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="#6B0202"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Rentals Per Car</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rentalsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="rentals" fill="#6B0202" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </DashboardLayout>
  );
}
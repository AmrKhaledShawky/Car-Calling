import React from "react";
import AdminLayout from "../../components/layout/AdminLayout";

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

const kpiCards = [
  { title: "Total Revenue", value: 150865, icon: <DollarSign size={28}/> },
  { title: "Total Cars", value: 2500, icon: <Car size={28}/> },
  { title: "Total Users", value: 2000, icon: <Users size={28}/> },
  { title: "Total Cost", value: 1000000, icon: <Truck size={28}/> },
  { title: "Total Cars Available", value: 2450, icon: <CheckCircle size={28}/> },
  { title: "Total Cars Rented", value: 1900, icon: <Car size={28}/> },
  { title: "Overdue Bookings", value: 60, icon: <AlertCircle size={28}/> }
];

const monthlyData = [
  { month: "Jan", revenue: 20000, cost: 12000, overdue: 5, users: 100 },
  { month: "Feb", revenue: 25000, cost: 14000, overdue: 8, users: 120 },
  { month: "Mar", revenue: 30000, cost: 15000, overdue: 6, users: 140 },
  { month: "Apr", revenue: 28000, cost: 13000, overdue: 7, users: 160 },
  { month: "May", revenue: 35000, cost: 18000, overdue: 10, users: 200 },
  { month: "Jun", revenue: 40000, cost: 20000, overdue: 9, users: 220 },
  { month: "Jul", revenue: 42000, cost: 21000, overdue: 12, users: 250 },
  { month: "Aug", revenue: 38000, cost: 19000, overdue: 11, users: 230 },
  { month: "Sep", revenue: 36000, cost: 17000, overdue: 7, users: 210 },
  { month: "Oct", revenue: 45000, cost: 22000, overdue: 6, users: 260 },
  { month: "Nov", revenue: 47000, cost: 23000, overdue: 5, users: 280 },
  { month: "Dec", revenue: 50000, cost: 25000, overdue: 4, users: 300 }
];
const driversData = [
  {
    name: "Ahmed Ali",
    car: "Toyota Corolla",
    from: "Cairo",
    to: "Alexandria",
    price: 500,
    date: "12 Jan",
    status: "On Trip"
  },
  {
    name: "Mohamed Hassan",
    car: "Kia Sportage",
    from: "Giza",
    to: "Hurghada",
    price: 1200,
    date: "14 Jan",
    status: "Cancelled"
  },
  {
    name: "Mahmoud Samy",
    car: "Hyundai Elantra",
    from: "Nasr City",
    to: "New Cairo",
    price: 200,
    date: "10 Jan",
    status: "Maintenance"
  },
  {
    name: "Omar Khaled",
    car: "Nissan Sunny",
    from: "Dokki",
    to: "Maadi",
    price: 150,
    date: "11 Jan",
    status: "Completed"
  }
];

const totalRevenue = monthlyData.reduce((a,b)=>a+b.revenue,0);
const totalCost = monthlyData.reduce((a,b)=>a+b.cost,0);

const profitData = [
  { name: "Revenue", value: totalRevenue },
  { name: "Cost", value: totalCost },
  { name: "Profit", value: totalRevenue - totalCost }
];

const COLORS = ["#4CAF50", "#FF9800", "#2196F3"];

const AdminDashboard = () => {
  return (
    <AdminLayout>
      {/* KPI CARDS */}
      <div className="kpi-grid">
  {kpiCards.map((card, index) => (
    <div key={index} className="kpi-card">

      <div className="kpi-header">
        {card.icon}
        <h4 className="kpi-title">{card.title}</h4>
      </div>

      <p className="kpi-value">
        {card.value.toLocaleString()}
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
          <h3>Drivers Trips</h3>
          <table className="drivers-table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Car</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Price</th>
                  <th>Date</th>
                  <th>Status</th>
                  </tr>
                  </thead>
                  <tbody>
          {driversData.map((driver,index)=>(
            <tr key={index}>
              <td>{driver.name}</td>
              <td>{driver.car}</td>
              <td>{driver.from}</td>
              <td>{driver.to}</td>
              <td>${driver.price}</td>
              <td>{driver.date}</td>
              <td className={`status ${driver.status.replace(" ","").toLowerCase()}`}>
                {driver.status}
                </td>
              </tr>
            ))}
        </tbody>
</table>
</div>

        </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
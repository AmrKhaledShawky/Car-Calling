import React, { useState } from "react";
import Sidebar from "../../components/layout/adminSidebar";
import Topbar from "../../components/layout/adminTopbar";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  LineChart, Line 
} from "recharts";
import "./transaction.css";

const initialTransactions = [
  { id: 1, accountNumber: "1234567890", email: "ahmed@example.com", status: "Completed", userName: "Ahmed Ali", lastTrip: { from: "Cairo", to: "Giza" }, paymentAmount: 250, phone: "01012345678", paymentMethod: "Cash", month: "Jan", year: 2023 },
  { id: 2, accountNumber: "9876543210", email: "sara@example.com", status: "Pending", userName: "Sara Mohamed", lastTrip: { from: "Alexandria", to: "Cairo" }, paymentAmount: 400, phone: "01098765432", paymentMethod: "Vodafone", month: "Feb", year: 2023 },
  { id: 3, accountNumber: "1122334455", email: "omar@example.com", status: "Failed", userName: "Omar Hassan", lastTrip: { from: "Sharm El-Sheikh", to: "Hurghada" }, paymentAmount: 600, phone: "01122334455", paymentMethod: "Bank Transfer", month: "Jan", year: 2023 },
  { id: 4, accountNumber: "5566778899", email: "laila@example.com", status: "Completed", userName: "Laila Fathy", lastTrip: { from: "Cairo", to: "Alexandria" }, paymentAmount: 350, phone: "01211223344", paymentMethod: "Instapay", month: "Mar", year: 2023 }
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

const Transactions = () => {
  const [transactions] = useState(initialTransactions);

  // Count transactions per month
  const transactionsPerMonth = months.map((month) => ({
    month,
    transactions: transactions.filter(t => t.month === month).length
  }));

  // Count transactions per year (خط increasing بدون صفر)
  let cumulative = 0;
  const transactionsPerYear = years.map((year) => {
    const yearlyCount = transactions.filter(t => t.year === year).length;
    cumulative += yearlyCount > 0 ? yearlyCount : 1; // لو مفيش معاملات نزود على الأقل 1
    return { year, transactions: cumulative };
  });

  return (
    <div className="transactions-page">
      <Sidebar />
      <div className="transactions-content">
        <Topbar />

        {/* جدول Transactions */}
        <div className="transactions-header">
        </div>
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Account Number</th>
              <th>Email</th>
              <th>Status</th>
              <th>User Name</th>
              <th>Last Trip</th>
              <th>Amount</th>
              <th>Phone</th>
              <th>Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.accountNumber}</td>
                <td>{t.email}</td>
                <td className={`transactions-status ${t.status.replace(" ","").toLowerCase()}`}>
                  {t.status}
                </td>
                <td>{t.userName}</td>
                <td>{t.lastTrip.from} → {t.lastTrip.to}</td>
                <td>${t.paymentAmount}</td>
                <td>{t.phone}</td>
                <td>{t.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Chart: Transactions per Month */}
        <div className="chart-container">
          <h3>Transactions per Month</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transactionsPerMonth} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="transactions" fill="#6B0202" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart: Transactions per Year */}
        <div className="chart-container" style={{ marginTop: "30px" }}>
          <h3>Transactions per Year (2020-2026)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={transactionsPerYear}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="transactions" 
                stroke="#6B0202" 
                strokeWidth={3} 
                isAnimationActive={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
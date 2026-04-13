import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";
import "./transaction.css";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await apiCall("/admin/bookings");
        setTransactions(response.data || []);
      } catch (loadError) {
        setError(loadError.message || "Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const transactionsPerMonth = useMemo(
    () =>
      months.map((month, index) => ({
        month,
        transactions: transactions.filter((transaction) => {
          const createdAt = transaction.createdAt ? new Date(transaction.createdAt) : null;
          return createdAt && createdAt.getMonth() === index;
        }).length
      })),
    [transactions]
  );

  const transactionsPerYear = useMemo(
    () =>
      years.map((year) => ({
        year,
        transactions: transactions.filter((transaction) => {
          const createdAt = transaction.createdAt ? new Date(transaction.createdAt) : null;
          return createdAt && createdAt.getFullYear() === year;
        }).length
      })),
    [transactions]
  );

  return (
    <AdminLayout>
      <div className="transactions-content">
        {loading ? <p>Loading transactions...</p> : null}
        {error ? <p>{error}</p> : null}
        {!loading && !error ? (
          <>
            <div className="transactions-header" />
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>User Name</th>
                  <th>Trip</th>
                  <th>Amount</th>
                  <th>Phone</th>
                  <th>Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>{transaction.bookingReference || transaction._id.slice(-8)}</td>
                    <td>{transaction.customer?.email || "N/A"}</td>
                    <td className={`transactions-status ${String(transaction.paymentStatus || transaction.status || "").replace(" ", "").toLowerCase()}`}>
                      {transaction.paymentStatus || transaction.status}
                    </td>
                    <td>{transaction.customer?.name || "Unknown user"}</td>
                    <td>
                      {(transaction.pickupLocation?.address || transaction.car?.location?.city || "Owner location")}
                      {" \u2192 "}
                      {(transaction.returnLocation?.address || transaction.car?.location?.city || "Owner location")}
                    </td>
                    <td>${Number(transaction.totalAmount || 0).toFixed(2)}</td>
                    <td>{transaction.customer?.phone || "N/A"}</td>
                    <td>{transaction.paymentMethod || "card"}</td>
                  </tr>
                ))}
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={8}>No transactions found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>

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

            <div className="chart-container" style={{ marginTop: "30px" }}>
              <h3>Transactions per Year</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={transactionsPerYear} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="transactions" stroke="#6B0202" strokeWidth={3} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default Transactions;

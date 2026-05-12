import React, { useEffect, useMemo, useState, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { apiCall } from "../../utils/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  FaSearch,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaChevronLeft,
  FaChevronRight,
  FaExchangeAlt,
} from "react-icons/fa";
import { MdErrorOutline } from "react-icons/md";
import "./transaction.css";

const ITEMS_PER_PAGE = 10;

/* ── Year-over-year grouped chart config ── */
const CHART_START_YEAR = 2023;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEAR_COLORS = ["#6B0202", "#2563eb", "#059669", "#d97706", "#7c3aed", "#db2777", "#0891b2"];

const generateChartYears = () => {
  const now = new Date();
  const endYear = Math.max(2026, now.getFullYear() + 1);
  const years = [];
  for (let y = CHART_START_YEAR; y <= endYear; y++) years.push(y);
  return years;
};

const statusConfig = {
  completed:   { label: "Completed",  className: "status-completed" },
  active:      { label: "Active",     className: "status-active" },
  confirmed:   { label: "Confirmed",  className: "status-pending" },
  pending:     { label: "Pending",    className: "status-pending" },
  cancelled:   { label: "Cancelled",  className: "status-cancelled" },
  rejected:    { label: "Rejected",   className: "status-cancelled" },
  no_show:     { label: "No Show",    className: "status-cancelled" },
  failed:      { label: "Failed",     className: "status-cancelled" },
  refunded:    { label: "Refunded",   className: "status-cancelled" },
};

const getStatusBadge = (status) => {
  const config = statusConfig[status?.toLowerCase()] || {
    label: status || "Unknown",
    className: "status-unknown",
  };
  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (val) => {
  const num = Number(val || 0);
  return `$${num.toFixed(2)}`;
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);

  /* ─────────── FETCH ─────────── */
  const loadTransactions = useCallback(async () => {
    console.log("[Transactions] Starting fetch...");
    console.log("[Transactions] Token in localStorage:", localStorage.getItem("token") ? "YES" : "NO");

    try {
      setLoading(true);
      setError("");

      const endpoint = "/admin/bookings";
      console.log(`[Transactions] Trying endpoint: ${endpoint}`);
      const response = await apiCall(endpoint);
      console.log("[Transactions] Response:", response);

      let dataArray = [];
      if (Array.isArray(response)) {
        dataArray = response;
      } else if (Array.isArray(response.data)) {
        dataArray = response.data;
      } else if (Array.isArray(response.bookings)) {
        dataArray = response.bookings;
      } else {
        console.warn("[Transactions] Unexpected response shape:", response);
      }

      console.log(`[Transactions] Loaded ${dataArray.length} bookings`);
      setTransactions(dataArray);
    } catch (loadError) {
      console.error("[Transactions] Final load error:", loadError);
      let message = loadError.message || "Failed to load bookings.";

      if (
        message.toLowerCase().includes("fetch") ||
        message.toLowerCase().includes("network") ||
        message.toLowerCase().includes("failed to fetch") ||
        !loadError.status
      ) {
        message = "Unable to connect to the server. Please make sure the backend is running on port 5001 and that CORS is configured correctly.";
      } else if (loadError.status === 401) {
        message = "Unauthorized (401). Your session may have expired. Please log in again as an admin.";
      } else if (loadError.status === 403) {
        message = "Access denied (403). Admin privileges are required to view bookings.";
      } else if (loadError.status >= 500) {
        message = `Server error (${loadError.status}). Please check the backend logs.`;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  /* ─────────── SORT ─────────── */
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  /* ─────────── FILTER ─────────── */
  const filteredTransactions = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return transactions;

    return transactions.filter((t) => {
      const userName = (t.customer?.name || t.customerSummary?.name || "").toLowerCase();
      const carName = `${t.car?.year || ""} ${t.car?.make || t.carSummary?.make || ""} ${t.car?.model || t.carSummary?.model || ""}`.toLowerCase();
      const ref = (t.bookingReference || "").toLowerCase();
      return userName.includes(query) || carName.includes(query) || ref.includes(query);
    });
  }, [transactions, searchQuery]);

  /* ─────────── SORTED ─────────── */
  const sortedTransactions = useMemo(() => {
    const { key, direction } = sortConfig;
    const sorted = [...filteredTransactions];

    sorted.sort((a, b) => {
      let valA, valB;

      if (key === "createdAt") {
        valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      } else if (key === "totalAmount") {
        valA = Number(a.totalAmount || 0);
        valB = Number(b.totalAmount || 0);
      } else if (key === "startDate") {
        valA = a.startDate ? new Date(a.startDate).getTime() : 0;
        valB = b.startDate ? new Date(b.startDate).getTime() : 0;
      } else if (key === "endDate") {
        valA = a.endDate ? new Date(a.endDate).getTime() : 0;
        valB = b.endDate ? new Date(b.endDate).getTime() : 0;
      } else {
        valA = (a[key] || "").toString().toLowerCase();
        valB = (b[key] || "").toString().toLowerCase();
      }

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredTransactions, sortConfig]);

  /* ─────────── PAGINATION ─────────── */
  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedTransactions.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedTransactions, currentPage]);

  /* ─────────── CHART DATA ─────────── */
  const chartYears = useMemo(() => generateChartYears(), []);

  const transactionsPerMonth = useMemo(() => {
    return MONTH_NAMES.map((monthName, monthIndex) => {
      const entry = { month: monthName };
      chartYears.forEach((year) => {
        entry[String(year)] = transactions.filter((t) => {
          const createdAt = t.createdAt ? new Date(t.createdAt) : null;
          return createdAt && createdAt.getFullYear() === year && createdAt.getMonth() === monthIndex;
        }).length;
      });
      return entry;
    });
  }, [transactions, chartYears]);

  const transactionsPerYear = useMemo(() => {
    return chartYears.map((year) => ({
      year,
      transactions: transactions.filter((t) => {
        const createdAt = t.createdAt ? new Date(t.createdAt) : null;
        return createdAt && createdAt.getFullYear() === year;
      }).length,
    }));
  }, [transactions, chartYears]);

  /* ─────────── HELPERS ─────────── */
  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <FaSort className="sort-icon" />;
    return sortConfig.direction === "asc" ? (
      <FaSortUp className="sort-icon active" />
    ) : (
      <FaSortDown className="sort-icon active" />
    );
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination-container">
        <button
          className="pagination-btn pagination-nav"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FaChevronLeft />
        </button>
        {startPage > 1 && <span className="pagination-ellipsis">...</span>}
        {pages}
        {endPage < totalPages && <span className="pagination-ellipsis">...</span>}
        <button
          className="pagination-btn pagination-nav"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FaChevronRight />
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    );
  };

  /* ─────────── RENDER ─────────── */
  return (
    <AdminLayout>
      <div className="transactions-content">
        <div className="transactions-header">
          <div className="transactions-title-section">
            <FaExchangeAlt className="transactions-title-icon" />
            <div>
              <h1 className="transactions-title">Transactions</h1>
              <p className="transactions-subtitle">
                Manage and track all booking transactions
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="transactions-state loading">
            <div className="spinner" />
            <p>Loading transactions...</p>
          </div>
        )}

        {error && (
          <div className="transactions-state error">
            <MdErrorOutline className="state-icon" />
            <p className="error-text">{error}</p>
            <button className="retry-btn" onClick={loadTransactions}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="transactions-toolbar">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by user name, car name, or reference..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="search-input"
                />
              </div>
              <div className="results-count">
                <strong>{filteredTransactions.length}</strong>{" "}
                {filteredTransactions.length === 1 ? "transaction" : "transactions"} found
              </div>
            </div>

            <div className="table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Customer</th>
                    <th>Car</th>
                    <th>Owner</th>
                    <th>Pickup</th>
                    <th>Return</th>
                    <th className="sortable-header" onClick={() => handleSort("startDate")}>
                      <div className="header-content">Start <SortIcon columnKey="startDate" /></div>
                    </th>
                    <th className="sortable-header" onClick={() => handleSort("endDate")}>
                      <div className="header-content">End <SortIcon columnKey="endDate" /></div>
                    </th>
                    <th>Duration</th>
                    <th>Daily Rate</th>
                    <th>Subtotal</th>
                    <th>Tax</th>
                    <th>Payment Method</th>
                    <th>Payment Status</th>
                    <th className="sortable-header" onClick={() => handleSort("totalAmount")}>
                      <div className="header-content">Total <SortIcon columnKey="totalAmount" /></div>
                    </th>
                    <th className="sortable-header" onClick={() => handleSort("createdAt")}>
                      <div className="header-content">Booked <SortIcon columnKey="createdAt" /></div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((t) => (
                    <tr key={t._id}>
                      <td>{getStatusBadge(t.status)}</td>
                      <td className="user-name">{t.customer?.name || t.customerSummary?.name || "N/A"}</td>
                      <td className="car-name">
                        {`${t.car?.year || t.carSummary?.year || ""} ${t.car?.make || t.carSummary?.make || ""} ${t.car?.model || t.carSummary?.model || ""}`.trim() || "N/A"}
                      </td>
                      <td className="owner-name">{t.owner?.name || t.ownerSummary?.name || "N/A"}</td>
                      <td className="location" title={t.pickupLocation?.address}>
                        {t.pickupLocation?.address || "N/A"}
                      </td>
                      <td className="location" title={t.returnLocation?.address}>
                        {t.returnLocation?.address || "N/A"}
                      </td>
                      <td className="booking-date">{formatShortDate(t.startDate)}</td>
                      <td className="booking-date">{formatShortDate(t.endDate)}</td>
                      <td>{t.duration ? `${t.duration} day(s)` : "N/A"}</td>
                      <td className="price">{formatCurrency(t.dailyRate)}</td>
                      <td>{formatCurrency(t.subtotal)}</td>
                      <td>{formatCurrency(t.tax)}</td>
                      <td>{t.paymentMethod || "N/A"}</td>
                      <td>
                        <span className={`payment-badge ${(t.paymentStatus || "").toLowerCase()}`}>
                          {t.paymentStatus || "N/A"}
                        </span>
                      </td>
                      <td className="price">{formatCurrency(t.totalAmount)}</td>
                      <td className="booking-date">{formatDate(t.createdAt)}</td>
                    </tr>
                  ))}
                  {paginatedTransactions.length === 0 && (
                    <tr>
                      <td colSpan={16} className="empty-state-cell">
                        <div className="empty-state">
                          <FaExchangeAlt className="empty-icon" />
                          <p>No transactions found.</p>
                          {searchQuery && (
                            <p className="empty-subtitle">Try adjusting your search query.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {renderPagination()}

            <div className="charts-grid">
              <div className="chart-container">
                <h3>Transactions per Month</h3>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={transactionsPerMonth} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                    {chartYears.map((year, index) => (
                      <Bar
                        key={year}
                        dataKey={String(year)}
                        name={String(year)}
                        fill={YEAR_COLORS[index % YEAR_COLORS.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h3>Transactions per Year</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={transactionsPerYear} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="transactions"
                      stroke="#6B0202"
                      strokeWidth={3}
                      dot={{ fill: "#6B0202", r: 4 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Transactions;


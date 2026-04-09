import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./dashboardLayout.css";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="dashboard-container">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`dashboard-content ${
          collapsed ? "collapsed" : ""
        }`}
      >
        <Topbar />
        <div className="dashboard-page">{children}</div>
      </div>
    </div>
  );
}


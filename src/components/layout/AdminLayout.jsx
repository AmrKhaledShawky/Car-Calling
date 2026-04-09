import { useState } from "react";
import AdminSidebar from "./adminSidebar";
import AdminTopbar from "./adminTopbar";
import "./adminLayout.css";

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`admin-dashboard-container ${collapsed ? "collapsed" : ""}`}>
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className="admin-main-content">
        <AdminTopbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <section className="admin-dashboard-page">{children}</section>
      </main>
    </div>
  );
}

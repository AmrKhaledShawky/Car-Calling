import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import LandlordDashboard from "../pages/landlord/Dashboard";
import MyCars from "../pages/landlord/MyCars";
import RentalRequests from "../pages/landlord/RentalRequests";
import Settings from "../pages/landlord/Settings";
import Profile from "../pages/landlord/Profile";
import Register from "../pages/auth/Register";
import Privacy from "../pages/Privacy";
import AdminDashboard from "../pages/admin/Admindashboard";
import AdminProfile from "../pages/admin/adminProfile";
function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
        <Route path="/landlord/my-cars" element={<MyCars />} />
        <Route path="/landlord/rental-requests" element={<RentalRequests />} />
        <Route path="/landlord/settings" element={<Settings />} />
        <Route path="/landlord/profile" element={<Profile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
       
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
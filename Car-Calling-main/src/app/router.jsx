import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import LandlordDashboard from "../pages/landlord/Dashboard";
import MyCars from "../pages/landlord/MyCars";
import RentalRequests from "../pages/landlord/RentalRequests";
import Settings from "../pages/landlord/Settings";
import Profile from "../pages/landlord/Profile";
import Register from "../pages/auth/Register";
import Privacy from "../pages/privacy";
import LandingPage from "../pages/LandingPage/LandingPage";
import BrowseCars from "../pages/BrowseCar/BrowseCar";
import CarDetails from "../pages/CarDetails/CarDetails";
function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
        <Route path="/landlord/my-cars" element={<MyCars />} />
        <Route path="/landlord/rental-requests" element={<RentalRequests />} />
        <Route path="/landlord/settings" element={<Settings />} />
        <Route path="/landlord/profile" element={<Profile />} />
        <Route path="/browse-cars" element={<BrowseCars />} />
        <Route path="/car/:id" element={<CarDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
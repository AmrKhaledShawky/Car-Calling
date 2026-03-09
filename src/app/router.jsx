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
import BrowseCars from "../pages/LandingPage/BrowseCars";
import CarOwner from "../pages/admin/Carowner";
import AddCar from "../pages/admin/addcar";
import DeleteCar from "../pages/admin/deletecar";
import EditCar from "../pages/admin/editcar";
import Passengers from "../pages/admin/Passengers";
import AddPassenger from "../pages/admin/addPassenger";
import EditPassenger from "../pages/admin/editPassenger";
import DeletePassenger from "../pages/admin/deletePassenger";
import AdminProfile from "../pages/admin/adminprofile";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Transactions from "../pages/admin/transaction";
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
        <Route path="/admin/carowner" element={<CarOwner />} />
        <Route path="/addcar" element={<AddCar />} />
        <Route path="/deletecar/:id" element={<DeleteCar />} />
        <Route path="/editcar/:id" element={<EditCar />} />
        <Route path="/admin/passengers" element={<Passengers />} />
        <Route path="/addpassenger" element={<AddPassenger />} />
        <Route path="editpassenger/:id" element={<EditPassenger />} />
        <Route path="/deletepassenger/:id" element={<DeletePassenger />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/transaction" element={<Transactions />} />

      </Routes>
    </BrowserRouter>
  );
}

export default Router;
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import LandlordDashboard from "../pages/landlord/DashboardReal";
import MyCars from "../pages/landlord/MyCarsReal";
import RentalRequests from "../pages/landlord/RentalRequestsReal";
import RentalHistory from "../pages/landlord/RentalHistoryReal";
import Settings from "../pages/landlord/SettingsReal";
import Profile from "../pages/landlord/Profile";
import Register from "../pages/auth/Register";
import Privacy from "../pages/privacy";
import LandingPage from "../pages/LandingPage/LandingPageReal";
import BrowseCars from "../pages/BrowseCar/BrowseCarReal";
import CarDetails from "../pages/CarDetails/CarDetailsReal";
import CarOwner from "../pages/admin/Carowner";
import Cars from "../pages/admin/Cars";
import AddCar from "../pages/admin/addcar";
import DeleteCar from "../pages/admin/deletecar";
import EditCar from "../pages/admin/editcar";
import Passengers from "../pages/admin/Passengers";  
import AddPassenger from "../pages/admin/addPassenger";
import EditPassenger from "../pages/admin/editPassenger";
import DeletePassenger from "../pages/admin/deletePassenger";
import AdminProfile from "../pages/admin/adminProfile";
import AdminDashboard from "../pages/admin/Admindashboard";
import Transactions from "../pages/admin/transaction";
import ProtectedRoute from "../routes/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { getAuthorizedRoute } from "../utils/auth";
import UserMyRents from "../pages/UserMyRentsPage";
import UserProfile from "../pages/UserProfile";

function Router() {
  const { isAuthenticated, user, loading } = useAuth();

  const renderAuthPage = (Component) => {
    if (loading) {
      return <div>Loading...</div>;
    }

    if (isAuthenticated && user) {
      return <Navigate to={getAuthorizedRoute(user.role)} replace />;
    }

    return <Component />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={renderAuthPage(Login)} />
        <Route path="/auth/register" element={renderAuthPage(Register)} />
        <Route path="/privacy" element={<Privacy />} />
        <Route
          path="/my-rents"
          element={
            <ProtectedRoute>
              <UserMyRents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/landlord/dashboard"
          element={
            <ProtectedRoute allowedRoles={["landlord"]}>
              <LandlordDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/landlord/my-cars"
          element={
            <ProtectedRoute allowedRoles={["landlord"]}>
              <MyCars />
            </ProtectedRoute>
          }
        />
        <Route
          path="/landlord/rental-requests"
          element={
            <ProtectedRoute allowedRoles={["landlord"]}>
              <RentalRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/landlord/rental-history"
          element={
            <ProtectedRoute allowedRoles={["landlord"]}>
              <RentalHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/landlord/settings"
          element={
            <ProtectedRoute allowedRoles={["landlord"]}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/landlord/profile"
          element={
            <ProtectedRoute allowedRoles={["landlord"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/browse-cars" element={<BrowseCars />} />
        <Route path="/car/:id" element={<CarDetails />} />
        <Route
          path="/admin/carowner"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CarOwner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/cars"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Cars />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addcar"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddCar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deletecar/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DeleteCar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editcar/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditCar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/passengers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Passengers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addpassenger"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddPassenger />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editpassenger/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditPassenger />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deletepassenger/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DeletePassenger />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transaction"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Transactions />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;

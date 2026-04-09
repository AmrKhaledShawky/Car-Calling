import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
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
import CarOwner from "../pages/admin/Carowner";
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
import CarIssues from "../pages/admin/carIssues";
import Review from "../pages/admin/review";
import Report from "../pages/admin/report";
import ProtectedRoute from "../routes/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { getAuthorizedRoute } from "../utils/auth";

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
        <Route
          path="/admin/carissues"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CarIssues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/review"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Review />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/report"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Report />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;

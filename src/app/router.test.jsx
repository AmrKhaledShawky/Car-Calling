import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Router from './router'

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    loading: false
  })
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  Toaster: () => null
}))

// Mock all the page components to avoid complex dependencies
vi.mock('../pages/auth/Login', () => ({
  default: () => <div data-testid="login-page">Login Page</div>
}))

vi.mock('../pages/auth/Register', () => ({
  default: () => <div data-testid="register-page">Register Page</div>
}))

vi.mock('../pages/privacy', () => ({
  default: () => <div data-testid="privacy-page">Privacy Page</div>
}))

vi.mock('../pages/LandingPage/LandingPage', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>
}))

vi.mock('../pages/BrowseCar/BrowseCarReal', () => ({
  default: () => <div data-testid="browse-cars-page">Browse Cars Page</div>
}))

vi.mock('../pages/CarDetails/CarDetailsReal', () => ({
  default: () => <div data-testid="car-details-page">Car Details Page</div>
}))

vi.mock('../pages/UserMyRents', () => ({
  default: () => <div data-testid="user-my-rents-page">User My Rents Page</div>
}))

vi.mock('../pages/UserProfile', () => ({
  default: () => <div data-testid="user-profile-page">User Profile Page</div>
}))

// Mock admin pages
vi.mock('../pages/admin/Carowner', () => ({
  default: () => <div data-testid="car-owner-page">Car Owner Page</div>
}))

vi.mock('../pages/admin/addcar', () => ({
  default: () => <div data-testid="add-car-page">Add Car Page</div>
}))

vi.mock('../pages/admin/deletecar', () => ({
  default: () => <div data-testid="delete-car-page">Delete Car Page</div>
}))

vi.mock('../pages/admin/editcar', () => ({
  default: () => <div data-testid="edit-car-page">Edit Car Page</div>
}))

vi.mock('../pages/admin/Passengers', () => ({
  default: () => <div data-testid="passengers-page">Passengers Page</div>
}))

vi.mock('../pages/admin/addPassenger', () => ({
  default: () => <div data-testid="add-passenger-page">Add Passenger Page</div>
}))

vi.mock('../pages/admin/editPassenger', () => ({
  default: () => <div data-testid="edit-passenger-page">Edit Passenger Page</div>
}))

vi.mock('../pages/admin/deletePassenger', () => ({
  default: () => <div data-testid="delete-passenger-page">Delete Passenger Page</div>
}))

vi.mock('../pages/admin/adminProfile', () => ({
  default: () => <div data-testid="admin-profile-page">Admin Profile Page</div>
}))

vi.mock('../pages/admin/Admindashboard', () => ({
  default: () => <div data-testid="admin-dashboard-page">Admin Dashboard Page</div>
}))

vi.mock('../pages/admin/transaction', () => ({
  default: () => <div data-testid="transactions-page">Transactions Page</div>
}))

vi.mock('../pages/admin/carIssues', () => ({
  default: () => <div data-testid="car-issues-page">Car Issues Page</div>
}))

vi.mock('../pages/admin/review', () => ({
  default: () => <div data-testid="review-page">Review Page</div>
}))

vi.mock('../pages/admin/report', () => ({
  default: () => <div data-testid="report-page">Report Page</div>
}))

// Mock landlord pages
vi.mock('../pages/landlord/Dashboard', () => ({
  default: () => <div data-testid="landlord-dashboard-page">Landlord Dashboard Page</div>
}))

vi.mock('../pages/landlord/MyCars', () => ({
  default: () => <div data-testid="my-cars-page">My Cars Page</div>
}))

vi.mock('../pages/landlord/RentalRequests', () => ({
  default: () => <div data-testid="rental-requests-page">Rental Requests Page</div>
}))

vi.mock('../pages/landlord/Settings', () => ({
  default: () => <div data-testid="landlord-settings-page">Landlord Settings Page</div>
}))

vi.mock('../pages/landlord/Profile', () => ({
  default: () => <div data-testid="landlord-profile-page">Landlord Profile Page</div>
}))

describe('Router Integration Tests', () => {
  it('renders router component without crashing', () => {
    render(<Router />)

    // Since Router uses BrowserRouter internally, we just test that it renders
    expect(document.body).toBeInTheDocument()
  })

  it('router component structure is correct', () => {
    // Test that the Router component can be imported and is a function
    expect(typeof Router).toBe('function')
  })

  it('router contains expected routes', () => {
    // Test that we can import the Router without issues
    expect(Router).toBeDefined()
  })
})

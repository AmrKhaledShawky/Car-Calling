import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue({ success: true, redirectTo: '/browse-cars' })
  })
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Eye: () => 'Eye',
  EyeOff: () => 'EyeOff'
}))

describe('Login Component Integration Tests', () => {
  it('renders login form with all elements', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Please enter your details to access your account.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('name@company.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start engine/i })).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const passwordInput = screen.getByPlaceholderText('••••••••')
    const toggleButton = screen.getByRole('button', { name: /eye|eyeoff/i })

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Click to show password
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    // Click again to hide
    await user.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('allows typing in email and password fields', async () => {
    const user = userEvent.setup()

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const emailInput = screen.getByPlaceholderText('name@company.com')
    const passwordInput = screen.getByPlaceholderText('••••••••')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('has navigation link to register page', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const signUpLink = screen.getByRole('link', { name: /sign up/i })
    expect(signUpLink).toHaveAttribute('href', '/auth/register')
  })

  it('has navigation link to home page', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

    const logoLink = screen.getByRole('link', { name: /car calling/i })
    expect(logoLink).toHaveAttribute('href', '/')
  })
})

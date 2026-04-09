import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LandingPage from './LandingPage'

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  ShieldCheck: () => 'ShieldCheck',
  Headset: () => 'Headset',
  BadgeDollarSign: () => 'BadgeDollarSign',
  Star: () => 'Star',
  ArrowRight: () => 'ArrowRight',
  Fuel: () => 'Fuel',
  Users: () => 'Users',
  Calendar: () => 'Calendar',
  Instagram: () => 'Instagram',
  Twitter: () => 'Twitter',
  Facebook: () => 'Facebook'
}))

// Mock components
vi.mock('../../components/layout/Navbar', () => ({
  default: ({ transparent }) => <nav data-testid="navbar" data-transparent={transparent}>Navbar</nav>
}))

vi.mock('../../components/layout/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>
}))

// Mock images
vi.mock('../../assets/landing/hero.png', () => ({ default: 'hero.png' }))
vi.mock('../../assets/landing/mercedes.png', () => ({ default: 'mercedes.png' }))
vi.mock('../../assets/landing/bmw.png', () => ({ default: 'bmw.png' }))
vi.mock('../../assets/landing/audi.png', () => ({ default: 'audi.png' }))

describe('LandingPage Integration Tests', () => {
  it('renders all main sections', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    // Check for main hero text (split across elements)
    expect(screen.getByText((content) => content.includes('Rent Your') && content.includes('Car with Ease'))).toBeInTheDocument()
    expect(screen.getByText(/Top picks from our luxury collection/)).toBeInTheDocument()
    expect(screen.getByText('Verified Security')).toBeInTheDocument()
    expect(screen.getByText('Find Your Next Ride Now!')).toBeInTheDocument()
  })

  it('renders navbar and footer components', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('has working navigation links', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    const browseCarsLink = screen.getByRole('link', { name: /browse available cars/i })
    expect(browseCarsLink).toHaveAttribute('href', '/browse-cars')

    const bookCarLink = screen.getByRole('link', { name: /book your car/i })
    expect(bookCarLink).toHaveAttribute('href', '/auth/register')
  })

  it('displays featured cars with correct information', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Mercedes-Benz S-Class')).toBeInTheDocument()
    expect(screen.getByText('BMW 7 Series')).toBeInTheDocument()
    expect(screen.getByText('E£ 1,200')).toBeInTheDocument()
  })

  it('has view details links for cars', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    const viewDetailsLinks = screen.getAllByRole('link', { name: /view details/i })
    expect(viewDetailsLinks.length).toBeGreaterThan(0)
    viewDetailsLinks.forEach(link => {
      expect(link.getAttribute('href')).toMatch(/^\/car\/\d+$/)
    })
  })

  it('displays benefit features', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    expect(screen.getByText('24/7 Support')).toBeInTheDocument()
    expect(screen.getByText('Best Price Guarantee')).toBeInTheDocument()
    expect(screen.getByText('Every vehicle undergoes rigorous safety checks.')).toBeInTheDocument()
  })
})
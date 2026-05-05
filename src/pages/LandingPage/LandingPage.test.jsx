import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LandingPage from './LandingPageReal'
import { apiCall } from '../../utils/api'

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

vi.mock('../../utils/api', () => ({
  apiCall: vi.fn(async () => ({
    data: [
      {
        _id: 'car-1',
        year: 2024,
        make: 'Mercedes-Benz',
        model: 'S-Class',
        dailyRate: 1200,
        category: 'Luxury Sedan',
        averageRating: 4.9,
        fuelType: 'Hybrid',
        seats: 5,
        images: [{ url: 'mercedes.png' }]
      },
      {
        _id: 'car-2',
        year: 2024,
        make: 'BMW',
        model: '7 Series',
        dailyRate: 1100,
        category: 'Executive Sedan',
        averageRating: 4.8,
        fuelType: 'Gasoline',
        seats: 5,
        images: [{ url: 'bmw.png' }]
      },
      {
        _id: 'car-3',
        year: 2024,
        make: 'Audi',
        model: 'RS 7',
        dailyRate: 1500,
        category: 'Sports Coupe',
        averageRating: 5.0,
        fuelType: 'Gasoline',
        seats: 4,
        images: [{ url: 'audi.png' }]
      }
    ]
  }))
}))

// Mock images
vi.mock('../../assets/landing/hero.png', () => ({ default: 'hero.png' }))

describe('LandingPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all main sections', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    // Check for main hero text (split across elements)
    expect(screen.getByText((content) => content.includes('Rent Your') && content.includes('Car with Ease'))).toBeInTheDocument()
    expect(screen.getByText(/Top picks from our live fleet/)).toBeInTheDocument()
    expect(screen.getByText('Verified Security')).toBeInTheDocument()
    expect(screen.getByText('Find Your Next Ride Now!')).toBeInTheDocument()
    expect(await screen.findByText('2024 Mercedes-Benz S-Class')).toBeInTheDocument()
  })

  it('renders navbar and footer components', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(await screen.findByText('2024 Mercedes-Benz S-Class')).toBeInTheDocument()
  })

  it('has working navigation links', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    const browseCarsLink = screen.getByRole('link', { name: /browse available cars/i })
    expect(browseCarsLink).toHaveAttribute('href', '/browse-cars')

    const bookCarLink = screen.getByRole('link', { name: /book your car/i })
    expect(bookCarLink).toHaveAttribute('href', '/auth/register')
    expect(await screen.findByText('2024 Mercedes-Benz S-Class')).toBeInTheDocument()
  })

  it('displays featured cars with correct information', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    expect(await screen.findByText('2024 Mercedes-Benz S-Class')).toBeInTheDocument()
    expect(await screen.findByText('2024 BMW 7 Series')).toBeInTheDocument()
    expect(await screen.findByText((content) => content.includes('1200.00'))).toBeInTheDocument()
  })

  it('loads featured cars from the existing cars list', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(apiCall).toHaveBeenCalledWith('/cars?limit=3&sortBy=averageRating&sortOrder=desc')
    })
  })

  it('has view details links for cars', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    const viewDetailsLinks = await screen.findAllByRole('link', { name: /view details/i })
    expect(viewDetailsLinks.length).toBeGreaterThan(0)
    viewDetailsLinks.forEach(link => {
      expect(link.getAttribute('href')).toContain('/car/')
    })
  })

  it('displays benefit features', async () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    )

    expect(screen.getByText('24/7 Support')).toBeInTheDocument()
    expect(screen.getByText('Best Price Guarantee')).toBeInTheDocument()
    expect(screen.getByText('Every vehicle undergoes rigorous safety checks.')).toBeInTheDocument()
    expect(await screen.findByText('2024 Mercedes-Benz S-Class')).toBeInTheDocument()
  })
})

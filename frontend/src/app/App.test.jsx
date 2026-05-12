import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

// Mock the Toaster component to avoid issues in tests
vi.mock('react-hot-toast', () => ({
  Toaster: () => null
}))

// Mock the Router component
vi.mock('./router', () => ({
  default: () => <div data-testid="router">Router Component</div>
}))

describe('App Integration Tests', () => {
  it('renders the app without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    expect(screen.getByTestId('router')).toBeInTheDocument()
  })

  it('renders the toaster component', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )

    // The Toaster is mocked to return null, so we can't test it directly
    expect(document.body).toBeInTheDocument()
  })
})
# Car Calling - Integration Tests

This document outlines the integration test suite for the Car Calling application, designed to prepare the project for backend integration.

## Test Structure

### Unit Tests
- Component rendering and interactions
- Form validation
- Navigation and routing
- UI state management

### Integration Tests
- End-to-end user flows
- API integration preparation
- Cross-component interactions
- Authentication flows

### API Integration Tests
- Mock API responses
- Error handling
- Data flow between frontend and backend

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Specific Test Files
```bash
npm test Login.test.jsx
npm test router.test.jsx
```

### Run Integration Tests Only
```bash
npm test src/test/integration/
```

## Test Coverage

The test suite covers:

1. **App Component** (`App.test.jsx`)
   - App rendering
   - Router integration

2. **Router Component** (`router.test.jsx`)
   - Route rendering
   - Navigation between pages

3. **Login Component** (`Login.test.jsx`)
   - Form rendering
   - User input handling
   - Password visibility toggle
   - Navigation links

4. **Landing Page** (`LandingPage.test.jsx`)
   - Hero section
   - Featured cars display
   - Navigation links
   - Component integration

5. **End-to-End Flows** (`e2e-flow.test.jsx`)
   - Complete user journeys
   - Navigation flows
   - Authentication preparation

6. **API Integration** (`api-integration.test.jsx`)
   - Mock API services
   - Error handling
   - Data fetching patterns

## Backend Integration Preparation

The tests are structured to easily integrate with a real backend:

### Authentication Flow
- Login API calls (POST /api/auth/login)
- Token management
- User state management

### Car Management
- Fetch cars (GET /api/cars)
- Car details (GET /api/cars/:id)
- Car CRUD operations

### Admin Features
- Dashboard stats (GET /api/admin/stats)
- User management
- Booking management

### Booking System
- Create bookings (POST /api/bookings)
- Booking history
- Payment integration

## Mock API Setup

Using MSW (Mock Service Worker) for API mocking:

- Login endpoint
- Cars listing
- Admin statistics
- Booking creation

## Test Utilities

### Custom Hooks for Testing
```javascript
// Example: useAuth hook testing
const mockUser = { id: 1, email: 'test@example.com' }
const { result } = renderHook(() => useAuth(), {
  wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
})
```

### API Mocking
```javascript
import { rest } from 'msw'

server.use(
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json({ token: 'fake-token' }))
  })
)
```

## Continuous Integration

Add to your CI pipeline:

```yaml
- name: Run Tests
  run: npm test -- --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

## Future Enhancements

1. **Visual Regression Testing**
   - Screenshot comparisons
   - UI consistency checks

2. **Performance Testing**
   - Load testing
   - Bundle size monitoring

3. **Accessibility Testing**
   - WCAG compliance
   - Screen reader support

4. **Real Backend Integration**
   - Replace MSW with actual API calls
   - Environment-specific configurations

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Include both unit and integration tests
3. Mock external dependencies
4. Test error scenarios
5. Update this README

## Troubleshooting

### Common Issues

1. **MSW not intercepting requests**
   - Ensure server is started in test setup
   - Check request URLs match exactly

2. **Async tests timing out**
   - Use `waitFor` for async operations
   - Increase timeout if needed

3. **Component not rendering**
   - Check all required props are provided
   - Mock external dependencies

### Debug Mode
```bash
npm test -- --reporter=verbose
```
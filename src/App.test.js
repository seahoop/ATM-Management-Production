// Behavior: Basic test suite for the main App component
// Exceptions: None
// Return: None (runs tests)
// Parameters: None

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

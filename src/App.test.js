import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect'
import App from './App';

test('renders the App component', () => {
  render(<App />);
  const linkElement = screen.getByText(/Todo List/i);
  expect(linkElement).toBeInTheDocument();
});

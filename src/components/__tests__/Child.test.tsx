import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Child from '../Child';
import { CounterProvider } from '../../context/CounterContext';

// Mock the CounterContext
jest.mock('../../context/CounterContext');

describe('Child Component', () => {
  const withinProvider = (children: React.ReactNode) => (
    render(<CounterProvider>
      {children}
    </CounterProvider>)
  );
  
  test('renders child component with correct title', () => {
    withinProvider(<Child />)

    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  test('displays initial count of 0', () => {
    withinProvider(<Child />)
    expect(screen.getByText('Current count: 33')).toBeInTheDocument();
  });

  test('increment button increases count', () => {
    withinProvider(<Child />)
    fireEvent.click(screen.getByText('Increment'));
    expect(screen.getByText('Current count: 34')).toBeInTheDocument();
  });

  test('decrement button decreases count', () => {
    withinProvider(<Child />)
    fireEvent.click(screen.getByText('Decrement'));
    expect(screen.getByText('Current count: 32')).toBeInTheDocument();
  });
}); 

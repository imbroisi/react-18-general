import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CounterProvider, useCounter } from '../CounterContext';

// Test component that uses the counter context
const TestComponent = () => {
  const { count, increment, decrement } = useCounter();
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={increment} data-testid="increment">Increment</button>
      <button onClick={decrement} data-testid="decrement">Decrement</button>
    </div>
  );
};

describe('CounterContext', () => {
  test('provides initial count of 0', () => {
    render(
      <CounterProvider>
        <TestComponent />
      </CounterProvider>
    );
    
    expect(screen.getByTestId('count')).toHaveTextContent('-1');
  });

  test('increment increases count by 1', () => {
    render(
      <CounterProvider>
        <TestComponent />
      </CounterProvider>
    );
    
    fireEvent.click(screen.getByTestId('increment'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  test('decrement decreases count by 1', () => {
    render(
      <CounterProvider>
        <TestComponent />
      </CounterProvider>
    );
    
    fireEvent.click(screen.getByTestId('decrement'));
    expect(screen.getByTestId('count')).toHaveTextContent('-2');
  });

  test('useCounter throws error when used outside provider', () => {
    const consoleError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useCounter must be used within a CounterProvider');
    
    console.error = consoleError;
  });
}); 

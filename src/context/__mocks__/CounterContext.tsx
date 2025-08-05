import React, { createContext, useContext, useState } from 'react';

interface CounterContextType {
  count: number;
  increment: () => void;
  decrement: () => void;
}

interface CounterProviderProps {
  children: React.ReactNode;
}

/**
 *   MOCKED Context
 */

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export const useCounter = () => {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error('useCounter must be used within a CounterProvider');
  }
  return context;
};

export const CounterProvider = ({ children }: CounterProviderProps) => {
  const [count, setCount] = useState(33);

  const increment = () => {
    setCount(prev => prev + 1);
  }
  const decrement = () => setCount(prev => prev - 1);

  return (
    <CounterContext.Provider value={{ count, increment, decrement }}>
      {children}
    </CounterContext.Provider>
  );
}; 


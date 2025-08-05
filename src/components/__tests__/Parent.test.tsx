import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
// import Parent from '../Parent';
import Main from '../Main';
import { CounterProvider } from '../../context/CounterContext';

// Explicitly tell Jest to use our mock
jest.mock('../../context/CounterContext');
jest.mock('../../components/Child');

const parentComponent = React.Children.toArray(<Main />)[0];

describe('Parent Component', () => {

  const renderComponent = () => (
    render(
      <CounterProvider>
        {parentComponent}
      </CounterProvider>)
  );

  test('renders parent component with correct title', () => {
    renderComponent();

    screen.debug(); // This will log the current state of the DOM
    expect(screen.getByText('Parent Component')).toBeInTheDocument();
  });

  test('renders child component', () => {
      renderComponent();

    // screen.debug(); // This will log the current state of the DOM
    const childCountId = screen.getByTestId('childCountId')
    // console.log(childCountId);

    expect(childCountId).toHaveTextContent("33");

    // screen.debug(); // This will log the current state of the DOM

    const buttonInc = screen.getByTestId('abc');
    expect(buttonInc).toBeInTheDocument();

    fireEvent.click(buttonInc);

    // screen.debug(); // This will log the current state of the DOM
    
    expect(screen.getByTestId('childCountId')).toHaveTextContent("34");
  });
});


// src/hooks/useCalculator.js
import { useState, useCallback } from 'react';

const calculate = (a, b, operation) => {
  switch (operation) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b !== 0 ? a / b : 'Error'; // Keep existing error string
    default: return b;
  }
};

export function useCalculator() {
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState('');
  const [prevValue, setPrevValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [resetDisplay, setResetDisplay] = useState(false);

  const handleNumberClick = useCallback((number) => {
    if (display === '0' || resetDisplay) {
      setDisplay(number);
      setResetDisplay(false);
    } else {
      setDisplay(display + number);
    }
  }, [display, resetDisplay]);

  const handleOperatorClick = useCallback((op) => {
    const currentValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(currentValue);
      setHistory(`${currentValue} ${op}`);
    } else if (operation) {
      const result = calculate(prevValue, currentValue, operation);
      // Check for the specific 'Error' string returned by calculate
      if (result === 'Error') {
        setDisplay('Error');
        setHistory(''); // Clear history on error
        setPrevValue(null);
        setOperation(null);
        setResetDisplay(true);
        return;
      }
      setPrevValue(result);
      setDisplay(String(result));
      setHistory(`${result} ${op}`);
    } else {
       setPrevValue(currentValue);
       setHistory(`${currentValue} ${op}`);
    }

    setOperation(op);
    setResetDisplay(true);
  }, [display, prevValue, operation]);

  const handleDecimalClick = useCallback(() => {
    if (resetDisplay) {
      setDisplay('0.');
      setResetDisplay(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, resetDisplay]);

  const handleEqualsClick = useCallback(() => {
    if (prevValue !== null && operation) {
      const currentValue = parseFloat(display);
      const result = calculate(prevValue, currentValue, operation);

      if (result === 'Error') {
        setDisplay('Error');
        setHistory('');
        setPrevValue(null);
        setOperation(null);
        setResetDisplay(true);
        return;
      }

      setDisplay(String(result));
      setHistory(`${prevValue} ${operation} ${currentValue} =`);
      setPrevValue(null);
      setOperation(null);
      setResetDisplay(true);
    }
  }, [display, prevValue, operation]);

  const handleClearClick = useCallback(() => {
    setDisplay('0');
    setHistory('');
    setPrevValue(null);
    setOperation(null);
    setResetDisplay(false);
  }, []);

  const handleSignChange = useCallback(() => {
    if (display !== '0' && display !== 'Error') {
        setDisplay(display.charAt(0) === '-' ? display.slice(1) : '-' + display);
    }
  }, [display]);

  const handlePercentage = useCallback(() => {
    // Avoid performing percentage on 'Error'
    if (display !== 'Error') {
        const val = parseFloat(display) / 100;
        setDisplay(String(val));
        // Consider if display should be reset after %
        // setResetDisplay(true);
    }
  }, [display]);

  return {
    display,
    history,
    handlers: {
      handleNumberClick,
      handleOperatorClick,
      handleDecimalClick,
      handleEqualsClick,
      handleClearClick,
      handleSignChange,
      handlePercentage,
    }
  };
}
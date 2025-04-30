// src/components/Calculator.js
import React from 'react';
import { Container, createStyles } from '@mantine/core';
import { useCalculator } from '../hooks/useCalculator'; // Adjust path if needed
import { CalculatorDisplay } from './CalculatorDisplay';   // Adjust path
import { CalculatorKeypad } from './CalculatorKeypad';    // Adjust path

// Styles specific to the overall calculator container
const useStyles = createStyles((theme) => ({
  calculator: {
    maxWidth: 320,
    margin: '40px auto',
    padding: 0, // Container itself has no padding
    overflow: 'hidden', // Needed for border radius clipping
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    borderRadius: theme.radius.md, // Overall container radius
    border: `1px solid ${theme.colors.gray[3]}`, // Optional: Subtle border
  },
}));

export function Calculator() {
  const { classes } = useStyles();
  // Get state and handlers object from the custom hook
  const { display, history, handlers } = useCalculator();

  return (
    <Container className={classes.calculator} p={0}>
      <CalculatorDisplay display={display} history={history} />
      <CalculatorKeypad handlers={handlers} />
    </Container>
  );
}
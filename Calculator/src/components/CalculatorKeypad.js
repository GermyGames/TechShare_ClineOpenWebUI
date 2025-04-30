// src/components/CalculatorKeypad.js
import React from 'react';
import { Grid, Button, createStyles } from '@mantine/core';

// Reusable Button component specific to the calculator layout
const CalcButton = ({ onClick, className, span = 3, children }) => (
  <Grid.Col span={span}>
    <Button fullWidth className={className} onClick={onClick}>
      {children}
    </Button>
  </Grid.Col>
);

// Styles for the Keypad and its buttons
const useStyles = createStyles((theme) => ({
  button: {
    height: '64px',
    fontSize: '20px',
    fontWeight: 400,
    borderRadius: 0,
    border: `1px solid ${theme.colors.gray[2]}`,
    '&:not(:first-of-type)': {
       borderLeft: 0, // Avoid double borders horizontally
    },
    '&:nth-child(n+5)': { // Apply to buttons from the second row onwards
       borderTop: 0, // Avoid double borders vertically
    },
  },
  operatorButton: {
    backgroundColor: theme.colors.blue[6],
    color: 'white',
    '&:hover': {
      backgroundColor: theme.colors.blue[7],
    },
  },
  equalsButton: {
    backgroundColor: theme.colors.orange[6],
    color: 'white',
    '&:hover': {
      backgroundColor: theme.colors.orange[7],
    },
  },
  clearButton: {
    backgroundColor: theme.colors.red[6],
    color: 'white',
    '&:hover': {
      backgroundColor: theme.colors.red[7],
    },
  },
   // Ensure bottom corners are rounded for the last row
   grid: {
    '& .mantine-Grid-col:nth-last-child(-n+2) button': { // Target last two buttons (0 and .)
      borderBottomLeftRadius: theme.radius.md,
    },
    '& .mantine-Grid-col:nth-last-child(1) button': { // Target last button (=)
      borderBottomRightRadius: theme.radius.md,
      borderBottomLeftRadius: 0, // Reset if needed
    },
   }
}));

// Keypad component receives handlers
export function CalculatorKeypad({ handlers }) {
  const { classes } = useStyles();

  // Button configuration helpers using handlers passed via props
  const createNumberButton = (num) => ({
    label: num,
    onClick: () => handlers.handleNumberClick(num),
  });

  const createOperatorButton = (op) => ({
    label: op,
    onClick: () => handlers.handleOperatorClick(op),
    className: classes.operatorButton
  });

  const generateNumberRow = (startNum) => [
      createNumberButton(String(startNum)),
      createNumberButton(String(startNum + 1)),
      createNumberButton(String(startNum + 2))
    ];

  const calcButtons = [
    // Row 1
    [
      { label: 'AC', onClick: handlers.handleClearClick, className: classes.clearButton },
      { label: '+/-', onClick: handlers.handleSignChange },
      { label: '%', onClick: handlers.handlePercentage },
      createOperatorButton('÷')
    ],
    // Row 2
    [...generateNumberRow(7), createOperatorButton('×')],
    // Row 3
    [...generateNumberRow(4), createOperatorButton('-')],
    // Row 4
    [...generateNumberRow(1), createOperatorButton('+')],
    // Row 5
    [
      { ...createNumberButton('0'), span: 6 },
      { label: '.', onClick: handlers.handleDecimalClick, className: classes.operatorButton },
      { label: '=', onClick: handlers.handleEqualsClick, className: classes.equalsButton }
    ]
  ];

  return (
    <Grid gutter={0} m={0} className={classes.grid}>
      {calcButtons.map((row, rowIndex) => (
        <React.Fragment key={`row-${rowIndex}`}>
          {row.map((button, buttonIndex) => (
            <CalcButton
              key={`button-${rowIndex}-${buttonIndex}`}
              span={button.span || 3}
              className={`${classes.button} ${button.className || ''}`}
              onClick={button.onClick}
            >
              {button.label}
            </CalcButton>
          ))}
        </React.Fragment>
      ))}
    </Grid>
  );
}
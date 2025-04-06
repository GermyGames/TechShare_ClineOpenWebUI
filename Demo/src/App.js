import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  Text, 
  Grid, 
  Button, 
  MantineProvider, 
  createStyles 
} from '@mantine/core';

const useStyles = createStyles((theme) => ({
  calculator: {
    maxWidth: 320,
    margin: '40px auto',
    padding: 0,
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    borderRadius: theme.radius.md,
  },
  display: {
    backgroundColor: theme.colors.blue[9],
    padding: '25px 15px',
    textAlign: 'right',
    borderRadius: '0',
  },
  displayText: {
    fontSize: 36,
    color: 'white',
    fontWeight: 300,
    fontFamily: 'monospace',
  },
  historyText: {
    fontSize: 14,
    color: theme.colors.gray[3],
    fontFamily: 'monospace',
    height: 20,
  },
  button: {
    height: '64px',
    fontSize: '20px',
    fontWeight: 400,
    borderRadius: 0,
    border: `1px solid ${theme.colors.gray[2]}`,
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
}));

// Calculator button component to reduce duplication
const CalcButton = ({ onClick, className, span = 3, children }) => (
  <Grid.Col span={span}>
    <Button fullWidth className={className} onClick={onClick}>
      {children}
    </Button>
  </Grid.Col>
);

function Calculator() {
  const { classes } = useStyles();
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState('');
  const [prevValue, setPrevValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [resetDisplay, setResetDisplay] = useState(false);

  const handleNumberClick = (number) => {
    if (display === '0' || resetDisplay) {
      setDisplay(number);
      setResetDisplay(false);
    } else {
      setDisplay(display + number);
    }
  };

  const handleOperatorClick = (op) => {
    const currentValue = parseFloat(display);
    
    if (prevValue === null) {
      setPrevValue(currentValue);
      setHistory(`${currentValue} ${op}`);
    } else if (operation) {
      const result = calculate(prevValue, currentValue, operation);
      setPrevValue(result);
      setDisplay(String(result));
      setHistory(`${result} ${op}`);
    }
    
    setOperation(op);
    setResetDisplay(true);
  };

  const handleDecimalClick = () => {
    if (resetDisplay) {
      setDisplay('0.');
      setResetDisplay(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleEqualsClick = () => {
    const currentValue = parseFloat(display);
    
    if (prevValue !== null && operation) {
      const result = calculate(prevValue, currentValue, operation);
      setDisplay(String(result));
      setHistory(`${prevValue} ${operation} ${currentValue} =`);
      setPrevValue(null);
      setOperation(null);
      setResetDisplay(true);
    }
  };

  const handleClearClick = () => {
    setDisplay('0');
    setHistory('');
    setPrevValue(null);
    setOperation(null);
    setResetDisplay(false);
  };

  const handleSignChange = () => {
    setDisplay(display.charAt(0) === '-' ? display.slice(1) : '-' + display);
  };

  const handlePercentage = () => {
    const val = parseFloat(display) / 100;
    setDisplay(String(val));
  };

  const calculate = (a, b, operation) => {
    switch (operation) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 'Error';
      default: return b;
    }
  };

  // Define button types and their properties
  const createNumberButton = (num) => ({
    label: num,
    onClick: () => handleNumberClick(num),
  });

  const createOperatorButton = (op) => ({
    label: op,
    onClick: () => handleOperatorClick(op),
    className: classes.operatorButton
  });

  // Helper to generate number buttons for a row
  const generateNumberRow = (startNum) => {
    return [
      createNumberButton(startNum.toString()),
      createNumberButton((startNum + 1).toString()),
      createNumberButton((startNum + 2).toString())
    ];
  };

  // Define operators
  const operators = [
    { symbol: '÷', position: 0 },
    { symbol: '×', position: 1 },
    { symbol: '-', position: 2 },
    { symbol: '+', position: 3 }
  ];

  // Define calculator buttons configuration using the helper functions
  const calcButtons = [
    // Row 1 - Special functions
    [
      { label: 'AC', onClick: handleClearClick, className: classes.clearButton },
      { label: '+/-', onClick: handleSignChange },
      { label: '%', onClick: handlePercentage },
      createOperatorButton(operators[0].symbol)
    ],
    // Row 2 - Numbers 7-9 and multiplication
    [...generateNumberRow(7), createOperatorButton(operators[1].symbol)],
    // Row 3 - Numbers 4-6 and subtraction
    [...generateNumberRow(4), createOperatorButton(operators[2].symbol)],
    // Row 4 - Numbers 1-3 and addition
    [...generateNumberRow(1), createOperatorButton(operators[3].symbol)],
    // Row 5 - Zero, decimal, and equals
    [
      { ...createNumberButton('0'), span: 6 },
      { label: '.', onClick: handleDecimalClick },
      { label: '=', onClick: handleEqualsClick, className: classes.equalsButton }
    ]
  ];

  return (
    <Container className={classes.calculator} p={0}>
      <Paper className={classes.display}>
        <Text className={classes.historyText}>{history}</Text>
        <Text className={classes.displayText}>{display}</Text>
      </Paper>
      
      <Grid gutter={0} m={0}>
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
    </Container>
  );
}

function App() {
  return (
    <MantineProvider
      theme={{
        colorScheme: 'light',
        fontFamily: 'Roboto, sans-serif',
        colors: {
          blue: ['#E7F5FF', '#D0EBFF', '#A5D8FF', '#74C0FC', '#4DABF7', '#339AF0', '#228BE6', '#1C7ED6', '#1971C2', '#1864AB'],
          gray: ['#F8F9FA', '#F1F3F5', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#868E96', '#495057', '#343A40', '#212529'],
        },
      }}
    >
      <Calculator />
    </MantineProvider>
  );
}

export default App;

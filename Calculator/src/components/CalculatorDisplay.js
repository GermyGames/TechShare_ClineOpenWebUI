// src/components/CalculatorDisplay.js
import React from 'react';
import { Paper, Text, createStyles } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  display: {
    backgroundColor: theme.colors.blue[9],
    padding: '25px 15px',
    textAlign: 'right',
    borderTopLeftRadius: theme.radius.md, // Apply radius here
    borderTopRightRadius: theme.radius.md,
  },
  displayText: {
    fontSize: 36,
    color: 'white',
    fontWeight: 300,
    fontFamily: 'monospace',
    minHeight: '1.2em',
    wordBreak: 'break-all',
    marginRight: '0.5em',
  },
  historyText: {
    fontSize: 14,
    color: theme.colors.gray[3],
    fontFamily: 'monospace',
    height: 20,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
}));

export function CalculatorDisplay({ display, history }) {
  const { classes } = useStyles();
  return (
    <Paper className={classes.display} p={0}>
      <Text className={classes.historyText}>{history}</Text>
      <Text className={classes.displayText}>{display}</Text>
    </Paper>
  );
}
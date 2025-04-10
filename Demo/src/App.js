// src/App.js
import React from 'react';
import { MantineProvider } from '@mantine/core';
import { Calculator } from './components/Calculator'; // Adjust path

function App() {
  return (
    <MantineProvider
      theme={{
        colorScheme: 'light',
        fontFamily: 'Roboto, sans-serif',
        radius: { md: 8 }, // Example radius
        colors: {
          blue: ['#E7F5FF', '#D0EBFF', '#A5D8FF', '#74C0FC', '#4DABF7', '#339AF0', '#228BE6', '#1C7ED6', '#1971C2', '#1864AB'],
          gray: ['#F8F9FA', '#F1F3F5', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#868E96', '#495057', '#343A40', '#212529'],
          red: ['#FFF5F5', '#FFE3E3', '#FFC9C9', '#FFA8A8', '#FF8787', '#FF6B6B', '#FA5252', '#F03E3E', '#E03131', '#C92A2A'],
          orange: ['#FFF4E6', '#FFE8CC', '#FFD8A8', '#FFC078', '#FFA94D', '#FF922B', '#FD7E14', '#F76707', '#E8590C', '#D9480F'],
        },
      }}
      withGlobalStyles
      withNormalizeCSS
    >
      <Calculator />
    </MantineProvider>
  );
}

export default App;
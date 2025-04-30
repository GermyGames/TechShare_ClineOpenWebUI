import  { StrictMode } from 'react'
import './styles/index.css'
import '@mantine/core/styles.css'
import { MantineProvider, createTheme, MantineThemeOverride } from '@mantine/core';
import AINewsAggregator from './components/domain/FeedReader'


const themeOverride: MantineThemeOverride = createTheme({
	colors: {
	  brandDark: [
		'#E8E7FF',
		'#CFCBFF',
		'#B6B0FF',
		'#9D94FF',
		'#8479FF',
		'#1A0B26', // Index 5
		'#1A0B26',
		'#1A0B26',
		'#1A0B26',
		'#1A0B26',
	  ],
	  brandPurple: [
		'#F2E7FF',
		'#D5BFFF',
		'#B897FF',
		'#A73BFF', // Index 3
		'#A73BFF', // Index 4
		'#A73BFF', // Index 5
		'#A73BFF',
		'#902EE6',
		'#7A22CC',
		'#6418B3',
	  ],
	  darkBg: [
		'#C1C2C5',
		'#A6A7AB',
		'#909296',
		'#5C5F66',
		'#373A40',
		'#2C2E33',
		'#25262B',
		'#1A1B1E',
		'#141517',
		'#0F0F0F', // Index 9
	  ],
	},
  });
  
  function AppEntry() {
	// Always use dark color scheme for AltDesign
	const colorScheme = 'dark';
  
	// No-op: always dark mode, no persistence needed
  
	const theme = { ...themeOverride, colorScheme };
  
	return (
	  <StrictMode>
		{/* <AltDesign /> */}
		<MantineProvider withCssVariables theme={theme} defaultColorScheme="dark">
		  <AINewsAggregator />
		</MantineProvider>
	  </StrictMode>
	);
  }

  export default AppEntry;
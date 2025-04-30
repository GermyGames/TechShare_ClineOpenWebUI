
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import '@mantine/core/styles.css'
import AppEntry from './App.tsx';




createRoot(document.getElementById('root')!).render(<AppEntry />);

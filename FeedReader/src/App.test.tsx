import { render, screen, act } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import AppEntry from './App';

describe('App Component', () => {
  test('renders without crashing', async () => {
    await act(async () => {
      render(
        <MantineProvider defaultColorScheme="dark">
          <AppEntry />
        </MantineProvider>
      );
    });
    // Check for the FEED button which we know exists
    expect(screen.getByText('FEED')).toBeInTheDocument();
  });
});
// Import testing library jest-dom matchers
import '@testing-library/jest-dom';

// Mock CSS modules
const mockCssModule = {};
jest.mock('*.module.css', () => mockCssModule);
jest.mock('*.css', () => mockCssModule);

// Mock matchMedia for components that use it
window.matchMedia = window.matchMedia || function () {
  return {
    media: '',
    matches: false,
    onchange: null,
    addListener: function () {},
    removeListener: function () {},
    addEventListener: function () {},
    removeEventListener: function () {},
    dispatchEvent: function () { return true; }
  };
};

// Mock ResizeObserver
window.ResizeObserver = window.ResizeObserver || class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

interface ImportMetaEnv {
  VITE_YOUTUBE_API_KEY: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
  [key: string]: string | boolean | undefined;
}

// Mock Vite's import.meta.env
const importMetaEnv: ImportMetaEnv = {
  VITE_YOUTUBE_API_KEY: 'test-api-key',
  // Add any other environment variables your tests need here
  MODE: 'test',
  DEV: true,
  PROD: false,
  SSR: false,
};

// Create a proxy to handle any unknown properties
const handler: ProxyHandler<ImportMetaEnv> = {
  get: (target: ImportMetaEnv, prop: string) => {
    if (prop in target) {
      return target[prop];
    }
    return undefined;
  },
};

const env = new Proxy(importMetaEnv, handler);

if (typeof window !== 'undefined') {
  // @ts-expect-error - Adding import.meta to window
  window.import = { meta: { env } };
}


if (typeof global !== 'undefined') {
  // @ts-expect-error - Adding import.meta to global
  global.import = { meta: { env } };
}
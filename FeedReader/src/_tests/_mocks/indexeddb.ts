import type { Source } from '../../types';

// Mock IndexedDB implementation
const mockDB: { sources?: Source[] } = {};

export const loadSources = async (): Promise<Source[]> => {
  return mockDB.sources || [];
};

export const saveSources = async (sources: Source[]): Promise<void> => {
  mockDB.sources = sources;
}; 
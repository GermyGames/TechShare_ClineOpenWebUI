import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchYouTubeFeed } from '../../services/youtubeService';
import type { Source } from '../../types';

describe('youtubeService', () => {
  const mockApiKey = 'test-api-key';
  const mockSource: Source = {
    id: 1,
    name: 'Test Channel',
    url: 'https://www.youtube.com/@testchannel',
    type: 'youtube',
    selected: true
  };

  beforeEach(() => {
    vi.stubEnv('VITE_YOUTUBE_API_KEY', mockApiKey);
    vi.resetAllMocks();
  });

  it('should return empty array when no YouTube sources are provided', async () => {
    const result = await fetchYouTubeFeed([]);
    expect(result).toEqual([]);
  });

  it('should handle missing API key gracefully', async () => {
    vi.stubEnv('VITE_YOUTUBE_API_KEY', '');
    const result = await fetchYouTubeFeed([mockSource]);
    expect(result).toEqual([]);
  });

  it('should handle invalid YouTube URLs', async () => {
    const invalidSource: Source = {
      ...mockSource,
      url: 'https://invalid-url.com'
    };
    const result = await fetchYouTubeFeed([invalidSource]);
    expect(result).toEqual([]);
  });

  it('should handle API errors gracefully', async () => {
    global.fetch = vi.fn().mockImplementation(() => 
      Promise.resolve({
        ok: false,
        statusText: 'Not Found'
      })
    );

    const result = await fetchYouTubeFeed([mockSource]);
    expect(result).toEqual([]);
  });

  it('should successfully fetch and transform YouTube feed items', async () => {
    // TODO: Implement this test during presentation
    // This test should verify that the service correctly:
    // 1. Fetches channel ID from handle
    // 2. Fetches videos for the channel
    // 3. Transforms the response into FeedItemType objects
    // 4. Returns the correct array of items
  });
}); 
import type { Source, FeedItem } from '../../types';

export const fetchYouTubeFeed = async (_activeSources: Source[]): Promise<FeedItem[]> => {
  // Return mock data for testing
  return [
    {
      id: 'mock-youtube-1',
      title: 'Mock YouTube Video 1',
      url: 'https://youtube.com/watch?v=mock1',
      source: 'youtube',
      sourceType: 'youtube',
      timestamp: new Date(),
      upvotes: null,
      views: null,
    },
  ];
}; 
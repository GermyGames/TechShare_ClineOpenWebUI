import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchRedditFeed, RedditPost } from '../../services/redditService';
import type { Source, FeedItem } from '../../types';

// Mock the global fetch API
window.fetch = vi.fn() as unknown as typeof fetch;

describe('fetchRedditFeed', () => {
  const mockRedditPost = (overrides: Partial<RedditPost> = {}): RedditPost => ({
    id: 't3_12345',
    title: 'Test Post',
    created_utc: Math.floor(Date.now() / 1000),
    permalink: '/r/test/comments/12345/test_post',
    ups: 100,
    link_flair_text: null,
    stickied: false,
    ...overrides
  });

  const createMockResponse = (data: unknown) => {
    return {
      ok: true,
      json: vi.fn().mockResolvedValue(data)
    };
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('handles successful API response with valid posts', async () => {
    const mockSource: Source = {
      id: 1,
      name: 'Test Subreddit',
      type: 'reddit',
      url: 'https://www.reddit.com/r/test',
      flairs: [],
      selected: true
    };

    const mockData = {
      data: {
        after: 't3_67890',
        children: [
          { data: mockRedditPost() },
          { data: mockRedditPost({ id: 't3_67890' }) }
        ]
      }
    };

    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(createMockResponse(mockData));

    const result = await fetchRedditFeed([mockSource], {});

    expect(result.items).toHaveLength(2);
    expect(result.newAfterTokens[mockSource.id]).toBe('t3_67890');
    expect(result.items[0]).toMatchObject<Partial<FeedItem>>({
      title: 'Test Post',
      source: 'Test Subreddit',
      sourceType: 'reddit'
    });
  });

  it('handles network errors', async () => {
    const mockSource: Source = {
      id: 1,
      name: 'Test Subreddit',
      type: 'reddit',
      url: 'https://www.reddit.com/r/test',
      flairs: [],
      selected: true
    };

    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    const result = await fetchRedditFeed([mockSource], {});

    expect(result.items).toHaveLength(0);
    expect(result.newAfterTokens[mockSource.id]).toBeNull();
  });

  it('handles invalid response structure', async () => {
    const mockSource: Source = {
      id: 1,
      name: 'Test Subreddit',
      type: 'reddit',
      url: 'https://www.reddit.com/r/test',
      flairs: [],
      selected: true
    };

    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({})
    });

    const result = await fetchRedditFeed([mockSource], {});

    expect(result.items).toHaveLength(0);
    expect(result.newAfterTokens[mockSource.id]).toBeNull();
  });

  it('filters by flair when configured', async () => {
    const mockSource: Source = {
      id: 1,
      name: 'Test Subreddit',
      type: 'reddit',
      url: 'https://www.reddit.com/r/test',
      flairs: ['Technology', 'Science'],
      selected: true
    };

    const mockData = {
      data: {
        after: null,
        children: [
          { data: mockRedditPost({ link_flair_text: 'Technology' }) },
          { data: mockRedditPost({ link_flair_text: 'Politics' }) },
          { data: mockRedditPost({ link_flair_text: null }) }
        ]
      }
    };

    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(createMockResponse(mockData));

    const result = await fetchRedditFeed([mockSource], {});

    expect(result.items).toHaveLength(1);
    expect(result.items[0].flair).toBe('Technology');
  });

  it('excludes stickied posts', async () => {
    const mockSource: Source = {
      id: 1,
      name: 'Test Subreddit',
      type: 'reddit',
      url: 'https://www.reddit.com/r/test',
      flairs: [],
      selected: true
    };

    const mockData = {
      data: {
        after: null,
        children: [
          { data: mockRedditPost({ stickied: true }) },
          { data: mockRedditPost({ stickied: false }) }
        ]
      }
    };

    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(createMockResponse(mockData));

    const result = await fetchRedditFeed([mockSource], {});

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Test Post');
  });

  it('handles pagination tokens', async () => {
    const mockSource: Source = {
      id: 1,
      name: 'Test Subreddit',
      type: 'reddit',
      url: 'https://www.reddit.com/r/test',
      flairs: [],
      selected: true
    };

    const mockData = {
      data: {
        after: 't3_67890',
        children: [
          { data: mockRedditPost() }
        ]
      }
    };

    (window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(createMockResponse(mockData));

    const result1 = await fetchRedditFeed([mockSource], {});
    const result2 = await fetchRedditFeed([mockSource], result1.newAfterTokens);

    expect(result1.newAfterTokens[mockSource.id]).toBe('t3_67890');
    expect(result2.newAfterTokens[mockSource.id]).toBe('t3_67890');
    expect(window.fetch).toHaveBeenCalledTimes(2);
  });
});
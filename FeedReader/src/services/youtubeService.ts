import type { Source, FeedItem as FeedItemType } from '../types';

type YouTubeSearchItem = {
  id: { videoId: string };
  snippet: { title: string; publishedAt: string };
};

export const fetchYouTubeFeed = async (activeSources: Source[]): Promise<FeedItemType[]> => {
  const youtubeSources = activeSources.filter(s => s.type === 'youtube');
  const items: FeedItemType[] = [];
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error("YouTube API key is missing. Please set VITE_YOUTUBE_API_KEY in your .env file.");
    return items;
  }

  const extractHandle = (url: string): string | null => {
    const match = url.match(/youtube\.com\/@([A-Za-z0-9\-_]+)/i);
    return match ? match[1] : null;
  };

  await Promise.all(
    youtubeSources.map(async (source) => {
      try {
        const handle = extractHandle(source.url);
        if (!handle) {
          console.error(`Could not extract handle from YouTube URL: ${source.url}`);
          return;
        }

        const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=id,snippet&forHandle=${handle}&key=${apiKey}`;
        console.log(`Fetching channelId for handle: ${handle} using URL: ${channelUrl}`);
        const channelRes = await fetch(channelUrl);
        if (!channelRes.ok) {
          console.error(`Failed to fetch channelId for handle ${handle}: ${channelRes.statusText}`);
          return;
        }
        const channelData = await channelRes.json();
        console.log("Channel API response:", channelData);
        const channelId = channelData.items?.[0]?.id;
        if (!channelId) {
          console.error(`No channelId found for handle ${handle}. API response:`, channelData);
          return;
        }

        const videosUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10&type=video`;
        console.log(`Fetching videos for channelId: ${channelId} using URL: ${videosUrl}`);
        const videosRes = await fetch(videosUrl);
        if (!videosRes.ok) {
          console.error(`Failed to fetch videos for channelId ${channelId}: ${videosRes.statusText}`);
          return;
        }
        const videosData = await videosRes.json();
        console.log("Videos API response:", videosData);
        if (!videosData.items) {
          console.error(`No videos found for channelId ${channelId}. API response:`, videosData);
          return;
        }

        (videosData.items as YouTubeSearchItem[]).forEach((video) => {
          items.push({
            id: video.id.videoId,
            title: video.snippet.title,
            source: source.name,
            sourceType: 'youtube',
            url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
            timestamp: new Date(video.snippet.publishedAt),
            upvotes: null,
            views: null
          });
        });
      } catch {
        // Ignore errors for now
      }
    })
  );

  return items;
}; 
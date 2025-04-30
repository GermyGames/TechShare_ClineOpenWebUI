import type { Source, FeedItem } from '../../types';
import type { RedditPost } from '../../services/redditService';

export const fetchRedditFeed = async (
  activeSources: Source[],
  afterTokens: Record<number, string | null> = {}
): Promise<{ items: FeedItem[]; newAfterTokens: Record<number, string | null> }> => {
  const items: FeedItem[] = [];
  const newAfterTokens: Record<number, string | null> = { ...afterTokens };

  for (const source of activeSources) {
    if (source.type !== 'reddit') continue;

    try {
      const urlPath = new URL(source.url).pathname;
      let apiUrl = `/reddit_proxy${urlPath}`;
      if (!apiUrl.endsWith('/')) apiUrl += '/';
      apiUrl += '.json?limit=50';

      const afterToken = afterTokens[source.id];
      if (afterToken) {
        apiUrl += `&after=${afterToken}`;
      }

      const response = await fetch(apiUrl, { headers: { 'Accept': 'application/json' } });
      if (!response.ok) {
        newAfterTokens[source.id] = null;
        continue;
      }

      const data = await response.json();
      if (!data?.data?.children) {
        newAfterTokens[source.id] = null;
        continue;
      }

      newAfterTokens[source.id] = data.data.after;

      data.data.children.forEach((child: { data: RedditPost }) => {
        const post = child.data;
        if (!post || post.stickied) return;
        if (Array.isArray(source.flairs) && source.flairs.length > 0) {
          if (!post.link_flair_text || !source.flairs.includes(post.link_flair_text)) return;
        }
        items.push({
          id: post.id,
          title: post.title,
          source: source.name,
          sourceType: 'reddit',
          url: 'https://www.reddit.com' + post.permalink,
          timestamp: new Date(post.created_utc * 1000),
          upvotes: post.ups ?? null,
          views: null,
          flair: post.link_flair_text || undefined
        });
      });
    } catch {
      newAfterTokens[source.id] = null;
    }
  }

  return { items, newAfterTokens };
}; 
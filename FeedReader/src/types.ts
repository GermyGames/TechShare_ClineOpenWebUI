export interface Source {
  id: number;
  name: string;
  url: string;
  type: 'reddit' | 'youtube';
  selected: boolean;
  flairs?: string[];
}

export interface RedditPost {
  id: string;
  title: string;
  permalink: string;
  created_utc: number;
  ups: number;
  stickied: boolean;
  link_flair_text?: string;
}

export interface FeedItem {
  id: string;
  title: string;
  source: string;
  sourceType: 'reddit' | 'youtube';
  url: string;
  timestamp: Date;
  upvotes: number | null;
  views: number | null;
  flair?: string;
}
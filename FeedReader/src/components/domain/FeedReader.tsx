import { useState, useEffect } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Button,
  Divider,
  TextInput,
  Select,
} from '@mantine/core';
import dayjs from 'dayjs';
import FeedList from '../ui/FeedList';
import SourcesPanel from './SourcesPanel';
import FeedItem from '../ui/FeedItem';
import { colors } from '../../theme/colors';
import { branding } from '../../theme/branding';
import type { Source, FeedItem as FeedItemType } from '../../types';
import { loadSources, saveSources } from '../../utils/indexeddb';
import { fetchRedditFeed } from '../../services/redditService';
import { fetchYouTubeFeed } from '../../services/youtubeService';


const AINewsAggregator: React.FC = () => {

  const [sources, setSources] = useState<Source[]>([
    { id: 1, name: 'r/MachineLearning', url: 'https://www.reddit.com/r/MachineLearning/', type: 'reddit', selected: true, flairs: [] },
    { id: 2, name: 'r/artificial', url: 'https://www.reddit.com/r/artificial/', type: 'reddit', selected: true, flairs: [] },
    { id: 3, name: 'r/AIresearch', url: 'https://www.reddit.com/r/AIresearch/', type: 'reddit', selected: true, flairs: [] },
    { id: 4, name: 'Two Minute Papers', url: 'https://www.youtube.com/@TwoMinutePapers', type: 'youtube', selected: true },
    { id: 5, name: 'AI Explained', url: 'https://www.youtube.com/@ai-explained', type: 'youtube', selected: true },
    { id: 6, name: 'r/OpenAI', url: 'https://www.reddit.com/r/OpenAI/', type: 'reddit', selected: false, flairs: [] },
    { id: 7, name: 'Yannic Kilcher', url: 'https://www.youtube.com/@YannicKilcher', type: 'youtube', selected: false },
  ]);

  // Load sources from IndexedDB on mount
  useEffect(() => {
    loadSources().then((dbSources) => {
      if (dbSources && dbSources.length > 0) {
        setSources(dbSources);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save sources to IndexedDB whenever they change
  useEffect(() => {
    saveSources(sources);
  }, [sources]);

  const [newSource, setNewSource] = useState<{name: string; url: string; type: 'reddit' | 'youtube'}>({
    name: '',
    url: '',
    type: 'reddit'
  });
  
  const [activeTab, setActiveTab] = useState<'feed' | 'sources'>('feed');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [feed, setFeed] = useState<FeedItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
// Date range dropdown state
const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('all');

// Add state to store the 'after' token for each Reddit source
  const [redditAfterTokens, setRedditAfterTokens] = useState<Record<number, string | null>>({});
  // Add state to track if more Reddit posts are being loaded
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Initial feed load useEffect
  useEffect(() => {
    let cancelled = false;
    const loadInitialFeed = async () => {
      setLoading(true);
      setFeed([]); // Clear feed before initial load
      setRedditAfterTokens({}); // Reset tokens
      const activeSources = sources.filter(s => s.selected);

      // Fetch Reddit and YouTube data in parallel
      const [redditResult, youtubeFeed] = await Promise.all([
        fetchRedditFeed(activeSources, {}), // Initial fetch has no tokens
        fetchYouTubeFeed(activeSources)
      ]);

      if (!cancelled) {
        // Merge and sort by timestamp
        const merged = [...redditResult.items, ...youtubeFeed].sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
        setFeed(merged);
        setRedditAfterTokens(redditResult.newAfterTokens); // Store initial tokens
        setLoading(false);
      }
    };
    loadInitialFeed();
    return () => { cancelled = true; };
  }, [sources]);

  // getRandomTitle removed (no longer needed)

  const toggleSourceSelection = (id: number): void => {
    setSources(sources.map(source =>
      source.id === id ? { ...source, selected: !source.selected } : source
    ));
  };

  const addNewSource = (): void => {
    if (newSource.name && newSource.url) {
      setSources([...sources, {
        id: Date.now(), // Use timestamp for a more unique ID
        ...newSource,
        selected: true,
        // Initialize flairs for new reddit sources
        ...(newSource.type === 'reddit' && { flairs: [] })
      }]);
      setNewSource({ name: '', url: '', type: 'reddit' });
    }
  };

  const deleteSource = (id: number): void => {
    setSources(sources.filter(source => source.id !== id));
  };

  const filteredFeed = feed.filter(item => {
    // Search filter
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source.toLowerCase().includes(searchTerm.toLowerCase());

    // Date range filter
    let inDateRange = true;
    if (dateRange !== 'all') {
      const now = dayjs();
      let start: dayjs.Dayjs;
      switch (dateRange) {
        case 'today':
          start = now.startOf('day');
          break;
        case 'week':
          start = now.startOf('week');
          break;
        case 'month':
          start = now.startOf('month');
          break;
        case 'year':
          start = now.startOf('year');
          break;
        default:
          start = dayjs('1970-01-01');
      }
      inDateRange = dayjs(item.timestamp).isAfter(start) || dayjs(item.timestamp).isSame(start);
    }

    return matchesSearch && inDateRange;
  });

  const filteredSources = sources.filter(source =>
    source.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
// Function to load more Reddit posts
  const loadMoreRedditPosts = async () => {
    setLoadingMore(true);
    const activeRedditSources = sources.filter(s => s.selected && s.type === 'reddit');
    const tokensToUse = Object.entries(redditAfterTokens)
      .filter(([id, token]) => token !== null && activeRedditSources.some(s => s.id === parseInt(id)))
      .reduce((acc, [id, token]) => {
        acc[parseInt(id)] = token;
        return acc;
      }, {} as Record<number, string | null>);

    // Only fetch if there are active sources with valid 'after' tokens
    if (Object.keys(tokensToUse).length > 0) {
      const { items: newRedditItems, newAfterTokens } = await fetchRedditFeed(activeRedditSources, tokensToUse);

      // Filter out potential duplicates just in case
      const currentFeedIds = new Set(feed.map(item => item.id));
      const uniqueNewItems = newRedditItems.filter(item => !currentFeedIds.has(item.id));

      // Append new items and re-sort
      setFeed(prevFeed =>
        [...prevFeed, ...uniqueNewItems].sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        )
      );
      // Update tokens, preserving existing ones not part of this fetch
      setRedditAfterTokens(prevTokens => ({ ...prevTokens, ...newAfterTokens }));
    }
    setLoadingMore(false);
  };

  // Check if there are more Reddit posts potentially available
  const canLoadMoreReddit = sources.some(s => s.selected && s.type === 'reddit' && redditAfterTokens[s.id]);

  // Pagination logic
  const totalPages = Math.ceil(filteredFeed.length / itemsPerPage);
  const paginatedFeed = filteredFeed.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  // --- END LOGIC COPY ---


  // Find the first selected source and its top post for the source bar

  return (
    <Paper radius={0} style={{ backgroundColor: colors.bgColor, minHeight: '100vh' }}>
      <Stack gap="md" p="md">
        {/* Header Section */}
        <Group justify="space-between" align="center" wrap="nowrap">
          {/* Logo */}
          <Group gap={2} wrap="nowrap">
            <img src="LOGO.svg" alt="Logo" />
           
          </Group>
          {/* Search Bar (moved up) */}
          <TextInput
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            size="sm"
            style={{
              flex: 1,
              margin: "0 24px",
              minWidth: 200,
              maxWidth: 600,
              background: "transparent"
            }}
          />

          {/* Feed/Sources Buttons */}
          <Group gap={0} wrap="nowrap">
            <Button
              variant={activeTab === 'feed' ? "filled" : "outline"}
              onClick={() => setActiveTab('feed')}
              styles={{
                root: {
                  backgroundColor: activeTab === 'feed' ? colors.darkPurple : colors.bgColor,
                  color: 'white',
                  borderColor: branding.primaryColor,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderRightWidth: 0,
                  borderTopLeftRadius: '50px',
                  borderBottomLeftRadius: '50px',
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  height: '36px',
                  paddingLeft: '32px',
                  paddingRight: '32px',
                  fontSize: '14px',
                  minWidth: '120px',
                  transition: 'background-color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    backgroundColor: colors.hoverDarkPurple,
                  },
                },
                label: {
                  whiteSpace: 'nowrap',
                  width: '100%',
                  textAlign: 'center',
                }
              }}
            >
              FEED
            </Button>
            <Button
              variant={activeTab === 'sources' ? "filled" : "outline"}
              onClick={() => setActiveTab('sources')}
              styles={{
                root: {
                  backgroundColor: activeTab === 'sources' ? colors.darkPurple : colors.bgColor,
                  color: 'white',
                  borderColor: branding.primaryColor,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderLeftColor: branding.primaryColor,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: '50px',
                  borderBottomRightRadius: '50px',
                  height: '36px',
                  paddingLeft: '32px',
                  paddingRight: '32px',
                  fontSize: '14px',
                  minWidth: '120px',
                  transition: 'background-color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': {
                    backgroundColor: colors.hoverBgColor,
                  },
                },
                label: {
                  whiteSpace: 'nowrap',
                  width: '100%',
                  textAlign: 'center',
                }
              }}
            >
              SOURCES
            </Button>
          </Group>
        </Group>

        {/* Divider */}
        <Divider size={4} color={colors.darkPurple} />


        {/* Search Bar */}

        {/* Date Range Pickers */}
        <Select
          data={[
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'year', label: 'This Year' },
            { value: 'all', label: 'All Time' }
          ]}
          value={dateRange}
          onChange={(v: string | null) => setDateRange(v as typeof dateRange)}
          size="sm"
          style={{ maxWidth: 180, margin: "8px 0" }}
        />
        {/* Main Content */}
        <div style={{ padding: 0 }}>
          {activeTab === 'feed' ? (
            <>
              <FeedList
                items={paginatedFeed}
                loading={loading}
                renderItem={(item) => (
                  <FeedItem
                    style={{
                      border: `1px solid ${colors.darkPurple}`,
                    }}
                  >
                    <div>
                      <Group gap="xs" align="center" mb={2}>
                        <Text
                          c={item.sourceType === "reddit" ? colors.redditOrange : colors.mainPurple}
                          size="sm"
                          fw={700}
                        >
                          {item.source}
                        </Text>
                        {item.flair && item.sourceType === 'reddit' && (
                          <Text size="xs" c={colors.mainPurple} style={{ border: `1px solid ${colors.mainPurple}`, padding: '1px 4px', borderRadius: '4px' }}>
                            {item.flair}
                          </Text>
                        )}
                      </Group>
                      <Text c="white" size="sm" fw={500} style={{ marginBottom: 2 }}>
                        {item.title}
                      </Text>
                      <Text c={branding.primaryColor} size="sm" fw={500} style={{ marginBottom: 2 }}>
                        {formatTimeAgo(item.timestamp)}
                        {item.upvotes !== null ? ` | ${item.upvotes} upvotes` : ''}
                        {item.views !== null ? ` | ${item.views.toLocaleString()} views` : ''}
                      </Text>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: branding.primaryColor,
                          fontWeight: 500,
                          fontSize: "0.95em",
                          textDecoration: "none"
                        }}
                      >
                        View source
                      </a>
                    </div>
                  </FeedItem>
                )}
              />
              {/* Load More Button */}
              {!loading && canLoadMoreReddit && ( // Show only when not initial loading and more might exist
                <Group justify="center" mt="md">
                  <Button
                    onClick={loadMoreRedditPosts}
                    disabled={loadingMore} // Disable while loading more
                    variant="outline"
                    styles={{ root: { borderColor: colors.mainPurple, color: colors.mainPurple } }}
                  >
                    {loadingMore ? 'Loading...' : 'Load More Reddit Posts'}
                  </Button>
                </Group>
              )}
              {/* Pagination Controls */}
            {activeTab === 'feed' && totalPages > 1 && (
              <Group justify="center" mt="md">
                <Button
                  size="xs"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  variant="outline"
                  style={{ minWidth: 32 }}
                  aria-label="Previous Page"
                  styles={{
                    root: {
                      color: colors.mainPurple,
                      borderColor: colors.mainPurple,
                      '&:not(:disabled):hover': {
                        backgroundColor: colors.hoverDarkPurple,
                      },
                    },
                  }}
                >
                  ◄
                </Button>
                {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                  let start = 1;
                  let end = totalPages;
                  if (totalPages > 10) {
                    if (page <= 6) {
                      start = 1;
                      end = 10;
                    } else if (page >= totalPages - 4) {
                      start = totalPages - 9;
                      end = totalPages;
                    } else {
                      start = page - 5;
                      end = page + 4;
                    }
                  }
                  const pageNum = start + i;
                  if (pageNum > end) return null;
                  return (
                    <Button
                      key={pageNum}
                      size="xs"
                      variant={pageNum === page ? "filled" : "outline"}
                      onClick={() => setPage(pageNum)}
                      style={{
                        margin: "0 2px",
                        minWidth: 32,
                        fontWeight: pageNum === page ? "bold" : "normal",
                      }}
                      aria-current={pageNum === page ? "page" : undefined}
                      styles={(theme, props) => ({
                        root: {
                          backgroundColor: props.variant === 'filled' ? colors.mainPurple : undefined,
                          color: props.variant === 'outline' ? colors.mainPurple : 'white',
                          borderColor: colors.mainPurple,
                          '&:not(:disabled):hover': {
                            backgroundColor: props.variant === 'filled' ? colors.darkPurple : colors.hoverDarkPurple,
                          },
                        },
                      })}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  size="xs"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  variant="outline"
                  style={{ minWidth: 32 }}
                  aria-label="Next Page"
                  styles={{
                    root: {
                      color: colors.mainPurple,
                      borderColor: colors.mainPurple,
                      '&:not(:disabled):hover': {
                        backgroundColor: colors.hoverDarkPurple,
                      },
                    },
                  }}
                >
                  ►
                </Button>
              </Group>
            )}
            </>
          ) : (
            <SourcesPanel
              newSource={newSource}
              setNewSource={setNewSource}
              addNewSource={addNewSource}
              filteredSources={filteredSources}
              toggleSourceSelection={toggleSourceSelection}
              deleteSource={deleteSource}
              updateSourceFlairs={(id: number, flairs: string[]) => {
                setSources((prev) =>
                  prev.map((s) =>
                    s.id === id ? { ...s, flairs } : s
                  )
                );
              }}
            />
          )}
        </div>
      </Stack>
    </Paper>
  );
};

export default AINewsAggregator;
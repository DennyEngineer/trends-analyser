import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SocialMediaInsights = ({ searchTerm }) => {
  const [data, setData] = useState({
    platformData: {
      reddit: {
        totalPosts: 0,
        subscribers: 0,
        sentiment: 'Neutral'
      }
    },
    trending: {
      topics: [],
      relatedPosts: [],
      articles: []
    },
    recentActivity: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Reddit data - completely free, no API key required
  const fetchRedditData = async () => {
    if (!searchTerm) {
      // If no search term, fetch general popular posts
      try {
        const response = await axios.get('https://www.reddit.com/r/popular.json');
        processRedditData(response.data.data.children, 'popular');
      } catch (err) {
        console.error('Error fetching popular Reddit data:', err.message);
        setError(`Failed to fetch Reddit data: ${err.message}`);
      }
      return;
    }

    try {
      // Search for the term on Reddit
      const response = await axios.get(`https://www.reddit.com/search.json?q=${encodeURIComponent(searchTerm)}&sort=relevance&limit=25`);
      processRedditData(response.data.data.children, searchTerm);
    } catch (err) {
      console.error('Error fetching Reddit search data:', err.message);
      setError(`Failed to fetch Reddit data: ${err.message}`);
    }
  };

  // Process Reddit data
  const processRedditData = (posts, query) => {
    if (!posts || posts.length === 0) {
      setError('No Reddit data found for this query');
      return;
    }

    // Extract subreddits to get topic areas
    const subreddits = [...new Set(posts.map(post => post.data.subreddit))];
    
    // Get recent activity from posts
    const activity = posts.slice(0, 5).map(post => ({
      title: post.data.title,
      content: post.data.selftext ? post.data.selftext.substring(0, 150) + '...' : 'Link post',
      platform: `r/${post.data.subreddit}`,
      engagement: post.data.score
    }));

    // Calculate sentiment based on upvote ratio
    let overallSentiment = 'Neutral';
    const avgUpvoteRatio = posts.reduce((sum, post) => sum + (post.data.upvote_ratio || 0.5), 0) / posts.length;
    if (avgUpvoteRatio > 0.7) overallSentiment = 'Positive';
    if (avgUpvoteRatio < 0.4) overallSentiment = 'Negative';

    // Get subscriber count from the first subreddit
    const subscribers = posts[0]?.data?.subreddit_subscribers || 0;

    setData(prev => ({
      platformData: {
        reddit: {
          totalPosts: posts.length,
          subscribers: subscribers,
          sentiment: overallSentiment
        }
      },
      trending: {
        topics: subreddits.slice(0, 5),
        relatedPosts: posts.map(post => post.data.title).slice(0, 10),
        articles: posts.filter(post => post.data.url && !post.data.url.includes('reddit.com'))
          .map(post => ({
            title: post.data.title,
            url: post.data.url,
            source: new URL(post.data.url).hostname.replace('www.', '')
          })).slice(0, 5)
      },
      recentActivity: activity
    }));
  };

  // Fetch Hacker News data - another reliable, free API
  const fetchHackerNewsData = async () => {
    try {
      // Get top stories from Hacker News
      const topStoriesResponse = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
      const topStoryIds = topStoriesResponse.data.slice(0, 10); // Get top 10 stories
      
      // Fetch details for each story
      const storyPromises = topStoryIds.map(id => 
        axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      );
      
      const storyResponses = await Promise.all(storyPromises);
      const stories = storyResponses.map(response => response.data);
      
      // Update state with HN data
      setData(prev => ({
        ...prev,
        trending: {
          ...prev.trending,
          topics: [...prev.trending.topics, 'Technology', 'Programming', 'Startups'].filter((v, i, a) => a.indexOf(v) === i),
          articles: [
            ...prev.trending.articles,
            ...stories.filter(story => story.url).map(story => ({
              title: story.title,
              url: story.url,
              source: new URL(story.url).hostname.replace('www.', '')
            }))
          ].slice(0, 10)
        }
      }));
    } catch (err) {
      console.error('Error fetching Hacker News data:', err.message);
      // We don't set error here since this is supplementary data
    }
  };

  // Load everything
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Run fetches in parallel
        await Promise.all([
          fetchRedditData(),
          fetchHackerNewsData()
        ]);
      } catch (err) {
        console.error('Error during data fetching:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchTerm]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !data.recentActivity.length) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Social Media Insights {searchTerm ? `for "${searchTerm}"` : '(Popular Topics)'}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Analysis from Reddit and Hacker News
          {error && <span className="text-amber-600 ml-1"> (Note: {error})</span>}
        </p>
      </div>

      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        {/* Trending Topics */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Trending Topics</h4>
          <ul className="list-disc pl-5 space-y-1">
            {data.trending.topics.length > 0 ? (
              data.trending.topics.slice(0, 5).map((topic, index) => (
                <li key={index} className="text-gray-700">
                  {topic}
                </li>
              ))
            ) : (
              <li className="text-gray-500">No trending topics found</li>
            )}
          </ul>
        </div>

        {/* Related Posts */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-2">Related Posts</h4>
          <ul className="flex flex-wrap gap-2">
            {data.trending.relatedPosts.length > 0 ? (
              data.trending.relatedPosts.slice(0, 5).map((post, index) => (
                <li key={index}>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">{post.substring(0, 30)}{post.length > 30 ? '...' : ''}</span>
                </li>
              ))
            ) : (
              <span className="text-gray-500">No related posts found</span>
            )}
          </ul>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Recent Activity</h4>
          {data.recentActivity.length > 0 ? (
            <ul className="space-y-3">
              {data.recentActivity.map((item, index) => (
                <li key={index} className="bg-gray-50 p-3 rounded-md">
                  <div className="font-medium text-gray-800">{item.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {item.content && item.content.length > 0 ? item.content : 'Link post'}
                  </div>
                  <div className="flex justify-between mt-2">
                    <div className="text-xs text-gray-500">Community: {item.platform}</div>
                    <div className="text-xs text-gray-500">Votes: {item.engagement}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 text-sm">No recent activity found</div>
          )}
        </div>

        {/* Sentiment Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
            <span className="block text-xs text-gray-500">Overall Sentiment</span>
            <span
              className={`block text-lg font-semibold ${
                data.platformData.reddit.sentiment === 'Positive'
                  ? 'text-green-600'
                  : data.platformData.reddit.sentiment === 'Negative'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}
            >
              {data.platformData.reddit.sentiment}
            </span>
          </div>

          <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
            <span className="block text-xs text-gray-500">Content Count</span>
            <span className="block text-lg font-semibold">{data.trending.articles.length}</span>
          </div>
        </div>

        {/* Reddit Stats */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Reddit Stats</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
              <span className="block text-xs text-gray-500">Posts Found</span>
              <span className="block text-lg font-semibold">
                {data.platformData.reddit.totalPosts.toLocaleString()}
              </span>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
              <span className="block text-xs text-gray-500">Subscribers</span>
              <span className="block text-lg font-semibold">
                {data.platformData.reddit.subscribers.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* External Articles */}
        {data.trending.articles.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Related Articles</h4>
            <ul className="space-y-2">
              {data.trending.articles.slice(0, 5).map((article, index) => (
                <li key={index} className="border-l-4 border-blue-500 pl-3 py-1">
                  <div className="font-medium text-gray-800">{article.title}</div>
                  <div className="text-xs text-gray-500">Source: {article.source}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaInsights; 
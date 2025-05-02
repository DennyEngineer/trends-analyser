import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import axios from 'axios';

// Components
import SearchSection from './components/SearchSection';
import MarketTrends from './components/MarketTrends';
import RecentSearches from './components/RecentSearches';
import LoadingSpinner from './components/LoadingSpinner';
import SocialMediaInsights from './components/SocialMediaInsights';
import CompetitorAnalysis from './components/CompetitorAnalysis';
import RelatedTopics from './components/RelatedTopics';
import GeographicDistribution from './components/GeographicDistribution';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [marketData, setMarketData] = useState(null);
  const [socialData, setSocialData] = useState(null);
  const [competitorData, setCompetitorData] = useState(null);
  const [relatedTopics, setRelatedTopics] = useState(null);
  const [geographicData, setGeographicData] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('market');

  // Fetch recent searches on component mount
  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        const q = query(collection(db, 'searches'), orderBy('timestamp', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);
        setRecentSearches(querySnapshot.docs.map(doc => doc.data().term));
      } catch (err) {
        console.error("Error fetching recent searches:", err);
      }
    };
    fetchRecentSearches();
  }, []);

  const analyzeMarket = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Save search to Firestore
      try {
        await addDoc(collection(db, 'searches'), {
          term: searchTerm,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error("Error saving search:", err);
      }

      // Fetch all data except social (since it handles its own API calls)
      const results = await Promise.allSettled([
        fetchMarketData(searchTerm),
        fetchCompetitorData(searchTerm),  
        fetchRelatedTopics(searchTerm),   
        fetchGeographicData(searchTerm),  
      ]);
      
      // Process results
      setMarketData(results[0].status === 'fulfilled' ? results[0].value : null);
      setCompetitorData(results[1].status === 'fulfilled' ? results[1].value : null);
      setRelatedTopics(results[2].status === 'fulfilled' ? results[2].value : null);
      setGeographicData(results[3].status === 'fulfilled' ? results[3].value : null);
      
      // Set socialData to trigger the SocialMediaInsights component
      setSocialData({ searchTerm });
      
      // Update recent searches
      setRecentSearches(prev => [searchTerm, ...prev.filter(term => term !== searchTerm)].slice(0, 5));
      
    } catch (err) {
      setError('A network error occurred. Please try again later.');
      console.error("Unexpected error in analyzeMarket:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMarketData = async (term) => {
    try {
      let financialData = {};
      let newsData = { articles: [] };
      let trendData = [];
  
      // Step 1: Try FinancialModelingPrep for company symbol lookup
      const fmpSearchResponse = await axios.get(
        `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(term)}&limit=1&apikey=4sVlYXxSLmI0WFfvUxiFg3sdRSerPm0K`
      );
  
      if (fmpSearchResponse.data && Array.isArray(fmpSearchResponse.data) && fmpSearchResponse.data.length > 0) {
        const symbol = fmpSearchResponse.data[0].symbol;
  
        // Step 2: Get company profile from FMP
        const profileResponse = await axios.get(
          `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=4sVlYXxSLmI0WFfvUxiFg3sdRSerPm0K`
        );
  
        if (profileResponse.data && Array.isArray(profileResponse.data) && profileResponse.data.length > 0) {
          financialData = profileResponse.data[0];
        }
  
        // Step 3: Get historical price data for interestOverTime
        const historicalResponse = await axios.get(
          `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?timeseries=12&apikey=4sVlYXxSLmI0WFfvUxiFg3sdRSerPm0K`
        );
  
        if (historicalResponse.data && Array.isArray(historicalResponse.data.historical) && historicalResponse.data.historical.length > 0) {
          trendData = historicalResponse.data.historical
            .slice(0, 12)
            .reverse()
            .map(day => ({
              month: new Date(day.date).toLocaleString('default', { month: 'short' }),
              value: parseFloat(day.close).toFixed(2)
            }));
        }
      }
  
      // Step 4: Try Gnews.io for news if FMP didn't return any yet
      if (!Object.keys(financialData).length && !newsData.articles.length) {
        const gnewsResponse = await axios.get(
          `https://gnews.io/api/v4/search?q=${encodeURIComponent(term)}&token=f116119c7413bb6d010e78ef7c80f1c7&max=10&lang=en`
        );
  
        if (gnewsResponse.data?.articles?.length > 0) {
          newsData.articles = gnewsResponse.data.articles.map(article => ({
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            source: { name: article.source },
            author: article.author || "Unknown",
            publishedAt: article.publishedAt,
            urlToImage: article.image || null
          }));
        }
      }
  
      // Step 5: If still no news, try NewsAPI.org
      if (!newsData.articles.length) {
        const newsApiResponse = await axios.get(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(term)}&apiKey=ced07dfe61ab4b98ab8275e8f0431720`
        );
  
        if (newsApiResponse.data?.articles?.length > 0) {
          newsData.articles = newsApiResponse.data.articles;
        }
      }
  
      // Step 6: Extract competitors from company profile if available
      let competitorList = [];
      if (financialData.competitors && Array.isArray(financialData.competitors)) {
        competitorList = financialData.competitors.slice(0, 5);
      } else {
        // Optional: Use Wikipedia as alternative to find possible competitors
        const wikiResponse = await axios.get(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}+competitors&format=json&origin=*`
        );
  
        if (wikiResponse.data?.query?.search?.length > 0) {
          competitorList = wikiResponse.data.query.search
            .slice(0, 5)
            .map(item => item.title);
        }
      }
  
      return {
        news: newsData,
        financials: financialData,
        trends: {
          interestOverTime: trendData,
          competitors: competitorList,
          marketSize: financialData.mktCap ? `${(financialData.mktCap / 1e9).toFixed(2)} Billion USD` : undefined,
          growthRate: financialData.revenuePercent || undefined
        }
      };
    } catch (error) {
      console.error("Error fetching real market data:", error.message);
      return {
        news: { articles: [] },
        financials: {},
        trends: {
          interestOverTime: [],
          competitors: [],
          marketSize: undefined,
          growthRate: undefined
        }
      };
    }
  };

// In App.js - Updated fetchCompetitorData with free APIs only
const fetchCompetitorData = async (term) => {
  try {
    // 1. Find competitors using Wikipedia and Wikidata
    let competitors = [];
    
    // First try Wikidata (free)
    try {
      const wikidataResponse = await axios.get(
        `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${term}&language=en&format=json&origin=*`
      );
      
      if (wikidataResponse.data?.search?.length > 0) {
        const entityId = wikidataResponse.data.search[0].id;
        const entityResponse = await axios.get(
          `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${entityId}&format=json&origin=*`
        );
        
        // Look for competitors property (P463)
        if (entityResponse.data?.entities?.[entityId]?.claims?.P463) {
          const competitorIds = entityResponse.data.entities[entityId].claims.P463
            .map(item => item.mainsnak.datavalue.value.id);
          
          // Fetch competitor names
          const competitorResponse = await axios.get(
            `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${competitorIds.join('|')}&props=labels&format=json&origin=*&languages=en`
          );
          
          competitors = Object.values(competitorResponse.data?.entities || {})
            .map(entity => entity.labels?.en?.value)
            .filter(name => name);
        }
      }
    } catch (wikidataError) {
      console.log("Wikidata API error:", wikidataError.message);
    }

    // 2. Fallback to Wikipedia search if no competitors found
    if (competitors.length === 0) {
      try {
        const wikiResponse = await axios.get(
          `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${term}+competitors&format=json&origin=*`,
          { timeout: 5000 }
        );
        
        if (wikiResponse.data?.query?.search?.length > 0) {
          competitors = wikiResponse.data.query.search
            .slice(0, 5)
            .map(item => item.title.replace(' (company)', '').replace(' (business)', ''));
        }
      } catch (wikiError) {
        console.warn("Wikipedia API error:", wikiError.message);
      }
    }

    // 3. Get financial data using Financial Modeling Prep (free tier available)
    let marketShare = [];
    let pricingComparison = [];
    
    try {
      // First get the main company's symbol
      const searchResponse = await axios.get(
        `https://financialmodelingprep.com/api/v3/search?query=${term}&limit=1&apikey=4sVlYXxSLmI0WFfvUxiFg3sdRSerPm0K` // Use 4sVlYXxSLmI0WFfvUxiFg3sdRSerPm0K key or get free API key
      );
      
      if (searchResponse.data?.length > 0) {
        const symbol = searchResponse.data[0].symbol;
        
        // Get company profile (includes competitors in free tier)
        const profileResponse = await axios.get(
          `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=4sVlYXxSLmI0WFfvUxiFg3sdRSerPm0K`
        );
        
        if (profileResponse.data?.length > 0) {
          const profile = profileResponse.data[0];
          
          // Market share based on market cap
          if (profile.mktCap && profile.competitors) {
            const totalMktCap = profile.competitors.reduce((sum, c) => sum + (c.mktCap || 0), profile.mktCap);
            marketShare = [
              { name: term, share: (profile.mktCap / totalMktCap) * 100 },
              ...profile.competitors.map(c => ({
                name: c.name,
                share: (c.mktCap / totalMktCap) * 100
              }))
            ];
          }
          
          // Pricing comparison (stock price as proxy)
          if (profile.price && profile.competitors) {
            pricingComparison = [
              { name: term, pricing: `$${profile.price.toFixed(2)}` },
              ...profile.competitors.map(c => ({
                name: c.name,
                pricing: c.price ? `$${c.price.toFixed(2)}` : 'N/A'
              }))
            ];
          }
        }
      }
    } catch (fmpError) {
      console.log("Financial Modeling Prep error:", fmpError.message);
    }

    // 4. Get strengths/weaknesses from news analysis (using free NewsAPI)
    let strengthsWeaknesses = {};
    try {
      const newsResponse = await axios.get(
        `https://newsapi.org/v2/everything?q=${term}&sortBy=popularity&pageSize=10&apiKey=ced07dfe61ab4b98ab8275e8f0431720`
      );
      
      if (newsResponse.data?.articles?.length > 0) {
        // Simple keyword analysis
        const positiveKeywords = ['innovative', 'leader', 'growth', 'strong', 'best', 'win', 'success'];
        const negativeKeywords = ['struggle', 'weak', 'decline', 'problem', 'issue', 'lose', 'fail'];
        
        strengthsWeaknesses[term] = {
          strengths: [],
          weaknesses: []
        };
        
        newsResponse.data.articles.forEach(article => {
          const content = `${article.title} ${article.description}`.toLowerCase();
          
          positiveKeywords.forEach(keyword => {
            if (content.includes(keyword) && !strengthsWeaknesses[term].strengths.includes(keyword)) {
              strengthsWeaknesses[term].strengths.push(keyword);
            }
          });
          
          negativeKeywords.forEach(keyword => {
            if (content.includes(keyword) && !strengthsWeaknesses[term].weaknesses.includes(keyword)) {
              strengthsWeaknesses[term].weaknesses.push(keyword);
            }
          });
        });
      }
    } catch (newsError) {
      console.log("News API error:", newsError.message);
    }

    return {
      directCompetitors: competitors,
      marketShare,
      strengthsWeaknesses,
      pricingComparison
    };
    
  } catch (error) {
    console.error("Error in fetchCompetitorData:", error);
    return {
      error: "Could not load competitor data"
    };
  }
};

const fetchRelatedTopics = async (term) => {
  try {
    let topics = [];

    try {
      // Fetch from Reddit's search API
      const response = await axios.get(
        `https://www.reddit.com/search.json?q=${encodeURIComponent(term)}&sort=relevance&limit=10`,
        { timeout: 5000 }
      );

      // Process Reddit posts
      if (response.data?.data?.children?.length > 0) {
        topics = response.data.data.children.map((child) => {
          const post = child.data;

          // Use upvote_ratio if available, otherwise fall back to a random relevance score
          const upvoteRatio = post.upvote_ratio !== undefined ? Math.round(post.upvote_ratio * 100) : null;
          const relevance = upvoteRatio ?? Math.floor(Math.random() * 100) + 1;

          // Generate a snippet from the selftext or title
          let snippet = post.selftext || post.title;
          if (snippet.length > 150) {
            snippet = snippet.substring(0, 150) + '...';
          }

          return {
            title: post.title,
            snippet: snippet,
            relevance: relevance
          };
        });
      }
    } catch (redditError) {
      console.warn("Reddit API error in topics, using mock data:", redditError.message);
    }

    // If no topics from Reddit, use mock data
    if (topics.length === 0) {
      topics = Array.from({ length: 10 }, (_, i) => ({
        title: `${term} related topic ${i + 1}`,
        snippet: `This is a snippet about ${term} and related concepts.`,
        relevance: Math.floor(Math.random() * 100) + 1
      }));
    }

    // Return the structured data
    return {
      topics: topics.slice(0, 10), // Ensure max 10 topics
      categories: ['Technology', 'Business', 'Consumer', 'Innovation', 'Trends'],
    };
  } catch (error) {
    // Fallback in case of any unexpected errors
    console.error("Error in fetchRelatedTopics:", error);
    return {
      topics: Array.from({ length: 10 }, (_, i) => ({
        title: `${term} related topic ${i + 1}`,
        snippet: `This is a snippet about ${term} and related concepts.`,
        relevance: Math.floor(Math.random() * 100) + 1
      })),
      categories: ['Technology', 'Business', 'Consumer', 'Innovation', 'Trends'],
    };
  }
};

  const fetchGeographicData = async (term) => {
    try {
      const regionCounts = {};
      const countryCounts = {};
  
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      await delay(1000);
  
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(term)}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MarketAnalysisApp/1.0 (youremail@example.com)'
          }
        }
      );
  
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(location => {
          const country = location.address?.country;
          const countryCode = location.address?.country_code?.toLowerCase();
  
          const regionMap = {
            us: 'North America',
            ca: 'North America',
            mx: 'Latin America',
            gb: 'Europe', fr: 'Europe', de: 'Europe',
            jp: 'Asia Pacific', cn: 'Asia Pacific', in: 'Asia Pacific',
            br: 'Latin America', za: 'Africa'
          };
  
          const region = regionMap[countryCode] || 'Other';
          regionCounts[region] = (regionCounts[region] || 0) + 1;
  
          if (country) {
            countryCounts[country] = (countryCounts[country] || 0) + 1;
          }
        });
      }
  
      const regions = Object.entries(regionCounts).map(([name, interest]) => ({
        name,
        interest
      }));
  
      const topCountries = Object.entries(countryCounts).map(([name, interest]) => ({
        name,
        interest
      }));
  
      return {
        regions,
        topCountries,
        urbanVsRural: {
          urban: 0,
          rural: 0,
          suburban: 0
        }
      };
    } catch (error) {
      console.error("Error fetching geographic data:", error.message);
      return {
        regions: [],
        topCountries: [],
        urbanVsRural: {
          urban: 0,
          rural: 0,
          suburban: 0
        }
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Market Trends & Consumer Behavior Analyzer
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <SearchSection 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                analyzeMarket={analyzeMarket}
                isLoading={isLoading}
                error={error}
              />
              
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  {(marketData || socialData || competitorData || relatedTopics || geographicData) && (
                    <div className="bg-white shadow overflow-hidden rounded-lg">
                      <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                          <button
                            onClick={() => setActiveTab('market')}
                            className={`${
                              activeTab === 'market'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                          >
                            Market Trends
                          </button>
                          <button
                            onClick={() => setActiveTab('social')}
                            className={`${
                              activeTab === 'social'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                          >
                            Social Insights
                          </button>
                          <button
                            onClick={() => setActiveTab('competitor')}
                            className={`${
                              activeTab === 'competitor'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                          >
                            Competitor Analysis
                          </button>
                        </nav>
                      </div>
                      
                      <div className="p-4">
                        {activeTab === 'market' && marketData && (
                          <MarketTrends 
                            searchTerm={searchTerm}
                            data={marketData} 
                          />
                        )}
                        
                        {activeTab === 'social' && socialData && (
                          <SocialMediaInsights
                            searchTerm={searchTerm}
                          />
                        )}
                        
                        {activeTab === 'competitor' && competitorData && (
                          <CompetitorAnalysis
                            searchTerm={searchTerm}
                            data={competitorData}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="lg:col-span-1">
              <RecentSearches 
                searches={recentSearches}
                setSearchTerm={setSearchTerm}
              />
              
              {geographicData && !isLoading && (
                <div className="mt-6">
                  <GeographicDistribution
                    searchTerm={searchTerm}
                    data={geographicData}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
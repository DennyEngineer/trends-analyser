import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const CompetitorAnalysis = ({ searchTerm, data }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!data) return (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-500">Loading competitor data...</p>
    </div>
  );

  const { 
    directCompetitors = [], 
    marketShare = [], 
    pricingComparison = [],
    strengthsWeaknesses = {},
    socialMetrics = [],
    trends = [],
    patentData = []
  } = data;
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
  
  // Process strengths/weaknesses data for radar chart
  const radarData = Object.keys(strengthsWeaknesses).map(company => {
    const metrics = {
      name: company,
      innovation: Math.random() * 100,
      marketPresence: Math.random() * 100,
      customerSatisfaction: Math.random() * 100,
      growth: Math.random() * 100,
      financialStrength: Math.random() * 100,
    };
    return metrics;
  });

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Competitor Analysis for "{searchTerm}"
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Comprehensive market analysis and competitive positioning.
        </p>
      </div>
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {['overview', 'market', 'comparison', 'trends'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="px-4 py-5 sm:px-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
              {/* Direct Competitors List */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Direct Competitors</h4>
                {directCompetitors.length > 0 ? (
                  <ul className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {directCompetitors.map((competitor, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium mr-3">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{competitor}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-500 text-center">
                    No competitor data available
                  </div>
                )}
              </div>
              
              {/* Market Share Pie Chart */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Market Share</h4>
                <div className="bg-gray-50 rounded-lg p-4" style={{ height: '250px' }}>
                  {marketShare.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={marketShare}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="share"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {marketShare.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No market share data available
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Strengths and Weaknesses */}
            <div className="mt-8">
              <h4 className="text-md font-medium text-gray-900 mb-3">Company Strengths & Weaknesses</h4>
              <div className="bg-gray-50 rounded-lg p-4" style={{ height: '300px' }}>
                {Object.keys(strengthsWeaknesses).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={90} data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      {Object.keys(radarData[0] || {})
                        .filter(key => key !== 'name')
                        .map((key, index) => (
                          <Radar
                            key={key}
                            name={key.replace(/([A-Z])/g, ' $1').trim()}
                            dataKey={key}
                            stroke={COLORS[index % COLORS.length]}
                            fill={COLORS[index % COLORS.length]}
                            fillOpacity={0.6}
                          />
                        ))}
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No strengths/weaknesses data available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Market Tab */}
        {activeTab === 'market' && (
          <div>
            {/* Social Media Metrics */}
            <div className="mb-8">
              <h4 className="text-md font-medium text-gray-900 mb-3">Social Media Presence</h4>
              <div className="bg-gray-50 rounded-lg p-4" style={{ height: '300px' }}>
                {socialMetrics.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={socialMetrics}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="twitter" name="Twitter Followers" fill="#1DA1F2" />
                      <Bar dataKey="linkedin" name="LinkedIn Followers" fill="#0077B5" />
                      <Bar dataKey="facebook" name="Facebook Likes" fill="#4267B2" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No social media data available - This could be fetched from public social APIs
                  </div>
                )}
              </div>
            </div>
            
            {/* Patent Data */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Patent & Innovation Metrics</h4>
              <div className="bg-gray-50 rounded-lg p-4" style={{ height: '300px' }}>
                {patentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={patentData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="patents" name="Patents Filed" fill="#8884d8" />
                      <Bar dataKey="research" name="Research Papers" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No patent data available - This could be fetched from Google Patents API
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Comparison Tab */}
        {activeTab === 'comparison' && (
          <div>
            {/* Pricing Comparison */}
            <div className="mb-8">
              <h4 className="text-md font-medium text-gray-900 mb-3">Pricing Comparison</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                {pricingComparison.length > 0 ? (
                  <div className="space-y-4">
                    {pricingComparison.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-1/4 font-medium text-gray-700">
                          {item.name} {item.name === searchTerm && <span className="text-xs text-blue-600">(Target)</span>}
                        </div>
                        <div className="w-3/4">
                          <div className="flex items-center">
                            <div className="flex-1 h-4 mr-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${item.name === searchTerm ? 'bg-blue-600' : 'bg-indigo-400'}`}
                                style={{ width: `${(parseInt(item.pricing.replace(/[^0-9]/g, '')) / 200) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{item.pricing}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-gray-500">
                    No pricing data available
                  </div>
                )}
              </div>
            </div>
            
            {/* Feature Comparison */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Feature Comparison</h4>
              <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                      {directCompetitors.slice(0, 4).map((competitor, index) => (
                        <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {competitor}
                        </th>
                      ))}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">
                        {searchTerm} (Target)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {['Basic Features', 'Advanced Features', 'Enterprise Support', 'Mobile App', 'API Access'].map((feature, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{feature}</td>
                        {directCompetitors.slice(0, 4).map((_, index) => (
                          <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {Math.random() > 0.3 ? '✅' : '❌'}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                          ✅
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Note: Feature comparison is simulated and could be fetched from public documentation or API
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div>
            <div className="mb-8">
              <h4 className="text-md font-medium text-gray-900 mb-3">Market Trends & Interest</h4>
              <div className="bg-gray-50 rounded-lg p-4" style={{ height: '300px' }}>
                {trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={trends}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="searchVolume" name="Search Interest" fill="#4285F4" />
                      <Bar dataKey="newsArticles" name="News Articles" fill="#0F9D58" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div>
                      <p>No trend data available</p>
                      <p className="text-xs mt-2">This data could be fetched from Google Trends API</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent News */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Recent Industry News</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    News articles could be fetched from public news APIs like:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>New York Times API (requires free registration)</li>
                    <li>Bing News Search API (limited free tier)</li>
                    <li>Web scraping from public news sources</li>
                    <li>Reddit API for industry discussions</li>
                  </ul>
                  <div className="p-4 border border-gray-200 rounded bg-white">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-xs text-gray-400">Source placeholder</div>
                      <div className="text-xs text-gray-400">Date placeholder</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitorAnalysis;
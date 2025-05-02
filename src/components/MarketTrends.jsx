import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MarketTrends({ searchTerm, data }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Market Trends for "{searchTerm}"
        </h3>
      </div>
      <div className="px-6 py-4 space-y-6">
        <div>
          <h4 className="text-md font-medium mb-2">Interest Over Time</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trends.interestOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Market Size</h4>
            <p className="text-2xl font-bold text-indigo-600">{data.trends.marketSize}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Growth Rate</h4>
            <p className="text-2xl font-bold text-green-600">{data.trends.growthRate}</p>
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium mb-2">Top Competitors</h4>
          <ul className="space-y-2">
            {data.trends.competitors.map((competitor, index) => (
              <li key={index} className="flex items-center">
                <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 mr-2"></span>
                {competitor}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-md font-medium mb-2">Recent News</h4>
          <div className="space-y-4">
            {data.news.articles.slice(0, 3).map((article, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                <h5 className="font-medium text-indigo-600 mb-1">{article.title}</h5>
                <p className="text-gray-600 text-sm mb-2">{article.description}</p>
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-500 hover:text-indigo-700"
                >
                  Read full article →
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
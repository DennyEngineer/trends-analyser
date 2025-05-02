import React from 'react';

const RelatedTopics = ({ searchTerm, data }) => {
  const { topics, categories, trendingArticles } = data;
  
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Related Topics
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Topics and articles related to "{searchTerm}".
        </p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        {/* Categories */}
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-900 mb-2">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <span 
                key={index} 
                className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
        
        {/* Trending Articles */}
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-900 mb-2">Trending Articles</h4>
          <ul className="space-y-3">
            {trendingArticles.map((article, index) => (
              <li key={index} className="bg-gray-50 rounded-lg p-3">
                <h5 className="text-sm font-medium text-gray-900">{article.title}</h5>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>{article.source}</span>
                  <span>{article.date}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Related Topics */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-2">All Related Topics</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            {topics.slice(0, 5).map((topic, index) => (
              <li key={index} className="flex items-center">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium mr-2">
                  {index + 1}
                </span>
                <span 
                  className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap" 
                  title={topic.title}
                >
                  {topic.title}
                </span>
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {topic.relevance}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RelatedTopics;
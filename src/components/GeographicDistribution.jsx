import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const GeographicDistribution = ({ searchTerm, data }) => {
  const { regions, topCountries, urbanVsRural } = data;
  
  // Sort regions by interest for better visualization
  const sortedRegions = [...regions].sort((a, b) => b.interest - a.interest);
  
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Geographic Distribution
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Regional interest in "{searchTerm}".
        </p>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        {/* Regions Chart */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Interest by Region</h4>
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedRegions}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" scale="band" width={100} />
                <Tooltip />
                <Bar dataKey="interest" fill="#8884d8" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Top Countries */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Top Countries</h4>
          <div className="space-y-3">
            {topCountries.map((country, index) => (
              <div key={index} className="flex items-center">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium mr-3">
                  {index + 1}
                </span>
                <span className="w-1/3 text-gray-700">{country.name}</span>
                <div className="w-2/3">
                  <div className="flex items-center">
                    <div className="flex-1 h-4 mr-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${country.interest}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{country.interest}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Urban vs Rural Distribution */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Urban vs Rural Distribution</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="inline-block w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {urbanVsRural.urban}%
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">Urban</p>
              </div>
              <div>
                <div className="inline-block w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                  {urbanVsRural.suburban}%
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">Suburban</p>
              </div>
              <div>
                <div className="inline-block w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                  {urbanVsRural.rural}%
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">Rural</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeographicDistribution;
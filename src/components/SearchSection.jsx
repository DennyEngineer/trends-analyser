export default function SearchSection({ searchTerm, setSearchTerm, analyzeMarket, isLoading, error }) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Analyze Market & Consumer Behavior
          </h3>
        </div>
        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <form onSubmit={analyzeMarket}>
            <div className="flex shadow-sm rounded-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-0 block w-full px-4 py-3 rounded-l-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search for a product, brand, or industry"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-r-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
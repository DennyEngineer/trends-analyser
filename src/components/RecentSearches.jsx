export default function RecentSearches({ searches, setSearchTerm }) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Recent Searches
          </h3>
        </div>
        <div className="px-6 py-4">
          {searches.length > 0 ? (
            <ul className="space-y-2">
              {searches.map((search, index) => (
                <li key={index}>
                  <button
                    onClick={() => setSearchTerm(search)}
                    className="text-indigo-600 hover:text-indigo-900 hover:underline"
                  >
                    {search}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent searches</p>
          )}
        </div>
      </div>
    );
  }
import React from 'react';
import { useAuth } from '../context/AuthContext';

const Portfolio = () => {
  const { user } = useAuth();

  const platforms = [
    {
      name: 'LeetCode',
      icon: '💻',
      color: 'yellow',
      username: user?.platforms?.leetcode,
      rating: user?.ratings?.leetcode,
      problems: user?.problems_solved?.leetcode,
      url: user?.platforms?.leetcode ? `https://leetcode.com/${user.platforms.leetcode}` : null
    },
    {
      name: 'Codeforces',
      icon: '🏆',
      color: 'blue',
      username: user?.platforms?.codeforces,
      rating: user?.ratings?.codeforces,
      problems: user?.problems_solved?.codeforces,
      url: user?.platforms?.codeforces ? `https://codeforces.com/profile/${user.platforms.codeforces}` : null
    },
    {
      name: 'CodeChef',
      icon: '🍳',
      color: 'brown',
      username: user?.platforms?.codechef,
      rating: user?.ratings?.codechef,
      problems: user?.problems_solved?.codechef,
      url: user?.platforms?.codechef ? `https://www.codechef.com/users/${user.platforms.codechef}` : null
    },
    {
      name: 'GeeksForGeeks',
      icon: '📚',
      color: 'green',
      username: user?.platforms?.gfg,
      rating: null,
      problems: user?.problems_solved?.gfg,
      url: user?.platforms?.gfg ? `https://auth.geeksforgeeks.org/user/${user.platforms.gfg}` : null
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      yellow: 'border-yellow-500 bg-yellow-50',
      blue: 'border-blue-500 bg-blue-50',
      brown: 'border-amber-700 bg-amber-50',
      green: 'border-green-500 bg-green-50'
    };
    return colors[color] || 'border-gray-500 bg-gray-50';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Portfolio</h1>
      <p className="text-gray-600 mb-8">Your coding platform performance</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${getColorClasses(platform.color)}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-4xl">{platform.icon}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{platform.name}</h3>
                  {platform.username ? (
                    platform.url ? (
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        @{platform.username}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-600">@{platform.username}</p>
                    )
                  ) : (
                    <p className="text-sm text-gray-500 italic">Not connected</p>
                  )}
                </div>
              </div>
            </div>

            {platform.username ? (
              <div className="space-y-3">
                {platform.rating !== null && platform.rating !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Current Rating:</span>
                    <span className="text-2xl font-bold text-gray-800">{platform.rating}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Problems Solved:</span>
                  <span className="text-2xl font-bold text-gray-800">{platform.problems || 0}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-3">Connect your {platform.name} account</p>
                <a
                  href="/edit-profile"
                  className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Username
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">💡 Tip</h3>
        <p className="text-gray-700">
          Connect all your coding platform accounts to get accurate rankings and track your progress.
          Your Global Engineer Score is calculated based on your LeetCode, Codeforces, and CodeChef ratings.
        </p>
      </div>
    </div>
  );
};

export default Portfolio;

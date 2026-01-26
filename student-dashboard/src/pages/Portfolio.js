import React from 'react';
import { useAuth } from '../context/AuthContext';

const Portfolio = () => {
  const { user } = useAuth();

  const platforms = [
    {
      name: 'LeetCode',
      logo: 'https://leetcode.com/static/images/LeetCode_logo_rvs.png',
      color: 'yellow',
      username: user?.platforms?.leetcode,
      rating: user?.ratings?.leetcode,
      problems: user?.problems_solved?.leetcode,
      url: user?.platforms?.leetcode ? `https://leetcode.com/${user.platforms.leetcode}` : null
    },
    {
      name: 'Codeforces',
      logo: 'https://sta.codeforces.com/s/0/favicon-32x32.png',
      color: 'blue',
      username: user?.platforms?.codeforces,
      rating: user?.ratings?.codeforces,
      problems: user?.problems_solved?.codeforces,
      url: user?.platforms?.codeforces ? `https://codeforces.com/profile/${user.platforms.codeforces}` : null
    },
    {
      name: 'CodeChef',
      logo: 'https://cdn.codechef.com/images/cc-logo.svg',
      color: 'brown',
      username: user?.platforms?.codechef,
      rating: user?.ratings?.codechef,
      problems: user?.problems_solved?.codechef,
      url: user?.platforms?.codechef ? `https://www.codechef.com/users/${user.platforms.codechef}` : null
    },
    {
      name: 'GeeksForGeeks',
      logo: 'https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200x200-min.png',
      color: 'green',
      username: user?.platforms?.gfg,
      rating: null,
      problems: user?.problems_solved?.gfg,
      url: user?.platforms?.gfg ? `https://auth.geeksforgeeks.org/user/${user.platforms.gfg}` : null
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-400',
      blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400',
      brown: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-500',
      green: 'bg-gradient-to-br from-green-50 to-green-100 border-green-400'
    };
    return colors[color] || 'bg-gray-50 border-gray-400';
  };

  const getIconColor = (color) => {
    const colors = {
      yellow: 'text-yellow-600',
      blue: 'text-blue-600',
      brown: 'text-amber-700',
      green: 'text-green-600'
    };
    return colors[color] || 'text-gray-600';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <i className='bx bx-briefcase text-blue-600'></i>
          <span>Portfolio</span>
        </h1>
        <p className="text-gray-600 mt-1">Your coding platform performance and achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className={`rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition-all ${getColorClasses(platform.color)}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-white rounded-lg shadow-sm flex items-center justify-center p-2">
                  <img 
                    src={platform.logo} 
                    alt={`${platform.name} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <i className={`bx bx-code-alt text-3xl ${getIconColor(platform.color)} hidden`}></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{platform.name}</h3>
                  {platform.username ? (
                    platform.url ? (
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1"
                      >
                        <span>@{platform.username}</span>
                        <i className='bx bx-link-external text-xs'></i>
                      </a>
                    ) : (
                      <p className="text-sm text-gray-600">@{platform.username}</p>
                    )
                  ) : (
                    <p className="text-sm text-gray-500 italic flex items-center space-x-1">
                      <i className='bx bx-info-circle'></i>
                      <span>Not connected</span>
                    </p>
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

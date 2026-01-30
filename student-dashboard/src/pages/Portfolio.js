import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const Portfolio = () => {
  const { user, fetchProfile } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [syncError, setSyncError] = useState(null);

  const handleSyncPlatforms = async () => {
    setSyncing(true);
    setSyncMessage(null);
    setSyncError(null);

    try {
      const response = await api.post('/student/sync-platforms');
      
      setSyncMessage({
        text: response.data.message,
        score: response.data.global_engineer_score,
        results: response.data.results
      });
      
      // Refresh user data to show updated scores
      await fetchProfile();
    } catch (error) {
      setSyncError(error.response?.data?.error || 'Failed to sync platform data');
    } finally {
      setSyncing(false);
    }
  };

  const platforms = [
    {
      name: 'LeetCode',
      key: 'leetcode',
      logo: 'https://leetcode.com/static/images/LeetCode_logo_rvs.png',
      color: 'yellow',
      username: user?.platforms?.leetcode,
      verified: user?.platform_verification?.leetcode?.verified || false,
      rating: user?.ratings?.leetcode,
      maxRating: user?.max_ratings?.leetcode,
      problems: user?.problems_solved?.leetcode,
      url: user?.platforms?.leetcode ? `https://leetcode.com/u/${user.platforms.leetcode}` : null
    },
    {
      name: 'Codeforces',
      key: 'codeforces',
      logo: 'https://sta.codeforces.com/s/0/favicon-32x32.png',
      color: 'blue',
      username: user?.platforms?.codeforces,
      verified: user?.platform_verification?.codeforces?.verified || false,
      rating: user?.ratings?.codeforces,
      maxRating: user?.max_ratings?.codeforces,
      problems: user?.problems_solved?.codeforces,
      url: user?.platforms?.codeforces ? `https://codeforces.com/profile/${user.platforms.codeforces}` : null
    },
    {
      name: 'CodeChef',
      key: 'codechef',
      logo: 'https://cdn.codechef.com/images/cc-logo.svg',
      color: 'brown',
      username: user?.platforms?.codechef,
      verified: user?.platform_verification?.codechef?.verified || false,
      rating: user?.ratings?.codechef,
      maxRating: user?.max_ratings?.codechef,
      problems: user?.problems_solved?.codechef,
      url: user?.platforms?.codechef ? `https://www.codechef.com/users/${user.platforms.codechef}` : null
    },
    {
      name: 'GeeksForGeeks',
      key: 'gfg',
      logo: 'https://media.geeksforgeeks.org/wp-content/cdn-uploads/gfg_200x200-min.png',
      color: 'green',
      username: user?.platforms?.gfg,
      verified: user?.platform_verification?.gfg?.verified || false,
      rating: null,
      maxRating: null,
      problems: user?.problems_solved?.gfg,
      codingScore: user?.gfg_coding_score,
      instituteRank: user?.gfg_institute_rank,
      instituteName: user?.gfg_institute_name,
      url: user?.platforms?.gfg ? `https://auth.geeksforgeeks.org/user/${user.platforms.gfg}` : null
    }
  ];

  // Filter to only show verified platforms
  const verifiedPlatforms = platforms.filter(p => p.username && p.verified);

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <i className='bx bx-briefcase text-blue-600'></i>
              <span>Portfolio</span>
            </h1>
            <p className="text-gray-600 mt-1">Your coding platform performance and achievements</p>
          </div>
          <button
            onClick={handleSyncPlatforms}
            disabled={syncing}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
              syncing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            <i className={`bx ${syncing ? 'bx-loader-alt bx-spin' : 'bx-refresh'} text-xl`}></i>
            <span>{syncing ? 'Syncing...' : 'Sync Data'}</span>
          </button>
        </div>

        {/* Sync Messages */}
        {syncMessage && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <i className='bx bx-check-circle text-2xl text-green-600'></i>
              <div className="flex-1">
                <p className="font-semibold text-green-800">{syncMessage.text}</p>
                <p className="text-sm text-green-700 mt-1">
                  New Global Engineer Score: <span className="font-bold">{syncMessage.score}</span>
                </p>
                {syncMessage.results && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(syncMessage.results).map(([platform, result]) => (
                      <div key={platform} className="text-sm">
                        <span className="font-medium capitalize">{platform}:</span>{' '}
                        {result.success ? (
                          platform === 'gfg' ? (
                            <span className="text-green-700">
                              ✓ Coding Score: {result.codingScore || 'N/A'}
                            </span>
                          ) : platform === 'codechef' ? (
                            <span className="text-green-700">
                              ✓ Rating: {result.rating} (Max: {result.maxRating})
                            </span>
                          ) : (
                            <span className="text-green-700">
                              ✓ Rating: {result.rating} (Max: {result.maxRating}), Problems: {result.problems}
                            </span>
                          )
                        ) : (
                          <span className="text-orange-600">✗ {result.error}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {syncError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <i className='bx bx-error-circle text-2xl text-red-600'></i>
              <div>
                <p className="font-semibold text-red-800">Sync Failed</p>
                <p className="text-sm text-red-700 mt-1">{syncError}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {verifiedPlatforms.length === 0 ? (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-8 text-center">
          <i className="bx bx-shield-x text-6xl text-yellow-600 mb-4"></i>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Verified Platforms</h3>
          <p className="text-gray-700 mb-4">
            You need to verify your coding platform profiles before they can be displayed here.
          </p>
          <div className="space-y-2 text-left max-w-md mx-auto mb-6">
            <p className="text-sm text-gray-600">
              <strong>How to verify:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Go to Edit Profile</li>
              <li>Add your platform usernames</li>
              <li>Click the "Verify" button next to each platform</li>
              <li>Follow the verification instructions</li>
            </ol>
          </div>
          <a
            href="/edit-profile"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Go to Edit Profile
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {verifiedPlatforms.map((platform) => (
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
                    <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <span>{platform.name}</span>
                      <i className="bx bx-badge-check text-green-600 text-lg" title="Verified"></i>
                    </h3>
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
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {platform.rating !== null && platform.rating !== undefined && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Current Rating:</span>
                      <span className="text-2xl font-bold text-gray-800">{platform.rating}</span>
                    </div>
                    {platform.maxRating !== null && platform.maxRating !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Max Rating:</span>
                        <span className="text-xl font-bold text-orange-600">{platform.maxRating}</span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Only show problems for LeetCode and Codeforces */}
                {(platform.name === 'LeetCode' || platform.name === 'Codeforces') && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Problems Solved:</span>
                    <span className="text-2xl font-bold text-gray-800">{platform.problems || 0}</span>
                  </div>
                )}

                {/* GeeksForGeeks specific - Coding Score only */}
                {platform.name === 'GeeksForGeeks' && (platform.codingScore !== null && platform.codingScore !== undefined) && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Coding Score:</span>
                      <span className="text-xl font-bold text-green-600">{platform.codingScore}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">💡 How It Works</h3>
        <ul className="text-gray-700 space-y-2">
          <li className="flex items-start space-x-2">
            <i className='bx bx-check text-blue-600 text-xl'></i>
            <span>Add your platform usernames in the Edit Profile section</span>
          </li>
          <li className="flex items-start space-x-2">
            <i className='bx bx-check text-blue-600 text-xl'></i>
            <span>Click "Sync Data" to fetch your latest ratings and problem counts from LeetCode, Codeforces, and CodeChef</span>
          </li>
          <li className="flex items-start space-x-2">
            <i className='bx bx-check text-blue-600 text-xl'></i>
            <span>Your Global Engineer Score is automatically calculated based on the formula:
              <br/><code className="text-xs bg-white px-2 py-1 rounded mt-1 inline-block">
                (0.35×√CF + 0.30×√LC + 0.25×√CC + 0.10×√TotalSolved) × 1000
              </code>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Portfolio;

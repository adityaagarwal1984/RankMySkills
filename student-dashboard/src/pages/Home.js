import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const Home = () => {
  const { user } = useAuth();
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const response = await api.get('/student/rankings');
      setRankings(response.data.rankings);
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* Profile Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md ring-4 ring-blue-100">
              {user?.profile_photo ? (
                <img 
                  src={user.profile_photo.startsWith('http') ? user.profile_photo : `${process.env.REACT_APP_IMG_URL || 'http://localhost:5000'}${user.profile_photo}`} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <i className={`bx bx-user text-4xl text-gray-400 ${user?.profile_photo ? 'hidden' : ''}`}></i>
            </div>
          </div>
          
          <div className="flex-1 w-full text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-center space-y-2 md:space-y-0 md:space-x-3 justify-center md:justify-start">
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
                (user?.global_engineer_score || 0) >= 900 ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                (user?.global_engineer_score || 0) >= 800 ? 'bg-purple-100 text-purple-700 border border-purple-300' :
                (user?.global_engineer_score || 0) >= 700 ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' :
                (user?.global_engineer_score || 0) >= 550 ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                (user?.global_engineer_score || 0) >= 400 ? 'bg-green-100 text-green-700 border border-green-300' :
                (user?.global_engineer_score || 0) >= 200 ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                'bg-gray-100 text-gray-700 border border-gray-300'
              }`}>
                <i className={`bx ${
                  (user?.global_engineer_score || 0) >= 900 ? 'bx-crown' :
                  (user?.global_engineer_score || 0) >= 800 ? 'bx-medal' :
                  (user?.global_engineer_score || 0) >= 700 ? 'bx-trophy' :
                  (user?.global_engineer_score || 0) >= 550 ? 'bx-star' :
                  (user?.global_engineer_score || 0) >= 400 ? 'bx-trending-up' :
                  (user?.global_engineer_score || 0) >= 200 ? 'bx-book-open' :
                  'bx-rocket'
                } mr-1`}></i>
                {(user?.global_engineer_score || 0) >= 900 ? 'Elite' :
                 (user?.global_engineer_score || 0) >= 800 ? 'Expert' :
                 (user?.global_engineer_score || 0) >= 700 ? 'Advanced' :
                 (user?.global_engineer_score || 0) >= 550 ? 'Strong' :
                 (user?.global_engineer_score || 0) >= 400 ? 'Intermediate' :
                 (user?.global_engineer_score || 0) >= 200 ? 'Learner' :
                 'Beginner'}
              </span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600 mt-1">
              <i className='bx bxs-school text-lg'></i>
              <p>{user?.college?.name}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm justify-center md:justify-start">
              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <i className='bx bx-calendar text-blue-600'></i>
                <span className="font-medium text-gray-700">Graduation:</span>
                <span className="text-gray-900">{user?.graduation_year}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <i className='bx bx-book text-blue-600'></i>
                <span className="font-medium text-gray-700">Course:</span>
                <span className="text-gray-900">{user?.course}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Engineer Scores */}
        <div className="mt-6 flex justify-start">
          <div className="w-full max-w-md bg-white p-5 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 mb-2">
              <i className='bx bx-trophy text-2xl text-blue-600'></i>
              <p className="text-sm font-semibold text-gray-700">Global Engineer Score</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">{user?.global_engineer_score || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Platform-defined (read-only)</p>
          </div>
        </div>
      </div>

      {/* Ranking and Level Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Rankings */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Rankings</h2>
            <p className="text-gray-600 mt-1">Track your performance across different categories</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Global Rank (All students) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <i className='bx bx-world text-2xl text-blue-600'></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Global Rank</h3>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                #{rankings?.global?.rank || '-'}
              </div>
              <p className="text-gray-600 text-sm">
                Out of {rankings?.global?.total || 0} students
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Based on {rankings?.global?.score_type}
              </p>
            </div>

            {/* Global Rank (Same graduation year) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <i className='bx bx-globe text-2xl text-green-600'></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Global Rank ({rankings?.global_year?.year})</h3>
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                #{rankings?.global_year?.rank || '-'}
              </div>
              <p className="text-gray-600 text-sm">
                Out of {rankings?.global_year?.total || 0} students
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Based on {rankings?.global_year?.score_type}
              </p>
            </div>

            {/* College Rank (All years) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <i className='bx bx-buildings text-2xl text-purple-600'></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">College Rank</h3>
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {`#${rankings?.college?.rank || '-'}`}
              </div>
              <p className="text-gray-600 text-sm">
                Out of {rankings?.college?.total || 0} students
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Based on {rankings?.college?.score_type}
              </p>
            </div>

            {/* College Rank (Same graduation year) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <i className='bx bx-badge-check text-2xl text-orange-600'></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">College Rank ({rankings?.global_year?.year})</h3>
              </div>
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {`#${rankings?.college_year?.rank || '-'}`}
              </div>
              <p className="text-gray-600 text-sm">
                Out of {rankings?.college_year?.total || 0} students
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Based on {rankings?.college_year?.score_type}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Student Level Tag */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Level Classification</h2>
            <p className="text-gray-600 mt-1">Based on your Global Engineer Score</p>
          </div>
          
          {/* Score Ranges Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Level Classification</h4>
            <div className="space-y-3">
              <div className={`flex justify-between items-center p-3 rounded-lg ${
                (user?.global_engineer_score || 0) >= 0 && (user?.global_engineer_score || 0) < 200 ? 'bg-gray-100 border-2 border-gray-400' : 'bg-gray-50'
              }`}>
                <span className="font-medium text-gray-700">Beginner</span>
                <span className="text-sm text-gray-600">0 - 200</span>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg ${
                (user?.global_engineer_score || 0) >= 200 && (user?.global_engineer_score || 0) < 400 ? 'bg-orange-100 border-2 border-orange-400' : 'bg-gray-50'
              }`}>
                <span className="font-medium text-gray-700">Learner</span>
                <span className="text-sm text-gray-600">200 - 400</span>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg ${
                (user?.global_engineer_score || 0) >= 400 && (user?.global_engineer_score || 0) < 550 ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-50'
              }`}>
                <span className="font-medium text-gray-700">Intermediate</span>
                <span className="text-sm text-gray-600">400 - 550</span>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg ${
                (user?.global_engineer_score || 0) >= 550 && (user?.global_engineer_score || 0) < 700 ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-50'
              }`}>
                <span className="font-medium text-gray-700">Strong</span>
                <span className="text-sm text-gray-600">550 - 700</span>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg ${
                (user?.global_engineer_score || 0) >= 700 && (user?.global_engineer_score || 0) < 800 ? 'bg-indigo-100 border-2 border-indigo-400' : 'bg-gray-50'
              }`}>
                <span className="font-medium text-gray-700">Advanced</span>
                <span className="text-sm text-gray-600">700 - 800</span>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg ${
                (user?.global_engineer_score || 0) >= 800 && (user?.global_engineer_score || 0) < 900 ? 'bg-purple-100 border-2 border-purple-400' : 'bg-gray-50'
              }`}>
                <span className="font-medium text-gray-700">Expert</span>
                <span className="text-sm text-gray-600">800 - 900</span>
              </div>
              <div className={`flex justify-between items-center p-3 rounded-lg ${
                (user?.global_engineer_score || 0) >= 900 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-50'
              }`}>
                <span className="font-medium text-gray-700">Elite</span>
                <span className="text-sm text-gray-600">900 - 1000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

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
        <div className="flex items-start space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md ring-4 ring-blue-100">
              {user?.profile_photo ? (
                <img 
                  src={user.profile_photo.startsWith('http') ? user.profile_photo : `http://localhost:5000${user.profile_photo}`} 
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
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
            <div className="flex items-center space-x-2 text-gray-600 mt-1">
              <i className='bx bxs-school text-lg'></i>
              <p>{user?.college?.name}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
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
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 mb-2">
              <i className='bx bx-trophy text-2xl text-blue-600'></i>
              <p className="text-sm font-semibold text-gray-700">Global Engineer Score</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">{user?.global_engineer_score || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Platform-defined (read-only)</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-2 mb-2">
              <i className='bx bx-award text-2xl text-purple-600'></i>
              <p className="text-sm font-semibold text-gray-700">College Engineer Score</p>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {user?.college_engineer_score !== null ? user?.college_engineer_score : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">College-defined (read-only)</p>
          </div>
        </div>
      </div>

      {/* Ranking Cards */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Your Rankings</h2>
        <p className="text-gray-600 mt-1">Track your performance across different categories</p>
      </div>
      <div className="grid grid-cols-2 gap-6">
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
            {user?.college_engineer_score !== null ? `#${rankings?.college?.rank || '-'}` : 'N/A'}
          </div>
          <p className="text-gray-600 text-sm">
            Out of {user?.college_engineer_score !== null ? (rankings?.college?.total || 0) : 'N/A'} students
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Based on {user?.college_engineer_score !== null ? rankings?.college?.score_type : 'N/A'}
          </p>
        </div>

        {/* College Rank (Same graduation year) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <i className='bx bx-badge-check text-2xl text-orange-600'></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">College Rank ({user?.college_engineer_score !== null ? rankings?.college_year?.year : 'N/A'})</h3>
          </div>
          <div className="text-4xl font-bold text-orange-600 mb-2">
            {user?.college_engineer_score !== null ? `#${rankings?.college_year?.rank || '-'}` : 'N/A'}
          </div>
          <p className="text-gray-600 text-sm">
            Out of {user?.college_engineer_score !== null ? (rankings?.college_year?.total || 0) : 'N/A'} students
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Based on {user?.college_engineer_score !== null ? rankings?.college_year?.score_type : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

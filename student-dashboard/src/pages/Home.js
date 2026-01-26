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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Home</h1>

      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
            {user?.profile_photo ? (
              <img src={user.profile_photo} alt="" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <span className="text-4xl">👤</span>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-600">{user?.college?.name}</p>
            <div className="mt-2 flex space-x-6 text-sm text-gray-700">
              <div>
                <span className="font-medium">Graduation Year:</span> {user?.graduation_year}
              </div>
              <div>
                <span className="font-medium">Course:</span> {user?.course}
              </div>
            </div>
          </div>
        </div>

        {/* Engineer Scores */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Global Engineer Score</p>
            <p className="text-3xl font-bold text-blue-600">{user?.global_engineer_score || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Platform-defined (read-only)</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
            <p className="text-sm text-gray-600">College Engineer Score</p>
            <p className="text-3xl font-bold text-purple-600">
              {user?.college_engineer_score !== null ? user?.college_engineer_score : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">College-defined (read-only)</p>
          </div>
        </div>
      </div>

      {/* Ranking Cards */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Rankings</h2>
      <div className="grid grid-cols-2 gap-6">
        {/* Global Rank (All students) */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-3xl">🌍</span>
            <h3 className="text-lg font-semibold text-gray-800">Global Rank</h3>
          </div>
          <div className="text-4xl font-bold text-blue-600 mb-2">
            #{rankings?.global?.rank || '-'}
          </div>
          <p className="text-gray-600">
            Out of {rankings?.global?.total || 0} students
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Based on {rankings?.global?.score_type}
          </p>
        </div>

        {/* Global Rank (Same graduation year) */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-3xl">🌍</span>
            <h3 className="text-lg font-semibold text-gray-800">Global Rank ({rankings?.global_year?.year})</h3>
          </div>
          <div className="text-4xl font-bold text-green-600 mb-2">
            #{rankings?.global_year?.rank || '-'}
          </div>
          <p className="text-gray-600">
            Out of {rankings?.global_year?.total || 0} students
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Based on {rankings?.global_year?.score_type}
          </p>
        </div>

        {/* College Rank (All years) */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-3xl">🏫</span>
            <h3 className="text-lg font-semibold text-gray-800">College Rank</h3>
          </div>
          <div className="text-4xl font-bold text-purple-600 mb-2">
            #{rankings?.college?.rank || '-'}
          </div>
          <p className="text-gray-600">
            Out of {rankings?.college?.total || 0} students
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Based on {rankings?.college?.score_type}
          </p>
        </div>

        {/* College Rank (Same graduation year) */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-500">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-3xl">🏫</span>
            <h3 className="text-lg font-semibold text-gray-800">College Rank ({rankings?.college_year?.year})</h3>
          </div>
          <div className="text-4xl font-bold text-orange-600 mb-2">
            #{rankings?.college_year?.rank || '-'}
          </div>
          <p className="text-gray-600">
            Out of {rankings?.college_year?.total || 0} students
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Based on {rankings?.college_year?.score_type}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;

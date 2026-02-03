import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const CollegeLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [years, setYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    year: 'all',
    course: 'all',
    sort: 'engineer_score',
    page: 1
  });
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    if (user?.college_id) {
      fetchLeaderboard();
    }
  }, [filters, user]);

  const fetchFilters = async () => {
    try {
      const yearRes = await api.get('/leaderboard/years');
      setYears(yearRes.data.years);
      
      const courseRes = await api.get('/leaderboard/courses');
      setCourses(courseRes.data.courses);
    } catch (error) {
      console.error('Failed to fetch filters:', error);
    }
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await api.get('/leaderboard', {
        params: {
          type: 'college',
          college_id: user.college.college_id,
          year: filters.year,
          course: filters.course,
          sort: filters.sort,
          page: filters.page,
          limit: 50
        }
      });
      setLeaderboard(response.data.leaderboard);
      setMeta(response.data.meta);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStyle = (score) => {
    if (score >= 900) return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
    if (score >= 800) return 'bg-purple-100 text-purple-700 border border-purple-300';
    if (score >= 650) return 'bg-indigo-100 text-indigo-700 border border-indigo-300';
    if (score >= 450) return 'bg-blue-100 text-blue-700 border border-blue-300';
    if (score >= 300) return 'bg-green-100 text-green-700 border border-green-300';
    if (score >= 150) return 'bg-orange-100 text-orange-700 border border-orange-300';
    return 'bg-gray-100 text-gray-700 border border-gray-300';
  };

  const getBadgeIcon = (score) => {
    if (score >= 900) return 'bx-crown';
    if (score >= 800) return 'bx-medal';
    if (score >= 650) return 'bx-trophy';
    if (score >= 450) return 'bx-star';
    if (score >= 300) return 'bx-trending-up';
    if (score >= 150) return 'bx-book-open';
    return 'bx-rocket';
  };

  const getBadgeLabel = (score) => {
    if (score >= 900) return 'Elite';
    if (score >= 800) return 'Expert';
    if (score >= 650) return 'Advanced';
    if (score >= 450) return 'Strong';
    if (score >= 300) return 'Intermediate';
    if (score >= 150) return 'Learner';
    return 'Beginner';
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const sortOptions = [
    { value: 'engineer_score', label: 'College Engineer Score' },
    { value: 'cf', label: 'Codeforces Rating' },
    { value: 'lc', label: 'LeetCode Rating' },
    { value: 'cc', label: 'CodeChef Rating' }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <i className='bx bx-buildings text-blue-600'></i>
          <span>College Leaderboard</span>
        </h1>
        <div className="flex items-center space-x-2 text-gray-600 mt-1">
          <i className='bx bxs-school text-sm'></i>
          <p>{user?.college?.name}</p>
        </div>
        <p className="text-sm text-gray-500 mt-1">Compare yourself with students in your college</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <i className='bx bx-filter text-lg text-gray-700'></i>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Filters</h3>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-40">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Graduation Year
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Course
            </label>
            <select
              value={filters.course}
              onChange={(e) => handleFilterChange('course', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    College Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Global Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CC
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {student.rank <= 3 ? (
                          <span className="text-2xl mr-2">
                            {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        ) : null}
                        <span className="text-sm font-bold text-gray-900">#{student.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                          {student.profile_photo ? (
                            <img 
                              src={student.profile_photo.startsWith('http') ? student.profile_photo : `${process.env.REACT_APP_IMG_URL || 'http://localhost:5000'}${student.profile_photo}`} 
                              alt="Profile" 
                              className="w-10 h-10 rounded-full object-cover" 
                            />
                          ) : (
                            <i className='bx bx-user text-xl text-gray-500'></i>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900 w-48 truncate" title={student.name}>{student.name}</div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm flex items-center ${getBadgeStyle(student.global_engineer_score || 0)}`}>
                              <i className={`bx ${getBadgeIcon(student.global_engineer_score || 0)} mr-1`}></i>
                              {getBadgeLabel(student.global_engineer_score || 0)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">{student.course}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.graduation_year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-purple-600">
                        {student.college_engineer_score !== null ? student.college_engineer_score : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-blue-600">
                        {student.global_engineer_score}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.ratings?.codeforces || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.ratings?.leetcode || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.ratings?.codechef || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.total_pages > 1 && (
            <div className="mt-6 flex justify-center space-x-2">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={filters.page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {meta.page} of {meta.total_pages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={filters.page === meta.total_pages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CollegeLeaderboard;

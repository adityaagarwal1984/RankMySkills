import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const EditProfile = () => {
  const { user, updateProfile, fetchProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    course: user?.course || '',
    graduation_year: user?.graduation_year || new Date().getFullYear(),
    profile_photo: user?.profile_photo || '',
    platforms: {
      leetcode: user?.platforms?.leetcode || '',
      codeforces: user?.platforms?.codeforces || '',
      codechef: user?.platforms?.codechef || '',
      gfg: user?.platforms?.gfg || ''
    }
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('platform_')) {
      const platform = name.replace('platform_', '');
      setFormData({
        ...formData,
        platforms: { ...formData.platforms, [platform]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile(formData);
      await fetchProfile();
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Profile</h1>
      <p className="text-gray-600 mb-8">Update your personal information and platform usernames</p>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Course</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="e.g., Computer Science"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Graduation Year</label>
              <select
                name="graduation_year"
                value={formData.graduation_year}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {[0, 1, 2, 3, 4, 5].map((offset) => {
                  const year = new Date().getFullYear() + offset;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Profile Photo URL</label>
              <input
                type="url"
                name="profile_photo"
                value={formData.profile_photo}
                onChange={handleChange}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Enter a URL to your profile photo</p>
            </div>
          </div>
        </div>

        {/* Platform Usernames */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Coding Platform Usernames</h2>
          <p className="text-sm text-gray-600 mb-4">
            Connect your coding platforms to track your progress and improve your Engineer Score
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                💻 LeetCode Username
              </label>
              <input
                type="text"
                name="platform_leetcode"
                value={formData.platforms.leetcode}
                onChange={handleChange}
                placeholder="your-leetcode-username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                🏆 Codeforces Handle
              </label>
              <input
                type="text"
                name="platform_codeforces"
                value={formData.platforms.codeforces}
                onChange={handleChange}
                placeholder="your-codeforces-handle"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                🍳 CodeChef Username
              </label>
              <input
                type="text"
                name="platform_codechef"
                value={formData.platforms.codechef}
                onChange={handleChange}
                placeholder="your-codechef-username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                📚 GeeksForGeeks Username
              </label>
              <input
                type="text"
                name="platform_gfg"
                value={formData.platforms.gfg}
                onChange={handleChange}
                placeholder="your-gfg-username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Read-only Information */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Read-Only Information</h2>
          <p className="text-sm text-gray-600 mb-4">
            The following information cannot be changed directly:
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">College:</span>
              <span className="text-gray-900">{user?.college?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Email:</span>
              <span className="text-gray-900">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Global Engineer Score:</span>
              <span className="text-blue-600 font-bold">{user?.global_engineer_score || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">College Engineer Score:</span>
              <span className="text-purple-600 font-bold">
                {user?.college_engineer_score !== null ? user?.college_engineer_score : 'N/A'}
              </span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            To change your college, please contact an administrator.
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;

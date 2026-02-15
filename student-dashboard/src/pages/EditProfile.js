import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import VerificationModal from '../components/VerificationModal';

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.profile_photo || '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [verificationModal, setVerificationModal] = useState({ show: false, platform: null, username: null });
  const [verificationStatus, setVerificationStatus] = useState({
    leetcode: user?.platform_verification?.leetcode?.verified || false,
    codeforces: user?.platform_verification?.codeforces?.verified || false,
    codechef: user?.platform_verification?.codechef?.verified || false,
    gfg: user?.platform_verification?.gfg?.verified || false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsSaved(false);
    setIsModified(true);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should not exceed 5MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only image files (JPEG, PNG, GIF) are allowed');
        return;
      }
      
      setIsSaved(false);
      setIsModified(true);
      setSelectedFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setError('');
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('photo', selectedFile);
      
      const response = await api.post('/student/upload-photo', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFormData({ ...formData, profile_photo: response.data.photoUrl });
      setPhotoPreview(`${process.env.REACT_APP_IMG_URL || 'http://localhost:5000'}${response.data.photoUrl}`);
      setSuccess('Photo uploaded successfully!');
      setSelectedFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Exclude platforms from general profile update
      // Platforms are handled separately via verify/delete actions
      const { platforms, ...profileData } = formData;
      
      await updateProfile(profileData);
      await fetchProfile();
      setSuccess('Profile updated successfully!');
      setIsSaved(true);
      setIsModified(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const openVerificationModal = (platform) => {
    if (!formData.platforms[platform]) {
      setError(`Please add your ${platform} username first`);
      return;
    }
    
    // Check if there are unsaved changes
    // Removed check to allow verification without saving first, as verification is now independent
    /* if (isModified) {
      setError(`Please save your profile changes before verifying ${platform}`);
      return;
    } */
    
    setError('');
    setVerificationModal({ show: true, platform, username: formData.platforms[platform] });
  };

  const handleVerified = async (platform) => {
    setVerificationStatus({ ...verificationStatus, [platform]: true });
    await fetchProfile();
    setSuccess(`${platform} profile verified successfully!`);
  };

  const handleDeletePlatform = async (platform) => {
    if (window.confirm(`Are you sure you want to remove your ${platform} username? This will remove your verification status.`)) {
      try {
        await api.delete(`/student/platform/${platform}`);

        setFormData(prev => ({
          ...prev,
          platforms: {
            ...prev.platforms,
            [platform]: ''
          }
        }));
        setVerificationStatus(prev => ({
          ...prev,
          [platform]: false
        }));
        setIsModified(true); // Maybe not needed if we fetch profile, but good for UI state
        setSuccess(`${platform} username removed.`);
        await fetchProfile();
      } catch (err) {
        console.error(err);
        setError('Failed to remove platform');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <i className='bx bx-edit text-blue-600'></i>
          <span>Edit Profile</span>
        </h1>
        <p className="text-gray-600 mt-1">Update your personal information and platform usernames</p>
      </div>

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
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">-- Select Course --</option>
                <option value="BTECH">BTECH</option>
                <option value="BCA">BCA</option>
                <option value="BE">BE</option>
                <option value="MTECH">MTECH</option>
                <option value="MCA">MCA</option>
                <option value="ME">ME</option>
              </select>
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
              <label className="block text-gray-700 font-medium mb-2">Profile Photo</label>
              
              {/* Photo Preview */}
              {photoPreview && (
                <div className="mb-4 flex justify-center">
                  <img 
                    src={photoPreview.startsWith('http') || photoPreview.startsWith('blob:') ? photoPreview : `${process.env.REACT_APP_IMG_URL || 'http://localhost:5000'}${photoPreview}`} 
                    alt="Profile Preview" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                  />
                </div>
              )}
              
              {/* File Upload */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Max file size: 5MB. Allowed formats: JPEG, PNG, GIF
                </p>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={handlePhotoUpload}
                    disabled={uploading}
                    className="mt-3 w-full bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </button>
                )}
              </div>
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
              <label className="block text-gray-700 font-medium mb-2 flex items-center space-x-2">
                <i className='bx bx-code-alt text-lg text-yellow-600'></i>
                <span>LeetCode Username</span>
                {verificationStatus.leetcode && (
                  <div className="ml-auto flex items-center space-x-2">
                    <span className="flex items-center text-green-600 text-sm">
                      <i className="bx bx-badge-check text-xl animate-pulse"></i>
                      <span className="ml-1">Verified</span>
                    </span>
                    <button 
                      type="button"
                      onClick={() => handleDeletePlatform('leetcode')}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remove username and verification"
                    >
                      <i className='bx bx-trash text-lg'></i>
                    </button>
                  </div>
                )}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                  <span className="px-4 py-2 bg-gray-50 text-gray-600 text-sm border-r border-gray-300">
                    https://leetcode.com/u/
                  </span>
                  <input
                    type="text"
                    name="platform_leetcode"
                    value={formData.platforms.leetcode}
                    onChange={handleChange}
                    placeholder="username"
                    className="flex-1 px-4 py-2 focus:outline-none rounded-r-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => openVerificationModal('leetcode')}
                  disabled={!formData.platforms.leetcode || verificationStatus.leetcode}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    verificationStatus.leetcode
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  } disabled:opacity-50`}
                >
                  {verificationStatus.leetcode ? 'Verified' : 'Verify'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 flex items-center space-x-2">
                <i className='bx bx-trophy text-lg text-blue-600'></i>
                <span>Codeforces Handle</span>
                {verificationStatus.codeforces && (
                  <div className="ml-auto flex items-center space-x-2">
                    <span className="flex items-center text-green-600 text-sm">
                      <i className="bx bx-badge-check text-xl animate-pulse"></i>
                      <span className="ml-1">Verified</span>
                    </span>
                    <button 
                      type="button"
                      onClick={() => handleDeletePlatform('codeforces')}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remove username and verification"
                    >
                      <i className='bx bx-trash text-lg'></i>
                    </button>
                  </div>
                )}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                  <span className="px-4 py-2 bg-gray-50 text-gray-600 text-sm border-r border-gray-300">
                    https://codeforces.com/profile/
                  </span>
                  <input
                    type="text"
                    name="platform_codeforces"
                    value={formData.platforms.codeforces}
                    onChange={handleChange}
                    placeholder="handle"
                    className="flex-1 px-4 py-2 focus:outline-none rounded-r-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => openVerificationModal('codeforces')}
                  disabled={!formData.platforms.codeforces || verificationStatus.codeforces}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    verificationStatus.codeforces
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  } disabled:opacity-50`}
                >
                  {verificationStatus.codeforces ? 'Verified' : 'Verify'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 flex items-center space-x-2">
                <i className='bx bx-dish text-lg text-amber-700'></i>
                <span>CodeChef Username</span>
                {verificationStatus.codechef && (
                  <div className="ml-auto flex items-center space-x-2">
                    <span className="flex items-center text-green-600 text-sm">
                      <i className="bx bx-badge-check text-xl animate-pulse"></i>
                      <span className="ml-1">Verified</span>
                    </span>
                    <button 
                      type="button"
                      onClick={() => handleDeletePlatform('codechef')}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remove username and verification"
                    >
                      <i className='bx bx-trash text-lg'></i>
                    </button>
                  </div>
                )}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                  <span className="px-4 py-2 bg-gray-50 text-gray-600 text-sm border-r border-gray-300">
                    https://www.codechef.com/users/
                  </span>
                  <input
                    type="text"
                    name="platform_codechef"
                    value={formData.platforms.codechef}
                    onChange={handleChange}
                    placeholder="username"
                    className="flex-1 px-4 py-2 focus:outline-none rounded-r-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => openVerificationModal('codechef')}
                  disabled={!formData.platforms.codechef || verificationStatus.codechef}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    verificationStatus.codechef
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  } disabled:opacity-50`}
                >
                  {verificationStatus.codechef ? 'Verified' : 'Verify'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 flex items-center space-x-2">
                <i className='bx bx-book-open text-lg text-green-600'></i>
                <span>GeeksForGeeks Username</span>
                {verificationStatus.gfg && (
                  <div className="ml-auto flex items-center space-x-2">
                    <span className="flex items-center text-green-600 text-sm">
                      <i className="bx bx-badge-check text-xl animate-pulse"></i>
                      <span className="ml-1">Verified</span>
                    </span>
                    <button 
                      type="button"
                      onClick={() => handleDeletePlatform('gfg')}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remove username and verification"
                    >
                      <i className='bx bx-trash text-lg'></i>
                    </button>
                  </div>
                )}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                  <span className="px-4 py-2 bg-gray-50 text-gray-600 text-sm border-r border-gray-300">
                    https://www.geeksforgeeks.org/user/
                  </span>
                  <input
                    type="text"
                    name="platform_gfg"
                    value={formData.platforms.gfg}
                    onChange={handleChange}
                    placeholder="username"
                    className="flex-1 px-4 py-2 focus:outline-none rounded-r-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => openVerificationModal('gfg')}
                  disabled={!formData.platforms.gfg || verificationStatus.gfg}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    verificationStatus.gfg
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  } disabled:opacity-50`}
                >
                  {verificationStatus.gfg ? 'Verified' : 'Verify'}
                </button>
              </div>
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
            disabled={loading || isSaved}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              isSaved 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50'
            }`}
          >
            {loading ? 'Saving...' : isSaved ? 'Saved' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Verification Modal */}
      {verificationModal.show && (
        <VerificationModal
          platform={verificationModal.platform}
          username={verificationModal.username}
          onClose={() => setVerificationModal({ show: false, platform: null, username: null })}
          onVerified={handleVerified}
        />
      )}
    </div>
  );
};

export default EditProfile;

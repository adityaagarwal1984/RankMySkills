import React, { useState } from 'react';
import axios from 'axios';

const VerificationModal = ({ platform, username, onClose, onVerified }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const platformConfig = {
    leetcode: {
      name: 'LeetCode',
      icon: 'bx-code-alt',
      color: 'yellow',
      editUrl: `https://leetcode.com/profile/`,
      field: 'Summary',
      instructions: 'Go to your LeetCode profile settings and paste the verification code in your "About Me" or "Summary" section.',
      steps: [
        'Click the button below to open your LeetCode profile edit page',
        'Scroll to the "ReadMe" section',
        'Paste the verification code shown below',
        'Save your changes on LeetCode',
        'Come back here and click "Verify Profile"',
        'After verification, you can change your summary back to normal'
      ]
    },
    codeforces: {
      name: 'Codeforces',
      icon: 'bx-trophy',
      color: 'blue',
      editUrl: `https://codeforces.com/settings/social`,
      field: 'First Name',
      instructions: 'Go to your Codeforces settings (Social tab) and temporarily add the verification code to your First Name.',
      steps: [
        'Click the button below to open Codeforces settings',
        'Go to the "Social" tab',
        'Add the verification code to your "First Name" field',
        'Save your changes on Codeforces',
        'Come back here and click "Verify Profile"',
        'After verification, you can change your name back to normal'
      ]
    },
    codechef: {
      name: 'CodeChef',
      icon: 'bx-dish',
      color: 'amber',
      editUrl: `https://www.codechef.com/users/${username}/edit`,
      field: 'Full Name',
      instructions: 'Go to your CodeChef profile edit page and temporarily add the verification code to your Full Name field (not username).',
      steps: [
        'Click the button below to open your CodeChef edit page',
        'Find the "Full Name" field (not the username field)',
        'Add the verification code to your "Full Name"',
        'Save your changes on CodeChef',
        'Come back here and click "Verify Profile"',
        'After verification, you can change your full name back to normal'
      ]
    },
    gfg: {
      name: 'GeeksforGeeks',
      icon: 'bx-book-open',
      color: 'green',
      editUrl: `https://auth.geeksforgeeks.org/profile.php`,
      field: 'User Name',
      instructions: 'Go to your GeeksforGeeks profile edit page and temporarily add the verification code to your User Name. Note: GFG only allows letters and spaces in the name field.',
      steps: [
        'Click the button below to open your GFG profile edit page',
        'Add the verification code to your "Name" field',
        'Note: GFG name field only accepts letters and spaces',
        'Save your changes on GeeksforGeeks',
        'Come back here and click "Verify Profile"',
        'After verification, you can change your name back to normal'
      ]
    }
  };

  const config = platformConfig[platform];

  const generateCode = async () => {
    setGenerating(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      console.log('Generating verification code for platform:', platform);
      
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/student/verify/generate`,
        { platform, username },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Verification code response:', response.data);
      setVerificationCode(response.data.verification_code);
      setSuccess('Verification code generated! Follow the steps below.');
    } catch (err) {
      console.error('Generate code error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to generate verification code';
      setError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const verifyProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/student/verify/check`,
        { platform, username },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.verified) {
        setSuccess(response.data.message);
        setTimeout(() => {
          onVerified(platform);
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationCode);
    setSuccess('Code copied to clipboard!');
    setTimeout(() => setSuccess('Verification code generated! Follow the steps below.'), 2000);
  };

  React.useEffect(() => {
    generateCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-${config.color}-500 text-white p-6 rounded-t-lg`}
             style={{ backgroundColor: config.color === 'yellow' ? '#eab308' : 
                                     config.color === 'blue' ? '#3b82f6' : 
                                     config.color === 'amber' ? '#f59e0b' : '#22c55e' }}>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <i className={`bx ${config.icon} text-4xl`}></i>
              <div>
                <h2 className="text-2xl font-bold">Verify {config.name} Profile</h2>
                <p className="text-sm opacity-90 mt-1">Username: {username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <i className="bx bx-x text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <i className="bx bx-info-circle mr-2"></i>
              How to verify your profile
            </h3>
            <p className="text-blue-800 text-sm">{config.instructions}</p>
          </div>

          {/* Verification Code */}
          {generating ? (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 text-center">
              <i className="bx bx-loader-alt bx-spin text-3xl text-blue-500 mb-2"></i>
              <p className="text-gray-600">Generating verification code...</p>
            </div>
          ) : verificationCode ? (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Verification Code
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-white border-2 border-blue-500 rounded-lg p-4 font-mono text-xl font-bold text-center text-blue-600">
                  {verificationCode}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  title="Copy to clipboard"
                >
                  <i className="bx bx-copy text-xl"></i>
                </button>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-center">
              <i className="bx bx-error-circle text-3xl text-red-500 mb-2"></i>
              <p className="text-red-600 mb-3">{error}</p>
              <button
                onClick={generateCode}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 text-center">
              <p className="text-gray-600">Ready to generate code...</p>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
              <i className="bx bx-check-circle mr-2 text-xl"></i>
              {success}
            </div>
          )}

          {/* Steps */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 mb-3">Step-by-step instructions:</h3>
            {config.steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-${config.color}-100 text-${config.color}-600 flex items-center justify-center font-bold text-sm`}
                     style={{ 
                       backgroundColor: config.color === 'yellow' ? '#fef9c3' : 
                                       config.color === 'blue' ? '#dbeafe' : 
                                       config.color === 'amber' ? '#fef3c7' : '#dcfce7',
                       color: config.color === 'yellow' ? '#ca8a04' : 
                             config.color === 'blue' ? '#2563eb' : 
                             config.color === 'amber' ? '#d97706' : '#16a34a'
                     }}>
                  {index + 1}
                </div>
                <p className="text-gray-700 text-sm pt-1">{step}</p>
              </div>
            ))}
          </div>

          {/* Open Platform Button */}
          <div className="flex justify-center">
            <a
              href={config.editUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`bg-${config.color}-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-${config.color}-600 transition-colors inline-flex items-center space-x-2`}
              style={{ 
                backgroundColor: config.color === 'yellow' ? '#eab308' : 
                               config.color === 'blue' ? '#3b82f6' : 
                               config.color === 'amber' ? '#f59e0b' : '#22c55e'
              }}
            >
              <i className="bx bx-link-external"></i>
              <span>Open {config.name} Edit Page</span>
            </a>
          </div>

          

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={verifyProfile}
              disabled={loading || !verificationCode}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <i className="bx bx-loader-alt animate-spin"></i>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <i className="bx bx-check-shield"></i>
                  <span>Verify Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;

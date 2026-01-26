import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">TalentTrack Admin</h1>
                <p className="text-sm text-red-100">System Administrator</p>
              </div>
              <div className="flex space-x-6">
                <Link to="/" className="hover:text-red-200">Overview</Link>
                <Link to="/colleges" className="hover:text-red-200">Colleges</Link>
                <Link to="/approvals" className="hover:text-red-200">Approvals</Link>
                <Link to="/students" className="hover:text-red-200">Students</Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/students" element={<Students />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Overview() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Platform Overview</h1>
      
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
          <h3 className="text-gray-600 mb-2">Total Students</h3>
          <p className="text-4xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
          <h3 className="text-gray-600 mb-2">Total Colleges</h3>
          <p className="text-4xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
          <h3 className="text-gray-600 mb-2">Verified Colleges</h3>
          <p className="text-4xl font-bold text-purple-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-500">
          <h3 className="text-gray-600 mb-2">Pending Approvals</h3>
          <p className="text-4xl font-bold text-orange-600">0</p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2 text-red-800">🔐 Admin Responsibilities</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Approve college administrators</li>
          <li>• Verify and manage colleges</li>
          <li>• Monitor global leaderboards</li>
          <li>• Maintain data integrity</li>
          <li>• Ensure trust in the platform</li>
        </ul>
      </div>
    </div>
  );
}

function Colleges() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">College Management</h1>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">All Colleges</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600">
            College list will appear here. Verify colleges, rename them, or merge duplicates.
          </p>
        </div>
      </div>
    </div>
  );
}

function Approvals() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Pending Approvals</h1>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">College Admin Requests</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600">
            Pending college admin approval requests will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

function Students() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Students</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">
          Global student list with filtering and management options.
        </p>
      </div>
    </div>
  );
}

export default App;

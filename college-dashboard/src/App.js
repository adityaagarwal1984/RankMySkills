import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-purple-600">TalentTrack</h1>
                <p className="text-sm text-gray-600">College Dashboard</p>
              </div>
              <div className="flex space-x-6">
                <Link to="/" className="text-gray-700 hover:text-purple-600">Overview</Link>
                <Link to="/students" className="text-gray-700 hover:text-purple-600">Students</Link>
                <Link to="/assessments" className="text-gray-700 hover:text-purple-600">Assessments</Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/students" element={<Students />} />
            <Route path="/assessments" element={<Assessments />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Overview() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">College Overview</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 mb-2">Total Students</h3>
          <p className="text-4xl font-bold text-purple-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 mb-2">Total Assessments</h3>
          <p className="text-4xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 mb-2">College Verified</h3>
          <p className="text-4xl font-bold text-green-600">❌</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">📘 How to Use College Dashboard</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Create assessments for your students</li>
          <li>• Upload marks via CSV/Excel</li>
          <li>• Calculate College Engineer Scores</li>
          <li>• View college-specific leaderboards</li>
        </ul>
      </div>
    </div>
  );
}

function Students() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Management</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">
          Student list will appear here. Filter by year and manage college-specific data.
        </p>
      </div>
    </div>
  );
}

function Assessments() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Assessments</h1>
      
      <div className="mb-6">
        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          Create New Assessment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">
          Your assessments will appear here. Create assessments, upload marks, and calculate scores.
        </p>
      </div>
    </div>
  );
}

export default App;

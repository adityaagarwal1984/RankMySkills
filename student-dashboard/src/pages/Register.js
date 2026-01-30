import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college_name: '',
    graduation_year: new Date().getFullYear() + 2,
    course: '',
  });
  const [colleges, setColleges] = useState([]);
  const [showNewCollegeInput, setShowNewCollegeInput] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch colleges list
    const fetchColleges = async () => {
      try {
        const response = await api.get('/auth/colleges');
        setColleges(response.data.colleges || []);
      } catch (err) {
        console.error('Failed to fetch colleges:', err);
      }
    };
    fetchColleges();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'college_name' && value === '__add_new__') {
      setShowNewCollegeInput(true);
      setFormData({ ...formData, college_name: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-black py-8">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">RankMySkills</h1>
        <p className="text-center text-gray-600 mb-6">Student Registration</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength="6"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">College Name</label>
            {!showNewCollegeInput ? (
              <select
                name="college_name"
                value={formData.college_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">-- Select Your College --</option>
                {colleges.map((college) => (
                  <option key={college.college_id} value={college.name_display}>
                    {college.name_display}
                  </option>
                ))}
                <option value="__add_new__" className="text-blue-600 font-semibold">
                  + Add New College
                </option>
              </select>
            ) : (
              <div>
                <input
                  type="text"
                  name="college_name"
                  value={formData.college_name}
                  onChange={handleChange}
                  placeholder="e.g., GL BAJAJ INSTITUTE OF TECHNOLOGY AND MANAGEMENT, GREATER NOIDA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-red-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCollegeInput(false);
                    setFormData({ ...formData, college_name: '' });
                  }}
                  className="text-sm text-blue-500 hover:underline mt-1"
                >
                  ← Back to college list
                </button>
              </div>
            )}
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
              {[0, 1, 2, 3, 4].map((offset) => {
                const year = new Date().getFullYear() + offset;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

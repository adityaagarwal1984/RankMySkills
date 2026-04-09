import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Target, Rocket, Users, TrendingUp, ShieldCheck, School } from 'lucide-react';
import api from './api';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const boot = async () => {
      try {
        const response = await api.get('/college/overview');
        setOverview(response.data || null);
        setUser({ role: 'college_admin' });
      } catch (error) {
        setUser(null);
        setOverview(null);
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, []);

  const value = useMemo(
    () => ({
      user,
      overview,
      setOverview,
      setUser,
      loading,
    }),
    [user, overview, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <CenteredPanel text="Checking access..." />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/access-request" element={<AccessRequest />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/approval-required" element={<ApprovalRequired />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="leaderboard" element={<CollegeLeaderboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const advantages = [
    {
      icon: <Target className="w-8 h-8 text-red-800" />,
      title: 'Centralized student tracking',
      description: 'View skill growth, coding progress, and readiness status from one clean dashboard.'
    },
    {
      icon: <Rocket className="w-8 h-8 text-red-800" />,
      title: 'Placement focused insights',
      description: 'Identify high-potential students early and build targeted placement strategies.'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-red-800" />,
      title: 'Verified performance signals',
      description: 'Rely on trusted, scored data instead of manual sheets and fragmented reports.'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-red-800" />,
      title: 'Real-time leaderboard view',
      description: 'Spot top performers by college and across the platform with live rankings.'
    },
    {
      icon: <Users className="w-8 h-8 text-red-800" />,
      title: 'Secure access workflow',
      description: 'Access is approval-based, ensuring college data remains controlled and protected.'
    },
    {
      icon: <School className="w-8 h-8 text-red-800" />,
      title: 'Faster academic decisions',
      description: 'Turn performance patterns into concrete actions for training and mentoring teams.'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-800 selection:text-white overflow-hidden">
      <Helmet>
        <title>RankMySkills - College Dashboard & Student Analytics</title>
        <meta name="description" content="Build placement confidence and lead student success. The definitive platform for tracking, benchmarking, and advancing student readiness." />
      </Helmet>

      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-800 to-red-800 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-lg md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-700 to-red-700">
                RankMySkills
              </span>
            </motion.div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors px-2 py-1 md:px-4 md:py-2 text-sm md:text-base">
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-red-700 hover:bg-red-800 text-white px-3 py-1.5 md:px-6 md:py-2 rounded-full font-medium transition-all hover:scale-105 transform flex items-center group text-sm md:text-base whitespace-nowrap"
              >
                Get Started
                <ArrowRight className="ml-1 md:ml-2 w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-800/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-700/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8">
              Build Placement Confidence.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-red-700">
                Lead Student Success.
              </span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10">
              Track student progress, benchmark performance, and drive placement readiness from one trusted platform.
              <br />
              Turn verified data into faster interventions, stronger placements, and measurable college outcomes.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/access-request"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-700 to-red-700 rounded-full text-lg font-bold hover:shadow-lg hover:shadow-red-800/30 transition-all transform hover:-translate-y-1"
              >
                Get Access
              </Link>
              <Link 
                to="/register"
                className="w-full sm:w-auto px-8 py-4 border border-white/20 rounded-full text-lg font-medium hover:bg-white/5 transition-all"
              >
                Register
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="py-24 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why Colleges Choose RankMySkills</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Built for placement teams that want measurable outcomes, not guesswork.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {advantages.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-red-800/50 transition-colors group hover:bg-white/10"
              >
                <div className="mb-4 p-3 bg-red-800/10 rounded-lg w-fit group-hover:bg-red-800/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-r from-red-800 to-red-800 rounded-3xl p-12 text-center shadow-2xl shadow-red-800/50">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Start with verified access and unlock full student readiness.
            </h2>
            <p className="text-red-100 text-lg mb-8 max-w-2xl mx-auto">
              Request access today and activate your college dashboard in minutes.
            </p>
            <Link 
              to="/access-request"
              className="inline-flex items-center px-8 py-4 bg-white text-red-800 rounded-full font-bold text-lg hover:bg-gray-100 transition-all"
            >
              Get Access
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/10 bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gradient-to-br from-red-800 to-red-800 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <span className="text-xl font-bold text-white">RankMySkills</span>
          </div>
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} RankMySkills. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function AccessRequest() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    college_id: '',
    designation: '',
    phone: '',
    message: '',
  });
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/auth/colleges');
        setColleges(response.data.colleges || []);
      } catch (err) {
        setError('Failed to load colleges.');
      }
    };
    load();
  }, []);

  const selectedCollege = colleges.find((college) => college.college_id === form.college_id);
  const alreadyAssigned = Boolean(selectedCollege?.has_approved_admin);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');

    try {
      await api.post('/auth/request-college-admin', form);
      setStatus('Request submitted. You will receive an invite code after approval.');
      setForm({ name: '', email: '', college_id: '', designation: '', phone: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Request college admin access</h2>
          <p className="muted">Submit your details to receive an invite code from RankMySkills.</p>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <Input label="Full name" name="name" value={form.name} onChange={handleChange} required />
            <Input label="Work email" name="email" type="email" value={form.email} onChange={handleChange} required />
            <Select label="College" name="college_id" value={form.college_id} onChange={handleChange} required>
              <option value="">Select college</option>
              {colleges.map((college) => (
                <option key={college.college_id} value={college.college_id}>
                  {college.name_display}
                </option>
              ))}
            </Select>
            <Input label="Designation" name="designation" value={form.designation} onChange={handleChange} required />
            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
          </div>
          <TextArea label="Message (optional)" name="message" value={form.message} onChange={handleChange} />

          {alreadyAssigned ? (
            <div className="alert warning">
              This college already has an approved admin. Please contact the super admin to request changes.
            </div>
          ) : null}
          {status ? <div className="alert success">{status}</div> : null}
          {error ? <div className="alert error">{error}</div> : null}

          <button className="btn btn-primary" disabled={loading || alreadyAssigned} type="submit">
            {loading ? 'Submitting...' : 'Send Request'}
          </button>
        </form>
        <p className="muted small">
          Already have an invite code? <Link to="/register">Register here</Link>.
        </p>
      </div>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    college_id: '',
    city: '',
    state: '',
    invite_code: '',
  });
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/auth/colleges');
        setColleges(response.data.colleges || []);
      } catch (err) {
        setError('Failed to load colleges.');
      }
    };
    load();
  }, []);

  const selectedCollege = colleges.find((college) => college.college_id === form.college_id);
  const alreadyAssigned = Boolean(selectedCollege?.has_approved_admin);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');

    try {
      await api.post('/auth/register/college', form);
      setStatus('Registration successful. Please login to continue.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Register with invite code</h2>
          <p className="muted">Use the invite code sent after approval to activate your account.</p>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <Input label="Full name" name="name" value={form.name} onChange={handleChange} required />
            <Input label="Work email" name="email" type="email" value={form.email} onChange={handleChange} required />
            <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
            <Select label="College" name="college_id" value={form.college_id} onChange={handleChange} required>
              <option value="">Select college</option>
              {colleges.map((college) => (
                <option key={college.college_id} value={college.college_id}>
                  {college.name_display}
                </option>
              ))}
            </Select>
            <Input label="City (optional)" name="city" value={form.city} onChange={handleChange} />
            <Input label="State (optional)" name="state" value={form.state} onChange={handleChange} />
            <Input label="Invite code" name="invite_code" value={form.invite_code} onChange={handleChange} required />
          </div>
          {alreadyAssigned ? (
            <div className="alert warning">
              This college already has an approved admin. Please contact the super admin.
            </div>
          ) : null}
          {status ? <div className="alert success">{status}</div> : null}
          {error ? <div className="alert error">{error}</div> : null}
          <button className="btn btn-primary" disabled={loading || alreadyAssigned} type="submit">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="muted small">
          Have an account? <Link to="/login">Login</Link>.
        </p>
      </div>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/login', form);
      setUser({ role: 'college_admin' });
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err.response?.status === 403) {
        navigate('/approval-required', { replace: true });
        return;
      }
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Login to your dashboard</h2>
          <p className="muted">Access verified college insights and student readiness.</p>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
          {error ? <div className="alert error">{error}</div> : null}
          <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <div className="auth-footer">
          <Link to="/forgot-password">Forgot password?</Link>
          <span className="muted">No invite yet? <Link to="/access-request">Request access</Link>.</span>
        </div>
      </div>
    </div>
  );
}

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setStatus(response.data?.message || 'If the email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Reset your password</h2>
          <p className="muted">We will email you a secure reset link.</p>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <Input label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {status ? <div className="alert success">{status}</div> : null}
          {error ? <div className="alert error">{error}</div> : null}
          <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setStatus('Password updated. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create a new password</h2>
          <p className="muted">Use at least 6 characters.</p>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <Input label="New password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {status ? <div className="alert success">{status}</div> : null}
          {error ? <div className="alert error">{error}</div> : null}
          <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? 'Updating...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ApprovalRequired() {
  return (
    <div className="page auth">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Approval required</h2>
          <p className="muted">
            Your college admin account is awaiting approval. Once approved, you will receive an invite code by email.
          </p>
        </div>
        <div className="cta-row">
          <Link className="btn btn-primary" to="/access-request">Request Access</Link>
          <Link className="btn btn-outline" to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

function DashboardLayout() {
  const { overview, setOverview, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const load = async () => {
      if (!overview) {
        try {
          const response = await api.get('/college/overview');
          setOverview(response.data || null);
        } catch (error) {
          setUser(null);
          navigate('/login', { replace: true });
        }
      }
    };
    load();
  }, [overview, setOverview, setUser, navigate]);

  const handleLogout = async () => {
    await api.post('/auth/logout').catch(() => {});
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div>
          <div className="brand sidebar-brand">
            <div className="brand-mark">R</div>
            <div>
              <p className="brand-title">RankMySkills</p>
              <p className="brand-subtitle">College Admin</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <SidebarLink to="/dashboard" active={location.pathname === '/dashboard'}>Overview</SidebarLink>
            <SidebarLink to="/dashboard/leaderboard" active={location.pathname.includes('leaderboard')}>College Leaderboard</SidebarLink>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-stat">
            <p>Total students</p>
            <strong>{overview?.stats?.total_students ?? 0}</strong>
          </div>
          <button className="btn btn-outline btn-block" onClick={handleLogout} type="button">
            Logout
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <div className="topbar">
          <div>
            <p className="eyebrow">College Dashboard</p>
            <h2>Welcome back</h2>
          </div>
          <div className="topbar-meta">
            <p className="muted">{overview?.college?.name || 'Your College'}</p>
            <span className={`pill ${overview?.college?.verified ? 'pill-success' : 'pill-warning'}`}>
              {overview?.college?.verified ? 'Verified' : 'Pending'}
            </span>
          </div>
        </div>

        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function Overview() {
  const { overview } = useAuth();

  return (
    <div className="content-stack">
      <section className="panel">
        <p className="eyebrow">Overview</p>
        <h2>College readiness at a glance</h2>
        <p className="muted">
          Monitor student participation, leaderboard performance, and overall readiness for placements.
        </p>
      </section>

      <section className="grid-3">
        <div className="card stat">
          <p>Total students</p>
          <h3>{overview?.stats?.total_students ?? 0}</h3>
        </div>
        <div className="card stat">
          <p>Total assessments</p>
          <h3>{overview?.stats?.total_assessments ?? 0}</h3>
        </div>
        <div className="card stat">
          <p>College status</p>
          <h3>{overview?.college?.verified ? 'Verified' : 'Pending'}</h3>
        </div>
      </section>
    </div>
  );
}

function CollegeLeaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/leaderboard', { params: { type: 'college' } });
        setRows(response.data.leaderboard || []);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="content-stack">
      <section className="panel">
        <p className="eyebrow">College Leaderboard</p>
        <h2>Your top performers</h2>
        <p className="muted">Ranked by engineer score with coding platform ratings.</p>
      </section>

      {loading ? <CenteredPanel text="Loading leaderboard..." /> : null}
      {!loading && error ? <CenteredPanel text={error} tone="error" /> : null}

      {!loading && !error ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Course</th>
                <th>Year</th>
                <th>Engineer Score</th>
                <th>Ratings</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty">No leaderboard data yet.</td>
                </tr>
              ) : (
                rows.map((student) => (
                  <tr key={student.id}>
                    <td className="rank">#{student.rank}</td>
                    <td>
                      <strong>{student.name}</strong>
                      <div className="muted small">{student.college}</div>
                    </td>
                    <td>{student.course}</td>
                    <td>{student.graduation_year}</td>
                    <td className="score">{student.global_engineer_score}</td>
                    <td className="ratings">
                      <span>LC</span> {student.ratings?.leetcode || 0}
                      <span className="divider">|</span>
                      <span>CF</span> {student.ratings?.codeforces || 0}
                      <span className="divider">|</span>
                      <span>CC</span> {student.ratings?.codechef || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} className="input" />
    </label>
  );
}

function Select({ label, children, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select {...props} className="input">
        {children}
      </select>
    </label>
  );
}

function TextArea({ label, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea {...props} className="input textarea" rows="4" />
    </label>
  );
}

function CenteredPanel({ text, tone }) {
  return (
    <div className={`panel center ${tone === 'error' ? 'panel-error' : ''}`}>
      <p>{text}</p>
    </div>
  );
}

function SidebarLink({ to, active, children }) {
  return (
    <Link className={`sidebar-link ${active ? 'active' : ''}`} to={to}>
      {children}
    </Link>
  );
}

export default App;

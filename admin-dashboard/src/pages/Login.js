import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      const message =
        loginError.response?.data?.error ||
        loginError.message ||
        'Login failed. Please verify your admin credentials.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-admin-app px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-start">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-300 to-amber-500 text-xl font-black text-black shadow-lg shadow-amber-500/20">
              R
            </div>
            <div>
              <p className="text-xl font-semibold text-amber-300 md:text-2xl">RankMySkills</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin Portal</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 shadow-2xl backdrop-blur">
          <div className="inline-flex items-center gap-3 rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            Admin Portal
          </div>

          <h1 className="mt-6 max-w-lg text-4xl font-semibold leading-tight text-white md:text-5xl">
            Control approvals, platform growth, and leaderboard trust from one place.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            This dashboard is for the RankMySkills platform owner only. College admins use their own
            workflow after approval.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <FeatureCard icon="bx-user-check" title="Approve TPOs" text="Review college admin requests and unlock access safely." />
            <FeatureCard icon="bx-bar-chart-alt-2" title="Track Growth" text="Monitor students, colleges, and approval volume at a glance." />
            <FeatureCard icon="bx-trophy" title="Audit Rankings" text="Check the same global leaderboard data students already see." />
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white p-8 text-slate-900 shadow-2xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">Secure Access</p>
            <h2 className="mt-3 text-3xl font-semibold">Admin Login</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Use your seeded super admin account. Public admin registration is intentionally disabled.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white"
                placeholder="admin@rankmyskills.in"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white"
                placeholder="Enter your password"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-500 px-4 py-3.5 text-sm font-semibold text-stone-950 shadow-lg shadow-amber-500/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <i className="bx bx-loader-alt animate-spin text-lg" />
                  Signing in...
                </>
              ) : (
                <>
                  <i className="bx bx-log-in text-lg" />
                  Continue to Admin Dashboard
                </>
              )}
            </button>
          </form>
        </section>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
        <i className={`bx ${icon} text-2xl`} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </div>
  );
}

export default Login;

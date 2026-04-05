import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data.stats);
      } catch (loadError) {
        setError(loadError.response?.data?.error || 'Failed to load platform stats.');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <PageState title="Loading overview..." />;
  }

  if (error) {
    return <PageState title={error} isError />;
  }

  const cards = [
    { label: 'Total Students', value: stats?.total_students ?? 0, icon: 'bx-user', accent: 'from-amber-300 to-yellow-500' },
    { label: 'College Admins', value: stats?.total_college_admins ?? 0, icon: 'bx-id-card', accent: 'from-emerald-400 to-teal-500' },
    { label: 'Total Colleges', value: stats?.total_colleges ?? 0, icon: 'bx-buildings', accent: 'from-yellow-200 to-amber-400' },
    { label: 'Verified Colleges', value: stats?.verified_colleges ?? 0, icon: 'bx-badge-check', accent: 'from-lime-300 to-emerald-500' },
    { label: 'Pending Approvals', value: stats?.pending_admins ?? 0, icon: 'bx-time-five', accent: 'from-orange-300 to-amber-500' },
  ];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2rem] border border-white/10 bg-black/60 p-7 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Overview</p>
          <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">Good to see you, {user?.name || 'Admin'}.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            The admin console keeps approvals, college onboarding, and platform visibility in one
            place. The numbers below come directly from your live backend.
          </p>
        </div>

        <div className="rounded-[2rem] border border-amber-300/20 bg-amber-400/10 p-7 shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200">Quick Actions</p>
          <div className="mt-5 grid gap-3">
            <Link className="admin-action-link" to="/approvals">
              <span>Review pending approvals</span>
              <i className="bx bx-right-arrow-alt text-xl" />
            </Link>
            <Link className="admin-action-link" to="/colleges">
              <span>Inspect registered colleges</span>
              <i className="bx bx-right-arrow-alt text-xl" />
            </Link>
            <Link className="admin-action-link" to="/leaderboard">
              <span>Open global leaderboard</span>
              <i className="bx bx-right-arrow-alt text-xl" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-xl">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-slate-950`}>
              <i className={`bx ${card.icon} text-2xl`} />
            </div>
            <p className="mt-5 text-sm text-slate-400">{card.label}</p>
            <p className="mt-2 text-4xl font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold text-white">What this dashboard covers</h3>
          <div className="mt-5 space-y-4">
            {[
              'Approve college admins before they access student data.',
              'Track the total footprint of students and colleges on RankMySkills.',
              'Audit global performance through the same leaderboard foundation used by students.',
            ].map((item) => (
              <div key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                <i className="bx bx-check-circle mt-1 text-lg text-amber-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white p-6 text-slate-900">
          <h3 className="text-xl font-semibold">Platform posture</h3>
          <div className="mt-6 space-y-4">
            <MetricRow label="Approval pipeline" value={`${stats?.pending_admins ?? 0} waiting`} />
            <MetricRow label="Verified college coverage" value={`${stats?.verified_colleges ?? 0} live`} />
            <MetricRow label="College admin accounts" value={`${stats?.total_college_admins ?? 0} created`} />
            <MetricRow label="Student base" value={`${stats?.total_students ?? 0} active records`} />
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function PageState({ title, isError = false }) {
  return (
    <div className={`rounded-[2rem] border p-8 ${isError ? 'border-rose-300/40 bg-rose-400/10 text-rose-100' : 'border-white/10 bg-white/5 text-slate-200'}`}>
      <p className="text-base font-medium">{title}</p>
    </div>
  );
}

export default Overview;

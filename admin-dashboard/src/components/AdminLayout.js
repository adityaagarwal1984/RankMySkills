import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Overview', icon: 'bx-grid-alt' },
  { to: '/approvals', label: 'Approvals', icon: 'bx-user-check' },
  { to: '/colleges', label: 'Colleges', icon: 'bx-buildings' },
  { to: '/students', label: 'Students', icon: 'bx-group' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'bx-trophy' },
];

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-admin-app text-slate-100 md:flex">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-amber-200/10 bg-black/90 px-4 py-4 backdrop-blur md:hidden">
        <BrandBlock compact />
        <button
          type="button"
          className="rounded-2xl border border-amber-200/10 bg-white/5 p-2 text-slate-200"
          onClick={() => setIsSidebarOpen((value) => !value)}
        >
          <i className={`bx ${isSidebarOpen ? 'bx-x' : 'bx-menu'} text-2xl`} />
        </button>
      </div>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/80 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-amber-200/10 bg-black/95 px-5 pb-5 pt-6 shadow-2xl backdrop-blur transition-transform duration-300 md:static md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <BrandBlock />

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-500 text-stone-950 shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <i className={`bx ${item.icon} text-xl`} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 rounded-3xl border border-amber-300/20 bg-amber-400/8 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Admin Access</p>
          <p className="mt-2 text-sm text-slate-200">
            This portal is restricted to the platform owner. College admins use a separate dashboard.
          </p>
        </div>

        <div className="mt-auto pt-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 text-lg font-bold text-stone-950">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{user?.name || 'Admin'}</p>
                <p className="truncate text-sm text-slate-400">{user?.email}</p>
              </div>
            </div>

            <button
              type="button"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-200/10 bg-neutral-950 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-amber-400/30 hover:text-white"
              onClick={handleLogout}
            >
              <i className="bx bx-log-out text-lg" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="min-h-screen flex-1">
        <header className="hidden border-b border-amber-200/10 bg-black/70 px-8 py-5 backdrop-blur md:block">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-amber-300">RankMySkills Control</p>
              <h1 className="mt-1 text-2xl font-semibold text-white">Admin Dashboard</h1>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
              <p className="text-sm font-medium text-white">Welcome back, {user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-400">Super admin access active</p>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function BrandBlock({ compact = false }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'pr-4'}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-300 to-amber-500 text-xl font-black text-stone-950 shadow-lg shadow-amber-500/20">
        R
      </div>
      <div>
        <p className="text-lg font-semibold text-white md:text-xl">RankMySkills</p>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          {compact ? 'Admin' : 'Admin Console'}
        </p>
      </div>
    </div>
  );
}

export default AdminLayout;

import React, { useEffect, useState } from 'react';
import api from '../api/api';

function CollegeAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const response = await api.get('/admin/college-admins');
        setAdmins(response.data.admins || []);
      } catch (loadError) {
        const status = loadError.response?.status;
        if (status === 404) {
          setAdmins([]);
          setError('');
        } else {
          setError(loadError.response?.data?.error || 'Failed to load college admins.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadAdmins();
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-black/60 p-6">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-300">College Admins</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Verified college administrators</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          These admins have successfully registered and are actively approved to access college data.
        </p>
      </section>

      {loading ? <Panel text="Loading college admins..." /> : null}
      {!loading && error ? <Panel text={error} isError /> : null}

      {!loading && !error ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {admins.map((admin) => (
            <article key={admin.id} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Admin</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{admin.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{admin.email}</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <i className="bx bx-badge-check text-base" />
                  Verified
                </span>
              </div>

              <div className="mt-6 grid gap-3 text-sm text-slate-300">
                <InfoRow label="College" value={admin.college_name} />
                <InfoRow label="Designation" value={admin.designation || 'NA'} />
                <InfoRow label="Phone" value={admin.phone || 'NA'} />
                <InfoRow label="Location" value={admin.college_location || 'Not provided'} />
              </div>
            </article>
          ))}

          {admins.length === 0 ? <Panel text="No verified college admins found." /> : null}
        </div>
      ) : null}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-black/60 px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-slate-200">{value}</span>
    </div>
  );
}

function Panel({ text, isError = false }) {
  return (
    <div className={`rounded-[2rem] border px-6 py-5 ${isError ? 'border-rose-300/40 bg-rose-400/10 text-rose-100' : 'border-white/10 bg-white/5 text-slate-200'}`}>
      <p className="text-sm">{text}</p>
    </div>
  );
}

export default CollegeAdmins;

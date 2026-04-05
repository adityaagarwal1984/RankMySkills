import React, { useEffect, useState } from 'react';
import api from '../api/api';

function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [processingCollegeId, setProcessingCollegeId] = useState('');

  const loadColleges = async () => {
    try {
      const response = await api.get('/admin/colleges');
      setColleges(response.data.colleges || []);
      setError('');
    } catch (loadError) {
      setError(loadError.response?.data?.error || 'Failed to load colleges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColleges();
  }, []);

  const denyAccess = async (collegeId) => {
    setProcessingCollegeId(collegeId);
    setActionMessage('');

    try {
      const response = await api.post(`/admin/deny-college-access/${collegeId}`);
      setActionMessage(response.data.message || 'College access denied successfully.');
      await loadColleges();
    } catch (actionError) {
      setActionMessage(actionError.response?.data?.error || 'Failed to deny college access.');
    } finally {
      setProcessingCollegeId('');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-black/60 p-6">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-300">College Registry</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">All onboarded colleges</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          A college is treated as live when it has approved college admin access. Approval now marks
          the college verified automatically, and denying access will lock that college admin out again.
        </p>
      </section>

      {actionMessage ? (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {actionMessage}
        </div>
      ) : null}

      {loading ? <Panel text="Loading colleges..." /> : null}
      {!loading && error ? <Panel text={error} isError /> : null}

      {!loading && !error ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {colleges.map((college) => {
            const summary = college.admin_summary || {};
            const hasApprovedAdmin = Boolean(summary.has_approved_admin);
            const isVerified = Boolean(college.verified && hasApprovedAdmin);
            const activeAdminEmail = isVerified ? summary.latest_approved_admin?.email || 'NA' : 'NA';

            return (
              <article key={college.college_id} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">College</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{college.name_display}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isVerified ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300'}`}>
                      <i className={`bx ${isVerified ? 'bx-badge-check' : 'bx-time-five'} text-base`} />
                      {isVerified ? 'Verified' : 'Pending'}
                    </span>
                    {isVerified && (
                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                        Green tick active
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-3 text-sm text-slate-300">
                  <InfoRow label="College ID" value={college.college_id} />
                  <InfoRow label="Admin Email" value={activeAdminEmail} />
                  <InfoRow label="Approved Admins" value={summary.approved_admins ?? 0} />
                  <InfoRow label="Pending Admins" value={summary.pending_admins ?? 0} />
                  <InfoRow
                    label="Location"
                    value={
                      college.location?.city || college.location?.state
                        ? `${college.location?.city || ''}${college.location?.city && college.location?.state ? ', ' : ''}${college.location?.state || ''}`
                        : 'Not provided'
                    }
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm ${isVerified ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200' : 'border-amber-300/20 bg-amber-400/10 text-amber-100'}`}>
                    <i className={`bx ${isVerified ? 'bx-check-circle' : 'bx-pause-circle'} text-lg`} />
                    {isVerified ? 'College admin can access dashboard' : 'College access is restricted'}
                  </span>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!isVerified || processingCollegeId === college.college_id}
                    onClick={() => denyAccess(college.college_id)}
                  >
                    {processingCollegeId === college.college_id ? (
                      <>
                        <i className="bx bx-loader-alt animate-spin text-lg" />
                        Denying...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-block text-lg" />
                        Deny Access
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}

          {colleges.length === 0 ? <Panel text="No colleges found." /> : null}
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

export default Colleges;

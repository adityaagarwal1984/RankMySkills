import React, { useEffect, useState } from 'react';
import api from '../api/api';

function Approvals() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [processingId, setProcessingId] = useState('');

  const loadPendingAdmins = async () => {
    try {
      const response = await api.get('/admin/pending-admins');
      setAdmins(response.data.admins || []);
      setError('');
    } catch (loadError) {
      setError(loadError.response?.data?.error || 'Failed to load pending approvals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingAdmins();
  }, []);

  const approveAdmin = async (adminId) => {
    setProcessingId(adminId);
    setActionMessage('');

    try {
      await api.post(`/admin/approve-admin/${adminId}`);
      setAdmins((current) => current.filter((admin) => admin._id !== adminId));
      setActionMessage('College admin approved and college marked as verified.');
    } catch (approveError) {
      setActionMessage(approveError.response?.data?.error || 'Approval failed.');
    } finally {
      setProcessingId('');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-black/60 p-6">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Pending Requests</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">College admin approvals</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Review each TPO request before platform access is enabled. Approval updates the existing
          backend account immediately.
        </p>
      </section>

      {actionMessage ? (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {actionMessage}
        </div>
      ) : null}

      {loading ? <ListState text="Loading pending admins..." /> : null}
      {!loading && error ? <ListState text={error} isError /> : null}

      {!loading && !error ? (
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-slate-400">
                <tr>
                  <th className="px-6 py-4">Admin</th>
                  <th className="px-6 py-4">College</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-sm text-slate-400">
                      No pending college admins right now.
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin._id} className="border-t border-white/10 text-sm text-slate-200">
                      <td className="px-6 py-5">
                        <p className="font-semibold text-white">{admin.name}</p>
                        <p className="mt-1 text-slate-400">{admin.email}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p>{admin.college?.name_display || 'Unknown college'}</p>
                        <p className="mt-1 text-xs text-slate-500">{admin.managed_college_id}</p>
                      </td>
                      <td className="px-6 py-5 text-slate-300">
                        {admin.college?.location?.city || admin.college?.location?.state
                          ? `${admin.college?.location?.city || ''}${admin.college?.location?.city && admin.college?.location?.state ? ', ' : ''}${admin.college?.location?.state || ''}`
                          : 'Not provided'}
                      </td>
                      <td className="px-6 py-5">
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-500 px-4 py-2.5 font-semibold text-stone-950 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                          disabled={processingId === admin._id}
                          onClick={() => approveAdmin(admin._id)}
                        >
                          {processingId === admin._id ? (
                            <>
                              <i className="bx bx-loader-alt animate-spin text-lg" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <i className="bx bx-check text-lg" />
                              Approve
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ListState({ text, isError = false }) {
  return (
    <div className={`rounded-[2rem] border px-6 py-5 ${isError ? 'border-rose-300/40 bg-rose-400/10 text-rose-100' : 'border-white/10 bg-white/5 text-slate-200'}`}>
      <p className="text-sm">{text}</p>
    </div>
  );
}

export default Approvals;

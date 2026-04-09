import React, { useEffect, useState } from 'react';
import api from '../api/api';

function Students() {
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [years, setYears] = useState([]);
  const [filters, setFilters] = useState({ college_id: '', year: 'all', page: 1, limit: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [collegeResponse, yearResponse] = await Promise.all([
          api.get('/admin/colleges'),
          api.get('/leaderboard/years'),
        ]);

        setColleges(collegeResponse.data.colleges || []);
        setYears(yearResponse.data.years || []);
      } catch (bootstrapError) {
        console.error('Student filters bootstrap failed:', bootstrapError);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      setError('');

      try {
        const params = {
          page: filters.page,
          limit: filters.limit,
        };

        if (filters.college_id) {
          params.college_id = filters.college_id;
        }

        if (filters.year && filters.year !== 'all') {
          params.year = filters.year;
        }

        const response = await api.get('/admin/students', { params });
        setStudents(response.data.students || []);
        setMeta(response.data.meta || null);
      } catch (loadError) {
        setError(loadError.response?.data?.error || 'Failed to load students.');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/65 p-6">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Student Registry</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">All student accounts</h2>
      </section>

      <section className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 md:grid-cols-3">
        <FilterSelect name="college_id" label="College" value={filters.college_id} onChange={handleFilterChange}>
          <option value="">All colleges</option>
          {colleges.map((college) => (
            <option key={college.college_id} value={college.college_id}>
              {college.name_display}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect name="year" label="Graduation year" value={filters.year} onChange={handleFilterChange}>
          <option value="all">All years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect name="limit" label="Rows per page" value={filters.limit} onChange={handleFilterChange}>
          {[25, 50, 100].map((limit) => (
            <option key={limit} value={limit}>
              {limit}
            </option>
          ))}
        </FilterSelect>
      </section>

      {loading ? <Panel text="Loading students..." /> : null}
      {!loading && error ? <Panel text={error} isError /> : null}

      {!loading && !error ? (
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-slate-400">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">College</th>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4">Course</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-sm text-slate-400">
                      No students found for the current filters.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const collegeName = colleges.find((college) => college.college_id === student.college_id)?.name_display || student.college_id;

                    return (
                      <tr key={`${student.email}-${student.college_id}`} className="border-t border-white/10 text-sm text-slate-200">
                        <td className="px-6 py-5">
                          <p className="font-semibold text-white">{student.name}</p>
                          <p className="mt-1 text-slate-400">{student.email}</p>
                        </td>
                        <td className="px-6 py-5 text-slate-300">{collegeName}</td>
                        <td className="px-6 py-5 text-slate-300">{student.graduation_year}</td>
                        <td className="px-6 py-5 text-slate-300">{student.course}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {meta ? (
        <div className="flex flex-col gap-3 rounded-[2rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
          <p>
            Page {meta.page} of {meta.total_pages} | {meta.total} students
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-2xl border border-white/10 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={meta.page <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded-2xl border border-white/10 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={meta.page >= meta.total_pages}
              onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterSelect({ label, children, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <select
        {...props}
        className="w-full rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400"
      >
        {children}
      </select>
    </label>
  );
}

function Panel({ text, isError = false }) {
  return (
    <div className={`rounded-[2rem] border px-6 py-5 ${isError ? 'border-rose-300/40 bg-rose-400/10 text-rose-100' : 'border-white/10 bg-white/5 text-slate-200'}`}>
      <p className="text-sm">{text}</p>
    </div>
  );
}

export default Students;

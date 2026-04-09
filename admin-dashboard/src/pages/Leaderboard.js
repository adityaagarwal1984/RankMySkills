import React, { useEffect, useState } from 'react';
import api from '../api/api';

function Leaderboard() {
  const [filters, setFilters] = useState({
    year: 'all',
    course: 'all',
    college_id: '',
    sort: 'engineer_score',
    page: 1,
    limit: 25,
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [meta, setMeta] = useState(null);
  const [years, setYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [yearResponse, courseResponse, collegeResponse] = await Promise.all([
          api.get('/leaderboard/years'),
          api.get('/leaderboard/courses'),
          api.get('/admin/colleges'),
        ]);

        setYears(yearResponse.data.years || []);
        setCourses(courseResponse.data.courses || []);
        setColleges(collegeResponse.data.colleges || []);
      } catch (loadError) {
        console.error('Leaderboard filter load failed:', loadError);
      }
    };

    loadFilterOptions();
  }, []);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      setError('');

      try {
        const params = { ...filters };
        if (!params.college_id) {
          delete params.college_id;
        }
        const response = await api.get('/leaderboard', { params });
        setLeaderboard(response.data.leaderboard || []);
        setMeta(response.data.meta || null);
      } catch (loadError) {
        setError(loadError.response?.data?.error || 'Failed to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-950/65 p-6">
        <p className="text-sm uppercase tracking-[0.35em] text-amber-300">Leaderboard Audit</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Global leaderboard</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          This view uses the same platform ranking data exposed to students, so you can audit what
          the product is currently showing.
        </p>
      </section>

      <section className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 md:grid-cols-5">
        <FilterSelect name="year" label="Year" value={filters.year} onChange={handleFilterChange}>
          <option value="all">All years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect name="course" label="Course" value={filters.course} onChange={handleFilterChange}>
          <option value="all">All courses</option>
          {courses.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect name="college_id" label="College" value={filters.college_id} onChange={handleFilterChange}>
          <option value="">All colleges</option>
          {colleges.map((college) => (
            <option key={college.college_id} value={college.college_id}>
              {college.name_display}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect name="sort" label="Sort" value={filters.sort} onChange={handleFilterChange}>
          <option value="engineer_score">Engineer Score</option>
          <option value="cf">Codeforces</option>
          <option value="lc">LeetCode</option>
          <option value="cc">CodeChef</option>
        </FilterSelect>

        <FilterSelect name="limit" label="Rows per page" value={filters.limit} onChange={handleFilterChange}>
          {[25, 50, 100].map((limit) => (
            <option key={limit} value={limit}>
              {limit}
            </option>
          ))}
        </FilterSelect>
      </section>

      {loading ? <Panel text="Loading leaderboard..." /> : null}
      {!loading && error ? <Panel text={error} isError /> : null}

      {!loading && !error ? (
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.25em] text-slate-400">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">College</th>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4">Engineer Score</th>
                  <th className="px-6 py-4">Ratings</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                      No leaderboard rows found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((student) => (
                    <tr key={student.id} className="border-t border-white/10 text-sm text-slate-200">
                      <td className="px-6 py-5 text-lg font-semibold text-amber-300">#{student.rank}</td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-white">{student.name}</p>
                        <p className="mt-1 text-slate-400">{student.course}</p>
                      </td>
                      <td className="px-6 py-5 text-slate-300">{student.college}</td>
                      <td className="px-6 py-5 text-slate-300">{student.graduation_year}</td>
                      <td className="px-6 py-5 font-semibold text-white">{student.global_engineer_score}</td>
                      <td className="px-6 py-5 text-sm text-slate-300 whitespace-nowrap">
                        <span className="font-medium text-slate-200">LC</span> {student.ratings?.leetcode || 0}
                        <span className="mx-2 text-slate-600">|</span>
                        <span className="font-medium text-slate-200">CF</span> {student.ratings?.codeforces || 0}
                        <span className="mx-2 text-slate-600">|</span>
                        <span className="font-medium text-slate-200">CC</span> {student.ratings?.codechef || 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {meta ? (
        <div className="flex flex-col gap-3 rounded-[2rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
          <p>
            Page {meta.page} of {meta.total_pages} | {meta.total} ranked students
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

export default Leaderboard;

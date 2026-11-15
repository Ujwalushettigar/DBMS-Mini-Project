import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { examAPI } from '../services/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { Search, Filter, Layers, Calendar, IndianRupee, Users, ArrowRight } from 'lucide-react';

export function Examinations() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await examAPI.getAll({ status: statusFilter || undefined });
      if (res.success && res.data) {
        setExams(res.data);
      }
    } catch (err) {
      console.warn('Error fetching exams:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [statusFilter]);

  const filteredExams = exams.filter((e) => {
    const q = search.toLowerCase();
    const name = (e.examination_name || e.exam_name || '').toLowerCase();
    const code = (e.examination_code || e.exam_code || '').toLowerCase();
    const auth = (e.conducting_authority || '').toLowerCase();
    return !search || name.includes(q) || code.includes(q) || auth.includes(q);
  });

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Recruitment Examination Notifications"
        subtitle="Browse official notifications, review qualification criteria, and apply online"
        crumbs={[{ label: 'Examinations' }]}
      />

      {/* Filter and Search Bar */}
      <section className="gov-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by examination title, code (e.g. CGL-2026), or authority..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="gov-input !pl-9"
              aria-label="Search examinations"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="gov-input !pl-9"
              aria-label="Filter by examination status"
            >
              <option value="">All Statuses</option>
              <option value="published">Published / Open</option>
              <option value="closed">Closed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </section>

      {/* Examinations List */}
      {loading ? (
        <LoadingSpinner label="Retrieving examination notifications..." />
      ) : filteredExams.length === 0 ? (
        <div className="gov-card">
          <EmptyState
            title="No examinations found"
            message="There are no examination notices matching your filter or search criteria."
            icon={Layers}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExams.map((exam) => {
            const id = exam.examination_id || exam.id;
            const code = exam.examination_code || exam.exam_code;
            const name = exam.examination_name || exam.exam_name;
            const status = exam.examination_status || exam.status || 'published';

            return (
              <article
                key={id || code}
                className="gov-card p-5 transition hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gov-800 px-2 py-0.5 bg-gov-50 border border-line rounded">
                      {code}
                    </span>
                    <Badge>{status}</Badge>
                    <span className="text-xs text-slate-500 font-medium">
                      • {exam.conducting_authority || 'Central Recruitment Commission'}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-gov-800 hover:text-gov-600 transition">
                    <Link to={`/examinations/${id}`}>{name}</Link>
                  </h2>

                  <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl">
                    {exam.description || 'Public recruitment examination for administrative and executive cadres.'}
                  </p>

                  {/* Metrics bar */}
                  <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-600 border-t border-line/60">
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-slate-400" />
                      <span>Vacancies: <strong>{exam.total_vacancies !== undefined ? Number(exam.total_vacancies).toLocaleString() : '—'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      <span>Apply Deadline: <strong>{formatDate(exam.application_end_date)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      <span>Exam Date: <strong>{formatDate(exam.examination_date)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IndianRupee size={14} className="text-slate-400" />
                      <span>Fee: <strong>{formatCurrency(exam.application_fee)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="flex-shrink-0 flex items-center">
                  <Link
                    to={`/examinations/${id}`}
                    className="gov-btn gov-btn-primary"
                  >
                    <span>View Notice</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Examinations;

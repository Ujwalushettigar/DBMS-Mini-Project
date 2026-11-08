import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { examAPI } from '../services/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Search, Filter, Layers, Calendar, DollarSign, Users, ArrowRight } from 'lucide-react';

export const Examinations = () => {
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
    const matchSearch =
      !search ||
      e.examination_name?.toLowerCase().includes(q) ||
      e.examination_code?.toLowerCase().includes(q) ||
      e.conducting_authority?.toLowerCase().includes(q);
    return matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Filter Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Government Recruitment Examinations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse public examination notifications, check eligibility criteria, deadlines, and apply online.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by examination title, code (e.g. SSC-CGL), or authority..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none bg-white"
            >
              <option value="">All Statuses</option>
              <option value="published">Published (Open)</option>
              <option value="closed">Closed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Examinations Table / Cards */}
      {loading ? (
        <LoadingSpinner message="Retrieving examination notifications from database..." />
      ) : filteredExams.length === 0 ? (
        <EmptyState
          title="No examinations found"
          description="Try adjusting your search criteria or status filter."
          icon={Layers}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredExams.map((exam) => (
              <div
                key={exam.examination_id}
                className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-900 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded">
                      {exam.examination_code}
                    </span>
                    <Badge>{exam.examination_status}</Badge>
                    <span className="text-xs text-slate-500 font-medium">
                      • {exam.conducting_authority}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 hover:text-blue-900 transition">
                    <Link to={`/examinations/${exam.examination_id}`}>{exam.examination_name}</Link>
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl">
                    {exam.description || 'No description provided.'}
                  </p>

                  {/* Badges / Metrics bar */}
                  <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>Vacancies: <strong>{exam.total_vacancies.toLocaleString()}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Application Deadline: <strong>{formatDate(exam.application_end_date)}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Exam Date: <strong>{formatDate(exam.examination_date)}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span>Fee: <strong>{formatCurrency(exam.application_fee)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="flex-shrink-0 flex items-center">
                  <Link
                    to={`/examinations/${exam.examination_id}`}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-md text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 shadow-sm transition"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Examinations;


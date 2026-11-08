import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { StatsCard } from '../components/common/StatsCard';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/helpers';
import {
  Users,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Building,
  Award,
  ArrowRight
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardAPI.getAdminDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Admin dashboard fetch note:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Loading administrative metrics from PostgreSQL..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider block">
            Administrative Control Console
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Recruitment Operations Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time PostgreSQL database aggregates across all 9 relational entities.
          </p>
        </div>

        <div className="flex space-x-2">
          <Link
            to="/admin/examinations"
            className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm transition"
          >
            Create Examination
          </Link>
          <Link
            to="/admin/applications"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs font-semibold transition"
          >
            Review Applications
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid (Row 1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Registered Candidates"
          value={data?.total_candidates ?? 0}
          icon={Users}
          color="blue"
          description="Aspirant dossiers"
        />
        <StatsCard
          title="Published Examinations"
          value={data?.total_examinations ?? 0}
          icon={Layers}
          color="purple"
          description="Competitive notifications"
        />
        <StatsCard
          title="Total Applications"
          value={data?.total_applications ?? 0}
          icon={FileText}
          color="blue"
          description="Submitted entries"
        />
        <StatsCard
          title="Pending Scrutiny"
          value={data?.pending_applications ?? 0}
          icon={Clock}
          color="amber"
          description="Awaiting review"
        />
      </div>

      {/* KPI Stats Grid (Row 2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Accepted Applications"
          value={data?.accepted_applications ?? 0}
          icon={CheckCircle2}
          color="green"
          description="Eligible for exam"
        />
        <StatsCard
          title="Rejected Applications"
          value={data?.rejected_applications ?? 0}
          icon={XCircle}
          color="red"
          description="Ineligible"
        />
        <StatsCard
          title="Examination Centers"
          value={data?.total_centers ?? 0}
          icon={Building}
          color="slate"
          description="Accredited venues"
        />
        <StatsCard
          title="Results Published"
          value={data?.results_published ?? 0}
          icon={Award}
          color="green"
          description="Declared merit lists"
        />
      </div>

      {/* Tables Row: Recent Applications & Upcoming Examinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Application Submissions
            </h3>
            <Link
              to="/admin/applications"
              className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {(!data?.recent_applications || data.recent_applications.length === 0) ? (
            <div className="text-center py-8 text-xs text-slate-500">No applications received yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-2.5">App Number</th>
                    <th className="px-4 py-2.5">Candidate</th>
                    <th className="px-4 py-2.5">Exam</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {data.recent_applications.map((app) => (
                    <tr key={app.application_id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono font-medium text-blue-950">
                        {app.application_number}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {app.candidate?.full_name || app.candidates?.full_name || 'Candidate'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono">
                        {app.examination?.examination_code || app.examinations?.examination_code}
                      </td>
                      <td className="px-4 py-3">
                        <Badge size="sm">{app.application_status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Examinations */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Upcoming Active Examinations
            </h3>
            <Link
              to="/admin/examinations"
              className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {(!data?.upcoming_examinations || data.upcoming_examinations.length === 0) ? (
            <div className="text-center py-8 text-xs text-slate-500">No active examinations published.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {data.upcoming_examinations.map((exam) => (
                <div key={exam.examination_id} className="p-4 hover:bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-blue-900 mr-2">{exam.examination_code}</span>
                    <span className="font-semibold text-slate-900">{exam.examination_name}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Exam Date: <strong>{formatDate(exam.examination_date)}</strong> • Vacancies: {exam.total_vacancies.toLocaleString()}
                    </p>
                  </div>
                  <Badge size="sm">{exam.examination_status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


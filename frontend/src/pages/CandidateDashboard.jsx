import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatsCard } from '../components/common/StatsCard';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/helpers';
import {
  FileText,
  Clock,
  CheckCircle2,
  Layers,
  CreditCard,
  Award,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const CandidateDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardAPI.getCandidateDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Dashboard loading note:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Loading candidate metrics and applications..." />;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider block">
            Candidate Portal Dashboard
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Welcome, {user?.full_name || 'Aspirant'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registration No: <strong className="font-mono text-slate-800">{user?.candidate_number || 'CND-2026-ACTIVE'}</strong> • {user?.email}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/candidate/examinations"
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm transition"
          >
            Apply for Examination
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Applications"
          value={data?.total_applications ?? 0}
          icon={FileText}
          color="blue"
          description="Submitted notices"
        />
        <StatsCard
          title="Pending Verification"
          value={data?.pending_applications ?? 0}
          icon={Clock}
          color="amber"
          description="Under scrutiny"
        />
        <StatsCard
          title="Accepted Applications"
          value={data?.accepted_applications ?? 0}
          icon={CheckCircle2}
          color="green"
          description="Cleared for exam"
        />
        <StatsCard
          title="Available Exams"
          value={data?.available_examinations ?? 0}
          icon={Layers}
          color="purple"
          description="Open for registration"
        />
      </div>

      {/* Secondary Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Admit Cards Issued</p>
              <h4 className="text-xl font-bold text-slate-900 mt-0.5">{data?.admit_cards_count ?? 0} Hall Tickets</h4>
              <p className="text-xs text-slate-500">Available for print / download</p>
            </div>
          </div>
          <Link
            to="/candidate/admit-cards"
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View Cards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Declared Results</p>
              <h4 className="text-xl font-bold text-slate-900 mt-0.5">{data?.published_results_count ?? 0} Scorecards</h4>
              <p className="text-xs text-slate-500">Verified merit published</p>
            </div>
          </div>
          <Link
            to="/candidate/results"
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Check Results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Application Activity */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            My Recent Applications
          </h3>
          <Link
            to="/candidate/applications"
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {(!data?.recent_applications || data.recent_applications.length === 0) ? (
          <div className="text-center py-8 text-xs text-slate-500">
            You have not submitted any examination applications yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">App Number</th>
                  <th className="px-6 py-3">Examination</th>
                  <th className="px-6 py-3">Applied Date</th>
                  <th className="px-6 py-3">Exam Center</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {data.recent_applications.map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 font-mono font-medium text-blue-950">
                      {app.application_number}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-900">{app.examination?.examination_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{app.examination?.examination_code}</div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {formatDate(app.applied_at)}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {app.exam_center ? `${app.exam_center.center_name} (${app.exam_center.city})` : 'Pending Allocation'}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge>{app.application_status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;


import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { StatsCard } from '../components/common/StatsCard';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { formatDate } from '../utils/helpers';
import {
  Users,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Award,
  ArrowRight,
  Plus
} from 'lucide-react';

export function AdminDashboard() {
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

  if (loading) return <LoadingSpinner label="Loading administrative metrics from PostgreSQL..." />;

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Recruitment Operations Overview"
        subtitle="Real-time administrative telemetry and database aggregates across all 9 relational entities"
        crumbs={[{ label: 'Dashboard' }]}
        actions={
          <div className="flex gap-2">
            <Link
              to="/admin/examinations"
              className="gov-btn gov-btn-accent text-xs"
            >
              <Plus size={14} />
              <span>New Examination</span>
            </Link>
            <Link
              to="/admin/applications"
              className="gov-btn gov-btn-outline text-xs"
            >
              Review Applications
            </Link>
          </div>
        }
      />

      {/* KPI Stats Grid - Row 1 */}
      <section aria-label="Primary recruitment metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Registered Candidates"
          value={data?.total_candidates ?? 0}
          icon={Users}
          tone="blue"
          hint="Candidate dossiers"
        />
        <StatsCard
          title="Published Examinations"
          value={data?.total_examinations ?? 0}
          icon={Layers}
          tone="purple"
          hint="Active notices"
        />
        <StatsCard
          title="Total Applications"
          value={data?.total_applications ?? 0}
          icon={FileText}
          tone="blue"
          hint="Submissions filed"
        />
        <StatsCard
          title="Pending Scrutiny"
          value={data?.pending_applications ?? 0}
          icon={Clock}
          tone="saffron"
          hint="Awaiting verification"
        />
      </section>

      {/* KPI Stats Grid - Row 2 */}
      <section aria-label="Secondary recruitment metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Accepted Applications"
          value={data?.accepted_applications ?? 0}
          icon={CheckCircle2}
          tone="green"
          hint="Eligible for admit card"
        />
        <StatsCard
          title="Rejected Applications"
          value={data?.rejected_applications ?? 0}
          icon={XCircle}
          tone="red"
          hint="Ineligible / Disqualified"
        />
        <StatsCard
          title="Examination Centers"
          value={data?.total_centers ?? 0}
          icon={Building2}
          tone="slate"
          hint="Venues configured"
        />
        <StatsCard
          title="Results Published"
          value={data?.results_published ?? 0}
          icon={Award}
          tone="green"
          hint="Declared merit rankings"
        />
      </section>

      {/* Tables Row: Recent Applications & Upcoming Examinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <section className="gov-card">
          <div className="gov-card-header justify-between">
            <span className="font-bold text-xs uppercase tracking-wider">
              Recent Application Submissions
            </span>
            <Link
              to="/admin/applications"
              className="gov-link text-xs font-semibold inline-flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {(!data?.recent_applications || data.recent_applications.length === 0) ? (
            <div className="p-4">
              <EmptyState title="No applications received yet" message="Applications will appear here once candidates apply." />
            </div>
          ) : (
            <div className="gov-table-wrap !border-0 !rounded-none">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>App Number</th>
                    <th>Candidate</th>
                    <th>Exam</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_applications.map((app) => (
                    <tr key={app.application_id}>
                      <td className="whitespace-nowrap font-mono text-xs font-semibold text-gov-800">
                        {app.application_number}
                      </td>
                      <td className="font-semibold text-slate-800">
                        {app.candidate?.full_name || app.candidates?.full_name || 'Candidate'}
                      </td>
                      <td className="text-slate-600 font-mono text-xs">
                        {app.examination?.examination_code || app.examinations?.examination_code}
                      </td>
                      <td>
                        <Badge size="sm">{app.application_status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Upcoming Examinations */}
        <section className="gov-card">
          <div className="gov-card-header justify-between">
            <span className="font-bold text-xs uppercase tracking-wider">
              Upcoming Active Examinations
            </span>
            <Link
              to="/admin/examinations"
              className="gov-link text-xs font-semibold inline-flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {(!data?.upcoming_examinations || data.upcoming_examinations.length === 0) ? (
            <div className="p-4">
              <EmptyState title="No active examinations published" message="Create an examination notice to publish schedules." />
            </div>
          ) : (
            <div className="gov-table-wrap !border-0 !rounded-none">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Notice Code</th>
                    <th>Examination Name</th>
                    <th>Exam Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.upcoming_examinations.map((exam) => (
                    <tr key={exam.examination_id}>
                      <td className="whitespace-nowrap font-mono text-xs font-bold text-gov-800">
                        {exam.examination_code}
                      </td>
                      <td>
                        <div className="font-semibold text-gov-900">{exam.examination_name}</div>
                        <div className="text-[11px] text-slate-500">Vacancies: {Number(exam.total_vacancies).toLocaleString()}</div>
                      </td>
                      <td className="whitespace-nowrap text-slate-600">
                        {formatDate(exam.examination_date)}
                      </td>
                      <td>
                        <Badge size="sm">{exam.examination_status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;

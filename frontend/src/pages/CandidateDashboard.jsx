import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatsCard } from '../components/common/StatsCard';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { formatDate } from '../utils/helpers';
import {
  FileText,
  Clock,
  CheckCircle2,
  Layers,
  Ticket,
  Award,
  ArrowRight
} from 'lucide-react';

export function CandidateDashboard() {
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

  if (loading) return <LoadingSpinner label="Loading candidate metrics and applications..." />;

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Candidate Dashboard"
        subtitle="Recruitment services, examination notices, admit cards, and published merit results"
        crumbs={[{ label: 'Dashboard' }]}
        actions={
          <Link
            to="/candidate/examinations"
            className="gov-btn gov-btn-accent text-xs"
          >
            Apply for Examination
          </Link>
        }
      />

      {/* Welcome Dossier */}
      <section className="gov-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-gov-700">
        <div>
          <span className="text-xs font-semibold text-gov-700 uppercase tracking-wider block">
            Applicant Identification Dossier
          </span>
          <h2 className="text-xl font-bold text-gov-900 mt-0.5">
            Welcome, {user?.full_name || 'Aspirant'}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Candidate No: <strong className="font-mono text-gov-800">{user?.candidate_number || 'CND-2026-ACTIVE'}</strong> • Email: <span className="font-medium text-slate-800">{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/candidate/profile"
            className="gov-btn gov-btn-outline text-xs"
          >
            View Profile
          </Link>
          <Link
            to="/candidate/examinations"
            className="gov-btn gov-btn-primary text-xs"
          >
            Browse Exams
          </Link>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section aria-label="Key performance indicators" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Applications"
          value={data?.total_applications ?? 0}
          icon={FileText}
          tone="blue"
          hint="Submitted notices"
        />
        <StatsCard
          title="Pending Verification"
          value={data?.pending_applications ?? 0}
          icon={Clock}
          tone="saffron"
          hint="Under scrutiny"
        />
        <StatsCard
          title="Accepted Applications"
          value={data?.accepted_applications ?? 0}
          icon={CheckCircle2}
          tone="green"
          hint="Cleared for exam"
        />
        <StatsCard
          title="Available Exams"
          value={data?.available_examinations ?? 0}
          icon={Layers}
          tone="blue"
          hint="Open for registration"
        />
      </section>

      {/* Secondary Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="gov-card p-4 flex items-center justify-between border-l-4 border-india-green">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-india-green">
              <Ticket size={22} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admit Cards Issued</p>
              <h3 className="text-xl font-bold text-gov-900 mt-0.5">{data?.admit_cards_count ?? 0} Hall Tickets</h3>
              <p className="text-xs text-slate-500">Available for print / verification</p>
            </div>
          </div>
          <Link
            to="/candidate/admit-cards"
            className="gov-btn gov-btn-outline text-xs"
          >
            <span>View Cards</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="gov-card p-4 flex items-center justify-between border-l-4 border-gov-700">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gov-50 text-gov-700">
              <Award size={22} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Declared Results</p>
              <h3 className="text-xl font-bold text-gov-900 mt-0.5">{data?.published_results_count ?? 0} Scorecards</h3>
              <p className="text-xs text-slate-500">Official merit scores published</p>
            </div>
          </div>
          <Link
            to="/candidate/results"
            className="gov-btn gov-btn-outline text-xs"
          >
            <span>Check Results</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Application Activity */}
      <section className="gov-card">
        <div className="gov-card-header justify-between">
          <span className="font-bold">Recent Application Filings</span>
          <Link
            to="/candidate/applications"
            className="gov-link text-xs font-semibold inline-flex items-center gap-1"
          >
            <span>View All Applications</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {(!data?.recent_applications || data.recent_applications.length === 0) ? (
          <EmptyState
            title="No applications filed yet"
            message="Browse available examination notices and submit your application online."
            action={
              <Link to="/candidate/examinations" className="gov-btn gov-btn-primary text-xs">
                Browse Examinations
              </Link>
            }
          />
        ) : (
          <div className="gov-table-wrap !border-0 !rounded-none">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>App Number</th>
                  <th>Examination Notice</th>
                  <th>Applied On</th>
                  <th>Designated Center</th>
                  <th>Scrutiny Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_applications.map((app) => (
                  <tr key={app.application_id}>
                    <td className="whitespace-nowrap font-mono text-xs font-semibold text-gov-800">
                      {app.application_number}
                    </td>
                    <td>
                      <div className="font-semibold text-gov-900">{app.examination?.examination_name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{app.examination?.examination_code}</div>
                    </td>
                    <td className="whitespace-nowrap text-slate-600">
                      {formatDate(app.applied_at)}
                    </td>
                    <td className="text-slate-600">
                      {app.exam_center ? `${app.exam_center.center_name} (${app.exam_center.city})` : 'Pending Allocation'}
                    </td>
                    <td>
                      <Badge>{app.application_status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default CandidateDashboard;

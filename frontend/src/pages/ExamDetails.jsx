import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { examAPI } from '../services/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { PageHeader } from '../components/common/PageHeader';
import { Alert } from '../components/common/Alert';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Users,
  IndianRupee,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  FileText
} from 'lucide-react';

export function ExamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCandidate } = useAuth();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await examAPI.getById(id);
        if (res.success && res.data) {
          setExam(res.data);
        } else {
          setError('Examination notice not found.');
        }
      } catch (err) {
        setError(err.message || 'Error loading examination details.');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading examination specifications..." />;

  if (error || !exam) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Examination Notice"
          crumbs={[{ label: 'Examinations', to: '/examinations' }, { label: 'Notice Details' }]}
        />
        <div className="gov-card p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-gov-800">Examination Notice Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'The requested examination record does not exist.'}</p>
          <Link to="/examinations" className="gov-btn gov-btn-outline inline-block">
            Back to Examinations
          </Link>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const isPublished = exam.examination_status === 'published';
  const isWithinDates = today >= exam.application_start_date && today <= exam.application_end_date;
  const canApply = isPublished && isWithinDates;

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title={exam.examination_name}
        subtitle={`Official Notification Ref: ${exam.examination_code} • ${exam.conducting_authority || 'Central Recruitment Commission'}`}
        crumbs={[{ label: 'Examinations', to: '/examinations' }, { label: exam.examination_code }]}
        actions={
          <Link to="/examinations" className="gov-btn gov-btn-outline text-xs">
            <ArrowLeft size={14} /> Back to Notices
          </Link>
        }
      />

      <section className="gov-card">
        <div className="gov-card-header justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} />
            <span>Examination Specifications & Schedule</span>
          </div>
          <Badge>{exam.examination_status}</Badge>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metric Blocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded bg-slate-50 border border-line text-xs">
            <div>
              <span className="text-slate-500 block uppercase font-medium">Total Vacancies</span>
              <span className="font-bold text-gov-900 text-sm mt-0.5 block">
                {exam.total_vacancies !== undefined ? Number(exam.total_vacancies).toLocaleString() : '—'} Posts
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-medium">Application Fee</span>
              <span className="font-bold text-gov-900 text-sm mt-0.5 block">
                {formatCurrency(exam.application_fee)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-medium">Application Window</span>
              <span className="font-bold text-gov-900 text-xs mt-0.5 block">
                {formatDate(exam.application_start_date)} - {formatDate(exam.application_end_date)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-medium">Scheduled Exam Date</span>
              <span className="font-bold text-saffron-600 text-sm mt-0.5 block">
                {formatDate(exam.examination_date)}
              </span>
            </div>
          </div>

          {/* Description & Eligibility */}
          <div className="space-y-4 text-xs leading-relaxed text-slate-700">
            <div>
              <h3 className="gov-section-title !text-sm">Job Description & Scope</h3>
              <p className="bg-slate-50 p-4 rounded border border-line text-slate-700">
                {exam.description || 'Public recruitment examination for administrative and executive cadres.'}
              </p>
            </div>

            <div>
              <h3 className="gov-section-title !text-sm">Prescribed Eligibility Criteria</h3>
              <div className="bg-slate-50 p-4 rounded border border-line text-slate-700 whitespace-pre-line">
                {exam.eligibility_criteria || 'Candidates must possess a Bachelor degree from a recognized university and be within the prescribed age limit on the closing date.'}
              </div>
            </div>
          </div>

          {/* Allocated Centers */}
          <div className="space-y-3 pt-2">
            <h3 className="gov-section-title !text-sm">Designated Examination Centers</h3>
            {(!exam.examination_centers || exam.examination_centers.length === 0) ? (
              <p className="text-xs text-slate-500 italic">No specific exam centers allocated to this notification yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {exam.examination_centers.map((ec, idx) => (
                  <div key={idx} className="p-3 rounded border border-line bg-slate-50 text-xs space-y-1">
                    <div className="font-bold text-gov-800 flex items-center space-x-1.5">
                      <Building size={14} className="text-gov-700" />
                      <span>{ec.exam_centers?.center_name || 'Designated Venue'}</span>
                    </div>
                    <p className="text-slate-600">{ec.exam_centers?.city}, {ec.exam_centers?.state}</p>
                    <p className="text-[11px] text-slate-500">Allocated Quota: {ec.allocated_capacity} seats</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Application Action Strip */}
          <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              {canApply ? (
                <span className="text-india-green font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={16} />
                  <span>Online applications are currently open for this examination notice.</span>
                </span>
              ) : (
                <span className="text-saffron-600 font-semibold flex items-center gap-1.5">
                  <AlertCircle size={16} />
                  <span>Application period is closed, upcoming, or notice is not published.</span>
                </span>
              )}
            </div>

            <div>
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="gov-btn gov-btn-primary"
                >
                  Sign In to Apply
                </Link>
              ) : isCandidate ? (
                <Link
                  to={`/candidate/apply/${exam.examination_id || exam.id}`}
                  className={`gov-btn ${
                    canApply
                      ? 'gov-btn-accent'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed pointer-events-none'
                  }`}
                >
                  {canApply ? 'Proceed to Apply' : 'Applications Closed'}
                </Link>
              ) : (
                <span className="text-xs text-slate-500 italic">Signed in as Administrator</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ExamDetails;

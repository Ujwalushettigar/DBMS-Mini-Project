import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { examAPI } from '../services/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Users,
  DollarSign,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  FileText,
  MapPin
} from 'lucide-react';

export const ExamDetails = () => {
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
          setError('Examination not found.');
        }
      } catch (err) {
        setError(err.message || 'Error loading examination details.');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading examination specifications..." />;
  if (error || !exam) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Examination Notice Not Found</h3>
        <p className="text-xs text-slate-500">{error || 'The requested examination record does not exist.'}</p>
        <Link to="/examinations" className="inline-block px-4 py-2 bg-blue-900 text-white rounded text-xs font-semibold">
          Back to Examinations
        </Link>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const isPublished = exam.examination_status === 'published';
  const isWithinDates = today >= exam.application_start_date && today <= exam.application_end_date;
  const canApply = isPublished && isWithinDates;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <Link to="/examinations" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all examinations</span>
      </Link>

      {/* Main Notice Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-blue-900 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded">
              {exam.examination_code}
            </span>
            <Badge>{exam.examination_status}</Badge>
            <span className="text-xs text-slate-500 font-medium">
              • {exam.conducting_authority}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{exam.examination_name}</h1>
          <p className="text-xs text-slate-500">Conducted by: <strong>{exam.conducting_authority}</strong></p>
        </div>

        {/* Vital Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 block">Total Vacancies</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">{exam.total_vacancies.toLocaleString()} Posts</span>
          </div>
          <div>
            <span className="text-slate-400 block">Application Fee</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">{formatCurrency(exam.application_fee)}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Application Period</span>
            <span className="font-bold text-slate-800 text-xs mt-0.5 block">
              {formatDate(exam.application_start_date)} - {formatDate(exam.application_end_date)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Scheduled Exam Date</span>
            <span className="font-bold text-blue-900 text-sm mt-0.5 block">{formatDate(exam.examination_date)}</span>
          </div>
        </div>

        {/* Description & Eligibility */}
        <div className="space-y-4 text-xs leading-relaxed text-slate-700">
          <div>
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-1.5">Description</h3>
            <p className="bg-slate-50 p-4 rounded border border-slate-200 text-slate-600">
              {exam.description || 'No detailed scope provided.'}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-1.5">Eligibility Criteria</h3>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 text-slate-600 whitespace-pre-line">
              {exam.eligibility_criteria || 'Candidates must satisfy general government educational standards.'}
            </div>
          </div>
        </div>

        {/* Allocated Examination Centers */}
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Designated Examination Centers</h3>
          {(!exam.examination_centers || exam.examination_centers.length === 0) ? (
            <p className="text-xs text-slate-500 italic">No specific exam centers allocated yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {exam.examination_centers.map((ec, idx) => (
                <div key={idx} className="p-3 rounded border border-slate-200 bg-slate-50 text-xs space-y-1">
                  <div className="font-bold text-slate-800 flex items-center space-x-1">
                    <Building className="w-3.5 h-3.5 text-blue-900" />
                    <span>{ec.exam_centers?.center_name || 'Designated Venue'}</span>
                  </div>
                  <p className="text-slate-500">{ec.exam_centers?.city}, {ec.exam_centers?.state}</p>
                  <p className="text-[11px] text-slate-400">Allocated Quota: {ec.allocated_capacity} seats</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button Section */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {canApply ? (
              <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Online applications are actively being accepted for this examination.</span>
              </span>
            ) : (
              <span className="text-amber-700 font-semibold flex items-center space-x-1">
                <AlertCircle className="w-4 h-4" />
                <span>Application period is currently closed or in draft status.</span>
              </span>
            )}
          </div>

          <div>
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm transition inline-block text-center"
              >
                Sign In to Apply
              </Link>
            ) : isCandidate ? (
              <Link
                to={`/candidate/apply?exam_id=${exam.examination_id}`}
                className={`px-6 py-2.5 rounded text-xs font-semibold shadow-sm transition inline-block text-center ${
                  canApply
                    ? 'bg-blue-900 hover:bg-blue-800 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed pointer-events-none'
                }`}
              >
                {canApply ? 'Apply Now' : 'Applications Closed'}
              </Link>
            ) : (
              <span className="text-xs text-slate-500 italic">Logged in as Administrator</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDetails;


import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { examAPI, candidateAPI, applicationAPI, centerAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { FileText, CheckCircle2, Building, AlertCircle, ArrowLeft } from 'lucide-react';

export const ApplyExam = () => {
  const [searchParams] = useSearchParams();
  const examIdParam = searchParams.get('exam_id');
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [exams, setExams] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState(examIdParam || '');
  const [selectedCenterId, setSelectedCenterId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [declaration, setDeclaration] = useState(false);

  useEffect(() => {
    const initData = async () => {
      try {
        const [cRes, eRes, centRes] = await Promise.all([
          candidateAPI.getMyProfile(),
          examAPI.getAll({ status: 'published' }),
          centerAPI.getAll()
        ]);

        if (cRes.success) setCandidate(cRes.data);
        if (eRes.success) {
          setExams(eRes.data);
          if (examIdParam) {
            setSelectedExamId(examIdParam);
          } else if (eRes.data.length > 0) {
            setSelectedExamId(eRes.data[0].examination_id);
          }
        }
        if (centRes.success) {
          setCenters(centRes.data);
          if (centRes.data.length > 0) setSelectedCenterId(centRes.data[0].center_id);
        }
      } catch (err) {
        setAlert({ type: 'error', message: err.message || 'Error initializing application form.' });
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [examIdParam]);

  const selectedExam = exams.find((e) => e.examination_id === selectedExamId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!declaration) {
      setAlert({ type: 'warning', message: 'You must declare that all submitted information is authentic.' });
      return;
    }

    setSubmitting(true);
    setAlert(null);

    try {
      const res = await applicationAPI.create({
        examination_id: selectedExamId,
        center_id: selectedCenterId
      });

      if (res.success) {
        navigate('/candidate/applications');
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.message || 'Failed to submit examination application. Duplicate applications are prohibited.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Preparing examination application form..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Link to="/candidate/examinations" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to available examinations</span>
      </Link>

      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Official Examination Application</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your candidate profile, select the target examination and examination center venue.
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
        {/* Step 1: Candidate Verification */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <span>1. Candidate Dossier Verification</span>
            <span className="font-mono text-blue-900">{candidate?.candidate_number}</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded border border-slate-200/80">
            <div>
              <span className="text-slate-400 block text-[11px]">Full Name</span>
              <span className="font-bold text-slate-800">{candidate?.full_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Category</span>
              <span className="font-bold text-slate-800">{candidate?.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Gender</span>
              <span className="font-bold text-slate-800">{candidate?.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Phone</span>
              <span className="font-bold text-slate-800">{candidate?.phone_number}</span>
            </div>
          </div>
        </div>

        {/* Step 2: Educational Qualifications Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider">
              2. Academic Eligibility Verification
            </h3>
            <Link to="/candidate/qualifications" className="text-blue-900 hover:underline font-semibold text-[11px]">
              Manage Qualifications
            </Link>
          </div>
          {(!candidate?.qualifications || candidate.qualifications.length === 0) ? (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded">
              Warning: You have no recorded educational qualifications. Please add at least one qualification in your profile before applying.
            </div>
          ) : (
            <div className="space-y-1.5">
              {candidate.qualifications.map((q, idx) => (
                <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <strong>{q.qualification_level}</strong> — {q.institution_name} ({q.board_or_university})
                  </div>
                  <div className="font-semibold text-blue-900">
                    {q.percentage}% ({q.passing_year})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Examination Selection */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5">
            3. Select Examination Notice
          </h3>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Examination *</label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none bg-white font-medium"
            >
              {exams.map((e) => (
                <option key={e.examination_id} value={e.examination_id}>
                  {e.examination_code} - {e.examination_name} ({e.conducting_authority})
                </option>
              ))}
            </select>
          </div>

          {selectedExam && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-blue-50/60 p-3.5 rounded border border-blue-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Vacancies:</span>
                <span className="font-bold text-slate-900">{selectedExam.total_vacancies.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Exam Date:</span>
                <span className="font-bold text-slate-900">{formatDate(selectedExam.examination_date)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Deadline:</span>
                <span className="font-bold text-slate-900">{formatDate(selectedExam.application_end_date)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Exam Fee:</span>
                <span className="font-bold text-emerald-800">{formatCurrency(selectedExam.application_fee)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Preferred Examination Center Selection */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5">
            4. Preferred Test Center Venue
          </h3>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Center Venue *</label>
            <select
              value={selectedCenterId}
              onChange={(e) => setSelectedCenterId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none bg-white"
            >
              {centers.map((c) => (
                <option key={c.center_id} value={c.center_id}>
                  {c.center_name} — {c.city}, {c.state} (Capacity: {c.total_capacity})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Final venue assignment and seating slot will be confirmed on the official Admit Card issued by the commission.
            </p>
          </div>
        </div>

        {/* Step 5: Declaration & Submission */}
        <div className="pt-2 border-t border-slate-200 space-y-3">
          <label className="flex items-start space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={declaration}
              onChange={(e) => setDeclaration(e.target.checked)}
              className="mt-0.5 rounded text-blue-900 focus:ring-blue-900"
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              I hereby certify that all information submitted in this application is authentic, accurate, and verifiable. I understand that duplicate applications or false declarations will lead to disqualification under public examination rules.
            </span>
          </label>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !declaration}
              className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Submitting Application...' : 'Confirm & Submit Application'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ApplyExam;


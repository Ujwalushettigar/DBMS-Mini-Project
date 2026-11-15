import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { examAPI, candidateAPI, applicationAPI, centerAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { FormField } from '../components/common/FormField';
import { PageHeader } from '../components/common/PageHeader';
import { FileText, CheckCircle2, Building, AlertCircle, ArrowLeft } from 'lucide-react';

export function ApplyExam() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const examIdParam = id || searchParams.get('exam_id');
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
            setSelectedExamId(eRes.data[0].examination_id || eRes.data[0].id);
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

  const selectedExam = exams.find((e) => (e.examination_id || e.id) === selectedExamId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!declaration) {
      setAlert({ type: 'warning', message: 'You must declare that all submitted information is authentic and accurate.' });
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

  if (loading) return <LoadingSpinner label="Preparing examination application dossier..." />;

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Official Examination Application Form"
        subtitle="Review your candidate dossier, select examination notice, and choose preferred test center"
        crumbs={[
          { label: 'Dashboard', to: '/candidate/dashboard' },
          { label: 'Examinations', to: '/candidate/examinations' },
          { label: 'Apply' }
        ]}
        actions={
          <Link to="/candidate/examinations" className="gov-btn gov-btn-outline text-xs">
            <ArrowLeft size={14} /> Back to Notices
          </Link>
        }
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="gov-card p-6 space-y-6 text-sm" noValidate>
        <p className="text-xs text-slate-500 border-b border-line pb-2">
          Fields marked * are mandatory. Please review each section thoroughly before submitting.
        </p>

        {/* Step 1: Candidate Verification */}
        <div className="space-y-3">
          <h2 className="gov-section-title !text-sm">1. Candidate Dossier Verification</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded border border-line text-xs">
            <div>
              <span className="text-slate-500 block uppercase font-medium">Full Legal Name</span>
              <span className="font-bold text-gov-900 mt-0.5 block">{candidate?.full_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-medium">Candidate No.</span>
              <span className="font-mono font-bold text-gov-800 mt-0.5 block">{candidate?.candidate_number}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-medium">Social Category</span>
              <span className="font-bold text-gov-900 mt-0.5 block">{candidate?.category}</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-medium">Contact Phone</span>
              <span className="font-bold text-gov-900 mt-0.5 block">{candidate?.phone_number}</span>
            </div>
          </div>
        </div>

        {/* Step 2: Academic Eligibility Verification */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="gov-section-title !text-sm !mb-0">2. Academic Eligibility Verification</h2>
            <Link to="/candidate/qualifications" className="gov-link text-xs font-semibold">
              Manage Qualifications
            </Link>
          </div>
          {(!candidate?.qualifications || candidate.qualifications.length === 0) ? (
            <div className="p-3 bg-amber-50 border border-saffron-500/40 text-amber-900 rounded text-xs">
              Warning: You have no recorded educational qualifications. Please add at least one qualification in your profile before applying.
            </div>
          ) : (
            <div className="space-y-2">
              {candidate.qualifications.map((q, idx) => (
                <div key={idx} className="p-3 rounded bg-slate-50 border border-line flex justify-between items-center text-xs">
                  <div>
                    <strong className="text-gov-800">{q.qualification_level}</strong> — {q.institution_name} ({q.board_or_university})
                  </div>
                  <div className="font-semibold text-gov-700">
                    {q.percentage}% (Year: {q.passing_year})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Examination Selection */}
        <div className="space-y-3">
          <h2 className="gov-section-title !text-sm">3. Examination Notice & Fee Schedule</h2>
          <FormField label="Target Recruitment Examination" htmlFor="exam_select" required>
            <select
              id="exam_select"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="gov-input font-medium"
            >
              {exams.map((e) => (
                <option key={e.examination_id || e.id} value={e.examination_id || e.id}>
                  {e.examination_code} - {e.examination_name} ({e.conducting_authority || 'Central Recruitment Commission'})
                </option>
              ))}
            </select>
          </FormField>

          {selectedExam && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gov-50 p-4 rounded border border-line text-xs">
              <div>
                <span className="text-slate-500 block uppercase font-medium">Total Vacancies</span>
                <span className="font-bold text-gov-900 mt-0.5 block">{selectedExam.total_vacancies?.toLocaleString() ?? '—'}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-medium">Exam Date</span>
                <span className="font-bold text-gov-900 mt-0.5 block">{formatDate(selectedExam.examination_date)}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-medium">Apply Deadline</span>
                <span className="font-bold text-gov-900 mt-0.5 block">{formatDate(selectedExam.application_end_date)}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase font-medium">Application Fee</span>
                <span className="font-bold text-india-green mt-0.5 block">{formatCurrency(selectedExam.application_fee)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Preferred Examination Center Selection */}
        <div className="space-y-3">
          <h2 className="gov-section-title !text-sm">4. Preferred Test Center Venue</h2>
          <FormField
            label="Select Center Venue"
            htmlFor="center_select"
            required
            hint="Final venue assignment and seating slot will be confirmed on the official Admit Card."
          >
            <select
              id="center_select"
              value={selectedCenterId}
              onChange={(e) => setSelectedCenterId(e.target.value)}
              className="gov-input"
            >
              {centers.map((c) => (
                <option key={c.center_id} value={c.center_id}>
                  {c.center_name} — {c.city}, {c.state} (Capacity: {c.total_capacity} seats)
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Step 5: Declaration & Submission */}
        <div className="pt-4 border-t border-line space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={declaration}
              onChange={(e) => setDeclaration(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-gov-700 focus:ring-saffron-500"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              I hereby solemnly declare that all statements made in this online application are true, complete, and correct to the best of my knowledge and belief. I understand that duplicate applications or false declarations will lead to summary cancellation of my candidature under public examination rules.
            </span>
          </label>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !declaration}
              className="gov-btn gov-btn-primary"
            >
              {submitting ? 'Submitting Application...' : 'Confirm & Submit Application'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ApplyExam;

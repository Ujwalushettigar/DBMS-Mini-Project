import React, { useState, useEffect } from 'react';
import { resultAPI, applicationAPI, examAPI } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { EmptyState } from '../components/common/EmptyState';
import { FormField } from '../components/common/FormField';
import { PageHeader } from '../components/common/PageHeader';
import { 
  Award, Plus, Search, Filter, CheckCircle2, 
  Share2, RefreshCw 
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

export function AdminResults() {
  const [results, setResults] = useState([]);
  const [applications, setApplications] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);

  // Modal State
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    application_id: '',
    marks_obtained: '',
    maximum_marks: '100',
    rank: '',
    result_status: 'pass',
    remarks: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resultsRes, appsRes, examsRes] = await Promise.all([
        resultAPI.getAll({ status: filterStatus || undefined }),
        applicationAPI.getAll({ status: 'accepted' }),
        examAPI.getAll()
      ]);
      setResults(resultsRes.data || []);
      setApplications(appsRes.data || []);
      setExaminations(examsRes.data || []);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to load examination results data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const handleOpenEntryModal = () => {
    setFormData({
      application_id: '',
      marks_obtained: '',
      maximum_marks: '100',
      rank: '',
      result_status: 'pass',
      remarks: ''
    });
    setIsEntryModalOpen(true);
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!formData.application_id) {
      setAlert({ type: 'error', message: 'Please select a candidate application.' });
      return;
    }

    try {
      setActionLoading(true);
      await resultAPI.save({
        ...formData,
        marks_obtained: parseFloat(formData.marks_obtained),
        maximum_marks: parseFloat(formData.maximum_marks),
        rank: formData.rank ? parseInt(formData.rank, 10) : null
      });
      setAlert({ type: 'success', message: 'Result and scorecard successfully recorded.' });
      setIsEntryModalOpen(false);
      fetchData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to record candidate result.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async (resultId) => {
    try {
      setActionLoading(true);
      await resultAPI.publish(resultId);
      setAlert({ type: 'success', message: 'Scorecard published! It is now accessible to the candidate.' });
      fetchData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to publish scorecard.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredResults = results.filter(res => {
    const term = searchTerm.toLowerCase();
    const candName = (res.candidate?.full_name || '').toLowerCase();
    const candNo = (res.candidate?.candidate_number || res.candidate?.candidate_code || '').toLowerCase();
    const appNo = (res.application?.application_number || '').toLowerCase();
    const examName = (res.examination?.examination_name || res.examination?.exam_title || '').toLowerCase();
    const examCode = (res.examination?.examination_code || res.examination?.exam_code || '').toLowerCase();

    return !searchTerm || candName.includes(term) || candNo.includes(term) || appNo.includes(term) || examName.includes(term) || examCode.includes(term);
  });

  const stats = {
    total: results.length,
    passed: results.filter(r => r.result_status === 'pass').length,
    failed: results.filter(r => r.result_status === 'fail').length,
    published: results.filter(r => r.is_published).length
  };

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Result Evaluation & Merit Lists"
        subtitle="Grade candidate answer sheets, calculate merit rankings, verify cutoff criteria, and publish official scorecards"
        crumbs={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Results' }]}
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fetchData}
              className="gov-btn gov-btn-outline text-xs"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleOpenEntryModal}
              className="gov-btn gov-btn-accent text-xs"
            >
              <Plus size={14} />
              <span>Enter Evaluation Score</span>
            </button>
          </div>
        }
      />

      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}

      {/* KPI Counters */}
      <section aria-label="Evaluation metrics" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="gov-card p-4 text-center border-l-4 border-gov-700">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Evaluated</p>
          <p className="text-2xl font-bold text-gov-900 mt-0.5">{stats.total}</p>
        </div>
        <div className="gov-card p-4 text-center border-l-4 border-india-green">
          <p className="text-[11px] font-semibold text-india-green uppercase tracking-wide">Qualified (Pass)</p>
          <p className="text-2xl font-bold text-india-green mt-0.5">{stats.passed}</p>
        </div>
        <div className="gov-card p-4 text-center border-l-4 border-red-500">
          <p className="text-[11px] font-semibold text-red-600 uppercase tracking-wide">Unqualified (Fail)</p>
          <p className="text-2xl font-bold text-red-600 mt-0.5">{stats.failed}</p>
        </div>
        <div className="gov-card p-4 text-center border-l-4 border-gov-500">
          <p className="text-[11px] font-semibold text-gov-600 uppercase tracking-wide">Scorecards Published</p>
          <p className="text-2xl font-bold text-gov-800 mt-0.5">{stats.published}</p>
        </div>
      </section>

      {/* Filter and Search */}
      <section className="gov-card p-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center text-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate, exam, app no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="gov-input !pl-9"
              aria-label="Search results"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={14} className="text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="gov-input !w-auto"
              aria-label="Filter by result status"
            >
              <option value="">All Statuses</option>
              <option value="pass">Pass</option>
              <option value="fail">Fail</option>
              <option value="withheld">Withheld</option>
            </select>
          </div>
        </div>
      </section>

      {/* Results Table */}
      <section className="gov-card">
        <div className="gov-card-header justify-between">
          <div className="flex items-center gap-2">
            <Award size={18} />
            <span>Evaluation & Merit Ranking Ledger</span>
          </div>
          <span className="text-xs text-slate-500 font-normal">
            Showing {filteredResults.length} of {results.length} scorecards
          </span>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading scorecards and evaluation records..." />
        ) : filteredResults.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Award}
              title="No Results Found"
              message="No candidate results match your filter. Click 'Enter Evaluation Score' above to grade an accepted applicant."
            />
          </div>
        ) : (
          <div className="gov-table-wrap !border-0 !rounded-none">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Examination</th>
                  <th>Marks Obtained</th>
                  <th>Percentage</th>
                  <th>Merit Rank</th>
                  <th>Result Verdict</th>
                  <th>Publication Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((res) => (
                  <tr key={res.result_id}>
                    <td>
                      <div className="font-semibold text-slate-900">{res.candidate?.full_name || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{res.candidate?.candidate_number || res.candidate?.candidate_code}</div>
                      <div className="text-[11px] text-slate-400 font-mono">App: {res.application?.application_number}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-gov-800">{res.examination?.examination_name || res.examination?.exam_title || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{res.examination?.examination_code || res.examination?.exam_code}</div>
                    </td>
                    <td className="whitespace-nowrap font-mono font-bold text-gov-900">
                      {res.marks_obtained} / {res.maximum_marks}
                    </td>
                    <td className="whitespace-nowrap font-mono font-semibold text-slate-700">
                      {res.percentage !== undefined ? `${Number(res.percentage).toFixed(2)}%` : 'N/A'}
                    </td>
                    <td className="whitespace-nowrap">
                      {res.rank ? (
                        <span className="font-mono font-bold text-gov-800 bg-gov-50 px-2 py-0.5 rounded border border-line">
                          #{res.rank}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unranked</span>
                      )}
                    </td>
                    <td>
                      <Badge>{res.result_status}</Badge>
                    </td>
                    <td>
                      {res.is_published ? (
                        <span className="inline-flex items-center gap-1 text-xs text-india-green bg-green-50 px-2 py-0.5 rounded font-semibold border border-green-200">
                          <CheckCircle2 size={13} />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-saffron-600 bg-orange-50 px-2 py-0.5 rounded font-medium border border-saffron-500/30">
                          <span>Draft / Hidden</span>
                        </span>
                      )}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {!res.is_published && (
                        <button
                          type="button"
                          onClick={() => handlePublish(res.result_id)}
                          disabled={actionLoading}
                          className="gov-btn gov-btn-accent !py-1 !px-2 text-xs"
                          title="Publish result to candidate portal"
                        >
                          <Share2 size={13} />
                          <span>Publish</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Enter Result Modal */}
      <Modal
        open={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        title="Enter Candidate Examination Evaluation"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveResult} className="space-y-4 text-xs" noValidate>
          <FormField
            label="Select Candidate Application"
            htmlFor="app_select"
            required
            hint="Displays accepted applications ready for score entry."
          >
            <select
              id="app_select"
              value={formData.application_id}
              onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
              className="gov-input font-medium"
              required
            >
              <option value="">-- Choose Candidate Application --</option>
              {applications.map(app => (
                <option key={app.application_id} value={app.application_id}>
                  {app.application_number} - {app.candidate?.full_name} ({app.examination?.examination_code || app.examination?.exam_code})
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Marks Obtained" htmlFor="marks_obt" required>
              <input
                id="marks_obt"
                type="number"
                step="0.01"
                min="0"
                max={formData.maximum_marks || 100}
                value={formData.marks_obtained}
                onChange={(e) => setFormData({ ...formData, marks_obtained: e.target.value })}
                placeholder="e.g. 84.50"
                className="gov-input font-mono"
                required
              />
            </FormField>

            <FormField label="Maximum Marks" htmlFor="max_marks" required>
              <input
                id="max_marks"
                type="number"
                step="1"
                min="1"
                value={formData.maximum_marks}
                onChange={(e) => setFormData({ ...formData, maximum_marks: e.target.value })}
                placeholder="100"
                className="gov-input font-mono"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Merit Rank (Optional)" htmlFor="merit_rank">
              <input
                id="merit_rank"
                type="number"
                min="1"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                placeholder="e.g. 1"
                className="gov-input font-mono"
              />
            </FormField>

            <FormField label="Result Verdict" htmlFor="res_verdict" required>
              <select
                id="res_verdict"
                value={formData.result_status}
                onChange={(e) => setFormData({ ...formData, result_status: e.target.value })}
                className="gov-input font-medium"
                required
              >
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
                <option value="withheld">Withheld</option>
              </select>
            </FormField>
          </div>

          <FormField label="Evaluation Remarks / Notes" htmlFor="eval_remarks">
            <textarea
              id="eval_remarks"
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Candidate qualified for document scrutiny / next stage."
              className="gov-input"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              onClick={() => setIsEntryModalOpen(false)}
              className="gov-btn gov-btn-outline text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="gov-btn gov-btn-primary text-xs"
            >
              {actionLoading ? 'Saving Score...' : 'Save Evaluation Score'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminResults;

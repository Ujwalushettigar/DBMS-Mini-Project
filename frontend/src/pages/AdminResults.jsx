import React, { useState, useEffect } from 'react';
import { resultAPI, applicationAPI, examAPI } from '../services/api';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';
import { 
  Trophy, Plus, Search, Filter, CheckCircle2, XCircle, 
  Share2, Eye, Award, FileSpreadsheet, RefreshCw, BarChart2 
} from 'lucide-react';
import { formatDate, getStatusVariant } from '../utils/helpers';

export default function AdminResults() {
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
    const matchesSearch = 
      (res.candidate?.full_name && res.candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (res.candidate?.candidate_code && res.candidate.candidate_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (res.application?.application_number && res.application.application_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (res.examination?.exam_title && res.examination.exam_title.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const stats = {
    total: results.length,
    passed: results.filter(r => r.result_status === 'pass').length,
    failed: results.filter(r => r.result_status === 'fail').length,
    published: results.filter(r => r.is_published).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Result Evaluation & Merit Lists</h1>
          <p className="text-sm text-slate-600">Enter marks, generate merit rankings, verify cutoff criteria, and publish official candidate scorecards.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenEntryModal}
            className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-md shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Enter Evaluation Score</span>
          </button>
        </div>
      </div>

      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Evaluated</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-emerald-200 shadow-sm text-center">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Passed Candidates</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.passed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-rose-200 shadow-sm text-center">
          <p className="text-xs font-semibold text-rose-600 uppercase">Failed Candidates</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{stats.failed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm text-center">
          <p className="text-xs font-semibold text-blue-600 uppercase">Scorecards Published</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">{stats.published}</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate, exam, app no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
          >
            <option value="">All Statuses</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
            <option value="withheld">Withheld</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-lg border border-slate-200">
          <LoadingSpinner size="lg" text="Loading scorecards and evaluation records..." />
        </div>
      ) : filteredResults.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No Results Found"
          description="No candidate results match your filter. Click 'Enter Evaluation Score' above to grade an accepted applicant."
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Examination</th>
                  <th className="py-3 px-4">Marks Obtained</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Merit Rank</th>
                  <th className="py-3 px-4">Result Status</th>
                  <th className="py-3 px-4">Publication State</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((res) => (
                  <tr key={res.result_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{res.candidate?.full_name || 'N/A'}</div>
                      <div className="text-xs text-slate-500 font-mono">{res.candidate?.candidate_code}</div>
                      <div className="text-xs text-slate-400 font-mono">App: {res.application?.application_number}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{res.examination?.exam_title || 'N/A'}</div>
                      <div className="text-xs text-slate-500 font-mono">{res.examination?.exam_code}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {res.marks_obtained} / {res.maximum_marks}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {res.percentage !== undefined ? `${Number(res.percentage).toFixed(2)}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      {res.rank ? (
                        <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          #{res.rank}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Unranked</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusVariant(res.result_status)}>
                        {res.result_status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {res.is_published ? (
                        <span className="inline-flex items-center space-x-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200">
                          <span>Draft / Hidden</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      {!res.is_published && (
                        <button
                          onClick={() => handlePublish(res.result_id)}
                          disabled={actionLoading}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-300 transition-colors"
                          title="Publish result to candidate portal"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Publish</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {filteredResults.length} of {results.length} scorecards</span>
            <span>Relational Table: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">results</code></span>
          </div>
        </div>
      )}

      {/* Enter Result Modal */}
      <Modal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        title="Enter Candidate Examination Evaluation"
        size="md"
      >
        <form onSubmit={handleSaveResult} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Select Candidate Application *
            </label>
            <select
              value={formData.application_id}
              onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
              className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              required
            >
              <option value="">-- Choose Candidate Application --</option>
              {applications.map(app => (
                <option key={app.application_id} value={app.application_id}>
                  {app.application_number} - {app.candidate?.full_name} ({app.examination?.exam_code})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">Displays accepted applications ready for score entry.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Marks Obtained *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={formData.maximum_marks || 100}
                value={formData.marks_obtained}
                onChange={(e) => setFormData({ ...formData, marks_obtained: e.target.value })}
                placeholder="e.g. 84.50"
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Maximum Marks *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={formData.maximum_marks}
                onChange={(e) => setFormData({ ...formData, maximum_marks: e.target.value })}
                placeholder="100"
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Merit Rank (Optional)
              </label>
              <input
                type="number"
                min="1"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                placeholder="e.g. 1"
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Result Status *
              </label>
              <select
                value={formData.result_status}
                onChange={(e) => setFormData({ ...formData, result_status: e.target.value })}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white font-medium"
                required
              >
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
                <option value="withheld">Withheld</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Remarks / Evaluation Notes
            </label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Candidate qualified for document verification / interview round."
              className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEntryModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 text-sm font-medium disabled:opacity-50 inline-flex items-center space-x-2"
            >
              {actionLoading && <LoadingSpinner size="sm" color="white" />}
              <span>Save Evaluation Score</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


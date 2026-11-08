import React, { useState, useEffect } from 'react';
import { applicationAPI, examAPI, centerAPI, admitCardAPI } from '../services/api';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';
import { 
  FileText, Search, Filter, CheckCircle2, XCircle, Clock, 
  MapPin, Eye, Edit3, Award, Download, RefreshCw, AlertCircle 
} from 'lucide-react';
import { formatDate, getStatusVariant } from '../utils/helpers';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterExam, setFilterExam] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);

  // Status Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusForm, setStatusForm] = useState({
    application_status: 'under_review',
    center_id: '',
    remarks: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Admit Card Generator Quick Action
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [admitForm, setAdmitForm] = useState({
    application_id: '',
    reporting_time: '08:30 AM',
    examination_instructions: 'Bring printed admit card and original Govt photo ID.'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, examsRes, centersRes] = await Promise.all([
        applicationAPI.getAll({ 
          examination_id: filterExam || undefined, 
          status: filterStatus || undefined 
        }),
        examAPI.getAll(),
        centerAPI.getAll()
      ]);
      setApplications(appsRes.data || []);
      setExaminations(examsRes.data || []);
      setCenters(centersRes.data || []);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to fetch application records.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterExam, filterStatus]);

  const handleOpenStatusModal = (app) => {
    setSelectedApp(app);
    setStatusForm({
      application_status: app.application_status || 'submitted',
      center_id: app.center_id || '',
      remarks: app.remarks || ''
    });
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setActionLoading(true);
      await applicationAPI.updateStatus(selectedApp.application_id, statusForm);
      setAlert({ 
        type: 'success', 
        message: `Application ${selectedApp.application_number} updated to "${statusForm.application_status}".` 
      });
      setIsStatusModalOpen(false);
      fetchData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update application status.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenAdmitModal = (app) => {
    setSelectedApp(app);
    setAdmitForm({
      application_id: app.application_id,
      reporting_time: '08:30 AM',
      examination_instructions: '1. Report 60 minutes before start time. 2. Bring original Photo ID proof and printed hall ticket. 3. Electronic gadgets strictly prohibited.'
    });
    setIsAdmitModalOpen(true);
  };

  const handleGenerateAdmitCard = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await admitCardAPI.generate(admitForm);
      setAlert({ 
        type: 'success', 
        message: `Admit card generated successfully with Roll No: ${res.data.roll_number}` 
      });
      setIsAdmitModalOpen(false);
      fetchData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to generate admit card.' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      (app.application_number && app.application_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.candidate?.full_name && app.candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (app.examination?.exam_title && app.examination.exam_title.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const stats = {
    total: applications.length,
    submitted: applications.filter(a => a.application_status === 'submitted').length,
    underReview: applications.filter(a => a.application_status === 'under_review').length,
    accepted: applications.filter(a => a.application_status === 'accepted').length,
    rejected: applications.filter(a => a.application_status === 'rejected').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Application Scrutiny & Management</h1>
          <p className="text-sm text-slate-600">Review candidate submissions, allocate test centers, update scrutiny status, and issue admit cards.</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh List</span>
        </button>
      </div>

      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-lg border border-slate-200 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
          <p className="text-xs font-semibold text-blue-600 uppercase">Submitted</p>
          <p className="text-2xl font-bold text-blue-700">{stats.submitted}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-amber-200 text-center">
          <p className="text-xs font-semibold text-amber-600 uppercase">Under Review</p>
          <p className="text-2xl font-bold text-amber-700">{stats.underReview}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-emerald-200 text-center">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Accepted</p>
          <p className="text-2xl font-bold text-emerald-700">{stats.accepted}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-rose-200 text-center">
          <p className="text-xs font-semibold text-rose-600 uppercase">Rejected</p>
          <p className="text-2xl font-bold text-rose-700">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate, app no, exam..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
              className="text-sm border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
            >
              <option value="">All Examinations</option>
              {examinations.map(exam => (
                <option key={exam.examination_id} value={exam.examination_id}>
                  {exam.exam_code} - {exam.exam_title.substring(0, 30)}...
                </option>
              ))}
            </select>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-lg border border-slate-200">
          <LoadingSpinner size="lg" text="Loading applications database..." />
        </div>
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Applications Found"
          description="No application records match your current search query or filter criteria."
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Application Details</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Examination</th>
                  <th className="py-3 px-4">Allocated Center</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted On</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-blue-900">{app.application_number}</div>
                      <div className="text-xs text-slate-400">ID: {app.application_id.substring(0, 8)}...</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{app.candidate?.full_name || 'N/A'}</div>
                      <div className="text-xs text-slate-500 font-mono">{app.candidate?.candidate_code}</div>
                      <div className="text-xs text-slate-500">{app.candidate?.category} | {app.candidate?.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{app.examination?.exam_title || 'N/A'}</div>
                      <div className="text-xs text-slate-500 font-mono">{app.examination?.exam_code}</div>
                    </td>
                    <td className="py-3 px-4">
                      {app.center ? (
                        <div>
                          <div className="font-medium text-slate-800">{app.center.center_name}</div>
                          <div className="text-xs text-slate-500">{app.center.city}, {app.center.state}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Not Allocated
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getStatusVariant(app.application_status)}>
                        {app.application_status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {app.remarks && (
                        <div className="text-xs text-slate-500 italic mt-1 max-w-xs truncate" title={app.remarks}>
                          Note: {app.remarks}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {formatDate(app.submission_date)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenStatusModal(app)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                        title="Update Scrutiny Status"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Scrutinize</span>
                      </button>

                      {app.application_status === 'accepted' && (
                        <button
                          onClick={() => handleOpenAdmitModal(app)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-300 transition-colors"
                          title="Generate Admit Card"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Issue Admit Card</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {filteredApps.length} of {applications.length} applications</span>
            <span>Relational Table: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">applications</code></span>
          </div>
        </div>
      )}

      {/* Scrutiny & Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Application Scrutiny & Verification"
      >
        {selectedApp && (
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1 text-xs">
              <div><span className="font-semibold text-slate-700">Application Number:</span> <span className="font-mono text-blue-900">{selectedApp.application_number}</span></div>
              <div><span className="font-semibold text-slate-700">Candidate:</span> {selectedApp.candidate?.full_name} ({selectedApp.candidate?.candidate_code})</div>
              <div><span className="font-semibold text-slate-700">Applied Exam:</span> {selectedApp.examination?.exam_title} ({selectedApp.examination?.exam_code})</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Scrutiny Decision (Status) *
              </label>
              <select
                value={statusForm.application_status}
                onChange={(e) => setStatusForm({ ...statusForm, application_status: e.target.value })}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white font-medium"
                required
              >
                <option value="submitted">Submitted (Initial)</option>
                <option value="under_review">Under Review (Scrutiny in progress)</option>
                <option value="accepted">Accepted (Eligible for Exam & Admit Card)</option>
                <option value="rejected">Rejected (Does not meet eligibility)</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Allocate Examination Center
              </label>
              <select
                value={statusForm.center_id}
                onChange={(e) => setStatusForm({ ...statusForm, center_id: e.target.value })}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
              >
                <option value="">-- Leave Unallocated / Select Later --</option>
                {centers.map(center => (
                  <option key={center.center_id} value={center.center_id}>
                    {center.center_name} ({center.city}, {center.state}) - Capacity: {center.total_capacity}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Required before generating the Admit Card / Hall Ticket.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Scrutiny Officer Remarks
              </label>
              <textarea
                rows={3}
                value={statusForm.remarks}
                onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                placeholder="Reason for acceptance, rejection, or document verification observations..."
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
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
                <span>Save Scrutiny Decision</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Admit Card Issuance Modal */}
      <Modal
        isOpen={isAdmitModalOpen}
        onClose={() => setIsAdmitModalOpen(false)}
        title="Issue Official Hall Ticket / Admit Card"
      >
        {selectedApp && (
          <form onSubmit={handleGenerateAdmitCard} className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded text-xs space-y-1">
              <div className="font-semibold text-emerald-900">Application Approved for Admit Card Generation</div>
              <div>Candidate: <span className="font-medium text-slate-900">{selectedApp.candidate?.full_name}</span></div>
              <div>Exam: <span className="font-medium text-slate-900">{selectedApp.examination?.exam_title}</span></div>
              <div>Allocated Center: <span className="font-medium text-slate-900">{selectedApp.center ? selectedApp.center.center_name : 'No Center Assigned (will use default)'}</span></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Candidate Reporting Time *
              </label>
              <input
                type="text"
                value={admitForm.reporting_time}
                onChange={(e) => setAdmitForm({ ...admitForm, reporting_time: e.target.value })}
                placeholder="e.g. 08:30 AM"
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Examination Day Instructions *
              </label>
              <textarea
                rows={4}
                value={admitForm.examination_instructions}
                onChange={(e) => setAdmitForm({ ...admitForm, examination_instructions: e.target.value })}
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAdmitModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 text-sm font-medium disabled:opacity-50 inline-flex items-center space-x-2"
              >
                {actionLoading && <LoadingSpinner size="sm" color="white" />}
                <span>Generate & Issue Hall Ticket</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}


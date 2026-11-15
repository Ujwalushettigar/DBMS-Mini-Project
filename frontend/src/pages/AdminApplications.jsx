import React, { useState, useEffect } from 'react';
import { applicationAPI, examAPI, centerAPI, admitCardAPI } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { EmptyState } from '../components/common/EmptyState';
import { FormField } from '../components/common/FormField';
import { PageHeader } from '../components/common/PageHeader';
import { 
  FileText, Search, Filter, CheckCircle2, XCircle, Clock, 
  Eye, Edit3, Award, RefreshCw 
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

export function AdminApplications() {
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
    const term = searchTerm.toLowerCase();
    const appNo = (app.application_number || '').toLowerCase();
    const candName = (app.candidate?.full_name || '').toLowerCase();
    const examName = (app.examination?.examination_name || app.examination?.exam_title || '').toLowerCase();
    return !searchTerm || appNo.includes(term) || candName.includes(term) || examName.includes(term);
  });

  const stats = {
    total: applications.length,
    submitted: applications.filter(a => a.application_status === 'submitted').length,
    underReview: applications.filter(a => a.application_status === 'under_review').length,
    accepted: applications.filter(a => a.application_status === 'accepted').length,
    rejected: applications.filter(a => a.application_status === 'rejected').length
  };

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Application Scrutiny & Management"
        subtitle="Review candidate submissions, allocate test centers, update scrutiny status, and issue admit cards"
        crumbs={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Applications' }]}
        actions={
          <button
            type="button"
            onClick={fetchData}
            className="gov-btn gov-btn-outline text-xs"
          >
            <RefreshCw size={14} />
            <span>Refresh List</span>
          </button>
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
      <section aria-label="Application status metrics" className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="gov-card p-3 text-center border-l-4 border-gov-700">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total Filed</p>
          <p className="text-2xl font-bold text-gov-900 mt-0.5">{stats.total}</p>
        </div>
        <div className="gov-card p-3 text-center border-l-4 border-gov-500">
          <p className="text-[11px] font-semibold text-gov-600 uppercase tracking-wide">Submitted</p>
          <p className="text-2xl font-bold text-gov-700 mt-0.5">{stats.submitted}</p>
        </div>
        <div className="gov-card p-3 text-center border-l-4 border-saffron-500">
          <p className="text-[11px] font-semibold text-saffron-600 uppercase tracking-wide">Under Review</p>
          <p className="text-2xl font-bold text-saffron-600 mt-0.5">{stats.underReview}</p>
        </div>
        <div className="gov-card p-3 text-center border-l-4 border-india-green">
          <p className="text-[11px] font-semibold text-india-green uppercase tracking-wide">Accepted</p>
          <p className="text-2xl font-bold text-india-green mt-0.5">{stats.accepted}</p>
        </div>
        <div className="gov-card p-3 text-center border-l-4 border-red-500">
          <p className="text-[11px] font-semibold text-red-600 uppercase tracking-wide">Rejected</p>
          <p className="text-2xl font-bold text-red-600 mt-0.5">{stats.rejected}</p>
        </div>
      </section>

      {/* Filters and Search Bar */}
      <section className="gov-card p-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center text-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate, app no, exam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="gov-input !pl-9"
              aria-label="Search applications"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
              className="gov-input !w-auto"
              aria-label="Filter by examination"
            >
              <option value="">All Examinations</option>
              {examinations.map(exam => {
                const name = exam.examination_name || exam.exam_title || '';
                const code = exam.examination_code || exam.exam_code || '';
                return (
                  <option key={exam.examination_id || exam.id} value={exam.examination_id || exam.id}>
                    {code} - {name.substring(0, 30)}...
                  </option>
                );
              })}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="gov-input !w-auto"
              aria-label="Filter by status"
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
      </section>

      {/* Applications Table */}
      <section className="gov-card">
        <div className="gov-card-header justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} />
            <span>Applications Scrutiny Ledger</span>
          </div>
          <span className="text-xs text-slate-500 font-normal">
            Showing {filteredApps.length} of {applications.length} applications
          </span>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading applications database..." />
        ) : filteredApps.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={FileText}
              title="No Applications Found"
              message="No application records match your current search query or filter criteria."
            />
          </div>
        ) : (
          <div className="gov-table-wrap !border-0 !rounded-none">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Application Details</th>
                  <th>Candidate</th>
                  <th>Examination</th>
                  <th>Allocated Center</th>
                  <th>Status</th>
                  <th>Submitted On</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app.application_id}>
                    <td className="whitespace-nowrap">
                      <div className="font-mono font-bold text-gov-900">{app.application_number}</div>
                      <div className="text-[11px] text-slate-400 font-mono">ID: {app.application_id.substring(0, 8)}...</div>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-900">{app.candidate?.full_name || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{app.candidate?.candidate_number || app.candidate?.candidate_code}</div>
                      <div className="text-[11px] text-slate-500">{app.candidate?.category} | {app.candidate?.phone_number || app.candidate?.phone}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-gov-800">{app.examination?.examination_name || app.examination?.exam_title || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{app.examination?.examination_code || app.examination?.exam_code}</div>
                    </td>
                    <td>
                      {(app.exam_center || app.center) ? (
                        <div>
                          <div className="font-medium text-slate-800">{(app.exam_center || app.center).center_name}</div>
                          <div className="text-[11px] text-slate-500">{(app.exam_center || app.center).city}, {(app.exam_center || app.center).state}</div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-saffron-600 bg-orange-50 px-2 py-0.5 rounded border border-saffron-500/30">
                          Not Allocated
                        </span>
                      )}
                    </td>
                    <td>
                      <Badge>{app.application_status}</Badge>
                      {app.remarks && (
                        <div className="text-[11px] text-slate-500 italic mt-0.5 max-w-xs truncate" title={app.remarks}>
                          Note: {app.remarks}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-slate-600 text-xs">
                      {formatDate(app.applied_at || app.submission_date)}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(app)}
                          className="gov-btn gov-btn-outline !py-1 !px-2 text-xs"
                          title="Update Scrutiny Status"
                        >
                          <Edit3 size={13} />
                          <span>Scrutinize</span>
                        </button>

                        {app.application_status === 'accepted' && (
                          <button
                            type="button"
                            onClick={() => handleOpenAdmitModal(app)}
                            className="gov-btn gov-btn-accent !py-1 !px-2 text-xs"
                            title="Generate Admit Card"
                          >
                            <Award size={13} />
                            <span>Issue Admit Card</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Scrutiny & Status Modal */}
      <Modal
        open={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Application Scrutiny & Verification"
      >
        {selectedApp && (
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs" noValidate>
            <div className="bg-slate-50 p-3 rounded border border-line space-y-1">
              <div><span className="font-semibold text-slate-700">Application Number:</span> <span className="font-mono text-gov-900 font-bold">{selectedApp.application_number}</span></div>
              <div><span className="font-semibold text-slate-700">Candidate:</span> {selectedApp.candidate?.full_name} ({selectedApp.candidate?.candidate_number || selectedApp.candidate?.candidate_code})</div>
              <div><span className="font-semibold text-slate-700">Applied Notice:</span> {selectedApp.examination?.examination_name || selectedApp.examination?.exam_title}</div>
            </div>

            <FormField label="Scrutiny Decision (Status)" htmlFor="scrutiny_status" required>
              <select
                id="scrutiny_status"
                value={statusForm.application_status}
                onChange={(e) => setStatusForm({ ...statusForm, application_status: e.target.value })}
                className="gov-input font-medium"
                required
              >
                <option value="submitted">Submitted (Initial)</option>
                <option value="under_review">Under Review (Scrutiny in progress)</option>
                <option value="accepted">Accepted (Eligible for Exam & Admit Card)</option>
                <option value="rejected">Rejected (Does not meet eligibility)</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </FormField>

            <FormField
              label="Allocate Examination Center"
              htmlFor="alloc_center"
              hint="Required before generating the Admit Card / Hall Ticket."
            >
              <select
                id="alloc_center"
                value={statusForm.center_id}
                onChange={(e) => setStatusForm({ ...statusForm, center_id: e.target.value })}
                className="gov-input"
              >
                <option value="">-- Leave Unallocated / Select Later --</option>
                {centers.map(center => (
                  <option key={center.center_id} value={center.center_id}>
                    {center.center_name} ({center.city}, {center.state}) - Capacity: {center.total_capacity}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Scrutiny Officer Remarks" htmlFor="scrutiny_remarks">
              <textarea
                id="scrutiny_remarks"
                rows={3}
                value={statusForm.remarks}
                onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                placeholder="Reason for acceptance, rejection, or document verification observations..."
                className="gov-input"
              />
            </FormField>

            <div className="flex justify-end gap-2 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="gov-btn gov-btn-outline text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="gov-btn gov-btn-primary text-xs"
              >
                {actionLoading ? 'Saving Decision...' : 'Save Scrutiny Decision'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Admit Card Issuance Modal */}
      <Modal
        open={isAdmitModalOpen}
        onClose={() => setIsAdmitModalOpen(false)}
        title="Issue Official Hall Ticket / Admit Card"
      >
        {selectedApp && (
          <form onSubmit={handleGenerateAdmitCard} className="space-y-4 text-xs" noValidate>
            <div className="bg-green-50 border border-green-200 p-3 rounded space-y-1 text-green-900">
              <div className="font-bold">Application Approved for Admit Card Generation</div>
              <div>Candidate: <span className="font-semibold text-slate-900">{selectedApp.candidate?.full_name}</span></div>
              <div>Notice: <span className="font-semibold text-slate-900">{selectedApp.examination?.examination_name || selectedApp.examination?.exam_title}</span></div>
              <div>Center: <span className="font-semibold text-slate-900">{(selectedApp.exam_center || selectedApp.center) ? (selectedApp.exam_center || selectedApp.center).center_name : 'No Center Assigned (will use default)'}</span></div>
            </div>

            <FormField label="Candidate Reporting Time" htmlFor="rep_time" required>
              <input
                id="rep_time"
                type="text"
                value={admitForm.reporting_time}
                onChange={(e) => setAdmitForm({ ...admitForm, reporting_time: e.target.value })}
                placeholder="e.g. 08:30 AM"
                className="gov-input"
                required
              />
            </FormField>

            <FormField label="Examination Day Instructions" htmlFor="exam_instr" required>
              <textarea
                id="exam_instr"
                rows={4}
                value={admitForm.examination_instructions}
                onChange={(e) => setAdmitForm({ ...admitForm, examination_instructions: e.target.value })}
                className="gov-input"
                required
              />
            </FormField>

            <div className="flex justify-end gap-2 pt-3 border-t border-line">
              <button
                type="button"
                onClick={() => setIsAdmitModalOpen(false)}
                className="gov-btn gov-btn-outline text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="gov-btn gov-btn-accent text-xs"
              >
                {actionLoading ? 'Issuing...' : 'Generate & Issue Hall Ticket'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default AdminApplications;

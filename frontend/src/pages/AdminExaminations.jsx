import React, { useEffect, useState } from 'react';
import { examAPI } from '../services/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Alert } from '../components/common/Alert';
import { FormField } from '../components/common/FormField';
import { PageHeader } from '../components/common/PageHeader';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react';

export function AdminExaminations() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState(null);

  const [form, setForm] = useState({
    examination_code: '',
    examination_name: '',
    conducting_authority: '',
    description: '',
    eligibility_criteria: '',
    application_start_date: '',
    application_end_date: '',
    examination_date: '',
    application_fee: 100,
    total_vacancies: 1000,
    examination_status: 'draft'
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await examAPI.getAll();
      if (res.success && res.data) {
        setExams(res.data);
      }
    } catch (err) {
      console.warn('Error fetching exams:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const openAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm({
      examination_code: '',
      examination_name: '',
      conducting_authority: 'Staff Selection Commission',
      description: '',
      eligibility_criteria: 'Graduate from any recognized university.',
      application_start_date: new Date().toISOString().split('T')[0],
      application_end_date: '',
      examination_date: '',
      application_fee: 100,
      total_vacancies: 500,
      examination_status: 'draft'
    });
    setModalOpen(true);
  };

  const openEdit = (e) => {
    setIsEditing(true);
    setEditingId(e.examination_id);
    setForm({
      examination_code: e.examination_code,
      examination_name: e.examination_name,
      conducting_authority: e.conducting_authority,
      description: e.description || '',
      eligibility_criteria: e.eligibility_criteria || '',
      application_start_date: e.application_start_date ? e.application_start_date.split('T')[0] : '',
      application_end_date: e.application_end_date ? e.application_end_date.split('T')[0] : '',
      examination_date: e.examination_date ? e.examination_date.split('T')[0] : '',
      application_fee: e.application_fee,
      total_vacancies: e.total_vacancies,
      examination_status: e.examination_status
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (new Date(form.application_end_date) < new Date(form.application_start_date)) {
      setAlert({ type: 'error', message: 'Application closing date must be after application start date.' });
      return;
    }
    if (new Date(form.examination_date) < new Date(form.application_end_date)) {
      setAlert({ type: 'error', message: 'Examination date must be scheduled on or after application deadline.' });
      return;
    }

    try {
      if (isEditing) {
        await examAPI.update(editingId, form);
        setAlert({ type: 'success', message: 'Examination notification updated.' });
      } else {
        await examAPI.create(form);
        setAlert({ type: 'success', message: 'Examination notification created.' });
      }
      setModalOpen(false);
      fetchExams();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Operation failed.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this examination? This will fail if candidate applications exist.')) return;
    try {
      await examAPI.delete(id);
      setAlert({ type: 'success', message: 'Examination record deleted.' });
      fetchExams();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Cannot delete examination.' });
    }
  };

  const setStatus = async (id, status) => {
    try {
      await examAPI.update(id, { examination_status: status });
      setAlert({ type: 'success', message: `Examination status changed to "${status}".` });
      fetchExams();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to update status.' });
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Examination Notice Management"
        subtitle="Create, configure, publish, close, and manage competitive public recruitment notifications"
        crumbs={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Examinations' }]}
        actions={
          <button
            type="button"
            onClick={openAdd}
            className="gov-btn gov-btn-accent text-xs"
          >
            <Plus size={16} />
            <span>New Examination</span>
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

      {/* Examinations Table */}
      <section className="gov-card">
        <div className="gov-card-header justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} />
            <span>Official Examination Notices Register</span>
          </div>
          <span className="text-xs text-slate-500 font-normal">
            Total notices: <strong>{exams.length}</strong>
          </span>
        </div>

        {loading ? (
          <LoadingSpinner label="Querying examination notices..." />
        ) : exams.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No examinations created yet"
              message="Create your first government recruitment examination notification to open candidate applications."
              icon={Layers}
              action={
                <button
                  type="button"
                  onClick={openAdd}
                  className="gov-btn gov-btn-primary text-xs"
                >
                  <Plus size={14} /> Create Examination Notice
                </button>
              }
            />
          </div>
        ) : (
          <div className="gov-table-wrap !border-0 !rounded-none">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Notice Code</th>
                  <th>Examination Title</th>
                  <th>Conducting Authority</th>
                  <th>Vacancies</th>
                  <th>Key Dates (Deadline / Exam)</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((e) => (
                  <tr key={e.examination_id}>
                    <td className="whitespace-nowrap font-mono text-xs font-bold text-gov-900">
                      {e.examination_code}
                    </td>
                    <td className="font-semibold text-slate-900">
                      <div>{e.examination_name}</div>
                      <div className="text-[11px] text-slate-500 font-normal">Fee: {formatCurrency(e.application_fee)}</div>
                    </td>
                    <td className="text-slate-600 text-xs">
                      {e.conducting_authority}
                    </td>
                    <td className="font-bold text-gov-800 text-xs">
                      {Number(e.total_vacancies).toLocaleString()}
                    </td>
                    <td className="text-slate-600 text-xs whitespace-nowrap">
                      <div>Apply by: <strong>{formatDate(e.application_end_date)}</strong></div>
                      <div>Exam: <strong>{formatDate(e.examination_date)}</strong></div>
                    </td>
                    <td>
                      <Badge>{e.examination_status}</Badge>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {/* State Transitions */}
                        {e.examination_status === 'draft' && (
                          <button
                            type="button"
                            onClick={() => setStatus(e.examination_id, 'published')}
                            className="gov-btn gov-btn-accent !py-1 !px-2 text-xs"
                          >
                            Publish
                          </button>
                        )}
                        {e.examination_status === 'published' && (
                          <button
                            type="button"
                            onClick={() => setStatus(e.examination_id, 'closed')}
                            className="gov-btn gov-btn-outline !py-1 !px-2 text-xs"
                          >
                            Close
                          </button>
                        )}
                        {e.examination_status === 'closed' && (
                          <button
                            type="button"
                            onClick={() => setStatus(e.examination_id, 'completed')}
                            className="gov-btn gov-btn-primary !py-1 !px-2 text-xs"
                          >
                            Complete
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openEdit(e)}
                          className="gov-btn gov-btn-outline !p-1.5 text-xs"
                          title="Edit Examination"
                          aria-label={`Edit ${e.examination_code}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(e.examination_id)}
                          className="gov-btn gov-btn-danger !p-1.5 text-xs"
                          title="Delete Examination"
                          aria-label={`Delete ${e.examination_code}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal: Create/Edit Examination */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Examination Notification' : 'Create Examination Notification'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs" noValidate>
          <p className="text-xs text-slate-500 border-b border-line pb-2">Fields marked * are mandatory</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Examination Code" htmlFor="exam_code" required hint="e.g. CRC-CSE-2026 or SSC-CGL-2026">
              <input
                id="exam_code"
                type="text"
                required
                value={form.examination_code}
                onChange={(e) => setForm({ ...form, examination_code: e.target.value })}
                placeholder="CRC-CSE-2026"
                className="gov-input uppercase font-mono"
              />
            </FormField>

            <FormField label="Conducting Authority" htmlFor="cond_auth" required>
              <input
                id="cond_auth"
                type="text"
                required
                value={form.conducting_authority}
                onChange={(e) => setForm({ ...form, conducting_authority: e.target.value })}
                placeholder="e.g. Central Recruitment Commission"
                className="gov-input"
              />
            </FormField>
          </div>

          <FormField label="Official Examination Name" htmlFor="exam_name" required>
            <input
              id="exam_name"
              type="text"
              required
              value={form.examination_name}
              onChange={(e) => setForm({ ...form, examination_name: e.target.value })}
              placeholder="e.g. Combined Civil Services Examination 2026"
              className="gov-input"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Application Start Date" htmlFor="app_start" required>
              <input
                id="app_start"
                type="date"
                required
                value={form.application_start_date}
                onChange={(e) => setForm({ ...form, application_start_date: e.target.value })}
                className="gov-input"
              />
            </FormField>

            <FormField label="Application Closing Date" htmlFor="app_end" required>
              <input
                id="app_end"
                type="date"
                required
                value={form.application_end_date}
                onChange={(e) => setForm({ ...form, application_end_date: e.target.value })}
                className="gov-input"
              />
            </FormField>

            <FormField label="Scheduled Exam Date" htmlFor="exam_date" required>
              <input
                id="exam_date"
                type="date"
                required
                value={form.examination_date}
                onChange={(e) => setForm({ ...form, examination_date: e.target.value })}
                className="gov-input"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Total Vacancies" htmlFor="tot_vac" required>
              <input
                id="tot_vac"
                type="number"
                required
                min="0"
                value={form.total_vacancies}
                onChange={(e) => setForm({ ...form, total_vacancies: e.target.value })}
                className="gov-input"
              />
            </FormField>

            <FormField label="Application Fee (INR)" htmlFor="fee" required>
              <input
                id="fee"
                type="number"
                step="0.01"
                min="0"
                required
                value={form.application_fee}
                onChange={(e) => setForm({ ...form, application_fee: e.target.value })}
                className="gov-input"
              />
            </FormField>

            <FormField label="Lifecycle Status" htmlFor="lifecycle_status" required>
              <select
                id="lifecycle_status"
                value={form.examination_status}
                onChange={(e) => setForm({ ...form, examination_status: e.target.value })}
                className="gov-input font-medium"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
                <option value="completed">Completed</option>
              </select>
            </FormField>
          </div>

          <FormField label="Prescribed Eligibility Criteria" htmlFor="eligibility">
            <textarea
              id="eligibility"
              rows={2}
              value={form.eligibility_criteria}
              onChange={(e) => setForm({ ...form, eligibility_criteria: e.target.value })}
              placeholder="e.g. Bachelor Degree from any recognized university. Age between 18 and 32 years."
              className="gov-input"
            />
          </FormField>

          <FormField label="Scope & Description" htmlFor="description">
            <textarea
              id="description"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Recruitment notice scope, post details, syllabus outline..."
              className="gov-input"
            />
          </FormField>

          <div className="pt-3 border-t border-line flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="gov-btn gov-btn-outline text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gov-btn gov-btn-primary text-xs"
            >
              {isEditing ? 'Save Changes' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminExaminations;

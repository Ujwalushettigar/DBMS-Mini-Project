import React, { useEffect, useState } from 'react';
import { examAPI } from '../services/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Alert } from '../components/common/Alert';
import { Layers, Plus, Edit2, Trash2, CheckCircle2, XCircle, Eye } from 'lucide-react';

export const AdminExaminations = () => {
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
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Examination Notification Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, publish, close, and maintain competitive public examination advertisements and vacancy quotas.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Examination</span>
        </button>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {loading ? (
        <LoadingSpinner message="Querying examination notices..." />
      ) : exams.length === 0 ? (
        <EmptyState
          title="No examinations created yet"
          description="Create your first government examination notification to open online candidate applications."
          icon={Layers}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Examination Name</th>
                  <th className="px-6 py-3">Authority</th>
                  <th className="px-6 py-3">Vacancies</th>
                  <th className="px-6 py-3">Dates (Apply / Exam)</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {exams.map((e) => (
                  <tr key={e.examination_id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 font-mono font-bold text-blue-950">
                      {e.examination_code}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {e.examination_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {e.conducting_authority}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {e.total_vacancies.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>Deadline: <strong>{formatDate(e.application_end_date)}</strong></div>
                      <div>Exam: <strong>{formatDate(e.examination_date)}</strong></div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge>{e.examination_status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      {/* State Transitions */}
                      {e.examination_status === 'draft' && (
                        <button
                          onClick={() => setStatus(e.examination_id, 'published')}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold border border-emerald-200"
                        >
                          Publish
                        </button>
                      )}
                      {e.examination_status === 'published' && (
                        <button
                          onClick={() => setStatus(e.examination_id, 'closed')}
                          className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-[11px] font-semibold border border-amber-200"
                        >
                          Close Apps
                        </button>
                      )}
                      {e.examination_status === 'closed' && (
                        <button
                          onClick={() => setStatus(e.examination_id, 'completed')}
                          className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-semibold border border-blue-200"
                        >
                          Complete
                        </button>
                      )}

                      <button
                        onClick={() => openEdit(e)}
                        className="p-1.5 text-slate-700 hover:bg-slate-100 rounded"
                        title="Edit Examination"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(e.examination_id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete Examination"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Examination */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Examination Notification' : 'Create Examination Notification'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Examination Code *</label>
              <input
                type="text"
                required
                value={form.examination_code}
                onChange={(e) => setForm({ ...form, examination_code: e.target.value })}
                placeholder="e.g. UPSC-CSE-2026 or SSC-CGL-2026"
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none uppercase font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Conducting Authority *</label>
              <input
                type="text"
                required
                value={form.conducting_authority}
                onChange={(e) => setForm({ ...form, conducting_authority: e.target.value })}
                placeholder="e.g. Staff Selection Commission"
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official Examination Name *</label>
            <input
              type="text"
              required
              value={form.examination_name}
              onChange={(e) => setForm({ ...form, examination_name: e.target.value })}
              placeholder="e.g. Combined Graduate Level Examination 2026"
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Start Date *</label>
              <input
                type="date"
                required
                value={form.application_start_date}
                onChange={(e) => setForm({ ...form, application_start_date: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Closing Date *</label>
              <input
                type="date"
                required
                value={form.application_end_date}
                onChange={(e) => setForm({ ...form, application_end_date: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scheduled Exam Date *</label>
              <input
                type="date"
                required
                value={form.examination_date}
                onChange={(e) => setForm({ ...form, examination_date: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Vacancies *</label>
              <input
                type="number"
                required
                min="0"
                value={form.total_vacancies}
                onChange={(e) => setForm({ ...form, total_vacancies: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Fee (INR) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.application_fee}
                onChange={(e) => setForm({ ...form, application_fee: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lifecycle Status *</label>
              <select
                value={form.examination_status}
                onChange={(e) => setForm({ ...form, examination_status: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none bg-white font-medium"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
            <textarea
              rows="2"
              value={form.eligibility_criteria}
              onChange={(e) => setForm({ ...form, eligibility_criteria: e.target.value })}
              placeholder="e.g. Bachelor Degree from any recognized university. Age between 18 and 32 years."
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
            ></textarea>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Scope & Description</label>
            <textarea
              rows="2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Recruitment notice scope and details..."
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 text-white rounded font-semibold text-xs hover:bg-blue-800 shadow-sm"
            >
              {isEditing ? 'Save Changes' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminExaminations;


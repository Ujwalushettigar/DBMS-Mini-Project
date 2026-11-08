import React, { useEffect, useState } from 'react';
import { qualificationAPI, candidateAPI } from '../services/api';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Alert } from '../components/common/Alert';
import { GraduationCap, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';

export const Qualifications = () => {
  const [qualifications, setQualifications] = useState([]);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState(null);

  const [form, setForm] = useState({
    qualification_level: 'Undergraduate',
    institution_name: '',
    board_or_university: '',
    passing_year: new Date().getFullYear(),
    percentage: ''
  });

  const fetchQualifications = async () => {
    try {
      const cRes = await candidateAPI.getMyProfile();
      if (cRes.success && cRes.data) {
        setCandidate(cRes.data);
        const qRes = await qualificationAPI.getQualifications(cRes.data.candidate_id);
        if (qRes.success && qRes.data) {
          setQualifications(qRes.data);
        }
      }
    } catch (err) {
      console.warn('Qualifications fetch note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualifications();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm({
      qualification_level: 'Undergraduate',
      institution_name: '',
      board_or_university: '',
      passing_year: 2022,
      percentage: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (q) => {
    setIsEditing(true);
    setEditingId(q.qualification_id);
    setForm({
      qualification_level: q.qualification_level,
      institution_name: q.institution_name,
      board_or_university: q.board_or_university,
      passing_year: q.passing_year,
      percentage: q.percentage
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setAlert(null);
    try {
      if (isEditing) {
        await qualificationAPI.update(editingId, {
          qualification_level: form.qualification_level,
          institution_name: form.institution_name,
          board_or_university: form.board_or_university,
          passing_year: Number(form.passing_year),
          percentage: Number(form.percentage)
        });
        setAlert({ type: 'success', message: 'Qualification record updated successfully.' });
      } else {
        await qualificationAPI.add({
          candidate_id: candidate.candidate_id,
          qualification_level: form.qualification_level,
          institution_name: form.institution_name,
          board_or_university: form.board_or_university,
          passing_year: Number(form.passing_year),
          percentage: Number(form.percentage)
        });
        setAlert({ type: 'success', message: 'Academic qualification added successfully.' });
      }
      setModalOpen(false);
      fetchQualifications();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Operation failed.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this qualification record?')) return;
    try {
      await qualificationAPI.delete(id);
      setAlert({ type: 'success', message: 'Qualification record deleted.' });
      fetchQualifications();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Could not delete qualification.' });
    }
  };

  if (loading) return <LoadingSpinner message="Retrieving academic qualifications..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Educational Qualifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain your academic records (SSLC, PUC, Diploma, Undergraduate, Postgraduate) to meet examination eligibility criteria.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Qualification</span>
        </button>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Qualifications Table */}
      {qualifications.length === 0 ? (
        <EmptyState
          title="No qualifications recorded"
          description="Add your academic degrees and percentages to apply for public examinations."
          icon={GraduationCap}
          action={
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-blue-900 text-white rounded text-xs font-semibold hover:bg-blue-800"
            >
              Add First Degree
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Qualification Level</th>
                  <th className="px-6 py-3">Institution Name</th>
                  <th className="px-6 py-3">Board / University</th>
                  <th className="px-6 py-3">Passing Year</th>
                  <th className="px-6 py-3">Percentage (%)</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {qualifications.map((q) => (
                  <tr key={q.qualification_id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 font-semibold text-blue-950">
                      {q.qualification_level}
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-medium">
                      {q.institution_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {q.board_or_university}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono">
                      {q.passing_year}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {q.percentage}%
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(q)}
                        className="text-blue-700 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        title="Edit Qualification"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.qualification_id)}
                        className="text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded"
                        title="Delete Qualification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Qualification */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Modify Educational Qualification' : 'Add Educational Qualification'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Qualification Level *</label>
            <select
              value={form.qualification_level}
              onChange={(e) => setForm({ ...form, qualification_level: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none bg-white"
            >
              <option value="SSLC">SSLC (10th Standard)</option>
              <option value="PUC">PUC (12th Standard / Pre-University)</option>
              <option value="Diploma">Diploma (Polytechnic / Technical)</option>
              <option value="Undergraduate">Undergraduate (B.Tech / B.Sc / B.Com / B.A)</option>
              <option value="Postgraduate">Postgraduate (M.Tech / M.Sc / M.A / MBA)</option>
              <option value="Other">Other Equivalent Qualification</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Institution / School / College Name *</label>
            <input
              type="text"
              required
              value={form.institution_name}
              onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
              placeholder="e.g. National Institute of Engineering"
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Board or University *</label>
            <input
              type="text"
              required
              value={form.board_or_university}
              onChange={(e) => setForm({ ...form, board_or_university: e.target.value })}
              placeholder="e.g. CBSE / State Board / VTU / Bangalore University"
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Passing Year *</label>
              <input
                type="number"
                required
                min="1960"
                max="2035"
                value={form.passing_year}
                onChange={(e) => setForm({ ...form, passing_year: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Percentage (%) *</label>
              <input
                type="number"
                step="0.01"
                required
                min="0"
                max="100"
                value={form.percentage}
                onChange={(e) => setForm({ ...form, percentage: e.target.value })}
                placeholder="e.g. 84.50"
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded hover:bg-slate-50 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 text-white rounded font-semibold hover:bg-blue-800 text-xs shadow-sm"
            >
              {isEditing ? 'Save Changes' : 'Add Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Qualifications;


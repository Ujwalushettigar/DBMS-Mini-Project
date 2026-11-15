import React, { useEffect, useState } from 'react';
import { qualificationAPI, candidateAPI } from '../services/api';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Alert } from '../components/common/Alert';
import { FormField } from '../components/common/FormField';
import { PageHeader } from '../components/common/PageHeader';
import { GraduationCap, Plus, Trash2, Edit2 } from 'lucide-react';

export function Qualifications() {
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

  if (loading) return <LoadingSpinner label="Retrieving academic qualifications..." />;

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Educational Qualifications"
        subtitle="Maintain verified academic records (SSLC, 10+2, Diploma, UG, PG) for examination eligibility scrutiny"
        crumbs={[{ label: 'Dashboard', to: '/candidate/dashboard' }, { label: 'Qualifications' }]}
        actions={
          <button
            type="button"
            onClick={openAddModal}
            className="gov-btn gov-btn-accent text-xs"
          >
            <Plus size={16} />
            <span>Add Qualification</span>
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

      {/* Qualifications Section */}
      <section className="gov-card">
        <div className="gov-card-header justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} />
            <span>Recorded Academic Credentials</span>
          </div>
          <span className="text-xs text-slate-500 font-normal">
            Total entries: <strong>{qualifications.length}</strong>
          </span>
        </div>

        {qualifications.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No academic qualifications recorded"
              message="Add your academic degrees and percentages to apply for public recruitment examinations."
              icon={GraduationCap}
              action={
                <button
                  type="button"
                  onClick={openAddModal}
                  className="gov-btn gov-btn-primary text-xs"
                >
                  <Plus size={14} /> Add First Qualification
                </button>
              }
            />
          </div>
        ) : (
          <div className="gov-table-wrap !border-0 !rounded-none">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Qualification Level</th>
                  <th>Institution / College</th>
                  <th>Board / University</th>
                  <th>Passing Year</th>
                  <th>Percentage (%)</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {qualifications.map((q) => (
                  <tr key={q.qualification_id}>
                    <td className="font-semibold text-gov-800">
                      {q.qualification_level}
                    </td>
                    <td className="font-medium text-slate-800">
                      {q.institution_name}
                    </td>
                    <td className="text-slate-600">
                      {q.board_or_university}
                    </td>
                    <td className="font-mono text-slate-600">
                      {q.passing_year}
                    </td>
                    <td className="font-bold text-gov-900">
                      {q.percentage}%
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => openEditModal(q)}
                          className="gov-btn gov-btn-outline !p-1.5 text-xs"
                          title="Edit Qualification"
                          aria-label={`Edit ${q.qualification_level}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(q.qualification_id)}
                          className="gov-btn gov-btn-danger !p-1.5 text-xs"
                          title="Delete Qualification"
                          aria-label={`Delete ${q.qualification_level}`}
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

      {/* Modal: Add/Edit Qualification */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Modify Educational Qualification' : 'Add Educational Qualification'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs" noValidate>
          <p className="text-xs text-slate-500 border-b border-line pb-2">Fields marked * are mandatory</p>

          <FormField label="Qualification Level" htmlFor="q_level" required>
            <select
              id="q_level"
              value={form.qualification_level}
              onChange={(e) => setForm({ ...form, qualification_level: e.target.value })}
              className="gov-input"
            >
              <option value="SSLC">SSLC (10th Standard)</option>
              <option value="PUC">PUC (12th Standard / Pre-University)</option>
              <option value="Diploma">Diploma (Polytechnic / Technical)</option>
              <option value="Undergraduate">Undergraduate (B.Tech / B.Sc / B.Com / B.A)</option>
              <option value="Postgraduate">Postgraduate (M.Tech / M.Sc / M.A / MBA)</option>
              <option value="Other">Other Equivalent Qualification</option>
            </select>
          </FormField>

          <FormField label="Institution / School / College Name" htmlFor="inst_name" required>
            <input
              id="inst_name"
              type="text"
              required
              value={form.institution_name}
              onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
              placeholder="e.g. National Institute of Engineering"
              className="gov-input"
            />
          </FormField>

          <FormField label="Board or University" htmlFor="board_univ" required>
            <input
              id="board_univ"
              type="text"
              required
              value={form.board_or_university}
              onChange={(e) => setForm({ ...form, board_or_university: e.target.value })}
              placeholder="e.g. CBSE / State Board / VTU / Central University"
              className="gov-input"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Passing Year" htmlFor="pass_year" required>
              <input
                id="pass_year"
                type="number"
                required
                min="1960"
                max="2035"
                value={form.passing_year}
                onChange={(e) => setForm({ ...form, passing_year: e.target.value })}
                className="gov-input"
              />
            </FormField>

            <FormField label="Percentage / CGPA Equivalent (%)" htmlFor="pct" required>
              <input
                id="pct"
                type="number"
                step="0.01"
                required
                min="0"
                max="100"
                value={form.percentage}
                onChange={(e) => setForm({ ...form, percentage: e.target.value })}
                placeholder="e.g. 84.50"
                className="gov-input"
              />
            </FormField>
          </div>

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
              {isEditing ? 'Save Changes' : 'Add Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Qualifications;

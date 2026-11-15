import React, { useEffect, useState } from 'react';
import { candidateAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Alert } from '../components/common/Alert';
import { FormField } from '../components/common/FormField';
import { PageHeader } from '../components/common/PageHeader';
import { Users, Search, Filter, Eye, Edit2, Trash2, GraduationCap } from 'lucide-react';

export function AdminCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [alert, setAlert] = useState(null);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await candidateAPI.getAll({
        search: search || undefined,
        category: categoryFilter || undefined
      });
      if (res.success && res.data) {
        setCandidates(res.data);
      }
    } catch (err) {
      console.warn('Error fetching candidates:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCandidates();
  };

  const openView = (c) => {
    setSelectedCandidate(c);
    setViewModalOpen(true);
  };

  const openEdit = (c) => {
    setSelectedCandidate(c);
    setEditForm({
      full_name: c.full_name,
      phone_number: c.phone_number,
      category: c.category,
      gender: c.gender,
      city: c.city,
      state: c.state,
      pincode: c.pincode,
      address: c.address
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await candidateAPI.update(selectedCandidate.candidate_id, editForm);
      setAlert({ type: 'success', message: 'Candidate dossier updated successfully.' });
      setEditModalOpen(false);
      fetchCandidates();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Update failed.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate record? Note: foreign key constraints prevent deleting candidates with applications.')) return;
    try {
      await candidateAPI.delete(id);
      setAlert({ type: 'success', message: 'Candidate record removed successfully.' });
      fetchCandidates();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Cannot delete candidate.' });
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Candidate Dossier Management"
        subtitle="Search, audit, inspect educational qualifications, and manage registered aspirant dossiers"
        crumbs={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Candidates' }]}
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Filter and Search Bar */}
      <section className="gov-card p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs" noValidate>
          <div className="sm:col-span-3 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by candidate name, registration code (CND-2026-...), or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="gov-input !pl-9"
              aria-label="Search candidates"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="gov-input"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
            <button
              type="submit"
              className="gov-btn gov-btn-primary whitespace-nowrap text-xs"
            >
              Search
            </button>
          </div>
        </form>
      </section>

      {/* Candidates Table */}
      <section className="gov-card">
        <div className="gov-card-header justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} />
            <span>Registered Candidates Directory</span>
          </div>
          <span className="text-xs text-slate-500 font-normal">
            Total records: <strong>{candidates.length}</strong>
          </span>
        </div>

        {loading ? (
          <LoadingSpinner label="Querying candidate records from database..." />
        ) : candidates.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No candidates found"
              message="Try broadening your search query or reset the category filter."
              icon={Users}
            />
          </div>
        ) : (
          <div className="gov-table-wrap !border-0 !rounded-none">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Candidate Reg No</th>
                  <th>Candidate Name</th>
                  <th>Email Address</th>
                  <th>Social Category</th>
                  <th>Location</th>
                  <th>Registered On</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.candidate_id}>
                    <td className="whitespace-nowrap font-mono text-xs font-bold text-gov-900">
                      {c.candidate_number}
                    </td>
                    <td className="font-semibold text-slate-900">
                      {c.full_name}
                    </td>
                    <td className="text-slate-600 text-xs">
                      {c.email || c.profiles?.email || '—'}
                    </td>
                    <td>
                      <Badge>{c.category}</Badge>
                    </td>
                    <td className="text-slate-600">
                      {c.city}, {c.state}
                    </td>
                    <td className="whitespace-nowrap text-slate-600">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => openView(c)}
                          className="gov-btn gov-btn-outline !p-1.5 text-xs"
                          title="View Full Dossier"
                          aria-label={`View dossier for ${c.full_name}`}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="gov-btn gov-btn-outline !p-1.5 text-xs"
                          title="Edit Candidate"
                          aria-label={`Edit ${c.full_name}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.candidate_id)}
                          className="gov-btn gov-btn-danger !p-1.5 text-xs"
                          title="Delete Candidate"
                          aria-label={`Delete ${c.full_name}`}
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

      {/* View Candidate Dossier Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Candidate Demographic & Academic Dossier"
        maxWidth="max-w-2xl"
      >
        {selectedCandidate && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded border border-line">
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-semibold">Full Legal Name</span>
                <strong className="text-sm text-gov-900">{selectedCandidate.full_name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-semibold">Registration Number</span>
                <strong className="font-mono text-sm text-gov-800">{selectedCandidate.candidate_number}</strong>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-semibold">Date of Birth</span>
                <strong className="text-slate-800">{formatDate(selectedCandidate.date_of_birth)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-semibold">Gender & Category</span>
                <strong className="text-slate-800">{selectedCandidate.gender} • {selectedCandidate.category}</strong>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-semibold">Mobile Phone</span>
                <strong className="text-slate-800">{selectedCandidate.phone_number}</strong>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-semibold">Registered Email</span>
                <strong className="text-slate-800">{selectedCandidate.email || selectedCandidate.profiles?.email}</strong>
              </div>
              <div className="col-span-2 border-t border-line pt-2">
                <span className="text-slate-500 block uppercase text-[10px] font-semibold">Residential Address</span>
                <p className="text-slate-700">{selectedCandidate.address}, {selectedCandidate.city}, {selectedCandidate.state} - {selectedCandidate.pincode}</p>
              </div>
            </div>

            {/* Qualifications Sub-Table */}
            <div className="space-y-2 border-t border-line pt-3">
              <h3 className="font-bold text-gov-800 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                <GraduationCap size={16} className="text-gov-700" />
                <span>Recorded Academic Qualifications</span>
              </h3>
              {(!selectedCandidate.qualifications || selectedCandidate.qualifications.length === 0) ? (
                <p className="text-slate-500 italic p-2 bg-slate-50 rounded">No qualification records submitted.</p>
              ) : (
                <div className="divide-y divide-line border border-line rounded">
                  {selectedCandidate.qualifications.map((q, idx) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center bg-slate-50 text-xs">
                      <div>
                        <strong className="text-gov-800">{q.qualification_level}</strong>: {q.institution_name} ({q.board_or_university})
                      </div>
                      <div className="font-bold text-gov-900 font-mono">
                        {q.percentage}% • {q.passing_year}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-line flex justify-end">
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="gov-btn gov-btn-outline text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Candidate Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Candidate Demographic Information"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Full Name" htmlFor="cand_name" required>
              <input
                id="cand_name"
                type="text"
                required
                value={editForm.full_name || ''}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="gov-input"
              />
            </FormField>
            <FormField label="Phone Number" htmlFor="cand_phone" required>
              <input
                id="cand_phone"
                type="tel"
                required
                value={editForm.phone_number || ''}
                onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                className="gov-input"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category" htmlFor="cand_cat" required>
              <select
                id="cand_cat"
                value={editForm.category || 'General'}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="gov-input"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </FormField>
            <FormField label="Gender" htmlFor="cand_gender" required>
              <select
                id="cand_gender"
                value={editForm.gender || 'Male'}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="gov-input"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </FormField>
          </div>

          <FormField label="Address" htmlFor="cand_addr" required>
            <textarea
              id="cand_addr"
              rows={2}
              required
              value={editForm.address || ''}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="gov-input"
            />
          </FormField>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="City" htmlFor="cand_city" required>
              <input
                id="cand_city"
                type="text"
                required
                value={editForm.city || ''}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                className="gov-input"
              />
            </FormField>
            <FormField label="State" htmlFor="cand_state" required>
              <input
                id="cand_state"
                type="text"
                required
                value={editForm.state || ''}
                onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                className="gov-input"
              />
            </FormField>
            <FormField label="Pincode" htmlFor="cand_pin" required>
              <input
                id="cand_pin"
                type="text"
                required
                value={editForm.pincode || ''}
                onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                className="gov-input"
              />
            </FormField>
          </div>

          <div className="pt-3 border-t border-line flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="gov-btn gov-btn-outline text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gov-btn gov-btn-primary text-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminCandidates;

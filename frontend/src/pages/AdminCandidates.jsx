import React, { useEffect, useState } from 'react';
import { candidateAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Alert } from '../components/common/Alert';
import { Users, Search, Filter, Eye, Edit2, Trash2, GraduationCap } from 'lucide-react';

export const AdminCandidates = () => {
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
    if (!window.confirm('Are you sure you want to delete this candidate? This will fail if the candidate has active examination applications.')) return;
    try {
      await candidateAPI.delete(id);
      setAlert({ type: 'success', message: 'Candidate record removed successfully.' });
      fetchCandidates();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Cannot delete candidate.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Candidate Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View, scrutinize, edit, and manage registered aspirant dossiers and academic records.
          </p>
        </div>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="sm:col-span-3 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, registration code (CND-2026-...), or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-900 outline-none"
            />
          </div>

          <div className="flex space-x-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-900 outline-none bg-white text-xs"
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
              className="px-4 py-2 bg-blue-900 text-white rounded font-semibold hover:bg-blue-800"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Candidates Table */}
      {loading ? (
        <LoadingSpinner message="Querying candidate records from database..." />
      ) : candidates.length === 0 ? (
        <EmptyState
          title="No candidates found"
          description="Try broadening your search query or reset the category filter."
          icon={Users}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Candidate Reg No</th>
                  <th className="px-6 py-3">Candidate Name</th>
                  <th className="px-6 py-3">Email Address</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Registered On</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {candidates.map((c) => (
                  <tr key={c.candidate_id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 font-mono font-bold text-blue-950">
                      {c.candidate_number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {c.full_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {c.email || c.profiles?.email || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge>{c.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {c.city}, {c.state}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(c.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <button
                        onClick={() => openView(c)}
                        className="p-1.5 text-blue-800 hover:bg-blue-50 rounded"
                        title="View Full Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 text-slate-700 hover:bg-slate-100 rounded"
                        title="Edit Candidate"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.candidate_id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete Candidate"
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

      {/* View Candidate Dossier Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Candidate Demographic & Academic Dossier"
        maxWidth="max-w-2xl"
      >
        {selectedCandidate && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Legal Name</span>
                <strong className="text-sm text-slate-900">{selectedCandidate.full_name}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Registration Number</span>
                <strong className="font-mono text-sm text-blue-900">{selectedCandidate.candidate_number}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                <strong>{formatDate(selectedCandidate.date_of_birth)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Gender & Category</span>
                <strong>{selectedCandidate.gender} • {selectedCandidate.category}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Mobile Phone</span>
                <strong>{selectedCandidate.phone_number}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Registered Email</span>
                <strong>{selectedCandidate.email || selectedCandidate.profiles?.email}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Residential Address</span>
                <p className="text-slate-700">{selectedCandidate.address}, {selectedCandidate.city}, {selectedCandidate.state} - {selectedCandidate.pincode}</p>
              </div>
            </div>

            {/* Qualifications Sub-Table */}
            <div className="space-y-2 border-t border-slate-200 pt-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                <GraduationCap className="w-4 h-4 text-blue-900" />
                <span>Academic Qualifications</span>
              </h4>
              {(!selectedCandidate.qualifications || selectedCandidate.qualifications.length === 0) ? (
                <p className="text-slate-500 italic">No qualification records submitted.</p>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded">
                  {selectedCandidate.qualifications.map((q, idx) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center bg-slate-50">
                      <div>
                        <strong>{q.qualification_level}</strong>: {q.institution_name} ({q.board_or_university})
                      </div>
                      <div className="font-bold text-blue-950">
                        {q.percentage}% • {q.passing_year}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Candidate Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Candidate Demographic Information"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editForm.full_name || ''}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={editForm.phone_number || ''}
                onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={editForm.category || 'General'}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none bg-white"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={editForm.gender || 'Male'}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Address</label>
            <textarea
              rows="2"
              required
              value={editForm.address || ''}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={editForm.city || ''}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                required
                value={editForm.state || ''}
                onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                required
                value={editForm.pincode || ''}
                onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 text-white rounded font-semibold text-xs hover:bg-blue-800 shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCandidates;


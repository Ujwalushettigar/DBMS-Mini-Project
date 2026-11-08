import React, { useEffect, useState } from 'react';
import { centerAPI, examAPI } from '../services/api';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Alert } from '../components/common/Alert';
import { Building, Plus, Edit2, Trash2, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

export const AdminCenters = () => {
  const [centers, setCenters] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [centerModalOpen, setCenterModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState(null);

  const [centerForm, setCenterForm] = useState({
    center_code: '',
    center_name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contact_number: '',
    total_capacity: 500
  });

  const [assignForm, setAssignForm] = useState({
    examination_id: '',
    center_id: '',
    allocated_capacity: 400
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, eRes] = await Promise.all([centerAPI.getAll(), examAPI.getAll()]);
      if (cRes.success) setCenters(cRes.data);
      if (eRes.success) setExams(eRes.data);
    } catch (err) {
      console.warn('Error fetching centers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddCenter = () => {
    setIsEditing(false);
    setEditingId(null);
    setCenterForm({
      center_code: '',
      center_name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      contact_number: '',
      total_capacity: 500
    });
    setCenterModalOpen(true);
  };

  const openEditCenter = (c) => {
    setIsEditing(true);
    setEditingId(c.center_id);
    setCenterForm({
      center_code: c.center_code,
      center_name: c.center_name,
      address: c.address,
      city: c.city,
      state: c.state,
      pincode: c.pincode,
      contact_number: c.contact_number || '',
      total_capacity: c.total_capacity
    });
    setCenterModalOpen(true);
  };

  const openAssignModal = (center) => {
    setAssignForm({
      center_id: center.center_id,
      examination_id: exams.length > 0 ? exams[0].examination_id : '',
      allocated_capacity: Math.min(400, center.total_capacity)
    });
    setAssignModalOpen(true);
  };

  const handleCenterSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    try {
      if (isEditing) {
        await centerAPI.update(editingId, centerForm);
        setAlert({ type: 'success', message: 'Center details updated successfully.' });
      } else {
        await centerAPI.create(centerForm);
        setAlert({ type: 'success', message: 'Examination center added successfully.' });
      }
      setCenterModalOpen(false);
      fetchData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Operation failed.' });
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    try {
      await centerAPI.assignToExam(assignForm);
      setAlert({ type: 'success', message: 'Examination center allocated with quota capacity (examination_centers junction table updated).' });
      setAssignModalOpen(false);
      fetchData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to allocate center.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this test center? This will fail if scheduled admit cards reference it.')) return;
    try {
      await centerAPI.delete(id);
      setAlert({ type: 'success', message: 'Exam center removed.' });
      fetchData();
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Cannot delete center.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Examination Center Venues</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain authorized physical venues and manage M:N associations via the <code>examination_centers</code> junction table.
          </p>
        </div>
        <button
          onClick={openAddCenter}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Center Venue</span>
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
        <LoadingSpinner message="Querying test centers..." />
      ) : centers.length === 0 ? (
        <EmptyState
          title="No centers registered"
          description="Add approved physical venues with seating capacities."
          icon={Building}
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Center Code</th>
                  <th className="px-6 py-3">Venue Name</th>
                  <th className="px-6 py-3">Location (City, State)</th>
                  <th className="px-6 py-3">Total Capacity</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {centers.map((c) => (
                  <tr key={c.center_id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 font-mono font-bold text-blue-950">
                      {c.center_code}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{c.center_name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{c.address}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {c.city}, {c.state} ({c.pincode})
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {c.total_capacity.toLocaleString()} Seats
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono">
                      {c.contact_number || '—'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <button
                        onClick={() => openAssignModal(c)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded text-[11px] font-semibold border border-blue-200 inline-flex items-center space-x-1"
                        title="Allocate to Examination"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Allocate</span>
                      </button>
                      <button
                        onClick={() => openEditCenter(c)}
                        className="p-1.5 text-slate-700 hover:bg-slate-100 rounded"
                        title="Edit Venue"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.center_id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete Venue"
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

      {/* Modal: Add/Edit Center */}
      <Modal
        isOpen={centerModalOpen}
        onClose={() => setCenterModalOpen(false)}
        title={isEditing ? 'Modify Center Venue' : 'Create Examination Center Venue'}
      >
        <form onSubmit={handleCenterSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Center Code *</label>
              <input
                type="text"
                required
                value={centerForm.center_code}
                onChange={(e) => setCenterForm({ ...centerForm, center_code: e.target.value })}
                placeholder="e.g. DEL-KV-101"
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none uppercase font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Venue Capacity *</label>
              <input
                type="number"
                required
                min="1"
                value={centerForm.total_capacity}
                onChange={(e) => setCenterForm({ ...centerForm, total_capacity: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Center / Institution Name *</label>
            <input
              type="text"
              required
              value={centerForm.center_name}
              onChange={(e) => setCenterForm({ ...centerForm, center_name: e.target.value })}
              placeholder="e.g. Government Arts and Science College"
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Postal Address *</label>
            <textarea
              rows="2"
              required
              value={centerForm.address}
              onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
              placeholder="Street address, campus landmarks"
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
            ></textarea>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={centerForm.city}
                onChange={(e) => setCenterForm({ ...centerForm, city: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={centerForm.state}
                onChange={(e) => setCenterForm({ ...centerForm, state: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pincode *</label>
              <input
                type="text"
                required
                value={centerForm.pincode}
                onChange={(e) => setCenterForm({ ...centerForm, pincode: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Phone Number</label>
            <input
              type="tel"
              value={centerForm.contact_number}
              onChange={(e) => setCenterForm({ ...centerForm, contact_number: e.target.value })}
              placeholder="Landline / Admin office phone"
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setCenterModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 text-white rounded font-semibold text-xs hover:bg-blue-800 shadow-sm"
            >
              {isEditing ? 'Save Changes' : 'Register Venue'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Associate Center with Examination (M:N Table) */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Associate Center with Examination (M:N Mapping)"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
          <p className="text-slate-600">
            This creates or updates a record in the junction table <code>examination_centers</code> with a composite primary key <code>(examination_id, center_id)</code>.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Examination Notice *</label>
            <select
              value={assignForm.examination_id}
              onChange={(e) => setAssignForm({ ...assignForm, examination_id: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none bg-white font-medium"
            >
              {exams.map((e) => (
                <option key={e.examination_id} value={e.examination_id}>
                  {e.examination_code} - {e.examination_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Allocated Capacity Quota (Seats) *</label>
            <input
              type="number"
              required
              min="1"
              value={assignForm.allocated_capacity}
              onChange={(e) => setAssignForm({ ...assignForm, allocated_capacity: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-900 outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Note: Database trigger <code>validate_center_allocation_capacity</code> will abort if quota exceeds venue capacity.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-900 text-white rounded font-semibold text-xs hover:bg-blue-800 shadow-sm"
            >
              Confirm Allocation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCenters;


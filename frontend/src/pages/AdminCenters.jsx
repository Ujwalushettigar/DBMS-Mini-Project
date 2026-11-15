import React, { useEffect, useState } from 'react';
import { centerAPI, examAPI } from '../services/api';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Alert } from '../components/common/Alert';
import { FormField } from '../components/common/FormField';
import { PageHeader } from '../components/common/PageHeader';
import { Building2, Plus, Edit2, Trash2, Link as LinkIcon } from 'lucide-react';

export function AdminCenters() {
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
      examination_id: exams.length > 0 ? (exams[0].examination_id || exams[0].id) : '',
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
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Examination Center Venues"
        subtitle="Manage authorized test centers, venue capacities, and M:N junction associations"
        crumbs={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Exam Centers' }]}
        actions={
          <button
            type="button"
            onClick={openAddCenter}
            className="gov-btn gov-btn-accent text-xs"
          >
            <Plus size={16} />
            <span>Add Center Venue</span>
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

      {/* Centers Table */}
      <section className="gov-card">
        <div className="gov-card-header justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={18} />
            <span>Accredited Examination Centers Directory</span>
          </div>
          <span className="text-xs text-slate-500 font-normal">
            Total venues: <strong>{centers.length}</strong>
          </span>
        </div>

        {loading ? (
          <LoadingSpinner label="Querying test centers..." />
        ) : centers.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No centers registered"
              message="Add approved physical examination venues with seating capacities."
              icon={Building2}
              action={
                <button
                  type="button"
                  onClick={openAddCenter}
                  className="gov-btn gov-btn-primary text-xs"
                >
                  <Plus size={14} /> Add First Venue
                </button>
              }
            />
          </div>
        ) : (
          <div className="gov-table-wrap !border-0 !rounded-none">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Center Code</th>
                  <th>Venue Name & Campus</th>
                  <th>Location (City, State)</th>
                  <th>Total Capacity</th>
                  <th>Contact</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {centers.map((c) => (
                  <tr key={c.center_id}>
                    <td className="whitespace-nowrap font-mono text-xs font-bold text-gov-900">
                      {c.center_code}
                    </td>
                    <td>
                      <div className="font-semibold text-gov-800">{c.center_name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{c.address}</div>
                    </td>
                    <td className="text-slate-600 text-xs">
                      {c.city}, {c.state} ({c.pincode})
                    </td>
                    <td className="font-bold text-gov-800 text-xs">
                      {Number(c.total_capacity).toLocaleString()} Seats
                    </td>
                    <td className="text-slate-600 font-mono text-xs">
                      {c.contact_number || '—'}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => openAssignModal(c)}
                          className="gov-btn gov-btn-accent !py-1 !px-2 text-xs"
                          title="Allocate to Examination"
                        >
                          <LinkIcon size={12} />
                          <span>Allocate</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditCenter(c)}
                          className="gov-btn gov-btn-outline !p-1.5 text-xs"
                          title="Edit Venue"
                          aria-label={`Edit ${c.center_code}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.center_id)}
                          className="gov-btn gov-btn-danger !p-1.5 text-xs"
                          title="Delete Venue"
                          aria-label={`Delete ${c.center_code}`}
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

      {/* Modal: Add/Edit Center */}
      <Modal
        open={centerModalOpen}
        onClose={() => setCenterModalOpen(false)}
        title={isEditing ? 'Modify Center Venue' : 'Create Examination Center Venue'}
      >
        <form onSubmit={handleCenterSubmit} className="space-y-4 text-xs" noValidate>
          <p className="text-xs text-slate-500 border-b border-line pb-2">Fields marked * are mandatory</p>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Center Code" htmlFor="cntr_code" required hint="e.g. DEL-KV-101">
              <input
                id="cntr_code"
                type="text"
                required
                value={centerForm.center_code}
                onChange={(e) => setCenterForm({ ...centerForm, center_code: e.target.value })}
                placeholder="DEL-KV-101"
                className="gov-input uppercase font-mono"
              />
            </FormField>

            <FormField label="Total Venue Capacity" htmlFor="tot_cap" required>
              <input
                id="tot_cap"
                type="number"
                required
                min="1"
                value={centerForm.total_capacity}
                onChange={(e) => setCenterForm({ ...centerForm, total_capacity: e.target.value })}
                className="gov-input"
              />
            </FormField>
          </div>

          <FormField label="Center / Institution Name" htmlFor="cntr_name" required>
            <input
              id="cntr_name"
              type="text"
              required
              value={centerForm.center_name}
              onChange={(e) => setCenterForm({ ...centerForm, center_name: e.target.value })}
              placeholder="e.g. Government Arts and Science College"
              className="gov-input"
            />
          </FormField>

          <FormField label="Postal Address" htmlFor="cntr_addr" required>
            <textarea
              id="cntr_addr"
              rows={2}
              required
              value={centerForm.address}
              onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
              placeholder="Campus address, street, landmark"
              className="gov-input"
            />
          </FormField>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="City" htmlFor="cntr_city" required>
              <input
                id="cntr_city"
                type="text"
                required
                value={centerForm.city}
                onChange={(e) => setCenterForm({ ...centerForm, city: e.target.value })}
                className="gov-input"
              />
            </FormField>
            <FormField label="State" htmlFor="cntr_state" required>
              <input
                id="cntr_state"
                type="text"
                required
                value={centerForm.state}
                onChange={(e) => setCenterForm({ ...centerForm, state: e.target.value })}
                className="gov-input"
              />
            </FormField>
            <FormField label="Pincode" htmlFor="cntr_pin" required>
              <input
                id="cntr_pin"
                type="text"
                required
                value={centerForm.pincode}
                onChange={(e) => setCenterForm({ ...centerForm, pincode: e.target.value })}
                className="gov-input"
              />
            </FormField>
          </div>

          <FormField label="Contact Phone Number" htmlFor="cntr_phone">
            <input
              id="cntr_phone"
              type="tel"
              value={centerForm.contact_number}
              onChange={(e) => setCenterForm({ ...centerForm, contact_number: e.target.value })}
              placeholder="Official phone number"
              className="gov-input"
            />
          </FormField>

          <div className="pt-3 border-t border-line flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCenterModalOpen(false)}
              className="gov-btn gov-btn-outline text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gov-btn gov-btn-primary text-xs"
            >
              {isEditing ? 'Save Changes' : 'Register Venue'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Associate Center with Examination (M:N Table) */}
      <Modal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Associate Center with Examination (M:N Mapping)"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs" noValidate>
          <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-line">
            This creates or updates a record in junction table <code className="font-mono text-gov-800">examination_centers</code> with composite primary key <code className="font-mono text-gov-800">(examination_id, center_id)</code>.
          </p>

          <FormField label="Target Examination Notice" htmlFor="asgn_exam" required>
            <select
              id="asgn_exam"
              value={assignForm.examination_id}
              onChange={(e) => setAssignForm({ ...assignForm, examination_id: e.target.value })}
              className="gov-input font-medium"
            >
              {exams.map((e) => (
                <option key={e.examination_id || e.id} value={e.examination_id || e.id}>
                  {e.examination_code} - {e.examination_name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Allocated Capacity Quota (Seats)"
            htmlFor="asgn_cap"
            required
            hint="Database trigger validate_center_allocation_capacity ensures allocated quota does not exceed venue capacity."
          >
            <input
              id="asgn_cap"
              type="number"
              required
              min="1"
              value={assignForm.allocated_capacity}
              onChange={(e) => setAssignForm({ ...assignForm, allocated_capacity: e.target.value })}
              className="gov-input"
            />
          </FormField>

          <div className="pt-3 border-t border-line flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="gov-btn gov-btn-outline text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="gov-btn gov-btn-primary text-xs"
            >
              Confirm Allocation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminCenters;

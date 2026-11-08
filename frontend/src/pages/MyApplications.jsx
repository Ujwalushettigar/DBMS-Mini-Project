import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { FileText, Eye, CreditCard, Award, ArrowRight, Building } from 'lucide-react';

export const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await applicationAPI.getMyApplications();
        if (res.success && res.data) {
          setApplications(res.data);
        }
      } catch (err) {
        console.warn('Error fetching applications:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const openDetails = (app) => {
    setSelectedApp(app);
    setModalOpen(true);
  };

  if (loading) return <LoadingSpinner message="Retrieving your submitted applications..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Examination Applications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track online submission status, scrutiny reviews, venue allocations, and hall tickets.
          </p>
        </div>
        <Link
          to="/candidate/examinations"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm transition"
        >
          <span>Apply for New Exam</span>
        </Link>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No applications submitted yet"
          description="You have not submitted applications for any ongoing recruitment examinations."
          icon={FileText}
          action={
            <Link
              to="/candidate/examinations"
              className="px-4 py-2 bg-blue-900 text-white rounded text-xs font-semibold hover:bg-blue-800 inline-block"
            >
              Browse Open Examinations
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">App Number</th>
                  <th className="px-6 py-3">Examination Details</th>
                  <th className="px-6 py-3">Applied Date</th>
                  <th className="px-6 py-3">Exam Center</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Application Status</th>
                  <th className="px-6 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {applications.map((app) => (
                  <tr key={app.application_id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 font-mono font-bold text-blue-950">
                      {app.application_number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{app.examination?.examination_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{app.examination?.examination_code}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDate(app.applied_at)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {app.exam_center ? `${app.exam_center.center_name}` : 'Pending Allocation'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge>{app.payment_status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge>{app.application_status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDetails(app)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Application Submission Dossier"
      >
        {selectedApp && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Application Tracking Number</span>
                <span className="font-mono font-bold text-slate-900">{selectedApp.application_number}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Submission Date & Time</span>
                <span className="font-semibold text-slate-800">{new Date(selectedApp.applied_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Application Status</span>
                <Badge>{selectedApp.application_status}</Badge>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Payment Status</span>
                <Badge>{selectedApp.payment_status}</Badge>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider">Examination Information</h4>
              <p className="font-semibold text-slate-900 text-sm">{selectedApp.examination?.examination_name}</p>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Exam Code: <strong>{selectedApp.examination?.examination_code}</strong></div>
                <div>Exam Date: <strong>{formatDate(selectedApp.examination?.examination_date)}</strong></div>
                <div>Authority: <strong>{selectedApp.examination?.conducting_authority}</strong></div>
                <div>Vacancies: <strong>{selectedApp.examination?.total_vacancies?.toLocaleString()}</strong></div>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider">Assigned Examination Center</h4>
              {selectedApp.exam_center ? (
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-slate-700 space-y-0.5">
                  <div className="font-semibold text-slate-900">{selectedApp.exam_center.center_name}</div>
                  <div className="text-[11px] text-slate-500">{selectedApp.exam_center.address}, {selectedApp.exam_center.city}, {selectedApp.exam_center.state} - {selectedApp.exam_center.pincode}</div>
                </div>
              ) : (
                <p className="text-slate-500 italic">No center allocated yet. A center will be designated during application review.</p>
              )}
            </div>

            {selectedApp.remarks && (
              <div className="space-y-1 border-t border-slate-200 pt-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider">Scrutiny / Review Remarks</h4>
                <p className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  {selectedApp.remarks}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded text-slate-800 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyApplications;


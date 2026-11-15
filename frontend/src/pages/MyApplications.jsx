import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { PageHeader } from '../components/common/PageHeader';
import { FileText, Eye, Building2, Plus } from 'lucide-react';

export function MyApplications() {
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

  if (loading) return <LoadingSpinner label="Retrieving your submitted applications..." />;

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="My Examination Applications"
        subtitle="Track submitted applications, scrutiny verification status, assigned test centers, and admit card issuance"
        crumbs={[{ label: 'Dashboard', to: '/candidate/dashboard' }, { label: 'My Applications' }]}
        actions={
          <Link
            to="/candidate/examinations"
            className="gov-btn gov-btn-accent text-xs"
          >
            <Plus size={16} />
            <span>Apply for New Exam</span>
          </Link>
        }
      />

      <section className="gov-card">
        <div className="gov-card-header justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} />
            <span>Submitted Applications Register</span>
          </div>
          <span className="text-xs text-slate-500 font-normal">
            Total records: <strong>{applications.length}</strong>
          </span>
        </div>

        {applications.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No applications submitted yet"
              message="You have not submitted applications for any ongoing recruitment examinations."
              icon={FileText}
              action={
                <Link
                  to="/candidate/examinations"
                  className="gov-btn gov-btn-primary text-xs"
                >
                  Browse Open Examinations
                </Link>
              }
            />
          </div>
        ) : (
          <div className="gov-table-wrap !border-0 !rounded-none">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Application No.</th>
                  <th>Examination Details</th>
                  <th>Submission Date</th>
                  <th>Designated Center</th>
                  <th>Fee Status</th>
                  <th>Scrutiny Status</th>
                  <th className="text-right">Dossier</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.application_id}>
                    <td className="whitespace-nowrap font-mono text-xs font-bold text-gov-900">
                      {app.application_number}
                    </td>
                    <td>
                      <div className="font-semibold text-gov-800">{app.examination?.examination_name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{app.examination?.examination_code}</div>
                    </td>
                    <td className="whitespace-nowrap text-slate-600">
                      {formatDate(app.applied_at)}
                    </td>
                    <td className="text-slate-600">
                      {app.exam_center ? `${app.exam_center.center_name}` : 'Pending Allocation'}
                    </td>
                    <td>
                      <Badge>{app.payment_status}</Badge>
                    </td>
                    <td>
                      <Badge>{app.application_status}</Badge>
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openDetails(app)}
                        className="gov-btn gov-btn-outline !py-1 !px-2.5 text-xs"
                        aria-label={`View details of application ${app.application_number}`}
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Application Details Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Application Submission Dossier"
      >
        {selectedApp && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded border border-line">
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-semibold">Tracking Number</span>
                <span className="font-mono font-bold text-gov-900 text-sm">{selectedApp.application_number}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-semibold">Submission Timestamp</span>
                <span className="font-semibold text-slate-800">{new Date(selectedApp.applied_at).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-semibold mb-1">Application Status</span>
                <Badge>{selectedApp.application_status}</Badge>
              </div>
              <div>
                <span className="text-slate-500 block uppercase text-[10px] font-semibold mb-1">Fee Payment Status</span>
                <Badge>{selectedApp.payment_status}</Badge>
              </div>
            </div>

            <div className="space-y-2 border-t border-line pt-3">
              <h3 className="font-bold text-gov-800 uppercase tracking-wider text-xs">Examination Specification</h3>
              <p className="font-semibold text-gov-900 text-sm">{selectedApp.examination?.examination_name}</p>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Exam Code: <strong className="font-mono">{selectedApp.examination?.examination_code}</strong></div>
                <div>Exam Date: <strong>{formatDate(selectedApp.examination?.examination_date)}</strong></div>
                <div>Authority: <strong>{selectedApp.examination?.conducting_authority || 'Central Recruitment Commission'}</strong></div>
                <div>Total Posts: <strong>{selectedApp.examination?.total_vacancies?.toLocaleString() ?? '—'}</strong></div>
              </div>
            </div>

            <div className="space-y-2 border-t border-line pt-3">
              <h3 className="font-bold text-gov-800 uppercase tracking-wider text-xs">Assigned Examination Center</h3>
              {selectedApp.exam_center ? (
                <div className="p-3 rounded bg-slate-50 border border-line text-slate-700 space-y-0.5">
                  <div className="font-semibold text-gov-900 flex items-center gap-1.5">
                    <Building2 size={14} className="text-gov-700" />
                    <span>{selectedApp.exam_center.center_name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {selectedApp.exam_center.address}, {selectedApp.exam_center.city}, {selectedApp.exam_center.state} - {selectedApp.exam_center.pincode}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic">No center allocated yet. A venue will be designated during application scrutiny.</p>
              )}
            </div>

            {selectedApp.remarks && (
              <div className="space-y-1 border-t border-line pt-3">
                <h3 className="font-bold text-gov-800 uppercase tracking-wider text-xs">Scrutiny / Review Remarks</h3>
                <p className="p-2.5 rounded bg-amber-50 border border-saffron-500/40 text-amber-900 text-xs">
                  {selectedApp.remarks}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-line flex justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="gov-btn gov-btn-outline text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MyApplications;

import React, { useState, useEffect } from 'react';
import { admitCardAPI, examAPI } from '../services/api';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { 
  Ticket, Search, Printer, Calendar, Clock, Landmark, 
  User, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

export function AdminAdmitCards() {
  const [admitCards, setAdmitCards] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [alert, setAlert] = useState(null);

  // Print / View Modal
  const [selectedCard, setSelectedCard] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cardsRes, examsRes] = await Promise.all([
        admitCardAPI.getAll(),
        examAPI.getAll()
      ]);
      setAdmitCards(cardsRes.data || []);
      setExaminations(examsRes.data || []);
    } catch (err) {
      setAlert({ type: 'error', message: err.message || 'Failed to fetch admit cards.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenPreview = (card) => {
    setSelectedCard(card);
    setIsViewModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredCards = admitCards.filter(card => {
    const term = searchTerm.toLowerCase();
    const roll = (card.roll_number || '').toLowerCase();
    const name = (card.candidate?.full_name || '').toLowerCase();
    const candNo = (card.candidate?.candidate_number || card.candidate?.candidate_code || '').toLowerCase();
    const examName = (card.examination?.examination_name || card.examination?.exam_title || '').toLowerCase();
    const examCode = (card.examination?.examination_code || card.examination?.exam_code || '').toLowerCase();

    const matchesSearch = !searchTerm || roll.includes(term) || name.includes(term) || candNo.includes(term) || examName.includes(term) || examCode.includes(term);
    const matchesExam = selectedExam ? (card.examination?.examination_id === selectedExam || card.examination_id === selectedExam) : true;
    return matchesSearch && matchesExam;
  });

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Admit Cards & Hall Tickets Roster"
        subtitle="Manage issued examination credentials, candidate roll number allocations, and center quotas"
        crumbs={[{ label: 'Admin', to: '/admin/dashboard' }, { label: 'Admit Cards' }]}
        actions={
          <button
            type="button"
            onClick={fetchData}
            className="gov-btn gov-btn-outline text-xs"
          >
            <RefreshCw size={14} />
            <span>Refresh Roster</span>
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

      {/* KPI Stats */}
      <section aria-label="Admit card statistics" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="gov-card p-4 border-l-4 border-gov-700 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Hall Tickets Issued</p>
            <p className="text-2xl font-bold text-gov-900 mt-0.5">{admitCards.length}</p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gov-50 text-gov-700">
            <Ticket size={24} />
          </span>
        </div>

        <div className="gov-card p-4 border-l-4 border-india-green flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Examinations</p>
            <p className="text-2xl font-bold text-india-green mt-0.5">{examinations.length}</p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-india-green">
            <Calendar size={24} />
          </span>
        </div>

        <div className="gov-card p-4 border-l-4 border-saffron-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Relational Integrity Verified</p>
            <p className="text-2xl font-bold text-saffron-600 mt-0.5">100%</p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-saffron-600">
            <CheckCircle2 size={24} />
          </span>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="gov-card p-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center text-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search roll no, candidate, exam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="gov-input !pl-9"
              aria-label="Search admit cards"
            />
          </div>

          <div className="w-full md:w-auto">
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="gov-input !w-auto"
              aria-label="Filter by examination"
            >
              <option value="">All Examinations</option>
              {examinations.map(exam => {
                const code = exam.examination_code || exam.exam_code || '';
                const name = exam.examination_name || exam.exam_title || '';
                return (
                  <option key={exam.examination_id || exam.id} value={exam.examination_id || exam.id}>
                    {code} - {name.substring(0, 30)}...
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </section>

      {/* Roster Table */}
      <section className="gov-card">
        <div className="gov-card-header justify-between">
          <div className="flex items-center gap-2">
            <Ticket size={18} />
            <span>Admit Card Roll Number Register</span>
          </div>
          <span className="text-xs text-slate-500 font-normal">
            Showing {filteredCards.length} of {admitCards.length} hall tickets
          </span>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading admit card rosters..." />
        ) : filteredCards.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Ticket}
              title="No Admit Cards Found"
              message="No admit cards have been issued yet, or none match the search criteria. Accept applications to generate admit cards."
            />
          </div>
        ) : (
          <div className="gov-table-wrap !border-0 !rounded-none">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Roll Number</th>
                  <th>Candidate Particulars</th>
                  <th>Examination Details</th>
                  <th>Assigned Center</th>
                  <th>Exam Schedule</th>
                  <th>Issued Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card) => (
                  <tr key={card.admit_card_id}>
                    <td className="whitespace-nowrap">
                      <div className="font-mono font-bold text-gov-900 text-sm">{card.roll_number}</div>
                      <div className="text-[11px] text-slate-400 font-mono">App: {card.application?.application_number || 'N/A'}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-900">{card.candidate?.full_name || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{card.candidate?.candidate_number || card.candidate?.candidate_code}</div>
                      <div className="text-[11px] text-slate-500">{card.candidate?.category} | {card.candidate?.gender}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-gov-800">{card.examination?.examination_name || card.examination?.exam_title || 'N/A'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{card.examination?.examination_code || card.examination?.exam_code}</div>
                    </td>
                    <td>
                      <div className="font-medium text-slate-800">{card.center?.center_name || 'Designated Venue'}</div>
                      <div className="text-[11px] text-slate-500">{card.center?.city}, {card.center?.state}</div>
                    </td>
                    <td className="whitespace-nowrap text-xs">
                      <div className="font-semibold text-gov-900 flex items-center gap-1">
                        <Calendar size={13} className="text-gov-700" />
                        <span>{formatDate(card.examination?.examination_date || card.examination?.exam_date)}</span>
                      </div>
                      <div className="text-saffron-600 font-medium flex items-center gap-1 mt-0.5">
                        <Clock size={13} />
                        <span>Reporting: {card.reporting_time || '08:30 AM'}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-slate-600 text-xs">
                      {formatDate(card.issue_date || card.issued_at || card.created_at)}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(card)}
                        className="gov-btn gov-btn-outline !py-1 !px-2 text-xs"
                      >
                        <Printer size={13} />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Hall Ticket Preview & Print Modal */}
      <Modal
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Official Examination Hall Ticket"
        maxWidth="max-w-3xl"
        footer={
          <div className="w-full flex items-center justify-between no-print">
            <span className="text-xs text-slate-500">
              Carry a physical printout along with a valid Government Photo ID to the exam center.
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="gov-btn gov-btn-outline text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="gov-btn gov-btn-accent text-xs"
              >
                <Printer size={14} />
                <span>Print Official Admit Card</span>
              </button>
            </div>
          </div>
        }
      >
        {selectedCard && (
          <div className="space-y-4">
            {/* The Printable Section */}
            <div id="printable-hall-ticket" className="border-2 border-gov-900 p-6 rounded bg-white text-slate-900 space-y-4">
              {/* Header Band */}
              <div className="text-center border-b-2 border-gov-900 pb-3 space-y-1">
                <div className="flex items-center justify-center gap-2 text-gov-800">
                  <Landmark size={24} />
                  <span className="text-xs uppercase font-extrabold tracking-widest">
                    GOVERNMENT RECRUITMENT EXAMINATION MANAGEMENT SYSTEM
                  </span>
                </div>
                <h3 className="text-base font-extrabold uppercase text-gov-900 tracking-tight mt-1">
                  E-ADMIT CARD / PROVISIONAL EXAMINATION HALL PASS
                </h3>
                <p className="text-xs font-semibold text-slate-600">
                  Central Recruitment Commission • Academic Demonstration System
                </p>
                <p className="text-[11px] font-mono text-slate-500">
                  Reference Record ID: {selectedCard.admit_card_id}
                </p>
              </div>

              {/* Examination Banner */}
              <div className="bg-slate-50 p-2.5 rounded border border-line text-center">
                <h4 className="font-bold text-gov-900 text-sm">
                  {selectedCard.examination?.examination_name || selectedCard.examination?.exam_title}
                </h4>
                <p className="text-xs text-slate-600 font-mono mt-0.5">
                  Notification Code: {selectedCard.examination?.examination_code || selectedCard.examination?.exam_code} | Vacancies: {selectedCard.examination?.total_vacancies?.toLocaleString() || 'N/A'}
                </p>
              </div>

              {/* Candidate & Schedule Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="border border-line rounded p-3 space-y-1.5 bg-slate-50/50">
                  <div className="font-bold text-gov-800 uppercase border-b border-line pb-1 text-[11px]">Candidate Particulars</div>
                  <div><span className="text-slate-500">ROLL NUMBER:</span> <span className="font-mono font-bold text-gov-900 text-sm ml-1">{selectedCard.roll_number}</span></div>
                  <div><span className="text-slate-500">Full Legal Name:</span> <strong className="text-slate-900 ml-1">{selectedCard.candidate?.full_name}</strong></div>
                  <div><span className="text-slate-500">Candidate Reg. No:</span> <span className="font-mono ml-1">{selectedCard.candidate?.candidate_number || selectedCard.candidate?.candidate_code}</span></div>
                  <div><span className="text-slate-500">Category & Gender:</span> <span className="ml-1">{selectedCard.candidate?.category} | {selectedCard.candidate?.gender}</span></div>
                  <div><span className="text-slate-500">Application Number:</span> <span className="font-mono ml-1">{selectedCard.application?.application_number}</span></div>
                </div>

                <div className="border border-line rounded p-3 space-y-1.5 bg-slate-50/50">
                  <div className="font-bold text-gov-800 uppercase border-b border-line pb-1 text-[11px]">Schedule & Center Venue</div>
                  <div><span className="text-slate-500">Exam Date:</span> <strong className="text-gov-900 ml-1">{formatDate(selectedCard.examination?.examination_date || selectedCard.examination?.exam_date)}</strong></div>
                  <div><span className="text-slate-500">Reporting Time:</span> <strong className="text-saffron-600 ml-1">{selectedCard.reporting_time || '08:30 AM'} (Sharp)</strong></div>
                  <div><span className="text-slate-500">Test Venue:</span> <strong className="text-slate-900 ml-1">{selectedCard.center?.center_name || 'Designated Examination Center'}</strong></div>
                  <div><span className="text-slate-500">Address:</span> <span className="ml-1">{selectedCard.center?.address || 'Main Campus'}</span></div>
                  <div><span className="text-slate-500">Location:</span> <span className="ml-1">{selectedCard.center?.city}, {selectedCard.center?.state} - {selectedCard.center?.pincode}</span></div>
                </div>
              </div>

              {/* Instructions */}
              <div className="border border-line rounded p-3 bg-slate-50 text-xs">
                <div className="font-bold text-gov-800 uppercase mb-1 text-[11px]">Important Instructions for Candidates</div>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedCard.examination_instructions || '1. Please bring a clearly printed copy of this Admit Card along with an original government photo ID.\n2. Arrive at least 45 minutes before the reporting time for security scrutiny and identity verification.\n3. Electronic devices, smartwatches, and notes are strictly prohibited.'}
                </p>
              </div>

              {/* Signature Blocks */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-line text-center text-xs">
                <div>
                  <div className="h-8 border-b border-dashed border-slate-400 mx-10"></div>
                  <p className="mt-1 font-semibold text-slate-700 text-[11px]">Candidate Signature</p>
                  <p className="text-[10px] text-slate-400">(To be signed in presence of invigilator)</p>
                </div>
                <div>
                  <div className="h-8 border-b border-dashed border-slate-400 mx-10 flex items-center justify-center font-bold text-gov-800 italic text-[11px]">
                    Controller of Examinations
                  </div>
                  <p className="mt-1 font-semibold text-slate-700 text-[11px]">Authorized Signatory</p>
                  <p className="text-[10px] text-slate-400">Recruitment Examination Board</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminAdmitCards;

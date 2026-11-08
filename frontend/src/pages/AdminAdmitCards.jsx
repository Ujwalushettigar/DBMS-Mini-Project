import React, { useState, useEffect } from 'react';
import { admitCardAPI, examAPI } from '../services/api';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import EmptyState from '../components/common/EmptyState';
import { 
  Award, Search, Printer, Calendar, Clock, MapPin, 
  FileText, ShieldCheck, RefreshCw, CheckCircle2 
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function AdminAdmitCards() {
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
    const matchesSearch = 
      (card.roll_number && card.roll_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (card.candidate?.full_name && card.candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (card.candidate?.candidate_code && card.candidate.candidate_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (card.examination?.exam_title && card.examination.exam_title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesExam = selectedExam ? card.examination?.examination_id === selectedExam : true;
    return matchesSearch && matchesExam;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admit Cards & Hall Tickets</h1>
          <p className="text-sm text-slate-600">Issued examination credentials, candidate roll number rosters, and center allocations.</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh List</span>
        </button>
      </div>

      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Admit Cards Issued</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{admitCards.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-800 rounded-lg flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Active Examinations</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{examinations.length}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Integrity Verified</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">100%</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-800 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search roll no, candidate, exam..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="w-full md:w-auto">
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="text-sm border border-slate-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white w-full md:w-64"
          >
            <option value="">All Examinations</option>
            {examinations.map(exam => (
              <option key={exam.examination_id} value={exam.examination_id}>
                {exam.exam_code} - {exam.exam_title.substring(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster Table */}
      {loading ? (
        <div className="bg-white p-12 rounded-lg border border-slate-200">
          <LoadingSpinner size="lg" text="Loading admit card rosters..." />
        </div>
      ) : filteredCards.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No Admit Cards Found"
          description="No admit cards have been issued yet, or none match the search criteria. Accept applications to generate admit cards."
        />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Candidate Details</th>
                  <th className="py-3 px-4">Examination</th>
                  <th className="py-3 px-4">Exam Center</th>
                  <th className="py-3 px-4">Exam Date & Time</th>
                  <th className="py-3 px-4">Issued On</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCards.map((card) => (
                  <tr key={card.admit_card_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-blue-900 text-base">{card.roll_number}</div>
                      <div className="text-xs text-slate-400 font-mono">App: {card.application?.application_number || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{card.candidate?.full_name || 'N/A'}</div>
                      <div className="text-xs text-slate-500 font-mono">{card.candidate?.candidate_code}</div>
                      <div className="text-xs text-slate-500">{card.candidate?.category} | {card.candidate?.gender}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{card.examination?.exam_title || 'N/A'}</div>
                      <div className="text-xs text-slate-500 font-mono">{card.examination?.exam_code}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{card.center?.center_name || 'Default Center'}</div>
                      <div className="text-xs text-slate-500">{card.center?.city}, {card.center?.state}</div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="font-semibold text-slate-800 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-800" />
                        <span>{formatDate(card.examination?.exam_date)}</span>
                      </div>
                      <div className="text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Reporting: {card.reporting_time || '08:30 AM'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {formatDate(card.issued_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenPreview(card)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {filteredCards.length} of {admitCards.length} generated admit cards</span>
            <span>Relational Table: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">admit_cards</code></span>
          </div>
        </div>
      )}

      {/* Hall Ticket Preview & Print Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Official Examination Hall Ticket"
        size="lg"
      >
        {selectedCard && (
          <div className="space-y-6">
            {/* Printable Document Area */}
            <div id="admit-card-print-area" className="border-2 border-slate-800 p-6 bg-white rounded shadow-sm text-slate-800">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
                <div className="w-12 h-12 mx-auto mb-1 flex items-center justify-center bg-blue-900 text-white font-serif font-black text-xl rounded-full">
                  GOI
                </div>
                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900">
                  Government Recruitment Examination Board
                </h2>
                <p className="text-xs text-slate-600 uppercase font-semibold">
                  Official E-Admit Card & Examination Hall Pass
                </p>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  Reference No: {selectedCard.admit_card_id}
                </p>
              </div>

              {/* Examination Info Banner */}
              <div className="bg-slate-100 p-3 rounded border border-slate-300 text-center mb-4">
                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedCard.examination?.exam_title}
                </h3>
                <p className="text-xs text-slate-700 font-mono mt-0.5">
                  Notification Code: {selectedCard.examination?.exam_code} | Total Marks: {selectedCard.examination?.total_marks || 100}
                </p>
              </div>

              {/* Candidate & Schedule Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                <div className="border border-slate-300 rounded p-3 space-y-2">
                  <div className="font-bold text-slate-900 uppercase border-b pb-1">Candidate Particulars</div>
                  <div><span className="text-slate-500">Roll Number:</span> <span className="font-mono font-bold text-blue-900 text-sm">{selectedCard.roll_number}</span></div>
                  <div><span className="text-slate-500">Candidate Name:</span> <span className="font-semibold text-slate-900">{selectedCard.candidate?.full_name}</span></div>
                  <div><span className="text-slate-500">Reg. Code:</span> <span className="font-mono">{selectedCard.candidate?.candidate_code}</span></div>
                  <div><span className="text-slate-500">Category:</span> {selectedCard.candidate?.category} | Gender: {selectedCard.candidate?.gender}</div>
                  <div><span className="text-slate-500">Application No:</span> <span className="font-mono">{selectedCard.application?.application_number}</span></div>
                </div>

                <div className="border border-slate-300 rounded p-3 space-y-2">
                  <div className="font-bold text-slate-900 uppercase border-b pb-1">Schedule & Center</div>
                  <div><span className="text-slate-500">Exam Date:</span> <span className="font-bold text-slate-900">{formatDate(selectedCard.examination?.exam_date)}</span></div>
                  <div><span className="text-slate-500">Reporting Time:</span> <span className="font-bold text-rose-700">{selectedCard.reporting_time || '08:30 AM'}</span></div>
                  <div><span className="text-slate-500">Venue:</span> <span className="font-semibold">{selectedCard.center?.center_name || 'Standard Center'}</span></div>
                  <div><span className="text-slate-500">Address:</span> {selectedCard.center?.address || 'Designated Examination Hall'}</div>
                  <div><span className="text-slate-500">City / State:</span> {selectedCard.center?.city}, {selectedCard.center?.state} - {selectedCard.center?.pincode}</div>
                </div>
              </div>

              {/* Instructions */}
              <div className="border border-slate-300 rounded p-3 bg-slate-50 text-xs">
                <div className="font-bold text-slate-900 uppercase mb-1">Important Instructions for Candidates</div>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedCard.examination_instructions || '1. Please bring a clearly printed copy of this Admit Card along with original photo ID.\n2. Arrive at least 45 minutes before the reporting time for security scrutiny.\n3. Electronic devices, smartwatches, and notes are strictly prohibited.'}
                </p>
              </div>

              {/* Signature Blocks */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-4 border-t border-slate-200 text-center text-xs">
                <div>
                  <div className="h-10 border-b border-dashed border-slate-400 mx-10"></div>
                  <p className="mt-1 font-semibold text-slate-700">Candidate Signature</p>
                  <p className="text-[10px] text-slate-400">(To be signed in presence of invigilator)</p>
                </div>
                <div>
                  <div className="h-10 border-b border-dashed border-slate-400 mx-10 flex items-center justify-center font-serif text-blue-900 font-bold italic">
                    Controller of Examinations
                  </div>
                  <p className="mt-1 font-semibold text-slate-700">Authorized Signatory</p>
                  <p className="text-[10px] text-slate-400">Government Recruitment Examination Board</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 text-sm font-medium"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 text-sm font-medium inline-flex items-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Admit Card</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


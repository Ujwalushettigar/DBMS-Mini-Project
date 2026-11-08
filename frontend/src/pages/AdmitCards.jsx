import React, { useEffect, useState } from 'react';
import { admitCardAPI } from '../services/api';
import { formatDate, formatTime } from '../utils/helpers';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { CreditCard, Printer, Building2, User, Calendar, Clock, MapPin, ShieldCheck } from 'lucide-react';

export const AdmitCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await admitCardAPI.getMyCards();
        if (res.success && res.data) {
          setCards(res.data);
        }
      } catch (err) {
        console.warn('Error fetching admit cards:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const handlePrint = (card) => {
    setSelectedCard(card);
    setPrintModalOpen(true);
  };

  const executePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner message="Checking issued examination admit cards..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Examination Admit Cards (Hall Tickets)</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Download and print your official examination admit card. Carry a physical printout along with a valid Government Photo ID to the exam center.
        </p>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          title="No admit cards issued yet"
          description="Admit cards are generated once your application is formally accepted and an examination center is assigned by the commission."
          icon={CreditCard}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div
              key={card.admit_card_id}
              className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-mono text-xs font-bold text-blue-900 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded">
                  {card.roll_number}
                </span>
                <span className="text-[11px] text-slate-500">
                  Issued: <strong>{formatDate(card.issue_date)}</strong>
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {card.examination_name || card.application?.examination?.examination_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Code: {card.examination_code || card.application?.examination?.examination_code}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Examination Date:</span>
                  <span className="font-semibold text-slate-800">
                    {formatDate(card.examination_date || card.application?.examination?.examination_date)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Reporting Time:</span>
                  <span className="font-semibold text-blue-900">
                    {formatTime(card.reporting_time)}
                  </span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400 block text-[11px]">Center Venue:</span>
                  <span className="font-medium text-slate-800">
                    {card.center_name || card.application?.exam_center?.center_name} ({card.city || card.application?.exam_center?.city})
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handlePrint(card)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View & Print Admit Card</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Printable Hall Ticket Modal */}
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        title="Official Examination Hall Ticket"
        maxWidth="max-w-3xl"
      >
        {selectedCard && (
          <div className="space-y-4">
            {/* The Printable Section */}
            <div id="printable-hall-ticket" className="border-2 border-slate-900 p-6 rounded bg-white text-slate-900 space-y-5">
              {/* Official Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="text-xs uppercase font-extrabold tracking-widest text-slate-700">
                  GOVERNMENT OF INDIA • PUBLIC RECRUITMENT COMMISSION
                </div>
                <h2 className="text-lg font-black uppercase text-blue-950 tracking-tight">
                  E-ADMIT CARD / PROVISIONAL HALL TICKET
                </h2>
                <p className="text-xs font-semibold text-slate-600">
                  {selectedCard.examination_name || selectedCard.application?.examination?.examination_name}
                </p>
              </div>

              {/* Barcode & Numbers row */}
              <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-3 font-mono">
                <div>
                  <span className="text-slate-500">Admit Card No: </span>
                  <strong>{selectedCard.admit_card_number}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Roll Number: </span>
                  <strong className="text-blue-900 text-sm">{selectedCard.roll_number}</strong>
                </div>
              </div>

              {/* Candidate Info Grid */}
              <div className="grid grid-cols-3 gap-4 text-xs border-b border-slate-200 pb-4">
                <div className="space-y-1.5 col-span-2">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Candidate Full Name:</span>
                    <strong className="text-sm">{selectedCard.candidate_name || selectedCard.application?.candidate?.full_name}</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Candidate Reg No:</span>
                      <strong>{selectedCard.candidate_number || selectedCard.application?.candidate?.candidate_number}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Application No:</span>
                      <strong>{selectedCard.application?.application_number}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Category:</span>
                      <strong>{selectedCard.category || selectedCard.application?.candidate?.category}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Gender:</span>
                      <strong>{selectedCard.gender || selectedCard.application?.candidate?.gender}</strong>
                    </div>
                  </div>
                </div>

                {/* Candidate Photo Placeholder */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded p-2 text-center bg-slate-50">
                  <User className="w-12 h-12 text-slate-300 mb-1" />
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Affixed Candidate Photograph</span>
                </div>
              </div>

              {/* Venue & Schedule Section */}
              <div className="bg-slate-50 p-4 rounded border border-slate-200 text-xs space-y-2">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Examination Schedule & Allocated Venue
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Examination Date:</span>
                    <strong className="text-sm text-blue-950">
                      {formatDate(selectedCard.examination_date || selectedCard.application?.examination?.examination_date)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Gate Closing / Reporting Time:</span>
                    <strong className="text-sm text-rose-700">
                      {formatTime(selectedCard.reporting_time)} (Sharp)
                    </strong>
                  </div>
                  <div className="col-span-2 pt-1">
                    <span className="text-slate-500 block text-[11px]">Designated Test Center Address:</span>
                    <strong className="block text-slate-900">
                      {selectedCard.center_name || selectedCard.application?.exam_center?.center_name}
                    </strong>
                    <span className="text-slate-600 block mt-0.5">
                      {selectedCard.center_address || selectedCard.application?.exam_center?.address}, {selectedCard.city || selectedCard.application?.exam_center?.city}, {selectedCard.state || selectedCard.application?.exam_center?.state}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-[11px] text-slate-600 space-y-1.5 border-t border-slate-200 pt-3">
                <h5 className="font-bold text-slate-800 uppercase">Important Candidate Instructions:</h5>
                <p className="whitespace-pre-line leading-relaxed">
                  {selectedCard.examination_instructions}
                </p>
              </div>

              {/* Signature Blocks */}
              <div className="pt-6 flex justify-between items-end text-xs text-center border-t border-slate-200">
                <div className="border-t border-slate-400 pt-1 w-44">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">Candidate Signature</span>
                </div>
                <div className="border-t border-slate-400 pt-1 w-44">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">Controller of Examinations</span>
                </div>
              </div>
            </div>

            {/* Modal Action Controls */}
            <div className="flex justify-between items-center pt-2 no-print">
              <span className="text-xs text-slate-500">
                Use your browser's Print dialog to save as PDF or print on physical paper.
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => setPrintModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={executePrint}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Hall Ticket</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdmitCards;


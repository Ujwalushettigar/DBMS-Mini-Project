import React, { useEffect, useState } from 'react';
import { admitCardAPI } from '../services/api';
import { formatDate, formatTime } from '../utils/helpers';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { PageHeader } from '../components/common/PageHeader';
import { Ticket, Printer, User, Clock, Calendar, MapPin, Download } from 'lucide-react';

export function AdmitCards() {
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

  if (loading) return <LoadingSpinner label="Checking issued examination admit cards..." />;

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Examination Admit Cards"
        subtitle="Download and print official provisional e-admit cards for verified applications"
        crumbs={[{ label: 'Dashboard', to: '/candidate/dashboard' }, { label: 'Admit Cards' }]}
      />

      {cards.length === 0 ? (
        <div className="gov-card p-4">
          <EmptyState
            title="No admit cards issued yet"
            message="Admit cards are generated once your application is formally accepted and test center seating is allocated by the commission."
            icon={Ticket}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => {
            const examName = card.examination_name || card.application?.examination?.examination_name;
            const examCode = card.examination_code || card.application?.examination?.examination_code;
            const examDate = card.examination_date || card.application?.examination?.examination_date;
            const centerName = card.center_name || card.application?.exam_center?.center_name;
            const centerCity = card.city || card.application?.exam_center?.city;

            return (
              <div
                key={card.admit_card_id}
                className="gov-card p-5 space-y-4 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <span className="font-mono text-xs font-bold text-gov-800 px-2 py-0.5 bg-gov-50 border border-line rounded">
                      ROLL NO: {card.roll_number}
                    </span>
                    <span className="text-xs text-slate-500">
                      Issued: <strong>{formatDate(card.issue_date)}</strong>
                    </span>
                  </div>

                  <div>
                    <h2 className="font-bold text-gov-900 text-sm leading-snug">
                      {examName}
                    </h2>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      Notice Code: {examCode}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded border border-line">
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px] font-medium">Exam Date:</span>
                      <span className="font-semibold text-gov-800">
                        {formatDate(examDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px] font-medium">Reporting Time:</span>
                      <span className="font-semibold text-saffron-600">
                        {formatTime(card.reporting_time)} (Sharp)
                      </span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-line">
                      <span className="text-slate-500 block uppercase text-[10px] font-medium">Allocated Center:</span>
                      <span className="font-medium text-slate-800">
                        {centerName} ({centerCity})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handlePrint(card)}
                    className="gov-btn gov-btn-primary text-xs"
                  >
                    <Printer size={14} />
                    <span>View & Print Admit Card</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Official Printable Hall Ticket Modal */}
      <Modal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
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
                onClick={() => setPrintModalOpen(false)}
                className="gov-btn gov-btn-outline text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={executePrint}
                className="gov-btn gov-btn-accent text-xs"
              >
                <Printer size={14} />
                <span>Print / Download Admit Card</span>
              </button>
            </div>
          </div>
        }
      >
        {selectedCard && (
          <div className="space-y-4">
            {/* The Printable Section */}
            <div id="printable-hall-ticket" className="border-2 border-gov-900 p-6 rounded bg-white text-slate-900 space-y-4">
              {/* Official Header Band */}
              <div className="text-center border-b-2 border-gov-900 pb-3 space-y-1">
                <div className="text-[11px] uppercase font-bold tracking-widest text-gov-800">
                  GOVERNMENT RECRUITMENT EXAMINATION MANAGEMENT SYSTEM (GREMS)
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  CENTRAL RECRUITMENT COMMISSION • EXAMINATION CONTROLLER WING
                </div>
                <h3 className="text-base font-extrabold uppercase text-gov-900 tracking-tight mt-1">
                  E-ADMIT CARD / PROVISIONAL EXAMINATION HALL TICKET
                </h3>
                <p className="text-xs font-bold text-gov-700">
                  {selectedCard.examination_name || selectedCard.application?.examination?.examination_name}
                </p>
              </div>

              {/* Barcode & Numbers Row */}
              <div className="flex justify-between items-center text-xs border-b border-line pb-2 font-mono">
                <div>
                  <span className="text-slate-500">Admit Card No: </span>
                  <strong>{selectedCard.admit_card_number}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">ROLL NUMBER: </span>
                  <strong className="text-gov-900 text-base">{selectedCard.roll_number}</strong>
                </div>
              </div>

              {/* Candidate Info Grid with Photo Box */}
              <div className="grid grid-cols-4 gap-4 text-xs border-b border-line pb-4">
                <div className="col-span-3 space-y-2">
                  <table className="w-full text-xs border-collapse">
                    <tbody>
                      <tr className="border-b border-line/60">
                        <td className="py-1 font-semibold text-slate-500 w-1/3">Candidate Full Name:</td>
                        <td className="py-1 font-bold text-slate-900 text-sm">
                          {selectedCard.candidate_name || selectedCard.application?.candidate?.full_name}
                        </td>
                      </tr>
                      <tr className="border-b border-line/60">
                        <td className="py-1 font-semibold text-slate-500">Registration Number:</td>
                        <td className="py-1 font-mono font-bold text-gov-800">
                          {selectedCard.candidate_number || selectedCard.application?.candidate?.candidate_number}
                        </td>
                      </tr>
                      <tr className="border-b border-line/60">
                        <td className="py-1 font-semibold text-slate-500">Application Number:</td>
                        <td className="py-1 font-mono font-medium text-slate-800">
                          {selectedCard.application?.application_number}
                        </td>
                      </tr>
                      <tr className="border-b border-line/60">
                        <td className="py-1 font-semibold text-slate-500">Social Category & Gender:</td>
                        <td className="py-1 text-slate-800">
                          {selectedCard.category || selectedCard.application?.candidate?.category} • {selectedCard.gender || selectedCard.application?.candidate?.gender}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Candidate Photo Box (35mm x 45mm ratio) */}
                <div className="col-span-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-400 rounded p-2 text-center bg-slate-50 min-h-[140px]">
                  <User size={36} className="text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-500 font-semibold uppercase leading-tight">
                    Affix Recent Passport Photo (35mm x 45mm)
                  </span>
                </div>
              </div>

              {/* Venue & Schedule Section */}
              <div className="bg-slate-50 p-4 rounded border border-line text-xs space-y-2">
                <h4 className="font-bold text-gov-800 uppercase tracking-wider text-[11px] border-b border-line pb-1">
                  Examination Schedule & Allocated Venue
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Examination Date:</span>
                    <strong className="text-sm text-gov-900">
                      {formatDate(selectedCard.examination_date || selectedCard.application?.examination?.examination_date)}
                    </strong>
                  </div>
                  <div className="bg-orange-50 p-2 rounded border border-saffron-500/30">
                    <span className="text-saffron-600 block text-[11px] font-bold">Reporting / Gate Closing Time:</span>
                    <strong className="text-sm text-saffron-600">
                      {formatTime(selectedCard.reporting_time)} (Sharp)
                    </strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-line">
                    <span className="text-slate-500 block text-[11px]">Designated Test Center Venue:</span>
                    <strong className="block text-slate-900 text-xs">
                      {selectedCard.center_name || selectedCard.application?.exam_center?.center_name}
                    </strong>
                    <span className="text-slate-600 block text-[11px] mt-0.5">
                      {selectedCard.center_address || selectedCard.application?.exam_center?.address}, {selectedCard.city || selectedCard.application?.exam_center?.city}, {selectedCard.state || selectedCard.application?.exam_center?.state} - {selectedCard.pincode || selectedCard.application?.exam_center?.pincode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Candidate Instructions */}
              <div className="text-[11px] text-slate-600 space-y-1.5 border-t border-line pt-3">
                <h5 className="font-bold text-slate-800 uppercase">Mandatory Examination Day Instructions:</h5>
                <ul className="list-disc space-y-1 pl-5 text-slate-700">
                  <li>Candidates must carry this printed admit card and an original government photo ID (Aadhaar, Voter ID, PAN, Driving Licence).</li>
                  <li>Late entry past the reporting time is strictly prohibited by examination center authorities.</li>
                  <li>Electronic devices, smart watches, mobile phones, and calculators are strictly forbidden inside the examination hall.</li>
                  <li>Signatures must be appended in the presence of the room invigilator on the examination day.</li>
                </ul>
              </div>

              {/* Signature Blocks */}
              <div className="pt-8 flex justify-between items-end text-xs text-center border-t border-line">
                <div className="border-t border-slate-600 pt-1 w-44">
                  <span className="text-[10px] uppercase font-semibold text-slate-600">Candidate Signature</span>
                </div>
                <div className="border-t border-slate-600 pt-1 w-44">
                  <span className="text-[10px] uppercase font-semibold text-slate-600">Controller of Examinations</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdmitCards;

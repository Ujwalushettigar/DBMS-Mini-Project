import React, { useEffect, useState } from 'react';
import { resultAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Award, CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';

export const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await resultAPI.getMyResults();
        if (res.success && res.data) {
          setResults(res.data);
        }
      } catch (err) {
        console.warn('Error fetching results:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return <LoadingSpinner message="Checking declared examination scorecards..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Declared Examination Results & Scorecards</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Access published scorecards, normalized marks, percentiles, all-India / state merit ranks, and qualification verdicts.
        </p>
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="No results published yet"
          description="Examination scorecards will appear here once evaluation is completed and declared by the recruitment board."
          icon={Award}
        />
      ) : (
        <div className="space-y-4">
          {results.map((res) => (
            <div
              key={res.result_id}
              className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4 hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-blue-900 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded">
                    {res.examination_code || res.application?.examination?.examination_code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {res.examination_name || res.application?.examination?.examination_name}
                  </h3>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge size="lg">{res.result_status}</Badge>
                  <span className="text-xs text-slate-500">
                    Declared: <strong>{formatDate(res.published_at)}</strong>
                  </span>
                </div>
              </div>

              {/* Scorecard Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Marks Obtained</span>
                  <span className="text-xl font-extrabold text-blue-950 mt-0.5 block">
                    {Number(res.marks_obtained).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400">Out of {Number(res.maximum_marks).toFixed(2)}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Percentage</span>
                  <span className="text-xl font-extrabold text-emerald-800 mt-0.5 block">
                    {res.percentage}%
                  </span>
                  <span className="text-[10px] text-slate-400">Normalized score</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Merit Rank</span>
                  <span className="text-xl font-extrabold text-amber-700 mt-0.5 block">
                    {res.rank ? `#${res.rank}` : '—'}
                  </span>
                  <span className="text-[10px] text-slate-400">Merit list standing</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Application Number</span>
                  <span className="text-xs font-mono font-bold text-slate-800 mt-1.5 block">
                    {res.application?.application_number}
                  </span>
                </div>
              </div>

              {res.remarks && (
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded text-xs text-slate-700">
                  <span className="font-semibold text-slate-900 mr-1">Board Evaluation Remark:</span>
                  {res.remarks}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;


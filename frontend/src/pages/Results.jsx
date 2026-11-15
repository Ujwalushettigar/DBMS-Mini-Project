import React, { useEffect, useState } from 'react';
import { resultAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { Award, FileText, CheckCircle2 } from 'lucide-react';

export function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await resultAPI.getMyResults();
        if (res.success && res.data) {
          // Only show scorecards where is_published is true (or truthy if field is present)
          const publishedRows = res.data.filter((r) => r.is_published === undefined || r.is_published === true);
          setResults(publishedRows);
        }
      } catch (err) {
        console.warn('Error fetching results:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return <LoadingSpinner label="Checking declared examination scorecards..." />;

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Examination Results & Merit Scorecards"
        subtitle="Access published evaluation scorecards, marks obtained, percentage scores, and verified rank standings"
        crumbs={[{ label: 'Dashboard', to: '/candidate/dashboard' }, { label: 'Results' }]}
      />

      {results.length === 0 ? (
        <div className="gov-card p-4">
          <EmptyState
            title="No published examination scorecards yet"
            message="Results and merit scorecards will appear here once officially validated and published by the recruitment board."
            icon={Award}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {results.map((res) => {
            const examCode = res.examination_code || res.application?.examination?.examination_code;
            const examName = res.examination_name || res.application?.examination?.examination_name;
            const marksObtained = Number(res.marks_obtained || 0).toFixed(2);
            const maxMarks = Number(res.maximum_marks || 100).toFixed(2);

            return (
              <article
                key={res.result_id}
                className="gov-card overflow-hidden shadow-card"
              >
                <div className="gov-card-header justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-gov-800 bg-white border border-line px-2 py-0.5 rounded">
                      {examCode}
                    </span>
                    <span className="font-bold text-gov-900">{examName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge size="lg">{res.result_status}</Badge>
                    <span className="text-xs text-slate-500">
                      Declared: <strong>{formatDate(res.published_at)}</strong>
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Detailed Marks Table */}
                  <div className="gov-table-wrap">
                    <table className="gov-table">
                      <thead>
                        <tr>
                          <th>Application Number</th>
                          <th>Marks Obtained</th>
                          <th>Maximum Marks</th>
                          <th>Percentage (%)</th>
                          <th>All-India / State Merit Rank</th>
                          <th>Final Verdict</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="font-mono font-bold text-gov-900">
                            {res.application?.application_number || 'N/A'}
                          </td>
                          <td className="font-bold text-base text-gov-900">
                            {marksObtained}
                          </td>
                          <td className="text-slate-600">
                            {maxMarks}
                          </td>
                          <td className="font-bold text-base text-india-green">
                            {res.percentage}%
                          </td>
                          <td className="font-bold text-base text-saffron-600">
                            {res.rank ? `#${res.rank}` : '—'}
                          </td>
                          <td>
                            <Badge>{res.result_status}</Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {res.remarks && (
                    <div className="p-3 bg-gov-50 border border-gov-200 rounded text-xs text-slate-700">
                      <span className="font-semibold text-gov-800 mr-1.5">Official Board Remarks:</span>
                      <span>{res.remarks}</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Results;

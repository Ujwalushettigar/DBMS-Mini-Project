import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { examAPI } from '../services/api';
import { formatDate, formatCurrency } from '../utils/helpers';
import { Badge } from '../components/common/Badge';
import {
  Building2,
  FileText,
  CreditCard,
  Award,
  CheckCircle2,
  Calendar,
  Users,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const Home = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await examAPI.getAll({ status: 'published' });
        if (res.success && res.data) {
          setExams(res.data.slice(0, 3));
        }
      } catch (err) {
        console.warn('Notice loading exams:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-xl p-8 sm:p-12 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-700/60 text-xs font-semibold uppercase tracking-wider text-blue-200">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Public Sector Recruitment Commission Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Centralized Government Recruitment Examination Management System
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Welcome to the official portal for competitive government recruitment examinations. Browse active notifications, register candidate profiles, apply online, download admit cards, and track declared merit results.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/examinations"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-md text-sm font-semibold text-white bg-blue-700 hover:bg-blue-600 shadow-sm transition"
            >
              <span>View Open Examinations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-md text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            >
              <span>Candidate Registration</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Announcements Banner */}
      <section className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3 text-amber-900 shadow-sm">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <span className="font-bold uppercase tracking-wider mr-2 text-amber-800">Important Notice:</span>
          Applications are open for SSC-CGL-2026 and UPSC-CSE-2026 examinations. Ensure your educational qualifications are updated in your candidate profile before submitting applications.
        </div>
      </section>

      {/* Featured / Active Examinations Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Recruitment Notices</h2>
            <p className="text-xs text-slate-500">Recently published government examination advertisements</p>
          </div>
          <Link
            to="/examinations"
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>All Examinations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-slate-500">Loading open examinations...</div>
        ) : exams.length === 0 ? (
          <div className="text-center py-8 bg-white border border-slate-200 rounded-lg text-slate-500 text-sm">
            No examinations currently open for online application.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div
                key={exam.examination_id}
                className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-900 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded">
                      {exam.examination_code}
                    </span>
                    <Badge>{exam.examination_status}</Badge>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                    {exam.examination_name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {exam.conducting_authority}
                  </p>
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Vacancies:</span>
                      <span className="font-semibold text-slate-800">{exam.total_vacancies.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Application Fee:</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(exam.application_fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Closing Date:</span>
                      <span className="font-semibold text-slate-800">{formatDate(exam.application_end_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <Link
                    to={`/examinations/${exam.examination_id}`}
                    className="w-full text-center block px-3 py-2 rounded bg-slate-100 hover:bg-blue-900 hover:text-white text-xs font-semibold text-slate-700 transition"
                  >
                    View Details & Eligibility
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* End-to-End Application Workflow */}
      <section className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Application & Selection Lifecycle</h2>
          <p className="text-xs text-slate-500">Step-by-step procedure for candidates applying through GREMS</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs">1</div>
            <h4 className="font-semibold text-sm text-slate-800">Register Account</h4>
            <p className="text-xs text-slate-500">Sign up and create your verified candidate demographic profile.</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs">2</div>
            <h4 className="font-semibold text-sm text-slate-800">Add Qualifications</h4>
            <p className="text-xs text-slate-500">Record your SSLC, PUC, Degree, and Diploma academic records.</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs">3</div>
            <h4 className="font-semibold text-sm text-slate-800">Apply Online</h4>
            <p className="text-xs text-slate-500">Select published notices and choose your preferred examination center venue.</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs">4</div>
            <h4 className="font-semibold text-sm text-slate-800">Admit Card</h4>
            <p className="text-xs text-slate-500">Download and print your official hall ticket with allocated roll number.</p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs">5</div>
            <h4 className="font-semibold text-sm text-slate-800">Check Results</h4>
            <p className="text-xs text-slate-500">Access published marks, national/state percentile, and selection rank.</p>
          </div>
        </div>
      </section>

      {/* Academic Highlights Banner */}
      <section className="bg-slate-900 text-slate-300 rounded-lg p-6 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-bold text-sm">Academic DBMS Project Implementation</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Powered by 9 normalized relational tables (3NF), composite keys, triggers, constraints, and PostgreSQL on Supabase.
          </p>
        </div>
        <Link
          to="/about"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-semibold border border-slate-700 whitespace-nowrap transition"
        >
          View System Architecture
        </Link>
      </section>
    </div>
  );
};

export default Home;


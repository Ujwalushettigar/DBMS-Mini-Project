import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, IdCard, FileSignature, Ticket, ShieldCheck, ChevronRight } from 'lucide-react';
import { examAPI } from '../services/api';
import { NewsTicker } from '../components/layout/NewsTicker';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate } from '../utils/helpers';
import { heroImage } from '../data/imageCredits';

const services = [
  { icon: UserPlus, title: 'Create Account & Login', text: 'Register with a valid email address and secure your candidate account.', to: '/register', cta: 'Register / Login' },
  { icon: IdCard, title: 'Candidate Profile', text: 'Fill in personal details and educational qualifications once.', to: '/candidate/profile', cta: 'Open Profile' },
  { icon: FileSignature, title: 'Apply for Examination', text: 'Check eligibility and apply online for open recruitment examinations.', to: '/examinations', cta: 'View Examinations' },
  { icon: Ticket, title: 'Admit Card & Results', text: 'Download your admit card and view published scorecards.', to: '/candidate/admit-cards', cta: 'Candidate Services' },
];

const steps = [
  'Create your account and verify your email',
  'Complete your profile and add qualifications',
  'Select an examination and submit the application',
  'Download admit card and check the result',
];

const instructions = [
  'Applications are accepted online only.',
  'Keep your email address and mobile number active.',
  'Fill your profile carefully; changes after submission may be restricted.',
  'Apply before the last date shown against each examination.',
  'Download and carry the admit card on the examination day.',
  'Results are visible only after the administrator publishes them.',
];

function statusOf(exam) {
  const now = new Date();
  if (now < new Date(exam.application_start_date)) return { label: 'Upcoming', variant: 'info' };
  if (now > new Date(exam.application_end_date)) return { label: 'Closed', variant: 'danger' };
  return { label: 'Open', variant: 'success' };
}

export function Home() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    examAPI.getAll()
      .then((res) => {
        const rows = res?.data ?? res ?? [];
        if (alive) setExams(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (alive) setExams([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const tickerItems = exams.slice(0, 6).map((e) => `${e.examination_name || e.exam_name} - Last date to apply: ${formatDate(e.application_end_date)}`);

  return (
    <div className="space-y-6">
      <NewsTicker items={tickerItems.length ? tickerItems : ['Recruitment notifications updated daily. Review eligibility criteria before applying.']} />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden rounded shadow-card">
        <img
          src="/images/hero/hero-1280.jpg"
          srcSet={heroImage.widths.map((w) => `/images/hero/hero-${w}.jpg ${w}w`).join(', ')}
          sizes="(min-width: 1280px) 1280px, 100vw"
          width={1920}
          height={Math.round(1920 / heroImage.ratio)}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
        />
        {/* Navy overlay keeps white text at WCAG AA contrast over any photo */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gov-900/90 via-gov-800/75 to-gov-700/40" aria-hidden="true" />

        <div className="px-6 py-12 pb-14 text-white sm:py-16 lg:py-20">
          <h1 className="max-w-2xl text-2xl font-bold !text-white sm:text-4xl">Online Application Portal</h1>
          <p className="mt-3 max-w-2xl text-sm text-gov-100 sm:text-base">
            Apply for government recruitment examinations, track your application and download your admit card from one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/login" className="gov-btn gov-btn-accent">Login</Link>
            <Link to="/register" className="gov-btn bg-white text-gov-800 hover:bg-gov-50">New Registration</Link>
          </div>
        </div>

        <p className="absolute bottom-1 right-2 max-w-[90%] rounded bg-black/50 px-2 py-0.5 text-right text-[10px] leading-tight text-white/90">
          Photo: {heroImage.author} /{' '}
          <a className="underline" href={heroImage.sourceUrl} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>,{' '}
          <a className="underline" href={heroImage.licenseUrl} target="_blank" rel="noopener noreferrer">{heroImage.license}</a>
        </p>
      </section>

      {/* 4 Service Cards */}
      <section aria-label="Services" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {services.map(({ icon: Icon, title, text, to, cta }) => (
          <article key={title} className="gov-card flex flex-col border-t-4 border-gov-700 p-4 transition hover:shadow-lg">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gov-50 text-gov-700">
              <Icon size={24} />
            </span>
            <h2 className="text-base font-bold text-gov-800">{title}</h2>
            <p className="mt-1 flex-1 text-sm text-slate-600">{text}</p>
            <Link to={to} className="gov-link mt-3 inline-flex items-center gap-1 text-sm font-semibold">
              {cta} <ChevronRight size={14} />
            </Link>
          </article>
        ))}
      </section>

      {/* Notices & Instructions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="gov-section-title">Latest Examination Notices</h2>
          {loading ? (
            <LoadingSpinner label="Loading examination notices..." />
          ) : exams.length === 0 ? (
            <div className="gov-card">
              <EmptyState title="No examination notices published yet" message="Check back later for newly announced examinations." />
            </div>
          ) : (
            <div className="gov-table-wrap">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Examination</th>
                    <th>Authority</th>
                    <th>Last Date</th>
                    <th>Vacancies</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((e) => {
                    const s = statusOf(e);
                    const code = e.examination_code || e.exam_code;
                    const name = e.examination_name || e.exam_name;
                    return (
                      <tr key={e.examination_id || e.id || code}>
                        <td className="whitespace-nowrap font-mono text-xs">{code}</td>
                        <td className="font-medium">
                          <Link to={`/examinations/${e.examination_id || e.id}`} className="gov-link">
                            {name}
                          </Link>
                        </td>
                        <td>{e.conducting_authority || 'Central Recruitment Commission'}</td>
                        <td className="whitespace-nowrap">{formatDate(e.application_end_date)}</td>
                        <td>{e.total_vacancies ?? '—'}</td>
                        <td><Badge variant={s.variant}>{s.label}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="gov-card">
            <h2 className="gov-card-header !text-base"><ShieldCheck size={18} /> Important Instructions</h2>
            <ul className="list-disc space-y-1.5 px-8 py-4 text-sm text-slate-700">
              {instructions.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </div>
          <div className="gov-card border-l-4 border-saffron-500 p-4 text-sm">
            <h2 className="mb-1 text-base font-bold text-gov-800">Help Desk</h2>
            <p className="text-slate-700">helpdesk@grems.example</p>
            <p className="text-slate-700">1800-000-0000 (demo number)</p>
            <p className="text-slate-500 text-xs mt-1">Mon-Fri, 10:00 AM - 5:00 PM</p>
          </div>
        </aside>
      </div>

      {/* How to Apply */}
      <section aria-label="How to apply">
        <h2 className="gov-section-title">How to Apply</h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s} className="gov-card flex items-start gap-3 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-saffron-500 font-bold text-white">
                {i + 1}
              </span>
              <span className="text-sm text-slate-700">{s}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default Home;

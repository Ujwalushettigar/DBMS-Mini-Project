import React from 'react';
import { Database, ShieldCheck, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';

export function About() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="About GREMS Portal"
        subtitle="Academic DBMS mini project architecture and recruitment lifecycle overview"
        crumbs={[{ label: 'About' }]}
      />

      {/* Overview Card */}
      <section className="gov-card">
        <div className="gov-card-header">
          <span>Government Recruitment Examination Management System</span>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-slate-700 text-sm leading-relaxed">
            GREMS is an academic full-stack DBMS application engineered to demonstrate relational database architecture, normal forms (1NF to 3NF), entity constraints, transactional integrity, and role-based recruitment management.
          </p>
          <p className="text-slate-600 text-xs leading-relaxed">
            This platform models the complete recruitment lifecycle from notification issuance, candidate registration, and educational qualification verification to examination application scrutiny, center capacity validation, admit card generation, and merit scorecard publishing.
          </p>
        </div>
      </section>

      {/* Relational Database Highlights */}
      <section className="gov-card">
        <div className="gov-card-header">
          <Database size={18} />
          <span>Academic Database Architecture (PostgreSQL / Supabase)</span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded border border-line bg-slate-50 space-y-2">
              <h3 className="font-bold text-gov-800 text-sm">9 Core Relational Entities</h3>
              <p className="text-slate-600 leading-relaxed">
                Implemented using strict primary/foreign keys: <code className="font-mono text-gov-700">profiles</code>, <code className="font-mono text-gov-700">candidates</code>, <code className="font-mono text-gov-700">educational_qualifications</code>, <code className="font-mono text-gov-700">examinations</code>, <code className="font-mono text-gov-700">exam_centers</code>, <code className="font-mono text-gov-700">examination_centers</code> (Composite PK junction table), <code className="font-mono text-gov-700">applications</code>, <code className="font-mono text-gov-700">admit_cards</code>, and <code className="font-mono text-gov-700">results</code>.
              </p>
            </div>

            <div className="p-4 rounded border border-line bg-slate-50 space-y-2">
              <h3 className="font-bold text-gov-800 text-sm">Third Normal Form (3NF) Compliance</h3>
              <p className="text-slate-600 leading-relaxed">
                Eliminated insertion, update, and deletion anomalies. No multi-valued attributes in single columns; transitive dependencies removed through relational foreign key joins.
              </p>
            </div>

            <div className="p-4 rounded border border-line bg-slate-50 space-y-2">
              <h3 className="font-bold text-gov-800 text-sm">Duplicate Application Prevention</h3>
              <p className="text-slate-600 leading-relaxed">
                Enforced at the database layer via compound unique constraint: <code className="font-mono text-gov-700">UNIQUE(candidate_id, examination_id)</code> on the <code className="font-mono text-gov-700">applications</code> table.
              </p>
            </div>

            <div className="p-4 rounded border border-line bg-slate-50 space-y-2">
              <h3 className="font-bold text-gov-800 text-sm">Venue Capacity Enforcement</h3>
              <p className="text-slate-600 leading-relaxed">
                PostgreSQL trigger <code className="font-mono text-gov-700">validate_center_allocation_capacity</code> automatically verifies that <code className="font-mono text-gov-700">allocated_capacity</code> does not exceed the test center's <code className="font-mono text-gov-700">total_capacity</code>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Conducting Authorities */}
      <section className="gov-card">
        <div className="gov-card-header">
          <ShieldCheck size={18} />
          <span>Simulated Recruitment Authorities</span>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500">
            The system models multi-agency notifications across simulated public recruitment bodies:
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            <li className="flex items-center gap-2.5 p-3 rounded bg-slate-50 border border-line">
              <CheckCircle size={16} className="text-gov-700 shrink-0" />
              <span><strong>Central Recruitment Commission (CRC)</strong> — Administrative Cadres</span>
            </li>
            <li className="flex items-center gap-2.5 p-3 rounded bg-slate-50 border border-line">
              <CheckCircle size={16} className="text-gov-700 shrink-0" />
              <span><strong>Staff Selection Commission (SSC)</strong> — Combined Graduate Level</span>
            </li>
            <li className="flex items-center gap-2.5 p-3 rounded bg-slate-50 border border-line">
              <CheckCircle size={16} className="text-gov-700 shrink-0" />
              <span><strong>Railway Recruitment Control Board (RRB)</strong> — Non-Technical Categories</span>
            </li>
            <li className="flex items-center gap-2.5 p-3 rounded bg-slate-50 border border-line">
              <CheckCircle size={16} className="text-gov-700 shrink-0" />
              <span><strong>State Public Service Commission</strong> — Engineering & Clerical Wings</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Action Banner */}
      <div className="rounded bg-gov-800 text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-card">
        <div>
          <h3 className="font-bold text-sm text-white">Experience the Demonstration System</h3>
          <p className="text-xs text-gov-200 mt-0.5">Sign in with an evaluation account or register a test candidate.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link to="/login" className="gov-btn gov-btn-accent">
            Sign In
          </Link>
          <Link to="/register" className="gov-btn bg-white text-gov-800 hover:bg-gov-50">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;

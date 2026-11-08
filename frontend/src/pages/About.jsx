import React from 'react';
import { Building2, Database, ShieldCheck, Layers, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-blue-50 text-blue-900 text-xs font-semibold uppercase tracking-wider mb-3">
          <Building2 className="w-4 h-4" />
          <span>About GREMS Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Government Recruitment Examination Management System
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed mt-2">
          GREMS is an academic full-stack DBMS application engineered to demonstrate relational database architecture, normal forms (1NF to 3NF), entity constraints, transactional integrity, and role-based recruitment management.
        </p>
      </div>

      {/* Relational Database Highlights */}
      <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-900" />
          <span>Academic Database Architecture (PostgreSQL / Supabase)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-md border border-slate-200 bg-slate-50 space-y-2">
            <h4 className="font-bold text-slate-800 text-sm">9 Core Relational Entities</h4>
            <p className="text-slate-600 leading-relaxed">
              Implemented using strict primary/foreign keys: <code>profiles</code>, <code>candidates</code>, <code>educational_qualifications</code>, <code>examinations</code>, <code>exam_centers</code>, <code>examination_centers</code> (Composite PK junction table), <code>applications</code>, <code>admit_cards</code>, and <code>results</code>.
            </p>
          </div>

          <div className="p-4 rounded-md border border-slate-200 bg-slate-50 space-y-2">
            <h4 className="font-bold text-slate-800 text-sm">Third Normal Form (3NF) Compliance</h4>
            <p className="text-slate-600 leading-relaxed">
              Eliminated insertion, update, and deletion anomalies. No multi-valued attributes in single columns; transitive dependencies removed through relational foreign key joins.
            </p>
          </div>

          <div className="p-4 rounded-md border border-slate-200 bg-slate-50 space-y-2">
            <h4 className="font-bold text-slate-800 text-sm">Duplicate Application Prevention</h4>
            <p className="text-slate-600 leading-relaxed">
              Enforced at the database layer via compound unique constraint: <code>UNIQUE(candidate_id, examination_id)</code> on the <code>applications</code> table.
            </p>
          </div>

          <div className="p-4 rounded-md border border-slate-200 bg-slate-50 space-y-2">
            <h4 className="font-bold text-slate-800 text-sm">Venue Capacity Enforcement</h4>
            <p className="text-slate-600 leading-relaxed">
              PostgreSQL trigger <code>validate_center_allocation_capacity</code> automatically verifies that <code>allocated_capacity</code> does not exceed the test center's <code>total_capacity</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Conducting Authorities */}
      <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <span>Fictional Sample Recruitment Commissions Simulated</span>
        </h2>
        <p className="text-xs text-slate-500">
          The system models multi-agency notifications across simulated public recruitment bodies:
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <li className="flex items-center space-x-2 p-3 rounded bg-slate-50 border border-slate-200">
            <CheckCircle className="w-4 h-4 text-blue-800 flex-shrink-0" />
            <span><strong>Union Public Service Commission (UPSC)</strong> — Administrative Cadres</span>
          </li>
          <li className="flex items-center space-x-2 p-3 rounded bg-slate-50 border border-slate-200">
            <CheckCircle className="w-4 h-4 text-blue-800 flex-shrink-0" />
            <span><strong>Staff Selection Commission (SSC)</strong> — Combined Graduate Level</span>
          </li>
          <li className="flex items-center space-x-2 p-3 rounded bg-slate-50 border border-slate-200">
            <CheckCircle className="w-4 h-4 text-blue-800 flex-shrink-0" />
            <span><strong>Railway Recruitment Control Board (RRB)</strong> — Non-Technical Categories</span>
          </li>
          <li className="flex items-center space-x-2 p-3 rounded bg-slate-50 border border-slate-200">
            <CheckCircle className="w-4 h-4 text-blue-800 flex-shrink-0" />
            <span><strong>State Public Service Commission</strong> — Engineering & Clerical Wings</span>
          </li>
        </ul>
      </div>

      {/* CTA Box */}
      <div className="bg-slate-900 text-white rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm">Experience the Portal</h3>
          <p className="text-xs text-slate-400">Sign in with an evaluation account or register a test candidate.</p>
        </div>
        <div className="flex space-x-2">
          <Link to="/login" className="px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded text-xs font-semibold transition">
            Sign In
          </Link>
          <Link to="/register" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-semibold transition">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;


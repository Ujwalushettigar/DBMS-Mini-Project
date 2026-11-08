import React from 'react';
import { Building2, Database, Shield, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Identity */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <Building2 className="w-5 h-5 text-blue-500" />
              <span>GREMS PORTAL</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Academic DBMS Mini Project. Centralized relational platform for managing public examination notices, candidate verification, center allocation, and merit evaluation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Portal Navigation</span>
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition">About Portal</Link></li>
              <li><Link to="/examinations" className="hover:text-white transition">Available Examinations</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Candidate Registration</Link></li>
            </ul>
          </div>

          {/* Relational Features */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Database Highlights</span>
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• PostgreSQL 15+ (Supabase)</li>
              <li>• Normalized 9-Table Schema (3NF)</li>
              <li>• Composite PK & Unique Constraints</li>
              <li>• Row Level Security (RLS)</li>
            </ul>
          </div>

          {/* Academic Notice */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-blue-400" />
              <span>Academic Notice</span>
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Developed strictly for academic demonstration and laboratory viva evaluation. Uses fictional institutional branding. No official government affiliation.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-slate-500">
          <p>© {new Date().getFullYear()} Government Recruitment Examination Management System (GREMS).</p>
          <div className="flex space-x-3 mt-2 sm:mt-0 text-slate-400">
            <span>React + Vite</span>
            <span>•</span>
            <span>Node.js / Express</span>
            <span>•</span>
            <span>PostgreSQL Supabase</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


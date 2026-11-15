import React from 'react';
import { Link } from 'react-router-dom';
import { heroImage } from '../../data/imageCredits';

export function Footer() {
  const year = new Date().getFullYear();
  const linkCls = 'text-slate-300 hover:text-white hover:underline focus:outline-none focus:ring-1 focus:ring-saffron-500 rounded';
  return (
    <footer className="no-print mt-10 bg-gov-900 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-3">
        <div>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-white">About GREMS</h3>
          <p className="text-sm text-slate-300">
            A full-stack DBMS mini project that models the recruitment lifecycle: notification, application,
            scrutiny, admit card, evaluation and merit ranking.
          </p>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-white">Quick Links</h3>
          <ul className="space-y-1 text-sm">
            <li><Link className={linkCls} to="/">Home</Link></li>
            <li><Link className={linkCls} to="/about">About GREMS</Link></li>
            <li><Link className={linkCls} to="/examinations">Examinations</Link></li>
            <li><Link className={linkCls} to="/login">Candidate / Admin Login</Link></li>
            <li><Link className={linkCls} to="/register">New Registration</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-white">Help Desk</h3>
          <p className="text-sm text-slate-300">helpdesk@grems.example</p>
          <p className="text-sm text-slate-300">1800-000-0000 (demo number)</p>
          <p className="text-sm text-slate-300">Mon-Fri, 10:00 AM - 5:00 PM</p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-3 text-center text-xs text-slate-400">
        <p>&copy; {year} GREMS. College DBMS mini project. This is a demonstration system and not an official government website.</p>
        <p className="mt-1">
          Home page photo &ldquo;{heroImage.title}&rdquo; by {heroImage.author},{' '}
          <a className="underline hover:text-white" href={heroImage.sourceUrl} target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>,
          licensed under{' '}
          <a className="underline hover:text-white" href={heroImage.licenseUrl} target="_blank" rel="noopener noreferrer">{heroImage.license}</a>.
        </p>
      </div>
    </footer>
  );
}

export default Footer;

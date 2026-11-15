import React from 'react';
import { LayoutDashboard, UserCircle, GraduationCap, FileText, ClipboardList, Ticket, Award } from 'lucide-react';
import { SidebarNav } from './SidebarNav';

const items = [
  { to: '/candidate/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/candidate/profile', label: 'My Profile', icon: UserCircle },
  { to: '/candidate/qualifications', label: 'Qualifications', icon: GraduationCap },
  { to: '/candidate/examinations', label: 'Browse Examinations', icon: FileText },
  { to: '/candidate/applications', label: 'My Applications', icon: ClipboardList },
  { to: '/candidate/admit-cards', label: 'Admit Cards', icon: Ticket },
  { to: '/candidate/results', label: 'Results', icon: Award },
];

export function CandidateSidebar() {
  return <SidebarNav title="Candidate Panel" subtitle="Applicant services" items={items} />;
}

export default CandidateSidebar;

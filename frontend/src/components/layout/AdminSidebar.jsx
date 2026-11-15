import React from 'react';
import { LayoutDashboard, Users, Megaphone, Building2, ClipboardList, Ticket, Award } from 'lucide-react';
import { SidebarNav } from './SidebarNav';

const items = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/candidates', label: 'Candidates', icon: Users },
  { to: '/admin/examinations', label: 'Examinations', icon: Megaphone },
  { to: '/admin/centers', label: 'Exam Centers', icon: Building2 },
  { to: '/admin/applications', label: 'Applications', icon: ClipboardList },
  { to: '/admin/admit-cards', label: 'Admit Cards', icon: Ticket },
  { to: '/admin/results', label: 'Results', icon: Award },
];

export function AdminSidebar() {
  return <SidebarNav title="Administration Panel" subtitle="Recruitment officer" items={items} />;
}

export default AdminSidebar;

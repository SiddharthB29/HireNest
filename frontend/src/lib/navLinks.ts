import type { SidebarLink } from '../components/DashboardLayout';

export const STUDENT_LINKS: SidebarLink[] = [
  { to: '/student', label: 'Overview', icon: '🏠', end: true },
  { to: '/student/profile', label: 'My profile', icon: '👤' },
  { to: '/student/applications', label: 'My applications', icon: '📋' },
  { to: '/jobs', label: 'Browse jobs', icon: '🔍' },
];

export const RECRUITER_LINKS: SidebarLink[] = [
  { to: '/recruiter', label: 'Overview', icon: '🏠', end: true },
  { to: '/recruiter/jobs', label: 'My job postings', icon: '💼' },
  { to: '/recruiter/applications', label: 'Applications', icon: '📋' },
];

export const ADMIN_LINKS: SidebarLink[] = [
  { to: '/admin', label: 'Overview', icon: '🏠', end: true },
  { to: '/admin/companies', label: 'Companies', icon: '🏢' },
  { to: '/admin/recruiters', label: 'Recruiter accounts', icon: '🧑‍💼' },
  { to: '/admin/applications', label: 'All applications', icon: '📋' },
];

import type { SidebarLink } from '../components/DashboardLayout';

/** Editorial nav convention: ✳︎ mark instead of emoji icons. */
const MARK = '✳︎';

export const STUDENT_LINKS: SidebarLink[] = [
  { to: '/student', label: 'Overview', icon: MARK, end: true },
  { to: '/student/profile', label: 'My profile', icon: MARK },
  { to: '/student/applications', label: 'My applications', icon: MARK },
  { to: '/jobs', label: 'Browse jobs', icon: MARK },
];

export const RECRUITER_LINKS: SidebarLink[] = [
  { to: '/recruiter', label: 'Overview', icon: MARK, end: true },
  { to: '/recruiter/jobs', label: 'My job postings', icon: MARK },
  { to: '/recruiter/applications', label: 'Applications', icon: MARK },
];

export const ADMIN_LINKS: SidebarLink[] = [
  { to: '/admin', label: 'Overview', icon: MARK, end: true },
  { to: '/admin/companies', label: 'Companies', icon: MARK },
  { to: '/admin/recruiters', label: 'Recruiter accounts', icon: MARK },
  { to: '/admin/applications', label: 'All applications', icon: MARK },
];

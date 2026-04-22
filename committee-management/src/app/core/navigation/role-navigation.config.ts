export type WorkspaceRole = 'ADMIN' | 'FACULTY' | 'STUDENT';

export type RoleWorkspaceItem = {
  label: string;
  icon: string;
  route: string;
  fragment?: string;
};

export const ROLE_WORKSPACE_MENUS: Record<WorkspaceRole, RoleWorkspaceItem[]> = {
  ADMIN: [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Users', icon: 'person_outline', route: '/users' },
    { label: 'Committees', icon: 'groups', route: '/committees' },
    { label: 'Events', icon: 'event', route: '/events' },
    { label: 'Registrations', icon: 'how_to_reg', route: '/events/registrations/pending' },
    { label: 'Attendance', icon: 'fact_check', route: '/attendance' },
    { label: 'QR Session', icon: 'qr_code_2', route: '/attendance/qr-session' },
    { label: 'Announcements', icon: 'campaign', route: '/announcements' },
    { label: 'Mail Tools', icon: 'mail', route: '/admin/mail-tools' }
  ],
  FACULTY: [
    { label: 'Dashboard', icon: 'dashboard', route: '/faculty/dashboard' },
    { label: 'Committees', icon: 'groups', route: '/committees' },
    { label: 'Events', icon: 'event', route: '/events' },
    { label: 'Registrations', icon: 'how_to_reg', route: '/events/registrations/pending' },
    { label: 'Tasks', icon: 'task_alt', route: '/tasks' },
    { label: 'Attendance', icon: 'fact_check', route: '/attendance' },
    { label: 'QR Session', icon: 'qr_code_2', route: '/attendance/qr-session' },
    { label: 'Announcements', icon: 'campaign', route: '/announcements' }
  ],
  STUDENT: [
    { label: 'Dashboard', icon: 'dashboard', route: '/student/dashboard' },
    { label: 'Events', icon: 'event', route: '/student/events' },
    { label: 'Committees', icon: 'groups', route: '/student/committees' },
    { label: 'Tasks', icon: 'task_alt', route: '/student/tasks' },
    { label: 'Attendance', icon: 'fact_check', route: '/student/attendance' },
    { label: 'Scan QR', icon: 'qr_code_scanner', route: '/student/attendance/scan' },
    { label: 'Announcements', icon: 'campaign', route: '/student/announcements' },
    { label: 'Profile', icon: 'settings', route: '/student/profile' }
  ]
};

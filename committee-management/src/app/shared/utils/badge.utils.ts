const fallbackBadge = 'bg-slate-100 text-slate-600 border-slate-200';

function normalizeBadgeValue(value: string | undefined): string {
  return (value || '').toUpperCase().replace(/[\s-]+/g, '_');
}

export function getTaskStatusBadgeClass(status: string | undefined): string {
  const normalized = normalizeBadgeValue(status);
  if (normalized === 'COMPLETED') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }

  if (normalized === 'IN_PROGRESS') {
    return 'bg-sky-100 text-sky-700 border-sky-200';
  }

  if (normalized === 'PENDING') {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }

  return fallbackBadge;
}

export function getTaskPriorityBadgeClass(priority: string | undefined): string {
  const normalized = normalizeBadgeValue(priority);
  if (normalized === 'HIGH') {
    return 'bg-rose-100 text-rose-700 border-rose-200';
  }

  if (normalized === 'MEDIUM') {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }

  if (normalized === 'LOW') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }

  return fallbackBadge;
}

export function getAttendanceStatusBadgeClass(status: string | undefined): string {
  const normalized = normalizeBadgeValue(status);
  if (normalized === 'PRESENT') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }

  if (normalized === 'LATE') {
    return 'bg-orange-100 text-orange-700 border-orange-200';
  }

  if (normalized === 'ABSENT') {
    return 'bg-rose-100 text-rose-700 border-rose-200';
  }

  return fallbackBadge;
}

export function getEventStatusBadgeClass(status: string | undefined): string {
  const normalized = normalizeBadgeValue(status);
  if (normalized === 'ONGOING') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }

  if (normalized === 'PLANNED') {
    return 'bg-blue-100 text-blue-700 border-blue-200';
  }

  if (normalized === 'CANCELLED') {
    return 'bg-rose-100 text-rose-700 border-rose-200';
  }

  if (normalized === 'COMPLETED') {
    return 'bg-violet-100 text-violet-700 border-violet-200';
  }

  return fallbackBadge;
}

export function getRegistrationStatusBadgeClass(status: string | undefined): string {
  const normalized = normalizeBadgeValue(status);
  if (normalized === 'APPROVED') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }

  if (normalized === 'PENDING') {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }

  if (normalized === 'REJECTED') {
    return 'bg-rose-100 text-rose-700 border-rose-200';
  }

  return fallbackBadge;
}

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  checked_in: 'Checked In',
  completed: 'Completed',
  no_show: 'No Show',
  cancelled: 'Cancelled',
  admitted: 'Admitted',
  transferred: 'Transferred',
  discharged: 'Discharged',
  pending: 'Pending',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  rejected: 'Rejected',
  draft: 'Draft',
  paid: 'Paid',
  partial: 'Partial',
  voided: 'Voided',
  submitted: 'Submitted',
  approved: 'Approved',
  dispensed: 'Dispensed',
  on_hold: 'On Hold',
  open: 'Open',
  closed: 'Closed',
  routine: 'Routine',
  urgent: 'Urgent',
  stat: 'STAT',
  active: 'Active',
  inactive: 'Inactive',
  discontinued: 'Discontinued',
  received: 'Received',
  skipped: 'Skipped',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      `status-${status}`,
      className
    )}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

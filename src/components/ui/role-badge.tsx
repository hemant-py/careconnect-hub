import { cn } from '@/lib/utils';
import { AppRole } from '@/types';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/rbac';

interface RoleBadgeProps {
  role: AppRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      ROLE_COLORS[role],
      className
    )}>
      {ROLE_LABELS[role]}
    </span>
  );
}

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

export interface HimsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  asChild?: boolean;
}

const variantClasses = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm',
  secondary: 'bg-card text-foreground border border-border hover:bg-muted',
  ghost: 'bg-transparent text-primary hover:bg-info-bg',
  danger: 'bg-danger text-danger-foreground hover:bg-danger-hover shadow-sm',
  outline: 'bg-transparent text-foreground border border-border hover:bg-muted',
};

const sizeClasses = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-sm gap-2',
};

export const HimsButton = React.forwardRef<HTMLButtonElement, HimsButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, disabled, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-[var(--radius)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        {children}
      </Comp>
    );
  }
);
HimsButton.displayName = 'HimsButton';

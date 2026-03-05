import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { NAV_ITEMS } from '@/lib/rbac';
import { RoleBadge } from '@/components/ui/role-badge';
import {
  LayoutDashboard, Users, FileText, Stethoscope, FlaskConical,
  Pill, Package, CreditCard, Settings, ChevronDown, ChevronRight,
  Menu, X, Bell, Search, LogOut, User, Activity
} from 'lucide-react';

const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard, Users, FileText, Stethoscope, FlaskConical,
  Pill, Package, CreditCard, Settings, Activity
};

function SidebarItem({
  item,
  collapsed,
}: {
  item: typeof NAV_ITEMS[0];
  collapsed: boolean;
}) {
  const location = useLocation();
  const Icon = ICONS[item.icon] ?? LayoutDashboard;
  const hasChildren = item.children && item.children.length > 0;
  const isActive = location.pathname === item.path ||
    (item.children?.some(c => location.pathname.startsWith(c.path)) ?? false);
  const [open, setOpen] = useState(isActive);

  if (hasChildren && !collapsed) {
    return (
      <div>
        <button
          onClick={() => setOpen(o => !o)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
          )}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        {open && (
          <div className="ml-7 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
            {item.children!.map(child => (
              <Link
                key={child.key}
                to={child.path}
                className={cn(
                  'block py-2 px-2 rounded-md text-xs font-medium transition-colors',
                  location.pathname === child.path || location.pathname.startsWith(child.path + '/')
                    ? 'text-sidebar-primary font-semibold'
                    : 'text-sidebar-foreground hover:text-sidebar-accent-foreground'
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        collapsed ? 'justify-center' : '',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export function AppSidebar({
  collapsed,
  onCollapse,
}: {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
}) {
  const { profile } = useAuth();
  const role = profile?.role;

  const visibleItems = NAV_ITEMS.filter(item =>
    role && item.roles.includes(role)
  );

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-200',
        collapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-14 border-b border-sidebar-border px-3 flex-shrink-0',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Activity className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="text-sm font-bold text-sidebar-accent-foreground">HIMS</span>
            <p className="text-[10px] text-sidebar-foreground truncate">Hospital Management</p>
          </div>
        )}
        <button
          onClick={() => onCollapse(!collapsed)}
          className="ml-auto p-1 text-sidebar-foreground hover:text-sidebar-accent-foreground rounded"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {visibleItems.map(item => (
          <SidebarItem key={item.key} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User info */}
      {profile && !collapsed && (
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-sidebar-accent-foreground">
                {profile.full_name?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-sidebar-accent-foreground truncate">{profile.full_name}</p>
              <RoleBadge role={profile.role} className="mt-0.5 text-[10px]" />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export function TopBar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 z-10 flex-shrink-0">
      {/* Global Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search patients, MRN, appointments…"
          className="form-input pl-9 w-full bg-muted/50 text-sm"
          onClick={() => setSearchOpen(true)}
        />
      </div>

      <div className="flex-1" />

      {/* Notifications placeholder */}
      <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
      </button>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen(o => !o)}
          className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">
              {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-foreground leading-tight">{profile?.full_name ?? 'User'}</p>
            <p className="text-[10px] text-muted-foreground leading-tight capitalize">{profile?.role?.replace('_', ' ')}</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
        </button>

        {userMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-lg shadow-lg z-20 py-1">
              <button
                onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                <User className="h-4 w-4" /> My Profile
              </button>
              <div className="border-t border-border my-1" />
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger-bg"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

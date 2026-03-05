import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar, TopBar } from './Sidebar';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="page-container min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

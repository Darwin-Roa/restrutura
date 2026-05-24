import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const DirectorLayout = () => {
  const location = useLocation();
  let title = "Seguimiento general";
  if(location.pathname.includes('/generar')) title = "Copilot IA — generar plan";
  if(location.pathname.includes('/planes')) title = "Planes de mejora";

  return (
    <div className="flex h-screen font-sans text-[13px] overflow-hidden" style={{ background: '#f4f7f5' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} />
        <div className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

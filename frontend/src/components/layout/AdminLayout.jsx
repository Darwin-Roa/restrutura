import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AdminLayout = () => {
  return (
    <div className="flex h-screen w-full bg-[#f9fafb] text-[#1a1a1a] font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar title="Administración del Sistema" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

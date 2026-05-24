import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, ChevronRight, CalendarDays } from 'lucide-react';
import api from '../../api/axios';
import { NotificationBell } from './NotificationBell';

export const Topbar = ({ title }) => {
  const { user, logout } = useAuth();
  const [activePeriod, setActivePeriod] = useState('...');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = React.useRef(null);

  useEffect(() => {
    api.get('/periods').then(r => {
      const active = r.data.periods?.find(p => p.is_active);
      setActivePeriod(active ? `Periodo activo: ${active.name}` : 'Sin periodo activo');
    }).catch(() => setActivePeriod('Periodo Desconocido'));

    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="flex items-center justify-between px-6"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #eaecf0',
        minHeight: '54px',
        boxShadow: '0 1px 0 #eaecf0'
      }}
    >
      {/* Breadcrumb / Título */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-gray-400 text-xs">Unisimón</span>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="font-semibold text-gray-800 text-[13px]">{title}</span>
      </div>

      {/* Derecha */}
      <div className="flex items-center gap-2">
        {/* Periodo activo */}
        <div
          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full"
          style={{ background: '#e6f4ec', color: '#09843B', border: '1px solid #c6e4d0' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          {activePeriod}
        </div>

        <div className="w-px h-5 bg-gray-200 mx-1" />
        {/* Notificaciones */}
        <NotificationBell />

        {/* Avatar & Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            title="Mi Perfil"
            className="flex items-center gap-2 pl-2 hover:bg-gray-50 p-1.5 rounded-lg transition"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
              style={{ background: '#09843B' }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="text-[12px] font-medium text-gray-600 hidden sm:inline max-w-[100px] truncate">
              {user?.name?.split(' ')[0]}
            </span>
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 p-4">
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-lg font-bold text-white mb-2" style={{ background: '#09843B' }}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <h4 className="font-bold text-gray-800 text-sm truncate">{user?.name}</h4>
                <p className="text-[10px] text-gray-400 uppercase">{user?.role}</p>
              </div>
              
              <div className="border-t border-gray-100 pt-3 mb-3">
                <label className="block text-xs font-bold text-gray-700 mb-1">Firma Digital (Para PDFs)</label>
                <p className="text-[10px] text-gray-500 mb-2 leading-tight">Sube una imagen (PNG/JPG) con tu firma en fondo blanco o transparente.</p>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg"
                  className="block w-full text-[10px] text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const formData = new FormData();
                      formData.append('signature', e.target.files[0]);
                      try {
                        await api.post('/profile/signature', formData, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        alert('¡Firma guardada correctamente! Ahora aparecerá en tus PDFs generados.');
                        setIsProfileOpen(false);
                      } catch (err) {
                        alert('Error al subir firma: ' + (err.response?.data?.message || err.message));
                      }
                    }
                  }}
                />
              </div>

              <div className="border-t border-gray-100 pt-3">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition"
                >
                  <LogOut size={14} /> Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

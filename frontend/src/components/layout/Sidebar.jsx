import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, FileText, History, Square,
  ClipboardList, Download, Users, BookOpen,
  Calendar, Building2, Sparkles, GraduationCap,
  LogOut, ShieldCheck
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = {
    director: [
      { id: 'seguimiento', path: '/director',          icon: <LayoutDashboard size={15}/>, label: 'Panel Institucional', requiredPermissions: ['seguimiento_general', 'ver_seguimiento_global', 'ver_dashboard', 'ver_estadisticas'] },
      { id: 'evaluacion', path: '/director/evaluar',   icon: <FileText size={15}/>,        label: 'Cargar Evaluación', requiredPermissions: ['subir_evaluacion'] },
      { id: 'carta',      path: '/director/generar',   icon: <Sparkles size={15}/>,        label: 'Asistente IA', requiredPermissions: ['copilot_ia', 'generar_plan_ia'] },
      { id: 'planes',     path: '/director/planes',    icon: <ClipboardList size={15}/>,   label: 'Planes de Mejoramiento', requiredPermissions: ['planes_mejora', 'ver_planes'] },
      { id: 'historial',  path: '/director/historial', icon: <History size={15}/>,         label: 'Historial y Analítica', requiredPermissions: ['auditoria_docente', 'ver_historial'] },
      { id: 'tareas',     path: '/director/tareas',    icon: <Square size={15}/>,          label: 'Plan de Trabajo', requiredPermissions: ['plan_trabajo', 'asignar_tareas'] },
      { id: 'cursos',     path: '/director/cursos',    icon: <BookOpen size={15}/>,        label: 'Gestión de Cursos', requiredPermissions: ['gestion_cursos', 'gestionar_cursos'] },
      { id: 'evidencias', path: '/director/evidencias',icon: <FileText size={15}/>,        label: 'Bandeja de Evidencias', requiredPermissions: ['bandeja_evidencias'] },
      { id: 'export',     path: '/director/exportar',  icon: <Download size={15}/>,        label: 'Control de Entrega', requiredPermissions: ['exportar', 'exportar_excel', 'exportar_global'] },
    ],
    admin: [
      { id: 'admin-dash',        path: '/admin',               icon: <LayoutDashboard size={15}/>, label: 'Panel Administrativo' },
      { id: 'admin-users',       path: '/admin/usuarios',      icon: <Users size={15}/>,           label: 'Gestión Usuarios' },
      { id: 'admin-roles',       path: '/admin/roles',         icon: <ShieldCheck size={15}/>,     label: 'Gestión Roles' },
      { id: 'admin-courses',     path: '/admin/cursos',        icon: <BookOpen size={15}/>,        label: 'Gestión Cursos' },
      { id: 'admin-periods',     path: '/admin/periodos',      icon: <Calendar size={15}/>,        label: 'Gestión Periodos' },
      { id: 'admin-areas',       path: '/admin/areas',         icon: <ClipboardList size={15}/>,   label: 'Gestión Áreas' },
      { id: 'admin-departments', path: '/admin/departamentos', icon: <Building2 size={15}/>,       label: 'Gestión Departamentos' },
    ]
  };

  let items = user?.role === 'admin' ? navItems.admin : (user?.role !== 'profesor' ? navItems.director : []);

  // Filtrar el menú basado en los permisos del usuario
  if (user?.role !== 'admin' && user?.role !== 'profesor' && user?.permissions) {
    items = items.filter(item => {
      if (!item.requiredPermissions) return true;
      return item.requiredPermissions.some(rp => user.permissions.includes(rp));
    });
  }

  return (
    <div
      className="w-[220px] min-w-[220px] flex flex-col h-full"
      style={{
        background: '#0f2217',
        borderRight: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      {/* Branding */}
      <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(9,132,59,0.3)', border: '1px solid rgba(9,132,59,0.5)' }}
          >
            <GraduationCap size={18} style={{ color: '#4ade80' }} />
          </div>
          <div>
            <div className="text-white font-bold text-[13px] leading-tight tracking-tight">Mejora Profesoral</div>
            <div className="text-[10px] mt-0.5 font-medium tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Unisimón · {user?.role === 'director' ? 'Dirección' : 'Admin'}
            </div>
          </div>
        </div>
      </div>

      {/* Rol chip */}
      <div className="px-4 py-3">
        <div
          className="w-full text-[11px] py-2 px-3 rounded-lg text-center font-semibold uppercase"
          style={{
            background: 'rgba(255,255,255,0.03)',
            color: '#86efac',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {user?.role === 'director' ? 'Director / Coordinador' : user?.role}
        </div>
      </div>

      {/* Separador */}
      <div className="mx-4 mb-2 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-2">
        {items.map(n => (
          <NavLink
            key={n.id}
            to={n.path}
            end={n.path === '/director' || n.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 py-2.5 px-3 rounded-lg text-[12px] font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'text-white'
                  : 'text-white/45 hover:text-white/80 hover:bg-white/5'
              }`
            }
            style={({ isActive }) => isActive ? {
              background: 'rgba(9,132,59,0.15)',
              border: '1px solid rgba(9,132,59,0.3)',
              color: '#4ade80'
            } : {}}
          >
            <span className="w-4 flex items-center justify-center shrink-0 opacity-80">{n.icon}</span>
            <span className="truncate">{n.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-[11px] py-2.5 rounded-lg font-semibold transition-all"
          style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.04)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#fca5a5'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
        >
          <LogOut size={13} /> Cerrar sesión
        </button>
        <div className="text-[9px] text-white/15 text-center tracking-wider uppercase mt-2">
          Unisimón © 2026
        </div>
      </div>
    </div>
  );
};

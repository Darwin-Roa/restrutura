import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Users, Building2, CalendarCheck, BookOpen,
  ChevronRight, Activity, Server, ShieldCheck,
  RefreshCw, Settings, ShieldAlert, Database,
  ArrowUpRight, BarChart3
} from 'lucide-react';
import api from '../../api/axios';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    roles: { admin: 0, director: 0, profesor: 0 },
    periods: 0,
    activePeriod: null,
    departments: 0,
    courses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersRes, periodsRes, deptRes, coursesRes] = await Promise.all([
        api.get('/users').catch(() => ({ data: { users: [] } })),
        api.get('/periods').catch(() => ({ data: [] })),
        api.get('/departments').catch(() => ({ data: [] })),
        api.get('/courses').catch(() => ({ data: [] }))
      ]);

      const getArray = (resData, key) => {
        if (!resData) return [];
        if (Array.isArray(resData)) return resData;
        if (Array.isArray(resData[key])) return resData[key];
        if (Array.isArray(resData.data)) return resData.data;
        // Fallback for cases like usersRes.data where users is directly inside resData
        return [];
      };

      const allUsers = getArray(usersRes.data, 'users');
      const activeUsersList = allUsers.filter(u => u.is_active);
      const periodsList = getArray(periodsRes.data, 'periods');
      const activePeriodObj = periodsList.find(p => p.is_active || p.estado === 'activo') || periodsList[0] || null;
      const departmentsList = getArray(deptRes.data, 'departments');
      const coursesList = getArray(coursesRes.data, 'courses');
      
      // Calcular distribución de roles sobre usuarios activos
      const roleCount = { admin: 0, director: 0, profesor: 0 };
      activeUsersList.forEach(u => {
        if (u.role === 'admin') roleCount.admin++;
        else if (u.role === 'director') roleCount.director++;
        else roleCount.profesor++; // Fallback to profesor
      });

      setStats({
        totalUsers: allUsers.length,
        activeUsers: activeUsersList.length,
        roles: roleCount,
        periods: periodsList.length,
        activePeriod: activePeriodObj,
        departments: departmentsList.length,
        courses: coursesList.length,
      });

      // Sort recent users by created_at or ID descending
      const sortedUsers = [...allUsers]
        .sort((a, b) => {
          const dateA = a.created_at || a.createdAt || 0;
          const dateB = b.created_at || b.createdAt || 0;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        })
        .slice(0, 5);
      
      setRecentUsers(sortedUsers);

    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError('No se pudieron cargar las métricas de infraestructura del sistema');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const systemHealth = stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0;

  const metricCards = [
    { 
      title: 'Salud del Sistema', 
      value: `${systemHealth}%`, 
      subValue: `${stats.activeUsers} usuarios activos`,
      icon: Server, 
      color: 'bg-emerald-50 text-emerald-700',
      borderColor: 'border-emerald-100',
      iconColor: 'text-emerald-600'
    },
    { 
      title: 'Periodo Académico', 
      value: stats.activePeriod ? (stats.activePeriod.name || stats.activePeriod.nombre || 'Activo') : 'Sin Configurar', 
      subValue: `${stats.periods} periodos en el sistema`,
      icon: CalendarCheck, 
      color: stats.activePeriod ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700',
      borderColor: stats.activePeriod ? 'border-blue-100' : 'border-red-100',
      iconColor: stats.activePeriod ? 'text-blue-600' : 'text-red-600'
    },
    { 
      title: 'Estructura Orgánica', 
      value: stats.departments, 
      subValue: 'Departamentos / Áreas',
      icon: Building2, 
      color: 'bg-purple-50 text-purple-700',
      borderColor: 'border-purple-100',
      iconColor: 'text-purple-600'
    },
    { 
      title: 'Base de Cursos', 
      value: stats.courses, 
      subValue: 'Cursos sincronizados',
      icon: Database, 
      color: 'bg-amber-50 text-amber-700',
      borderColor: 'border-amber-100',
      iconColor: 'text-amber-600'
    },
  ];

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-lg mx-auto mt-12 shadow-sm animate-fadeIn">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
          <Activity size={24} />
        </div>
        <h3 className="text-lg font-bold text-red-900 mb-2">Error de Conexión</h3>
        <p className="text-red-700 text-sm mb-6">{error}</p>
        <button 
          onClick={fetchDashboardData} 
          className="inline-flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm"
        >
          <RefreshCw size={16} /> Reintentar
        </button>
      </div>
    );
  }

  // Cálculos para la barra de distribución
  const totalActives = stats.activeUsers || 1; // evitar division por cero
  const pProfesores = Math.round((stats.roles.profesor / totalActives) * 100);
  const pDirectores = Math.round((stats.roles.director / totalActives) * 100);
  const pAdmins = Math.round((stats.roles.admin / totalActives) * 100);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Orientado a Infraestructura */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0f2217] shadow-lg border border-white/5">
        <div className="relative z-10 px-8 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/15">
              <Settings className="text-white animate-spin-slow" size={28} />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Infraestructura del Sistema
            </h1>
          </div>
          <p className="text-emerald-100 max-w-2xl text-lg mt-1 font-medium">
            Supervisa el estado global de la base de datos, configuraciones estructurales y despliegue de usuarios en la plataforma.
          </p>
          <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-emerald-100 text-sm">
              <Activity size={16} className="text-[#16a34a]" />
              <span className="font-semibold">Sistemas Operativos (Servidor Activo)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-100 text-sm">
              <ShieldCheck size={16} className="text-blue-400" />
              <span>Políticas de seguridad aplicadas</span>
            </div>
          </div>
        </div>
        {/* Decoraciones técnicas abstractas */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute top-10 right-20 w-64 h-64 border border-white rounded-full"></div>
          <div className="absolute top-14 right-24 w-56 h-56 border border-white rounded-full"></div>
          <div className="absolute top-18 right-28 w-48 h-48 border border-dashed border-white rounded-full"></div>
        </div>
      </div>

      {/* Grid de métricas de Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, idx) => (
          <div key={idx} className={`bg-white rounded-xl border ${card.borderColor} shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">{card.title}</p>
                {loading ? (
                  <div className="h-9 w-20 bg-gray-200 animate-pulse rounded mt-2"></div>
                ) : (
                  <p className="text-2xl font-extrabold text-gray-800 mt-1">{card.value}</p>
                )}
              </div>
              <div className={`p-3 rounded-xl ${card.color} transition-transform duration-300`}>
                <card.icon size={22} className={card.iconColor} />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <span className="text-xs font-semibold text-gray-400">{card.subValue}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos y Accesos Rápidos para IT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Distribución de Roles (Native CSS Chart) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 size={20} className="text-[#16a34a]"/>
                Distribución de Cuentas Activas
              </h2>
              <p className="text-sm text-gray-500">Uso de licencias y acceso al sistema por rol</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Profesores */}
            <div>
              <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#16a34a]" /> Docentes
                </div>
                <span>{stats.roles.profesor} ({pProfesores}%)</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#16a34a] to-[#22c55e] transition-all duration-1000" style={{ width: `${pProfesores}%` }}></div>
              </div>
            </div>

            {/* Directores */}
            <div>
              <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-blue-500" /> Directores / Coordinadores
                </div>
                <span>{stats.roles.director} ({pDirectores}%)</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000" style={{ width: `${pDirectores}%` }}></div>
              </div>
            </div>

            {/* Administradores */}
            <div>
              <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-purple-500" /> Administradores de Sistema
                </div>
                <span>{stats.roles.admin} ({pAdmins}%)</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000" style={{ width: `${pAdmins}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Accesos Rápidos de Configuración */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Panel de Configuración</h2>
              <Settings size={18} className="text-[#16a34a]" />
            </div>
            <div className="space-y-3">
              {[
                { name: 'Ajustar Periodos', path: '/admin/periodos', icon: CalendarCheck, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100' },
                { name: 'Sincronizar Áreas', path: '/admin/departamentos', icon: Database, color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100' },
                { name: 'Auditoría de Roles', path: '/admin/roles', icon: ShieldAlert, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100' },
                { name: 'Carga Masiva Usuarios', path: '/admin/usuarios', icon: Users, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100' },
              ].map((item, i) => (
                <Link
                  key={i}
                  to={item.path}
                  className={`flex items-center justify-between p-3.5 rounded-xl transition-all group shadow-sm hover:shadow ${item.color}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <span className="font-semibold text-sm">{item.name}</span>
                  </div>
                  <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Registros Técnicos de Cuentas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              Últimas Creaciones de Cuentas
            </h2>
            <p className="text-sm text-gray-500">Historial reciente de aprovisionamiento de identidades</p>
          </div>
          <Link to="/admin/usuarios" className="text-sm text-[#16a34a] hover:text-[#15803d] font-bold flex items-center gap-1 bg-[#e6f4ec] px-3 py-1.5 rounded-lg transition-colors">
            Ver todas <ChevronRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Identidad (Cédula)</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario / Correo</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Rol de Sistema</th>
                <th className="px-6 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado de Cuenta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 bg-gray-100 animate-pulse rounded"></div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-100 animate-pulse rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-100 animate-pulse rounded"></div></td>
                  </tr>
                ))
              ) : recentUsers.length > 0 ? (
                recentUsers.map((u, idx) => (
                  <tr key={idx} className={`transition-colors ${u.is_active ? 'hover:bg-gray-50/40' : 'bg-red-50/20'}`}>
                    <td className="px-6 py-4 text-gray-600 font-bold text-sm font-mono">
                      {u.cedula || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800 text-sm">{u.name}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 
                        u.role === 'profesor' || u.role === 'teacher' ? 'bg-emerald-50 text-[#16a34a] border border-[#d1ead9]' : 
                        u.role === 'director' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-50 text-gray-700 border border-gray-100'
                      }`}>
                        {u.role === 'admin' ? <ShieldCheck size={12}/> : null}
                        {u.role === 'admin' ? 'Administrador' : u.role === 'profesor' || u.role === 'teacher' ? 'Docente' : u.role === 'director' ? 'Director' : u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <span className={`text-xs font-bold ${u.is_active ? 'text-emerald-700' : 'text-red-600'}`}>
                          {u.is_active ? 'Operativo' : 'Suspendido / Inactivo'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                    No hay registros de cuentas recientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

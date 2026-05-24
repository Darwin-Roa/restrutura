import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle2, Clock, AlertTriangle, FileText } from 'lucide-react';

const getInitials = (name = '') => name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

const STATUS_CONFIG = {
  approved:     { label: 'Aprobado',    bg: 'bg-[#e6f4ec]', text: 'text-[#16a34a]', bar: '#16a34a' },
  borrador:     { label: 'Borrador IA', bg: 'bg-[#fdf5e0]', text: 'text-[#92400e]', bar: '#C9A84C' },
  tareas_fijas: { label: 'Tareas Base', bg: 'bg-[#eff6ff]', text: 'text-[#1e40af]', bar: '#1e40af' },
  sin_plan:     { label: 'Sin Asignar', bg: 'bg-[#fef2f2]', text: 'text-[#b91c1c]', bar: '#b91c1c' },
};

export const DirectorDashboard = () => {
  const [plans, setPlans]   = useState([]);
  const [users, setUsers]   = useState([]);
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/plans').catch(() => ({ data: { plans: [] } })),
      api.get('/users?role=profesor').catch(() => ({ data: { users: [] } })),
      api.get('/history/tracking').catch(() => ({ data: { tracking: [] } })),
    ]).then(([plansRes, usersRes, trackRes]) => {
      setPlans(plansRes.data.plans || []);
      setUsers(usersRes.data.users || []);
      setTrackingData(trackRes.data.tracking || []);
    }).finally(() => setLoading(false));
  }, []);

  // Construye filas usando trackingInfo (ya filtrado por periodo activo en el backend)
  // NO usar `plans` directamente porque devuelve todos los periodos sin filtrar
  const rows = users.filter(u => u.is_active).map(user => {
    const trackingInfo = trackingData.find(t => t.teacher.id === user.id);
    // Buscar el plan del periodo activo usando planId que devuelve el tracking
    const plan = trackingInfo?.planId
      ? plans.find(p => p.id === trackingInfo.planId)
      : null;

    let progress = trackingInfo ? trackingInfo.progress : 0;
    let statusKey = 'sin_plan';

    // planStatus viene del backend ya filtrado por periodo activo
    const activePlanStatus = trackingInfo?.planStatus;
    if (activePlanStatus === 'approved') {
      statusKey = 'approved';
    } else if (activePlanStatus === 'borrador' || activePlanStatus === 'draft') {
      statusKey = 'borrador';
    } else if (trackingInfo && trackingInfo.totalTasks > 0) {
      // Tiene tareas institucionales asignadas aunque no tenga plan IA en este periodo
      statusKey = 'tareas_fijas';
    }

    return { user, plan, progress, statusKey, trackingInfo };
  });

  const approved = rows.filter(r => r.statusKey === 'approved').length;
  const pending  = rows.filter(r => r.statusKey === 'borrador').length;
  const sinPlan  = rows.filter(r => r.statusKey === 'sin_plan' || r.statusKey === 'tareas_fijas').length;

  return (
    <div className="space-y-5">

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { icon: <Users size={18} style={{color:'#16a34a'}}/>,   label: 'Profesores activos',  value: users.filter(u=>u.is_active).length,
            bg: 'linear-gradient(135deg,#ffffff,#f4faf6)', border: '#e5e7eb', val_color: '#16a34a' },
          { icon: <CheckCircle2 size={18} style={{color:'#16a34a'}}/>, label: 'Planes aprobados', value: approved,
            bg: 'linear-gradient(135deg,#ffffff,#f4faf6)', border: '#e5e7eb', val_color: '#16a34a' },
          { icon: <Clock size={18} style={{color:'#92400e'}}/>, label: 'En borrador IA',      value: pending,
            bg: 'linear-gradient(135deg,#ffffff,#fffdf5)', border: '#e5e7eb', val_color: '#92400e' },
          { icon: <AlertTriangle size={18} style={{color:'#b91c1c'}}/>, label: 'Sin plan asignado', value: sinPlan,
            bg: 'linear-gradient(135deg,#ffffff,#fff7f7)', border: '#e5e7eb', val_color: '#b91c1c' },
        ].map((kpi, i) => (
          <div key={i}
            className="rounded-2xl p-5 flex items-center gap-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            style={{ background: kpi.bg, border: `1px solid ${kpi.border}` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#f9fafb', border: '1px solid #f3f4f6' }}>
              {kpi.icon}
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: kpi.val_color }}>{kpi.value}</div>
              <div className="text-[11px] text-gray-500 mt-0.5 font-medium">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla de seguimiento */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#f0f0f0', background: 'linear-gradient(to right, #f4faf6, #ffffff)' }}>
          <span className="font-bold text-sm flex items-center gap-2" style={{ color: '#16a34a' }}>
            <FileText size={16}/> Estado por profesor — Periodo activo
          </span>
          <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: '#e6f4ec', color: '#16a34a' }}>
            {rows.length} profesores
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16 text-gray-400 text-sm gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Cargando datos...
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            No hay profesores registrados aún. Créalos desde el panel de Administración.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {rows.map(({ user, plan, progress, statusKey }) => {
              const cfg = STATUS_CONFIG[statusKey];
              return (
                <div key={user.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/70 transition">
                  {/* Avatar + Nombre */}
                  <div className="flex items-center gap-3 w-[260px] shrink-0 overflow-hidden">
                    <div className="w-9 h-9 rounded-full bg-[#E6F1FB] flex items-center justify-center font-bold text-[11px] text-[#185FA5] shrink-0">
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-gray-900 truncate" title={user.name}>{user.name}</div>
                      <div className="text-[11px] text-gray-400 truncate" title={user.department || 'Sin departamento'}>{user.department || 'Sin departamento'}</div>
                    </div>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="flex-1 mx-6">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Avance del plan</span>
                      <span className="font-bold">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full w-full">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%`, backgroundColor: cfg.bar }} />
                    </div>
                  </div>

                  {/* Estado + Acciones */}
                  <div className="flex items-center justify-end gap-2 shrink-0 w-[180px]">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                    {plan ? (
                      <button
                        onClick={() => navigate('/director/planes')}
                        className="text-[11px] py-1.5 px-3 rounded-lg border font-semibold transition"
                        style={{ border: '1px solid #d1ead9', color: '#16a34a', background: '#e6f4ec' }}
                        onMouseEnter={e => { e.target.style.background='#16a34a'; e.target.style.color='white'; }}
                        onMouseLeave={e => { e.target.style.background='#e6f4ec'; e.target.style.color='#16a34a'; }}
                      >
                        Ver plan
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/director/generar')}
                        className="text-[11px] py-1.5 px-3 rounded-lg text-white transition font-bold shadow-sm"
                        style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', boxShadow:'0 2px 6px rgba(22,163,74,0.3)' }}
                      >
                        Generar plan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

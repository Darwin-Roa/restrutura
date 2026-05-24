import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { Download, Upload, CheckCircle2, Clock, ClipboardList, LayoutDashboard, Bot, Eye, X, Star, GraduationCap } from 'lucide-react';

// Convierte YYYY-MM-DD → DD/MM/YYYY. Texto legado ("enero") lo devuelve tal cual.
const formatDate = (val) => {
  if (!val) return 'Sin fecha';
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-');
    return `${d}/${m}/${y}`;
  }
  return str;
};


const STATUS_BADGE = {
  pending:     <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 flex items-center gap-1 w-fit"><Clock size={11}/> Pendiente</span>,
  in_progress: <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1 w-fit"><Upload size={11}/> Evidencia enviada</span>,
  completed:   <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200 flex items-center gap-1 w-fit"><Clock size={11}/> En revisión</span>,
  verified:    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1 w-fit"><CheckCircle2 size={11}/> Aceptada ✓</span>,
  rejected:    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1 w-fit"><X size={11}/> Rechazada</span>,
};

export const ProfesorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('plan');

  const [plan, setPlan] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [period, setPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [uploadingId, setUploadingId] = useState(null); // id o 'task_id'
  const [file, setFile] = useState(null);
  const [teacherDate, setTeacherDate] = useState('');
  const [teacherText, setTeacherText] = useState('');
  const [coursesList, setCoursesList] = useState([]);
  const [currentCourse, setCurrentCourse] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    api.get('/plans/my-plan')
      .then(res => setPlan(res.data.plan))
      .catch(() => setPlan(null))
      .finally(() => setLoading(false));

    api.get('/tasks/assignments/my-tasks')
      .then(res => { setAssignments(res.data.assignments || []); setPeriod(res.data.period); })
      .catch(() => setAssignments([]))
      .finally(() => setLoadingTasks(false));
  }, []);

  // Subir evidencia del Plan IA (PlanAction)
  const handleUploadPlanEvidence = async (actionId) => {
    if (!file) return alert('Selecciona un archivo primero');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('action_id', actionId);
    try {
      await api.post('/evidence', formData, {
        headers: { 
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      alert('✅ Evidencia enviada. El Director la revisará y decidirá si la aprueba.');
      setFile(null); setUploadingId(null);
      // Actualiza estado local a 'completed' (en revisión)
      setPlan(prev => ({
        ...prev,
        PlanActions: prev.PlanActions.map(a => a.id === actionId ? { ...a, status: 'completed' } : a)
      }));
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  // Subir evidencia de Tarea Fija (TaskAssignment)
  const handleUploadTaskEvidence = async (assignmentId) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    const activityName = assignment?.fixed_task?.activity?.toLowerCase() || '';
    const isIntegration = activityName.includes('integración curricular con otros cursos');
    
    // Determine the text response
    let finalResText = isIntegration ? coursesList.join(' | ') : teacherText.trim();

    if (!file && !teacherDate && !finalResText) return alert('Debes adjuntar un archivo o ingresar la información solicitada');
    
    const taskToSubmit = assignments.find(a => a.id === assignmentId);
    if (!file && !teacherDate && !teacherText && coursesList.length === 0) return alert('Debes adjuntar un archivo o ingresar la información solicitada');
    
    const formData = new FormData();
    if (file) formData.append('file', file);
    formData.append('task_id', assignmentId);

    let formattedDate = teacherDate;
    if (teacherDate) {
        const parts = teacherDate.split('-');
        if (parts.length === 3) formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    
    let combinedResponse = '';
    if (isIntegrationTask(taskToSubmit)) {
      combinedResponse = coursesList.length > 0 ? coursesList.join(' | ') : 'N/A';
    } else if (teacherDate) {
      combinedResponse = formattedDate;
    } else if (teacherText) {
      combinedResponse = teacherText;
    }

    if (combinedResponse) formData.append('teacher_response', combinedResponse);
    try {
      await api.post('/evidence', formData, {
        headers: { 
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      alert('✅ Tarea completada/Evidencia enviada. El Director la revisará.');
      setFile(null); setTeacherDate(''); setTeacherText(''); setCoursesList([]); setCurrentCourse(''); setUploadingId(null);
      setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, status: 'completed' } : a));
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const getTasksProgress = () => {
    if (!assignments.length) return 0;
    const done = assignments.filter(a => a.status === 'completed' || a.status === 'verified').length;
    return Math.round((done / assignments.length) * 100);
  };

  const getPlanProgress = () => {
    const actions = plan?.PlanActions || [];
    if (!actions.length) return 0;
    const done = actions.filter(a => a.status === 'completed' || a.status === 'verified').length;
    return Math.round((done / actions.length) * 100);
  };

  const isPastDeadline = (deadlineDate) => {
    if (!deadlineDate) return false;
    const limit = new Date(deadlineDate);
    if (isNaN(limit.getTime())) return false; // Si es un texto tipo "Marzo", no bloqueamos por seguridad
    limit.setHours(23, 59, 59, 999);
    return new Date() > limit;
  };

  const needsDate = (task) => {
    if (!task) return false;
    const txt = ((task.activity || '') + ' ' + (task.expected_product || '')).toLowerCase();
    return txt.includes('fecha');
  };

  const isIntegrationTask = (task) => {
    if (!task) return false;
    return (task.activity || '').toLowerCase().includes('integración curricular con otros cursos');
  };

  const addCourse = () => {
    if (currentCourse.trim()) {
      setCoursesList(prev => [...prev, currentCourse.trim()]);
      setCurrentCourse('');
    }
  };

  const removeCourse = (index) => {
    setCoursesList(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex h-screen bg-[#f9fafb] font-sans text-[13px] overflow-hidden">

      {/* Modal Vista Previa PDF */}
      {showPreview && plan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl flex flex-col" style={{width:'90vw',height:'92vh'}}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
              <div className="font-bold text-[#0C447C] text-sm flex items-center gap-2"><Eye size={18}/> Vista Previa — Plan de Mejoramiento</div>
              <div className="flex items-center gap-3">
                <a href={`${api.defaults.baseURL}/export/plan/${plan.id}/pdf?token=${sessionStorage.getItem('token')}`} target="_blank" rel="noreferrer"
                  className="bg-[#185FA5] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#0C447C] transition">
                  <Download size={14}/> Descargar PDF Oficial
                </a>
                <button onClick={() => setShowPreview(false)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"><X size={16}/></button>
              </div>
            </div>
            <iframe src={`${api.defaults.baseURL}/export/plan/${plan.id}/preview?token=${sessionStorage.getItem('token')}`} className="flex-1 w-full rounded-b-xl" title="Vista previa" />
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className="w-[240px] min-w-[240px] flex flex-col h-full text-white shadow-xl z-10"
        style={{ background: '#0f2217', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(9,132,59,0.3)', border: '1px solid rgba(9,132,59,0.5)' }}>
              <GraduationCap size={17} style={{ color: '#4ade80' }} />
            </div>
            <div>
              <div className="text-white font-bold text-[13px] leading-tight">Portal Docente</div>
              <div className="text-[10px] mt-0.5 tracking-wide font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>Unisimón · Sistemas</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          <button onClick={() => setActiveTab('plan')}
            className={`w-full flex items-center gap-3 py-2.5 px-3 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'plan'
                ? 'text-white font-semibold shadow-md'
                : 'text-white/65 hover:text-white hover:bg-white/10'
            }`}
            style={activeTab === 'plan' ? { background: 'rgba(255,255,255,0.15)', borderLeft: '3px solid #C9A84C', paddingLeft: '9px' } : {}}
          >
            <CheckCircle2 size={16}/> Plan de Mejoramiento ({period?.name || 'Actual'})
          </button>
          <button onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center gap-3 py-2.5 px-3 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'tasks'
                ? 'text-white font-semibold shadow-md'
                : 'text-white/65 hover:text-white hover:bg-white/10'
            }`}
            style={activeTab === 'tasks' ? { background: 'rgba(255,255,255,0.15)', borderLeft: '3px solid #C9A84C', paddingLeft: '9px' } : {}}
          >
            <ClipboardList size={16}/> Tareas Fijas y Roles
          </button>
        </nav>
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="text-[9px] text-white/30 text-center tracking-wider uppercase mb-3">Universidad Simón Bolívar © 2026</div>
          <button onClick={logout}
            className="w-full text-xs py-2 rounded-lg text-white transition font-semibold"
            style={{ background: '#b91c1c' }}
            onMouseEnter={e => e.target.style.background='#991b1b'}
            onMouseLeave={e => e.target.style.background='#b91c1c'}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f4f6f8]">

        {/* TopBar */}
        <div className="px-6 py-0 bg-white border-b flex items-center justify-between" style={{ borderColor: '#eaecf0', minHeight: '54px', boxShadow: '0 1px 0 #eaecf0' }}>
          <div className="flex items-center gap-3">
            <div className="w-1 h-7 rounded-full shrink-0" style={{ background: '#09843B' }} />
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[14px] text-white"
              style={{ background: '#09843B' }}
            >
              {user?.name?.charAt(0)}
            </div>
            <div>
              <span className="text-[13px] font-semibold" style={{ color: '#1e2a20' }}>Prof. {user?.name}</span>
              <div className="text-xs text-gray-400">{user?.department || 'Facultad de Ingeniería'}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {activeTab === 'tasks' && !loadingTasks && assignments.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: '#e6f4ec', border: '1px solid #d1ead9' }}>
                <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#09843B' }}>Progreso Semestral</span>
                <div className="flex items-center gap-2">
                  <div className="w-28 h-2 rounded-full overflow-hidden" style={{ background: '#d1ead9' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${getTasksProgress()}%`, background: 'linear-gradient(90deg,#09843B,#C9A84C)' }}/>
                  </div>
                  <span className="text-xs font-bold" style={{ color: '#09843B' }}>{getTasksProgress()}%</span>
                </div>
              </div>
            )}
            {activeTab === 'plan' && plan && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#e6f4ec', border: '1px solid #d1ead9' }}>
                  <span className="text-[11px] text-gray-500">Avance Plan:</span>
                  <span className="text-xs font-bold" style={{ color: '#09843B' }}>{getPlanProgress()}%</span>
                </div>
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold text-white transition shadow-sm"
                  style={{ background: 'linear-gradient(135deg,#09843B,#066b2f)', boxShadow: '0 2px 8px rgba(9,132,59,0.3)' }}
                >
                  <Eye size={14}/> Vista Previa / PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8">

          {/* ===== PLAN IA ===== */}
          {activeTab === 'plan' && (
            <>
              {loading ? (
                <div className="flex items-center justify-center h-40 text-gray-500 text-sm gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"/>Buscando planes...
                </div>
              ) : !plan ? (
                <div className="bg-white p-10 max-w-lg mx-auto mt-20 text-center rounded-xl border border-dashed border-[#cbd5e1] text-[#6b7280] shadow-sm flex flex-col items-center">
                  <LayoutDashboard className="w-12 h-12 text-[#94a3b8] mb-4"/>
                  <h3 className="font-bold text-gray-700 mb-1 text-base">Nada por aquí aún</h3>
                  <p className="text-sm">La Dirección aún no te ha oficializado un Plan de Mejoramiento para el semestre actual.</p>
                </div>
              ) : (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {/* Diagnóstico */}
                  <div className="bg-white p-6 rounded-xl border border-[#e5e7eb] shadow-sm">
                    <h3 className="font-bold text-[11px] text-[#0C447C] mb-3 uppercase tracking-wider flex items-center gap-2"><Bot size={14}/> Diagnóstico Copilot</h3>
                    <p className="text-[13px] text-[#4b5563] leading-relaxed">{plan.diagnosis_text || 'Plan generado por el Director de Programa.'}</p>
                  </div>

                  {/* Matriz de Acciones */}
                  <div className="bg-white p-6 rounded-xl border border-[#e5e7eb] shadow-sm">
                    <h3 className="font-bold text-[11px] text-[#0C447C] mb-5 uppercase tracking-wider">4. Matriz de Acciones y Entregables — Plan de Mejoramiento</h3>
                    <div className="space-y-4">
                      {(plan.PlanActions || []).map(action => (
                        <div key={action.id} className="border border-[#e5e7eb] p-5 rounded-lg bg-gray-50/50 hover:bg-white hover:border-[#185FA5] transition-all shadow-sm">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <div className="font-bold text-[13px] text-[#1e293b] mb-1">{action.concrete_action}</div>
                              <div className="text-[12px] text-[#475569] mb-1"><strong className="text-[#334155]">Aspecto a mejorar:</strong> {action.aspect}</div>
                              <div className="text-[12px] text-[#475569] mb-1"><strong className="text-[#334155]">Producto verificable:</strong> {action.verifiable_product}</div>
                              <div className="text-[12px] flex items-center gap-3">
                                <span className={isPastDeadline(action.deadline) ? 'text-red-600 font-bold' : 'text-gray-400'}>
                                  📅 Fecha límite: {formatDate(action.deadline)}
                                </span>
                                {action.is_debt && (
                                  <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase border border-amber-200">Deuda Académica</span>
                                )}
                                {isPastDeadline(action.deadline) && action.status !== 'verified' && (
                                  <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold uppercase border border-red-200">Plazo Vencido</span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-3 shrink-0 min-w-[160px]">
                              {/* Badge de estado — solo lectura, el Director decide */}
                              {STATUS_BADGE[action.status] || STATUS_BADGE.pending}

                              {/* Botón evidencia — bloqueado si está verificado o si pasó la fecha */}
                              {action.status !== 'verified' && (
                                isPastDeadline(action.deadline) ? (
                                  <div className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded border border-red-100 text-center w-full">
                                    No se permite entrega: fecha límite vencida.
                                  </div>
                                ) : uploadingId === action.id ? (
                                  <div className="text-right w-full bg-white p-3 rounded-lg border border-gray-300 shadow-lg">
                                    <p className="text-[10px] text-gray-400 mb-2">Sube tu archivo (PDF recomendado). El Director lo revisará.</p>
                                    <input type="file" onChange={e => setFile(e.target.files[0])}
                                      className="text-[10px] w-full mb-3 file:bg-[#185FA5] file:text-white file:border-0 file:rounded file:px-3 file:py-1.5 file:font-medium file:cursor-pointer"/>
                                    <div className="flex gap-2 justify-end">
                                      <button onClick={() => {setUploadingId(null); setFile(null); setTeacherDate(''); setTeacherText('');}} className="text-[11px] text-gray-500 px-2 py-1">Cancelar</button>
                                      <button onClick={() => handleUploadPlanEvidence(action.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded text-[11px] font-bold hover:bg-blue-700">Enviar al Director</button>
                                    </div>
                                  </div>
                                ) : (
                                  <button onClick={() => setUploadingId(action.id)}
                                    className="flex items-center gap-1.5 text-[#185FA5] bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-[11px] font-bold transition-all">
                                    <Upload size={14}/> {action.status === 'completed' ? 'Actualizar evidencia' : 'Entregar Evidencia'}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===== TAREAS FIJAS Y ROLES ===== */}
          {activeTab === 'tasks' && (
            <>
              {loadingTasks ? (
                <div className="flex items-center justify-center h-40 text-gray-500 text-sm gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"/>Cargando tareas...
                </div>
              ) : assignments.length === 0 ? (
                <div className="bg-white p-10 max-w-lg mx-auto mt-20 text-center rounded-xl border border-dashed border-[#cbd5e1] text-[#6b7280] shadow-sm flex flex-col items-center">
                  <ClipboardList className="w-12 h-12 text-[#94a3b8] mb-4"/>
                  <h3 className="font-bold text-gray-700 mb-1 text-base">Sin tareas asignadas</h3>
                  <p className="text-sm">El Director aún no ha abierto el periodo activo ni ha clonado tus tareas institucionales.</p>
                </div>
              ) : (
                <div className="max-w-5xl mx-auto">
                  <p className="text-sm text-gray-600 mb-6 font-medium">
                    Estas son las <strong>{assignments.length}</strong> actividades obligatorias de tus funciones sustantivas durante el periodo <strong className="text-blue-800">{period?.name}</strong>.
                    Adjunta la evidencia de cada una y el Director será quien apruebe o rechace tu cumplimiento.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {assignments.map(a => (
                      <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {a.fixed_task?.management_area}
                            </span>
                            {a.period_id !== period?.id && (
                              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                ⚖️ Deuda: {a.period?.name || 'Anterior'}
                              </span>
                            )}
                            <span className={`text-[10px] font-bold flex items-center gap-1 ${isPastDeadline(a.custom_deadline || a.fixed_task?.deadline_month) ? 'text-red-600' : 'text-gray-400'}`}>
                              <Clock size={11}/> {formatDate(a.custom_deadline || a.fixed_task?.deadline_month)}
                              {isPastDeadline(a.custom_deadline || a.fixed_task?.deadline_month) && a.status !== 'verified' && (
                                <span className="bg-red-100 text-red-700 px-1 py-0.5 rounded text-[8px] uppercase border border-red-200">Vencido</span>
                              )}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-800 text-[13px] mb-2 leading-tight">{a.fixed_task?.activity}</h4>
                          <p className="text-[11px] text-gray-500 italic mb-4">
                            <strong>Entregable:</strong> {a.fixed_task?.expected_product}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-gray-100 space-y-3">
                          {/* Estado — solo lectura */}
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-gray-500">Estado:</span>
                            {STATUS_BADGE[a.status] || STATUS_BADGE.pending}
                          </div>

                          {/* Botones de acción */}
                          {a.status !== 'verified' && (
                            isPastDeadline(a.custom_deadline || a.fixed_task?.deadline_month) ? (
                              <div className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded border border-red-100 text-center w-full uppercase">
                                Entrega bloqueada: plazo expirado
                              </div>
                            ) : uploadingId === `task_${a.id}` ? (
                              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-[10px] text-gray-400 mb-2">Adjunta archivo O diligencia los campos correspondientes.</p>
                                
                                <div className="flex flex-col gap-2 mb-2">
                                  {needsDate(a.fixed_task) && (
                                    <input type="date"
                                      value={teacherDate} onChange={e => setTeacherDate(e.target.value)}
                                      className="text-[11px] w-full border border-gray-300 rounded px-2 py-1.5 outline-none" title="Fecha de ejecución"/>
                                  )}
                                  
                                  {isIntegrationTask(a.fixed_task) && (
                                      <div className="flex flex-col gap-1">
                                        <div className="flex gap-1">
                                          <input type="text" placeholder="Nombre del curso" 
                                            value={currentCourse} onChange={e => setCurrentCourse(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addCourse()}
                                            className="text-[11px] flex-1 border border-gray-300 rounded px-2 py-1.5 outline-none" />
                                          <button onClick={addCourse} className="bg-blue-100 text-blue-700 px-3 py-1 text-[11px] font-bold rounded hover:bg-blue-200">Añadir</button>
                                        </div>
                                        {coursesList.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {coursesList.map((course, i) => (
                                              <span key={i} className="text-[10px] bg-white border border-gray-300 px-2 py-1 rounded flex items-center gap-1">
                                                {course} <X size={10} className="cursor-pointer text-red-500 hover:text-red-700" onClick={() => removeCourse(i)} />
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                </div>

                                <input type="file" onChange={e => setFile(e.target.files[0])}
                                  className="text-[10px] w-full mb-2 file:bg-blue-100 file:text-blue-800 file:border-0 file:rounded file:px-2 file:py-1 file:cursor-pointer"/>
                                
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => {setUploadingId(null); setFile(null); setTeacherDate(''); setTeacherText(''); setCoursesList([]); setCurrentCourse('');}} className="text-[10px] text-gray-500 border px-2 py-1 bg-white rounded">Cancelar</button>
                                  <button onClick={() => handleUploadTaskEvidence(a.id)} className="bg-[#185FA5] text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-blue-800">Enviar al Director</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setUploadingId(`task_${a.id}`)}
                                className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-2 text-[11px] font-bold rounded-lg hover:bg-blue-600 hover:text-white transition flex justify-center items-center gap-1">
                                <Upload size={12}/> {(a.status === 'completed' || a.status === 'in_progress') ? 'Actualizar evidencia' : 'Adjuntar Evidencia'}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

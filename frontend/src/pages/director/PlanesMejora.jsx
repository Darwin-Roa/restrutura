import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Target, CheckCircle2, ChevronRight, FileText, Search, Activity, AlertCircle, Clock, Download, Trash2, ChevronDown, ChevronUp, XCircle, Zap, Layers, ListChecks, Pencil } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

// Convierte YYYY-MM-DD → DD/MM/YYYY. Si llega texto tipo "enero" lo devuelve tal cual.
const formatDate = (val) => {
  if (!val) return null;
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-');
    return `${d}/${m}/${y}`;
  }
  return str;
};

export const PlanesMejora = () => {
  const [trackingData, setTrackingData] = useState([]);
  const [periodName, setPeriodName] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Expanded teacher state
  const [searchParams] = useSearchParams();
  const initialTeacherId = searchParams.get('teacher_id') ? parseInt(searchParams.get('teacher_id'), 10) : null;
  const [expandedTeacherId, setExpandedTeacherId] = useState(initialTeacherId);
  const [teacherTasks, setTeacherTasks] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showPlanDoc, setShowPlanDoc] = useState(false);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => {
    fetchTracking();
  }, []);

  const fetchTracking = async () => {
    try {
      const res = await api.get('/history/tracking');
      setTrackingData(res.data.tracking || []);
      setPeriodName(res.data.period || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (planId) => {
    if (!window.confirm('¿Estás seguro de oficializar este plan? El docente recibirá una notificación formal.')) return;
    try {
      await api.patch(`/plans/${planId}/status`, { status: 'approved' });
      alert('Plan oficializado. El profesor ha sido notificado.');
      fetchTracking();
      refreshDetail();
    } catch (e) {
      alert('Error oficializando plan.');
    }
  };

  const handleDownloadPDF = async (planId, professorName) => {
    try {
      const res = await api.get(`/export/plan/${planId}/pdf`, { responseType: 'blob' });
      // Verificar que realmente recibimos un PDF (no un JSON de error)
      const contentType = res.headers['content-type'] || '';
      if (!contentType.includes('pdf')) {
        const text = await res.data.text();
        console.error('Respuesta inesperada del servidor:', text);
        throw new Error('El servidor no devolvió un PDF válido.');
      }
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Plan_Mejoramiento_${professorName.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);
    } catch (e) {
      console.error('Error PDF:', e);
      const confirm = window.confirm(`No se pudo generar el PDF: ${e.message}\n\n¿Deseas abrir la vista previa en una nueva pestaña?`);
      if (confirm) handlePreviewPlan(planId);
    }
  };

  const handlePreviewPlan = (planId) => {
    const token = sessionStorage.getItem('token');
    // Abre el HTML del plan en una nueva pestaña para vista rápida
    window.open(`${api.defaults.baseURL}/export/plan/${planId}/preview?token=${token}`, '_blank');
  };


  const handleDeletePlan = async (planId) => {
    if (!window.confirm('⚠️ ADVERTENCIA: ¿Estás SEGURO de eliminar este plan? Esto borrará todas las acciones asociadas a este docente para el periodo actual. Esta acción NO es reversible.')) return;
    try {
      await api.delete(`/plans/${planId}`);
      alert('Plan eliminado correctamente.');
      setShowPlanDoc(false);
      fetchTracking();
      refreshDetail();
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Desconocido';
      alert(`Error eliminando el plan: ${msg}`);
      console.error(e);
    }
  };

  const handleVerifyEvidence = async (evidenceId, approved) => {
    try {
      await api.patch(`/evidence/${evidenceId}/verify`, { is_approved: approved });
      refreshDetail();
      fetchTracking();
    } catch (err) {
      alert('Error al procesar verificación.');
    }
  };

  const refreshDetail = () => {
    if (expandedTeacherId) {
      setLoadingDetail(true);
      setDetailError(null);
      api.get(`/history/teacher/${expandedTeacherId}/tasks`)
        .then(res => setTeacherTasks(res.data))
        .catch(err => {
          console.error(err);
          setDetailError("Error al cargar los datos del docente. El servidor reportó un problema.");
        })
        .finally(() => setLoadingDetail(false));
    }
  };

  const [editingDeadlineId, setEditingDeadlineId] = useState(null);
  const [newDeadline, setNewDeadline] = useState('');

  const handleUpdateDeadline = async (assignmentId, type) => {
    try {
      if (type === 'fixed') {
        const payload = { custom_deadline: newDeadline };
        const res = await api.patch(`/tasks/assignments/${assignmentId}/deadline`, payload);
        if (res.data.success) {
           // Success
        }
      } else if (type === 'action') {
        const payload = { deadline: newDeadline };
        const res = await api.patch(`/plans/actions/${assignmentId}/deadline`, payload);
        if (res.data.success) {
           // Success
        }
      }
      setEditingDeadlineId(null);
      refreshDetail();
    } catch (e) {
      alert('Error actualizando la fecha límite: ' + (e.response?.data?.message || e.message));
    }
  };

  const parseArr = (val) => {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    try {
      let parsed = val;
      while (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return typeof val === 'string' ? [val] : [];
    }
  };

  useEffect(() => {
    setShowPlanDoc(false); // Reset al cambiar de profesor
    if (expandedTeacherId) {
      setLoadingDetail(true);
      setDetailError(null);
      api.get(`/history/teacher/${expandedTeacherId}/tasks`)
        .then(res => setTeacherTasks(res.data))
        .catch(err => {
          console.error(err);
          setDetailError("No se pudo cargar la trazabilidad de este docente. Verifique su conexión o contacte soporte.");
        })
        .finally(() => setLoadingDetail(false));
    } else {
      setTeacherTasks(null);
      setDetailError(null);
    }
  }, [expandedTeacherId]);

  const drafts = trackingData.filter(d => d.planStatus === 'borrador');
  const filteredData = trackingData.filter(d => 
     (d.teacher?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6 bg-white p-5 rounded-2xl shadow-sm" style={{ border: '1px solid #eaecf0' }}>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#e6f4ec' }}>
            <Activity style={{ color: '#09843B' }} size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#0f2217' }}>Seguimiento Institucional</h1>
            <p className="text-xs text-gray-400 mt-0.5">Gestione planes de mejora y audite el cumplimiento de compromisos.</p>
          </div>
        </div>
        <Link to="/director/generar"
          className="text-white text-xs font-bold py-2.5 px-5 rounded-xl transition flex items-center gap-2"
          style={{ background: '#09843B', boxShadow: '0 2px 8px rgba(9,132,59,0.28)' }}
        >
          + Nuevo Plan IA
        </Link>
      </div>

      {/* SECCIÓN DE BORRADORES PENDIENTES - SOLO SI HAY */}
      {drafts.length > 0 && expandedTeacherId === null && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between">
              <h2 className="text-orange-900 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Zap className="fill-orange-600 text-orange-600" size={16}/> Revisión Prioritaria: {drafts.length} Borradores Generados
              </h2>
              <span className="text-[10px] bg-orange-200 text-orange-800 px-2 py-0.5 rounded font-bold">IA COPILOT</span>
           </div>
           
           <div className="grid grid-cols-1 gap-3">
              {drafts.map(d => (
                <div key={d.teacher.id} className="bg-white p-4 rounded-xl border border-orange-100 flex items-center justify-between hover:shadow-md transition">
                   <div className="flex items-center gap-4">
                      <div className="bg-orange-50 w-10 h-10 rounded-full flex items-center justify-center text-orange-600 font-bold border border-orange-100">
                        {d.teacher?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm">{d.teacher.name}</div>
                        <div className="text-[10px] text-gray-500">{d.teacher.department}</div>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => handleDeletePlan(d.planId)} className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Descartar Borrador"><Trash2 size={18}/></button>
                      <button onClick={() => setExpandedTeacherId(d.teacher.id)} className="bg-white border border-gray-300 text-gray-700 font-bold px-4 py-2 rounded-lg text-[11px] hover:bg-gray-50 transition">Ver Borrador</button>
                      <button onClick={() => handleApprove(d.planId)} className="bg-orange-600 text-white font-bold px-5 py-2 rounded-lg text-[11px] hover:bg-orange-700 transition shadow-sm">Oficializar</button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm min-h-[500px]">
         <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
           <div className="flex items-center gap-2 text-[#0C447C] font-bold">
             <Target size={18}/> Listado de Docentes • {periodName}
           </div>
           
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Filtrar por nombre..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 min-w-[300px]"
             />
           </div>
         </div>

         {loading ? (
             <div className="flex justify-center p-12 text-gray-400 font-medium tracking-wide">Actualizando datos de trazabilidad...</div>
         ) : filteredData.length === 0 ? (
             <div className="text-center p-12 text-gray-400 italic">No se encontraron docentes con los criterios de búsqueda.</div>
         ) : expandedTeacherId === null ? (
            // LISTA MAESTRA DE AVANCE
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredData.map(item => {
                 const isDraft = item.planStatus === 'borrador';
                 const isApproved = item.planStatus === 'approved';

                 return (
                  <div key={item.teacher.id} onClick={() => setExpandedTeacherId(item.teacher.id)} 
                    className={`bg-white border-2 rounded-2xl p-6 transition flex flex-col justify-between cursor-pointer group relative overflow-hidden ${isDraft ? 'border-orange-100 hover:border-orange-300 shadow-sm' : 'border-gray-100 hover:border-blue-200 hover:shadow-xl'}`}>
                     
                     {isDraft && <div className="absolute top-0 right-0 bg-orange-500 text-white text-[8px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-tighter">Borrador IA</div>}
                     {isApproved && <div className="absolute top-0 right-0 bg-green-600 text-white text-[8px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-tight">Plan Oficial</div>}
                     
                     <div>
                        <div className="flex justify-between items-start mb-4">
                           <div className={`text-[10px] uppercase font-black px-2 py-1 rounded border ${isDraft ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                             {item.totalTasks} Compromisos
                           </div>
                        </div>

                        <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-[#09843B] transition truncate">{item.teacher.name}</h3>
                        <p className="text-[11px] text-gray-400 mb-6 font-medium uppercase tracking-tight">{item.teacher.department}</p>
                        
                        <div className="mb-4">
                           <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1.5">
                             <span>Avance de Tareas</span>
                             <span className={item.progress === 100 ? 'text-[#09843B]' : 'text-[#09843B]'}>{item.progress}%</span>
                           </div>
                           <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                             <div className={`h-full rounded-full transition-all duration-700`} style={{ width: `${item.progress}%`, background: item.progress === 100 ? '#09843B' : 'linear-gradient(90deg,#09843B,#4ade80)' }}></div>
                           </div>
                           <p className="text-[10px] text-gray-400 mt-2 font-medium italic">{item.verifiedTasks} de {item.totalTasks} evidencias aprobadas</p>
                        </div>
                     </div>
                     
                     <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-bold" style={{ color: '#09843B' }}>
                        <span>Gestionar Trazabilidad</span>
                        <ChevronRight size={16} className="transform group-hover:translate-x-1 transition"/>
                     </div>
                  </div>
                )})}
            </div>
         ) : (
            // VISTA DETALLE Y TABLA DE ESTADOS
            (() => {
              const tData = filteredData.find(d => d.teacher.id === expandedTeacherId);
              if (!tData) return null;

              return (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                   <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button onClick={() => setExpandedTeacherId(null)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-500 transition mr-2 flex gap-1 items-center font-bold text-xs"><span className="text-lg leading-none">&larr;</span> Atrás</button>
                          <div className="w-12 h-12 rounded-full bg-[#E6F4EC] flex items-center justify-center text-[#09843B] font-bold text-lg border border-green-100">
                            {tData.teacher?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-xl text-gray-800 leading-tight">{tData.teacher.name}</h3>
                            </div>
                            <p className="text-xs text-gray-500">{tData.teacher.department} • Periodo {periodName}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Progreso Final</div>
                          <div className="text-2xl font-black" style={{ color: '#09843B' }}>{tData.progress}%</div>
                        </div>
                      </div>

                      {/* Feedback de Error */}
                      {detailError && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 shadow-sm animate-in shake duration-500">
                           <AlertCircle size={20}/>
                           <div className="text-xs font-bold uppercase tracking-tight">{detailError}</div>
                        </div>
                      )}

                      {/* Notificar si hay un plan borrador pendiente */}
                      {teacherTasks?.rawPlans?.filter(p => p.status === 'borrador' && p.period_id === teacherTasks.activePeriodId).map(draftPlan => (
                         <div key={draftPlan.id} className="mt-6 p-5 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between shadow-sm border-l-4">
                            <div className="flex items-center gap-4">
                              <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                                <AlertCircle size={24}/>
                              </div>
                              <div>
                                <h4 className="font-bold text-orange-900 text-sm">Plan Sugerido por Copilot IA (Borrador)</h4>
                                <p className="text-xs text-orange-700">Este docente tiene un plan de mejoramiento generado que aún no ha sido oficializado por el Director.</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                               <button 
                                onClick={() => handleDeletePlan(draftPlan.id)} 
                                className="bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm"
                                title="Eliminar borrador y re-generar"
                              >
                                 <Trash2 size={16}/>
                              </button>
                              <button 
                                onClick={() => handleApprove(draftPlan.id)} 
                                className="bg-orange-600 hover:bg-orange-700 shadow-md text-white font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all hover:scale-105"
                              >
                                 <CheckCircle2 size={18}/> Oficializar Plan
                              </button>
                            </div>
                         </div>
                      ))}

                      {/* Visor de Plan Oficializado */}
                      {(() => {
                        const officialPlan = teacherTasks?.rawPlans?.find(p => p.status === 'approved' && p.period_id === teacherTasks.activePeriodId);
                        if (!officialPlan) return null;

                        return (
                          <div className="mt-6 border border-green-100 rounded-xl bg-green-50/20 shadow-sm overflow-hidden animate-in slide-in-from-top duration-300">
                             <div className="flex items-center justify-between px-5 py-3 bg-green-100/30 border-b border-green-100">
                                <div className="flex items-center gap-2 font-black text-green-800 text-[10px] uppercase tracking-widest">
                                  <FileText size={16} className="text-green-600"/> Documentación del Plan Oficial
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleDownloadPDF(officialPlan.id, tData.teacher.name)}
                                    className="px-3 py-1.5 bg-[#09843B] text-white text-[10px] font-bold rounded shadow hover:bg-green-800 flex items-center gap-2 transition"
                                  >
                                    <Download size={14}/> CARTA PDF
                                  </button>
                                   <button 
                                     onClick={() => handlePreviewPlan(officialPlan.id)}
                                     className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded shadow flex items-center gap-2 transition"
                                     title="Abrir carta del plan en el navegador"
                                   >
                                     <FileText size={14}/> VER CARTA
                                   </button>
                                  <button 
                                    onClick={() => setShowPlanDoc(!showPlanDoc)}
                                    className="px-3 py-1.5 bg-white text-green-600 border border-green-200 text-[10px] font-bold rounded hover:bg-green-50 flex items-center gap-2 transition"
                                  >
                                    {showPlanDoc ? <><ChevronUp size={14}/> OCULTAR DATOS</> : <><ChevronDown size={14}/> VER DETALLES</>}
                                  </button>
                                  <button 
                                    onClick={() => handleDeletePlan(officialPlan.id)}
                                    className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold rounded hover:bg-red-100 flex items-center gap-2 transition"
                                    title="Eliminar plan para corregir errores"
                                  >
                                    <Trash2 size={14}/> ELIMINAR
                                  </button>
                                </div>
                             </div>
                             
                             {showPlanDoc && (
                               <div className="p-6 text-sm text-gray-700 space-y-6 animate-in slide-in-from-top duration-300 bg-white/50">
                                  <div>
                                    <h5 className="font-black text-green-900 text-[10px] uppercase mb-2 tracking-widest flex items-center gap-1 border-b border-green-100 pb-1 w-fit">💬 Diagnóstico Situacional</h5>
                                    <p className="bg-white/80 p-4 rounded-lg border border-green-50 leading-relaxed italic text-xs shadow-sm">{officialPlan.diagnosis_text}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-6">
                                     <div className="bg-green-50/30 p-4 rounded-xl border border-green-100 shadow-sm">
                                        <h5 className="font-black text-green-900 text-[10px] uppercase mb-3 tracking-widest border-b border-green-200 pb-1 w-fit">🌟 Fortalezas Identificadas</h5>
                                        <ul className="list-disc list-inside space-y-1.5 text-[11px] text-green-800">
                                          {parseArr(officialPlan.strengths).map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                     </div>
                                     <div className="bg-orange-50/30 p-4 rounded-xl border border-orange-100 shadow-sm">
                                        <h5 className="font-black text-orange-900 text-[10px] uppercase mb-3 tracking-widest border-b border-orange-200 pb-1 w-fit">📈 Oportunidades de Mejora</h5>
                                        <ul className="list-disc list-inside space-y-1.5 text-[11px] text-orange-800">
                                          {parseArr(officialPlan.improvement_opps).map((o, i) => <li key={i}>{o}</li>)}
                                        </ul>
                                     </div>
                                  </div>
                               </div>
                             )}
                          </div>
                        );
                      })()}
                   </div>

                   <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-4">
                       <div className="bg-gray-50/80 px-5 py-4 border-b border-gray-100">
                         <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: '#09843B' }}><Target size={14}/> Radar de Cumplimiento</h4>
                       </div>
                       <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[#f8fafc] border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="px-6 py-4 font-semibold">Naturaleza</th>
                              <th className="px-6 py-4 font-semibold">Compromiso / Acción</th>
                              <th className="px-6 py-4 font-semibold text-center">Plazo</th>
                              <th className="px-6 py-4 font-semibold text-center whitespace-nowrap">Historial / Evidencia</th>
                              <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Estado Trazabilidad</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {loadingDetail ? (
                              <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-xs italic">Cargando base de datos de tareas...</td></tr>
                            ) : teacherTasks ? (
                              (() => {
                                // Separar por naturaleza principal
                                const institutionalTasks = (teacherTasks.fixedTasks || []).map(t => ({ ...t, type: 'fixed' }));
                                const aiPlanActions = (teacherTasks.planActions || []).map(a => ({ ...a, type: 'action' }));

                                const renderItems = (items, title, colorClass, iconLabel) => {
                                  if (items.length === 0) return null;
                                  
                                  const courseGroups = {};
                                  items.forEach(it => {
                                    const cName = it.course?.name || 'General / Institucional';
                                    if (!courseGroups[cName]) courseGroups[cName] = [];
                                    courseGroups[cName].push(it);
                                  });

                                  return (
                                    <React.Fragment>
                                      <tr className="bg-gray-100/80">
                                        <td colSpan="5" className={`px-6 py-2.5 text-[11px] font-black ${colorClass} uppercase tracking-widest border-y border-gray-200`}>
                                          {iconLabel} {title}
                                        </td>
                                      </tr>
                                      {Object.entries(courseGroups).map(([cName, cItems]) => (
                                        <React.Fragment key={cName}>
                                          <tr className="bg-white">
                                            <td colSpan="5" className="px-6 py-1.5 text-[10px] font-bold text-gray-400 uppercase italic bg-gray-50/30">
                                              &nbsp;&nbsp;↳ Curso: {cName}
                                            </td>
                                          </tr>
                                          {cItems.map(item => {
                                            const evidencesList = item.Evidence ? [item.Evidence] : (item.evidences || []);
                                            const sortedEvidences = [...evidencesList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                                            const ev = sortedEvidences[0];
                                            
                                            return (
                                              <tr key={`${item.type}-${item.id}`} className="hover:bg-blue-50/30 transition group/row border-b border-gray-50 last:border-0">
                                                <td className="px-6 py-4">
                                                  <div className="flex flex-col gap-1">
                                                    {item.type === 'fixed' 
                                                      ? <span className="text-[9px] font-black text-blue-600 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded shadow-sm w-fit">INSTITUCIONAL</span>
                                                      : <span className="text-[9px] font-black text-purple-600 border border-purple-200 bg-purple-50 px-2 py-0.5 rounded shadow-sm w-fit">MEJORAMIENTO IA</span>
                                                    }
                                                    {item.FixedTask?.scope === 'individual' && (
                                                      <span className="text-[8px] font-black bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded shadow-xs w-fit uppercase">👤 Personalizada</span>
                                                    )}
                                                    {item.FixedTask?.scope === 'global' && (
                                                      <span className="text-[8px] font-black bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded shadow-xs w-fit uppercase">🌐 Global</span>
                                                    )}
                                                  </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-normal max-w-md">
                                                  <div className="flex items-center gap-2 mb-0.5">
                                                    <div className="text-xs font-bold text-gray-800">{item.FixedTask?.activity || item.concrete_action}</div>
                                                    {item.carry_over_count > 0 && (
                                                      <span className="bg-red-100 text-red-600 text-[9px] px-1.5 py-0.5 rounded font-black border border-red-200" title={`Arrastrada ${item.carry_over_count} vez/veces`}>
                                                        ⚠️ ARRASTRADA
                                                      </span>
                                                    )}
                                                  </div>
                                                  <div className="text-[10px] text-gray-500 line-clamp-1 group-hover/row:line-clamp-none transition-all cursor-help">
                                                    {item.FixedTask?.expected_product || item.verifiable_product}
                                                  </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-500 text-[10px] uppercase text-center">
                                                  {editingDeadlineId === `${item.type}-${item.id}` ? (
                                                     <div className="flex items-center gap-1 justify-center" onClick={(e) => e.stopPropagation()}>
                                                       <input 
                                                         type="date"
                                                         autoFocus
                                                         value={newDeadline} 
                                                         onChange={e => setNewDeadline(e.target.value)} 
                                                         className="w-32 border border-blue-400 rounded px-1.5 py-1 text-xs text-blue-900 font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
                                                         placeholder="Mes/Fecha" 
                                                       />
                                                       <button onClick={(e) => { e.stopPropagation(); handleUpdateDeadline(item.id, item.type); }} className="text-white bg-green-500 hover:bg-green-600 p-1 rounded transition shadow-sm"><CheckCircle2 size={12}/></button>
                                                       <button onClick={(e) => { e.stopPropagation(); setEditingDeadlineId(null); }} className="text-white bg-red-400 hover:bg-red-500 p-1 rounded transition shadow-sm"><XCircle size={12}/></button>
                                                     </div>
                                                  ) : (
                                                     <div className="flex items-center gap-2 justify-center cursor-pointer bg-gray-50 hover:bg-blue-50 px-2 py-1.5 rounded-lg border border-transparent hover:border-blue-100 transition-all" 
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingDeadlineId(`${item.type}-${item.id}`);
                                                            // Normalizar: el input[type=date] requiere YYYY-MM-DD
                                                            const rawVal = item.type === 'fixed'
                                                              ? (item.custom_deadline || item.FixedTask?.deadline_month || '')
                                                              : (item.deadline || '');
                                                            const cleanVal = /^\d{4}-\d{2}-\d{2}$/.test(rawVal) ? rawVal : '';
                                                            setNewDeadline(cleanVal);
                                                          }}
                                                          title="Clic para asignar un plazo especial a este profesor"
                                                     >
                                                       {item.type === 'fixed' ? (
                                                          (() => {
                                                            const raw = item.custom_deadline || item.FixedTask?.deadline_month;
                                                            const display = formatDate(raw);
                                                            return display
                                                              ? <span className={item.custom_deadline ? 'text-blue-700 bg-blue-100 px-2 py-1 rounded shadow-sm' : 'text-gray-600'}>{display}</span>
                                                              : <span className="text-gray-400 italic text-[10px]">Sin fecha</span>;
                                                          })()
                                                       ) : (
                                                          (() => {
                                                            const display = formatDate(item.deadline);
                                                            return display
                                                              ? <span className="text-gray-600">{display}</span>
                                                              : <span className="text-gray-400 italic text-[10px]">Sin fecha</span>;
                                                          })()
                                                       )}
                                                       <span className="text-blue-400"><Pencil size={12}/></span>
                                                     </div>
                                                  )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                   {ev ? (
                                                     <a 
                                                       href={`${api.defaults.baseURL}/evidence/view/${ev.id}?token=${sessionStorage.getItem('token')}`} 
                                                       target="_blank" 
                                                       rel="noreferrer"
                                                       className="inline-flex items-center gap-1 text-[#185FA5] hover:text-[#0C447C] font-bold text-[10px] transition bg-blue-50 px-2 py-1 rounded border border-blue-100 shadow-sm hover:shadow"
                                                     >
                                                       <FileText size={12}/> VISTA RÁPIDA
                                                     </a>
                                                   ) : (
                                                     <span className="text-[10px] text-gray-300 italic">Sin archivo</span>
                                                   )}
                                                </td>
                                                 <td className="px-6 py-4 text-right">

                                                    {/*

                                                      Lógica de estados:

                                                      - Aprobada (verified=true + verified_at): badge Verde ✅

                                                      - Con evidencia (incluyendo rechazadas): siempre mostrar botones Aceptar/Rechazar

                                                      - Sin evidencia: mostrar badge de estado computado

                                                    */}

                                                    {ev && ev.verified === true && ev.verified_at ? (

                                                      <span className="text-green-700 font-bold bg-green-100 border border-green-200 px-3 py-1 rounded shadow-sm text-[10px] uppercase flex items-center gap-1 w-fit ml-auto"><CheckCircle2 size={12}/> Aprobada</span>

                                                    ) : ev ? (

                                                        <div className="flex items-center justify-end gap-1.5">

                                                          <button onClick={() => handleVerifyEvidence(ev.id, true)} className="bg-green-600 text-white px-2.5 py-1 text-[10px] font-bold rounded flex items-center gap-1 hover:bg-green-700 transition shadow-sm"><CheckCircle2 size={12}/> Aceptar</button>

                                                          <button onClick={() => handleVerifyEvidence(ev.id, false)} className="bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 text-[10px] font-bold rounded flex items-center gap-1 hover:bg-red-100 transition shadow-sm"><XCircle size={12}/> Rechazar</button>

                                                        </div>


                                                    ) : (

                                                      <>

                                                        {item.computed_status === 'Realizado' && <span className="text-green-700 font-bold bg-green-100 border border-green-200 px-3 py-1 rounded shadow-sm text-[10px] uppercase flex items-center gap-1 w-fit ml-auto"><CheckCircle2 size={12}/> Realizada</span>}

                                                        {item.computed_status === 'Pendiente' && <span className="text-yellow-700 font-bold bg-yellow-100 border border-yellow-200 px-3 py-1 rounded shadow-sm text-[10px] uppercase flex items-center gap-1 w-fit ml-auto"><Clock size={12}/> Faltante (Pendiente)</span>}

                                                        {item.computed_status === 'Retrasado' && <span className="text-red-700 font-bold bg-red-100 border border-red-200 px-3 py-1 rounded shadow-sm text-[10px] uppercase flex items-center gap-1 w-fit ml-auto"><AlertCircle size={12}/> Faltante (Fuera de fecha)</span>}

                                                      </>

                                                    )}

                                                 </td>
                                              </tr>
                                            );
                                          })}
                                        </React.Fragment>
                                      ))}
                                    </React.Fragment>
                                  );
                                };

                                return (
                                  <React.Fragment>
                                    {renderItems(institutionalTasks, 'Tareas Institucionales / Fijas', 'text-blue-800', '🏢')}
                                    {renderItems(aiPlanActions, 'Plan de Mejoramiento IA (Copilot)', 'text-purple-800', '🤖')}
                                    {institutionalTasks.length === 0 && aiPlanActions.length === 0 && (
                                       <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No se han detectado responsabilidades asignadas.</td></tr>
                                    )}
                                  </React.Fragment>
                                );
                              })()
                            ) : null}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </div>
              );
            })()
         )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { Bot, Save, FileSignature, Layers, Zap, AlertCircle, CheckCircle2, Loader2, ListChecks, Trash2, XCircle } from 'lucide-react';

export const GeneratePlan = () => {
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' | 'massive'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  
  const [teachers, setTeachers] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selection, setSelection] = useState({ teacher_id: '', period_id: '' });
  
  const navigate = useNavigate();

  const [allEvaluations, setAllEvaluations] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [error, setError] = useState(null);

  // Estados para Generación Masiva
  const [isProcessingMassive, setIsProcessingMassive] = useState(false);
  const [massJobId, setMassJobId] = useState(null);
  const [massProgress, setMassProgress] = useState(null);
  const [debugTotal, setDebugTotal] = useState(0);
  const [debugPeriods, setDebugPeriods] = useState([]);

  const intervalRef = React.useRef(null);

  const parseArr = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { 
      const parsed = JSON.parse(val); 
      return Array.isArray(parsed) ? parsed : (typeof parsed === 'string' ? [parsed] : []);
    } catch (e) { 
      return typeof val === 'string' ? [val] : []; 
    }
  };

  const normalizePlan = (p) => ({
    ...p,
    period_id: p.period_id || p.PeriodId || p.period?.id || 0
  });

  const fetchData = async () => {
    setError(null);
    try {
      const [tp, pp, hist] = await Promise.all([
        api.get('/users?role=profesor'),
        api.get('/periods'),
        api.get('/history/global')
      ]);
      setTeachers((tp.data.users || []).filter(u => u.is_active));
      const activePeriods = pp.data.periods.filter(p => p.is_active);
      setPeriods(activePeriods);
      if (activePeriods.length > 0) {
        setSelection(prev => ({ ...prev, period_id: activePeriods[0].id }));
      }
      setAllEvaluations(hist.data.data.evaluations_timeline || []);
      // Normalización inmediata al recibir
      setAllPlans((hist.data.data.plans_distribution || []).map(normalizePlan));
      setDebugTotal(hist.data.debug_total_db || 0);
      setDebugPeriods(hist.data.debug_periods || []);
      console.log('DIAGNÓSTICO RAW DE PLANES EN BD:', hist.data.debug_raw_plans);
    } catch (e) { 
      console.error(e);
      setError('Error al cargar datos del servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Polling para Generación Masiva optimizado con useRef
  useEffect(() => {
    if (isProcessingMassive && massJobId) {
      intervalRef.current = setInterval(async () => {
        try {
          const { data } = await api.get(`/plans/mass-status/${massJobId}`);
          setMassProgress(data.job);
          if (data.job.status === 'completed') {
            setIsProcessingMassive(false);
            setMassJobId(null);
            clearInterval(intervalRef.current);
            fetchData();
          }
        } catch (e) {
          console.error('Polling error:', e);
          clearInterval(intervalRef.current);
          setError('Error de conexión durante la generación masiva');
        }
      }, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isProcessingMassive, massJobId]);

  // Prevenir cierre accidental si hay un plan generado sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (generatedPlan) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [generatedPlan]);

  // Lógica derivada memoizada
  const evaluableTeachers = React.useMemo(() => {
    return teachers.filter(t => {
      if (!selection.period_id) return false;
      if (t.is_active === false) return false; // Ignorar inactivos
      const hasEvaluation = allEvaluations.some(ev => ev.teacher_id === t.id && String(ev.period_id) === String(selection.period_id));
      const hasPlan = allPlans.some(plan => plan.teacher_id === t.id && String(plan.period_id) === String(selection.period_id));
      return hasEvaluation && !hasPlan;
    });
  }, [teachers, allEvaluations, allPlans, selection.period_id]);

  const allActiveTeachers = React.useMemo(() => {
    return teachers.filter(t => {
      if (t.is_active === false) return false;
      // Excluir si ya tiene un plan en el periodo
      if (selection.period_id) {
        const hasPlan = allPlans.some(plan => plan.teacher_id === t.id && String(plan.period_id) === String(selection.period_id));
        if (hasPlan) return false;
      }
      return true;
    });
  }, [teachers, allPlans, selection.period_id]);

  const selectedTeacherHasEvaluation = React.useMemo(() => {
    if (!selection.teacher_id || !selection.period_id) return false;
    return allEvaluations.some(ev => String(ev.teacher_id) === String(selection.teacher_id) && String(ev.period_id) === String(selection.period_id));
  }, [selection.teacher_id, selection.period_id, allEvaluations]);

  const totalEvaluationsInPeriod = React.useMemo(() => {
    if (!selection.period_id) return 0;
    return allEvaluations.filter(ev => String(ev.period_id) === String(selection.period_id)).length;
  }, [allEvaluations, selection.period_id]);

  const filteredDrafts = React.useMemo(() => {
    return allPlans.filter(p => {
      const isDraft = p.status === 'borrador' || p.status === 'ai_generated';
      const periodMatch = !selection.period_id || String(p.period_id) === String(selection.period_id);
      return isDraft && periodMatch;
    });
  }, [allPlans, selection.period_id]);

  const handleGenerate = async () => {
    if (!selection.teacher_id || !selection.period_id) return;
    setLoading(true);
    setGeneratedPlan(null);
    try {
      const { data } = await api.post('/plans/generate', {
        teacher_id: parseInt(selection.teacher_id, 10),
        period_id: parseInt(selection.period_id, 10)
      });
      if (data.success && data.plan) {
        const p = data.plan;
        setGeneratedPlan({
          diagnosis: p.diagnosis || p.diagnosis_text || '',
          consolidated_comments: parseArr(p.consolidated_comments),
          strengths: parseArr(p.strengths),
          improvement_opportunities: parseArr(p.improvement_opportunities || p.improvement_opps),
          objectives: parseArr(p.objectives),
          plan_actions: Array.isArray(p.plan_actions) ? p.plan_actions : 
                       (Array.isArray(p.planActions) ? p.planActions : 
                       (Array.isArray(p.actions) ? p.actions : 
                       (Array.isArray(p.PlanActions) ? p.PlanActions : 
                       (Array.isArray(p.plan_mejoramiento) ? p.plan_mejoramiento : [])))),
          work_plan: Array.isArray(p.work_plan) ? p.work_plan : (Array.isArray(p.section_5) ? p.section_5 : []),
          recognition: p.recognition || null,
          history_analysis: p.history_analysis || null
        });
      }
    } catch (err) {
      alert('Error IA: ' + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  };

  const handleStartMassive = async () => {
    if (!selection.period_id || evaluableTeachers.length === 0) return;
    if (!window.confirm(`¿Iniciar la generación de ${evaluableTeachers.length} planes? Esto tomará unos minutos.`)) return;

    setIsProcessingMassive(true);
    // Initialize progress state
    setMassProgress({
      status: 'processing',
      total: evaluableTeachers.length,
      completed: 0,
      failed: 0,
      current_teacher: ''
    });

    let completed = 0;
    let failed = 0;
    const batchSize = 10; // Enviar 10 profesores en paralelo

    for (let i = 0; i < evaluableTeachers.length; i += batchSize) {
      const batch = evaluableTeachers.slice(i, i + batchSize);
      setMassProgress(prev => ({ 
        ...prev, 
        current_teacher: `Procesando lote de ${batch.length} docentes...` 
      }));

      const batchPromises = batch.map(async (t) => {
        let success = false;
        let retries = 0;
        
        while (!success && retries < 3) {
          try {
            // 1. Generate Plan
            const { data: genData } = await api.post('/plans/generate', {
              teacher_id: parseInt(t.id, 10),
              period_id: parseInt(selection.period_id, 10)
            });

            if (genData.success && genData.plan) {
              const p = genData.plan;
              const formattedPlan = {
                diagnosis_text: p.diagnosis || p.diagnosis_text || '',
                consolidated_comments: parseArr(p.consolidated_comments),
                strengths: parseArr(p.strengths),
                improvement_opps: parseArr(p.improvement_opportunities || p.improvement_opps),
                objectives: parseArr(p.objectives),
                actions: Array.isArray(p.plan_actions) ? p.plan_actions : 
                             (Array.isArray(p.planActions) ? p.planActions : 
                             (Array.isArray(p.actions) ? p.actions : 
                             (Array.isArray(p.PlanActions) ? p.PlanActions : 
                             (Array.isArray(p.plan_mejoramiento) ? p.plan_mejoramiento : [])))),
                work_plan: Array.isArray(p.work_plan) ? p.work_plan : (Array.isArray(p.section_5) ? p.section_5 : []),
                history_analysis: p.history_analysis || null
              };

              // 2. Save Plan
              await api.post('/plans/save', {
                teacher_id: parseInt(t.id, 10),
                period_id: parseInt(selection.period_id, 10),
                planData: formattedPlan,
                status: 'ai_generated'
              });
              
              success = true;
              return { success: true };
            } else {
              throw new Error("Respuesta invalida");
            }
          } catch (e) {
            retries++;
            if (retries >= 3) {
              return { success: false };
            }
          }
        }
      });
      
      const results = await Promise.all(batchPromises);
      results.forEach(r => {
        if (r && r.success) completed++;
        else failed++;
      });
      
      setMassProgress(prev => ({ ...prev, completed, failed }));
    }

    setMassProgress(prev => ({ ...prev, status: 'completed' }));
    setIsProcessingMassive(false);
    fetchData();
  };

  const handleSavePlan = async (status) => {
    if (!generatedPlan) return;
    setSaving(true);
    try {
      await api.post('/plans/save', {
        teacher_id: parseInt(selection.teacher_id, 10),
        period_id: parseInt(selection.period_id, 10),
        planData: generatedPlan,
        status
      });
      alert(status === 'borrador' ? 'Borrador guardado' : 'Plan oficializado');
      if (status === 'approved') navigate('/director/planes');
      fetchData();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally { setSaving(false); }
  };

  // Helpers edición
  const editList = (field, i, val) => {
    const arr = [...(generatedPlan[field] || [])];
    arr[i] = val;
    setGeneratedPlan({ ...generatedPlan, [field]: arr });
  };
  const editAction = (i, field, val) => {
    const actions = [...generatedPlan.plan_actions];
    actions[i][field] = val;
    setGeneratedPlan({ ...generatedPlan, plan_actions: actions });
  };
  const editWorkPlan = (i, field, val) => {
    const work = [...(generatedPlan.work_plan || [])];
    work[i][field] = val;
    setGeneratedPlan({ ...generatedPlan, work_plan: work });
  };

  const addToList = (field) => {
    const arr = [...(generatedPlan[field] || []), ''];
    setGeneratedPlan({ ...generatedPlan, [field]: arr });
  };

  const removeListItem = (field, i) => {
    const arr = [...(generatedPlan[field] || [])];
    arr.splice(i, 1);
    setGeneratedPlan({ ...generatedPlan, [field]: arr });
  };

  const addAction = () => {
    const actions = [...(generatedPlan.plan_actions || []), {
      aspect: '', concrete_action: '', verifiable_product: '', expected_goal: '', deadline: ''
    }];
    setGeneratedPlan({ ...generatedPlan, plan_actions: actions });
  };

  const removeAction = (i) => {
    const actions = [...(generatedPlan.plan_actions || [])];
    actions.splice(i, 1);
    setGeneratedPlan({ ...generatedPlan, plan_actions: actions });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm" style={{ border: '1px solid #eaecf0' }}>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#e6f4ec' }}>
            <Bot style={{ color: '#09843B' }} size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: '#0f2217' }}>Copilot IA: Generador de Planes</h1>
            <p className="text-xs text-gray-400 mt-0.5">Transforme las evaluaciones en estrategias de crecimiento docente.</p>
          </div>
        </div>
        <div className="flex p-1 rounded-xl gap-1" style={{ background: '#f4f7f5', border: '1px solid #e0ebe3' }}>
          <button onClick={() => setActiveTab('individual')}
            className="px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2"
            style={activeTab === 'individual'
              ? { background: '#09843B', color: '#fff', boxShadow: '0 2px 6px rgba(9,132,59,0.25)' }
              : { color: '#6b7280' }}
          >
            <Zap size={13}/> Individual
          </button>
          <button onClick={() => setActiveTab('massive')}
            className="px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2"
            style={activeTab === 'massive'
              ? { background: '#09843B', color: '#fff', boxShadow: '0 2px 6px rgba(9,132,59,0.25)' }
              : { color: '#6b7280' }}
          >
            <Layers size={13}/> Masivo
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition">
            <XCircle size={20} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Panel Izquierdo: Selección */}
        <div className="col-span-3 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Parámetros</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Periodo Destino</label>
              <div className="w-full text-sm border-gray-200 border rounded-lg p-2.5 bg-gray-50 font-bold text-gray-600 outline-none flex items-center h-[42px]">
                {periods.find(p => String(p.id) === String(selection.period_id))?.name || 'Cargando...'}
              </div>
            </div>

            {selection.period_id && totalEvaluationsInPeriod === 0 && (
              <div className="bg-orange-50 border border-orange-200 text-orange-700 p-3 rounded-lg flex items-start gap-2 mt-2 text-[10px] font-bold">
                <AlertCircle size={14} className="shrink-0"/> 
                <span>Alerta: No hay profesores con evaluación en este periodo.</span>
              </div>
            )}

            {activeTab === 'individual' ? (
              <>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Docente (Evaluado)</label>
                  <select disabled={!selection.period_id} value={selection.teacher_id} onChange={e => setSelection({...selection, teacher_id: e.target.value})}
                    className="w-full text-sm border-gray-200 rounded-lg p-2.5 bg-gray-50 outline-none disabled:opacity-50">
                    <option value="">Seleccione docente...</option>
                    {allActiveTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  {!selectedTeacherHasEvaluation && selection.teacher_id && (
                    <div className="text-[10px] text-red-600 font-bold flex items-center gap-1 mt-1">
                      <AlertCircle size={12}/> El profesor no ha generado evaluación.
                    </div>
                  )}
                </div>
                <button onClick={handleGenerate} disabled={!selection.teacher_id || loading || !selectedTeacherHasEvaluation}
                  className="w-full py-3 rounded-xl font-bold text-sm text-white transition disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#09843B,#066b2f)', boxShadow: '0 4px 12px rgba(9,132,59,0.25)' }}
                >
                  {loading ? 'Consultando IA...' : 'Generar Borrador'}
                </button>
              </>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div className="text-[10px] font-bold text-blue-800 uppercase mb-1">Docentes Listos</div>
                  <div className="text-2xl font-black text-[#0C447C]">{evaluableTeachers.length}</div>
                  <p className="text-[10px] text-blue-600 italic">Profesores evaluados sin plan activo.</p>
                </div>
                <button onClick={handleStartMassive} disabled={evaluableTeachers.length === 0 || isProcessingMassive}
                  className="w-full text-white py-4 rounded-xl font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: '#09843B', boxShadow: '0 4px 12px rgba(9,132,59,0.25)' }}
                >
                  {isProcessingMassive ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18}/>}
                  {isProcessingMassive ? 'Procesando...' : 'Generar Todos'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Panel Derecho: Resultados */}
        <div className="col-span-9">
          {activeTab === 'individual' && (
            generatedPlan ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-300">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-[#0C447C] text-sm">Vista Previa del Plan Generado</h3>
                    <span className="bg-red-100 text-red-700 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1 animate-pulse"><AlertCircle size={12}/> Cambios sin guardar</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { handleSavePlan('borrador'); setGeneratedPlan(null); }} disabled={saving} className="px-4 py-2 text-xs font-bold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition" style={{ color: '#4b5563' }}>Guardar Borrador</button>
                    <button onClick={() => handleSavePlan('approved')} disabled={saving} className="px-4 py-2 text-xs font-bold text-white rounded-lg transition" style={{ background: '#09843B' }}>Aprobar y Oficiar</button>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-gray-100 block pb-1">Diagnóstico General</label>
                      <textarea 
                        value={generatedPlan.diagnosis || ''} 
                        onChange={e => setGeneratedPlan({...generatedPlan, diagnosis: e.target.value})}
                        className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32"
                      />
                   </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-purple-600 uppercase tracking-widest border-b border-gray-100 block pb-1">Resumen de Comentarios de Estudiantes</label>
                        <ul className="space-y-2">
                          {generatedPlan.consolidated_comments?.map((c, i) => (
                            <li key={i} className="flex gap-2 items-start">
                              <span className="text-purple-500 mt-1">•</span>
                              <input value={c} onChange={e => editList('consolidated_comments', i, e.target.value)} className="w-full text-xs p-1 border-b border-transparent focus:border-purple-300 outline-none"/>
                            </li>
                          ))}
                        </ul>
                      </div>

                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-red-400 uppercase tracking-widest border-b border-gray-100 block pb-1">1. Oportunidades de Mejora</label>
                        <ul className="space-y-2">
                          {generatedPlan.improvement_opportunities?.map((o, i) => (
                            <li key={i} className="flex gap-2 items-center">
                              <input value={o} onChange={e => editList('improvement_opportunities', i, e.target.value)} className="w-full text-xs p-1 border-b border-gray-200 focus:border-red-300 outline-none rounded"/>
                              <button onClick={() => removeListItem('improvement_opportunities', i)} className="text-gray-300 hover:text-red-500" title="Eliminar"><XCircle size={14}/></button>
                            </li>
                          ))}
                        </ul>
                        <button onClick={() => addToList('improvement_opportunities')} className="text-[10px] font-bold text-red-500 hover:underline">+ Agregar Oportunidad Manualmente</button>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest border-b border-gray-100 block pb-1">2. Identificación de Fortalezas</label>
                        <ul className="space-y-2">
                          {generatedPlan.strengths?.map((s, i) => (
                            <li key={i} className="flex gap-2 items-center">
                              <input value={s} onChange={e => editList('strengths', i, e.target.value)} className="w-full text-xs p-1 border-b border-gray-200 focus:border-blue-300 outline-none rounded"/>
                              <button onClick={() => removeListItem('strengths', i)} className="text-gray-300 hover:text-red-500" title="Eliminar"><XCircle size={14}/></button>
                            </li>
                          ))}
                        </ul>
                        <button onClick={() => addToList('strengths')} className="text-[10px] font-bold text-blue-500 hover:underline">+ Agregar Fortaleza Manualmente</button>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest border-b border-gray-100 block pb-1">3. Objetivos del Plan de Mejora</label>
                      <ul className="space-y-2">
                         {(generatedPlan.objectives || []).map((o, i) => (
                           <li key={i} className="flex gap-2 items-center">
                             <span className="text-blue-500">•</span>
                             <input value={o} onChange={e => editList('objectives', i, e.target.value)} className="w-full text-xs p-1 border-b border-gray-200 focus:border-blue-300 outline-none rounded"/>
                             <button onClick={() => removeListItem('objectives', i)} className="text-gray-300 hover:text-red-500" title="Eliminar"><XCircle size={14}/></button>
                           </li>
                         ))}
                      </ul>
                      <button onClick={() => addToList('objectives')} className="text-[10px] font-bold text-blue-600 hover:underline">+ Agregar Objetivo Manualmente</button>
                   </div>

                   <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 block pb-1">4. Plan de Mejoramiento</label>
                     <div className="space-y-3">
                        {generatedPlan.plan_actions?.map((a, i) => (
                           <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm grid grid-cols-12 gap-5 items-start">
                             <div className="col-span-12 border-b border-gray-100 pb-2 flex items-center justify-between">
                               <span className="text-sm font-black text-gray-700">Acción N° {i + 1}</span>
                               <button onClick={() => removeAction(i)} className="text-xs text-red-500 font-bold hover:bg-red-50 px-2 py-1 rounded transition">Eliminar Acción</button>
                             </div>
                             
                             <div className="col-span-12 space-y-1">
                               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Aspecto a mejorar</span>
                               <textarea value={a.aspect || ''} onChange={e => editAction(i, 'aspect', e.target.value)} className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 h-16 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"/>
                             </div>
                             
                             <div className="col-span-6 space-y-1">
                               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Acción concreta</span>
                               <textarea value={a.concrete_action || ''} onChange={e => editAction(i, 'concrete_action', e.target.value)} className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 h-24 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"/>
                             </div>
                             
                             <div className="col-span-6 space-y-1">
                               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Meta esperada</span>
                               <textarea value={a.expected_goal || ''} onChange={e => editAction(i, 'expected_goal', e.target.value)} className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 h-24 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"/>
                             </div>
                             
                             <div className="col-span-9 space-y-1">
                               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Producto verificable</span>
                               <textarea value={a.verifiable_product || ''} onChange={e => editAction(i, 'verifiable_product', e.target.value)} className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 h-16 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"/>
                             </div>
                             
                             <div className="col-span-3 space-y-1">
                               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Fecha límite</span>
                               <input type="text" value={a.deadline || ''} onChange={e => editAction(i, 'deadline', e.target.value)} className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="YYYY-MM-DD o Mes"/>
                             </div>
                           </div>
                         ))}
                     </div>
                     <div className="pt-2">
                        <button onClick={addAction} className="w-full border-2 border-dashed border-gray-300 text-gray-500 font-bold py-3 rounded-xl hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition text-xs flex justify-center items-center gap-2">
                           + Añadir Nueva Acción al Plan de Mejoramiento
                        </button>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <label className="text-[10px] font-black text-[#0C447C] uppercase tracking-widest border-b border-gray-100 block pb-1">5. Plan de Trabajo {periods.find(p => String(p.id) === String(selection.period_id))?.name || ''}</label>
                     <div className="space-y-3">
                        {(generatedPlan.work_plan || []).map((w, i) => (
                          <div key={i} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 grid grid-cols-12 gap-4 items-end">
                             <div className="col-span-3 space-y-1">
                               <span className="text-[9px] font-bold text-blue-800 uppercase">Eje / Función</span>
                               <input value={w.axis} onChange={e => editWorkPlan(i, 'axis', e.target.value)} className="w-full text-xs bg-white border border-blue-100 rounded p-2 outline-none"/>
                             </div>
                             <div className="col-span-4 space-y-1">
                               <span className="text-[9px] font-bold text-blue-800 uppercase">Actividad</span>
                               <input value={w.activity} onChange={e => editWorkPlan(i, 'activity', e.target.value)} className="w-full text-xs bg-white border border-blue-100 rounded p-2 outline-none"/>
                             </div>
                             <div className="col-span-3 space-y-1">
                               <span className="text-[9px] font-bold text-blue-800 uppercase">Producto</span>
                               <input value={w.product} onChange={e => editWorkPlan(i, 'product', e.target.value)} className="w-full text-xs bg-white border border-blue-100 rounded p-2 outline-none"/>
                             </div>
                             <div className="col-span-2 space-y-1">
                               <span className="text-[9px] font-bold text-blue-800 uppercase">Mes</span>
                               <input value={w.month} onChange={e => editWorkPlan(i, 'month', e.target.value)} className="w-full text-xs bg-white border border-blue-100 rounded p-2 outline-none"/>
                             </div>
                          </div>
                        ))}
                        {(generatedPlan.work_plan?.length === 0) && (
                          <p className="text-xs text-gray-400 italic text-center py-4">Sin tareas asignadas en esta sección.</p>
                        )}
                     </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center py-32 text-gray-400 space-y-4">
                 <Bot size={48} className="opacity-10"/>
                 <p className="text-sm font-medium italic">Seleccione un docente para comenzar la generación individual.</p>
              </div>
            )
          )}

          {activeTab === 'massive' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 flex flex-col items-center space-y-8 justify-center">
                 {massProgress ? (
                   <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95">
                      <div className="text-center space-y-2">
                         <h3 className="font-bold text-[#0C447C] text-lg">
                            {massProgress.status === 'completed' ? 'Generación Finalizada' : 'Generando Planes...'}
                         </h3>
                         <p className="text-xs text-gray-500">
                            {massProgress.status === 'completed' 
                              ? `Se procesaron ${massProgress.total} docentes correctamente.` 
                              : `Actualmente procesando: ${massProgress.current_teacher}`}
                         </p>
                      </div>

                      <div className="space-y-3">
                         <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase">
                            <span>Progreso</span>
                            <span>{Math.round((massProgress.completed + massProgress.failed) / massProgress.total * 100)}%</span>
                         </div>
                         <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                            <div className={`h-full bg-blue-600 transition-all duration-500`} style={{ width: `${(massProgress.completed + massProgress.failed) / massProgress.total * 100}%` }}></div>
                         </div>
                      </div>

                      {massProgress.status === 'completed' && (
                        <button onClick={() => { setMassProgress(null); fetchData(); }} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition">
                           Cerrar y Ver Resultados
                        </button>
                      )}
                   </div>
                 ) : (
                   <div className="text-center space-y-6 max-w-sm">
                      <div className="bg-blue-50 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto border border-blue-100"><Zap className="text-blue-600" size={32}/></div>
                      <div className="space-y-2">
                        <h3 className="font-bold text-[#0C447C]">Motor de Generación Masiva</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Este proceso escaneará a todos los profesores evaluados y creará automáticamente sus borradores de planes de mejora.
                        </p>
                      </div>
                      {evaluableTeachers.length === 0 && selection.period_id && (
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-left flex items-start gap-3">
                           <AlertCircle className="text-orange-600 shrink-0" size={18}/>
                           <p className="text-[10px] text-orange-800">No hay profesores nuevos pendientes de plan. Revisa la lista de borradores abajo.</p>
                        </div>
                      )}
                   </div>
                 )}
              </div>

              {/* LISTA DE BORRADORES EXISTENTES */}
              {selection.period_id && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                   <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ListChecks size={16} className="text-blue-600"/> Borradores Pendientes (Viendo ID: {selection.period_id})
                      </h3>
                      <div className="flex gap-2">
                        <span className="bg-gray-200 text-gray-600 text-[9px] font-black px-2 py-1 rounded">
                          DB TOTAL: {debugTotal} (IDs Periodos: {JSON.stringify(debugPeriods)})
                        </span>
                        <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded">
                          {filteredDrafts.length} EN LISTA
                        </span>
                      </div>
                   </div>
                   <div className="divide-y divide-gray-100">
                      {filteredDrafts.map(plan => {
                        const teacher = teachers.find(t => t.id === plan.teacher_id);
                        return (
                          <div key={plan.id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                                  {teacher?.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                   <div className="font-bold text-sm text-gray-800">{teacher?.name || `Docente ID: ${plan.teacher_id}`}</div>
                                   <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Borrador IA • Listo para revisión</div>
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <button 
                                  onClick={async () => {
                                    if(window.confirm('¿Eliminar este borrador?')) {
                                      await api.delete(`/plans/${plan.id}`);
                                      fetchData();
                                    }
                                  }}
                                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                  <Trash2 size={16}/>
                                </button>
                                <button 
                                  onClick={() => {
                                    // Cargar este plan en la pestaña individual para editarlo
                                    setSelection({ ...selection, teacher_id: plan.teacher_id.toString() });
                                    setGeneratedPlan({
                                      diagnosis: plan.diagnosis_text || '',
                                      consolidated_comments: parseArr(plan.consolidated_comments),
                                      strengths: parseArr(plan.strengths),
                                      improvement_opportunities: parseArr(plan.improvement_opps),
                                      objectives: parseArr(plan.objectives),
                                      plan_actions: (plan.actions || []).map(a => ({
                                        aspect: a.aspect || '',
                                        concrete_action: a.concrete_action || '',
                                        verifiable_product: a.verifiable_product || '',
                                        expected_goal: a.expected_goal || '',
                                        deadline: a.deadline || ''
                                      })),
                                      work_plan: [],
                                      history_analysis: plan.history_analysis || ''
                                    });
                                    setActiveTab('individual');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-blue-700 transition shadow-sm"
                                >
                                  Revisar y Aprobar
                                </button>
                             </div>
                          </div>
                        );
                      })}
                      {allPlans.filter(p => {
                          const pid = p.period_id || p.PeriodId || p.period?.id;
                          const isDraft = p.status === 'borrador' || p.status === 'ai_generated';
                          const periodMatch = !selection.period_id || String(pid) === String(selection.period_id);
                          return isDraft && periodMatch;
                        }).length === 0 && (
                        <div className="p-12 text-center text-gray-400 text-xs italic">
                          No se encontraron borradores guardados para este periodo en la base de datos.
                        </div>
                      )}
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  BarChart3, TrendingUp, Users, CheckCircle, Clock, 
  Activity, Medal, Target, AlertTriangle, AlertOctagon, 
  BarChart, ArrowUpRight, ArrowDownRight, Minus, CalendarDays,
  MessageSquare, Award, FileText
} from 'lucide-react';

export const HistorialEvolucion = () => {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [expandedDebtId, setExpandedDebtId] = useState(null);
  const [showGlobalDebt, setShowGlobalDebt] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const histRes = await api.get('/history/global');
      const data = histRes.data.data;
      setHistoryData(data);
      
      const periodsSet = new Set();
      data.evaluations_timeline?.forEach(ev => { 
        if(ev.Period?.name || ev.period?.name) periodsSet.add(ev.Period?.name || ev.period?.name); 
      });
      data.plans_distribution?.forEach(pl => { 
        if(pl.Period?.name || pl.period?.name) periodsSet.add(pl.Period?.name || pl.period?.name); 
      });
      
      const sortedPeriods = Array.from(periodsSet).sort();
      setAvailablePeriods(sortedPeriods);
      if (sortedPeriods.length > 0) setSelectedPeriod(sortedPeriods[sortedPeriods.length - 1]);
    } catch (err) {
      console.error("Error cargando Dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const processData = () => {
    if (!historyData || !selectedPeriod) return { 
      periods: [], plansStatus: { approved: 0, borrador: 0, pending: 0 }, 
      teacherPerformance: [], actionStats: { total: 0, completed: 0 }, 
      distribution: { mejoraron: 0, estables: 0, empeoraron: 0, nuevos: 0 }, 
      teacherTrends: [], currentPeriodName: '', previousPeriodName: '' 
    };

    const validPeriodNames = availablePeriods.filter(p => p.localeCompare(selectedPeriod) <= 0);
    const validPeriodSet = new Set(validPeriodNames);
    const filteredEvaluations = historyData.evaluations_timeline?.filter(ev => validPeriodSet.has(ev.Period?.name || ev.period?.name)) || [];
    const filteredPlans = historyData.plans_distribution?.filter(pl => validPeriodSet.has(pl.Period?.name || pl.period?.name)) || [];
    
    const periodMap = {};
    const teacherEvol = {};
    
    filteredEvaluations.forEach(ev => {
      const pName = ev.Period?.name || ev.period?.name || 'Desconocido';
      if (!periodMap[pName]) periodMap[pName] = { name: pName, sumStudent: 0, sumDirector: 0, count: 0 };
      periodMap[pName].sumStudent += Number(ev.score_students) || 0;
      periodMap[pName].sumDirector += Number(ev.score_director) || 0;
      periodMap[pName].count++;
      
      const tName = ev.teacher?.name || 'Desconocido';
      const cName = ev.Course?.name || 'Evaluación General';
      const key = `${tName} - ${cName}`;
      if (!teacherEvol[key]) teacherEvol[key] = { name: tName, course: cName, dept: ev.teacher?.department || 'General', periods: {}, comments: [] };
      if (!teacherEvol[key].periods[pName]) teacherEvol[key].periods[pName] = { sumSt: 0, sumDir: 0, count: 0 };
      
      teacherEvol[key].periods[pName].sumSt += Number(ev.score_students) || 0;
      teacherEvol[key].periods[pName].sumDir += Number(ev.score_director) || 0;
      teacherEvol[key].periods[pName].count++;
      
      if (pName === selectedPeriod && ev.StudentComments && ev.StudentComments.length > 0) {
        teacherEvol[key].comments.push(...ev.StudentComments);
      }
    });
    
    const periods = Object.values(periodMap).map(p => ({
      name: p.name,
      avgStudent: (p.sumStudent / p.count).toFixed(1),
      avgDirector: (p.sumDirector / p.count).toFixed(1)
    })).sort((a, b) => a.name.localeCompare(b.name));
    
    const periodNames = periods.map(p => p.name);
    const currentPeriodName = periodNames[periodNames.length - 1] || 'Actual';
    const previousPeriodName = periodNames.length > 1 ? periodNames[periodNames.length - 2] : null;
    
    const distribution = { mejoraron: 0, estables: 0, empeoraron: 0, nuevos: 0 };
    const teacherTrends = [];
    
    Object.keys(teacherEvol).forEach(key => {
      const data = teacherEvol[key];
      let currAvg = null, prevAvg = null;
      
      if (data.periods[currentPeriodName]) {
        const p = data.periods[currentPeriodName];
        currAvg = ((p.sumSt + p.sumDir) / 2) / p.count;
      }
      if (previousPeriodName && data.periods[previousPeriodName]) {
        const p = data.periods[previousPeriodName];
        prevAvg = ((p.sumSt + p.sumDir) / 2) / p.count;
      }
      let trendVal = 0, status = 'nuevos';
      if (currAvg !== null && prevAvg !== null) {
        trendVal = currAvg - prevAvg;
        if (trendVal >= 0.1) { status = 'mejoraron'; distribution.mejoraron++; }
        else if (trendVal <= -0.1) { status = 'empeoraron'; distribution.empeoraron++; }
        else { status = 'estables'; distribution.estables++; }
      } else if (currAvg !== null) { distribution.nuevos++; }
      
      let totalSt = 0, totalDir = 0, totalCount = 0;
      Object.values(data.periods).forEach(p => { totalSt += p.sumSt; totalDir += p.sumDir; totalCount += p.count; });
      const globalAbsolute = (((totalSt + totalDir) / 2) / totalCount).toFixed(2);
      
      teacherTrends.push({
        name: data.name, course: data.course, dept: data.dept,
        currAvg: currAvg !== null ? currAvg.toFixed(2) : '-',
        prevAvg: prevAvg !== null ? prevAvg.toFixed(2) : '-',
        trend: trendVal, status, globalAbsolute,
        avgSt: data.periods[currentPeriodName] ? (data.periods[currentPeriodName].sumSt / data.periods[currentPeriodName].count).toFixed(1) : '-',
        avgDir: data.periods[currentPeriodName] ? (data.periods[currentPeriodName].sumDir / data.periods[currentPeriodName].count).toFixed(1) : '-',
        globalAvg: currAvg !== null ? currAvg.toFixed(2) : '-',
        comments: data.comments || []
      });
    });
    
    const teacherPerformance = [...teacherTrends].sort((a, b) => b.globalAbsolute - a.globalAbsolute);
    const plansStatus = { approved: 0, borrador: 0, pending: 0 };
    const actionStats = { total: 0, withActions: 0, draggedTasks: 0, criticalDrag: 0 };
    const teachersWithDebt = [];

    filteredPlans.forEach(plan => {
      if (plan.status === 'approved') plansStatus.approved++;
      else if (plan.status === 'borrador') plansStatus.borrador++;
      else plansStatus.pending++;

      let tDragged = 0;
      let tCritical = 0;

      if (plan.actions && plan.actions.length > 0) {
        actionStats.total += plan.actions.length;
        actionStats.withActions++;
        plan.actions.forEach(a => {
           if (a.carry_over_count > 0) {
               actionStats.draggedTasks++;
               tDragged++;
               if (a.carry_over_count >= 2) {
                   actionStats.criticalDrag++;
                   tCritical++;
               }
           }
        });
      }
      
      if (tDragged > 0) {
        teachersWithDebt.push({
          id: plan.teacher?.id || Math.random(),
          name: plan.teacher?.name || 'Desconocido',
          dept: plan.teacher?.department || 'General',
          course: plan.actions[0]?.course_id ? 'Varios Cursos' : 'General', // Simplified for UI
          dragged: tDragged,
          critical: tCritical,
          actions: plan.actions.filter(a => a.carry_over_count > 0)
        });
      }
    });

    teachersWithDebt.sort((a, b) => b.dragged - a.dragged);
    
    return { periods, plansStatus, teacherPerformance, teacherTrends, actionStats, distribution, currentPeriodName, previousPeriodName, teachersWithDebt };
  };
  
  const { periods, plansStatus, teacherPerformance, teacherTrends, actionStats, distribution, currentPeriodName, previousPeriodName, teachersWithDebt } = processData();
  const atRiskTeachers = teacherTrends.filter(t => t.status === 'empeoraron').sort((a, b) => a.trend - b.trend).slice(0, 5);
  const totalEvaluated = teacherTrends.length;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in duration-500">
      
      {/* Header con verde institucional */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl shadow-lg">
        <div className="relative z-10 px-6 py-8 md:px-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <BarChart3 className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Analítica y Desempeño Académico
              </h1>
              <p className="text-emerald-100 text-sm mt-1">
                Monitoreo de eficiencia docente y evolución institucional
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-emerald-700/50 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-3 border border-emerald-500/30">
              <CalendarDays className="text-emerald-200" size={18} />
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-white font-semibold text-sm outline-none cursor-pointer"
              >
                {availablePeriods.map(p => (
                  <option key={p} value={p} className="text-gray-800">{p}</option>
                ))}
              </select>
            </div>
            <div className="bg-emerald-700/50 backdrop-blur-sm px-5 py-2 rounded-xl text-center">
              <div className="text-emerald-200 text-xs uppercase font-semibold">Periodos Hist.</div>
              <div className="text-white text-xl font-bold">{periods.length}</div>
            </div>
            <div className="bg-emerald-700/50 backdrop-blur-sm px-5 py-2 rounded-xl text-center">
              <div className="text-emerald-200 text-xs uppercase font-semibold">Evaluados</div>
              <div className="text-white text-xl font-bold">{totalEvaluated}</div>
            </div>
          </div>
        </div>
        {/* decoración */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Activity className="text-emerald-400 animate-spin" size={48} />
          <p className="text-gray-500 font-medium">Cargando métricas institucionales...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* KPIs laterales */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 transition hover:shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Users size={20} /></div>
                <span className="text-2xl font-bold text-gray-800">{historyData?.total_teachers || 0}</span>
              </div>
              <p className="text-gray-500 text-xs font-medium">Docentes a cargo</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 transition hover:shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><CheckCircle size={20} /></div>
                <span className="text-2xl font-bold text-gray-800">{plansStatus.approved}</span>
              </div>
              <p className="text-gray-500 text-xs font-medium">Planes oficializados</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 transition hover:shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Target size={20} /></div>
                <span className="text-2xl font-bold text-gray-800">{actionStats.total}</span>
              </div>
              <p className="text-gray-500 text-xs font-medium">Acciones propuestas</p>
            </div>
            {/* Tareas Arrastradas KPI */}
            <div className={`rounded-2xl border shadow-sm p-4 transition hover:shadow-md ${actionStats.draggedTasks > 0 ? 'bg-red-50/50 border-red-100' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl ${actionStats.draggedTasks > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
                   <AlertTriangle size={20} />
                </div>
                <span className={`text-2xl font-bold ${actionStats.draggedTasks > 0 ? 'text-red-700' : 'text-gray-800'}`}>
                  {actionStats.draggedTasks}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-600 mb-1">Tareas Arrastradas</p>
              {actionStats.criticalDrag > 0 && (
                 <p className="text-[10px] text-red-500 font-bold bg-red-100/50 px-2 py-1 rounded inline-block">
                   ¡{actionStats.criticalDrag} Críticas (2+ periodos)!
                 </p>
              )}
            </div>
          </div>
          
          {/* Gráfico de evolución */}
          <div className="lg:col-span-9 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="text-emerald-500" size={22} /> Evolución por periodo
                </h3>
                <p className="text-sm text-gray-500">Promedio estudiantes vs. director (sobre 5.0)</p>
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span>Estudiantes</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-teal-500"></div><span>Director</span></div>
              </div>
            </div>
            {periods.length === 0 ? (
              <div className="py-20 text-center text-gray-400"><Activity size={40} className="mx-auto mb-3 opacity-30" /><p>Sin datos históricos suficientes</p></div>
            ) : (
              <div className="relative flex items-end justify-around h-72 border-b border-gray-100">
                {/* grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
                  {[5,4,3,2,1,0].map(v => <div key={v} className="border-t border-gray-100 relative"><span className="absolute -left-6 -top-2 text-[10px] text-gray-300">{v}</span></div>)}
                </div>
                {periods.map(p => (
                  <div key={p.name} className="relative flex flex-col items-center w-24 group">
                    <div className="flex gap-2 items-end h-52">
                      <div className="w-8 bg-emerald-500 rounded-t-md transition-all duration-500 hover:bg-emerald-600" style={{ height: `${(p.avgStudent / 5) * 100}%` }}>
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition">{p.avgStudent}</span>
                      </div>
                      <div className="w-8 bg-teal-400 rounded-t-md transition-all duration-500 hover:bg-teal-500" style={{ height: `${(p.avgDirector / 5) * 100}%` }}>
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-teal-700 opacity-0 group-hover:opacity-100 transition">{p.avgDirector}</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs font-semibold text-gray-600">{p.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Distribución de desempeño */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart className="text-emerald-500" size={22} />
              <h3 className="text-lg font-bold text-gray-800">Evolución de rendimiento</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Comparativa {currentPeriodName} vs {previousPeriodName || 'periodo anterior'}</p>
            <div className="space-y-4">
              <div><div className="flex justify-between text-sm"><span className="font-medium text-emerald-700 flex items-center gap-1"><ArrowUpRight size={14} /> Mejoraron</span><span>{distribution.mejoraron} docentes</span></div><div className="h-2 bg-gray-100 rounded-full mt-1"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalEvaluated ? (distribution.mejoraron/totalEvaluated)*100 : 0}%` }}></div></div></div>
              <div><div className="flex justify-between text-sm"><span className="font-medium text-blue-600 flex items-center gap-1"><Minus size={14} /> Estables</span><span>{distribution.estables} docentes</span></div><div className="h-2 bg-gray-100 rounded-full mt-1"><div className="h-full bg-blue-400 rounded-full" style={{ width: `${totalEvaluated ? (distribution.estables/totalEvaluated)*100 : 0}%` }}></div></div></div>
              <div><div className="flex justify-between text-sm"><span className="font-medium text-red-500 flex items-center gap-1"><ArrowDownRight size={14} /> Empeoraron</span><span>{distribution.empeoraron} docentes</span></div><div className="h-2 bg-gray-100 rounded-full mt-1"><div className="h-full bg-red-400 rounded-full" style={{ width: `${totalEvaluated ? (distribution.empeoraron/totalEvaluated)*100 : 0}%` }}></div></div></div>
              <div><div className="flex justify-between text-sm text-gray-500"><span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-400"></div> Nuevos (sin historial)</span><span>{distribution.nuevos} docentes</span></div><div className="h-2 bg-gray-100 rounded-full mt-1"><div className="h-full bg-gray-400 rounded-full" style={{ width: `${totalEvaluated ? (distribution.nuevos/totalEvaluated)*100 : 0}%` }}></div></div></div>
            </div>
          </div>
          
          {/* Docentes en riesgo */}
          <div className="lg:col-span-6 bg-gradient-to-br from-red-50 to-white rounded-2xl border border-red-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertOctagon className="text-red-500" size={22} />
              <h3 className="text-lg font-bold text-gray-800">Alertas de desempeño descendente</h3>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {atRiskTeachers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 italic">✓ No se detectaron caídas significativas en este periodo.</div>
              ) : (
                atRiskTeachers.map(t => (
                  <div key={t.name} className="bg-white rounded-xl border border-red-100 p-3 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="font-semibold text-gray-800">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.course} • {t.dept}</p>
                      <div className="flex gap-3 mt-1 text-xs"><span className="text-red-500">↓ {Math.abs(t.trend).toFixed(2)} pts</span><span className="text-gray-400">Anterior: {t.prevAvg}</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-800">{t.currAvg}</div>
                      <button className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-lg mt-1 hover:bg-red-600 hover:text-white transition">Revisar</button>
                    </div>
                  </div>
                ))
              )}
              {!previousPeriodName && <p className="text-center text-gray-400 text-sm py-4">Se requieren al menos dos periodos para comparar.</p>}
            </div>
          </div>
          
          {/* Top rendimiento */}
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Medal className="text-amber-500" size={22} />
              <h3 className="text-lg font-bold text-gray-800">Top 5 rendimiento docente histórico</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-xs font-semibold text-gray-500">Docente</th>
                    <th className="text-center py-3 text-xs font-semibold text-gray-500">Evaluación Estudiantes</th>
                    <th className="text-center py-3 text-xs font-semibold text-gray-500">Evaluación Director</th>
                    <th className="text-center py-3 text-xs font-semibold text-gray-500">Promedio Global</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherPerformance.slice(0,5).map((t, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3"><div className="flex items-center gap-2"><span className="w-6 text-center font-bold text-gray-400">{idx+1}</span><div><p className="font-medium text-gray-800">{t.name}</p><p className="text-xs text-gray-400">{t.dept}</p></div></div></td>
                      <td className="text-center"><span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs font-semibold">{t.avgSt}</span></td>
                      <td className="text-center"><span className="bg-teal-50 text-teal-700 px-2 py-1 rounded-full text-xs font-semibold">{t.avgDir}</span></td>
                      <td className="text-center font-bold text-gray-800">{t.globalAvg}</td>
                    </tr>
                  ))}
                  {teacherPerformance.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-400">Sin datos disponibles</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Control Detallado de Tareas Arrastradas (Minimalista y Colapsable) */}
          <div className="col-span-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-2">
            <div 
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => setShowGlobalDebt(!showGlobalDebt)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl transition-colors ${showGlobalDebt ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500 group-hover:bg-red-50 group-hover:text-red-500'}`}>
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">Control Detallado: Tareas Arrastradas</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Haz clic para {showGlobalDebt ? 'ocultar' : 'ver'} el listado de docentes deudores</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm font-bold text-red-600">
                    {teachersWithDebt?.length || 0} Docente{teachersWithDebt?.length !== 1 ? 's' : ''}
                  </div>
                  <div className="text-[11px] text-gray-400 font-medium">con deudas pendientes</div>
                </div>
                <div className={`text-gray-400 transition-transform duration-300 ${showGlobalDebt ? 'rotate-180' : ''}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            {showGlobalDebt && (
              <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                {(!teachersWithDebt || teachersWithDebt.length === 0) ? (
                <p className="text-sm text-gray-400 py-4">No hay tareas arrastradas en este periodo.</p>
              ) : (
                <div className="space-y-6 pt-4">
                  {teachersWithDebt.map((t, idx) => (
                    <div key={t.id} className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-red-200 bg-white">
                      {/* Cabecera (Siempre visible) */}
                      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedDebtId(expandedDebtId === t.id ? null : t.id)}>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                          <div>
                            <span className="font-bold text-gray-900 block">{t.name}</span>
                            <span className="text-gray-400 text-xs">{t.dept}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-100 flex items-center gap-1.5">
                              <span>{t.dragged} Arrastradas</span>
                            </div>
                            
                            {t.critical > 0 && (
                              <div className="bg-red-500 text-white px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 uppercase tracking-wide">
                                <AlertTriangle size={12} /> Estado crítico
                              </div>
                            )}
                          </div>
                        </div>

                        <button 
                          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-gray-200"
                        >
                          {expandedDebtId === t.id ? 'Ocultar detalle' : 'Ver detalle'}
                        </button>
                      </div>

                      {/* Cuerpo (Detalle expandible) */}
                      {expandedDebtId === t.id && (
                        <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-4">
                          {t.actions && t.actions.map((act, i) => {
                            const currentIdx = availablePeriods.indexOf(selectedPeriod);
                            const originIdx = currentIdx - act.carry_over_count;
                            const originPeriodName = originIdx >= 0 ? availablePeriods[originIdx] : 'periodos pasados';
                            const isCritical = act.carry_over_count >= 2;

                            return (
                              <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
                                {isCritical && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>}
                                <div className="flex flex-col gap-1">
                                  <span className="font-bold text-gray-800 text-sm">{act.aspect || 'Sin aspecto definido'}</span>
                                  <span className="text-gray-600 text-xs">{act.concrete_action || 'Sin detalle de acción'}</span>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-[11px] font-medium">
                                  <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded">
                                    Arrastrada desde {originPeriodName} (hace {act.carry_over_count} periodo{act.carry_over_count !== 1 ? 's' : ''})
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          </div>
          
          {/* Muro de comentarios */}
          <div className="col-span-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare className="text-emerald-500" size={22} />
              <h3 className="text-lg font-bold text-gray-800">Voz del estudiante – Comentarios del periodo actual</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {teacherTrends.filter(t => t.comments?.length > 0).map(t => (
                <div key={t.name} className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm">
                  <p className="font-semibold text-gray-800">{t.name}</p>
                  <p className="text-xs text-emerald-600 mb-3">{t.course}</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {t.comments.map((c, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg text-xs text-gray-600 italic border border-gray-100 shadow-sm">
                        “{c.comment_text}”
                        <div className={`mt-1 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${c.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' : c.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {c.sentiment === 'positive' ? 'POSITIVO' : c.sentiment === 'negative' ? 'POR MEJORAR' : 'NEUTRO'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {teacherTrends.filter(t => t.comments?.length > 0).length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">No hay comentarios registrados para el periodo {currentPeriodName}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

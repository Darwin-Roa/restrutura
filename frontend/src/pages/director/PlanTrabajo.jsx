import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Pencil, Trash2, Save, X, ClipboardList, Users, RefreshCcw } from 'lucide-react';

// Convierte YYYY-MM-DD → DD/MM/YYYY. Si es texto ("enero") lo devuelve tal cual.
const formatDate = (val) => {
  if (!val) return 'Sin fecha';
  const str = String(val).trim();
  // Si es formato ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-');
    return `${d}/${m}/${y}`;
  }
  return str; // mes en texto legado
};

export const PlanTrabajo = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [cloning, setCloning] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [form, setForm] = useState({ management_area: '', activity: '', expected_product: '', deadline_month: '', scope: 'global', specific_teacher_id: '' });

  const [areas, setAreas] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');

  const load = (periodId = selectedPeriod) => {
    setLoading(true);
    let url = '/tasks';
    if (periodId) url += `?period_id=${periodId}`;
    api.get(url).then(r => setTasks(r.data.tasks || [])).finally(() => setLoading(false));
  };

  const loadInitial = async () => {
    try {
      const pRes = await api.get('/periods');
      const allP = pRes.data.periods || [];
      setPeriods(allP);
      const activeP = allP.find(p => p.is_active);
      const initialPeriod = activeP ? activeP.id : (allP[0]?.id || '');
      setSelectedPeriod(initialPeriod);
      load(initialPeriod);

      api.get('/areas').then(r => setAreas(r.data.areas?.filter(a => a.is_active).map(a => a.name) || []));
      api.get('/users?role=profesor').then(r => setTeachers((r.data.users || []).filter(u => u.is_active)));
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => { loadInitial(); }, []);

  useEffect(() => {
    if (selectedPeriod !== '') {
      load(selectedPeriod);
    }
  }, [selectedPeriod]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...form, period_id: selectedPeriod });
      setForm({ management_area: '', activity: '', expected_product: '', deadline_month: '', scope: 'global', specific_teacher_id: '' });
      setShowForm(false);
      load();
    } catch (err) { alert('Error al crear tarea: ' + (err.response?.data?.message || err.message)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta tarea permanentemente?')) return;
    try { await api.delete(`/tasks/${id}`); load(); }
    catch (err) { alert('Error al eliminar: ' + (err.response?.data?.message || err.message)); }
  };

  const startEdit = (task) => {
    // Normalizar deadline_month: el input[type=date] requiere YYYY-MM-DD.
    // Si es texto legado ("enero"), dejarlo vacío pero guardar el original para mostrarlo.
    const rawDeadline = task.deadline_month || '';
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(rawDeadline) ? rawDeadline : '';
    setEditingId(task.id);
    setEditData({ ...task, deadline_month: validDate, _oldDeadline: rawDeadline });
  };
  const cancelEdit = () => { setEditingId(null); setEditData({}); };

  const saveEdit = async () => {
    if (!editData.deadline_month) {
      const prev = editData._oldDeadline ? ` (tenía: "${editData._oldDeadline}")` : '';
      alert(`⚠️ Por favor selecciona una fecha límite antes de guardar${prev}.`);
      return;
    }
    try {
      await api.put(`/tasks/${editingId}`, editData);
      setEditingId(null); load();
    } catch (err) { alert('Error al guardar'); }
  };

  const cloneTasks = async () => {
    setCloning(true);
    try {
      const res = await api.post('/tasks/clone-to-period');
      const msg = res.data.message || 'Proceso completado.';
      const detail = res.data.detail || [];
      const newOnes = detail.filter(d => d.startsWith('CREATE')).length;
      const existed = detail.filter(d => d.startsWith('EXISTS')).length;
      const skipped = detail.filter(d => d.startsWith('SKIP')).length;
      let fullMsg = `✅ ${msg}\n\n`;
      if (newOnes > 0) fullMsg += `🆕 ${newOnes} asignación(es) nueva(s) creada(s)\n`;
      if (existed > 0) fullMsg += `ℹ️ ${existed} ya existían — no se duplicaron, pero sus fechas fueron sincronizadas\n`;
      if (skipped > 0) fullMsg += `⏭️ ${skipped} omitida(s) (tareas individuales para otro profesor)\n`;
      if (newOnes === 0 && existed > 0) fullMsg += `\nTodas las tareas ya estaban asignadas. Las fechas han sido sincronizadas en el Radar de Cumplimiento.`;
      alert(fullMsg);
      load();
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message;
      alert('❌ Error al asignar tareas: ' + serverMsg);
    }
    finally { setCloning(false); }
  };

  const resetTasks = async () => {
    if (!window.confirm('⚠️ ATENCIÓN ⚠️\n\n¿Estás seguro de querer borrar TODAS las asignaciones de este periodo?\n\nEsto eliminará las tareas de las bandejas de todos los profesores para que puedas volver a usar el botón verde y repartirlas limpiamente.\n\n(Las tareas no se borrarán de este listado, solo se les quitarán a los profesores).')) return;
    setResetting(true);
    try {
      const res = await api.post('/tasks/assignments/reset');
      alert(`✅ ${res.data.message}\n\nAhora puedes editar las tareas y volver a darle al botón "Asignar a Profesores".`);
      load();
    } catch (err) {
      alert('❌ Error al reiniciar: ' + (err.response?.data?.message || err.message));
    } finally {
      setResetting(false);
    }
  };

  const seedTasks = async () => {
    if (!window.confirm(
      '⚠️ CARGAR TAREAS INSTITUCIONALES\n\nEsto insertará las 43 tareas institucionales fijas (Aula Extendida, Entrega de Documentos, Investigación, etc.) para el periodo activo.\n\n¿Deseas continuar? (Se pueden eliminar individualmente si es necesario)'
    )) return;
    setSeeding(true);
    try {
      const res = await api.post('/tasks/seed-institutional');
      alert(`✅ ${res.data.message}\n\nAhora presiona "Asignar a Profesores" para distribuirlas.`);
      load();
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
    } finally { setSeeding(false); }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#0C447C] flex items-center gap-2"><ClipboardList size={18}/> Plan de Trabajo — Tareas Institucionales</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">PERIODO:</span>
            <div className="border border-blue-200 rounded-md text-xs px-3 py-1.5 bg-blue-50 text-blue-800 font-bold">
              {periods.find(p => String(p.id) === String(selectedPeriod))?.name || 'Cargando...'}
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-1 italic">Actividades fijas que aplican a los profesores en el periodo seleccionado.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button onClick={seedTasks} disabled={seeding}
            title="Carga las 43 tareas institucionales predefinidas para el periodo activo"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50">
            {seeding ? '⏳ Cargando...' : '📋 Cargar Tareas Institucionales'}
          </button>
          <button onClick={resetTasks} disabled={resetting}
            title="Borra todas las asignaciones actuales de los profesores"
            className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50">
            <RefreshCcw size={14} className={resetting ? "animate-spin" : ""}/> {resetting ? 'Borrando...' : 'Reiniciar Asignaciones'}
          </button>
          <button onClick={cloneTasks} disabled={cloning}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50">
            <Users size={14}/> {cloning ? 'Clonando...' : 'Asignar a Profesores'}
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-[#185FA5] hover:bg-[#0C447C] text-white px-4 py-2 rounded-lg text-xs font-bold transition">
            <Plus size={14}/> Nueva Tarea
          </button>
        </div>
      </div>

      {/* Formulario crear */}
      {showForm && (
        <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm">
          <h3 className="font-bold text-sm text-[#0C447C] mb-4">Nueva Tarea Institucional</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Área / Función Sustantiva</label>
              <select required value={form.management_area} onChange={e => setForm({...form, management_area: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white outline-none focus:border-blue-500">
                <option value="">Seleccione...</option>
                {areas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-600">Fecha límite de entrega</label>
              <input type="date" required value={form.deadline_month} onChange={e => setForm({...form, deadline_month: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white outline-none focus:border-blue-500"/>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-600">Actividad / Compromiso asignado</label>
              <input required value={form.activity} onChange={e => setForm({...form, activity: e.target.value})}
                placeholder="Ej: Entrega de syllabus firmado al inicio del semestre"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"/>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-600">Producto / Insumo esperado</label>
              <input required value={form.expected_product} onChange={e => setForm({...form, expected_product: e.target.value})}
                placeholder="Ej: Syllabus firmado radicado en la Dirección"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500"/>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1 text-gray-600">Alcance de la Tarea</label>
              <div className="flex gap-4 mt-2 mb-3">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="radio" name="scope" value="global" checked={form.scope === 'global'} onChange={e => setForm({...form, scope: e.target.value})} className="accent-blue-600"/>
                  🌐 Global (1 vez por profe)
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="radio" name="scope" value="por_curso" checked={form.scope === 'por_curso'} onChange={e => setForm({...form, scope: e.target.value})} className="accent-blue-600"/>
                  📚 Por Curso (Se repite por materia)
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="radio" name="scope" value="individual" checked={form.scope === 'individual'} onChange={e => setForm({...form, scope: e.target.value})} className="accent-blue-600"/>
                  👤 A Profesor Específico
                </label>
              </div>

              {form.scope === 'individual' && (
                <div className="mt-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <label className="block text-xs font-bold mb-1 text-[#0C447C]">Selecciona el Docente:</label>
                  <select required value={form.specific_teacher_id} onChange={e => setForm({...form, specific_teacher_id: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 text-sm bg-white outline-none focus:border-blue-500">
                    <option value="">Seleccione un profesor...</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="bg-[#185FA5] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#0C447C]">Guardar Tarea</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {tasks.length} tarea(s) registradas
        </div>
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Cargando...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Aún no hay tareas. Crea la primera con el botón "Nueva Tarea".</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Actividad</th>
                <th className="px-5 py-3 text-left font-semibold">Producto esperado</th>
                <th className="px-5 py-3 text-left font-semibold">Plazo</th>
                <th className="px-5 py-3 text-left font-semibold">Alcance</th>
                <th className="px-5 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Object.entries(
                tasks.reduce((acc, task) => {
                  if (!acc[task.management_area]) acc[task.management_area] = [];
                  acc[task.management_area].push(task);
                  return acc;
                }, {})
              ).map(([area, areaTasks]) => (
                <React.Fragment key={area}>
                  {/* Fila de cabecera de área para evitar amontonamiento */}
                  <tr className="bg-blue-50/50">
                    <td colSpan="5" className="px-5 py-2.5 text-xs font-black text-blue-900 uppercase tracking-widest border-y border-blue-100">
                      🏢 Área: {area}
                    </td>
                  </tr>
                  {areaTasks.map(task => (
                    <tr key={task.id} className="hover:bg-gray-50/60 transition">
                      <td className="px-5 py-3 text-gray-700 pl-8">
                    {editingId === task.id
                      ? <input value={editData.activity} onChange={e => setEditData({...editData, activity: e.target.value})} className="border border-blue-400 rounded px-2 py-1 text-xs w-full"/>
                      : task.activity}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {editingId === task.id
                      ? <input value={editData.expected_product} onChange={e => setEditData({...editData, expected_product: e.target.value})} className="border border-blue-400 rounded px-2 py-1 text-xs w-full"/>
                      : task.expected_product}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === task.id
                      ? (
                        <div>
                          <input type="date" required value={editData.deadline_month} onChange={e => setEditData({...editData, deadline_month: e.target.value})} className="border border-blue-400 rounded px-2 py-1 text-xs bg-white w-full"/>
                          {/* Mostrar fecha anterior si era texto legado */}
                          {editData._oldDeadline && !/^\d{4}-\d{2}-\d{2}$/.test(editData._oldDeadline) && (
                            <div className="text-[9px] text-orange-600 mt-1 italic">⚠️ Fecha anterior: "{editData._oldDeadline}" — selecciona una fecha real</div>
                          )}
                        </div>
                      )
                      : <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border font-bold text-center block w-fit">{formatDate(task.deadline_month)}</span>
                    }
                  </td>
                  <td className="px-5 py-3">
                    {editingId === task.id
                      ? (
                        <div className="space-y-2">
                          <select value={editData.scope} onChange={e => setEditData({...editData, scope: e.target.value})} className="border border-blue-400 rounded px-2 py-1 text-xs bg-white w-full">
                            <option value="global">Global</option>
                            <option value="por_curso">Por Curso</option>
                            <option value="individual">A Profesor</option>
                          </select>
                          {editData.scope === 'individual' && (
                            <select value={editData.specific_teacher_id || ''} onChange={e => setEditData({...editData, specific_teacher_id: e.target.value})} className="border border-blue-400 rounded px-2 py-1 text-xs bg-white w-full">
                              <option value="">Seleccione profe...</option>
                              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                          )}
                        </div>
                      )
                      : (task.scope === 'por_curso' 
                          ? <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 block w-fit">📚 POR CURSO</span>
                          : task.scope === 'individual'
                          ? <div className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-200 w-fit">👤 ESPECÍFICA<div className="font-normal text-[9px] text-purple-500 mt-0.5 max-w-[120px] truncate">{task.SpecificTeacher?.name || 'Profesor sin asignar'}</div></div>
                          : <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 block w-fit">🌐 GLOBAL</span>
                        )
                    }
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === task.id ? (
                        <>
                          <button onClick={saveEdit} title="Guardar" className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded transition"><Save size={13}/></button>
                          <button onClick={cancelEdit} title="Cancelar" className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1.5 rounded transition"><X size={13}/></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(task)} title="Editar" className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-1.5 rounded transition"><Pencil size={13}/></button>
                          <button onClick={() => handleDelete(task.id)} title="Eliminar" className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded transition"><Trash2 size={13}/></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              </React.Fragment>
            ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

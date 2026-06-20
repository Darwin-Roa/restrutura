import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  Bell, Plus, Trash2, Save, Play, Mail, Building2,
  CheckCircle2, AlertCircle, Loader2, Info, Edit2, X
} from 'lucide-react';

export const NotificationSettings = () => {
  const [dias, setDias]               = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [simulating, setSimulating]   = useState(false);
  const [newDay, setNewDay]           = useState('');
  const [newUnit, setNewUnit]         = useState('days');
  const [toast, setToast]             = useState(null); // { type: 'success'|'error', msg }
  const [simResult, setSimResult]     = useState(null);
  const [savingDept, setSavingDept]   = useState(null);
  const [savedDept, setSavedDept]     = useState(null);
  const [editingDepts, setEditingDepts] = useState({}); // { id: true/false }

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/notification-settings');
      setDias(res.data.dias_alertas ?? []);
      setDepartments(res.data.departments ?? []);
    } catch {
      showToast('error', 'Error al cargar la configuración.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Días y Horas de alerta ──────────────────────────────────────────────
  const addDay = () => {
    const d = parseInt(newDay, 10);
    if (isNaN(d) || d <= 0) {
      showToast('error', 'Ingresa un número válido mayor a 0.');
      return;
    }
    const exists = dias.some(x => x.value === d && x.unit === newUnit);
    if (exists) {
      showToast('error', `Ya tienes configurado un aviso de ${d} ${newUnit === 'days' ? 'día(s)' : 'hora(s)'}.`);
      return;
    }
    const newDias = [...dias, { value: d, unit: newUnit }];
    // Ordenar: primero días (mayor a menor), luego horas (mayor a menor)
    newDias.sort((a, b) => {
      const aHours = a.unit === 'days' ? a.value * 24 : a.value;
      const bHours = b.unit === 'days' ? b.value * 24 : b.value;
      return bHours - aHours;
    });
    setDias(newDias);
    setNewDay('');
  };

  const removeDay = (val, unit) => setDias(dias.filter(x => !(x.value === val && x.unit === unit)));

  const saveDias = async () => {
    if (dias.length === 0) {
      showToast('error', 'Debes tener al menos un intervalo configurado.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/admin/notification-settings/dias', { dias });
      showToast('success', 'Intervalos de alerta guardados correctamente.');
    } catch {
      showToast('error', 'Error al guardar los días.');
    } finally {
      setSaving(false);
    }
  };

  // ── Correos por departamento ────────────────────────────────────
  const updateEmail = (id, value) => {
    setDepartments(prev =>
      prev.map(d => d.id === id ? { ...d, email_contacto: value } : d)
    );
  };

  const saveDeptEmail = async (dept) => {
    setSavingDept(dept.id);
    try {
      await api.patch(`/admin/departments/${dept.id}/email`, {
        email_contacto: dept.email_contacto || null
      });
      showToast('success', `Correo de "${dept.name}" guardado.`);
      setSavedDept(dept.id);
      setTimeout(() => {
        setSavedDept(null);
        setEditingDepts(prev => ({ ...prev, [dept.id]: false }));
      }, 1500); // mostrar check por 1.5 segundos y luego cerrar cajón
    } catch {
      showToast('error', `Error al guardar el correo de "${dept.name}".`);
    } finally {
      setSavingDept(null);
    }
  };

  // ── Simulación ──────────────────────────────────────────────────
  const runSimulation = async () => {
    setSimulating(true);
    setSimResult(null);
    try {
      const res = await api.post('/admin/notifications/test-run');
      setSimResult(res.data);
      showToast('success', res.data.message);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Error en la simulación.');
    } finally {
      setSimulating(false);
    }
  };

  const dayLabel = (d) => {
    const val = d.value;
    if (d.unit === 'hours') return `${val} hora${val !== 1 ? 's' : ''} antes`;
    return val === 1 ? '1 día antes' : `${val} días antes`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60 text-gray-400 gap-2">
        <Loader2 size={20} className="animate-spin" /> Cargando configuración…
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold animate-fadeIn ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Bell size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0C447C]">Configuración de Notificaciones</h1>
            <p className="text-xs text-gray-400">Automatización inteligente e interactividad instantánea</p>
          </div>
        </div>
      </div>

      {/* ═══════ SECCIÓN 1: Días de alerta ═══════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <h2 className="text-sm font-bold text-[#0C447C] flex items-center gap-2">
            <Bell size={15} /> Automatización Inteligente — Días de Alerta de Vencimiento
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            El sistema enviará correos a cada docente tantos días <em>antes</em> del vencimiento de su actividad como
            los hitos que configures aquí. Puedes agregar o eliminar cualquier valor.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Chips de días actuales */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Hitos configurados:</p>
            {dias.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No hay hitos configurados aún.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {dias.map((d, i) => (
                  <div
                    key={`${d.value}_${d.unit}_${i}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                      d.unit === 'hours' ? 'bg-orange-100 text-orange-700 border-orange-200'
                      : d.value <= 3 ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}
                  >
                    {dayLabel(d)}
                    <button onClick={() => removeDay(d.value, d.unit)}
                      className="ml-1 text-current opacity-60 hover:opacity-100 transition">
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agregar nuevo día */}
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={365}
              value={newDay}
              onChange={e => setNewDay(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addDay()}
              placeholder="Ej: 5"
              className="w-20 text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
            />
            <select
              value={newUnit}
              onChange={e => setNewUnit(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-400 bg-white"
            >
              <option value="days">días antes</option>
              <option value="hours">horas antes</option>
            </select>
            <button onClick={addDay}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition">
              <Plus size={13} /> Agregar hito
            </button>
          </div>

          <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
            <button
              onClick={saveDias}
              disabled={saving}
              className="flex items-center gap-2 bg-[#0C447C] hover:bg-[#0a3663] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
              {saving ? 'Guardando…' : 'Guardar configuración de días'}
            </button>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Info size={12}/> Los cambios se aplican desde la próxima ejecución automática (08:00 AM diario).
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ SECCIÓN 2: Correos por departamento ═══════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
          <h2 className="text-sm font-bold text-[#0C447C] flex items-center gap-2">
            <Mail size={15} /> Interactividad Instantánea — Correos por Departamento
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Cuando un docente suba una evidencia, el sistema enviará una alerta automática al correo
            institucional del departamento al que pertenece ese docente.
          </p>
        </div>

        <div className="divide-y divide-gray-50">
          {departments.map(dept => (
            <div key={dept.id} className="flex items-center gap-4 px-6 py-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Building2 size={15} className="text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{dept.name}</p>
              </div>
              <div className="flex items-center gap-2 w-80">
                {dept.email_contacto && !editingDepts[dept.id] && savedDept !== dept.id ? (
                  <div className="flex-1 flex items-center justify-between bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
                    <span className="text-xs font-bold text-emerald-800 truncate pr-2">{dept.email_contacto}</span>
                    <button 
                      onClick={() => setEditingDepts(prev => ({ ...prev, [dept.id]: true }))}
                      className="text-emerald-600 hover:text-emerald-800 transition"
                      title="Editar correo"
                    >
                      <Edit2 size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="email"
                      value={dept.email_contacto || ''}
                      onChange={e => updateEmail(dept.id, e.target.value)}
                      placeholder={`correo@unisimon.edu.co`}
                      className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-400"
                    />
                    <button
                      onClick={() => saveDeptEmail(dept)}
                      disabled={savingDept === dept.id}
                      title="Guardar correo"
                      className={`p-2 rounded-lg border transition flex items-center justify-center w-8 h-8 shrink-0 ${
                        savedDept === dept.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {savingDept === dept.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : savedDept === dept.id ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <Save size={13} />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {departments.length === 0 && (
            <p className="px-6 py-8 text-sm text-gray-400 text-center italic">
              No hay departamentos registrados aún.
            </p>
          )}
        </div>
      </div>

      {/* ═══════ SECCIÓN 3: Botón de simulación ═══════ */}
      <div className="bg-gradient-to-br from-[#0C447C] to-[#185FA5] rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              <Play size={16}/> Simular ejecución de alertas ahora
            </h2>
            <p className="text-sm text-blue-100 mt-1 max-w-lg">
              Fuerza el envío inmediato de las alertas de vencimiento calculadas con los días configurados.
              Úsalo para comprobar que los correos funcionan sin esperar a la ejecución automática de las 8:00 AM.
            </p>
          </div>
          <button
            onClick={runSimulation}
            disabled={simulating}
            className="shrink-0 flex items-center gap-2 bg-white text-[#0C447C] hover:bg-blue-50 px-5 py-3 rounded-xl text-sm font-extrabold transition disabled:opacity-60 shadow"
          >
            {simulating ? <Loader2 size={15} className="animate-spin"/> : <Play size={15}/>}
            {simulating ? 'Ejecutando…' : 'Ejecutar ahora'}
          </button>
        </div>

        {/* Resultado de la simulación */}
        {simResult && (
          <div className="mt-5 bg-white/10 rounded-xl p-4 border border-white/20">
            <p className="text-sm font-bold mb-2 flex items-center gap-2">
              <CheckCircle2 size={14}/> {simResult.message}
            </p>
            {simResult.detalle?.length > 0 && (
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {simResult.detalle.map((item, i) => (
                  <li key={i} className={`text-xs font-mono ${item.startsWith('[ERROR]') ? 'text-red-300' : 'text-blue-100'}`}>
                    • {item}
                  </li>
                ))}
              </ul>
            )}
            {simResult.enviados === 0 && (
              <p className="text-xs text-blue-200 italic mt-1">
                No hay actividades próximas a vencer con los días configurados en este momento.
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

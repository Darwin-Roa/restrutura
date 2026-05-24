import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Play, CheckCircle, Pencil, Save, X } from 'lucide-react';

export const PeriodManagement = () => {
  const [periods, setPeriods] = useState([]);
  const [formData, setFormData] = useState({ name: '', start_date: '', end_date: '' });
  const [loading, setLoading] = useState(false);
  const [openingId, setOpeningId] = useState(null);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', start_date: '', end_date: '' });
  const [saving, setSaving] = useState(false);

  const fetchPeriods = async () => {
    try {
      const res = await api.get('/periods');
      setPeriods(res.data.periods);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchPeriods(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/periods', formData);
      setFormData({ name: '', start_date: '', end_date: '' });
      fetchPeriods();
    } catch (e) {
      alert('Error al crear periodo: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPeriod = async (id) => {
    if (!window.confirm('¿Estás seguro de abrir este periodo? Cerrará otros periodos activos y clonará las tareas a todos los profesores.')) return;
    setOpeningId(id);
    try {
      const res = await api.post(`/periods/${id}/open`, {});
      alert(`✅ ${res.data.message}`);
      fetchPeriods();
    } catch (e) {
      const msg = e.response?.data?.error || e.response?.data?.message || e.message || 'Error desconocido';
      alert('Error al abrir el periodo: ' + msg);
      console.error(e);
    } finally {
      setOpeningId(null);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    // Format dates to YYYY-MM-DD for the input[type=date]
    const fmt = (d) => d ? d.split('T')[0] : '';
    setEditData({ name: p.name, start_date: fmt(p.start_date), end_date: fmt(p.end_date) });
  };

  const cancelEdit = () => { setEditingId(null); setEditData({ name: '', start_date: '', end_date: '' }); };

  const handleSaveEdit = async (id) => {
    if (!editData.name.trim()) { alert('El nombre del periodo es obligatorio.'); return; }
    setSaving(true);
    try {
      await api.put(`/periods/${id}`, editData);
      setEditingId(null);
      fetchPeriods();
    } catch (e) {
      alert('Error al guardar: ' + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Formulario Crear */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-base font-bold text-[#0C447C] mb-4">Crear Nuevo Periodo Académico</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4 items-end">
          <div className="col-span-2">
            <label className="block text-xs font-medium mb-1 text-gray-600">Nombre (Ej: 2026-1)</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Fecha de Inicio</label>
            <input required type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})}
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Fecha de Fin</label>
            <input required type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})}
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" />
          </div>
          <div className="col-span-4 flex items-center gap-4 mt-1">
            <button disabled={loading} className="bg-[#0C447C] hover:bg-[#0a3663] text-white px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50">
              {loading ? 'Creando...' : 'Registrar Periodo'}
            </button>
            <p className="text-[11px] text-gray-400 italic">
              El periodo nace en estado "Cerrado". Usa el botón <strong>Aperturar</strong> para activarlo y clonar tareas.
            </p>
          </div>
        </form>
      </div>

      {/* Tabla de Periodos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Periodos Registrados</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 font-semibold">Nombre</th>
              <th className="px-5 py-3 font-semibold">Inicio</th>
              <th className="px-5 py-3 font-semibold">Fin</th>
              <th className="px-5 py-3 font-semibold text-center">Estado</th>
              <th className="px-5 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {periods.map(p => (
              <tr key={p.id} className={`transition ${p.is_active ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}>

                {/* Nombre */}
                <td className="px-5 py-3">
                  {editingId === p.id
                    ? <input autoFocus value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})}
                        className="border border-blue-400 rounded-lg px-2.5 py-1.5 text-sm font-semibold w-32 outline-none focus:ring-2 focus:ring-blue-300" />
                    : <span className="font-semibold text-gray-800">{p.name}</span>
                  }
                </td>

                {/* Fecha inicio */}
                <td className="px-5 py-3 text-gray-600">
                  {editingId === p.id
                    ? <input type="date" value={editData.start_date} onChange={e => setEditData({...editData, start_date: e.target.value})}
                        className="border border-blue-400 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
                    : (p.start_date ? p.start_date.split('T')[0] : '—')
                  }
                </td>

                {/* Fecha fin */}
                <td className="px-5 py-3 text-gray-600">
                  {editingId === p.id
                    ? <input type="date" value={editData.end_date} onChange={e => setEditData({...editData, end_date: e.target.value})}
                        className="border border-blue-400 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
                    : (p.end_date ? p.end_date.split('T')[0] : '—')
                  }
                </td>

                {/* Estado */}
                <td className="px-5 py-3 text-center">
                  {p.is_active
                    ? <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 border border-green-200 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                        <CheckCircle size={11} /> Activo
                      </span>
                    : <span className="text-gray-400 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                        Cerrado
                      </span>
                  }
                </td>

                {/* Acciones */}
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {editingId === p.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(p.id)} disabled={saving}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50 shadow-sm">
                          <Save size={12} /> {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button onClick={cancelEdit}
                          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold transition">
                          <X size={12} /> Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(p)}
                          className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                          title="Editar nombre o fechas del periodo">
                          <Pencil size={12} /> Editar
                        </button>
                        {!p.is_active && (
                          <button onClick={() => handleOpenPeriod(p.id)} disabled={openingId === p.id}
                            className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-50">
                            <Play size={12} fill="white" />
                            {openingId === p.id ? 'Abriendo...' : 'Aperturar'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {periods.length === 0 && (
              <tr><td colSpan="5" className="text-center px-5 py-10 text-gray-400 text-sm italic">No hay periodos creados aún.</td></tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

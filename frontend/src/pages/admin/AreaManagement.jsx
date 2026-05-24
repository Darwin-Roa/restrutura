import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Pencil, Trash2, Save, X, ClipboardList } from 'lucide-react';

export const AreaManagement = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', is_active: true });
  const [error, setError] = useState(null);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/areas');
      setAreas(res.data.areas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAreas(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await api.put(`/areas/${editingId}`, form);
      } else {
        await api.post('/areas', form);
      }
      setForm({ name: '', is_active: true });
      setShowForm(false);
      setEditingId(null);
      fetchAreas();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta función sustantiva/área?')) return;
    try {
      await api.delete(`/areas/${id}`);
      fetchAreas();
    } catch (err) {
      alert('Error al eliminar (Es posible que tenga registros asociados).');
    }
  };

  const startEdit = (area) => {
    setEditingId(area.id);
    setForm({ name: area.name, is_active: area.is_active });
    setShowForm(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#0C447C] flex items-center gap-2">
            <ClipboardList className="text-[#185FA5]"/> Gestión de Áreas y Funciones Sustantivas
          </h2>
          <p className="text-sm text-gray-500 mt-1">Configura las áreas que los directores usarán para asignar tareas institucionales.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { setForm({ name: '', is_active: true }); setShowForm(true); setEditingId(null); }}
            className="bg-[#185FA5] hover:bg-[#0C447C] text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Plus size={18}/> Nueva Área
          </button>
        )}
      </div>

      {showForm && (
        <div className="p-6 border-b border-gray-200 bg-[#f8fafc]">
           <form onSubmit={handleSave} className="max-w-xl">
             {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">{error}</div>}
             <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Área</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="Ej. Docencia, Extensión Cultural..." className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#185FA5] outline-none" />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center gap-2 rounded text-sm font-bold transition">
                    <Save size={16}/> Guardar
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 flex items-center gap-2 rounded text-sm font-bold transition">
                    <X size={16}/> Cancelar
                  </button>
                </div>
             </div>
           </form>
        </div>
      )}

      <div className="p-0">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-gray-100 text-gray-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold w-full">Nombre de la Función</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60">
              {areas.map(area => (
                <tr key={area.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{area.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{area.name}</td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button onClick={() => startEdit(area)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"><Pencil size={16}/></button>
                    <button onClick={() => handleDelete(area.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {areas.length === 0 && (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-400">No hay áreas configuradas.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

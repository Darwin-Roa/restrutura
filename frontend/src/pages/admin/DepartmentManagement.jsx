import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Plus, Pencil, Trash2, Save, X, Building2 } from 'lucide-react';

export const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', is_active: true });
  const [error, setError] = useState(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      setDepartments(res.data.departments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, form);
      } else {
        await api.post('/departments', form);
      }
      setForm({ name: '', is_active: true });
      setShowForm(false);
      setEditingId(null);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este departamento?')) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      alert('Error al eliminar (Es posible que tenga usuarios asociados).');
    }
  };

  const startEdit = (dept) => {
    setEditingId(dept.id);
    setForm({ name: dept.name, is_active: dept.is_active });
    setShowForm(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#0C447C] flex items-center gap-2">
            <Building2 className="text-[#185FA5]"/> Gestión de Departamentos Institucionales
          </h2>
          <p className="text-sm text-gray-500 mt-1">Configura las unidades académicas o administrativas de la institución.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { setForm({ name: '', is_active: true }); setShowForm(true); setEditingId(null); }}
            className="bg-[#185FA5] hover:bg-[#0C447C] text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
          >
            <Plus size={18}/> Nuevo Departamento
          </button>
        )}
      </div>

      {showForm && (
        <div className="p-6 border-b border-gray-200 bg-[#f8fafc]">
           <form onSubmit={handleSave} className="max-w-xl">
             {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">{error}</div>}
             <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Departamento</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    placeholder="Ej. Ingeniería de Sistemas, Psicología..." className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#185FA5] outline-none" />
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
                <th className="px-6 py-4 font-semibold w-full">Nombre del Departamento</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60">
              {departments.map(dept => (
                <tr key={dept.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{dept.id}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{dept.name}</td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button onClick={() => startEdit(dept)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"><Pencil size={16}/></button>
                    <button onClick={() => handleDelete(dept.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-400">No hay departamentos configurados.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Pencil, UserX, UserCheck, Save, X, UserPlus } from 'lucide-react';

const ROLE_LABELS = { admin: 'Administrador', director: 'Director', coordinador: 'Coordinador', profesor: 'Profesor' };
const ROLE_COLORS = { admin: 'bg-purple-100 text-purple-700', director: 'bg-blue-100 text-blue-700', coordinador: 'bg-orange-100 text-orange-700', profesor: 'bg-green-100 text-green-700' };

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'profesor', programa_id: '', cedula: '' });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch { alert('Error al cargar usuarios'); }
  };

  const fetchPrograms = async () => {
    try {
      const res = await api.get('/departments');
      setPrograms(res.data.departments || []);
    } catch { console.error('Error cargando programas'); }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setRoles(res.data.roles || []);
    } catch { console.error('Error cargando roles'); }
  };

  // Resolve program name from id
  const getProgramName = (programa_id) => {
    if (!programa_id) return '—';
    const prog = programs.find(d => d.id === programa_id || d.id === Number(programa_id));
    return prog ? prog.name : '—';
  };

  useEffect(() => {
    fetchUsers();
    fetchPrograms();
    fetchRoles();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users', {
        ...formData,
        programa_id: formData.programa_id ? Number(formData.programa_id) : null,
        cedula: formData.cedula ? Number(formData.cedula) : null
      });
      setFormData({ name: '', email: '', password: '', role: 'profesor', programa_id: '', cedula: '' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear usuario');
    } finally { setLoading(false); }
  };

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditData({ name: user.name, role: user.role, programa_id: user.programa_id ?? '', cedula: user.cedula ?? '' });
  };

  const cancelEdit = () => { setEditingId(null); setEditData({}); };

  const saveEdit = async (id) => {
    try {
      await api.put(`/users/${id}`, {
        ...editData,
        programa_id: editData.programa_id !== '' ? Number(editData.programa_id) : null,
        cedula: editData.cedula !== '' ? Number(editData.cedula) : null
      });
      setEditingId(null);
      fetchUsers();
    } catch { alert('Error al guardar cambios'); }
  };

  const toggleActive = async (user) => {
    const accion = user.is_active ? 'desactivar' : 'reactivar';
    if (!window.confirm(`¿Seguro que deseas ${accion} a ${user.name}?`)) return;
    try {
      await api.put(`/users/${user.id}`, { is_active: !user.is_active });
      fetchUsers();
    } catch { alert('Error al cambiar estado'); }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Formulario crear */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e5e7eb]">
        <div className="flex items-center gap-2 mb-5">
          <UserPlus size={20} className="text-[#0C447C]" />
          <h2 className="text-base font-bold text-[#0C447C]">Crear Nuevo Usuario</h2>
        </div>
        <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Nombre completo</label>
            <input required name="name" placeholder="Ej. María García" value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Cédula</label>
            <input required type="number" name="cedula" placeholder="Ej. 12345678" value={formData.cedula}
              onChange={e => setFormData({...formData, cedula: e.target.value})}
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Correo institucional</label>
            <input required type="email" name="email" placeholder="correo@usb.edu.co" value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Contraseña temporal</label>
            <input required minLength={6} type="password" placeholder="Mínimo 6 caracteres" value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Programa Académico</label>
            <select name="programa_id" value={formData.programa_id}
              onChange={e => setFormData({...formData, programa_id: e.target.value})}
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white outline-none focus:border-blue-500">
              <option value="">Seleccione Programa...</option>
              {programs.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600">Rol institucional</label>
            <select name="role" value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              className="w-full text-sm border border-gray-300 rounded-lg p-2.5 bg-white outline-none focus:border-blue-500">
              {roles.map(r => (
                <option key={r.name} value={r.name}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end justify-end">
            <button disabled={loading}
              className="bg-[#0C447C] hover:bg-[#0a3663] text-white px-6 py-2.5 rounded-lg text-sm font-bold transition disabled:opacity-50 flex items-center gap-2">
              <UserPlus size={16} /> {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-[#0C447C] text-sm">Usuarios Registrados ({users.length})</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-4 font-semibold">Cédula</th>
              <th className="p-4 font-semibold">Nombre</th>
              <th className="p-4 font-semibold">Correo</th>
              <th className="p-4 font-semibold">Programa</th>
              <th className="p-4 font-semibold">Rol</th>
              <th className="p-4 font-semibold">Estado</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u.id} className={`hover:bg-gray-50/80 transition ${!u.is_active ? 'opacity-50' : ''}`}>
                <td className="p-4">
                  {editingId === u.id
                    ? <input type="number" value={editData.cedula} onChange={e => setEditData({...editData, cedula: e.target.value})}
                        className="border border-blue-400 rounded px-2 py-1 text-sm w-24 outline-none" />
                    : <span className="text-gray-600 text-sm">{u.cedula || '—'}</span>}
                </td>
                <td className="p-4">
                  {editingId === u.id
                    ? <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})}
                        className="border border-blue-400 rounded px-2 py-1 text-sm w-full outline-none" />
                    : <span className="font-medium text-gray-800">{u.name}</span>}
                </td>
                <td className="p-4 text-gray-500">{u.email}</td>
                <td className="p-4">
                  {editingId === u.id
                    ? <select value={editData.programa_id} onChange={e => setEditData({...editData, programa_id: e.target.value})}
                        className="border border-blue-400 rounded px-2 py-1 text-sm w-full bg-white outline-none">
                        <option value="">Sin Programa</option>
                        {programs.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    : <span className="text-gray-600 text-xs">{getProgramName(u.programa_id)}</span>}
                </td>
                <td className="p-4">
                  {editingId === u.id
                    ? <select value={editData.role} onChange={e => setEditData({...editData, role: e.target.value})}
                        className="border border-blue-400 rounded px-2 py-1 text-xs bg-white outline-none">
                        {roles.map(r => (
                          <option key={r.name} value={r.name}>{r.label}</option>
                        ))}
                      </select>
                    : <span className={`text-[11px] font-bold px-2 py-1 rounded ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700'}`}>
                        {roles.find(r => r.name === u.role)?.label || ROLE_LABELS[u.role] || u.role}
                      </span>}
                </td>
                <td className="p-4">
                  <span className={`text-[11px] font-bold px-2 py-1 rounded ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    {editingId === u.id ? (
                      <>
                        <button onClick={() => saveEdit(u.id)} title="Guardar" className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded transition">
                          <Save size={14} />
                        </button>
                        <button onClick={cancelEdit} title="Cancelar" className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-1.5 rounded transition">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(u)} title="Editar" className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-1.5 rounded transition">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => toggleActive(u)} title={u.is_active ? 'Desactivar' : 'Reactivar'}
                          className={`p-1.5 rounded transition ${u.is_active ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-green-50 hover:bg-green-100 text-green-700'}`}>
                          {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { ShieldCheck, Plus, Trash2, Edit2, Save, X, AlertCircle } from 'lucide-react';

// Permisos disponibles (Alineados exactamente con el menú lateral)
const PERMISSIONS_CATALOG = [
  { key: 'seguimiento_general',     label: 'Seguimiento general',     group: 'Módulos del Sistema' },
  { key: 'subir_evaluacion',        label: 'Subir Evaluación',        group: 'Módulos del Sistema' },
  { key: 'copilot_ia',              label: 'Copilot IA — plan',       group: 'Módulos del Sistema' },
  { key: 'planes_mejora',           label: 'Planes de mejora',        group: 'Módulos del Sistema' },
  { key: 'auditoria_docente',       label: 'Auditoría Docente',       group: 'Módulos del Sistema' },
  { key: 'plan_trabajo',            label: 'Plan de trabajo',         group: 'Módulos del Sistema' },
  { key: 'gestion_cursos',          label: 'Gestión de Cursos',       group: 'Módulos del Sistema' },
  { key: 'bandeja_evidencias',      label: 'Bandeja de evidencias',   group: 'Módulos del Sistema' },
  { key: 'exportar',                label: 'Exportar',                group: 'Módulos del Sistema' }
];

const GROUPS = [...new Set(PERMISSIONS_CATALOG.map(p => p.group))];

// Roles del sistema (base, no editables visibles)
const SYSTEM_ROLES = ['director'];

const ALL = PERMISSIONS_CATALOG.map(p => p.key);

const DEFAULT_PERMS = {
  admin:       ALL,
  director:    ALL,
  coordinador: [
    'seguimiento_general', 'subir_evaluacion', 'planes_mejora', 'auditoria_docente',
    'plan_trabajo', 'gestion_cursos', 'bandeja_evidencias', 'exportar'
  ],
  profesor:    [
    'planes_mejora', 'plan_trabajo', 'bandeja_evidencias'
  ],
};

const ReadOnlyPermissions = ({ permissions }) => {
  if (!permissions || permissions.length === 0) {
    return <span className="text-xs text-gray-400 italic">Sin permisos asignados</span>;
  }

  const grouped = permissions.reduce((acc, p) => {
    const info = PERMISSIONS_CATALOG.find(x => x.key === p);
    if (info) {
      if (!acc[info.group]) acc[info.group] = [];
      acc[info.group].push(info.label);
    }
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
      {Object.entries(grouped).map(([groupName, labels]) => (
        <div key={groupName}>
          <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 border-b border-gray-200 pb-1">{groupName}</h4>
          <ul className="space-y-1">
            {labels.map(label => (
              <li key={label} className="text-[11px] text-gray-600 flex items-center gap-1.5 leading-tight">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-300"></div>
                 {label}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export const RoleManagement = () => {
  const [customRoles, setCustomRoles] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', label: '', permissions: [] });
  const [editingRole, setEditingRole] = useState(null); // name of role being edited
  const [editPerms, setEditPerms] = useState([]);
  const [error, setError] = useState('');

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setCustomRoles(res.data.roles.filter(r => !r.is_system));
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const togglePerm = (key, perms, setPerms) => {
    if (perms.includes(key)) setPerms(perms.filter(k => k !== key));
    else setPerms([...perms, key]);
  };

  const handleCreate = async () => {
    setError('');
    const slug = newRole.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (!slug) { setError('El nombre del rol es requerido.'); return; }
    if (SYSTEM_ROLES.includes(slug) || customRoles.find(r => r.name === slug)) {
      setError('Ya existe un rol con ese nombre.'); return;
    }
    
    try {
      await api.post('/roles', {
        name: slug,
        label: newRole.label || slug,
        permissions: newRole.permissions
      });
      
      setNewRole({ name: '', label: '', permissions: [] });
      setCreating(false);
      fetchRoles();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear rol');
    }
  };

  const handleDelete = async (role) => {
    if (!window.confirm(`¿Eliminar el rol "${role.label}"? Los usuarios con este rol deberán ser reasignados.`)) return;
    try {
      await api.delete(`/roles/${role.id}`);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar rol');
    }
  };

  const startEdit = (role) => {
    setEditingRole(role.id);
    setEditPerms([...role.permissions]);
  };

  const saveEdit = async (roleId) => {
    try {
      await api.put(`/roles/${roleId}`, { permissions: editPerms });
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar rol');
    }
  };

  const PermissionGrid = ({ perms, setPerms, readOnly = false }) => {
    const catalog = readOnly 
      ? PERMISSIONS_CATALOG 
      : PERMISSIONS_CATALOG;
      
    const currentGroups = [...new Set(catalog.map(p => p.group))];

    return (
      <div className="space-y-3">
        {currentGroups.map(group => (
          <div key={group}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{group}</p>
            <div className="flex flex-wrap gap-2">
              {catalog.filter(p => p.group === group).map(p => {
                const active = perms.includes(p.key);
                return (
                  <button
                    key={p.key}
                    type="button"
                    disabled={readOnly}
                    onClick={() => !readOnly && setPerms && togglePerm(p.key, perms, setPerms)}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition font-medium ${
                      active
                        ? 'bg-[#0C447C] text-white border-[#0C447C]'
                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-400 hover:text-gray-600'
                    } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
            <ShieldCheck size={18} className="text-purple-700" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0C447C]">Gestión de Roles</h1>
            <p className="text-xs text-gray-400">Crea roles personalizados con permisos específicos</p>
          </div>
        </div>
        {!creating && (
          <button onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-[#0C447C] hover:bg-[#0a3663] text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
            <Plus size={15} /> Nuevo Rol
          </button>
        )}
      </div>

      {/* Formulario Crear */}
      {creating && (
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
          <h2 className="text-sm font-bold text-[#0C447C] mb-4 flex items-center gap-2">
            <Plus size={14} /> Crear Nuevo Rol Personalizado
          </h2>
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs mb-4">
              <AlertCircle size={13} /> {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-500">Nombre del rol (interno)</label>
              <input value={newRole.name} placeholder="ej. asistente"
                onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:border-purple-400" />
              <p className="text-[10px] text-gray-400 mt-1">Solo letras minúsculas y guiones bajos</p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-gray-500">Etiqueta visible</label>
              <input value={newRole.label} placeholder="ej. Asistente Académico"
                onChange={e => setNewRole({ ...newRole, label: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:border-purple-400" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium mb-2 text-gray-500">Permisos del rol</label>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <PermissionGrid perms={newRole.permissions} setPerms={p => setNewRole({ ...newRole, permissions: p })} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => { setCreating(false); setError(''); setNewRole({ name: '', label: '', permissions: [] }); }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
              <X size={14} /> Cancelar
            </button>
            <button onClick={handleCreate}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
              <Save size={14} /> Guardar Rol
            </button>
          </div>
        </div>
      )}

      {/* Roles del sistema */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-[#0C447C] text-sm">Roles del Sistema (no editables)</h3>
          <p className="text-xs text-gray-400 mt-0.5">Estos roles son nativos de la plataforma y sus permisos están definidos por el sistema.</p>
        </div>
        <div className="divide-y divide-gray-50">
          {SYSTEM_ROLES.map(role => {
            const colors = { admin: 'purple', director: 'blue', coordinador: 'orange', profesor: 'green' };
            const c = colors[role] || 'gray';
            return (
              <div key={role} className="px-6 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded bg-${c}-100 text-${c}-700`}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                  <span className="text-xs text-gray-400">{DEFAULT_PERMS[role]?.length} permisos</span>
                </div>
                <ReadOnlyPermissions permissions={DEFAULT_PERMS[role]} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Roles personalizados */}
      {customRoles.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[#0C447C] text-sm">Roles Personalizados ({customRoles.length})</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {customRoles.map(role => (
              <div key={role.name} className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-indigo-100 text-indigo-700">
                      {role.label || role.name}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{role.name}</span>
                    <span className="text-xs text-gray-400">{role.permissions.length} permisos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingRole === role.id ? (
                      <>
                        <button onClick={() => saveEdit(role.id)}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                          <Save size={12} /> Guardar
                        </button>
                        <button onClick={() => setEditingRole(null)}
                          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                          <X size={12} /> Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(role)}
                          className="p-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 transition">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(role)}
                          className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 transition">
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editingRole === role.id ? (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <PermissionGrid perms={editPerms} setPerms={setEditPerms} />
                  </div>
                ) : (
                  <div className="mt-2">
                    <ReadOnlyPermissions permissions={role.permissions} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {customRoles.length === 0 && !creating && (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
          <ShieldCheck size={28} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No hay roles personalizados creados aún.</p>
          <p className="text-xs text-gray-300 mt-1">Haz clic en "Nuevo Rol" para crear uno.</p>
        </div>
      )}
    </div>
  );
};

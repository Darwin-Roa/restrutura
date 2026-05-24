import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { BookOpen, UserPlus, Trash2, GraduationCap } from 'lucide-react';

export const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activePeriod, setActivePeriod] = useState(null);

  const [courseData, setCourseData] = useState({ code: '', name: '', group: '', period_id: '' });
  const [assignData, setAssignData] = useState({ teacher_id: '', course_id: '', period_id: '' });

  const [loading, setLoading] = useState(false);
  const [loadingAssign, setLoadingAssign] = useState(false);

  const fetchData = async () => {
    try {
      const [cr, us, pr, asgn] = await Promise.all([
        api.get('/courses'),
        api.get('/users?role=profesor'),
        api.get('/periods'),
        api.get('/courses/assignments').catch(() => ({ data: { assignments: [] } }))
      ]);

      setCourses(cr.data.courses || []);
      setUsers((us.data.users || []).filter(u => u.is_active));
      const perList = pr.data.periods || [];
      setPeriods(perList);
      setAssignments(asgn.data.assignments || []);
      
      const active = perList.find(p => p.is_active);
      if (active) {
        setActivePeriod(active);
        setCourseData(prev => ({ ...prev, period_id: active.id }));
        setAssignData(prev => ({ ...prev, period_id: active.id }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/courses', courseData);
      setCourseData({ code: '', name: '', group: '', period_id: activePeriod?.id || '' });
      fetchData();
    } catch {
      alert('Error al crear curso');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setLoadingAssign(true);
    try {
      await api.post('/courses/assign', assignData);
      setAssignData({ teacher_id: '', course_id: '', period_id: activePeriod?.id || '' });
      fetchData();
      alert('Asignación completada');
    } catch {
      alert('Error al asignar');
    } finally {
      setLoadingAssign(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('⚠️ ADVERTENCIA: ¿Estás SEGURO de eliminar este curso? \n\nPor favor, verifica que no tenga datos atados (como tareas o evaluaciones). Si el curso tiene datos atados o dependencias, el sistema impedirá su borrado, o en algunos casos podría afectar el historial.\n\n¿Deseas continuar?')) return;
    try {
      await api.delete(`/courses/${id}`);
      fetchData();
      alert('Curso eliminado correctamente.');
    } catch (error) {
      alert('No se puede eliminar, es posible que tenga asignaciones activas o dependencias.');
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('¿Seguro que deseas quitarle este curso al profesor?')) return;
    try {
      await api.delete(`/courses/assign/${id}`);
      fetchData();
    } catch (error) {
      alert('Error al quitar el curso');
    }
  };

  const PeriodBadge = () => (
    <div>
      <label className="block text-xs font-medium mb-1 text-gray-500">Periodo (automático)</label>
      <div className={`w-full text-sm rounded-lg p-2.5 flex items-center gap-2 ${
        activePeriod
          ? 'bg-green-50 border border-green-200 text-green-800'
          : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
      }`}>
        <span>{activePeriod ? '✅' : '⚠️'}</span>
        <span className="font-semibold">
          {activePeriod
            ? activePeriod.name
            : 'No hay periodo activo — define uno en Gestión de Periodos'}
        </span>
      </div>
    </div>
  );

  // Group assignments by teacher for the list view
  const byTeacher = assignments.reduce((acc, a) => {
    const key = a.teacher_id;
    if (!acc[key]) acc[key] = { teacher: a.teacher || { name: `Profesor ${key}` }, courses: [] };
    acc[key].courses.push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">

        {/* Crear Curso */}
        <div className="bg-white p-6 rounded shadow-sm border border-[#e5e7eb]">
          <h2 className="text-lg font-medium text-[#0C447C] mb-4 flex items-center gap-2">
            <BookOpen size={18} /> Crear Curso Maestro
          </h2>
          <form onSubmit={handleCourseSubmit} className="space-y-3">
            <div>
              <label className="block text-xs mb-1">Nombre de la materia</label>
              <input required value={courseData.name}
                onChange={e => setCourseData({...courseData, name: e.target.value})}
                className="w-full text-sm border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1">Código</label>
                <input required value={courseData.code}
                  onChange={e => setCourseData({...courseData, code: e.target.value})}
                  className="w-full text-sm border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs mb-1">Grupo (Opcional)</label>
                <input value={courseData.group}
                  onChange={e => setCourseData({...courseData, group: e.target.value})}
                  className="w-full text-sm border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <PeriodBadge />
            <div className="w-full text-right pt-2">
              <button disabled={loading || !activePeriod}
                className="bg-[#0C447C] text-white px-4 py-2 rounded text-sm hover:bg-[#0a3663] disabled:opacity-50 transition">
                {loading ? 'Creando...' : 'Crear Curso'}
              </button>
            </div>
          </form>
        </div>

        {/* Asignar Profesor */}
        <div className="bg-white p-6 rounded shadow-sm border border-[#e5e7eb]">
          <h2 className="text-lg font-medium text-[#0C447C] mb-4 flex items-center gap-2">
            <UserPlus size={18} /> Asignar Profesor a Curso
          </h2>
          <form onSubmit={handleAssignSubmit} className="space-y-3">
            <div>
              <label className="block text-xs mb-1">Profesor</label>
              <select required value={assignData.teacher_id}
                onChange={e => setAssignData({...assignData, teacher_id: e.target.value})}
                className="w-full text-sm border rounded p-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Seleccione...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Curso</label>
              <select required value={assignData.course_id}
                onChange={e => setAssignData({...assignData, course_id: e.target.value})}
                className="w-full text-sm border rounded p-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Seleccione...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>
            </div>
            <PeriodBadge />
            <div className="w-full text-right pt-2">
              <button disabled={loadingAssign || !activePeriod}
                className="bg-[#378ADD] text-white px-4 py-2 rounded text-sm hover:bg-[#2e74c0] disabled:opacity-50 transition">
                {loadingAssign ? 'Asignando...' : 'Asignar Carga'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lista de cursos */}
      <div className="bg-white rounded shadow-sm border border-[#e5e7eb] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[#0C447C] text-sm">Cursos Registrados ({courses.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="p-4 font-semibold">Código</th>
                <th className="p-4 font-semibold">Materia</th>
                <th className="p-4 font-semibold">Grupo</th>
                <th className="p-4 font-semibold">Periodo</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {courses.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400 text-xs">No hay cursos registrados aún.</td></tr>
              )}
              {courses.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/80 transition">
                  <td className="p-4"><span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{c.code}</span></td>
                  <td className="p-4 font-medium text-gray-800">{c.name}</td>
                  <td className="p-4 text-gray-500">{c.group || '—'}</td>
                  <td className="p-4 text-gray-500 text-xs">{c.Period?.name || c.period?.name || '—'}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDeleteCourse(c.id)}
                      className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-600 transition" title="Eliminar curso">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Carga docente por profesor */}
      {Object.values(byTeacher).length > 0 && (
        <div className="bg-white rounded shadow-sm border border-[#e5e7eb] overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[#0C447C] text-sm flex items-center gap-2">
              <GraduationCap size={15} /> Carga Docente Asignada
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {Object.values(byTeacher).map((entry, i) => (
              <div key={i} className="px-6 py-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">{entry.teacher?.name}</p>
                <div className="flex flex-wrap gap-2">
                  {entry.courses.map((a, j) => (
                    <span key={j} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-full flex items-center gap-1">
                      {a.course?.name || a.Course?.name || `Curso ${a.course_id}`}
                      <button onClick={() => handleDeleteAssignment(a.id)} className="text-blue-400 hover:text-red-500 transition" title="Quitar curso">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


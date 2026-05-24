import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { FileText, CheckCircle, XCircle, Clock, Eye, AlertCircle, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BandejaEvidencias = () => {
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [editedResponses, setEditedResponses] = useState({});
  const navigate = useNavigate();

  const loadEvidences = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/evidence/pending?all=${showHistory}&_t=${Date.now()}`);
      setEvidences(res.data.evidences || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvidences();
  }, [showHistory]);

  const handleVerify = async (id, isApproved) => {
    if (!window.confirm(`¿Estás seguro de ${isApproved ? 'APROBAR' : 'RECHAZAR'} esta evidencia?`)) return;
    try {
      const payload = { is_approved: isApproved };
      if (editedResponses[id] !== undefined) {
        payload.teacher_response = editedResponses[id];
      }
      await api.patch(`/evidence/${id}/verify`, payload);
      loadEvidences();
    } catch (err) {
      alert('Error al verificar evidencia: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#0C447C] flex items-center gap-2">
            <FileText size={18} /> Bandeja de Evidencias
          </h2>
          <p className="text-[11px] text-gray-500 mt-1 italic">
            Revisa y aprueba los soportes enviados por los docentes.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`text-xs px-4 py-2 rounded-lg font-semibold transition border ${showHistory ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            <Clock size={14} className="inline mr-1" />
            {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Cargando evidencias...</div>
        ) : evidences.length === 0 ? (
          <div className="text-center py-12 text-gray-400 flex flex-col items-center">
            <CheckCircle size={48} className="text-gray-300 mb-3" />
            <span className="text-sm">¡Excelente! No hay evidencias pendientes de revisión.</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Profesor</th>
                <th className="px-5 py-3 text-left font-semibold">Actividad / Tarea</th>
                <th className="px-5 py-3 text-left font-semibold">Archivo</th>
                <th className="px-5 py-3 text-left font-semibold">Respuesta Escrita (Dato/Fecha)</th>
                <th className="px-5 py-3 text-left font-semibold">Estado</th>
                <th className="px-5 py-3 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {evidences.map(ev => {
                const isTask = !!ev.task_assignment_id;
                const activityName = isTask 
                  ? (ev.task_assignment?.FixedTask?.activity || ev.task_assignment?.fixed_task?.activity || 'Tarea Institucional')
                  : (ev.plan_action?.concrete_action || 'Acción de Plan de Mejora');
                
                return (
                  <tr key={ev.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-gray-800 text-xs">{ev.teacher?.name}</div>
                      <div className="text-[10px] text-gray-400">{ev.teacher?.department}</div>
                    </td>
                    <td className="px-5 py-3">
                      <button 
                        onClick={() => navigate(`/director/planes?teacher_id=${ev.teacher_id}`)}
                        className="text-xs text-blue-700 hover:text-blue-900 font-bold max-w-[250px] truncate flex items-center gap-1 hover:underline text-left" 
                        title={activityName}
                      >
                        {activityName}
                        <ExternalLink size={12} className="shrink-0" />
                      </button>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded mt-1 inline-block ${isTask ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {isTask ? 'TAREA FIJA' : 'PLAN DE MEJORA'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <a href={`${api.defaults.baseURL}/evidence/view/${ev.id}?token=${sessionStorage.getItem('token')}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 w-fit px-2.5 py-1.5 rounded-lg transition border border-blue-100 hover:border-blue-300">
                        <Eye size={14} /> {ev.file_name}
                      </a>
                      <div className="text-[9px] text-gray-400 mt-1 pl-1">
                        Subido el: {new Date(ev.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {isTask && ev.verified == null ? (
                        <div className="flex flex-col gap-1">
                          <input 
                            type="text" 
                            placeholder="Escribe para modificar la fecha o texto"
                            className="text-xs border border-gray-300 rounded px-2 py-1.5 w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={editedResponses[ev.id] ?? (ev.task_assignment?.teacher_response || '')}
                            onChange={(e) => setEditedResponses({...editedResponses, [ev.id]: e.target.value})}
                          />
                          <span className="text-[9px] text-gray-400 italic">Puedes editar antes de aprobar</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600 font-medium">
                          {ev.task_assignment?.teacher_response || <span className="text-gray-300 italic">Solo archivo adjunto</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {ev.verified == true ? (
                        <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          <CheckCircle size={12}/> Aprobado
                        </span>
                      ) : ev.verified == false && ev.verified != null ? (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          <XCircle size={12}/> Rechazado
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
                          <Clock size={12}/> Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {ev.verified == null ? (
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleVerify(ev.id, true)} title="Aprobar"
                            className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-lg transition shadow-sm">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => handleVerify(ev.id, false)} title="Rechazar"
                            className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition shadow-sm">
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Auditado</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

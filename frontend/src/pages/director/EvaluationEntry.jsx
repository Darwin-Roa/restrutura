import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Bot, ListFilter, PlusCircle, Search, Trash2, Edit3, UserCheck, AlertCircle, Upload, FileDown, CheckCircle2, XCircle, ListChecks } from 'lucide-react';

export const EvaluationEntry = () => {
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'manage' | 'mass'
  const [teachers, setTeachers] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [allEvaluations, setAllEvaluations] = useState([]);
  
  const [formData, setFormData] = useState({
    teacher_id: '',
    period_id: '',
    course_id: '',
    score_students: '',
    score_director: '',
    score_self: '',
    director_notes: '',
    student_rep_comments: '',
  });
  const [commentsText, setCommentsText] = useState('');
  const [repCommentsText, setRepCommentsText] = useState('');
  const [selfEvalCommentsText, setSelfEvalCommentsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [teacherCourses, setTeacherCourses] = useState([]);

  // Estados para Carga Masiva
  const [massFile, setMassFile] = useState(null);
  const [massResult, setMassResult] = useState(null);

  const fetchData = async () => {
    try {
      const [tp, pp, evs] = await Promise.all([
        api.get('/users?role=profesor'),
        api.get('/periods'),
        api.get('/history/global')
      ]);
      setTeachers((tp.data.users || []).filter(u => u.is_active));
      const activePeriods = pp.data.periods.filter(p => p.is_active);
      setPeriods(activePeriods);
      if (activePeriods.length > 0) {
        setFormData(prev => ({ ...prev, period_id: activePeriods[0].id }));
      }
      setAllEvaluations(evs.data.data.evaluations_timeline || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (formData.teacher_id && formData.period_id) {
      api.get(`/courses?teacher_id=${formData.teacher_id}&period_id=${formData.period_id}`)
        .then(res => setTeacherCourses(res.data.courses || []))
        .catch(err => console.error(err));
    } else {
      setTeacherCourses([]);
    }
  }, [formData.teacher_id, formData.period_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const student_comments = commentsText.split('\n').map(c => c.trim()).filter(c => c.length > 0);
    const rep_comments = repCommentsText.split('\n').map(c => c.trim()).filter(c => c.length > 0);
    const self_eval_comments = selfEvalCommentsText.split('\n').map(c => c.trim()).filter(c => c.length > 0);
    setLoading(true);
    try {
      const payload = { ...formData, student_comments, rep_comments, self_eval_comments };
      if (editingId) {
        await api.put(`/evaluations/${editingId}`, payload);
        alert('Evaluación actualizada correctamente.');
      } else {
        await api.post('/evaluations', payload);
        alert('Evaluación creada correctamente.');
      }
      resetForm();
      fetchData();
      setActiveTab('manage');
    } catch (e) {
      alert("Error: " + (e.response?.data?.message || e.message));
    } finally { setLoading(false); }
  };

  const handleMassUpload = async (e) => {
    e.preventDefault();
    if (!massFile) return;
    setLoading(true);
    setMassResult(null);
    try {
      const fd = new FormData();
      fd.append('file', massFile);
      const { data } = await api.post('/evaluations/mass-upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMassResult(data.summary);
      fetchData();
    } catch (err) {
      alert('Error en carga: ' + (err.response?.data?.error || err.message));
    } finally { setLoading(false); }
  };

  const downloadTemplate = () => {
    const headers = "Periodo,Email_Profesor,Nota_Estudiantes,Nota_Director,Auto_Nota,Notas_Director_Texto,Comentarios_Representantes,Comentarios_Estudiantes,Comentarios_Autoevaluacion\n";
    const example = "2026-1,profesor@ejemplo.com,4.5,4.2,4.0,Excelente desempeño,Rep1: Muy bueno|Rep2: Puntual,Est1: Gran dominio|Est2: Responsable,Auto1: Logré mis metas|Auto2: Buena clase";
    const blob = new Blob([headers + example], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "plantilla_evaluaciones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    const activePeriodId = periods.length > 0 ? periods[0].id : '';
    setFormData({ teacher_id: '', period_id: activePeriodId, course_id: '', score_students: '', score_director: '', score_self: '', director_notes: '', student_rep_comments: '' });
    setCommentsText('');
    setRepCommentsText('');
    setSelfEvalCommentsText('');
    setEditingId(null);
  };

  const handleEdit = async (ev) => {
    setEditingId(ev.id);
    setFormData({
      teacher_id: ev.teacher_id,
      period_id: ev.period_id,
      course_id: ev.course_id || '',
      score_students: ev.score_students,
      score_director: ev.score_director,
      score_self: ev.score_self,
      director_notes: ev.director_notes || '',
      student_rep_comments: ev.student_rep_comments || ''
    });
    try {
      const { data } = await api.get(`/evaluations/teacher/${ev.teacher_id}`);
      const thisEv = data.evaluations.find(e => e.id === ev.id);
      if (thisEv) {
        const cArray = thisEv.StudentComments || thisEv.student_comments || [];
        setCommentsText(cArray.filter(c => c.source === 'student').map(c => c.comment_text).join('\n'));
        setRepCommentsText(cArray.filter(c => c.source === 'representative').map(c => c.comment_text).join('\n'));
        setSelfEvalCommentsText(cArray.filter(c => c.source === 'self_evaluation').map(c => c.comment_text).join('\n'));
      }
    } catch (e) { console.error(e); }
    setActiveTab('new');
  };

  // Filtrar profesores que NO han sido evaluados en el periodo seleccionado
  const availableTeachers = teachers.filter(t => {
    if (editingId) return true; // Si estamos editando, permitimos ver al profesor actual
    if (!formData.period_id) return true;
    return !allEvaluations.some(ev => ev.teacher_id === t.id && String(ev.period_id) === String(formData.period_id));
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2.5 rounded-lg"><UserCheck className="text-blue-700" size={24} /></div>
          <div>
            <h1 className="text-xl font-bold text-[#0C447C]">Gestión de Evaluaciones</h1>
            <p className="text-sm text-gray-500">Cargue los resultados de desempeño para alimentar el Copilot de planes de mejora.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: 'new', label: editingId ? 'Editando Evaluación' : 'Nueva Evaluación', icon: PlusCircle },
          { id: 'mass', label: 'Carga Masiva (Excel)', icon: Upload },
          { id: 'manage', label: 'Historial de Cargas', icon: ListFilter }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition ${activeTab === tab.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>
            <tab.icon size={16}/> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'new' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
             <h3 className="font-bold text-[#0C447C] flex items-center gap-2">Formulario de Calificación</h3>
             {editingId && <button onClick={resetForm} className="text-xs text-red-600 font-bold hover:underline">Cancelar Edición</button>}
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Periodo Académico</label>
                  <div className="w-full border border-gray-300 bg-gray-50 rounded-lg p-3 text-sm font-bold text-gray-600 outline-none flex items-center h-[46px]">
                    {periods.find(p => String(p.id) === String(formData.period_id))?.name || 'Cargando...'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Profesor a Evaluar</label>
                  <select required value={formData.teacher_id} disabled={editingId} onChange={e => setFormData({...formData, teacher_id: e.target.value, course_id: ''})}
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50">
                    <option value="">Seleccione Profesor...</option>
                    {availableTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
             </div>

             <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Nota Estudiantes', key: 'score_students' },
                  { label: 'Nota Director (Jefe)', key: 'score_director' },
                  { label: 'Autoevaluación', key: 'score_self' }
                ].map(item => (
                  <div key={item.key} className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase">{item.label}</label>
                    <input type="number" step="0.1" min="0" max="5" required placeholder="0.0 - 5.0"
                      value={formData[item.key]} onChange={e => setFormData({...formData, [item.key]: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700"/>
                  </div>
                ))}
             </div>

             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Observaciones del Director (Resumen)</label>
                  <textarea rows="2" value={formData.director_notes} onChange={e => setFormData({...formData, director_notes: e.target.value})}
                    placeholder="Conclusiones generales de la evaluación..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"/>
                </div>

                <div className="grid grid-cols-3 gap-6">
                   <div className="space-y-2">
                     <label className="block text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <ListChecks className="text-orange-500" size={14}/> Feedback de Representantes (IA)
                     </label>
                     <textarea rows="6" value={repCommentsText} onChange={e => setRepCommentsText(e.target.value)}
                       placeholder="Pegue comentarios de los representantes (uno por línea)..."
                       className="w-full border border-orange-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none bg-orange-50/20"/>
                   </div>
                   <div className="space-y-2">
                     <label className="block text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <ListChecks className="text-blue-500" size={14}/> Feedback de Estudiantes (IA)
                     </label>
                     <textarea rows="6" value={commentsText} onChange={e => setCommentsText(e.target.value)}
                       placeholder="Pegue la lluvia de comentarios de alumnos (uno por línea)..."
                       className="w-full border border-blue-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-blue-50/20"/>
                   </div>
                   <div className="space-y-2">
                     <label className="block text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <ListChecks className="text-purple-500" size={14}/> Autoevaluación Docente
                     </label>
                     <textarea rows="6" value={selfEvalCommentsText} onChange={e => setSelfEvalCommentsText(e.target.value)}
                       placeholder="Comentarios del profesor (No leídos por IA)..."
                       className="w-full border border-purple-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-purple-50/20"/>
                   </div>
                </div>
             </div>

             <button type="submit" disabled={loading}
              className="w-full bg-[#0C447C] hover:bg-[#185FA5] text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50">
               {loading ? 'Procesando...' : <><Bot size={20}/> {editingId ? 'Actualizar Evaluación' : 'Guardar y Clasificar con IA'}</>}
             </button>
          </form>
        </div>
      )}

      {activeTab === 'mass' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center space-y-6">
           <div className="max-w-md mx-auto space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg flex items-start gap-3 text-left border border-orange-100 mb-6">
                <AlertCircle className="text-orange-600 shrink-0" size={20}/>
                <p className="text-xs text-orange-800 leading-relaxed">
                  <strong>Regla de Sobreescritura:</strong> Si sube un profesor que ya tiene evaluación en el mismo periodo, el sistema <b>actualizará</b> sus notas. Las notas deben estar entre 1.0 y 5.0.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 hover:border-blue-400 transition cursor-pointer bg-gray-50/50 group">
                 <input type="file" id="massFile" className="hidden" accept=".csv,.xlsx" onChange={e => setMassFile(e.target.files[0])}/>
                 <label htmlFor="massFile" className="cursor-pointer flex flex-col items-center gap-3">
                    <div className="bg-white p-4 rounded-full shadow-sm group-hover:scale-110 transition"><Upload className="text-blue-600" size={32}/></div>
                    <div className="text-sm font-bold text-gray-700">{massFile ? massFile.name : 'Seleccionar archivo Excel o CSV'}</div>
                    <p className="text-xs text-gray-400">Arraste aquí o haga clic para buscar</p>
                 </label>
              </div>

              <div className="flex gap-3">
                <button onClick={downloadTemplate} className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-600 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2">
                  <FileDown size={16}/> Bajar Plantilla
                </button>
                <button onClick={handleMassUpload} disabled={!massFile || loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? 'Subiendo...' : 'Procesar Archivo'}
                </button>
              </div>
           </div>

           {massResult && (
             <div className="max-w-2xl mx-auto bg-gray-50 rounded-xl p-6 border border-gray-200 text-left animate-in zoom-in-95">
                <h4 className="font-bold text-[#0C447C] mb-4 flex items-center gap-2"><CheckCircle2 className="text-green-600"/> Resultado del Procesamiento</h4>
                <div className="grid grid-cols-2 gap-4 mb-6">
                   <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                      <div className="text-2xl font-black text-green-600">{massResult.success}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Evaluaciones Exitosas</div>
                   </div>
                   <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                      <div className="text-2xl font-black text-red-600">{massResult.skipped}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Filas Omitidas</div>
                   </div>
                </div>
                {massResult.errors.length > 0 && (
                  <div className="space-y-1.5 overflow-y-auto max-h-40 pr-2">
                    {massResult.errors.map((err, i) => (
                      <div key={i} className="text-[11px] text-red-700 flex items-center gap-2 bg-red-50 p-2 rounded border border-red-100">
                        <XCircle size={12}/> {err}
                      </div>
                    ))}
                  </div>
                )}
             </div>
           )}
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Profesor</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Periodo</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Score Total</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.isArray(allEvaluations) && allEvaluations.filter(ev => String(ev.period_id) === String(formData.period_id)).map(ev => (
                <tr key={ev.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-gray-800">{ev?.teacher?.name || 'N/A'}</div>
                    <div className="text-[10px] text-gray-400">{ev?.teacher?.department}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-600">
                    {ev?.Period?.name || ev?.period?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold text-xs border border-blue-100">{ev?.score_total}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(ev)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit3 size={16}/></button>
                      <button onClick={async () => {
                         if(window.confirm('¿Eliminar esta evaluación y todos sus comentarios?')) {
                           await api.delete(`/evaluations/${ev.id}`); fetchData();
                         }
                      }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!allEvaluations || allEvaluations.filter(ev => String(ev.period_id) === String(formData.period_id)).length === 0) && (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm italic">No se han registrado evaluaciones en este periodo.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { 
  Leaf, TrendingUp, RotateCcw, PieChart, UserCheck, 
  AlertCircle, BarChart2, User, ArrowRight, GraduationCap, 
  CheckCircle, Clock, Circle, Hourglass, Layers, X
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

export const ExportarDirector = () => {
  const [datosDocentes, setDatosDocentes] = useState([]);
  const [areasList, setAreasList] = useState([]);
  const [periodo, setPeriodo] = useState('...');
  const [loading, setLoading] = useState(true);
  
  const [vista, setVista] = useState('heatmap'); // 'heatmap' o 'cards'
  const [docenteSeleccionado, setDocenteSeleccionado] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalInfo, setModalInfo] = useState(null); // { tipo: 'docente'|'area', docente, areaNombre? }

  useEffect(() => {
    fetchMatrixData();
  }, []);

  const fetchMatrixData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/export/global/matrix-json');
      if (res.data.success) {
        setDatosDocentes(res.data.docentes);
        setAreasList(res.data.areasList);
        setPeriodo(res.data.period);
      }
    } catch (e) {
      console.error("Error fetching matrix data", e);
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  let totalTareas = 0, totalCompletadas = 0, docentesAlDia = 0, criticasPend = 0;
  
  datosDocentes.forEach(doc => {
    let compDoc = 0, totalDoc = 0;
    doc.areas.forEach(area => {
      totalDoc += area.total;
      compDoc += area.completadas;
      
      // Tareas críticas (simulando las que el usuario marcó en su HTML original)
      // Ajustamos basado en si la tarea fue completada o no
      area.actividades.forEach(act => {
        if (!act.completado) {
          if (act.nombre.toLowerCase().includes('pacto') || 
              act.nombre.toLowerCase().includes('hmra') || 
              act.nombre.toLowerCase().includes('informe')) {
            criticasPend++;
          }
        }
      });
    });
    
    totalTareas += totalDoc;
    totalCompletadas += compDoc;
    if (compDoc === totalDoc && totalDoc > 0) docentesAlDia++;
  });

  const porcentajeGlobal = totalTareas ? Math.round((totalCompletadas / totalTareas) * 100) : 0;
  
  let avancesArea = areasList.map(areaObj => {
    let total = 0, comp = 0;
    datosDocentes.forEach(doc => {
      let a = doc.areas.find(aa => aa.nombreArea === areaObj.name);
      if (a) { total += a.total; comp += a.completadas; }
    });
    return { nombre: areaObj.name, pct: total ? (comp / total) * 100 : 0 };
  });
  
  avancesArea.sort((a, b) => a.pct - b.pct);
  const areaRezago = avancesArea[0]?.nombre || "—";

  // Chart Data
  const barChartData = {
    labels: areasList.map(a => a.name),
    datasets: [
      {
        label: 'Cumplimiento (%)',
        data: areasList.map(areaObj => {
          let total = 0, comp = 0;
          datosDocentes.forEach(d => {
            let a = d.areas.find(aa => aa.nombreArea === areaObj.name);
            if(a) { total += a.total; comp += a.completadas; }
          });
          return total ? (comp / total) * 100 : 0;
        }),
        backgroundColor: '#bbf7d0',
        borderRadius: 6,
        barPercentage: 0.65
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `${ctx.raw.toFixed(1)}%` } }
    },
    scales: {
      y: { max: 100, grid: { color: '#e9ecef' }, ticks: { callback: v => v + '%' } }
    }
  };

  const pieChartData = {
    labels: ['Completadas', 'Pendientes'],
    datasets: [
      {
        data: [totalCompletadas, totalTareas - totalCompletadas],
        backgroundColor: ['#2c6e2f', '#e2e8f0'],
        borderWidth: 0,
      }
    ]
  };

  const pieChartOptions = {
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10 } }
    },
    maintainAspectRatio: false
  };

  const handleDownloadExcel = async () => {
    try {
      const res = await api.get(`/export/global/excel-matriz`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/vnd.ms-excel' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Control_entregas_${periodo}.xls`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Error descargando el reporte global consolidado.");
    }
  };

  const abrirModalDocente = (docNombre) => {
    const doc = datosDocentes.find(d => d.nombre === docNombre);
    if(doc) {
      setModalInfo({ tipo: 'docente', docente: doc });
      setModalAbierto(true);
    }
  };

  const abrirModalArea = (docNombre, areaNombre) => {
    const doc = datosDocentes.find(d => d.nombre === docNombre);
    if(doc) {
      setModalInfo({ tipo: 'area', docente: doc, areaNombre });
      setModalAbierto(true);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-[#2c6e2f] font-bold">Cargando datos del periodo...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 bg-[#f8fafc] font-sans antialiased min-h-screen">
      
      {/* Encabezado elegante */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-8 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 text-gray-800">
            <Leaf size={28} color="#2c6e2f" />
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Cumplimiento Académico</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">Monitoreo de actividades docentes · Periodo {periodo} · Matriz Global</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchMatrixData} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200" style={{backgroundColor: '#2c6e2f', color: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'}}>
            <RotateCcw size={16} /> <span>Actualizar</span>
          </button>
          <button onClick={handleDownloadExcel} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2c6e2f] bg-white text-[#2c6e2f] hover:bg-[#2c6e2f] hover:text-white transition-all duration-200">
            <TrendingUp size={16} /> <span>Descargar CSV</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 border-l-4" style={{borderLeftColor: '#2c6e2f'}}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Cumplimiento global</p>
              <p className="text-3xl font-bold mt-1" style={{color: '#2c6e2f'}}>{porcentajeGlobal}%</p>
            </div>
            <PieChart size={24} className="text-gray-200" />
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
            <div className="h-1.5 rounded-full transition-all duration-500" style={{width: `${porcentajeGlobal}%`, backgroundColor: '#2c6e2f'}}></div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{totalCompletadas} / {totalTareas} tareas</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Docentes al día</p>
              <p className="text-3xl font-bold text-gray-700">{docentesAlDia}</p>
            </div>
            <UserCheck size={24} className="text-gray-200" />
          </div>
          <p className="text-xs text-gray-400 mt-3">de <span>{datosDocentes.length}</span> docentes · 100% cumplimiento</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Tareas críticas pend.</p>
              <p className="text-3xl font-bold text-amber-600">{criticasPend}</p>
            </div>
            <AlertCircle size={24} className="text-amber-100" />
          </div>
          <p className="text-xs text-gray-400 mt-3">Pacto, HMRA, Informes</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 font-medium">Área con menor avance</p>
              <p className="text-md font-semibold text-gray-600 truncate mt-1">{areaRezago}</p>
            </div>
            <TrendingUp size={24} className="text-gray-200" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5">
          <h2 className="font-medium text-gray-600 text-sm uppercase tracking-wide mb-4 flex items-center gap-1">
            <BarChart2 size={16} color="#2c6e2f" /> Avance por área (%)
          </h2>
          <div className="h-[220px]">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5">
          <h2 className="font-medium text-gray-600 text-sm uppercase tracking-wide mb-4 flex items-center gap-1">
            <PieChart size={16} color="#2c6e2f" /> Estado general de tareas
          </h2>
          <div className="h-[220px]">
            <Doughnut data={pieChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      {/* Barra de controles */}
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <User size={16} className="text-gray-400" />
          <span className="text-sm text-gray-500">Consultar docente:</span>
          <select 
            value={docenteSeleccionado}
            onChange={(e) => setDocenteSeleccionado(e.target.value)}
            className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 bg-gray-50 focus:ring-1 focus:ring-green-200 focus:border-green-300 outline-none"
          >
            <option value="">Seleccionar</option>
            {datosDocentes.map((d, i) => (
              <option key={i} value={d.nombre}>{d.nombre}</option>
            ))}
          </select>
          <button 
            onClick={() => { if(docenteSeleccionado) abrirModalDocente(docenteSeleccionado) }} 
            className="text-sm px-3 py-1.5 rounded-lg transition-all flex items-center gap-1" 
            style={{backgroundColor: '#f0fdf4', color: '#2c6e2f', border: '1px solid #dcfce7'}}
          >
            Ver actividades <ArrowRight size={14} />
          </button>
        </div>
        <div className="flex gap-5 border-b border-gray-100 pb-1">
          <button 
            onClick={() => setVista('heatmap')} 
            className={`text-sm font-medium transition-all pb-1 ${vista === 'heatmap' ? 'text-[#2c6e2f] border-b-2 border-[#2c6e2f]' : 'text-gray-400 hover:text-gray-500'}`}
          >
            Matriz de calor
          </button>
          <button 
            onClick={() => setVista('cards')} 
            className={`text-sm font-medium transition-all pb-1 ${vista === 'cards' ? 'text-[#2c6e2f] border-b-2 border-[#2c6e2f]' : 'text-gray-400 hover:text-gray-500'}`}
          >
            Vista por tarjetas
          </button>
        </div>
      </div>

      {/* Vistas */}
      {vista === 'heatmap' ? (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto relative">
          <table className="w-full text-sm border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="p-3 text-left font-medium text-gray-500 sticky left-0 bg-gray-50/80 backdrop-blur-sm z-20">Docente</th>
                {areasList.map((a, i) => (
                  <th key={i} className="p-3 text-center font-medium text-gray-500">{a.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {datosDocentes.map((doc, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/40 transition">
                  <td className="p-3 font-medium text-gray-700 sticky left-0 bg-white z-10 border-r border-gray-50">{doc.nombre}</td>
                  {areasList.map(areaObj => {
                    const areaData = doc.areas.find(a => a.nombreArea === areaObj.name);
                    if(!areaData || areaData.total === 0) {
                      return <td key={areaObj.name} className="p-2 text-center text-gray-300">-</td>;
                    }
                    const pct = (areaData.completadas / areaData.total) * 100;
                    let colorClass = '';
                    if (pct === 100) colorClass = 'bg-green-100 border border-green-200';
                    else if (pct >= 70) colorClass = 'bg-emerald-50 border border-emerald-100';
                    else if (pct >= 40) colorClass = 'bg-amber-50 border border-amber-100';
                    else colorClass = 'bg-red-50 border border-red-100';

                    return (
                      <td key={areaObj.name} className="p-2 text-center cursor-pointer group relative" onClick={() => abrirModalArea(doc.nombre, areaObj.name)}>
                        <div className={`w-9 h-9 rounded-md ${colorClass} mx-auto flex items-center justify-center text-xs font-medium text-gray-600 transition-all hover:ring-2 hover:ring-offset-1 hover:ring-[#2c6e2f]`}>
                          {Math.round(pct)}%
                        </div>
                        {/* Tooltip */}
                        <div className="absolute invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-gray-800 text-white text-xs rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap z-30 transition-all">
                          {areaData.completadas}/{areaData.total}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {datosDocentes.map((doc, i) => {
            let total = doc.areas.reduce((s, a) => s + a.total, 0);
            let comp = doc.areas.reduce((s, a) => s + a.completadas, 0);
            let pct = total ? Math.round((comp/total)*100) : 0;
            return (
              <div key={i} onClick={() => abrirModalDocente(doc.nombre)} className="bg-white rounded-xl shadow-sm hover:shadow-md p-5 border border-gray-100 transition-all cursor-pointer hover:-translate-y-1">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-800">{doc.nombre}</h3>
                    <GraduationCap size={16} className="text-gray-300" />
                </div>
                <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Progreso</span><span className="font-bold">{pct}%</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{width: `${pct}%`, backgroundColor: '#2c6e2f'}}></div>
                    </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-3">
                  <span className="flex items-center gap-1 font-medium"><CheckCircle size={12} color="#2c6e2f"/> {comp} hechas</span>
                  <span className="flex items-center gap-1 font-medium"><Clock size={12} className="text-amber-500"/> {total-comp} pend.</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalAbierto && modalInfo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                {modalInfo.tipo === 'docente' ? <User size={20} color="#2c6e2f"/> : <Layers size={20} color="#2c6e2f"/>}
                {modalInfo.docente.nombre} {modalInfo.tipo === 'area' ? `· ${modalInfo.areaNombre}` : '· Detalle general'}
              </h3>
              <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto" style={{maxHeight: 'calc(85vh - 70px)'}}>
              {modalInfo.tipo === 'docente' ? (
                // Mostrar todas las areas
                modalInfo.docente.areas.filter(a => a.total > 0).map((area, i) => (
                  <div key={i} className="mb-5 border-b border-gray-100 pb-4 last:border-0 last:mb-0 last:pb-0">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-700">{area.nombreArea}</h4>
                      <span className="text-xs bg-[#e8f5e9] text-[#2c6e2f] font-bold px-2 py-0.5 rounded-full border border-[#c8e6c9]">
                        {area.completadas}/{area.total}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {area.actividades.map((act, j) => (
                        <div key={j} className="flex items-start gap-2 py-1">
                          <div className="mt-0.5">
                            {act.completado ? 
                              <CheckCircle size={14} className="text-green-600" /> : 
                              <Circle size={14} className="text-gray-300" />
                            }
                          </div>
                          <span className={act.completado ? 'text-gray-500' : 'text-gray-800 font-medium'}>
                            {act.nombre}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Mostrar un area especifica
                <div className="space-y-3">
                  {modalInfo.docente.areas.find(a => a.nombreArea === modalInfo.areaNombre)?.actividades.map((act, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                      {act.completado ? 
                        <CheckCircle size={18} className="text-green-600" /> : 
                        <Hourglass size={18} className="text-amber-400" />
                      }
                      <span className="font-medium text-gray-700">{act.nombre}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

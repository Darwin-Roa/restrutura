import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/Login';

import { DirectorLayout } from './components/layout/DirectorLayout';
import { DirectorDashboard } from './pages/director/DirectorDashboard';
import { GeneratePlan } from './pages/director/GeneratePlan';
import { EvaluationEntry } from './pages/director/EvaluationEntry';
import { PlanTrabajo } from './pages/director/PlanTrabajo';
import { PlanesMejora } from './pages/director/PlanesMejora';
import { HistorialEvolucion } from './pages/director/HistorialEvolucion';
import { ExportarDirector } from './pages/director/ExportarDirector';
import { BandejaEvidencias } from './pages/director/BandejaEvidencias';
import { ProfesorDashboard } from './pages/profesor/ProfesorDashboard';

import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { RoleManagement } from './pages/admin/RoleManagement';
import { CourseManagement } from './pages/admin/CourseManagement';
import { PeriodManagement } from './pages/admin/PeriodManagement';
import { AreaManagement } from './pages/admin/AreaManagement';
import { DepartmentManagement } from './pages/admin/DepartmentManagement';
import { GestionCursos } from './pages/director/GestionCursos';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#f9fafb]">Cargando...</div>;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="usuarios" element={<UserManagement />} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="cursos" element={<CourseManagement />} />
          <Route path="periodos" element={<PeriodManagement />} />
          <Route path="areas" element={<AreaManagement />} />
          <Route path="departamentos" element={<DepartmentManagement />} />
        </Route>
      </Route>

      <Route path="/director" element={<ProtectedRoute allowedRoles={['MANAGEMENT']} />}>
        <Route element={<DirectorLayout />}>
          <Route index element={<DirectorDashboard />} />
          <Route path="evaluar" element={<EvaluationEntry />} />
          <Route path="generar" element={<GeneratePlan />} />
          <Route path="planes" element={<PlanesMejora />} />
          <Route path="historial" element={<HistorialEvolucion />} />
          <Route path="tareas" element={<PlanTrabajo />} />
          <Route path="cursos" element={<GestionCursos />} />
          <Route path="evidencias" element={<BandejaEvidencias />} />
          <Route path="exportar" element={<ExportarDirector />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['profesor']} />}>
        <Route path="/profesor" element={<ProfesorDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : user.role === 'profesor' ? '/profesor' : '/director') : '/login'} />} />
    </Routes>
  );
}

export default App;

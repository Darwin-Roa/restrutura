import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import { GraduationCap, LogIn, Eye, EyeOff, ShieldCheck, LayoutDashboard, Bot, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login, user }         = useAuth();
  const navigate                = useNavigate();
  const [error, setError]       = useState('');

  if (user) return <Navigate to={`/${user.role}`} />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const loggedUser = await login(email, password);
      navigate(`/${loggedUser.role}`);
    } catch {
      setError('Credenciales incorrectas. Verifique su email y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f7f3' }}>

      {/* Panel izquierdo */}
      <div
        className="hidden lg:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f2217 0%, #09843B 100%)' }}
      >
        {/* Patrón decorativo sutil */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 80%, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <GraduationCap size={22} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-[15px] leading-tight">Universidad Simón Bolívar</div>
              <div className="text-white/50 text-[11px] mt-0.5">Ingeniería de Sistemas · Cúcuta</div>
            </div>
          </div>

          <h1 className="text-[2.6rem] font-bold text-white leading-tight mb-4 tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Portal de<br />
            <span style={{ color: '#86efac' }}>Mejora Profesoral</span>
          </h1>
          <p className="text-white/55 text-sm leading-relaxed max-w-xs">
            Plataforma institucional para el seguimiento, evaluación y mejora continua del cuerpo docente.
          </p>
        </div>

        {/* Feature pills */}
        <div className="relative z-10 space-y-3">
          {[
            { icon: <LayoutDashboard size={16} className="text-white"/>, label: 'Seguimiento por periodo activo' },
            { icon: <Bot size={16} className="text-white"/>, label: 'Copilot IA para planes de mejora' },
            { icon: <CheckCircle2 size={16} className="text-white"/>, label: 'Auditoría de evidencias docentes' },
          ].map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10 backdrop-blur-sm"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10">
                {f.icon}
              </div>
              <span className="text-[12px] font-medium text-white">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[380px]">

          {/* Logo mobile */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#09843B' }}>
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-[#0f2217] text-sm">Universidad Simón Bolívar</div>
              <div className="text-gray-400 text-[11px]">Portal Docente</div>
            </div>
          </div>

          {/* Encabezado */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#e6f4ec' }}>
                <ShieldCheck size={14} style={{ color: '#09843B' }} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#09843B' }}>
                Acceso seguro
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Iniciar sesión
            </h2>
            <p className="text-sm text-gray-400 mt-1">Ingresa con tu correo institucional.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-red-600 p-3 rounded-xl mb-5 text-xs font-medium"
              style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <span className="mt-0.5 shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email institucional</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-sm px-4 py-3 rounded-xl outline-none transition-all"
                style={{
                  border: '1.5px solid #e5e7eb',
                  background: '#f9fafb',
                  color: '#1e2a20'
                }}
                onFocus={e => { e.target.style.borderColor = '#09843B'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(9,132,59,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; e.target.style.boxShadow = 'none'; }}
                placeholder="nombre@unisimon.edu.co"
                required
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full text-sm px-4 py-3 pr-10 rounded-xl outline-none transition-all"
                  style={{
                    border: '1.5px solid #e5e7eb',
                    background: '#f9fafb',
                    color: '#1e2a20'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#09843B'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(9,132,59,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; e.target.style.boxShadow = 'none'; }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all mt-2"
              style={{
                background: loading ? '#9ca3af' : '#09843B',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(9,132,59,0.28)',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#066b2f'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#09843B'; }}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verificando...</>
              ) : (
                <><LogIn size={16} /> Ingresar a la plataforma</>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-gray-300 mt-10">
            © 2026 Universidad Simón Bolívar<br />
            <span className="text-[10px]">Facultad de Ingeniería · Sede Cúcuta</span>
          </p>
        </div>
      </div>
    </div>
  );
};

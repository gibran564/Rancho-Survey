import { useState, useEffect } from 'react';
import Head from 'next/head';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend
} from 'recharts';

// ──────────────────────────────────────────────
// Password Gate
// ──────────────────────────────────────────────
const DASHBOARD_PASSWORD = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD || 'rancho2025';

function PasswordGate({ onUnlock }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState(false);

  const check = () => {
    if (pwd === DASHBOARD_PASSWORD) {
      onUnlock();
    } else {
      setErr(true);
      setTimeout(() => setErr(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="font-bebas text-5xl tracking-widest text-white mb-1">
            RANCH<span className="text-rancho-green">O</span>
          </div>
          <p className="text-rancho-green-light text-xs tracking-widest uppercase font-semibold">Sport Training</p>
          <p className="text-gray-400 text-sm mt-3">Panel de Resultados · Acceso restringido</p>
        </div>
        <div className="section-card">
          <p className="text-white font-semibold mb-4 text-center">🔐 Contraseña de acceso</p>
          <input
            type="password"
            className={`rancho-input mb-3 ${err ? 'border-red-500' : ''}`}
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && check()}
            placeholder="Contraseña..."
          />
          {err && <p className="text-red-400 text-xs mb-3 text-center">Contraseña incorrecta</p>}
          <button onClick={check} className="glow-btn w-full py-3 rounded-lg text-white font-bebas text-xl tracking-widest">
            INGRESAR
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Helpers / Analytics
// ──────────────────────────────────────────────

const avg = (arr) => arr.length === 0 ? 0 : (arr.reduce((a, b) => a + b, 0) / arr.length);

function computeAnalytics(responses) {
  if (!responses || responses.length === 0) return null;

  const n = responses.length;

  // Average scales
  const getAvg = (key) => {
    const vals = responses.map(r => r[key]).filter(v => v !== null && v !== undefined);
    return avg(vals);
  };

  // NPS
  const npsScores = responses.map(r => r.q5_1).filter(v => v !== null && v !== undefined);
  const promoters = npsScores.filter(v => v >= 9).length;
  const passives = npsScores.filter(v => v >= 7 && v <= 8).length;
  const detractors = npsScores.filter(v => v <= 6).length;
  const nps = npsScores.length > 0
    ? Math.round(((promoters - detractors) / npsScores.length) * 100)
    : 0;

  // Coach breakdown
  const coachMap = {};
  responses.forEach(r => {
    const c = (r.q2_1 || '').trim();
    if (!c) return;
    const cNorm = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
    if (!coachMap[cNorm]) coachMap[cNorm] = { name: cNorm, count: 0, scores: [] };
    coachMap[cNorm].count++;
    if (r.q2_2) coachMap[cNorm].scores.push(r.q2_2);
  });
  const coaches = Object.values(coachMap).map(c => ({
    ...c,
    avgScore: avg(c.scores),
  })).sort((a, b) => b.count - a.count);

  // Option distributions
  const dist = (key, options) => {
    const result = {};
    options.forEach(o => { result[o] = 0; });
    responses.forEach(r => { if (r[key]) result[r[key]] = (result[r[key]] || 0) + 1; });
    return Object.entries(result).map(([name, value]) => ({ name, value }));
  };

  // Open responses
  const openResponses = responses.map((r, i) => ({
    id: i,
    q1_2: r.q1_2 || '',
    q1_3: r.q1_3 || '',
    q3_3: r.q3_3 || '',
    coach: r.q2_1 || '',
    date: r.createdAt?.toDate?.()?.toLocaleDateString('es-MX') || 'N/A',
  })).filter(r => r.q1_2 || r.q1_3 || r.q3_3);

  // Radar data for general overview
  const radarData = [
    { subject: 'Satisfacción\nGeneral', value: getAvg('q1_1'), fullMark: 5 },
    { subject: 'Profesionalismo\nCoach', value: getAvg('q2_2'), fullMark: 5 },
    { subject: 'Adaptación\nEntrenamiento', value: getAvg('q2_4'), fullMark: 5 },
    { subject: 'Motivación\nCoach', value: getAvg('q2_5'), fullMark: 5 },
    { subject: 'Limpieza', value: getAvg('q3_1'), fullMark: 5 },
    { subject: 'Equipo', value: getAvg('q3_2'), fullMark: 5 },
    { subject: 'Comunicación', value: getAvg('q4_2'), fullMark: 5 },
  ];

  // Monthly trend (last 6 months)
  const monthMap = {};
  responses.forEach(r => {
    if (!r.createdAt?.toDate) return;
    const d = r.createdAt.toDate();
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    if (!monthMap[key]) monthMap[key] = { month: key, count: 0, scores: [] };
    monthMap[key].count++;
    if (r.q1_1) monthMap[key].scores.push(r.q1_1);
  });
  const trendData = Object.values(monthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6)
    .map(m => ({ month: m.month.slice(5), count: m.count, avg: parseFloat(avg(m.scores).toFixed(2)) }));

  return {
    n,
    avgs: {
      q1_1: getAvg('q1_1'),
      q2_2: getAvg('q2_2'),
      q2_4: getAvg('q2_4'),
      q2_5: getAvg('q2_5'),
      q3_1: getAvg('q3_1'),
      q3_2: getAvg('q3_2'),
      q4_2: getAvg('q4_2'),
    },
    nps, promoters, passives, detractors, npsScores,
    coaches,
    openResponses,
    radarData,
    trendData,
    dists: {
      q2_3: dist('q2_3', ['Si', 'A veces', 'No']),
      q4_1: dist('q4_1', ['Si', 'Parcialmente', 'No']),
      q4_3: dist('q4_3', ['Si', 'No']),
    }
  };
}

// ──────────────────────────────────────────────
// Export to Excel (XLSX)
// ──────────────────────────────────────────────
async function exportToExcel(responses, analytics) {
  const XLSX = (await import('xlsx')).default;

  const wb = XLSX.utils.book_new();

  // Sheet 1: Respuestas individuales
  const rows = responses.map((r, i) => ({
    '#': i + 1,
    'Fecha': r.createdAt?.toDate?.()?.toLocaleDateString('es-MX') || 'N/A',
    'Satisfacción General (1-5)': r.q1_1 || '',
    'Lo que más valoran': r.q1_2 || '',
    'Qué mejoraría': r.q1_3 || '',
    'Coach': r.q2_1 || '',
    'Profesionalismo Coach (1-5)': r.q2_2 || '',
    'Explicación de movimientos': r.q2_3 || '',
    'Adaptación entrenamiento (1-5)': r.q2_4 || '',
    'Motivación coach (1-5)': r.q2_5 || '',
    'Limpieza gimnasio (1-5)': r.q3_1 || '',
    'Estado equipo (1-5)': r.q3_2 || '',
    'Mejoras instalaciones': r.q3_3 || '',
    'Horarios adecuados': r.q4_1 || '',
    'Comunicación (1-5)': r.q4_2 || '',
    'Más información': r.q4_3 || '',
    'NPS Recomendación (1-10)': r.q5_1 || '',
    'Categoría NPS': r.q5_1 >= 9 ? 'Promotor' : r.q5_1 >= 7 ? 'Pasivo' : 'Detractor',
  }));
  const ws1 = XLSX.utils.json_to_sheet(rows);
  // Column widths
  ws1['!cols'] = [
    {wch:4},{wch:12},{wch:24},{wch:40},{wch:40},{wch:16},{wch:24},{wch:24},
    {wch:24},{wch:24},{wch:24},{wch:24},{wch:40},{wch:20},{wch:22},{wch:18},{wch:24},{wch:14}
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Respuestas');

  // Sheet 2: Resumen ejecutivo
  const summary = [
    ['RESUMEN EJECUTIVO — RANCHO SPORT TRAINING', '', ''],
    ['', '', ''],
    ['Total de respuestas', analytics.n, ''],
    ['', '', ''],
    ['INDICADORES CLAVE', 'Promedio', 'Interpretación'],
    ['Satisfacción General', analytics.avgs.q1_1.toFixed(2) + ' / 5', ratingLabel(analytics.avgs.q1_1)],
    ['Profesionalismo Coach', analytics.avgs.q2_2.toFixed(2) + ' / 5', ratingLabel(analytics.avgs.q2_2)],
    ['Adaptación Entrenamiento', analytics.avgs.q2_4.toFixed(2) + ' / 5', ratingLabel(analytics.avgs.q2_4)],
    ['Motivación Coach', analytics.avgs.q2_5.toFixed(2) + ' / 5', ratingLabel(analytics.avgs.q2_5)],
    ['Limpieza Gimnasio', analytics.avgs.q3_1.toFixed(2) + ' / 5', ratingLabel(analytics.avgs.q3_1)],
    ['Estado Equipo', analytics.avgs.q3_2.toFixed(2) + ' / 5', ratingLabel(analytics.avgs.q3_2)],
    ['Comunicación', analytics.avgs.q4_2.toFixed(2) + ' / 5', ratingLabel(analytics.avgs.q4_2)],
    ['', '', ''],
    ['NPS (Net Promoter Score)', analytics.nps, npsLabel(analytics.nps)],
    ['Promotores (9-10)', analytics.promoters, `${Math.round((analytics.promoters/analytics.n)*100)}%`],
    ['Pasivos (7-8)', analytics.passives, `${Math.round((analytics.passives/analytics.n)*100)}%`],
    ['Detractores (1-6)', analytics.detractors, `${Math.round((analytics.detractors/analytics.n)*100)}%`],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(summary);
  ws2['!cols'] = [{wch:30},{wch:20},{wch:25}];
  XLSX.utils.book_append_sheet(wb, ws2, 'Resumen Ejecutivo');

  // Sheet 3: Por coach
  const coachRows = [
    ['ANÁLISIS POR COACH', '', '', ''],
    ['Coach', 'Alumnos', 'Promedio Calificación', 'Nivel'],
    ...analytics.coaches.map(c => [c.name, c.count, c.avgScore.toFixed(2), ratingLabel(c.avgScore)]),
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(coachRows);
  ws3['!cols'] = [{wch:20},{wch:12},{wch:24},{wch:20}];
  XLSX.utils.book_append_sheet(wb, ws3, 'Por Coach');

  // Sheet 4: Comentarios abiertos
  const comments = [
    ['COMENTARIOS Y SUGERENCIAS', '', '', ''],
    ['Fecha', 'Coach', 'Lo que más valora', 'Qué mejoraría', 'Mejoras instalaciones'],
    ...analytics.openResponses.map(r => [r.date, r.coach, r.q1_2, r.q1_3, r.q3_3]),
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(comments);
  ws4['!cols'] = [{wch:14},{wch:14},{wch:50},{wch:50},{wch:50}];
  XLSX.utils.book_append_sheet(wb, ws4, 'Comentarios');

  XLSX.writeFile(wb, `Encuesta_Rancho_${new Date().toISOString().slice(0,10)}.xlsx`);
}

function ratingLabel(v) {
  if (v >= 4.5) return '⭐ Excelente';
  if (v >= 3.5) return '👍 Bueno';
  if (v >= 2.5) return '⚠️ Regular';
  return '❌ Necesita mejora';
}
function npsLabel(v) {
  if (v >= 70) return '🏆 Excelente (World Class)';
  if (v >= 50) return '✅ Muy bueno';
  if (v >= 30) return '👍 Bueno';
  if (v >= 0) return '⚠️ Necesita mejora';
  return '❌ Crítico';
}

// ──────────────────────────────────────────────
// UI Components for Dashboard
// ──────────────────────────────────────────────

function StatCard({ label, value, sub, color = 'green', icon }) {
  const colorMap = {
    green: 'border-rancho-green text-rancho-green-light',
    yellow: 'border-yellow-500 text-yellow-400',
    red: 'border-red-500 text-red-400',
    blue: 'border-blue-500 text-blue-400',
  };
  return (
    <div className={`stat-card border-l-4 ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">{label}</p>
          <p className={`text-3xl font-bold font-bebas tracking-wide ${colorMap[color].split(' ')[1]}`}>{value}</p>
          {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
        </div>
        {icon && <span className="text-2xl opacity-60">{icon}</span>}
      </div>
    </div>
  );
}

function ScoreBar({ label, value, max = 5 }) {
  const pct = (value / max) * 100;
  const color = value >= 4 ? '#3da03d' : value >= 3 ? '#eab308' : '#ef4444';
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-300 text-sm">{label}</span>
        <span className="text-white font-bold text-sm">{value.toFixed(1)} <span className="text-gray-500">/ {max}</span></span>
      </div>
      <div className="h-2 bg-rancho-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

const CHART_COLORS = ['#3da03d', '#eab308', '#ef4444', '#3b82f6', '#a855f7'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-rancho-card2 border border-rancho-border rounded-lg p-3 text-sm shadow-xl">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ──────────────────────────────────────────────
// Main Dashboard
// ──────────────────────────────────────────────

function DashboardContent({ responses }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [exporting, setExporting] = useState(false);
  const analytics = computeAnalytics(responses);

  if (!analytics) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-xl">No hay respuestas aún 📭</p>
        <p className="text-gray-600 text-sm mt-2">Comparte la encuesta con tus miembros para ver los resultados aquí.</p>
      </div>
    );
  }

  const handleExport = async () => {
    setExporting(true);
    await exportToExcel(responses, analytics);
    setExporting(false);
  };

  const tabs = [
    { id: 'overview', label: '📊 Resumen' },
    { id: 'coaches', label: '🏋️ Coaches' },
    { id: 'nps', label: '🏆 NPS' },
    { id: 'comments', label: '💬 Comentarios' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-bebas text-4xl tracking-widest text-white">
            PANEL DE <span className="text-rancho-green">RESULTADOS</span>
          </h1>
          <p className="text-gray-400 text-sm">Rancho Sport Training · {analytics.n} respuestas totales</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="glow-btn px-6 py-3 rounded-xl text-white font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <span>{exporting ? '⏳' : '📥'}</span>
          {exporting ? 'Exportando...' : 'Exportar a Excel'}
        </button>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total respuestas" value={analytics.n} icon="👥" color="green" />
        <StatCard
          label="Satisfacción General"
          value={`${analytics.avgs.q1_1.toFixed(1)}/5`}
          sub={ratingLabel(analytics.avgs.q1_1)}
          icon="⭐"
          color={analytics.avgs.q1_1 >= 4 ? 'green' : analytics.avgs.q1_1 >= 3 ? 'yellow' : 'red'}
        />
        <StatCard
          label="NPS Score"
          value={analytics.nps}
          sub={npsLabel(analytics.nps)}
          icon="🏆"
          color={analytics.nps >= 50 ? 'green' : analytics.nps >= 0 ? 'yellow' : 'red'}
        />
        <StatCard
          label="Promotores"
          value={`${Math.round((analytics.promoters / analytics.n) * 100)}%`}
          sub={`${analytics.promoters} de ${analytics.n}`}
          icon="💪"
          color="green"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === t.id
                ? 'bg-rancho-green text-white shadow-lg'
                : 'bg-rancho-card border border-rancho-border text-gray-400 hover:border-rancho-green hover:text-green-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Score bars */}
            <div className="section-card">
              <h3 className="font-bebas text-xl text-white tracking-wide mb-5">Calificaciones Promedio</h3>
              <ScoreBar label="Satisfacción General" value={analytics.avgs.q1_1} />
              <ScoreBar label="Profesionalismo del Coach" value={analytics.avgs.q2_2} />
              <ScoreBar label="Adaptación del Entrenamiento" value={analytics.avgs.q2_4} />
              <ScoreBar label="Motivación del Coach" value={analytics.avgs.q2_5} />
              <ScoreBar label="Limpieza del Gimnasio" value={analytics.avgs.q3_1} />
              <ScoreBar label="Estado del Equipo" value={analytics.avgs.q3_2} />
              <ScoreBar label="Comunicación" value={analytics.avgs.q4_2} />
            </div>

            {/* Radar */}
            <div className="section-card">
              <h3 className="font-bebas text-xl text-white tracking-wide mb-3">Vista General (Radar)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={analytics.radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#666', fontSize: 9 }} />
                  <Radar
                    name="Promedio"
                    dataKey="value"
                    stroke="#3da03d"
                    fill="#2d7a2d"
                    fillOpacity={0.5}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distributions */}
          <div className="grid lg:grid-cols-3 gap-4">
            <DistCard
              title="Explicación de Movimientos"
              data={analytics.dists.q2_3}
              total={analytics.n}
            />
            <DistCard
              title="Horarios adecuados"
              data={analytics.dists.q4_1}
              total={analytics.n}
            />
            <DistCard
              title="¿Quieren más información?"
              data={analytics.dists.q4_3}
              total={analytics.n}
            />
          </div>

          {/* Trend */}
          {analytics.trendData.length > 1 && (
            <div className="section-card">
              <h3 className="font-bebas text-xl text-white tracking-wide mb-3">Tendencia Mensual — Respuestas</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={analytics.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Respuestas" fill="#2d7a2d" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: COACHES ── */}
      {activeTab === 'coaches' && (
        <div className="space-y-4">
          <div className="section-card">
            <h3 className="font-bebas text-xl text-white tracking-wide mb-5">Comparativa de Coaches</h3>
            {analytics.coaches.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay datos de coaches aún.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-rancho-border">
                        <th className="text-left text-gray-400 font-semibold py-2 pr-4 uppercase tracking-wider text-xs">Coach</th>
                        <th className="text-center text-gray-400 font-semibold py-2 px-4 uppercase tracking-wider text-xs">Alumnos</th>
                        <th className="text-center text-gray-400 font-semibold py-2 px-4 uppercase tracking-wider text-xs">Calificación</th>
                        <th className="text-left text-gray-400 font-semibold py-2 pl-4 uppercase tracking-wider text-xs">Nivel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.coaches.map(c => (
                        <tr key={c.name} className="border-b border-rancho-border/50 hover:bg-rancho-card2 transition-colors">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-rancho-green flex items-center justify-center text-white text-xs font-bold">
                                {c.name.charAt(0)}
                              </div>
                              <span className="text-white font-semibold">{c.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-gray-300">{c.count}</span>
                            <span className="text-gray-600 text-xs ml-1">({Math.round((c.count/analytics.n)*100)}%)</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-bold text-lg ${c.avgScore >= 4 ? 'text-green-400' : c.avgScore >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {c.avgScore.toFixed(1)}
                            </span>
                            <span className="text-gray-500 text-xs">/5</span>
                          </td>
                          <td className="py-3 pl-4 text-sm text-gray-300">{ratingLabel(c.avgScore)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {analytics.coaches.length > 1 && (
                  <div className="mt-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.coaches.map(c => ({ name: c.name, score: parseFloat(c.avgScore.toFixed(2)), alumnos: c.count }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <YAxis domain={[0, 5]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="score" name="Calificación promedio" fill="#3da03d" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: NPS ── */}
      {activeTab === 'nps' && (
        <div className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="section-card">
              <h3 className="font-bebas text-xl text-white tracking-wide mb-5">Net Promoter Score (NPS)</h3>
              <div className="text-center mb-6">
                <div
                  className={`text-7xl font-bebas tracking-wider mb-2 ${
                    analytics.nps >= 50 ? 'text-green-400' : analytics.nps >= 0 ? 'text-yellow-400' : 'text-red-400'
                  }`}
                >
                  {analytics.nps > 0 ? '+' : ''}{analytics.nps}
                </div>
                <p className="text-gray-300 font-semibold">{npsLabel(analytics.nps)}</p>
                <p className="text-gray-500 text-xs mt-1">NPS = % Promotores − % Detractores</p>
              </div>

              {/* NPS gauge breakdown */}
              <div className="space-y-3">
                <NPSGroup
                  label="Promotores (9–10)"
                  count={analytics.promoters}
                  total={analytics.n}
                  color="#3da03d"
                  desc="Muy satisfechos, recomiendan el gym"
                />
                <NPSGroup
                  label="Pasivos (7–8)"
                  count={analytics.passives}
                  total={analytics.n}
                  color="#eab308"
                  desc="Satisfechos pero no activamente promotores"
                />
                <NPSGroup
                  label="Detractores (1–6)"
                  count={analytics.detractors}
                  total={analytics.n}
                  color="#ef4444"
                  desc="Insatisfechos, podrían hablar mal del gym"
                />
              </div>
            </div>

            <div className="section-card">
              <h3 className="font-bebas text-xl text-white tracking-wide mb-4">Distribución de Puntuaciones</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Promotores', value: analytics.promoters },
                      { name: 'Pasivos', value: analytics.passives },
                      { name: 'Detractores', value: analytics.detractors },
                    ].filter(d => d.value > 0)}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {['#3da03d', '#eab308', '#ef4444'].map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>

              {/* NPS interpretation guide */}
              <div className="mt-4 bg-rancho-card2 rounded-lg p-4 text-xs text-gray-400 space-y-1">
                <p className="font-semibold text-gray-300 mb-2">📖 ¿Cómo interpretar el NPS?</p>
                <p>🔴 <strong>Negativo:</strong> Situación crítica, muchos detractores</p>
                <p>🟡 <strong>0–30:</strong> Aceptable, hay áreas de mejora</p>
                <p>🟢 <strong>30–50:</strong> Bueno, clientes relativamente leales</p>
                <p>⭐ <strong>50–70:</strong> Excelente, base de fans sólida</p>
                <p>🏆 <strong>70+:</strong> World Class, crecimiento orgánico garantizado</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: COMMENTS ── */}
      {activeTab === 'comments' && (
        <div className="space-y-3">
          <div className="section-card mb-2">
            <p className="text-gray-400 text-sm">
              💬 {analytics.openResponses.length} respuesta{analytics.openResponses.length !== 1 ? 's' : ''} con comentarios
              de {analytics.n} totales.
            </p>
          </div>
          {analytics.openResponses.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No hay comentarios abiertos aún.</div>
          ) : (
            analytics.openResponses.map((r, i) => (
              <div key={i} className="section-card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500 bg-rancho-card2 px-2 py-1 rounded">{r.date}</span>
                  {r.coach && (
                    <span className="text-xs text-rancho-green bg-rancho-green/10 px-2 py-1 rounded border border-rancho-green/30">
                      Coach: {r.coach}
                    </span>
                  )}
                </div>
                {r.q1_2 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">✅ Lo que más valora</p>
                    <p className="text-gray-200 text-sm bg-rancho-card2 rounded-lg px-4 py-3 border-l-2 border-green-600">
                      {r.q1_2}
                    </p>
                  </div>
                )}
                {r.q1_3 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">🔧 Qué mejoraría</p>
                    <p className="text-gray-200 text-sm bg-rancho-card2 rounded-lg px-4 py-3 border-l-2 border-yellow-600">
                      {r.q1_3}
                    </p>
                  </div>
                )}
                {r.q3_3 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">🏟️ Mejoras instalaciones</p>
                    <p className="text-gray-200 text-sm bg-rancho-card2 rounded-lg px-4 py-3 border-l-2 border-blue-600">
                      {r.q3_3}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function DistCard({ title, data, total }) {
  return (
    <div className="section-card">
      <h4 className="text-white font-semibold text-sm mb-4">{title}</h4>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={d.name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300">{d.name}</span>
              <span className="text-white font-bold">{d.value} <span className="text-gray-500">({total > 0 ? Math.round((d.value/total)*100) : 0}%)</span></span>
            </div>
            <div className="h-1.5 bg-rancho-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${total > 0 ? (d.value/total)*100 : 0}%`,
                  background: CHART_COLORS[i] || '#3da03d'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NPSGroup({ label, count, total, color, desc }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: color }} />
      <div className="flex-1">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-sm font-semibold text-white">{label}</span>
          <span className="font-bold" style={{ color }}>{pct}% <span className="text-gray-500 font-normal text-xs">({count})</span></span>
        </div>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Page Export
// ──────────────────────────────────────────────
export default function DashboardPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setLoadErr(false);
    try {
      const q = query(collection(db, 'encuestas'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setResponses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
      setLoadErr(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    setUnlocked(true);
    await loadData();
  };

  return (
    <>
      <Head>
        <title>Dashboard — Rancho Sport Training</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {!unlocked ? (
        <PasswordGate onUnlock={handleUnlock} />
      ) : (
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block w-10 h-10 border-4 border-rancho-green border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-400">Cargando respuestas...</p>
              </div>
            ) : loadErr ? (
              <div className="text-center py-20">
                <p className="text-red-400 mb-4">⚠️ Error al cargar datos. Verifica tu configuración de Firebase.</p>
                <button onClick={loadData} className="glow-btn px-6 py-2 rounded-lg text-white text-sm font-semibold">
                  Reintentar
                </button>
              </div>
            ) : (
              <DashboardContent responses={responses} />
            )}

            {/* Refresh button */}
            {unlocked && !loading && (
              <div className="text-center mt-8">
                <button
                  onClick={loadData}
                  className="text-gray-500 hover:text-rancho-green-light text-sm transition-colors"
                >
                  🔄 Actualizar datos
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

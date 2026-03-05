import Head from 'next/head';

// ──────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────

const FODA_DATA = {
  fortalezas: {
    label: 'Fortalezas',
    tag: 'Interno · Positivo',
    color: 'rancho-green',
    accent: '#3da03d',
    icon: '💪',
    items: [
      {
        title: 'NPS excepcional',
        body: 'Media de 9.7/10 y 95% de promotores. Solo 1 detractor en 57 respuestas — lealtad raramente vista en gimnasios.',
        stat: '9.7 / 10 promedio NPS',
      },
      {
        title: 'Calidad de coaches',
        body: 'Motivación 4.7/5 y Profesionalismo 4.7/5 con correlación r=0.94. El coach es percibido como una unidad coherente.',
        stat: 'r = 0.94 correlación motivación-profesionalismo',
      },
      {
        title: 'Adaptación del entrenamiento',
        body: '4.8/5 — los miembros sienten que el plan está personalizado para su nivel y objetivos.',
        stat: '4.8 / 5 promedio adaptación',
      },
      {
        title: 'Horarios convenientes',
        body: 'El 95% considera que los horarios se ajustan a sus necesidades. Cero fricción operativa en este aspecto.',
        stat: '95% responde "Sí"',
      },
      {
        title: 'Comunidad y atención personalizada',
        body: 'Los miembros mencionan espontáneamente "la comunidad" y "la atención" como lo más valorado del gym.',
        stat: 'Top 2 respuestas en pregunta abierta',
      },
    ],
  },
  oportunidades: {
    label: 'Oportunidades',
    tag: 'Externo · Positivo',
    color: 'yellow-500',
    accent: '#eab308',
    icon: '🚀',
    items: [
      {
        title: 'Alta demanda de información',
        body: 'El 88% quiere recibir más contenido del gym. Un canal de WhatsApp activo puede capitalizar esto de inmediato.',
        stat: '88% responde "Sí" a más información',
      },
      {
        title: 'Promotores listos para referir',
        body: '54 de 57 miembros son promotores activos. Un programa de referidos con incentivo mínimo puede acelerar el crecimiento.',
        stat: '54 de 57 son promotores',
      },
      {
        title: 'Deseo de competencias',
        body: 'Los miembros piden más competencias internas y externas — esto aumenta retención y sentido de comunidad.',
        stat: 'Mención espontánea en respuestas abiertas',
      },
      {
        title: '80 miembros sin encuestar',
        body: 'El 58% restante no ha respondido. Completar la muestra puede revelar áreas de mejora no detectadas aún.',
        stat: '80 pendientes de 137 totales',
      },
      {
        title: 'Comunicación como palanca de NPS',
        body: 'La comunicación tiene correlación directa con el NPS (r=0.37). Mejorarla eleva la probabilidad de recomendación.',
        stat: 'r = 0.37 comunicación ↔ NPS',
      },
    ],
  },
  debilidades: {
    label: 'Debilidades',
    tag: 'Interno · Negativo',
    color: 'red-500',
    accent: '#ef4444',
    icon: '⚠️',
    items: [
      {
        title: 'Limpieza — el punto más débil',
        body: '4.3/5 es la calificación más baja de todas las métricas. Los baños y limpieza general aparecen de forma espontánea en múltiples respuestas abiertas.',
        stat: '4.3 / 5 · calificación más baja del gym',
      },
      {
        title: 'Comunicación interna mejorable',
        body: '4.5/5 — por debajo del resto de métricas de servicio. Los miembros sienten que falta información y seguimiento.',
        stat: '4.5 / 5 promedio comunicación',
      },
      {
        title: 'Explicación de movimientos inconsistente',
        body: 'El 14% dice que solo "a veces" recibe explicación correcta en los ejercicios, lo que representa riesgo de lesión y menor percepción de valor.',
        stat: '14% responde "A veces"',
      },
      {
        title: 'Equipo e instalaciones con áreas de mejora',
        body: 'Se mencionan cajones, cuerdas, caminadoras curvas y equipo que necesita restauración como mejoras deseadas.',
        stat: 'Múltiples menciones en preguntas abiertas',
      },
    ],
  },
  amenazas: {
    label: 'Amenazas',
    tag: 'Externo · Negativo',
    color: 'blue-400',
    accent: '#60a5fa',
    icon: '🎯',
    items: [
      {
        title: 'Sensibilidad al precio',
        body: '"Que baje la mensualidad" es una de las primeras sugerencias de mejora. Competidores con precios menores pueden atraer miembros sensibles al costo.',
        stat: 'Mención directa en respuestas abiertas',
      },
      {
        title: 'Dependencia del coach estrella',
        body: 'Joel Cuevas concentra el 53% de los alumnos. Una salida o bajo rendimiento tendría un impacto significativo en la retención.',
        stat: '30 de 57 alumnos con Joel (53%)',
      },
      {
        title: 'Competencia con mejor infraestructura',
        body: 'Los miembros valoran el espacio pero señalan instalaciones como área de mejora. Gyms con mayor inversión en equipo pueden seducir a estos perfiles.',
        stat: 'Estado equipo 4.5 / 5',
      },
      {
        title: 'Conflicto de equipo en horas pico',
        body: 'Un miembro señala la disponibilidad de equipo cuando hay programación simultánea — puede afectar la experiencia en clases concurrentes.',
        stat: 'Mención en respuesta abierta',
      },
    ],
  },
};

// ──────────────────────────────────────────────
// Components
// ──────────────────────────────────────────────

function RanchoLogo() {
  return (
    <div className="text-center mb-8">
      <div className="relative inline-block">
        <div className="border-2 border-rancho-green px-6 py-2 relative">
          <span className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-rancho-green-light"></span>
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-rancho-green-light"></span>
          <h1 className="font-bebas text-5xl tracking-widest text-white leading-none">
            RANCH<span className="text-rancho-green">O</span>
          </h1>
          <p className="text-xs text-gray-300 font-semibold tracking-[0.3em] uppercase text-center">
            Sport Training
          </p>
        </div>
      </div>
    </div>
  );
}

function KPIStrip() {
  const kpis = [
    { val: '9.7/10', lbl: 'NPS Promedio' },
    { val: '95%',   lbl: 'Promotores' },
    { val: '4.8/5', lbl: 'Satisfacción Gral.' },
    { val: '4.7/5', lbl: 'Coach / Profesional.' },
    { val: '88%',   lbl: 'Quieren más info' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
      {kpis.map(k => (
        <div key={k.lbl} className="section-card text-center py-3 px-2">
          <p className="font-bebas text-2xl text-rancho-green-light tracking-wide leading-none">{k.val}</p>
          <p className="text-gray-500 text-xs mt-1 uppercase tracking-wider font-semibold leading-tight">{k.lbl}</p>
        </div>
      ))}
    </div>
  );
}

function QuadrantCard({ data }) {
  const borderMap = {
    'rancho-green': 'border-rancho-green',
    'yellow-500':   'border-yellow-500',
    'red-500':      'border-red-500',
    'blue-400':     'border-blue-400',
  };
  const tagMap = {
    'rancho-green': 'text-rancho-green-light bg-rancho-green/10 border border-rancho-green/30',
    'yellow-500':   'text-yellow-400 bg-yellow-500/10 border border-yellow-500/30',
    'red-500':      'text-red-400 bg-red-500/10 border border-red-500/30',
    'blue-400':     'text-blue-300 bg-blue-400/10 border border-blue-400/30',
  };
  const dotMap = {
    'rancho-green': 'bg-rancho-green',
    'yellow-500':   'bg-yellow-500',
    'red-500':      'bg-red-500',
    'blue-400':     'bg-blue-400',
  };
  const statMap = {
    'rancho-green': 'text-rancho-green-light',
    'yellow-500':   'text-yellow-400',
    'red-500':      'text-red-400',
    'blue-400':     'text-blue-300',
  };

  return (
    <div className={`section-card border-t-4 ${borderMap[data.color]}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{data.icon}</span>
          <div>
            <h2 className="font-bebas text-2xl text-white tracking-wide leading-none">{data.label}</h2>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tagMap[data.color]}`}>
              {data.tag}
            </span>
          </div>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${dotMap[data.color]}`} />
      </div>

      {/* Items */}
      <div className="space-y-4">
        {data.items.map((item, i) => (
          <div key={i} className="flex gap-3">
            {/* Number */}
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
              style={{ background: `${data.accent}22`, color: data.accent }}
            >
              {i + 1}
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-snug">{item.title}</p>
              <p className="text-gray-400 text-xs leading-relaxed mt-0.5">{item.body}</p>
              <p className={`text-xs font-semibold mt-1 ${statMap[data.color]}`}>→ {item.stat}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AxisLabel({ children, vertical }) {
  if (vertical) {
    return (
      <div className="hidden lg:flex items-center justify-center">
        <p
          className="text-gray-600 text-xs font-bold uppercase tracking-widest"
          style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
        >
          {children}
        </p>
      </div>
    );
  }
  return (
    <p className="text-center text-gray-600 text-xs font-bold uppercase tracking-widest py-1">
      {children}
    </p>
  );
}

// ──────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────

export default function FodaPage() {
  return (
    <>
      <Head>
        <title>FODA — Rancho Sport Training</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Análisis FODA Rancho Sport Training — Encuesta 2026" />
      </Head>

      <div className="min-h-screen py-8 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Logo */}
          <RanchoLogo />

          {/* Title card */}
          <div className="section-card mb-6 text-center">
            <p className="text-xs text-rancho-green font-semibold uppercase tracking-widest mb-1">
              Análisis Estratégico · Encuesta Marzo 2026
            </p>
            <h2 className="font-bebas text-4xl text-white tracking-wide mb-2">
              Análisis FODA
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mx-auto">
              Basado en <strong className="text-white">57 respuestas</strong> de 137 miembros (41.6% cobertura).
              Cada punto está respaldado por datos reales de la encuesta.
            </p>
          </div>

          {/* KPI strip */}
          <KPIStrip />

          {/* Axis labels top */}
          <div className="grid grid-cols-2 gap-2 mb-1 lg:ml-8">
            <AxisLabel>Interno (gym)</AxisLabel>
            <AxisLabel>Externo (mercado)</AxisLabel>
          </div>

          {/* FODA grid */}
          <div className="flex gap-2">
            {/* Left side vertical labels */}
            <div className="hidden lg:flex flex-col gap-2 w-8 flex-shrink-0">
              <AxisLabel vertical>Positivo</AxisLabel>
              <AxisLabel vertical>Negativo</AxisLabel>
            </div>

            {/* 2x2 grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuadrantCard data={FODA_DATA.fortalezas} />
              <QuadrantCard data={FODA_DATA.oportunidades} />
              <QuadrantCard data={FODA_DATA.debilidades} />
              <QuadrantCard data={FODA_DATA.amenazas} />
            </div>
          </div>

          {/* Action priorities */}
          <div className="section-card mt-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-rancho-green flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                ✓
              </div>
              <div>
                <p className="text-xs text-rancho-green uppercase tracking-widest font-semibold">Siguiente paso</p>
                <h2 className="text-white font-bebas text-2xl tracking-wide">Prioridades de Acción</h2>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { level: '🔴 Alta',        color: 'border-red-500',    text: 'Atender limpieza de baños de forma visible e inmediata — es el punto de dolor más mencionado y el de más fácil resolución.' },
                { level: '🟠 Media-Alta',  color: 'border-orange-400', text: 'Activar canal de información regular para miembros (WhatsApp). El 88% ya dijo que quiere más contenido.' },
                { level: '🟡 Media',       color: 'border-yellow-500', text: 'Estandarizar la explicación de movimientos en todas las sesiones, independientemente del coach.' },
                { level: '🟢 Mantener',    color: 'border-rancho-green', text: 'Preservar la calidad y cultura de los coaches — es el principal activo del negocio y el driver de lealtad.' },
              ].map((p, i) => (
                <div key={i} className={`flex gap-3 bg-rancho-card2 rounded-lg px-4 py-3 border-l-4 ${p.color}`}>
                  <span className="text-sm font-bold text-white flex-shrink-0 w-28">{p.level}</span>
                  <p className="text-gray-300 text-sm leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-gray-600 text-xs mt-6 mb-4">
            Rancho Sport Training · Análisis generado con datos de encuesta interna · Marzo 2026
          </p>

        </div>
      </div>
    </>
  );
}

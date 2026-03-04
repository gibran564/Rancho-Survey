import { useState } from 'react';
import Head from 'next/head';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// ──────────────────────────────────────────────
// UI Primitives
// ──────────────────────────────────────────────

function ScaleRating({ value, onChange, max = 5, labels }) {
  const [hovered, setHovered] = useState(null);
  const active = hovered ?? value;

  return (
    <div className="mt-3">
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            onTouchStart={() => setHovered(n)}
            onTouchEnd={() => setHovered(null)}
            className="text-4xl transition-all duration-150 focus:outline-none"
            style={{
              color: n <= active ? '#f59e0b' : '#374151',
              transform: n <= active ? 'scale(1.15)' : 'scale(1)',
              filter: n <= active ? 'drop-shadow(0 0 6px rgba(245,158,11,0.5))' : 'none',
            }}
            aria-label={`${n} estrellas`}
          >
            ★
          </button>
        ))}
      </div>
      {labels && (
        <p className="text-xs text-gray-500 mt-2">
          <span className="text-amber-400 font-semibold">★</span> {labels[0]}
          <span className="mx-2 text-gray-600">·</span>
          <span className="text-amber-400 font-semibold">{'★'.repeat(max)}</span> {labels[1]}
        </p>
      )}
      {value && (
        <p className="text-xs text-amber-400 font-semibold mt-1">
          {value === 1 ? '😞 ' : value === 2 ? '😕 ' : value === 3 ? '😐 ' : value === 4 ? '😊 ' : '🤩 '}
          {['', 'Muy insatisfecho', 'Insatisfecho', 'Regular', 'Bueno', 'Excelente'][value]}
        </p>
      )}
    </div>
  );
}

function OptionButtons({ value, onChange, options }) {
  return (
    <div className="flex gap-2 mt-3 flex-wrap">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`opt-btn ${value === opt.value ? 'active' : 'inactive'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      className="rancho-input mt-3"
      rows={3}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || 'Tu respuesta aquí...'}
    />
  );
}

function QuestionBlock({ number, question, children, required }) {
  return (
    <div className="mb-8">
      <p className="text-sm text-rancho-green font-semibold mb-1 uppercase tracking-widest">
        Pregunta {number}
      </p>
      <p className="text-white font-semibold text-base leading-snug">
        {question}
        {required && <span className="text-red-400 ml-1">*</span>}
      </p>
      {children}
    </div>
  );
}

function SectionHeader({ number, title, icon }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-full bg-rancho-green flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-rancho-green uppercase tracking-widest font-semibold">Sección {number}</p>
        <h2 className="text-white font-bebas text-2xl tracking-wide">{title}</h2>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// NPS Component (1–10)
// ──────────────────────────────────────────────
function NPSRating({ value, onChange }) {
  const getClass = (n) => {
    let base = 'nps-btn ';
    if (n <= 6) base += 'nps-detractor';
    else if (n <= 8) base += 'nps-passive';
    else base += 'nps-promoter';
    if (value === n) base += ' active';
    return base;
  };

  return (
    <div>
      <div className="flex gap-1.5 mt-4 flex-wrap">
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={getClass(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs px-1">
        <span className="text-red-400">Definitivamente no</span>
        <span className="text-rancho-green-light">Definitivamente sí</span>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-600 inline-block"></span>1–6 Detractor</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-yellow-500 inline-block"></span>7–8 Pasivo</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-600 inline-block"></span>9–10 Promotor</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Progress Bar
// ──────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full h-1.5 bg-rancho-border rounded-full overflow-hidden">
      <div
        className="h-full bg-rancho-green-light rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ──────────────────────────────────────────────
// Logo SVG (inline, no image needed)
// ──────────────────────────────────────────────
function RanchoLogo() {
  return (
    <div className="text-center mb-8">
      {/* Text logo */}
      <div className="relative inline-block">
        <div
          className="border-2 border-rancho-green px-6 py-2 relative"
          style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        >
          {/* Green corner accents */}
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

// ──────────────────────────────────────────────
// Main Survey Page
// ──────────────────────────────────────────────
const INITIAL_FORM = {
  q1_1: null,
  q1_2: '',
  q1_3: '',
  q2_1: '',
  q2_2: null,
  q2_3: '',
  q2_4: null,
  q2_5: null,
  q3_1: null,
  q3_2: null,
  q3_3: '',
  q4_1: '',
  q4_2: null,
  q4_3: '',
  q5_1: null,
};

const REQUIRED_FIELDS = ['q1_1', 'q2_1', 'q2_2', 'q2_3', 'q2_4', 'q2_5', 'q3_1', 'q3_2', 'q4_1', 'q4_2', 'q4_3', 'q5_1'];

export default function SurveyPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errors, setErrors] = useState([]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  // Count filled required fields for progress
  const filledRequired = REQUIRED_FIELDS.filter(k => {
    const v = form[k];
    return v !== null && v !== '';
  }).length;

  const validate = () => {
    const missing = [];
    if (!form.q1_1) missing.push('1.1 Satisfacción general');
    if (!form.q2_1.trim()) missing.push('2.1 Nombre del coach');
    if (!form.q2_2) missing.push('2.2 Calificación del coach');
    if (!form.q2_3) missing.push('2.3 Explicación de movimientos');
    if (!form.q2_4) missing.push('2.4 Adaptación del entrenamiento');
    if (!form.q2_5) missing.push('2.5 Motivación del coach');
    if (!form.q3_1) missing.push('3.1 Limpieza del gimnasio');
    if (!form.q3_2) missing.push('3.2 Estado del equipo');
    if (!form.q4_1) missing.push('4.1 Horarios');
    if (!form.q4_2) missing.push('4.2 Comunicación');
    if (!form.q4_3) missing.push('4.3 Más información');
    if (!form.q5_1) missing.push('5.1 Recomendación NPS');
    return missing;
  };

  const handleSubmit = async () => {
    const missing = validate();
    if (missing.length > 0) {
      setErrors(missing);
      // Scroll to first error section
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors([]);
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'encuestas'), {
        ...form,
        createdAt: serverTimestamp(),
      });
      setStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <SuccessScreen />
    );
  }

  return (
    <>
      <Head>
        <title>Encuesta de Satisfacción — Rancho Sport Training</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Encuesta de satisfacción Rancho Sport Training" />
      </Head>

      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <RanchoLogo />

          {/* Intro card */}
          <div className="section-card mb-6 text-center">
            <h2 className="font-bebas text-2xl text-rancho-green-light tracking-wide mb-2">
              Encuesta de Satisfacción
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Gracias por ayudarnos a mejorar tu experiencia en Rancho Sport Training.
              Tus respuestas son <strong className="text-white">confidenciales</strong> y nos ayudan a ser mejores cada día. 💪
            </p>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Tu progreso</span>
                <span>{filledRequired} / {REQUIRED_FIELDS.length} preguntas requeridas</span>
              </div>
              <ProgressBar current={filledRequired} total={REQUIRED_FIELDS.length} />
            </div>
          </div>

          {/* Validation errors */}
          {errors.length > 0 && (
            <div className="bg-red-900/30 border border-red-600 rounded-xl p-4 mb-6">
              <p className="text-red-400 font-semibold text-sm mb-2">⚠️ Por favor completa las siguientes preguntas obligatorias:</p>
              <ul className="text-red-300 text-xs space-y-1 list-disc list-inside">
                {errors.map(e => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}

          {/* ── SECTION 1 ── */}
          <div className="section-card mb-4 fade-up">
            <SectionHeader number="1" title="Experiencia General" icon="★" />

            <QuestionBlock number="1.1" question="¿Qué tan satisfecho(a) estás con tu experiencia general en el gimnasio?" required>
              <ScaleRating
                value={form.q1_1}
                onChange={v => set('q1_1', v)}
                labels={['Muy insatisfecho', 'Totalmente satisfecho']}
              />
            </QuestionBlock>

            <QuestionBlock number="1.2" question="¿Qué es lo que más valoras de nuestro gimnasio?">
              <TextArea
                value={form.q1_2}
                onChange={v => set('q1_2', v)}
                placeholder="Cuéntanos qué te gusta más..."
              />
            </QuestionBlock>

            <QuestionBlock number="1.3" question="¿Qué podríamos mejorar para ofrecerte una mejor experiencia?">
              <TextArea
                value={form.q1_3}
                onChange={v => set('q1_3', v)}
                placeholder="Tu opinión nos ayuda a crecer..."
              />
            </QuestionBlock>
          </div>

          {/* ── SECTION 2 ── */}
          <div className="section-card mb-4">
            <SectionHeader number="2" title="Coaches y Entrenamientos" icon="🏋" />

            <QuestionBlock number="2.1" question="¿Con qué coach entrenas principalmente?" required>
              <OptionButtons
                value={form.q2_1}
                onChange={v => set('q2_1', v)}
                options={[
                  { label: 'Jeremias Lombar', value: 'Jeremias Lombar' },
                  { label: 'Joel Cuevas', value: 'Joel Cuevas' },
                  { label: 'Rafael Talamantes', value: 'Rafael Talamantes' },
                ]}
              />
            </QuestionBlock>

            <QuestionBlock number="2.2" question="¿Cómo calificarías la atención y profesionalismo de tu coach?" required>
              <ScaleRating
                value={form.q2_2}
                onChange={v => set('q2_2', v)}
                labels={['Muy deficiente', 'Excelente']}
              />
            </QuestionBlock>

            <QuestionBlock number="2.3" question="¿Tu coach explica claramente los movimientos y corrige tu técnica cuando es necesario?" required>
              <OptionButtons
                value={form.q2_3}
                onChange={v => set('q2_3', v)}
                options={[
                  { label: '✅ Sí', value: 'Si' },
                  { label: '🔸 A veces', value: 'A veces' },
                  { label: '❌ No', value: 'No' },
                ]}
              />
            </QuestionBlock>

            <QuestionBlock number="2.4" question="¿Consideras que los entrenamientos se adaptan a tu nivel y objetivos personales?" required>
              <ScaleRating
                value={form.q2_4}
                onChange={v => set('q2_4', v)}
                labels={['Nada adaptados', 'Perfectamente adaptados']}
              />
            </QuestionBlock>

            <QuestionBlock number="2.5" question="¿Sientes que tu coach motiva y apoya tu progreso?" required>
              <ScaleRating
                value={form.q2_5}
                onChange={v => set('q2_5', v)}
                labels={['No me motiva', 'Me motiva mucho']}
              />
            </QuestionBlock>
          </div>

          {/* ── SECTION 3 ── */}
          <div className="section-card mb-4">
            <SectionHeader number="3" title="Instalaciones y Equipamiento" icon="🏟" />

            <QuestionBlock number="3.1" question="¿Cómo calificarías la limpieza e higiene del gimnasio?" required>
              <ScaleRating
                value={form.q3_1}
                onChange={v => set('q3_1', v)}
                labels={['Muy sucia', 'Impecable']}
              />
            </QuestionBlock>

            <QuestionBlock number="3.2" question="¿Cómo calificarías el estado y disponibilidad del equipo?" required>
              <ScaleRating
                value={form.q3_2}
                onChange={v => set('q3_2', v)}
                labels={['Muy deficiente', 'Excelente']}
              />
            </QuestionBlock>

            <QuestionBlock number="3.3" question="¿Qué mejorarías en nuestras instalaciones o equipamiento?">
              <TextArea
                value={form.q3_3}
                onChange={v => set('q3_3', v)}
                placeholder="¿Algo específico que necesitemos mejorar?"
              />
            </QuestionBlock>
          </div>

          {/* ── SECTION 4 ── */}
          <div className="section-card mb-4">
            <SectionHeader number="4" title="Horarios y Comunicación" icon="📅" />

            <QuestionBlock number="4.1" question="¿Los horarios de clase se ajustan a tus necesidades?" required>
              <OptionButtons
                value={form.q4_1}
                onChange={v => set('q4_1', v)}
                options={[
                  { label: '✅ Sí', value: 'Si' },
                  { label: '🔸 Parcialmente', value: 'Parcialmente' },
                  { label: '❌ No', value: 'No' },
                ]}
              />
            </QuestionBlock>

            <QuestionBlock number="4.2" question="¿Cómo calificarías nuestra comunicación (avisos, redes sociales, WhatsApp, etc.)?" required>
              <ScaleRating
                value={form.q4_2}
                onChange={v => set('q4_2', v)}
                labels={['Muy deficiente', 'Excelente']}
              />
            </QuestionBlock>

            <QuestionBlock number="4.3" question="¿Te gustaría recibir más información sobre eventos, promociones o seguimiento de progreso?" required>
              <OptionButtons
                value={form.q4_3}
                onChange={v => set('q4_3', v)}
                options={[
                  { label: '✅ Sí', value: 'Si' },
                  { label: '❌ No', value: 'No' },
                ]}
              />
            </QuestionBlock>
          </div>

          {/* ── SECTION 5 ── */}
          <div className="section-card mb-8">
            <SectionHeader number="5" title="Recomendación" icon="🏆" />

            <QuestionBlock number="5.1" question="¿Recomendarías Rancho Sport Training a un amigo o familiar?" required>
              <NPSRating
                value={form.q5_1}
                onChange={v => set('q5_1', v)}
              />
            </QuestionBlock>
          </div>

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={status === 'submitting'}
            className="glow-btn w-full py-4 rounded-xl text-white font-bebas text-2xl tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? 'ENVIANDO...' : 'ENVIAR RESPUESTAS 💪'}
          </button>

          {status === 'error' && (
            <p className="text-red-400 text-center mt-3 text-sm">
              ⚠️ Ocurrió un error al enviar. Por favor intenta de nuevo.
            </p>
          )}

          <p className="text-center text-gray-600 text-xs mt-6 mb-4">
            Rancho Sport Training · Tus respuestas son confidenciales
          </p>
        </div>
      </div>
    </>
  );
}

function SuccessScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl mb-6">💪</div>
        <div
          className="border-2 border-rancho-green px-8 py-4 inline-block mb-6"
          style={{ background: 'rgba(45,122,45,0.1)' }}
        >
          <h1 className="font-bebas text-5xl tracking-widest text-white">¡GRACIAS!</h1>
          <p className="text-rancho-green-light font-semibold text-sm tracking-wider uppercase">Rancho Sport Training</p>
        </div>
        <p className="text-gray-300 text-lg leading-relaxed mb-4">
          Tu opinión ha sido registrada con éxito.
        </p>
        <p className="text-gray-500 text-sm">
          Tu feedback nos ayuda a ser mejores cada día y ofrecerte la mejor experiencia de entrenamiento. ¡Nos vemos en el gym! 🏋️‍♂️
        </p>
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rancho-green"></div>
          <div className="w-16 h-px bg-rancho-border"></div>
          <div className="w-2 h-2 rounded-full bg-rancho-brown"></div>
          <div className="w-16 h-px bg-rancho-border"></div>
          <div className="w-2 h-2 rounded-full bg-rancho-green"></div>
        </div>
      </div>
    </div>
  );
}

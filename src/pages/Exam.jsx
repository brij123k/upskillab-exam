import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Send, Loader2, AlertTriangle, LayoutGrid, Clock } from 'lucide-react';
import { Logos } from '../components/Layout';
import { submitExam } from '../api';
import { getSession, setSession } from '../session';

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const LETTERS = 'ABCDEFGHIJ';

export default function Exam() {
  const navigate = useNavigate();
  const session = getSession();
  const exam = session.exam;
  const totalSeconds = exam ? exam.durationMinutes * 60 : 0;

  const [current, setCurrent] = useState(session.current || 0);
  const [answers, setAnswers] = useState(session.answers || {});
  const [remaining, setRemaining] = useState(() =>
    exam ? Math.max(0, Math.round((session.startedAt + totalSeconds * 1000 - Date.now()) / 1000)) : 0
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submittedRef = useRef(false);

  const submit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setError('');
    const s = getSession();
    try {
      await submitExam({
        studentId: s.studentId,
        examId: s.examId,
        answers: Object.entries(s.answers || {}).map(([questionId, optionId]) => ({ questionId, optionId })),
        timeTakenSeconds: Math.round((Date.now() - s.startedAt) / 1000),
      });
      setSession({ submitted: true });
      navigate('/thank-you', { replace: true });
    } catch (e) {
      submittedRef.current = false;
      setSubmitting(false);
      setError(e.message || 'Submission failed. Please try again.');
    }
  }, [navigate]);

  // Timer: derived from startedAt so a refresh doesn't reset it.
  useEffect(() => {
    if (!exam) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.round((session.startedAt + totalSeconds * 1000 - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        clearInterval(id);
        submit();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [exam, session.startedAt, totalSeconds, submit]);

  // Warn before leaving the page mid-exam.
  useEffect(() => {
    const handler = (e) => {
      if (submittedRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  useEffect(() => {
    setSession({ current, answers });
  }, [current, answers]);

  const total = exam?.questions.length || 0;
  const q = exam?.questions[current];

  // Keyboard: A-E / 1-5 to pick, arrows to move.
  useEffect(() => {
    if (!q) return;
    const onKey = (e) => {
      if (confirmOpen || e.target.tagName === 'INPUT') return;
      const key = e.key.toUpperCase();
      let idx = LETTERS.indexOf(key);
      if (idx === -1 && /^[1-9]$/.test(key)) idx = Number(key) - 1;
      if (idx >= 0 && idx < q.options.length) {
        setAnswers((a) => ({ ...a, [q.id]: q.options[idx].id }));
      } else if (e.key === 'ArrowRight' && current < total - 1) {
        setCurrent((c) => c + 1);
      } else if (e.key === 'ArrowLeft' && current > 0) {
        setCurrent((c) => c - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [q, current, total, confirmOpen]);

  if (!session.studentId) return <Navigate to="/register" replace />;
  if (session.submitted) return <Navigate to="/thank-you" replace />;
  if (!exam) return <Navigate to="/exam/instructions" replace />;

  const answeredCount = Object.keys(answers).length;
  const isLast = current === total - 1;
  const lowTime = remaining <= 60;
  const pct = totalSeconds ? remaining / totalSeconds : 0;
  const R = 20;
  const C = 2 * Math.PI * R;

  const palette = (
    <>
      <div className="pal-stats">
        <div><strong>{answeredCount}</strong><span>Answered</span></div>
        <div><strong>{total - answeredCount}</strong><span>Remaining</span></div>
      </div>
      <div className="palette-grid">
        {exam.questions.map((qq, i) => (
          <button
            key={qq.id}
            className={`pal ${answers[qq.id] ? 'answered' : ''} ${i === current ? 'current' : ''}`}
            onClick={() => {
              setCurrent(i);
              setPaletteOpen(false);
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="legend">
        <span><i className="pal answered" /> Answered</span>
        <span><i className="pal" /> Not answered</span>
        <span><i className="pal current" /> Current</span>
      </div>
      <button className="btn btn-outline btn-block" onClick={() => setConfirmOpen(true)}>
        <Send size={16} /> Submit test
      </button>
    </>
  );

  return (
    <div className="exam-page">
      <header className="exam-header">
        <div className="container exam-header-inner">
          <Logos compact />
          <div className="exam-title-mini">{exam.title}</div>
          <div className={`timer ${lowTime ? 'timer-low' : ''}`} aria-live="polite" title="Time remaining">
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r={R} className="ring-bg" />
              <circle
                cx="24" cy="24" r={R} className="ring-fg"
                strokeDasharray={C} strokeDashoffset={C * (1 - pct)}
              />
            </svg>
            <div className="timer-text">
              <small><Clock size={12} /> Time left</small>
              <strong>{formatTime(remaining)}</strong>
            </div>
          </div>
        </div>
        <div className="progress">
          <div className="progress-bar" style={{ width: `${(answeredCount / total) * 100}%` }} />
        </div>
      </header>

      <main className="container exam-body">
        <div className="exam-main">
          <div className="q-card" key={q.id}>
            <div className="q-meta">
              <span className="q-badge">Question {current + 1} <em>/ {total}</em></span>
              <button className="pal-toggle" onClick={() => setPaletteOpen(true)}>
                <LayoutGrid size={16} /> {answeredCount}/{total}
              </button>
            </div>
            <h2 className="q-text">{q.text}</h2>
            <div className="options" role="radiogroup">
              {q.options.map((o, i) => {
                const selected = answers[q.id] === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`option ${selected ? 'selected' : ''}`}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                  >
                    <span className="opt-key">{LETTERS[i]}</span>
                    <span className="opt-text">{o.text}</span>
                    <span className="radio" />
                  </button>
                );
              })}
            </div>
            <p className="kbd-hint">Tip: press <kbd>A</kbd>–<kbd>{LETTERS[q.options.length - 1]}</kbd> to choose, <kbd>←</kbd> <kbd>→</kbd> to move.</p>
          </div>

          {error && <div className="alert">{error}</div>}

          <div className="exam-nav">
            <button className="btn btn-outline" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
              <ArrowLeft size={18} /> Previous
            </button>
            {isLast ? (
              <button className="btn btn-primary btn-glow" onClick={() => setConfirmOpen(true)} disabled={submitting}>
                Submit <Send size={17} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setCurrent((c) => c + 1)}>
                Next <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>

        <aside className="palette">
          <h4>Question palette</h4>
          {palette}
        </aside>
      </main>

      {paletteOpen && (
        <div className="sheet-backdrop" onClick={() => setPaletteOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h4>Question palette</h4>
            {palette}
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <div className={`modal-icon ${answeredCount < total ? 'warn' : ''}`}>
              {answeredCount < total ? <AlertTriangle size={28} /> : <Send size={26} />}
            </div>
            <h3>Submit your test?</h3>
            <div className="modal-stats">
              <div><strong>{answeredCount}</strong><span>Answered</span></div>
              <div><strong>{total - answeredCount}</strong><span>Unanswered</span></div>
              <div><strong>{formatTime(remaining)}</strong><span>Time left</span></div>
            </div>
            <p>
              {answeredCount < total && 'Unanswered questions will be left blank. '}
              You cannot change your answers after submitting.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>
                Review answers
              </button>
              <button className="btn btn-primary" onClick={submit} disabled={submitting}>
                {submitting ? <><Loader2 size={17} className="spin" /> Submitting…</> : 'Yes, submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

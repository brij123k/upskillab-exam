import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Send, Loader2, AlertTriangle,
  LayoutGrid, Clock, ShieldAlert,
} from 'lucide-react';
import { Logos } from '../components/Layout';
import apiService from '../api/apiService';
import { API_CONFIG } from '../api/apiConfig';
import { getSession, setSession } from '../session';

function formatTime(sec) {
  const safe = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const LETTERS = 'ABCDEFGHIJ';
const MAX_SCREEN_SWITCHES = 100;

/* ------------------------------------------------------------------ */
/*  Helper: build the DTO shape the backend expects                    */
/* ------------------------------------------------------------------ */
function toSelectedOptionIds(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value) return [value];
  return [];
}

export default function Exam() {
  const navigate = useNavigate();
  const initialSession = useMemo(() => getSession(), []);

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [starting, setStarting] = useState(true);
  const [startError, setStartError] = useState('');

  const [current, setCurrent] = useState(initialSession.current || 0);
  const [answers, setAnswers] = useState(initialSession.answers || {});
  const [remaining, setRemaining] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [screenSwitchCount, setScreenSwitchCount] = useState(0);

  const submittedRef = useRef(false);
  const expireHandledRef = useRef(false);
  const saveTimers = useRef({}); // per-question debounce timers
  const attemptTokenRef = useRef(null);

  const totalSeconds = exam ? exam.durationMinutes * 60 : 0;

  /* ================================================================ */
  /*  START / RESUME                                                   */
  /* ================================================================ */
  useEffect(() => {
    let cancelled = false;

    async function startOrResumeExam() {
      try {
        setStarting(true);
        setStartError('');

        const stored = getSession();
        const savedData = JSON.parse(
          localStorage.getItem('registrationData') || 'null'
        );
        console.log('Stored session:', stored);

        const registrationId =
          stored.registration?.id || savedData?.registration?.id;
        const domainId =
          stored.domainId ||
          stored.registration?.domainId ||
          savedData?.registration?.domainId;
        const examId =
          stored.examId || stored.exam?.id || savedData?.exam?.id;

        if (!registrationId || !domainId || !examId) {
          throw new Error(
            'Registration or exam details are missing. Please register again.'
          );
        }

        const response = await apiService.post(
          API_CONFIG.EXAMS.STARTEXAM,
          { registrationId, domainId, examId }
        );

        if (
          !response?.attempt ||
          !response?.exam ||
          !Array.isArray(response?.questions)
        ) {
          throw new Error('The server returned an invalid exam response.');
        }

        attemptTokenRef.current = response.attemptToken;
        localStorage.setItem("accessToken",response.attemptToken);
        /* -------- normalize questions -------- */
        const normalizedQuestions = response.questions
          .slice()
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((q) => ({
            id: q._id,
            text: q.text,
            type: q.type || 'mcq',
            answerMode: q.answerMode === 'multiple' ? 'multiple' : 'single',
            marks: q.marks ?? 0,
            maxAnswerCharacters: q.maxAnswerCharacters ?? null,
            options: (q.options || []).map((o) => ({
              id: o.optionId,
              text: o.text,
            })),
          }));

        const normalizedExam = {
          ...response.exam,
          id: response.attempt.examPaperId || examId,
          title: response.exam.title || 'Exam',
          durationMinutes: response.exam.durationMinutes || 10,
          totalMarks: response.exam.totalMarks,
          instructions: response.exam.instructions || [],
          questions: normalizedQuestions,
        };

        if (cancelled) return;

        /* -------- resume-aware answers -------- */
        const prevAnswers = stored.answers || {};
        const migratedAnswers = {};
        normalizedQuestions.forEach((q) => {
          const v = prevAnswers[q.id];
          if (q.answerMode === 'multiple') {
            migratedAnswers[q.id] = Array.isArray(v) ? v : v ? [v] : [];
          } else if (v) {
            migratedAnswers[q.id] = Array.isArray(v) ? v[0] : v;
          }
        });

        /* -------- time computation -------- */
        const startedAtMs = response.attempt.startedAt
          ? Date.parse(response.attempt.startedAt)
          : Date.now();
        const expiresAtMs = response.attempt.expiresAt
          ? Date.parse(response.attempt.expiresAt)
          : startedAtMs + normalizedExam.durationMinutes * 60 * 1000;

        const remainingFromServer =
          typeof response.attempt.remainingSeconds === 'number'
            ? response.attempt.remainingSeconds
            : Math.max(0, Math.round((expiresAtMs - Date.now()) / 1000));

        setExam(normalizedExam);
        setQuestions(normalizedQuestions);
        setAttempt(response.attempt);
        setRemaining(remainingFromServer);
        setAnswers(migratedAnswers);
        setScreenSwitchCount(response.attempt.screenSwitchCount || 0);
        setCurrent((c) =>
          Math.min(Math.max(0, c || 0), normalizedQuestions.length - 1)
        );

        setSession({
          registration: savedData?.registration || stored.registration,
          studentId: stored.studentId || savedData?.registration?.studentId,
          domainId,
          exam: normalizedExam,
          examId,
          attempt: response.attempt,
          attemptId: response.attempt.attemptId,
          attemptToken: response.attemptToken,
          current: stored.current || 0,
          answers: migratedAnswers,
          startedAt: startedAtMs,
          expiresAt: expiresAtMs,
          remainingSeconds: remainingFromServer,
          screenSwitchCount: response.attempt.screenSwitchCount || 0,
          submitted: false,
        });

        /* -------- resume path: if already expired, autosubmit -------- */
        if (remainingFromServer <= 0) {
          expireHandledRef.current = true;
          await submitExpired(response.attempt.attemptId);
        }
      } catch (err) {
        if (!cancelled) {
          setStartError(err.message || 'Could not start or resume the exam.');
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    }

    startOrResumeExam();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================================================================ */
  /*  SAVE ONE ANSWER (called per selection)                           */
  /* ================================================================ */
  const saveAnswer = useCallback(async (questionId, selectedOptionIds) => {
    if (!attemptTokenRef.current) return;
    try {
      const res = await apiService.post(
        API_CONFIG.EXAMS.SAVEANSWER(questionId),
        { selectedOptionIds },
      );
      console.log(res)
    } catch (e) {
      setWarning('Could not save last answer. Check your connection.');
      setTimeout(() => setWarning(''), 3500);
    }
  }, []);

  /* Debounced per-question saver so fast clicks don't hammer the API */
  const queueSave = useCallback(
    (questionId, selectedOptionIds) => {
      clearTimeout(saveTimers.current[questionId]);
      saveTimers.current[questionId] = setTimeout(() => {
        saveAnswer(questionId, selectedOptionIds);
      }, 300);
    },
    [saveAnswer]
  );

  /* ================================================================ */
  /*  EXPIRED SUBMIT (called when timer hits 0)                        */
  /* ================================================================ */
  const submitExpired = useCallback(
    async (attemptId) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      try {
        await apiService.post(
          API_CONFIG.EXAMS.SUBMITEXPIRE(attemptId),
          {},
          { headers: { authorization: attemptTokenRef.current || '' } }
        );
      } catch (_) {
        /* swallow — we still redirect */
      }
      setSession({ submitted: true });
      navigate('/thank-you', { replace: true });
    },
    [navigate]
  );

  /* ================================================================ */
  /*  SUBMIT — sends ALL answers at once                               */
  /* ================================================================ */
  const submit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setError('');

    const s = getSession();
    try {
      const questionMap = new Map(questions.map((q) => [q.id, q]));
      const finalAnswers = Object.entries(s.answers || {})
        .map(([questionId, value]) => {
          const q = questionMap.get(questionId);
          if (!q) return null;

          const selectedOptionIds = toSelectedOptionIds(value);
          if (q.answerMode === 'multiple') {
            return selectedOptionIds.length
              ? { questionId, selectedOptionIds }
              : null;
          }
          return selectedOptionIds.length
            ? { questionId, selectedOptionIds: [selectedOptionIds[0]] }
            : null;
        })
        .filter(Boolean);

      const payload = {
        answers: finalAnswers,
      };

      await apiService.post(API_CONFIG.EXAMS.SUBMITANSWER, payload, {
        headers: {
          authorization: attemptTokenRef.current || '',
        },
      });

      setSession({ submitted: true });
      navigate('/thank-you', { replace: true });
    } catch (e) {
      submittedRef.current = false;
      setSubmitting(false);
      setError(e.message || 'Submission failed. Please try again.');
    }
  }, [navigate, questions]);

  /* ================================================================ */
  /*  TIMER — always derived from expiresAt                            */
  /* ================================================================ */
  useEffect(() => {
    if (!exam) return;

    const tick = () => {
      const s = getSession();
      const expiresAt = s.expiresAt || Date.now();
      const left = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setRemaining(left);

      if (left <= 0 && !expireHandledRef.current) {
        expireHandledRef.current = true;
        submitExpired(s.attemptId);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [exam, submitExpired]);

  /* ================================================================ */
  /*  UNLOAD GUARD                                                     */
  /* ================================================================ */
  useEffect(() => {
    const handler = (e) => {
      if (submittedRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  /* ================================================================ */
  /*  PERSIST LOCAL PROGRESS (refresh-safe)                            */
  /* ================================================================ */
  useEffect(() => {
    if (!exam) return;
    setSession({ current, answers });
  }, [current, answers, exam]);

  const total = exam?.questions?.length || 0;
  const q = exam?.questions?.[current];

  /* ================================================================ */
  /*  KEYBOARD SHORTCUTS                                               */
  /* ================================================================ */
  useEffect(() => {
    if (!q) return;
    const onKey = (e) => {
      if (confirmOpen || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
        return;
      const key = e.key.toUpperCase();
      let idx = LETTERS.indexOf(key);
      if (idx === -1 && /^[1-9]$/.test(key)) idx = Number(key) - 1;

      if (idx >= 0 && idx < q.options.length) {
        const optId = q.options[idx].id;
        if (q.answerMode === 'multiple') {
          setAnswers((a) => {
            const cur = Array.isArray(a[q.id]) ? a[q.id] : [];
            const next = cur.includes(optId)
              ? cur.filter((x) => x !== optId)
              : [...cur, optId];
            queueSave(q.id, next);
            return { ...a, [q.id]: next };
          });
        } else {
          setAnswers((a) => {
            queueSave(q.id, [optId]);
            return { ...a, [q.id]: optId };
          });
        }
      } else if (e.key === 'ArrowRight' && current < total - 1) {
        setCurrent((c) => c + 1);
      } else if (e.key === 'ArrowLeft' && current > 0) {
        setCurrent((c) => c - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [q, current, total, confirmOpen, queueSave]);

  /* ================================================================ */
  /*  SCREEN-SWITCH DETECTION                                          */
  /* ================================================================ */
  const reportScreenSwitch = useCallback(async () => {
    const s = getSession();
    if (!s.attemptId || submittedRef.current) return;

    try {
      const res = await apiService.post(
        API_CONFIG.EXAMS.SWICHSCREENDATA(s.attemptId),
        {},
        { headers: { authorization: attemptTokenRef.current || '' } }
      );

      const newCount = res?.screenSwitchCount ?? screenSwitchCount + 1;
      setScreenSwitchCount(newCount);
      setSession({ screenSwitchCount: newCount });

      if (res?.status === 'submitted' || res?.status === 'expired') {
        submittedRef.current = true;
        setSession({ submitted: true, submissionReason: res?.submissionReason });
        navigate('/thank-you', { replace: true });
        return;
      }

      setWarning(
        `Warning: tab switch detected (${newCount}/${MAX_SCREEN_SWITCHES}). Your exam will be auto-submitted if you exceed the limit.`
      );
      setTimeout(() => setWarning(''), 5000);
    } catch (e) {
      setWarning('Could not record screen switch. Please stay on this page.');
    }
  }, [navigate, screenSwitchCount]);

  useEffect(() => {
    if (!exam) return;

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') reportScreenSwitch();
    };
    const onBlur = () => reportScreenSwitch();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
    };
  }, [exam, reportScreenSwitch]);

  /* ================================================================ */
  /*  GUARDS                                                          */
  /* ================================================================ */
  if (!initialSession.studentId) return <Navigate to="/register" replace />;
  if (initialSession.submitted) return <Navigate to="/thank-you" replace />;

  if (starting) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 10px 30px rgba(79, 70, 229, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4f46e5',
        }}
      >
        <Loader2 size={32} className="spin" />
      </div>
      <p
        style={{
          margin: 0,
          fontSize: '1.05rem',
          fontWeight: 600,
          color: '#334155',
          letterSpacing: '0.01em',
        }}
      >
        Preparing your exam…
      </p>
      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
        Loading questions and starting the timer
      </span>
    </div>
  );
}

if (startError) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        background: 'linear-gradient(135deg, #fef2f2 0%, #f8fafc 100%)',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 10px 30px rgba(220, 38, 38, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#dc2626',
        }}
      >
        <AlertTriangle size={32} />
      </div>
      <div style={{ maxWidth: '480px' }}>
        <p
          style={{
            margin: '0 0 6px',
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          Couldn’t start your exam
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '0.95rem',
            color: '#64748b',
            lineHeight: 1.5,
          }}
        >
          {startError}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#4f46e5',
            background: '#fff',
            border: '1.5px solid #4f46e5',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          Try again
        </button>
        <button
          onClick={() => navigate('/register')}
          style={{
            padding: '10px 20px',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#fff',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
            transition: 'all 0.15s ease',
          }}
        >
          Back to registration
        </button>
      </div>
    </div>
  );
}

  if (!exam) return null;

  const isAnswered = (qq) => {
    const v = answers[qq.id];
    if (qq.answerMode === 'multiple') return Array.isArray(v) && v.length > 0;
    return !!v;
  };

  const answeredCount = questions.filter(isAnswered).length;
  const isLast = current === total - 1;
  const lowTime = remaining <= 60;
  const pct = totalSeconds ? remaining / totalSeconds : 0;
  const R = 20;
  const C = 2 * Math.PI * R;

  const toggleOption = (optId) => {
    if (!q) return;
    if (q.answerMode === 'multiple') {
      setAnswers((a) => {
        const cur = Array.isArray(a[q.id]) ? a[q.id] : [];
        const next = cur.includes(optId)
          ? cur.filter((x) => x !== optId)
          : [...cur, optId];
        queueSave(q.id, next);
        return { ...a, [q.id]: next };
      });
    } else {
      setAnswers((a) => {
        queueSave(q.id, [optId]);
        return { ...a, [q.id]: optId };
      });
    }
  };

  const palette = (
    <>
      <div className="pal-stats">
        <div><strong>{answeredCount}</strong><span>Answered</span></div>
        <div><strong>{total - answeredCount}</strong><span>Remaining</span></div>
      </div>
      <div className="palette-grid">
        {questions.map((qq, i) => (
          <button
            key={qq.id}
            className={`pal ${isAnswered(qq) ? 'answered' : ''} ${i === current ? 'current' : ''}`}
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
          <div
            className={`timer ${lowTime ? 'timer-low' : ''}`}
            aria-live="polite"
            title="Time remaining"
          >
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r={R} className="ring-bg" />
              <circle
                cx="24"
                cy="24"
                r={R}
                className="ring-fg"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - pct)}
              />
            </svg>
            <div className="timer-text">
              <small><Clock size={12} /> Time left</small>
              <strong>{formatTime(remaining)}</strong>
            </div>
          </div>
        </div>
        <div className="progress">
          <div
            className="progress-bar"
            style={{ width: `${total ? (answeredCount / total) * 100 : 0}%` }}
          />
        </div>
        <div className="exam-warnings">
          <span className="sw-count">
            <ShieldAlert size={14} />
            Tab switches: {screenSwitchCount}/{MAX_SCREEN_SWITCHES}
          </span>
        </div>
      </header>

      {warning && (
        <div className="global-warning">
          <AlertTriangle size={16} /> {warning}
        </div>
      )}

      <main className="container exam-body">
        <div className="exam-main">
          {q ? (
            <div className="q-card" key={q.id}>
              <div className="q-meta">
                <span className="q-badge">
                  Question {current + 1} <em>/ {total}</em>
                </span>
                <span className="q-mode">
                  {q.answerMode === 'multiple' ? 'Multiple answers' : 'Single answer'}
                  {q.marks ? ` · ${q.marks} marks` : ''}
                </span>
                <button className="pal-toggle" onClick={() => setPaletteOpen(true)}>
                  <LayoutGrid size={16} /> {answeredCount}/{total}
                </button>
              </div>

              <h2 className="q-text">{q.text}</h2>

              <div
                className="options"
                role={q.answerMode === 'multiple' ? 'group' : 'radiogroup'}
              >
                {q.options.map((o, i) => {
                  const selected =
                    q.answerMode === 'multiple'
                      ? Array.isArray(answers[q.id]) && answers[q.id].includes(o.id)
                      : answers[q.id] === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      role={q.answerMode === 'multiple' ? 'checkbox' : 'radio'}
                      aria-checked={selected}
                      className={`option ${selected ? 'selected' : ''}`}
                      onClick={() => toggleOption(o.id)}
                    >
                      <span className="opt-key">{LETTERS[i]}</span>
                      <span className="opt-text">{o.text}</span>
                      <span className={q.answerMode === 'multiple' ? 'checkbox' : 'radio'} />
                    </button>
                  );
                })}
              </div>

              <p className="kbd-hint">
                Tip: press <kbd>A</kbd>–<kbd>{LETTERS[Math.max(0, q.options.length - 1)]}</kbd>{' '}
                {q.answerMode === 'multiple' ? 'to toggle' : 'to choose'}, <kbd>←</kbd>{' '}
                <kbd>→</kbd> to move.
              </p>
            </div>
          ) : (
            <div className="alert">No question loaded.</div>
          )}

          {error && <div className="alert">{error}</div>}

          <div className="exam-nav">
            <button
              className="btn btn-outline"
              disabled={current === 0}
              onClick={() => setCurrent((c) => c - 1)}
            >
              <ArrowLeft size={18} /> Previous
            </button>
            {isLast ? (
              <button
                className="btn btn-primary btn-glow"
                onClick={() => setConfirmOpen(true)}
                disabled={submitting}
              >
                Submit <Send size={17} />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setCurrent((c) => c + 1)}
              >
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
              <button
                className="btn btn-outline"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
              >
                Review answers
              </button>
              <button className="btn btn-primary" onClick={submit} disabled={submitting}>
                {submitting ? (
                  <><Loader2 size={17} className="spin" /> Submitting…</>
                ) : (
                  'Yes, submit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
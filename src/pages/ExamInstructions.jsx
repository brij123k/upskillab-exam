import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ListChecks, Timer, MousePointerClick, ArrowRight, Loader2, Check, Info } from 'lucide-react';
import { Header } from '../components/Layout';
import { Stepper } from './Register';
import { fetchExam } from '../api';
import { getSession, setSession } from '../session';

export default function ExamInstructions() {
  const navigate = useNavigate();
  const session = getSession();
  const [exam, setExam] = useState(null);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!session.studentId) return;
    fetchExam(session.domainId)
      .then(setExam)
      .catch((e) => setError(e.message || 'Could not load the exam.'));
  }, [session.studentId, session.domainId]);

  if (!session.studentId) return <Navigate to="/register" replace />;
  if (session.submitted) return <Navigate to="/thank-you" replace />;

  function start() {
    // Keep the original start time if the student already started (e.g. pressed back).
    const startedAt = session.examId === exam.id && session.startedAt ? session.startedAt : Date.now();
    setSession({ exam, examId: exam.id, startedAt, answers: session.answers || {}, current: session.current || 0 });
    navigate('/exam');
  }

  const firstName = session.student?.fullName?.split(' ')[0];

  return (
    <div className="soft-page">
      <Header minimal />
      <div className="container narrow-md">
        <Stepper current={1} />
        <div className="ei-card">
          {error && <div className="alert">{error}</div>}
          {!exam && !error && (
            <div className="loader"><Loader2 size={28} className="spin" /> Loading exam instructions…</div>
          )}
          {exam && (
            <>
              <div className="ei-hero">
                <div className="hero-grid-bg" />
                <span className="ei-hello">Hi {firstName} 👋 You’re about to take</span>
                <h1>{exam.title}</h1>
                <div className="ei-meta">
                  <div><ListChecks size={22} /><strong>{exam.questions.length}</strong><span>Questions</span></div>
                  <div><Timer size={22} /><strong>{exam.durationMinutes} min</strong><span>Duration</span></div>
                  <div><MousePointerClick size={22} /><strong>1</strong><span>Per screen</span></div>
                </div>
              </div>

              <div className="ei-body">
                <h3><Info size={20} /> Read before you begin</h3>
                <ol className="ins-list">
                  {exam.instructions.map((ins, i) => (
                    <li key={i}>
                      <span className="ins-li-num">{i + 1}</span>
                      <div>{ins}</div>
                    </li>
                  ))}
                </ol>

                <label className={`consent-box ${agreed ? 'checked' : ''}`}>
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                  <span className="check-ui">{agreed && <Check size={14} strokeWidth={3} />}</span>
                  <span>I have read and understood the instructions.</span>
                </label>

                <div className="form-actions">
                  <span className="muted small">The timer starts as soon as you click Start.</span>
                  <button className="btn btn-primary btn-lg btn-glow" disabled={!agreed} onClick={start}>
                    Start Exam <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

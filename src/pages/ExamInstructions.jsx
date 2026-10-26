
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ListChecks,
  Timer,
  MousePointerClick,
  ArrowRight,
  Check,
  Info,
  BookOpen,
  Award,
} from 'lucide-react';

import { Header } from '../components/Layout';
import { Stepper } from './Register';
import { getSession, setSession } from '../session';

export default function ExamInstructions() {
  const navigate = useNavigate();
  const session = getSession();

  // Exam details were returned by the registration API.
  const savedData = (() => {
    try {
      return JSON.parse(
        localStorage.getItem('registrationData') || 'null'
      );
    } catch {
      return null;
    }
  })();

  const exam = session.exam || savedData?.exam || null;
  const registration =
    session.registration || savedData?.registration || null;

  const student =
    session.student || registration || null;

  const [agreed, setAgreed] = useState(false);

  const studentId =
    session.studentId || registration?.studentId;

  const submitted = session.submitted;

  if (!studentId || !exam?.id) {
    return <Navigate to="/register" replace />;
  }

  if (submitted) {
    return <Navigate to="/thank-you" replace />;
  }

  function start() {
    // Preserve the timer and answers if the student returns here.
    const startedAt =
      session.examId === exam.id && session.startedAt
        ? session.startedAt
        : Date.now();

    setSession({
      ...session,
      student,
      studentId,
      registration,
      domainId: registration?.domainId || session.domainId,
      exam,
      examId: exam.id,
      startedAt,
      answers: session.answers || {},
      current: session.current || 0,
      submitted: false,
    });

    navigate('/exam');
  }

  const firstName =
    student?.fullName?.trim().split(/\s+/)[0] || 'Student';

  const instructions = Array.isArray(exam.instructions)
    ? exam.instructions
    : [];

  return (
    <div className="soft-page">
      <Header minimal />

      <div className="container narrow-md">
        <Stepper current={1} />

        <div className="ei-card">
          <div className="ei-hero">
            <div className="hero-grid-bg" />

            <span className="ei-hello">
              Hi {firstName} 👋 You’re about to take
            </span>

            <h1>{exam.title || 'Assessment'}</h1>

            {exam.description && (
              <p>{exam.description}</p>
            )}

            <div className="ei-meta">
              <div>
                <ListChecks size={22} />
                <strong>{exam.totalQuestions ?? '—'}</strong>
                <span>Questions</span>
              </div>

              <div>
                <Timer size={22} />
                <strong>
                  {exam.durationMinutes ?? '—'} min
                </strong>
                <span>Duration</span>
              </div>

              <div>
                <Award size={22} />
                <strong>{exam.totalMarks ?? '—'}</strong>
                <span>Total marks</span>
              </div>
            </div>
          </div>

          <div className="ei-body">
            <h3>
              <Info size={20} />
              Read before you begin
            </h3>

            {instructions.length > 0 ? (
              <ol className="ins-list">
                {instructions.map((instruction, index) => (
                  <li key={index}>
                    <span className="ins-li-num">
                      {index + 1}
                    </span>
                    <div>{instruction}</div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted">
                No specific instructions were provided for this assessment.
              </p>
            )}

            {/* <div className="exam-summary">
              <h3>
                <BookOpen size={20} />
                Assessment details
              </h3>

              <p>
                <strong>Student ID:</strong> {studentId}
              </p>

              {registration?.registrationStatus && (
                <p>
                  <strong>Registration status:</strong>{' '}
                  {registration.registrationStatus}
                </p>
              )}

              {exam.passingMarks != null && (
                <p>
                  <strong>Passing marks:</strong>{' '}
                  {exam.passingMarks}
                </p>
              )}
            </div> */}

            <label
              className={`consent-box ${
                agreed ? 'checked' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) =>
                  setAgreed(event.target.checked)
                }
              />

              <span className="check-ui">
                {agreed && (
                  <Check size={14} strokeWidth={3} />
                )}
              </span>

              <span>
                I have read and understood the instructions.
              </span>
            </label>

            <div className="form-actions">
              <span className="muted small">
                The timer starts when you click Start Exam.
              </span>

              <button
                type="button"
                className="btn btn-primary btn-lg btn-glow"
                disabled={!agreed}
                onClick={start}
              >
                Start Exam <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

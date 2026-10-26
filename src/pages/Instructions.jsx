
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ArrowRight, CalendarDays, MapPin, Smartphone, MonitorCheck,
  ClipboardList, Brain, BarChart3, Flag, Headphones,
  BatteryCharging, Wifi, IdCard, BellOff, MessageSquareOff,
  Hand, Clock, BookOpen, GraduationCap, CheckCircle2,
} from 'lucide-react';

import { Header, Footer, Pending, Reveal } from '../components/Layout';

const SECTIONS = [
  ['key', 'Exam details'],
  ['before', 'Before the exam'],
  ['instructions', 'Exam instructions'],
  ['after', 'After the exam'],
  ['help', 'Need help?'],
];

function Block({ id, num, icon: Icon, title, children, tone = '' }) {
  return (
    <Reveal>
      <section id={id} className={`ins-block ${tone}`}>
        <div className="ins-head">
          <span className="ins-icon"><Icon size={22} /></span>
          <div>
            <span className="ins-num">Step {num}</span>
            <h3>{title}</h3>
          </div>
        </div>
        {children}
      </section>
    </Reveal>
  );
}

function Steps({ items }) {
  return (
    <ol className="ins-list">
      {items.map((item, i) => (
        <li key={i}>
          <span className="ins-li-num">{i + 1}</span>
          <div>{item}</div>
        </li>
      ))}
    </ol>
  );
}

export default function Instructions() {
  const navigate = useNavigate();
  const [savedData, setSavedData] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('registrationData');

      if (!raw) {
        navigate('/register', { replace: true });
        return;
      }

      const data = JSON.parse(raw);

      if (!data?.registration || !data?.exam) {
        navigate('/register', { replace: true });
        return;
      }

      setSavedData(data);
    } catch {
      localStorage.removeItem('registrationData');
      navigate('/register', { replace: true });
    }
  }, [navigate]);

  if (!savedData) {
    return (
      <>
        <Header />
        <section className="section">
          <div className="container">
            <p>Loading exam instructions...</p>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const { registration, exam } = savedData;
  const examInstructions = Array.isArray(exam.instructions)
    ? exam.instructions
    : [];

  return (
    <>
      <Header />

      <section className="page-hero dark">
        <div className="hero-grid-bg" />
        <div className="container">
          <span className="crumbs">
            <Link to="/">Home</Link> / Exam Instructions
          </span>

          <h1>Instructions for Students</h1>
          <p>
            Welcome, {registration.fullName}. Please read the
            instructions for your assigned assessment carefully.
          </p>

          <div className="quick-tips">
            <span><BatteryCharging size={16} /> Device charged</span>
            <span><Wifi size={16} /> Working internet</span>
            <span><IdCard size={16} /> Student ID ready</span>
            <span><BellOff size={16} /> Notifications off</span>
          </div>
        </div>
      </section>

      <section className="section ins-section">
        <div className="container ins-layout">

          <aside className="ins-nav">
            <span className="ins-nav-title">On this page</span>

            {SECTIONS.map(([id, label], i) => (
              <a key={id} href={`#${id}`}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                {label}
              </a>
            ))}

            <Link
              to="/register"
              className="btn btn-primary btn-sm btn-block"
            >
              Back to registration
            </Link>
          </aside>

          <div className="ins-content">

            {/* Actual exam details from the backend */}
            <Block
              id="key"
              num="01"
              icon={BookOpen}
              title="Your exam details"
            >
              <div className="key-grid">
                <div className="key-card orange">
                  <div className="key-top">
                    <Brain size={20} />
                    Assessment
                  </div>

                  <h3>{exam.title || 'Untitled assessment'}</h3>

                  <p>
                    {exam.description ||
                      'No exam description is available.'}
                  </p>

                  <ul>
                    <li>
                      <Clock size={16} />
                      Duration: {exam.durationMinutes ?? '—'} minutes
                    </li>
                    <li>
                      <ClipboardList size={16} />
                      Total marks: {exam.totalMarks ?? '—'}
                    </li>
                    <li>
                      <CheckCircle2 size={16} />
                      Passing marks: {exam.passingMarks ?? '—'}
                    </li>
                    {exam.publishedAt && (
                      <li>
                        <CalendarDays size={16} />
                        Published:{' '}
                        {new Date(exam.publishedAt).toLocaleDateString(
                          'en-IN',
                          {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </li>
                    )}
                  </ul>
                </div>

                <div className="key-card purple">
                  <div className="key-top">
                    <GraduationCap size={20} />
                    Student details
                  </div>

                  <ul>
                    <li>
                      <IdCard size={16} />
                      Student ID: {registration.studentId || '—'}
                    </li>
                    <li>
                      <BookOpen size={16} />
                      Name: {registration.fullName || '—'}
                    </li>
                    <li>
                      <ClipboardList size={16} />
                      Email: {registration.email || '—'}
                    </li>
                    <li>
                      <Smartphone size={16} />
                      Mobile: {registration.mobileNumber || '—'}
                    </li>
                    <li>
                      <CheckCircle2 size={16} />
                      Status: {registration.registrationStatus || 'Registered'}
                    </li>
                  </ul>
                </div>
              </div>
            </Block>

            <Block
              id="before"
              num="02"
              icon={ClipboardList}
              title="Before the exam"
            >
              <Steps
                items={[
                  'Read all the exam instructions before starting.',
                  'Make sure your device is charged and your internet connection is stable.',
                  'Keep your registered email address and mobile number available.',
                  'Find a quiet place where you can complete the assessment without interruptions.',
                  'Do not refresh or close the exam page while an exam is in progress unless instructed to do so.',
                ]}
              />
            </Block>

            <Block
              id="instructions"
              num="03"
              icon={MonitorCheck}
              title="Exam instructions"
              tone="tone-orange"
            >
              {examInstructions.length > 0 ? (
                <Steps items={examInstructions} />
              ) : (
                <p>
                  No additional exam instructions were provided by the
                  server. Please follow the instructions shown when you
                  begin the assessment.
                </p>
              )}

              <ul className="ins-bullets">
                <li>
                  <BellOff size={18} />
                  Avoid notifications, calls, and other applications
                  during the assessment.
                </li>
                <li>
                  <Wifi size={18} />
                  Maintain a stable internet connection.
                </li>
                <li>
                  <Flag size={18} />
                  Submit your answers before the exam timer expires.
                </li>
              </ul>
            </Block>

            <Block
              id="after"
              num="04"
              icon={Flag}
              title="After the exam"
            >
              <ul className="ins-bullets">
                <li>
                  <CheckCircle2 size={18} />
                  Make sure you complete the submission process.
                </li>
                <li>
                  <MessageSquareOff size={18} />
                  Do not share exam questions or answers with others.
                </li>
                <li>
                  <BarChart3 size={18} />
                  Your results will be handled according to the
                  assessment programme's process.
                </li>
              </ul>
            </Block>

            <Reveal>
              <section id="help" className="ins-help">
                <div className="help-icon big">
                  <Headphones size={26} />
                </div>

                <div>
                  <h3>Need help?</h3>
                  <p>
                    If you experience a technical problem, contact your
                    assessment coordinator.
                  </p>
                  <p className="small">
                    <Hand size={15} />
                    Follow the instructions provided by your coordinator.
                  </p>
                </div>
              </section>
            </Reveal>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

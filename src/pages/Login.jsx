import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, ArrowRight, ArrowLeft, Loader2, AlertTriangle, ShieldCheck,
  KeyRound, Check, CalendarDays, MapPin, BadgeIndianRupee, UserCheck,
} from 'lucide-react';
import { Header } from '../components/Layout';
import apiService from '../api/apiService';
import { API_CONFIG } from '../api/apiConfig';
import { setSession } from '../session';
import { Stepper } from './Register';

const OTP_TTL_SECONDS = 5 * 60;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatTime(sec) {
  const safe = Math.max(0, Math.floor(sec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/* Parse the real verify-otp response:                                */
/*   { message, registrations: [ { registration, exam, nextStep } ] } */
/* Pick the best entry, normalize it into the Register session shape. */
/* ------------------------------------------------------------------ */
function persistSessionFromOtp(raw, email) {
  // unwrap common envelopes
  const payload = raw?.data || raw || {};

  // The verify-otp endpoint returns an array under `registrations`.
  // Fall back to a single-object shape for safety.
  let entries = [];
  if (Array.isArray(payload.registrations)) {
    entries = payload.registrations;
  } else if (payload.registration) {
    entries = [payload]; // single-registration shape
  }

  if (!entries.length) {
    throw new Error(
      'No registrations found for this email. Please register first.'
    );
  }

  // Choose the entry that's ready to start an exam. Prefer one whose
  // nextStep tells us to show instructions; otherwise the first entry
  // that carries an exam at all.
  const withExam = entries.filter((e) => e?.exam?.id || e?.exam?._id);
  const ready =
    withExam.find((e) => e.nextStep === 'show_exam_instructions') ||
    withExam[0] ||
    null;

  if (!ready) {
    throw new Error(
      'You are registered but no exam is assigned yet. Please contact support.'
    );
  }

  const reg = ready.registration || {};
  const exam = ready.exam || {};

  const registrationId = reg.id || reg._id || null;
  const studentCode = reg.studentId || null; // e.g. "STU0013" (string code)
  const domainId = reg.domainId || null;
  const examId = exam.id || exam._id || null;

  if (!registrationId || !domainId || !examId) {
    throw new Error(
      'Login response is missing registration, domain or exam details.'
    );
  }

  const mergedRegistration = {
    ...reg,
    id: registrationId,
    domainId,
  };

  /* ---- persist session (same shape Register uses) ---- */
  setSession({
    registration: mergedRegistration,
    student: mergedRegistration,
    // NOTE: `studentId` here is the human-readable code ("STU0013"),
    // not a Mongo _id. Downstream pages only need it for the guard
    // `if (!session.studentId) redirect` — which is satisfied.
    studentId: studentCode,
    domainId,
    exam,
    examId,
    email: reg.email || email,
    nextStep: ready.nextStep,
    submitted: false,
    loggedIn: true,
  });

  /* ---- same localStorage key Register writes ---- */
  try {
    localStorage.setItem(
      'registrationData',
      JSON.stringify({
        registration: mergedRegistration,
        exam,
      })
    );
  } catch {
    /* ignore quota errors */
  }

  return {
    hasExam: true,
    nextStep: ready.nextStep,
    extraRegistrations: entries.length - 1,
  };
}

export default function Login() {
  const navigate = useNavigate();

  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [redirectTo, setRedirectTo] = useState('/exam/instructions');

  const otpRef = useRef(null);
  const timerRef = useRef(null);

  /* -------- OTP countdown -------- */
  useEffect(() => {
    if (step !== 'otp') return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [step]);

  useEffect(() => {
    if (step === 'otp') otpRef.current?.focus();
  }, [step]);

  const otpExpired = step === 'otp' && secondsLeft <= 0;

  /* ================================================================ */
  /* STEP 1 — REQUEST OTP                                              */
  /* ================================================================ */
  async function handleRequestOtp(e) {
    e?.preventDefault?.();
    setError('');
    setNotice('');

    const clean = email.trim().toLowerCase();
    if (!clean) return setError('Please enter your email address.');
    if (!EMAIL_RE.test(clean)) return setError('Please enter a valid email address.');

    setLoading(true);
    try {
      const res = await apiService.post(API_CONFIG.USERS.LOGIN, { email: clean });
      const message =
        res?.message ||
        res?.data?.message ||
        'OTP sent successfully. Please check your inbox.';

      setNotice(message);
      setEmail(clean);
      setOtp('');
      setSecondsLeft(OTP_TTL_SECONDS);
      setStep('otp');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Could not send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  /* ================================================================ */
  /* STEP 2 — VERIFY OTP                                               */
  /* ================================================================ */
  async function handleVerifyOtp(e) {
    e?.preventDefault?.();
    setError('');

    if (!/^\d{6}$/.test(otp)) return setError('OTP must be exactly 6 digits.');
    if (otpExpired) return setError('OTP has expired. Please request a new one.');

    setLoading(true);
    try {
      const res = await apiService.post(API_CONFIG.USERS.VARIFYOTP, {
        email,
        otp,
      });

      const { nextStep } = persistSessionFromOtp(res, email);

      // Decide destination based on nextStep from backend.
      const target =
        nextStep === 'show_exam_instructions'
          ? '/exam/instructions'
          : '/exam/instructions'; // safe default — Exam page will guard

      setRedirectTo(target);
      setStep('success');
      setNotice('Login successful. Redirecting…');

      setTimeout(() => {
        navigate(target, { replace: true });
      }, 900);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Invalid or expired OTP. Please try again.'
      );
      setLoading(false);
    }
  }

  /* ================================================================ */
  /* RESEND                                                            */
  /* ================================================================ */
  async function handleResend() {
    setError('');
    setLoading(true);
    try {
      await apiService.post(API_CONFIG.USERS.LOGIN, { email });
      setOtp('');
      setSecondsLeft(OTP_TTL_SECONDS);
      setNotice('A new OTP has been sent to your email.');
      otpRef.current?.focus();
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || 'Could not resend OTP.'
      );
    } finally {
      setLoading(false);
    }
  }

  /* digits-only, cap at 6 */
  function handleOtpChange(value) {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
    setError('');
  }

  /* Reusable field wrapper — matches Register's `field()` helper */
  const field = (name, label, Icon, input, full = false, hint = null) => (
    <label className={`field ${error && step === name ? 'has-error' : ''} ${full ? 'full' : ''}`}>
      <span className="field-label">{label}</span>
      <span className="field-control">
        <Icon size={18} className="field-icon" />
        {input}
      </span>
      {hint}
    </label>
  );

  return (
    <div className="reg-page">
      <Header minimal />
      <div className="container reg-layout">
        {/* ------------- LEFT ASIDE (mirrors Register) ------------- */}
        <aside className="reg-aside">
          <div className="hero-grid-bg" />
          <div className="reg-aside-inner">
            <Link to="/" className="back-link">
              <ArrowLeft size={16} /> Back to home
            </Link>
            <span className="eyebrow on-dark">Student Portal</span>
            <h1>Welcome back</h1>
            <p>Sign in with your registered email to resume your assessment.</p>

            <ul className="reg-facts">
              <li><CalendarDays size={18} /> 2, 3 &amp; 4 November 2026</li>
              <li><MapPin size={18} /> Ashoka Institute, Varanasi</li>
              <li><BadgeIndianRupee size={18} /> Free of charge</li>
            </ul>

            <div className="reg-next">
              <span className="reg-next-title">How login works</span>
              {['Enter your email', 'Verify the 6-digit OTP', 'Resume your exam'].map(
                (s, i) => {
                  const active =
                    (step === 'email' && i === 0) ||
                    (step === 'otp' && i === 1) ||
                    (step === 'success' && i === 2);
                  const done =
                    (step === 'otp' && i === 0) ||
                    (step === 'success' && i <= 1);
                  return (
                    <div
                      key={s}
                      className={`reg-next-step ${active ? 'active' : ''}`}
                    >
                      <span>{done ? <Check size={12} strokeWidth={3} /> : i + 1}</span> {s}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </aside>

        {/* ------------- RIGHT MAIN (mirrors Register) ------------- */}
        <main className="reg-main">
          <Stepper current={0} />

          <form
            className="reg-form"
            onSubmit={step === 'email' ? handleRequestOtp : handleVerifyOtp}
            noValidate
          >
            {/* ---------- STEP 1: EMAIL ---------- */}
            {step === 'email' && (
              <div className="form-section">
                <h3><span className="fs-num">1</span> Sign in with email</h3>
                <p className="form-section-sub">
                  Enter the email you registered with. We’ll send you a 6-digit OTP.
                </p>

                <div className="form-grid">
                  {field(
                    'email',
                    'Email address',
                    Mail,
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      autoFocus
                      disabled={loading}
                    />,
                    true
                  )}
                </div>

                {error && (
                  <div className="alert">
                    <AlertTriangle size={16} /> {error}
                  </div>
                )}

                <div className="form-actions">
                  <span className="muted small">
                    New here? <Link to="/register">Register instead</Link>
                  </span>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-glow"
                    disabled={loading || !email.trim()}
                  >
                    {loading ? (
                      <><Loader2 size={18} className="spin" /> Sending OTP…</>
                    ) : (
                      <>Send OTP <ArrowRight size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ---------- STEP 2: OTP ---------- */}
            {step === 'otp' && (
              <div className="form-section">
                <h3><span className="fs-num">2</span> Verify your email</h3>
                <p className="form-section-sub">
                  We sent a 6-digit code to <strong>{email}</strong>.
                </p>

                {notice && (
                  <div className="alert">
                    <ShieldCheck size={16} /> {notice}
                  </div>
                )}

                <div className="form-grid">
                  {field(
                    'otp',
                    'Enter 6-digit OTP',
                    KeyRound,
                    <input
                      ref={otpRef}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => handleOtpChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleVerifyOtp(e);
                      }}
                      className="otp-input"
                      disabled={loading || otpExpired}
                    />,
                    true,
                    <small className={`otp-timer ${otpExpired ? 'expired' : ''}`}>
                      {otpExpired
                        ? 'OTP expired — please resend.'
                        : `Expires in ${formatTime(secondsLeft)}`}
                    </small>
                  )}
                </div>

                {error && (
                  <div className="alert">
                    <AlertTriangle size={16} /> {error}
                  </div>
                )}

                <div className="otp-actions">
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                      setError('');
                      setNotice('');
                      setSecondsLeft(0);
                    }}
                    disabled={loading}
                  >
                    <ArrowLeft size={14} /> Change email
                  </button>

                  <button
                    type="button"
                    className="btn-link"
                    onClick={handleResend}
                    disabled={loading || secondsLeft > OTP_TTL_SECONDS - 30}
                  >
                    Resend OTP
                    {secondsLeft > OTP_TTL_SECONDS - 30 && (
                      <> ({formatTime(secondsLeft)} left)</>
                    )}
                  </button>
                </div>

                <div className="form-actions">
                  <span className="muted small">Check your spam folder if it doesn’t arrive.</span>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-glow"
                    disabled={loading || otp.length !== 6 || otpExpired}
                  >
                    {loading ? (
                      <><Loader2 size={18} className="spin" /> Verifying…</>
                    ) : (
                      <>Verify &amp; continue <ArrowRight size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ---------- STEP 3: SUCCESS ---------- */}
            {step === 'success' && (
              <div className="form-section success-panel">
                <div className="success-icon">
                  <UserCheck size={36} />
                </div>
                <h3><span className="fs-num"><Check size={14} strokeWidth={3} /></span> You’re signed in</h3>
                <p className="form-section-sub">
                  Redirecting you to your exam…
                </p>
                <div className="form-actions" style={{ justifyContent: 'center' }}>
                  <Loader2 size={20} className="spin" />
                </div>
              </div>
            )}
          </form>
        </main>
      </div>
    </div>
  );
}
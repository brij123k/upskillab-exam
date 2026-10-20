import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Check, ArrowUpRight, BarChart3, CalendarDays } from 'lucide-react';
import { Logos } from '../components/Layout';
import { getSession, clearSession } from '../session';
import { REDIRECT_DELAY, UPSKILLAB_URL } from '../config';

function goToUpskillab() {
  clearSession();
  window.location.replace(UPSKILLAB_URL);
}

export default function ThankYou() {
  const session = getSession();
  const [seconds, setSeconds] = useState(REDIRECT_DELAY);

  const confetti = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 2.5,
        dur: 3 + Math.random() * 3,
        color: ['#ff7426', '#4d2c5e', '#ffb38a', '#9b6bb5', '#ffd166'][i % 5],
        size: 6 + Math.random() * 8,
        rot: Math.random() * 360,
      })),
    []
  );

  useEffect(() => {
    if (!session.submitted) return;
    if (seconds <= 0) {
      goToUpskillab();
      return;
    }
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds, session.submitted]);

  if (!session.submitted) return <Navigate to="/" replace />;

  const firstName = session.student?.fullName?.split(' ')[0] || 'there';
  const R = 16;
  const C = 2 * Math.PI * R;

  return (
    <div className="thanks-page">
      <div className="confetti" aria-hidden="true">
        {confetti.map((c, i) => (
          <i
            key={i}
            style={{
              left: `${c.left}%`,
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.dur}s`,
              background: c.color,
              width: c.size,
              height: c.size * 0.45,
              transform: `rotate(${c.rot}deg)`,
            }}
          />
        ))}
      </div>

      <div className="thanks">
        <Logos />
        <div className="check-wrap">
          <div className="check-ring" />
          <div className="check"><Check size={46} strokeWidth={3} /></div>
        </div>
        <h1>Thank you, {firstName}!</h1>
        <p className="thanks-lead">Your responses have been submitted successfully.</p>

        <div className="thanks-info">
          <div>
            <BarChart3 size={20} />
            <span>Upskillab will analyse the outcomes and share a detailed analysis with the college.</span>
          </div>
          <div>
            <CalendarDays size={20} />
            <span>Expected by the <strong>end of November 2026</strong> to guide academic counselling.</span>
          </div>
        </div>

        <div className="redirect-row">
          <svg width="40" height="40" viewBox="0 0 40 40" className="redirect-ring">
            <circle cx="20" cy="20" r={R} className="ring-bg" />
            <circle
              cx="20" cy="20" r={R} className="ring-fg"
              strokeDasharray={C} strokeDashoffset={C * (1 - seconds / REDIRECT_DELAY)}
            />
            <text x="20" y="25" textAnchor="middle">{seconds}</text>
          </svg>
          <span>Redirecting you to the Upskillab website…</span>
        </div>

        <button className="btn btn-primary btn-lg btn-glow" onClick={goToUpskillab}>
          Visit Upskillab now <ArrowUpRight size={18} />
        </button>
      </div>
    </div>
  );
}

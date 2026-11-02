import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Logos } from '../components/Layout';
import { getSession, clearSession } from '../session';
import { UPSKILLAB_URL } from '../config';

function goToUpskillab() {
  clearSession();
  window.location.replace(UPSKILLAB_URL);
}

export default function ThankYou() {
  const session = getSession();

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

  if (!session.submitted) return <Navigate to="/" replace />;

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
        <h1>Thank you! Your test has been submitted.</h1>
        <p className="thanks-lead">Your responses have been recorded successfully.</p>
        <p className="thanks-text">
          Our team will review your assessment, and your results will be shared through the official
          channel. Please do not refresh this page or try to restart the test.
        </p>
        <p className="thanks-text">
          We appreciate your time and effort, and wish you all the best for your journey ahead!
        </p>
        <p className="thanks-sign">– Team Upskillab</p>

        <button className="btn btn-primary btn-lg btn-glow" onClick={goToUpskillab}>
          Close
        </button>
      </div>
    </div>
  );
}

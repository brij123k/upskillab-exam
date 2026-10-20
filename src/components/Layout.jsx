import { Link, NavLink } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Menu, X, Mail, Phone, MapPin, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { UPSKILLAB_URL } from '../config';

// Highlights text that is still pending confirmation from Upskillab.
export function Pending({ children }) {
  return <span className="pending" title="Pending confirmation">{children}</span>;
}

// The full logo has white text, so it's only used on dark backgrounds; light backgrounds get the emblem.
export function AshokaMark({ light = false, compact = false }) {
  if (light) {
    return <img src="/ashoka-logo-full.webp" alt="Ashoka Institute of Technology & Management, Varanasi" className="ashoka-full" />;
  }
  return (
    <span className="ashoka-mark">
      <img src="/ashoka-logo.png" alt="Ashoka Varanasi" className="ashoka-emblem" />
      {!compact && (
        <span className="ashoka-text">
          <strong>Ashoka Institute</strong>
          <small>of Technology &amp; Management, Varanasi</small>
        </span>
      )}
    </span>
  );
}

export function Logos({ compact = false, light = false }) {
  return (
    <div className={`logos ${compact ? 'logos-compact' : ''}`}>
      <span className={`logo-chip ${light ? 'on-dark' : ''}`}>
        <img src="/upskillab-logo.png" alt="Upskillab" className="logo-img" />
      </span>
      <AshokaMark light={light} compact={compact} />
    </div>
  );
}

export function Header({ minimal = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    ['/#about', 'About'],
    ['/#phases', 'Phases'],
    ['/#how', 'How it works'],
    ['/#faqs', 'FAQs'],
  ];

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <Link to="/" aria-label="Home" onClick={() => setOpen(false)}>
          <Logos compact />
        </Link>
        {!minimal && (
          <>
            <nav className={`nav ${open ? 'open' : ''}`}>
              {links.map(([to, label]) => (
                <Link key={to} to={to} onClick={() => setOpen(false)}>{label}</Link>
              ))}
              <NavLink to="/instructions" onClick={() => setOpen(false)}>Instructions</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm nav-cta" onClick={() => setOpen(false)}>
                Register Now
              </Link>
            </nav>
            <button className="menu-btn" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </>
        )}
        {minimal && (
          <span className="secure-tag"><ShieldCheck size={16} /> Secure registration</span>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-glow" />
      <div className="container footer-inner">
        <div className="footer-brand">
          <Logos light />
          <p>
            Conducted by Upskillab in association with Ashoka Institute of Technology &amp; Management,
            Varanasi. Part of the Student Success Roadmap.
          </p>
          <div className="footer-badges">
            <span>ISO 9001:2015</span>
            <span>MSME Recognised</span>
          </div>
        </div>
        <div className="footer-col">
          <h4>Programme</h4>
          <Link to="/#phases">Phase 1: Psychometric Test</Link>
          <Link to="/#phases">Phase 2: Academic Analysis</Link>
          <Link to="/instructions">Instructions for Students</Link>
          <Link to="/register">Register</Link>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <span className="footer-line"><Phone size={15} /> Helpline: <Pending>Student helpline details</Pending></span>
          <a className="footer-line" href="mailto:info@upskillab.com"><Mail size={15} /> info@upskillab.com</a>
          <span className="footer-line"><MapPin size={15} /> Ashoka Institute, Varanasi</span>
          <a className="footer-line" href={UPSKILLAB_URL} target="_blank" rel="noreferrer">
            upskillab.com <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Upskillab.com. All rights reserved.</span>
        <span>Privacy: <Pending>Link to privacy statement</Pending></span>
      </div>
    </footer>
  );
}

// Fades/slides children in when they scroll into view.
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal ${shown ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

export function Countdown({ to }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const parts = [
    ['Days', Math.floor(diff / 86400000)],
    ['Hours', Math.floor(diff / 3600000) % 24],
    ['Mins', Math.floor(diff / 60000) % 60],
    ['Secs', Math.floor(diff / 1000) % 60],
  ];
  return (
    <div className="countdown">
      {parts.map(([label, v]) => (
        <div key={label} className="cd-unit">
          <strong>{String(v).padStart(2, '0')}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

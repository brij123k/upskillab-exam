import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowRight, BookOpenText, CalendarDays, MapPin, Smartphone, MonitorCheck, Users, Clock,
  Target, Compass, HeartHandshake, Rocket, BadgeIndianRupee, Sparkles, ClipboardPen,
  BarChart3, CheckCircle2, Plus, Headphones, Award, Building2, GraduationCap, Brain,
} from 'lucide-react';
import { Header, Footer, Pending, Reveal, Countdown } from '../components/Layout';

const EVENT_START = '2026-11-02T09:00:00+05:30';

const PHASES = [
  {
    tag: 'Phase 1',
    title: 'Psychometric Test',
    date: '2 November 2026',
    icon: Brain,
    theme: 'orange',
    rows: [
      [Users, 'Who', 'All students of Ashoka Institute'],
      [MapPin, 'Where', 'Auditorium'],
      [Smartphone, 'How', 'Online, on your own smartphone via a link'],
      [Clock, 'Duration', <Pending key="d">Test duration</Pending>],
    ],
    purpose: 'To understand your strengths and potential, supporting academic counselling and your well-being.',
  },
  {
    tag: 'Phase 2',
    title: 'Academic Analysis',
    date: '3 & 4 November 2026',
    icon: BarChart3,
    theme: 'purple',
    rows: [
      [GraduationCap, 'Who', 'Final-year technical and non-technical students'],
      [MonitorCheck, 'Where', 'Computer labs'],
      [Clock, 'Duration', <Pending key="d">Duration of the session</Pending>],
    ],
    purpose: 'A structured review of your academic profile to identify strengths, gaps and readiness for industry roles.',
  },
];

const WHY = [
  [Compass, 'Know yourself better', 'Gain a clearer understanding of your strengths and potential.'],
  [Target, 'Guidance that fits you', 'Insights that support personalised academic counselling.'],
  [HeartHandshake, 'Your well-being matters', 'This initiative supports your well-being alongside your academic journey.'],
  [Rocket, 'A pathway to industry', 'The first step of a roadmap that leads towards career counselling and industry readiness.'],
];

const STEPS = [
  [ClipboardPen, 'Before the event', 'Register online', <>Fill in the registration form on this page before <Pending>registration deadline</Pending>.</>],
  [Smartphone, '2 Nov 2026', 'Phase 1', 'Take the psychometric test in the auditorium, on your smartphone.'],
  [MonitorCheck, '3 & 4 Nov 2026', 'Phase 2', 'Final-year students complete the academic analysis in the computer labs.'],
  [BarChart3, 'By end of Nov 2026', 'After the event', 'Outcomes are analysed by Upskillab, and a detailed analysis is shared with the college to guide academic counselling.'],
];

const ROADMAP = [
  ['Self-discovery', 'Psychometric test'],
  ['Academic analysis', 'Strengths & gaps'],
  ['Personalised counselling', 'Guidance that fits you'],
  ['Industry readiness', 'Career pathway'],
];

const FAQS = [
  ['Who is conducting this programme?', 'Upskillab, an ISO 9001:2015 certified, MSME-recognised skills training organisation, in association with Ashoka Institute of Technology & Management, Varanasi.'],
  ['Is there any fee?', 'No. Phase 1 and Phase 2 are offered free of charge to the students of Ashoka Institute.'],
  ['Who can take part?', 'Phase 1 is open to all students of the college. Phase 2 is for final-year technical and non-technical students.'],
  ['What is a psychometric test?', 'A psychometric test is a structured assessment that helps understand a person’s strengths and potential. There are no right or wrong answers, so you simply need to answer honestly.'],
  ['How long will the test take?', <Pending key="1">Test duration</Pending>],
  ['Who will see my results?', <Pending key="2">Confirm who has access to individual results and how they are shared with students.</Pending>],
  ['Will this affect my marks?', <Pending key="3">Confirm the answer.</Pending>],
  ['Whom do I contact for help?', <Pending key="4">Helpline phone / email / WhatsApp, with timings</Pending>],
];

const MARQUEE = [
  'Free for Ashoka students', 'ISO 9001:2015 certified', 'MSME recognised', 'On-campus programme',
  'Psychometric test', 'Academic analysis', 'Personalised counselling', 'Industry readiness',
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      <Header />

      {/* 01 HERO */}
      <section className="hero">
        <div className="hero-grid-bg" />
        <div className="hero-blob blob-1" />
        <div className="hero-blob blob-2" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkles size={15} /> Upskillab × Ashoka Institute of Technology &amp; Management, Varanasi
            </span>
            <h1>
              Discover Your <span className="grad-text">Strengths.</span>
              <br />
              Shape Your <span className="grad-text underline">Future.</span>
            </h1>
            <p className="lead">
              A psychometric test and academic analysis, held on campus exclusively for the students
              of Ashoka Institute, <strong>at no cost to you.</strong>
            </p>
            <div className="hero-badges">
              <span><CalendarDays size={17} /> 2, 3 &amp; 4 November 2026</span>
              <span><MapPin size={17} /> Ashoka Institute, Varanasi</span>
            </div>
            <div className="btn-row">
              <Link to="/register" className="btn btn-primary btn-lg btn-glow">
                Register Now <ArrowRight size={18} />
              </Link>
              <Link to="/instructions" className="btn btn-ghost btn-lg">
                <BookOpenText size={18} /> View Instructions
              </Link>
            </div>
            <div className="hero-trust">
              <span><Award size={16} /> ISO 9001:2015</span>
              <span><Building2 size={16} /> MSME recognised</span>
              <span><BadgeIndianRupee size={16} /> 100% free</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="glass-card main-card">
              <div className="mc-head">
                <span className="live-dot" /> Phase 1 begins in
              </div>
              <Countdown to={EVENT_START} />
              <div className="mc-divider" />
              <div className="mc-phase">
                <div className="mc-icon orange"><Brain size={20} /></div>
                <div>
                  <strong>Psychometric Test</strong>
                  <span>2 Nov · Auditorium · Smartphone</span>
                </div>
              </div>
              <div className="mc-phase">
                <div className="mc-icon purple"><BarChart3 size={20} /></div>
                <div>
                  <strong>Academic Analysis</strong>
                  <span>3–4 Nov · Computer labs · Final year</span>
                </div>
              </div>
            </div>
            <div className="float-card fc-1">
              <CheckCircle2 size={18} /> No right or wrong answers
            </div>
            <div className="float-card fc-2">
              <span className="fc-big">₹0</span>
              <span>Cost to you</span>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i}><Sparkles size={14} /> {m}</span>
          ))}
        </div>
      </div>

      {/* 02 ABOUT */}
      <section id="about" className="section">
        <div className="container about-grid">
          <Reveal>
            <span className="section-tag">About the initiative</span>
            <h2>The Student <span className="grad-text">Success Roadmap</span></h2>
            <p className="body-lg">
              The Student Success Roadmap is a structured, data-driven pathway that takes every Ashoka
              student from self-discovery to industry readiness.
            </p>
            <p className="muted">
              It begins on campus with two phases, led by Upskillab’s team of experts, designed to help
              you understand your strengths, receive guidance that fits you, and prepare for a
              successful career.
            </p>
            <Link to="/register" className="link-arrow">
              Start your roadmap <ArrowRight size={16} />
            </Link>
          </Reveal>
          <Reveal delay={150}>
            <div className="roadmap">
              {ROADMAP.map(([title, sub], i) => (
                <div key={title} className={`rm-step ${i < 2 ? 'now' : ''}`}>
                  <span className="rm-dot">{i + 1}</span>
                  <div className="rm-body">
                    <strong>{title}</strong>
                    <span>{sub}</span>
                  </div>
                  {i < 2 && <span className="rm-tag">On campus</span>}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 03 PHASES */}
      <section id="phases" className="section section-cream">
        <div className="container">
          <Reveal className="section-head">
            <span className="section-tag">Two phases, one purpose</span>
            <h2>How the programme is structured</h2>
            <p className="muted">Two focused sessions on campus, each designed around a clear goal.</p>
          </Reveal>
          <div className="phase-grid">
            {PHASES.map((p, idx) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.tag} delay={idx * 120}>
                  <article className={`phase-card ${p.theme}`}>
                    <div className="phase-head">
                      <div className="phase-icon"><Icon size={28} /></div>
                      <div>
                        <span className="phase-tag">{p.tag}</span>
                        <h3>{p.title}</h3>
                      </div>
                      <span className="phase-date"><CalendarDays size={15} /> {p.date}</span>
                    </div>
                    <div className="phase-body">
                      <ul className="phase-rows">
                        {p.rows.map(([RowIcon, k, v]) => (
                          <li key={k}>
                            <span className="row-icon"><RowIcon size={18} /></span>
                            <div>
                              <small>{k}</small>
                              <span>{v}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <div className="phase-purpose">
                        <Target size={18} />
                        <p><strong>Purpose: </strong>{p.purpose}</p>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 04 WHY */}
      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <span className="section-tag">Why participate</span>
            <h2>What’s in it for you</h2>
          </Reveal>
          <div className="bento">
            {WHY.map(([Icon, title, text], i) => (
              <Reveal key={title} delay={i * 80} className={`bento-item ${i === 0 ? 'bento-feature' : ''}`}>
                <div className="why-icon"><Icon size={24} /></div>
                <h4>{title}</h4>
                <p>{text}</p>
              </Reveal>
            ))}
            <Reveal delay={320} className="bento-item bento-free">
              <div>
                <span className="free-big">₹0</span>
                <h4>No cost to you</h4>
                <p>Both phases are offered free of charge to the students of Ashoka Institute.</p>
              </div>
              <BadgeIndianRupee size={90} className="free-icon" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 05 HOW IT WORKS */}
      <section id="how" className="section section-dark">
        <div className="dark-glow" />
        <div className="container">
          <Reveal className="section-head light">
            <span className="section-tag">How it works</span>
            <h2>From registration to results</h2>
            <p>Four simple steps. Here’s what to expect.</p>
          </Reveal>
          <ol className="timeline">
            {STEPS.map(([Icon, when, title, text], i) => (
              <Reveal as="li" key={title} delay={i * 120}>
                <div className="tl-icon"><Icon size={24} /><span>{i + 1}</span></div>
                <span className="tl-when">{when}</span>
                <h4>{title}</h4>
                <p>{text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 06 REGISTRATION CTA */}
      <section id="register" className="section">
        <div className="container">
          <Reveal className="cta-box">
            <div className="cta-pattern" />
            <div className="cta-copy">
              <span className="section-tag light">Registration open</span>
              <h2>Register for the Programme</h2>
              <p>
                It takes about 2 minutes. Register with your details, read the instructions, and you’re
                ready for the test.
              </p>
              <ul className="cta-points">
                <li><CheckCircle2 size={17} /> Free for all Ashoka students</li>
                <li><CheckCircle2 size={17} /> Just your smartphone for Phase 1</li>
                <li><CheckCircle2 size={17} /> Personalised academic counselling</li>
              </ul>
            </div>
            <div className="cta-side">
              <Link to="/register" className="btn btn-primary btn-xl btn-glow">
                Complete Registration <ArrowRight size={20} />
              </Link>
              <span className="cta-note">
                Deadline: <Pending>registration deadline</Pending>
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 07 FAQS */}
      <section id="faqs" className="section section-cream">
        <div className="container faq-grid">
          <Reveal className="faq-intro">
            <span className="section-tag">FAQs</span>
            <h2>Frequently Asked Questions</h2>
            <p className="muted">Everything you need to know before the event.</p>
            <div className="help-box">
              <div className="help-icon"><Headphones size={22} /></div>
              <div>
                <strong>Still have questions?</strong>
                <span>Helpline: <Pending>phone / email / WhatsApp</Pending></span>
              </div>
            </div>
          </Reveal>
          <div className="faq-list">
            {FAQS.map(([q, a], i) => {
              const open = openFaq === i;
              return (
                <div key={q} className={`faq ${open ? 'open' : ''}`}>
                  <button className="faq-q" aria-expanded={open} onClick={() => setOpenFaq(open ? -1 : i)}>
                    <span>{q}</span>
                    <span className="faq-icon"><Plus size={18} /></span>
                  </button>
                  <div className="faq-a-wrap">
                    <div className="faq-a">{a}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

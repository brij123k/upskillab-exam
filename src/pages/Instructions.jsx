import { Link } from 'react-router-dom';
import {
  ArrowRight, CalendarDays, MapPin, Smartphone, MonitorCheck, ClipboardList, Brain, BarChart3,
  Flag, Headphones, BatteryCharging, Wifi, IdCard, BellOff, MessageSquareOff, Hand, Clock,
} from 'lucide-react';
import { Header, Footer, Pending, Reveal } from '../components/Layout';

const SECTIONS = [
  ['key', 'Key details'],
  ['before', 'Before the event'],
  ['phase1', 'Phase 1: Psychometric Test'],
  ['phase2', 'Phase 2: Academic Analysis'],
  ['after', 'After the event'],
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
  return (
    <>
      <Header />
      <section className="page-hero dark">
        <div className="hero-grid-bg" />
        <div className="container">
          <span className="crumbs"><Link to="/">Home</Link> / Instructions</span>
          <h1>Instructions for Students</h1>
          <p>Please read these instructions carefully before the event.</p>
          <div className="quick-tips">
            <span><BatteryCharging size={16} /> Phone fully charged</span>
            <span><Wifi size={16} /> Working internet</span>
            <span><IdCard size={16} /> Carry your ID</span>
            <span><BellOff size={16} /> Phone on silent</span>
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
            <Link to="/register" className="btn btn-primary btn-sm btn-block">Register Now</Link>
          </aside>

          <div className="ins-content">
            <Block id="key" num="01" icon={CalendarDays} title="Key details">
              <div className="key-grid">
                <div className="key-card orange">
                  <div className="key-top"><Brain size={20} /> Phase 1: Psychometric Test</div>
                  <ul>
                    <li><CalendarDays size={16} /> 2 November 2026</li>
                    <li><MapPin size={16} /> Auditorium</li>
                    <li><Smartphone size={16} /> On your own smartphone via a link</li>
                    <li><Clock size={16} /> Report by <Pending>time</Pending></li>
                  </ul>
                </div>
                <div className="key-card purple">
                  <div className="key-top"><BarChart3 size={20} /> Phase 2: Academic Analysis</div>
                  <ul>
                    <li><CalendarDays size={16} /> 3 and 4 November 2026</li>
                    <li><MonitorCheck size={16} /> Computer labs</li>
                    <li><Clock size={16} /> Report to <Pending>lab / slot details</Pending></li>
                  </ul>
                </div>
              </div>
            </Block>

            <Block id="before" num="02" icon={ClipboardList} title="Before the event">
              <Steps
                items={[
                  <>Complete your registration on the landing page before <Pending>registration deadline</Pending>.</>,
                  <>Keep your registered mobile number and email address handy. The test link will be shared via <Pending>mode and time</Pending>.</>,
                  'Phase 1: make sure your smartphone is fully charged and has a working internet connection.',
                  <>Carry <Pending>college ID card / documents required</Pending>.</>,
                  <>Phase 2 (final-year students): also carry <Pending>documents required for the academic analysis</Pending>.</>,
                ]}
              />
            </Block>

            <Block id="phase1" num="03" icon={Smartphone} title="Phase 1: Psychometric Test, 2 November 2026" tone="tone-orange">
              <Steps
                items={[
                  <>Reach the auditorium by <Pending>time</Pending> and take your seat as directed by the team.</>,
                  'Open the test link only when instructed by the Upskillab team.',
                  <>Enter your details exactly as given at registration. <Pending>Confirm login steps.</Pending></>,
                  'Answer every question honestly and instinctively. There are no right or wrong answers.',
                  <>Complete the test in one sitting, within <Pending>duration</Pending>.</>,
                  'Keep your phone on silent. Do not use other apps, calls or messages during the test.',
                  'Do not discuss your answers with others. Every response should be your own.',
                  'If you face a technical difficulty, raise your hand and a team member will assist you.',
                ]}
              />
            </Block>

            <Block id="phase2" num="04" icon={MonitorCheck} title="Phase 2: Academic Analysis, 3 and 4 November 2026" tone="tone-purple">
              <Steps
                items={[
                  <>Report to <Pending>computer lab</Pending> at your allotted slot of <Pending>time</Pending>.</>,
                  'Follow the instructions of the Upskillab team and the lab coordinators.',
                  <>Use the lab computer only for the assigned activity. <Pending>Confirm rules on personal devices.</Pending></>,
                  <>Complete the activity within <Pending>duration</Pending>. <Pending>Describe the activity in one line.</Pending></>,
                  'If you need support, raise your hand and a team member will assist you.',
                ]}
              />
            </Block>

            <Block id="after" num="05" icon={Flag} title="After the event">
              <ul className="ins-bullets">
                <li><MessageSquareOff size={18} /> Please do not share the test link or questions with others.</li>
                <li><BarChart3 size={18} /> Upskillab will analyse the outcomes and share a detailed analysis with the college by the end of November 2026 to guide academic counselling.</li>
                <li><Flag size={18} /> <Pending>Confirm what students receive after the event.</Pending></li>
              </ul>
            </Block>

            <Reveal>
              <section id="help" className="ins-help">
                <div className="help-icon big"><Headphones size={26} /></div>
                <div>
                  <h3>Need help?</h3>
                  <p>
                    Helpline: <Pending>phone / email / WhatsApp</Pending> &nbsp;·&nbsp; Available: <Pending>timings</Pending>
                  </p>
                  <p className="small"><Hand size={15} /> On the day, just raise your hand and a team member will assist you.</p>
                </div>
                <Link to="/register" className="btn btn-primary">
                  Register Now <ArrowRight size={17} />
                </Link>
              </section>
            </Reveal>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

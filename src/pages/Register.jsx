import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Building2, Layers, GraduationCap, GitBranch, CalendarRange, ClipboardCheck,
  ArrowRight, ArrowLeft, Loader2, CalendarDays, MapPin, BadgeIndianRupee, Check, ChevronDown,
} from 'lucide-react';
import { Header, Pending } from '../components/Layout';
import { registerStudent } from '../api';
import { setSession } from '../session';
import { DOMAINS, INSTITUTE_NAME, VERTICALS, COURSES, BRANCHES, COURSE_YEARS } from '../config';

const INITIAL = {
  domainId: DOMAINS[0].id,
  instituteName: INSTITUTE_NAME,
  verticalName: '',
  courseName: '',
  branchName: '',
  courseYear: '',
  fullName: '',
  email: '',
  mobileNumber: '',
};

const YEAR_LABEL = { 1: '1st year', 2: '2nd year', 3: '3rd year', 4: '4th year', 5: '5th year' };

function validate(f, consent) {
  const e = {};
  if (!f.domainId) e.domainId = 'Please select an assessment.';
  if (!f.instituteName.trim()) e.instituteName = 'Institute name is required.';
  if (!f.verticalName) e.verticalName = 'Please select a vertical.';
  if (!f.courseName) e.courseName = 'Please select your course.';
  if (!f.branchName) e.branchName = 'Please select your branch.';
  if (!f.courseYear) e.courseYear = 'Please select your year.';
  if (f.fullName.trim().length < 2) e.fullName = 'Please enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Please enter a valid email address.';
  if (!/^[6-9]\d{9}$/.test(f.mobileNumber)) e.mobileNumber = 'Enter a valid 10-digit mobile number.';
  if (!consent) e.consent = 'Please accept the consent to continue.';
  return e;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const update = (name) => (e) => {
    let value = e.target.value;
    if (name === 'mobileNumber') value = value.replace(/\D/g, '').slice(0, 10);
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form, consent);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.querySelector('.has-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const payload = {
      ...form,
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      courseYear: Number(form.courseYear),
      mobileNumber: `+91${form.mobileNumber}`,
    };

    setSubmitting(true);
    setApiError('');
    try {
      const res = await registerStudent(payload);
      setSession({ student: payload, studentId: res.studentId, domainId: payload.domainId, submitted: false });
      navigate('/exam/instructions');
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const field = (name, label, Icon, input, full = false) => (
    <label className={`field ${errors[name] ? 'has-error' : ''} ${full ? 'full' : ''}`}>
      <span className="field-label">{label}</span>
      <span className="field-control">
        <Icon size={18} className="field-icon" />
        {input}
      </span>
      {errors[name] && <small className="error">{errors[name]}</small>}
    </label>
  );

  const select = (name, options, placeholder) => (
    <>
      <select value={form[name]} onChange={update(name)} className={form[name] ? '' : 'placeholder'}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={18} className="select-caret" />
    </>
  );

  const opts = (list) => list.map((v) => ({ value: v, label: v }));

  return (
    <div className="reg-page">
      <Header minimal />
      <div className="container reg-layout">
        <aside className="reg-aside">
          <div className="hero-grid-bg" />
          <div className="reg-aside-inner">
            <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to home</Link>
            <span className="eyebrow on-dark">Student Success Roadmap</span>
            <h1>Register &amp; begin your journey</h1>
            <p>Just a few details and you’re ready for the assessment.</p>

            <ul className="reg-facts">
              <li><CalendarDays size={18} /> 2, 3 &amp; 4 November 2026</li>
              <li><MapPin size={18} /> Ashoka Institute, Varanasi</li>
              <li><BadgeIndianRupee size={18} /> Free of charge</li>
            </ul>

            <div className="reg-next">
              <span className="reg-next-title">What happens next</span>
              {['Fill in your details', 'Read the exam instructions', 'Take the test with a timer', 'Submit & you’re done'].map((s, i) => (
                <div key={s} className={`reg-next-step ${i === 0 ? 'active' : ''}`}>
                  <span>{i + 1}</span> {s}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="reg-main">
          <Stepper current={0} />
          <form className="reg-form" onSubmit={handleSubmit} noValidate>
            <div className="form-section">
              <h3><span className="fs-num">1</span> Personal details</h3>
              <div className="form-grid">
                {field('fullName', 'Full name', User, <input value={form.fullName} onChange={update('fullName')} placeholder="e.g. Rahul Sharma" autoComplete="name" />, true)}
                {field('email', 'Email address', Mail, <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" autoComplete="email" />)}
                {field(
                  'mobileNumber',
                  'Mobile number',
                  Phone,
                  <>
                    <span className="prefix">+91</span>
                    <input inputMode="numeric" value={form.mobileNumber} onChange={update('mobileNumber')} placeholder="98765 43210" autoComplete="tel-national" />
                  </>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3><span className="fs-num">2</span> Academic details</h3>
              <div className="form-grid">
                {field('domainId', 'Assessment', ClipboardCheck, select('domainId', DOMAINS.map((d) => ({ value: d.id, label: d.name }))), true)}
                {field('instituteName', 'Institute name', Building2, <input value={form.instituteName} onChange={update('instituteName')} />, true)}
                {field('verticalName', 'Vertical', Layers, select('verticalName', opts(VERTICALS), 'Select vertical'))}
                {field('courseName', 'Course', GraduationCap, select('courseName', opts(COURSES), 'Select course'))}
                {field('branchName', 'Branch', GitBranch, select('branchName', opts(BRANCHES), 'Select branch'))}
                {field('courseYear', 'Year of study', CalendarRange, select('courseYear', COURSE_YEARS.map((y) => ({ value: String(y), label: YEAR_LABEL[y] })), 'Select year'))}
              </div>
            </div>

            <label className={`consent-box ${consent ? 'checked' : ''} ${errors.consent ? 'has-error' : ''}`}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  setErrors((er) => ({ ...er, consent: undefined }));
                }}
              />
              <span className="check-ui">{consent && <Check size={14} strokeWidth={3} />}</span>
              <span>
                I consent to Upskillab collecting and using my responses and academic information for the
                purposes of this programme, and <Pending>confirm what is shared with Ashoka Institute and in what form</Pending>.
              </span>
            </label>
            {errors.consent && <small className="error">{errors.consent}</small>}

            {apiError && <div className="alert">{apiError}</div>}

            <div className="form-actions">
              <span className="muted small">All fields are required.</span>
              <button type="submit" className="btn btn-primary btn-lg btn-glow" disabled={submitting}>
                {submitting ? <><Loader2 size={18} className="spin" /> Saving…</> : <>Next <ArrowRight size={18} /></>}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export function Stepper({ current }) {
  const steps = ['Register', 'Instructions', 'Exam', 'Done'];
  return (
    <ol className="stepper">
      {steps.map((s, i) => (
        <li key={s} className={i < current ? 'done' : i === current ? 'active' : ''}>
          <span className="st-dot">{i < current ? <Check size={15} strokeWidth={3} /> : i + 1}</span>
          <span className="st-label">{s}</span>
        </li>
      ))}
    </ol>
  );
}

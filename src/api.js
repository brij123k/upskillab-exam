import { API_BASE_URL } from './config';

// Without VITE_API_BASE_URL the app runs against the mock below, so the full
// flow can be tested before the backend is ready.
const useMock = !API_BASE_URL;

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

// POST the registration payload. Expected to return { studentId, examId? }.
export async function registerStudent(payload) {
  if (useMock) {
    await delay(500);
    return { studentId: `mock-${Date.now()}`, examId: 'mock-exam' };
  }
  return request('/api/students/register', { method: 'POST', body: JSON.stringify(payload) });
}

// GET the paper for the chosen domain: { id, title, durationMinutes, instructions: string[], questions: [{ id, text, options: [{ id, text }] }] }
export async function fetchExam(domainId) {
  if (useMock) {
    await delay(400);
    return MOCK_EXAM;
  }
  return request(`/api/exams/by-domain/${domainId}`);
}

// POST answers: { studentId, examId, answers: [{ questionId, optionId }], timeTakenSeconds }
export async function submitExam(payload) {
  if (useMock) {
    await delay(600);
    console.info('[mock] submitExam', payload);
    return { ok: true };
  }
  return request('/api/exams/submit', { method: 'POST', body: JSON.stringify(payload) });
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const LIKERT = [
  { id: 'sd', text: 'Strongly disagree' },
  { id: 'd', text: 'Disagree' },
  { id: 'n', text: 'Neutral' },
  { id: 'a', text: 'Agree' },
  { id: 'sa', text: 'Strongly agree' },
];

const MOCK_EXAM = {
  id: 'mock-exam',
  title: 'Psychometric Test',
  durationMinutes: 10,
  instructions: [
    'This test has 6 questions. One question is shown at a time.',
    'There are no right or wrong answers. Answer honestly and instinctively.',
    'Use Next and Previous to move between questions. You can change an answer before you submit.',
    'The timer starts as soon as you begin. The test is submitted automatically when time runs out.',
    'Do not refresh or close this page during the test.',
  ],
  questions: [
    'I enjoy solving problems that need careful, logical thinking.',
    'I feel comfortable speaking in front of a group.',
    'I prefer to plan my work well before the deadline.',
    'I like working in a team more than working alone.',
    'I stay calm when things do not go as planned.',
    'I enjoy learning new tools and technologies on my own.',
  ].map((text, i) => ({ id: `q${i + 1}`, text, options: LIKERT })),
};

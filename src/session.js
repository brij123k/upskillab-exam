// Keeps registration + exam progress in sessionStorage so a refresh mid-exam doesn't lose state.

const KEY = 'ssr-session';

export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function setSession(patch) {
  const next = { ...getSession(), ...patch };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: state lives for this page load only */
  }
  return next;
}

export function clearSession() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

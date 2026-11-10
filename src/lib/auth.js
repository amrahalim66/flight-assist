// Mock authentication against the demo accounts in mockData.js.
//
// The session is a tiny JSON blob in sessionStorage (or localStorage when
// "Keep me signed in" is ticked). There is no token and no server — swap the
// bodies of these three functions for real API calls when a backend exists.

import { MOCK_USERS } from '../data/mockData';

const SESSION_KEY = 'fa_admin_session';

function publicUser(user) {
  // Never hand the password to the UI, even in a mock.
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    title: user.title,
    companyId: user.companyId,
    companyName: user.companyName,
    email: user.email,
    location: user.location,
  };
}

function read(store) {
  try {
    const raw = store.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function login(username, password, remember = false) {
  const user = MOCK_USERS.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password,
  );
  if (!user) {
    return { ok: false, error: 'That username and password combination is not recognised.' };
  }

  const session = { userId: user.id, signedInAt: new Date().toISOString() };
  try {
    (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable (file:// origin) — the session just won't survive a reload */
  }
  return { ok: true, user: publicUser(user) };
}

export function getSession() {
  let session = null;
  try {
    session = read(sessionStorage) || read(localStorage);
  } catch {
    return null;
  }
  if (!session) return null;
  const user = MOCK_USERS.find((u) => u.id === session.userId);
  return user ? publicUser(user) : null;
}

export function logout() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* nothing to clear */
  }
}

import { hydrateActivityContext, readEvidence } from './activity-runner.js';

const STATE_STORAGE_KEY = 'geometry-user-state';
const TEACHER_MODE_KEY = 'geometry-teacher-mode';

export function getUserState() {
  return localStorage.getItem(STATE_STORAGE_KEY) || 'CA';
}

export function setUserState(state) {
  localStorage.setItem(STATE_STORAGE_KEY, state);
}

export function isTeacherModeEnabled() {
  return localStorage.getItem(TEACHER_MODE_KEY) === 'on';
}

export function setTeacherMode(enabled) {
  localStorage.setItem(TEACHER_MODE_KEY, enabled ? 'on' : 'off');
}

export function initStateSelector(element) {
  element.value = getUserState();
  element.addEventListener('change', () => {
    setUserState(element.value);
    element.dispatchEvent(new CustomEvent('statechange', { detail: element.value }));
  });
}

export function initTeacherToggle(toggle) {
  toggle.checked = isTeacherModeEnabled();
  toggle.addEventListener('change', () => {
    setTeacherMode(toggle.checked);
    document.body.classList.toggle('teacher-mode', toggle.checked);
  });
  document.body.classList.toggle('teacher-mode', toggle.checked);
}

export async function renderStandardsOverlay(activityId, container) {
  const state = getUserState();
  const context = await hydrateActivityContext(activityId, state);
  container.querySelector('.standards-meta').textContent = `${context.standards.meta.state} • ${context.standards.meta.source}`;
  container.querySelector('.standards-meta').href = context.standards.meta.url;
  const list = container.querySelector('.standards-list');
  list.innerHTML = '';
  context.codes.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.code} (${item.evidence})`;
    list.appendChild(li);
  });
  const exitTicket = container.querySelector('.exit-ticket-list');
  exitTicket.innerHTML = '';
  context.exitTicket.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.code}: ${item.prompt}`;
    exitTicket.appendChild(li);
  });
  const prereqs = container.querySelector('[data-prereqs]');
  if (prereqs) {
    prereqs.textContent = context.activity.prereqs?.join(', ') || 'None';
  }
  const duration = container.querySelector('[data-duration]');
  if (duration) {
    const minutes = context.activity.estimatedMinutes ?? 15;
    duration.textContent = `${minutes} minutes`;
  }
}

export function downloadEvidence(activityId) {
  const evidence = readEvidence(activityId);
  const state = getUserState();
  const blob = new Blob([
    JSON.stringify({ activityId, state, evidence }, null, 2)
  ], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${activityId}-evidence.json`;
  a.click();
  URL.revokeObjectURL(url);
}

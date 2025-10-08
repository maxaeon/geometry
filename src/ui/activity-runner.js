import { loadStandards } from '../standards/registry.js';
import { mapActivityToStandards } from '../standards/crosswalk.js';
import { buildExitTicket } from '../standards/samplers.js';

const GRADE_FILES = {
  'K-2': 'k_2.json',
  '3-5': 'g3_5.json',
  '6-8': 'g6_8.json',
  HS: 'hs_geometry.json'
};

const activityCache = new Map();
const evidenceKey = activityId => `geometry-evidence:${activityId}`;

async function fetchActivities(gradeBand) {
  if (activityCache.has(gradeBand)) return activityCache.get(gradeBand);
  const file = GRADE_FILES[gradeBand];
  if (!file) throw new Error(`Unknown grade band ${gradeBand}`);
  const res = await fetch(`data/activities/${file}`);
  if (!res.ok) throw new Error(`Unable to load activities for ${gradeBand}`);
  const data = await res.json();
  activityCache.set(gradeBand, data);
  return data;
}

export async function findActivity(activityId) {
  for (const band of Object.keys(GRADE_FILES)) {
    const activities = await fetchActivities(band);
    const match = activities.find(a => a.id === activityId);
    if (match) return match;
  }
  return null;
}

export async function loadGradeBand(gradeBand) {
  return fetchActivities(gradeBand);
}

export async function hydrateActivityContext(activityId, state) {
  const activity = await findActivity(activityId);
  if (!activity) {
    throw new Error(`Unknown activity ${activityId}`);
  }
  const standards = await loadStandards(state);
  const codes = mapActivityToStandards(activityId, state);
  return {
    activity,
    standards,
    codes,
    exitTicket: buildExitTicket(codes.filter(c => !c.code.startsWith('SMP')).map(c => c.code), { itemsPerCode: 1 })
  };
}

export function persistEvidence(activityId, payload) {
  const key = evidenceKey(activityId);
  const existing = JSON.parse(sessionStorage.getItem(key) || '[]');
  existing.push({ ...payload, timestamp: Date.now() });
  sessionStorage.setItem(key, JSON.stringify(existing));
  return existing;
}

export function readEvidence(activityId) {
  const key = evidenceKey(activityId);
  return JSON.parse(sessionStorage.getItem(key) || '[]');
}

export function formatStandardsChip(codes) {
  return codes.map(({ code, evidence }) => `<span class="code" data-evidence="${evidence}">${code}</span>`).join(' ');
}

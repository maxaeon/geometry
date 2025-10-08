const VOCAB_URL = 'data/vocabulary.json';
const cachePromise = fetch(VOCAB_URL).then(res => {
  if (!res.ok) throw new Error('Unable to load vocabulary');
  return res.json();
});

const GRADE_ORDER = ['K-2', '3-5', '6-8', 'HS'];

const SMP_PROMPTS = {
  SMP1: 'Make sense of the problem: What information do you have and what do you still need?',
  SMP3: 'Construct a viable argument: Explain or justify your thinking to a partner.',
  SMP5: 'Use appropriate tools strategically: Try a different tool on the toolbar to explore another idea.'
};

function gradePriority(target) {
  const index = GRADE_ORDER.indexOf(target);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export async function loadVocabulary(gradeBand = 'K-2') {
  const entries = await cachePromise;
  return entries
    .map(entry => ({ ...entry, priority: gradePriority(entry.gradeBand) }))
    .sort((a, b) => {
      if (a.gradeBand === gradeBand && b.gradeBand !== gradeBand) return -1;
      if (b.gradeBand === gradeBand && a.gradeBand !== gradeBand) return 1;
      return a.priority - b.priority || a.term.localeCompare(b.term);
    });
}

export function renderVocabularyList(container, entries) {
  container.innerHTML = '';
  entries.forEach(entry => {
    const li = document.createElement('li');
    li.className = 'dictionary-term';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = entry.term;
    btn.dataset.definition = entry.definition;
    btn.dataset.term = entry.term;
    btn.dataset.example = entry.exampleSVG;
    li.appendChild(btn);
    container.appendChild(li);
  });
}

export function applySmpPrompt(container, smpCode) {
  const prompt = SMP_PROMPTS[smpCode];
  if (!prompt) return;
  const hint = document.createElement('p');
  hint.className = 'smp-hint';
  hint.textContent = prompt;
  container.appendChild(hint);
}

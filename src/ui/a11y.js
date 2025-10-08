const TOOL_SHORTCUTS = {
  select: 'KeyV',
  point: 'KeyP',
  circle: 'KeyC',
  line: 'KeyL',
  dotted: 'KeyD',
  snapshot: 'KeyS',
  fill: 'KeyF'
};

export function registerKeyboardShortcuts(callback) {
  window.addEventListener('keydown', event => {
    const tool = Object.entries(TOOL_SHORTCUTS).find(([, code]) => code === event.code);
    if (tool) {
      event.preventDefault();
      callback(tool[0]);
    }
  });
}

export function applyAriaRoles() {
  const toolbar = document.getElementById('toolbar');
  if (toolbar) {
    toolbar.setAttribute('role', 'toolbar');
  }
  const canvas = document.getElementById('canvas-container');
  if (canvas) {
    canvas.setAttribute('role', 'application');
    canvas.setAttribute('tabindex', '0');
  }
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.setAttribute('aria-pressed', btn.classList.contains('active'));
  });
}

export function updatePressedState(tool) {
  document.querySelectorAll('.tool-btn').forEach(btn => {
    const pressed = btn.dataset.tool === tool;
    btn.classList.toggle('active', pressed);
    btn.setAttribute('aria-pressed', String(pressed));
  });
}

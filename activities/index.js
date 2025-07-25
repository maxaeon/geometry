// Auto-load all activity modules under this directory
// Supports .json and .ts files for future expansion

// Ensure global namespace exists
window.GeometryApp = window.GeometryApp || { activities: [] };

const modules = import.meta.glob('./*.{json,ts}', { eager: true });

export const loadedActivities = [];

for (const mod of Object.values(modules)) {
  const activity = mod.default ?? mod;
  const acts = Array.isArray(activity) ? activity : [activity];
  acts.forEach(a => {
    if (typeof window.GeometryApp.registerActivity === 'function') {
      window.GeometryApp.registerActivity(a);
    } else {
      window.GeometryApp.activities.push(a);
    }
    loadedActivities.push(a);
  });
}

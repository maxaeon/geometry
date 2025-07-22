// Auto-load all activity modules under this directory
// Supports .json and .ts files for future expansion

const modules = import.meta.glob('./*.{json,ts}', { eager: true });

export const loadedActivities = Object.values(modules).flatMap(mod => {
  const activity = mod.default ?? mod;
  return Array.isArray(activity) ? activity : [activity];
});

// Expose activities for the main script
window.GeometryApp = window.GeometryApp || {};
window.GeometryApp.activities = loadedActivities;

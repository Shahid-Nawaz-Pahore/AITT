// Central, typed access to build-time env config. Never read import.meta.env
// anywhere else — go through these so the mock switch and base URL are consistent.

/** Backend base URL. Relative in dev (proxied), absolute for a deployed build. */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "/api/v1"
).replace(/\/$/, "");

/** When true, the whole app runs on in-memory mock data with no network calls. */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

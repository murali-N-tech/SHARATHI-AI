// Centralized API base configuration for frontend
const BACKEND_API = import.meta.env.VITE_API_BASE || `${window.location.protocol}//${window.location.hostname}:9000`;
const MODEL_API = import.meta.env.VITE_MODEL_API || `${window.location.protocol}//${window.location.hostname}:8000`;

export { BACKEND_API, MODEL_API };

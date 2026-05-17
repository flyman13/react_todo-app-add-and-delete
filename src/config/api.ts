// import.meta.env typing can be strict in some setups; narrow with ts-ignore
// Allow access to import.meta.env without strict typing in this small helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any)?.env;

const fallback = typeof window !== 'undefined' ? window.location.origin : '';

export const BASE_URL = env?.VITE_API_BASE_URL ?? fallback;

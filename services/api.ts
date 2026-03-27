import { User, UserRole } from '../types';

const RAW_API_BASE = (import.meta as any)?.env?.VITE_API_URL || '/api';

// Normalize so request builders can safely append /api/... once.
export const API_BASE = RAW_API_BASE.replace(/\/+$/, '').replace(/\/api$/, '');
export const API_BASE_DISPLAY = API_BASE || '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    let errorMessage = text;
    let status = res.status;
    let fieldErrors: Record<string, string> | undefined;
    try {
      const json = JSON.parse(text);
      errorMessage = json.message || json.error || text;
      fieldErrors = json.fieldErrors;
    } catch (e) {
      // Not JSON, use raw text
    }

    const err = new Error(errorMessage || `Request failed with status ${res.status}`) as Error & {
      status?: number;
      fieldErrors?: Record<string, string>;
    };
    err.status = status;
    err.fieldErrors = fieldErrors;
    throw err;
  }
  return res.json();
}

function mapUser(raw: any, role: UserRole): User {
  return {
    id: String(raw.id ?? raw.userId ?? ''),
    email: raw.email ?? '',
    name: raw.name ?? raw.fullName ?? '',
    role
  };
}

export async function loginUser(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await handleResponse<any>(res);
  return mapUser(data, 'candidate');
}

export async function registerUser(name: string, email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await handleResponse<any>(res);
  return mapUser(data, 'candidate');
}

export async function fetchUserByEmail(email: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/user?email=${encodeURIComponent(email)}`);
  const data = await handleResponse<any>(res);
  return mapUser(data, 'candidate');
}

export async function loginEmployer(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/employer/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await handleResponse<any>(res);
  return mapUser(data, 'employer');
}

export async function registerEmployer(name: string, email: string, password: string, companyName?: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/employer/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, companyName })
  });
  const data = await handleResponse<any>(res);
  return mapUser(data, 'employer');
}

export async function fetchEmployerByEmail(email: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/employer/auth/employer?email=${encodeURIComponent(email)}`);
  const data = await handleResponse<any>(res);
  return mapUser(data, 'employer');
}

export async function getAllPortfolios(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/portfolios`);
  return handleResponse<any[]>(res);
}

export async function getPortfolioByEmail(email: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/portfolios/by-email?email=${encodeURIComponent(email)}`);
  if (res.status === 404) return null; // no portfolio yet
  return handleResponse<any>(res);
}

export async function resetUserPassword(email: string, password: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse<any>(res);
}

export async function resetEmployerPassword(email: string, password: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/employer/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse<any>(res);
}

export async function loginAdministrator(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await handleResponse<any>(res);
  return mapUser(data, 'administrator');
}

export async function registerAdministrator(name: string, email: string, password: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/admin/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await handleResponse<any>(res);
  return mapUser(data, 'administrator');
}

export async function fetchAdministratorByEmail(email: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/admin/auth/administrator?email=${encodeURIComponent(email)}`);
  const data = await handleResponse<any>(res);
  return mapUser(data, 'administrator');
}

export async function resetAdministratorPassword(email: string, password: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse<any>(res);
}

export async function getAdminUsers(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/admin/users`);
  return handleResponse<any[]>(res);
}

export async function deleteCandidateById(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/users/candidate/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  return handleResponse<any>(res);
}

export async function deleteEmployerById(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/users/employer/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  return handleResponse<any>(res);
}

export async function getAdminMonitorSummary(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/monitor/summary`);
  return handleResponse<any>(res);
}

export async function getAdminMonitorHealth(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/monitor/health`);
  return handleResponse<any>(res);
}

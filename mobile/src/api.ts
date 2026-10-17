export type AuthResponse = { accessToken: string; tokenType: string; expiresIn: number; userId: string; role: 'patient' | 'doctor' | 'caregiver' };
export type RegisterRequest = { fullName: string; email: string; password: string; role: 'patient'; preferredLanguage: 'ar' | 'en'; phone?: string };
export type PatientMedication = { id: string; drugName: string; dosage: string; unit: string | null; instructions: string | null; withFood: boolean; mealTiming: string | null; startDate: string; endDate: string | null; source?: 'doctor'|'personal'; revision?: number };
export type DoseRecord = { id: string; medicationId: string; scheduleId?: string; scheduledAt: string; takenAt: string | null; status: string; notes?:string|null; drugName?:string; source?:'doctor'|'personal'; corrected?:boolean };
export type PersonalMedicationInput = { requestId:string; revision?:number; drugName:string; dosage:string; unit:string|null; instructions:string|null; withFood:boolean; mealTiming:string|null; startDate:string; endDate:string|null; frequency:'daily'|'specific_days'|'as_needed'; times:string[]; days:number[] };
export type PatientOverview = {
  features?: {version:number;personalMedications:boolean;doseCorrections:boolean;caregivers:boolean;settings:boolean;inbox:boolean};
  settings?:{useSmartBox:boolean};
  archivedMedications?:{id:string;drugName:string;dosage:string;unit:string|null;revision:number}[];
  caregivers?:{id:string;status:string;fullName:string;email:string;canReceiveAlerts:boolean;relationType:string|null;outgoing?:boolean}[];
  boxes?:{id:string;deviceName:string|null;serialNumber:string;online:boolean;lastSeenAt:string|null;firmwareVersion:string|null}[];
  notifications?:{id:string;title:string;body:string|null;type:string;isRead:boolean;sentAt:string}[];
  user: { id: string; fullName: string; email: string; preferredLanguage: string; phone?: string | null };
  profile?: { dateOfBirth?: string | null; gender?: 'male' | 'female' | null; medicalHistory?: string | null; emergencyContactName?: string | null; emergencyContactPhone?: string | null; timezone?: string };
  medications: PatientMedication[];
  schedules: { id: string; medicationId: string; scheduledTime: string; frequency: string | null; days: string; effectiveFrom?:string }[];
  doseRecords: DoseRecord[];
};
export const DEFAULT_API_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://smart-medication-api-d430d.containers.snapdeploy.app').replace(/\/$/, '');
let baseUrl = DEFAULT_API_URL;
let token: string | null = null;
export class ApiError extends Error { constructor(public status: number) { super(`Request failed (${status}).`); } }
export function setAccessToken(value: string | null) { token = value; }
export function setApiBaseUrl(value: string) {
  const parsed = new URL(value.trim());
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash || (parsed.pathname !== '/' && parsed.pathname !== '')) throw new Error('Enter a server URL without credentials or a path.');
  baseUrl = parsed.origin;
}
async function request<T>(path: string, body?: unknown, method = body === undefined ? 'GET' : 'POST'): Promise<T> {
  if (!baseUrl) throw new Error('Configure EXPO_PUBLIC_API_URL before using the live API.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90000);
  try {
    const response = await fetch(`${baseUrl}${path}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: controller.signal });
    if (!response.ok) throw new ApiError(response.status);
    return await response.json() as T;
  } finally { clearTimeout(timeout); }
}
export type PatientProfileInput = { fullName: string; phone: string | null; dateOfBirth: string | null; gender: 'male' | 'female' | null; medicalHistory: string | null; emergencyContactName: string | null; emergencyContactPhone: string | null };
export const api = {
  login: (email: string, password: string) => request<AuthResponse>('/auth/login', { email: email.trim().toLowerCase(), password }),
  register: (body: RegisterRequest) => request<AuthResponse>('/auth/register', body),
  saveProfile: (body: PatientProfileInput) => request<PatientOverview>('/api/patient/me/profile', body, 'PUT'),
  recordDose: (body: { scheduleId: string; day: string; status: 'taken' | 'missed' | 'skipped'; notes?: string }) => request<PatientOverview>('/api/patient/me/doses', body),
  createPersonalMedication: (body:PersonalMedicationInput) => request<PatientOverview>('/api/patient/me/personal-medications',body),
  updatePersonalMedication: (id:string,body:PersonalMedicationInput) => request<PatientOverview>(`/api/patient/me/personal-medications/${id}`,body,'PUT'),
  setMedicationActive: (id:string,revision:number,active:boolean) => request<PatientOverview>(`/api/patient/me/personal-medications/${id}/active`,{revision,active},'PUT'),
  saveSettings: (body:{useSmartBox:boolean;language:'ar'|'en';timezone:string}) => request<PatientOverview>('/api/patient/me/settings',body,'PUT'),
  correctDose: (id:string,body:{expectedStatus:string;status:string;reason:string}) => request<PatientOverview>(`/api/patient/me/doses/${id}/correction`,body,'PUT'),
  recordAsNeeded: (body:{medicationId:string;requestId:string;notes?:string}) => request<PatientOverview>('/api/patient/me/doses/as-needed',body),
  inviteCaregiver: (body:{email:string;relationType:'family'|'nurse'|'other';canReceiveAlerts:boolean}) => request<PatientOverview>('/api/patient/me/caregivers',body),
  caregiverDecision: (id:string,status:'accepted'|'rejected'|'revoked',canReceiveAlerts:boolean) => request<PatientOverview>(`/api/patient/me/caregivers/${id}`,{status,canReceiveAlerts},'PUT'),
  markNotificationsRead: (ids:string[]) => request<PatientOverview>('/api/patient/me/notifications/read',{ids},'PUT'),
  history: (cursor?:string) => request<{items:DoseRecord[];nextCursor:string|null}>(`/api/patient/me/history${cursor?'?cursor='+encodeURIComponent(cursor):''}`),
  overview: () => request<PatientOverview>('/api/patient/me/overview'),
};


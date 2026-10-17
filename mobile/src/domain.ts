import type { MessageKey, Language } from './i18n';
export type DoseStatus = 'taken' | 'missed';
export type DoseRecord = { status: DoseStatus; recordedAt: string };
export type DemoState = { version: 1; language: Language; entered: boolean; reminders: boolean; records: Record<string, DoseRecord>; readNotifications: string[] };
export type Medication = { id: string; name: MessageKey; time: string; period: MessageKey; color: string };
export const medications: Medication[] = [
  { id: 'sample-a', name: 'demoA', time: '08:00', period: 'morning', color: '#DCEDE4' },
  { id: 'sample-b', name: 'demoB', time: '14:00', period: 'afternoon', color: '#F4E8D6' },
  { id: 'sample-c', name: 'demoC', time: '20:00', period: 'evening', color: '#E5E3F4' },
];
export const initialState: DemoState = { version: 1, language: 'ar', entered: false, reminders: true, records: {}, readNotifications: [] };
export function dateKey(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function recordKey(day: string, medicationId: string) { return `${day}/${medicationId}`; }
export function parseState(raw: string | null): DemoState {
  if (!raw) return { ...initialState };
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1) return { ...initialState };
    const records: Record<string, DoseRecord> = {};
    for (const [key, record] of Object.entries(value.records ?? {})) {
      const candidate = record as DoseRecord;
      if (/^\d{4}-\d{2}-\d{2}\/sample-[abc]$/.test(key) && candidate && ['taken', 'missed'].includes(candidate.status) && Number.isFinite(Date.parse(candidate.recordedAt))) records[key] = candidate;
    }
    return { ...initialState, language: value.language === 'en' ? 'en' : 'ar', entered: value.entered === true, reminders: value.reminders !== false, records, readNotifications: Array.isArray(value.readNotifications) ? value.readNotifications.filter((id: unknown) => typeof id === 'string') : [] };
  } catch { return { ...initialState }; }
}

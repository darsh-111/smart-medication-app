import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dateKey, initialState, parseState, recordKey, medications, type DemoState, type Medication, type DoseStatus } from './domain';
import { translate, type MessageKey } from './i18n';
function usePatientState() {
  const [state, setState] = useState<DemoState>(initialState);
  const [ready, setReady] = useState(false);
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem('dawa-demo-v1').then(raw => { if (alive) setState(parseState(raw)); }).catch(() => {}).finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem('dawa-demo-v1', JSON.stringify(state)).catch(() => {}); }, [state, ready]);
  useEffect(() => { const timer = setInterval(() => setClock(new Date()), 30000); return () => clearInterval(timer); }, []);
  const rtl = state.language === 'ar';
  const locale = rtl ? 'ar-EG' : 'en-GB';
  const today = dateKey(clock);
  const t = (key: MessageKey) => translate(state.language, key);
  const row = { flexDirection: rtl ? 'row-reverse' as const : 'row' as const };
  const direction = { textAlign: rtl ? 'right' as const : 'left' as const, writingDirection: rtl ? 'rtl' as const : 'ltr' as const };
  const formatDate = (day: string, options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' }) => new Intl.DateTimeFormat(locale, options).format(new Date(`${day}T12:00:00`));
  const formatTime = (time: string) => new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(new Date(`${today}T${time}:00`));
  const status = (medication: Medication, day = today) => state.records[recordKey(day, medication.id)]?.status;
  const record = (medication: Medication, day: string, value: DoseStatus | null) => setState(current => {
    const key = recordKey(day, medication.id), records = { ...current.records };
    if (value) records[key] = { status: value, recordedAt: new Date().toISOString() }; else delete records[key];
    return { ...current, records };
  });
  const toggleLanguage = () => setState(current => ({ ...current, language: current.language === 'ar' ? 'en' : 'ar' }));
  const notifications = [
    ...Object.entries(state.records).filter(([key, value]) => key.startsWith(today) && value.status === 'taken').sort((a,b) => b[1].recordedAt.localeCompare(a[1].recordedAt)).map(([key, value]) => {
      const medication = medications.find(m => key.endsWith('/' + m.id))!;
      return { id: key + '/' + value.recordedAt, icon: 'checkmark-circle-outline' as const, title: t('recordedTitle'), body: t('recordedBody').replace('{name}', t(medication.name)).replace('{time}', new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(new Date(value.recordedAt))) };
    }),
    ...(state.reminders ? [{ id: 'reminder', icon: 'time-outline' as const, title: t('reminderTitle'), body: t('reminderBody') }] : []),
    { id: 'welcome', icon: 'leaf-outline' as const, title: t('demoTitle'), body: t('demoBody') },
  ];
  return { state, setState, ready, rtl, t, row, direction, today, formatDate, formatTime, status, record, toggleLanguage, notifications };
}
const PatientContext = createContext<ReturnType<typeof usePatientState> | null>(null);
export function PatientProvider({ children }: { children: React.ReactNode }) { const value = usePatientState(); return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>; }
export function usePatient() { const value = useContext(PatientContext); if (!value) throw new Error('PatientProvider is required'); return value; }

import type { PatientOverview } from './api';
import { dayOffset, patientDay, scheduledDoses } from './live-domain';
export type ReminderPreferences = { enabled: boolean; automaticMissed: boolean; graceMinutes: number; startedAt: number; snoozes: Record<string,number>; delivered: Record<string,number>; reviewed: Record<string,number> };
export function newPreferences(): ReminderPreferences { return { enabled:false,automaticMissed:false,graceMinutes:60,startedAt:Date.now(),snoozes:{},delivered:{},reviewed:{} }; }
export function parsePreferences(text: string | null): ReminderPreferences {
  const initial=newPreferences();
  try {
    const value=JSON.parse(text || 'null'); if(!value || typeof value!=='object') return initial;
    const finiteEntries=(entries: unknown) => Object.fromEntries(Object.entries(entries && typeof entries==='object'?entries:{}).filter(([key,n])=>/^[-\w]+\/\d{4}-\d{2}-\d{2}$/.test(key) && typeof n==='number' && Number.isFinite(n) && n>0 && n<=Date.now()+8*86400000));
    return {enabled:value.enabled===true,automaticMissed:value.automaticMissed===true,
      graceMinutes:[15,30,60,120].includes(value.graceMinutes)?value.graceMinutes:60,
      startedAt:typeof value.startedAt==='number' && Number.isFinite(value.startedAt) && value.startedAt>0?value.startedAt:initial.startedAt,
      snoozes:finiteEntries(value.snoozes),delivered:finiteEntries(value.delivered),reviewed:finiteEntries(value.reviewed)};
  } catch { return initial; }
}
const wallFormatters=new Map<string,Intl.DateTimeFormat>();
const epochs=new Map<string,number>();
function wallValue(epoch: number, zone: string) {
  let formatter=wallFormatters.get(zone);
  if(!formatter){formatter=new Intl.DateTimeFormat('en-GB',{timeZone:zone,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});wallFormatters.set(zone,formatter);}
  const parts=formatter.formatToParts(new Date(epoch));
  const n=(type:string)=>Number(parts.find(p=>p.type===type)!.value);
  return Date.UTC(n('year'),n('month')-1,n('day'),n('hour'),n('minute'),n('second'));
}
// Resolve the patient's wall-clock schedule independently of the device timezone.
// During a skipped DST hour, move forward by the gap, matching java.time.atZone.
export function scheduledEpoch(day: string,time: string,zone='Africa/Cairo') {
  const cacheKey=`${zone}/${day}/${time}`;const cached=epochs.get(cacheKey);if(cached!==undefined)return cached;
  const target=Date.parse(`${day}T${time.length===5?time+':00':time}Z`);
  if(!Number.isFinite(target)) return NaN;
  const offsets=[...new Set([-36,0,36].map(hours=>{const instant=target+hours*3600000;return wallValue(instant,zone)-instant;}))];
  const candidates=offsets.map(offset=>target-offset);
  const exact=candidates.filter(instant=>wallValue(instant,zone)===target);
  const result=exact.length?Math.min(...exact):candidates.filter(instant=>wallValue(instant,zone)>target).sort((a,b)=>a-b)[0] ?? NaN;
  if(epochs.size>2000)epochs.clear();epochs.set(cacheKey,result);return result;
}
export function occurrenceKey(scheduleId:string,day:string) { return `${scheduleId}/${day}`; }
export function reminderOccurrences(data:PatientOverview,preferences:ReminderPreferences,now:number) {
  const today=patientDay(data.profile?.timezone,new Date(now));
  return Array.from({length:15},(_,i)=>dayOffset(today,i-7)).flatMap(day=>scheduledDoses(data,day).map(dose=>{
    const key=occurrenceKey(dose.schedule.id,day),dueAt=scheduledEpoch(day,dose.schedule.scheduledTime,data.profile?.timezone);
    const remindAt=Math.max(dueAt,preferences.snoozes[key] || 0);
    return {...dose,key,dueAt,remindAt,missAt:remindAt+preferences.graceMinutes*60000};
  })).filter(dose=>Number.isFinite(dose.dueAt));
}
export function currentAlerts(data:PatientOverview,preferences:ReminderPreferences,now:number) {
  return reminderOccurrences(data,preferences,now).filter(dose=>!dose.record && dose.remindAt<=now && dose.missAt>now );
}
export function overdueDoses(data:PatientOverview,preferences:ReminderPreferences,now:number) {
  if(!preferences.automaticMissed) return [];
  return reminderOccurrences(data,preferences,now).filter(dose=>!dose.record && !preferences.reviewed[dose.key] && dose.dueAt>=preferences.startedAt && dose.missAt<=now);
}
export function notificationPlan(data:PatientOverview,preferences:ReminderPreferences,now:number) {
  if(!preferences.enabled) return [];
  return reminderOccurrences(data,preferences,now).filter(dose=>!dose.record && dose.remindAt>now).sort((a,b)=>a.remindAt-b.remindAt).slice(0,60).map(dose=>({key:dose.key,at:dose.remindAt}));
}
export function prunePreferences(preferences:ReminderPreferences,now:number):ReminderPreferences {
  const recent=(entries:Record<string,number>)=>Object.fromEntries(Object.entries(entries).filter(([,at])=>at>now-8*86400000));
  return {...preferences,snoozes:recent(preferences.snoozes),delivered:recent(preferences.delivered),reviewed:recent(preferences.reviewed)};
}

import type { PatientOverview } from './api';
export function patientDay(timeZone = 'Africa/Cairo', date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric',month:'2-digit',day:'2-digit' }).formatToParts(date);
  return ['year','month','day'].map(type=>parts.find(part=>part.type===type)!.value).join('-');
}
export function dayOffset(day: string, offset: number) { const date=new Date(`${day}T12:00:00Z`); date.setUTCDate(date.getUTCDate()+offset); return date.toISOString().slice(0,10); }
export function scheduledDoses(data: PatientOverview, day: string) {
  const weekday=(new Date(`${day}T12:00:00Z`).getUTCDay()+6)%7+1;
  return data.schedules.flatMap(schedule=>{
    const medication=data.medications.find(m=>m.id===schedule.medicationId);
    if(!medication || schedule.frequency==='as_needed' || day<medication.startDate || (medication.endDate && day>medication.endDate) || (schedule.frequency==='specific_days' && !schedule.days.split(',').includes(String(weekday)))) return [];
    const record=data.doseRecords.find(r=>r.scheduleId===schedule.id && patientDay(data.profile?.timezone,new Date(r.scheduledAt))===day);
    if(schedule.effectiveFrom && !record){
      const effective=new Date(schedule.effectiveFrom),zone=data.profile?.timezone || 'Africa/Cairo';
      const firstDay=patientDay(zone,effective),firstTime=new Intl.DateTimeFormat('en-GB',{timeZone:zone,hourCycle:'h23',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(effective);
      if(day<firstDay || (day===firstDay && schedule.scheduledTime.slice(0,8)<firstTime))return [];
    }
    return [{schedule,medication,day,record}];
  });
}

export function doseIsDue(day: string, time: string, timeZone='Africa/Cairo', now=new Date()) {
  const today=patientDay(timeZone,now);
  const clock=new Intl.DateTimeFormat('en-GB',{timeZone,hourCycle:'h23',hour:'2-digit',minute:'2-digit'}).format(now);
  return day<today || (day===today && time.slice(0,5)<=clock);
}

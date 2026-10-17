import { ApiError, type PatientOverview } from './api';
import { overdueDoses, type ReminderPreferences } from './reminder-domain';
type PatientClient = { overview:()=>Promise<PatientOverview>; recordDose:(body:{scheduleId:string;day:string;status:'missed';notes:string})=>Promise<PatientOverview> };
export async function reconcileMissed(initial:PatientOverview,preferences:ReminderPreferences,client:PatientClient,
  options:{isActive:()=>boolean;onReviewed:(key:string)=>void;now:()=>number}) {
  if(!options.isActive() || !preferences.automaticMissed)return initial;
  let fresh=await client.overview();
  for(const dose of overdueDoses(fresh,preferences,options.now()).slice(0,20)) {
    if(!options.isActive())break;
    try {fresh=await client.recordDose({scheduleId:dose.schedule.id,day:dose.day,status:'missed',notes:'[AUTO_MISSED_V1] No confirmation before the reminder window ended. This is not confirmation that medication was not taken.'});}
    catch(reason){if(reason instanceof ApiError && reason.status===409)fresh=await client.overview();else throw reason;}
    if(options.isActive())options.onReviewed(dose.key);
  }
  return fresh;
}

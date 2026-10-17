import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, type PatientOverview } from './api';
import { reconcileMissed } from './reconcile-missed';
import { currentAlerts, newPreferences, notificationPlan, occurrenceKey, overdueDoses, parsePreferences, prunePreferences, type ReminderPreferences } from './reminder-domain';
import { activateNotificationOwner, cancelPatientNotifications, enableReminderPermission, isWebReminder, reminderPermission, showDueNotification, syncNotifications, testReminder, type ReminderPermission } from './reminder-platform';
type Run = (action:()=>Promise<PatientOverview>)=>Promise<void>;
export function useReminders(data:PatientOverview,busy:boolean,run:Run,ar:boolean) {
  const owner=data.user.id;
  const [preferences,setPreferences]=useState<ReminderPreferences>(newPreferences);
  const [ready,setReady]=useState(false),[permission,setPermission]=useState<ReminderPermission>('undetermined');
  const [now,setNow]=useState(Date.now()),[message,setMessage]=useState(''),[testAt,setTestAt]=useState(0),[testVisible,setTestVisible]=useState(false);
  const [syncing,setSyncing]=useState(false);
  const [foreground,setForeground]=useState(AppState.currentState!=='background');
  const active=useRef(true),autoLock=useRef(false),storageQueue=useRef(Promise.resolve());
  const latest=useRef({data,preferences,run,busy,ar});latest.current={data,preferences,run,busy,ar};
  const copy=(arabic:string,english:string)=>ar?arabic:english;
  useEffect(()=>{
    active.current=true;
    void activateNotificationOwner(owner).catch(()=>{});
    AsyncStorage.getItem(`dawa-reminders-v1:${owner}`).then(value=>{if(active.current){setPreferences(prunePreferences(parsePreferences(value),Date.now()));setReady(true);}}).catch(()=>{if(active.current)setMessage(copy('تعذّر تحميل إعدادات التنبيه. حاول إعادة فتح التطبيق.','Could not load reminder settings. Reopen the app.'));});
    void reminderPermission().then(value=>{if(active.current)setPermission(value);}).catch(()=>{if(active.current)setPermission('unsupported');});
    const timer=setInterval(()=>setNow(Date.now()),5000);
    const listener=AppState.addEventListener('change',state=>{setForeground(state==='active');if(state==='active'){setNow(Date.now());void reminderPermission().then(value=>{if(active.current)setPermission(value);}).catch(()=>{});}});
    return()=>{active.current=false;clearInterval(timer);listener.remove();void cancelPatientNotifications(owner).catch(()=>{});};
  },[owner]);
  useEffect(()=>{
    if(!ready)return;
    const value=JSON.stringify(preferences);
    storageQueue.current=storageQueue.current.catch(()=>{}).then(()=>AsyncStorage.setItem(`dawa-reminders-v1:${owner}`,value));
    void storageQueue.current.catch(()=>{if(active.current)setMessage(copy('تعذّر حفظ إعدادات التنبيه على هذا الجهاز.','Could not save reminder settings on this device.'));});
  },[preferences,ready,owner]);
  const tick=Math.floor(now/15000);
  const plan=useMemo(()=>notificationPlan(data,preferences,now),[data,preferences,tick]);
  useEffect(()=>{
    if(!ready)return;
    void syncNotifications(owner,permission==='granted'?plan:[],ar).catch(()=>{if(active.current)setMessage(copy('تعذّر جدولة تنبيهات الجهاز. التنبيه داخل التطبيق ما زال متاحًا.','Device reminders could not be scheduled. In-app alerts are still available.'));});
  },[ready,owner,JSON.stringify(plan),permission,ar]);
  const alerts=useMemo(()=>currentAlerts(data,preferences,now),[data,preferences,tick]);
  useEffect(()=>{
    if(!ready || !preferences.enabled || permission!=='granted')return;
    const undisplayed=alerts.filter(dose=>preferences.delivered[dose.key]!==dose.remindAt);
    if(!undisplayed.length)return;
    for(const dose of undisplayed)void showDueNotification(`${owner}:${dose.key}`,ar).catch(()=>{});
    setPreferences(previous=>({...previous,delivered:{...previous.delivered,...Object.fromEntries(undisplayed.map(dose=>[dose.key,dose.remindAt]))}}));
  },[alerts,ready,preferences.enabled,permission,owner,ar]);
  useEffect(()=>{if(testAt && now>=testAt){setTestVisible(true);setTestAt(0);}},[testAt,now]);
  useEffect(()=>{
    if(!ready || !foreground || busy || autoLock.current || !preferences.automaticMissed || !overdueDoses(data,preferences,now).length)return;
    autoLock.current=true;setSyncing(true);
    void latest.current.run(()=>reconcileMissed(latest.current.data,latest.current.preferences,api,{
      isActive:()=>active.current,
      now:()=>Date.now(),
      onReviewed:key=>setPreferences(previous=>({...previous,reviewed:{...previous.reviewed,[key]:Date.now()}}))
    })).catch(()=>{if(active.current)setMessage(copy('تعذّرت مزامنة الجرعات الفائتة. سنراجع الحالة من السيرفر قبل المحاولة مجددًا.','Missed doses could not be synced. Server state will be checked before retrying.'));}).finally(()=>{autoLock.current=false;if(active.current)setSyncing(false);});
  },[ready,foreground,busy,data,preferences.automaticMissed,preferences.startedAt,preferences.graceMinutes,Math.floor(now/30000)]);
  async function toggleDeviceReminders() {
    setMessage('');
    if(preferences.enabled){setPreferences(previous=>({...previous,enabled:false}));await cancelPatientNotifications(owner).catch(()=>{});return;}
    try {const value=await enableReminderPermission();if(!active.current)return;setPermission(value);setPreferences(previous=>({...previous,enabled:true}));if(value!=='granted')setMessage(copy('تنبيهات النظام غير مسموحة أو غير مدعومة. التذكير داخل التطبيق يعمل أثناء فتحه.','System notifications are blocked or unsupported. In-app reminders work while the app is open.'));}
    catch {setMessage(copy('تعذّر طلب إذن التنبيهات. يمكنك استخدام التذكير داخل التطبيق.','Notification permission could not be requested. In-app alerts remain available.'));}
  }
  function snooze(scheduleId:string,day:string) {
    const key=occurrenceKey(scheduleId,day),until=Date.now()+15*60000;
    setPreferences(previous=>({...previous,snoozes:{...previous.snoozes,[key]:until}}));setNow(Date.now());
    setMessage(copy('تم تأجيل التذكير 15 دقيقة على هذا الجهاز. ميعاد الوصفة لم يتغير.','Reminder snoozed for 15 minutes on this device. The prescription time is unchanged.'));
  }
  function cancelSnooze(scheduleId:string,day:string) {setPreferences(previous=>{const snoozes={...previous.snoozes};delete snoozes[occurrenceKey(scheduleId,day)];return {...previous,snoozes};});setNow(Date.now());}
  async function test() {setMessage('');setTestVisible(false);setTestAt(Date.now()+5000);if(preferences.enabled && permission==='granted')try{await testReminder(owner,ar);}catch{setMessage(copy('سيظهر تنبيه التجربة داخل التطبيق فقط.','The test will appear inside the app only.'));}}
  function toggleAutomatic() {setPreferences(previous=>({...previous,automaticMissed:!previous.automaticMissed,startedAt:Date.now()}));}
  return {preferences,ready,permission,now,alerts,syncing,message,isWeb:isWebReminder,testVisible,testAt,test,toggleDeviceReminders,snooze,cancelSnooze,toggleAutomatic,
    setGrace:(minutes:number)=>{if([15,30,60,120].includes(minutes))setPreferences(previous=>({...previous,graceMinutes:minutes}));},dismissTest:()=>setTestVisible(false)};
}

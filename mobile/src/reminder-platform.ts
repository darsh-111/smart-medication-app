import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
export type ReminderPermission = 'granted' | 'denied' | 'undetermined' | 'unsupported';
let queue:Promise<unknown>=Promise.resolve();
function serialize<T>(task:()=>Promise<T>):Promise<T> { const next=queue.catch(()=>{}).then(task); queue=next;return next; }
Notifications.setNotificationHandler({handleNotification:async()=>({shouldShowBanner:true,shouldShowList:true,shouldPlaySound:true,shouldSetBadge:false})});
export async function reminderPermission():Promise<ReminderPermission> {
  return (await Notifications.getPermissionsAsync()).status;
}
export async function enableReminderPermission():Promise<ReminderPermission> {
  if(Platform.OS==='android') await Notifications.setNotificationChannelAsync('medication-reminders',{name:'Medication reminders',importance:Notifications.AndroidImportance.HIGH,sound:'default',lockscreenVisibility:Notifications.AndroidNotificationVisibility.PRIVATE});
  return (await Notifications.requestPermissionsAsync()).status;
}
const prefix=(owner:string)=>`dawa-reminder:${owner}:`;
export function activateNotificationOwner(owner:string) { return serialize(async()=>{for(const item of await Notifications.getAllScheduledNotificationsAsync())if(item.identifier.startsWith('dawa-reminder:') && !item.identifier.startsWith(prefix(owner)))await Notifications.cancelScheduledNotificationAsync(item.identifier);}); }
export function syncNotifications(owner:string,plan:{key:string;at:number}[],ar:boolean) {
  return serialize(async()=>{
    const scheduled=await Notifications.getAllScheduledNotificationsAsync();
    const wanted=new Map(plan.map(item=>[`${prefix(owner)}${item.key}:${item.at}`,item]));
    for(const item of scheduled) if(item.identifier.startsWith(prefix(owner)) && !item.identifier.endsWith(':test') && !wanted.has(item.identifier)) await Notifications.cancelScheduledNotificationAsync(item.identifier);
    const existing=new Set(scheduled.map(item=>item.identifier));
    for(const [identifier,item] of wanted) if(!existing.has(identifier) && item.at>Date.now()) await Notifications.scheduleNotificationAsync({identifier,content:{title:ar?'تذكير بالجرعة':'Dose reminder',body:ar?'حان موعد تذكيرك. افتح التطبيق لمراجعة الجرعة.':'Your reminder is due. Open the app to review your dose.',sound:'default'},trigger:{type:Notifications.SchedulableTriggerInputTypes.DATE,date:new Date(item.at),channelId:'medication-reminders'}});
  });
}
export function cancelPatientNotifications(owner:string) { return serialize(async()=>{for(const item of await Notifications.getAllScheduledNotificationsAsync()) if(item.identifier.startsWith(prefix(owner))) await Notifications.cancelScheduledNotificationAsync(item.identifier);}); }
export async function showDueNotification(_key:string,ar:boolean) {
  // Native due alerts are delivered by the OS from the previously scheduled plan.
}
export function testReminder(owner:string,ar:boolean) {
  return serialize(async()=>{ await Notifications.scheduleNotificationAsync({identifier:`${prefix(owner)}test`,content:{title:ar?'تجربة التنبيه':'Reminder test',body:ar?'التنبيهات جاهزة. هذه تجربة ولا تُسجّل جرعة.':'Reminders are ready. This test does not record a dose.',sound:'default'},trigger:{type:Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,seconds:5,channelId:'medication-reminders'}}); });
}
export const isWebReminder = false;

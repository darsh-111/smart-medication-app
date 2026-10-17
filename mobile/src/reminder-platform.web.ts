export type ReminderPermission = 'granted' | 'denied' | 'undetermined' | 'unsupported';
type BrowserNotice = { close:()=>void };
type BrowserNoticeClass = { new(title:string,options?:{body:string;tag:string}):BrowserNotice; permission:'default'|'denied'|'granted'; requestPermission:()=>Promise<'default'|'denied'|'granted'> };
const getNotice=()=> (globalThis as typeof globalThis & {Notification?:BrowserNoticeClass}).Notification;
const notices=new Map<string,BrowserNotice>();
const tests=new Map<string,ReturnType<typeof setTimeout>>();
export async function reminderPermission():Promise<ReminderPermission> { const api=getNotice(); return !api?'unsupported':api.permission==='default'?'undetermined':api.permission; }
export async function enableReminderPermission():Promise<ReminderPermission> { const api=getNotice(); if(!api)return 'unsupported'; const value=await api.requestPermission(); return value==='default'?'undetermined':value; }
export async function activateNotificationOwner(owner:string) { for(const testOwner of tests.keys())if(testOwner!==owner)await cancelPatientNotifications(testOwner);for(const [key,notice] of notices)if(!key.startsWith(owner+':')){notice.close();notices.delete(key);} }
export async function syncNotifications(_owner:string,_plan:{key:string;at:number}[],_ar:boolean) { /* Web due notifications are emitted by the active reminder clock. */ }
export async function cancelPatientNotifications(owner:string) { const timer=tests.get(owner);if(timer)clearTimeout(timer);tests.delete(owner);for(const [key,notice] of notices)if(key.startsWith(owner+':')){notice.close();notices.delete(key);} }
export async function showDueNotification(key:string,ar:boolean) { const api=getNotice(); if(!api || api.permission!=='granted') return; try { notices.get(key)?.close(); notices.set(key,new api(ar?'تذكير بالجرعة':'Dose reminder',{body:ar?'حان موعد تذكيرك. افتح التطبيق لمراجعة الجرعة.':'Your reminder is due. Open the app to review your dose.',tag:key})); }catch { /* In-app alert remains available when system notifications are blocked. */ } }
export async function testReminder(owner:string,ar:boolean) { const previous=tests.get(owner);if(previous)clearTimeout(previous);tests.set(owner,setTimeout(()=>{tests.delete(owner);void showDueNotification(owner+':test',ar);},5000)); }
export const isWebReminder = true;

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const ts=require('../node_modules/typescript');
function load(file,extras={}) {
  const exports={};
  const source=ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(source,{exports,Date,Intl,setTimeout,clearTimeout,require:(name)=>{if(name==='./live-domain')return load('src/live-domain.ts');throw new Error(name);},...extras});
  return exports;
}
(async()=>{
  const engine=load('src/reminder-domain.ts');
  const due=Date.parse('2026-10-17T10:00:00Z');
  const prefs={...engine.newPreferences(),enabled:true,automaticMissed:true,graceMinutes:60,startedAt:due-1000};
  const data={user:{id:'patient-one'},profile:{timezone:'Africa/Cairo'},medications:[{id:'med-one',drugName:'SYNTHETIC',startDate:'2026-10-01',endDate:null}],schedules:[{id:'schedule-one',medicationId:'med-one',scheduledTime:'13:00:00',frequency:'daily',days:''}],doseRecords:[]};
  assert.equal(engine.scheduledEpoch('2026-10-17','13:00:00','Africa/Cairo'),due);
  assert.equal(engine.scheduledEpoch('2026-10-25','02:30:00','Europe/Berlin'),Date.parse('2026-10-25T00:30:00Z'));
  assert.equal(engine.scheduledEpoch('2026-03-29','02:30:00','Europe/Berlin'),Date.parse('2026-03-29T01:30:00Z'));
  assert.equal(engine.currentAlerts(data,prefs,due-1).length,0);
  assert.equal(engine.currentAlerts(data,prefs,due).length,1);
  assert.equal(engine.overdueDoses(data,prefs,due+59*60000).length,0);
  assert.equal(engine.overdueDoses(data,prefs,due+60*60000).length,1);
  const key='schedule-one/2026-10-17';
  const snoozed={...prefs,snoozes:{[key]:due+15*60000}};
  assert.equal(engine.currentAlerts(data,snoozed,due+10*60000).length,0);
  assert.equal(engine.currentAlerts(data,snoozed,due+15*60000).length,1);
  assert.equal(engine.overdueDoses(data,snoozed,due+60*60000).length,0);
  assert.equal(engine.overdueDoses(data,snoozed,due+75*60000).length,1);
  assert.equal(engine.notificationPlan(data,snoozed,due+60000)[0].at,due+15*60000);
  assert.equal(engine.overdueDoses(data,{...prefs,automaticMissed:false},due+3*3600000).length,0);
  assert.equal(engine.overdueDoses(data,{...prefs,startedAt:due+1},due+3*3600000).length,0);
  assert.equal(engine.overdueDoses(data,{...prefs,reviewed:{[key]:due}},due+3*3600000).length,0);
  const recorded={...data,doseRecords:[{scheduleId:'schedule-one',scheduledAt:'2026-10-17T10:00:00Z',status:'taken'}]};
  assert.equal(engine.currentAlerts(recorded,prefs,due+60000).length,0);
  assert.equal(engine.overdueDoses(recorded,prefs,due+3*3600000).length,0);
  assert.ok(!engine.notificationPlan(recorded,prefs,due-1).some(item=>item.key===key));
  assert.equal(engine.parsePreferences('{bad').automaticMissed,false);
  assert.equal(engine.parsePreferences(JSON.stringify({...prefs,graceMinutes:-1})).graceMinutes,60);
  assert.equal(engine.parsePreferences(JSON.stringify({...prefs,snoozes:{bad:99,[key]:'wrong'}})).snoozes[key],undefined);
  assert.equal(engine.parsePreferences(JSON.stringify(snoozed)).snoozes[key],due+15*60000);
  assert.ok(engine.notificationPlan({...data,schedules:Array.from({length:20},(_,i)=>({...data.schedules[0],id:'s'+i}))},prefs,due-1).length<=60);
  assert.equal(engine.notificationPlan(data,{...prefs,enabled:false},due-1).length,0);
  // Scheduling uses stable identifiers, cancels stale entries, and isolates accounts.
  const scheduled=new Map(),requests=[];
  const native={SchedulableTriggerInputTypes:{DATE:'date',TIME_INTERVAL:'timeInterval'},AndroidImportance:{HIGH:4},AndroidNotificationVisibility:{PRIVATE:0},
    setNotificationHandler:()=>{},getPermissionsAsync:async()=>({status:'granted'}),requestPermissionsAsync:async()=>({status:'granted'}),setNotificationChannelAsync:async()=>{},
    getAllScheduledNotificationsAsync:async()=>[...scheduled.keys()].map(identifier=>({identifier})),
    cancelScheduledNotificationAsync:async id=>{scheduled.delete(id);},scheduleNotificationAsync:async request=>{requests.push(request);scheduled.set(request.identifier,request);return request.identifier;}};
  const adapter=load('src/reminder-platform.ts',{require:name=>name==='react-native'?{Platform:{OS:'android'}}:native});
  const at=Date.now()+60000;
  await adapter.syncNotifications('one',[{key,at}],true);
  await adapter.syncNotifications('one',[{key,at}],true);
  assert.equal(requests.length,1);
  await adapter.syncNotifications('two',[{key,at}],false);
  await adapter.syncNotifications('one',[{key,at:at+15*60000}],true);
  assert.equal(scheduled.size,2);
  assert.ok([...scheduled.keys()].some(id=>id.startsWith('dawa-reminder:two:')));
  await adapter.cancelPatientNotifications('one');
  assert.equal(scheduled.size,1);
  assert.ok([...scheduled.keys()][0].startsWith('dawa-reminder:two:'));
  assert.ok(requests.every(request=>!request.content.body.includes('SYNTHETIC')));
  await adapter.activateNotificationOwner('one');
  assert.equal(scheduled.size,0);
  const created=[];class BrowserNotice {static permission='denied';static async requestPermission(){this.permission='granted';return 'granted';}constructor(title,options){created.push({title,options});}close(){}}
  const web=load('src/reminder-platform.web.ts',{Notification:BrowserNotice});
  await web.showDueNotification('one:test',true);assert.equal(created.length,0);
  assert.equal(await web.enableReminderPermission(),'granted');
  await web.showDueNotification('one:test',true);assert.equal(created.length,1);
  await web.cancelPatientNotifications('one');
  class ApiError extends Error { constructor(status){super('API error');this.status=status;} }
  const {reconcileMissed}=load('src/reconcile-missed.ts',{require:name=>name==='./api'?{ApiError}:engine});
  let writes=0,reviewed=[];
  const alreadyTaken={overview:async()=>recorded,recordDose:async()=>{writes++;throw Error('Should not overwrite taken');}};
  await reconcileMissed(data,prefs,alreadyTaken,{isActive:()=>true,onReviewed:key=>reviewed.push(key),now:()=>due+2*3600000});
  assert.equal(writes,0);
  const networkDown={overview:async()=>{throw Error('offline');},recordDose:async()=>{writes++;}};
  await assert.rejects(()=>reconcileMissed(data,prefs,networkDown,{isActive:()=>true,onReviewed:key=>reviewed.push(key),now:()=>due+2*3600000}),/offline/);
  assert.equal(writes,0);assert.equal(reviewed.length,0);
  let active=true;
  await reconcileMissed(data,prefs,{overview:async()=>{active=false;return data;},recordDose:async()=>{writes++;return recorded;}},{isActive:()=>active,onReviewed:key=>reviewed.push(key),now:()=>due+2*3600000});
  assert.equal(writes,0);
  let reads=0;
  const collision={overview:async()=>++reads===1?data:recorded,recordDose:async()=>{writes++;throw new ApiError(409);}};
  const result=await reconcileMissed(data,prefs,collision,{isActive:()=>true,onReviewed:key=>reviewed.push(key),now:()=>due+2*3600000});
  assert.equal(result.doseRecords[0].status,'taken');assert.equal(reads,2);assert.equal(reviewed[0],key);
  console.log('PASS: reminder timing, DST, snooze, missed windows, opt-in baseline, completed-dose exclusion, persistence validation, notification limits and account isolation.');
})().catch(error=>{console.error(error);process.exitCode=1;});

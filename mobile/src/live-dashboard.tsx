import React, { useEffect, useState } from 'react';
import { Pressable, Switch, TextInput, View } from 'react-native';
import { api, type PatientOverview, type PatientProfileInput } from './api';
import { usePatient } from './patient';
import { Button, Icon, Label, Pill, Section } from './components';
import { styles as s, colors as c } from './theme';
import { DoseHistory } from './dose-history';
import { PersonalMedications } from './personal-medications';
import { PatientInbox, PatientLinks } from './patient-links';
import { PatientSettings } from './patient-settings';
import { useReminders } from './use-reminders';
import { occurrenceKey } from './reminder-domain';
import { patientDay, dayOffset, scheduledDoses, doseIsDue } from './live-domain';

type Props = { overview: PatientOverview; busy: boolean; run: (action: () => Promise<PatientOverview>) => Promise<void> };
export function LiveDashboard({ overview: data, busy, run }: Props) {
  const { rtl, row, direction } = usePatient();
  const copy = (ar: string, en: string) => rtl ? ar : en;
  const [tab, setTab] = useState('home');
  const [selected, select] = useState(patientDay(data.profile?.timezone));
  const reminders = useReminders(data,busy,run,rtl);
  const now = new Date(reminders.now);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState('');
  const profileForm = (): PatientProfileInput => ({ fullName: data.user.fullName, phone: data.user.phone || null,
    dateOfBirth: data.profile?.dateOfBirth || null, gender: data.profile?.gender || null,
    medicalHistory: data.profile?.medicalHistory || null, emergencyContactName: data.profile?.emergencyContactName || null,
    emergencyContactPhone: data.profile?.emergencyContactPhone || null });
  const [form, setForm] = useState<PatientProfileInput>(profileForm);
  useEffect(() => { setForm(profileForm()); }, [data]);
  const today = patientDay(data.profile?.timezone, now);
  const doses = scheduledDoses(data, tab === 'home' ? today : selected);
  const labels: Record<string, string> = { taken: copy('تم أخذها','Taken'), missed: copy('فائتة','Missed'), skipped: copy('تم تخطيها','Skipped'), late: copy('متأخرة','Late') };
  const fields: { key: Exclude<keyof PatientProfileInput, 'gender'>; ar: string; en: string; max: number; multiline?: boolean }[] = [
    { key:'fullName', ar:'الاسم الكامل', en:'Full name', max:150 }, { key:'phone', ar:'رقم الهاتف', en:'Phone', max:30 },
    { key:'dateOfBirth', ar:'تاريخ الميلاد (YYYY-MM-DD)', en:'Date of birth (YYYY-MM-DD)', max:10 },
    { key:'medicalHistory', ar:'التاريخ المرضي', en:'Medical history', max:2000, multiline:true },
    { key:'emergencyContactName', ar:'اسم جهة اتصال الطوارئ', en:'Emergency contact name', max:150 },
    { key:'emergencyContactPhone', ar:'هاتف الطوارئ', en:'Emergency contact phone', max:30 } ];
  const fieldStyle = { borderWidth:1, borderColor:c.line, borderRadius:12, padding:14, color:c.ink, backgroundColor:c.white, fontSize:15 } as const;
  async function save() {
    setFormError(''); setSaved(false);
    if (!form.fullName.trim()) { setFormError(copy('اكتب الاسم الكامل.','Enter your full name.')); return; }
    if (form.dateOfBirth && (!/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth) || !Number.isFinite(Date.parse(form.dateOfBirth)) || new Date(form.dateOfBirth).toISOString().slice(0,10) !== form.dateOfBirth || form.dateOfBirth > today)) {
      setFormError(copy('اكتب تاريخ ميلاد صحيحًا لا يتجاوز اليوم.','Enter a valid birth date no later than today.')); return;
    }
    try { await run(() => api.saveProfile(form)); setSaved(true); } catch { /* Parent displays the API error. */ }
  }
  return <>
    <View style={[row,{gap:8,flexWrap:'wrap',marginVertical:20}]}>{[
      ['home',copy('الرئيسية','Home')],['schedule',copy('الجدول','Schedule')],['medications',copy('الأدوية','Medications')],['history',copy('السجل','History')],['profile',copy('بياناتي','My profile')],['reminders',copy('التنبيهات','Reminders')],['inbox',copy('الإشعارات','Inbox')],['links',copy('المتابع والصندوق','Caregiver & box')]
    ].map(([key,title]) => <Pressable key={key} accessibilityRole="tab" accessibilityState={{selected:tab===key}} onPress={() => {setTab(key);setSaved(false);}} style={{padding:12,borderRadius:12,backgroundColor:tab===key?c.green:'#E6EFE0'}}><Label style={{color:tab===key?c.white:c.ink}}>{title}</Label></Pressable>)}</View>
    {reminders.testVisible && <View accessibilityRole="alert" style={[s.card,{borderWidth:2,borderColor:c.green,gap:10,marginBottom:14}]}><Label style={s.medium}>{copy('تنبيه تجريبي وصل ✅','Test reminder delivered ✅')}</Label><Label>{copy('هذه تجربة للتنبيه فقط، ولا تسجّل جرعة في الداتابيز.','This is a notification test only. No dose is recorded in the database.')}</Label><Button title={copy('إغلاق التنبيه','Dismiss')} secondary onPress={reminders.dismissTest} /></View>}
    {reminders.alerts.length>0 && <View accessibilityRole="alert" style={[s.card,{borderWidth:2,borderColor:c.green,gap:10,marginBottom:14}]}><Label style={s.medium}>{copy('حان وقت تذكيرك بالجرعة','Your dose reminder is due')}</Label>{reminders.alerts.slice(0,3).map(dose=><View key={dose.key} style={{gap:8,marginBottom:8}}><Label>{dose.medication.drugName} · {dose.schedule.scheduledTime.slice(0,5)}</Label><View pointerEvents={busy?'none':'auto'}><Button title={copy('أخذت الجرعة','I took this dose')} onPress={()=>{void run(()=>api.recordDose({scheduleId:dose.schedule.id,day:dose.day,status:'taken'})).catch(()=>{});}} /><View style={{height:6}} /><Button title={copy('ذكّرني بعد 15 دقيقة','Remind me in 15 minutes')} secondary onPress={()=>reminders.snooze(dose.schedule.id,dose.day)} /></View></View>)}</View>}
    {reminders.syncing && <Label style={s.small}>{copy('جاري حفظ الجرعات غير المؤكدة كفائتة…','Saving unconfirmed doses as missed…')}</Label>}
    {!!reminders.message && <View accessibilityRole="alert" style={[s.card,{marginBottom:12}]}><Label>{reminders.message}</Label></View>}
    {tab==='reminders' && <>
      <Section title={copy('التنبيهات والتذكير','Notifications and reminders')} />
      <View style={[s.card,{gap:14}]}>
        <View style={[s.between,row]}><Label style={s.medium}>{copy('تنبيهات هذا الجهاز','Notifications on this device')}</Label><Switch accessibilityLabel={copy('تنبيهات هذا الجهاز','Notifications on this device')} disabled={!reminders.ready} value={reminders.preferences.enabled} onValueChange={()=>{void reminders.toggleDeviceReminders();}} trackColor={{false:'#D1D9D2',true:c.green}} thumbColor={c.white} /></View>
        <Label style={s.body}>{reminders.isWeb ? copy('على اللابتوب: التنبيه يعمل أثناء فتح الصفحة. اسمح بالإشعارات لو أردت تنبيهًا خارج الصفحة.','On your laptop, reminders work while the page is open. Allow notifications to see a system alert.') : copy('على الموبايل: تُجدول التذكيرات محليًا للأسبوع القادم، حتى 60 تذكيرًا. افتح التطبيق دوريًا لتحديثها.','On your phone, up to 60 reminders are scheduled locally for the coming week. Open the app regularly to refresh them.')}</Label>
        <Pill title={copy(reminders.permission==='granted' && reminders.preferences.enabled?'تنبيهات الجهاز مفعّلة':'التنبيه داخل التطبيق متاح',reminders.permission==='granted' && reminders.preferences.enabled?'Device notifications enabled':'In-app alerts available')} />
        <Button title={reminders.testAt?copy('انتظر تنبيه التجربة…','Waiting for test reminder…'):copy('جرّب تنبيهًا بعد 5 ثوانٍ','Test a reminder in 5 seconds')} secondary onPress={()=>{void reminders.test();}} />
      </View>
      <Section title={copy('تسجيل الجرعات الفائتة تلقائيًا','Automatic missed-dose records')} />
      <View style={[s.card,{gap:14}]}><View style={[s.between,row]}><Label style={s.medium}>{copy('التسجيل التلقائي','Automatic recording')}</Label><Switch accessibilityLabel={copy('تسجيل الفائتة تلقائيًا','Automatically record missed doses')} disabled={!reminders.ready || busy} value={reminders.preferences.automaticMissed} onValueChange={reminders.toggleAutomatic} trackColor={{false:'#D1D9D2',true:c.green}} thumbColor={c.white} /></View>
        <Label>{copy('من وقت التفعيل، أي جرعة مجدولة تمر المدة التالية بعد تذكيرها بدون تأكيد تُحفظ كفائتة. هذا يسجّل عدم التأكيد، ولا يثبت أن الدواء لم يؤخذ.','From activation, upcoming scheduled doses without confirmation after this window are saved as missed. This records a lack of confirmation, not proof that medication was not taken.')}</Label>
        <Label style={s.medium}>{copy('مدة الانتظار بعد التذكير','Wait after the reminder')}</Label><View style={[row,{gap:8,flexWrap:'wrap'}]}>{[15,30,60,120].map(minutes=><Pressable key={minutes} accessibilityRole="radio" accessibilityLabel={`${minutes} ${copy('دقيقة','minutes')}`} accessibilityState={{checked:reminders.preferences.graceMinutes===minutes}} disabled={busy} onPress={()=>reminders.setGrace(minutes)} style={{padding:12,borderRadius:10,backgroundColor:reminders.preferences.graceMinutes===minutes?'#CDE4C3':'#EDF1E9'}}><Label>{minutes} {copy('دقيقة','min')}</Label></Pressable>)}</View>
        <Label style={s.small}>{copy('الحفظ في الداتابيز يتم أثناء فتح التطبيق أو عند العودة إليه مع اتصال بالإنترنت، بمراجعة آخر 7 أيام. الجرعات السابقة للتفعيل لا تُسجل تلقائيًا. يمكن تصحيح الحالة وكتابة السبب من «السجل» بعد تفعيل تحديث الخدمة.','Database sync runs while the app is open or when you return online, reviewing the last 7 days. Doses before activation are excluded. Outcomes can be corrected with a reason in History after the service update.')}</Label>
      </View><Label style={s.small}>{copy('إعدادات التنبيه والتأجيل تخص الحساب على هذا الجهاز. التأجيل يغيّر التذكير فقط، ولا يغيّر ميعاد الوصفة.','Reminder and snooze settings are per account on this device. Snoozing changes the reminder, not the prescription time.')}</Label>
    </>}
    {(tab==='home' || tab==='schedule') && <>
      <Section title={tab==='home' ? copy('جرعات اليوم','Today’s doses') : copy('جدول الجرعات','Dose schedule')} />
      {tab==='schedule' && <View style={[row,{flexWrap:'wrap',gap:6,marginBottom:16}]}>{Array.from({length:7},(_,i)=>dayOffset(today,i-3)).map(day=><Pressable key={day} accessibilityRole="button" accessibilityLabel={day} onPress={()=>select(day)} style={{padding:10,borderRadius:10,backgroundColor:day===selected?'#CDE4C3':'#EDF1E9'}}><Label>{day.slice(5)}</Label></Pressable>)}</View>}
      <Label style={s.small}>{tab==='home'?today:selected} · {data.profile?.timezone || 'Africa/Cairo'}</Label>
      {doses.length===0 && <View style={s.card}><Label>{copy('لا توجد جرعات مجدولة لهذا اليوم.','No scheduled doses for this day.')}</Label></View>}
      {doses.map(dose => <View key={dose.schedule.id} style={[s.card,{marginVertical:8,gap:10}]}>
        <View style={[s.between,row]}><Label style={s.sectionTitle}>{dose.medication.drugName}</Label><Pill title={dose.schedule.scheduledTime.slice(0,5)} /></View>
        <Label>{dose.medication.dosage} {dose.medication.unit || ''}</Label>
        {!!dose.medication.instructions && <Label style={s.body}>{dose.medication.instructions}</Label>}
        {dose.record ? <Pill title={labels[dose.record.status] || dose.record.status} /> : <>
          <Label style={s.small}>{copy('سجّل الحالة بعد حلول موعد الجرعة.','Record the outcome once the dose is due.')}</Label>
          {(reminders.preferences.snoozes[occurrenceKey(dose.schedule.id,dose.day)] || 0)>reminders.now && <Label style={s.small}>{copy('التذكير مؤجل حتى: ','Reminder snoozed until: ')}{new Date(reminders.preferences.snoozes[occurrenceKey(dose.schedule.id,dose.day)]).toLocaleTimeString(rtl?'ar-EG':'en-GB',{hour:'2-digit',minute:'2-digit',timeZone:data.profile?.timezone || 'Africa/Cairo'})}</Label>}
          <View pointerEvents={busy || !doseIsDue(dose.day,dose.schedule.scheduledTime,data.profile?.timezone,now)?'none':'auto'} style={busy || !doseIsDue(dose.day,dose.schedule.scheduledTime,data.profile?.timezone,now)?{opacity:0.5}:undefined}><Button title={copy('أخذت الجرعة','I took this dose')} onPress={()=>{void run(()=>api.recordDose({scheduleId:dose.schedule.id,day:dose.day,status:'taken'})).catch(()=>{});}} />
          <View style={{height:8}} /><Button title={copy('لم آخذ الجرعة','I missed this dose')} secondary onPress={()=>{void run(()=>api.recordDose({scheduleId:dose.schedule.id,day:dose.day,status:'missed'})).catch(()=>{});}} /><View style={{height:8}} /><Button title={copy('ذكّرني بعد 15 دقيقة','Remind me in 15 minutes')} secondary onPress={()=>reminders.snooze(dose.schedule.id,dose.day)} />{(reminders.preferences.snoozes[occurrenceKey(dose.schedule.id,dose.day)] || 0)>reminders.now && <><View style={{height:8}} /><Button title={copy('إلغاء التأجيل','Cancel snooze')} secondary onPress={()=>reminders.cancelSnooze(dose.schedule.id,dose.day)} /></>}</View>
        </>}
      </View>)}
      {tab==='home' && <><Section title={copy('أدويتي','My medications')} />{data.medications.length===0 && <View style={s.card}><Icon name="medical-outline" color={c.green} /><Label>{copy('لا توجد أدوية مسجلة. تظهر هنا الأدوية التي يضيفها الطبيب لحسابك.','No medications yet. Your doctor’s assigned medications will appear here.')}</Label></View>}{data.medications.map(m=><View key={m.id} style={[s.card,{marginBottom:10}]}><Label style={s.medium}>{m.drugName}</Label><Label>{m.dosage} {m.unit || ''}</Label><Label style={s.small}>{m.startDate} — {m.endDate || copy('غير محدد','No end date')}</Label>{!!m.instructions && <Label>{m.instructions}</Label>}</View>)}</>}
    </>}
    {tab==='history' && <DoseHistory data={data} busy={busy} run={run} />}
    {tab==='medications' && <PersonalMedications data={data} busy={busy} run={run} />}
    {tab==='inbox' && <PatientInbox data={data} busy={busy} run={run} />}
    {tab==='links' && <PatientLinks data={data} busy={busy} run={run} />}
    {tab==='profile' && <><Section title={copy('بيانات المريض','Patient details')} /><Label style={s.small}>{data.user.email}</Label><Label style={s.body}>{copy('البيانات التالية تُحفظ في حسابك على السيرفر. الحقول غير الاسم اختيارية.','These details are saved to your cloud account. Fields other than name are optional.')}</Label><View style={{gap:10,marginVertical:20}}>{fields.map(field=><View key={field.key} style={{gap:8}}><Label>{copy(field.ar,field.en)}</Label><TextInput accessibilityLabel={copy(field.ar,field.en)} style={[fieldStyle,direction]} value={form[field.key] || ''} maxLength={field.max} multiline={field.multiline} editable={!busy} onChangeText={value=>{setSaved(false);setForm({...form,[field.key]:field.key==='fullName' ? value : value || null});}} /></View>)}
      <Label>{copy('النوع (اختياري)','Gender (optional)')}</Label><View style={[row,{gap:12}]}>{[[null,copy('غير محدد','Unspecified')],['male',copy('ذكر','Male')],['female',copy('أنثى','Female')]].map(([value,title])=><Pressable key={String(value)} disabled={busy} accessibilityRole="radio" accessibilityState={{checked:form.gender===value}} onPress={()=>{setSaved(false);setForm({...form,gender:value as PatientProfileInput['gender']});}} style={{padding:12,backgroundColor:form.gender===value?'#CDE4C3':'#EDF1E9',borderRadius:12}}><Label>{title}</Label></Pressable>)}</View></View>
      {!!formError && <View accessibilityRole="alert"><Label>{formError}</Label></View>}{saved && <View accessibilityRole="alert"><Label>{copy('تم حفظ بياناتك في الداتابيز بنجاح.','Your details were saved to the database.')}</Label></View>}<View pointerEvents={busy?'none':'auto'}><Button title={copy('حفظ بياناتي','Save my details')} onPress={()=>{void save();}} /></View><PatientSettings data={data} busy={busy} run={run} />
    </>}
  </>;
}

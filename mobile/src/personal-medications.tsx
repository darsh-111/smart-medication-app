import React,{useState} from 'react';
import {Modal,Pressable,ScrollView,Switch,TextInput,View} from 'react-native';
import {randomUUID} from 'expo-crypto';
import {api,type PatientMedication,type PatientOverview,type PersonalMedicationInput} from './api';
import {usePatient} from './patient';
import {Button,Label,Pill,Section} from './components';
import {styles as s,colors as c} from './theme';
import {patientDay} from './live-domain';
import {normalizeDigits,validatePersonalMedication} from './patient-forms';
type Props={data:PatientOverview;busy:boolean;run:(action:()=>Promise<PatientOverview>)=>Promise<void>};
export function PersonalMedications({data,busy,run}:Props){
 const {rtl,row,direction}=usePatient();const copy=(ar:string,en:string)=>rtl?ar:en;
 const enabled=!!data.features?.personalMedications;
 const [draft,setDraft]=useState<PersonalMedicationInput|null>(null),[editing,setEditing]=useState<string|null>(null),[times,setTimes]=useState('08:00'),[error,setError]=useState(''),[message,setMessage]=useState('');
 const [needed,setNeeded]=useState<{medication:PatientMedication;requestId:string;notes:string}|null>(null);
 const field={borderWidth:1,borderColor:c.line,borderRadius:12,padding:13,fontSize:15,color:c.ink,backgroundColor:c.white} as const;
 function open(medication?:PatientMedication){
  const schedules=data.schedules.filter(item=>item.medicationId===medication?.id);
  setEditing(medication?.id || null);setTimes(schedules.filter(item=>item.frequency!=='as_needed').map(item=>item.scheduledTime.slice(0,5)).join(', ') || '08:00');setError('');
  setDraft({requestId:randomUUID(),revision:medication?.revision,drugName:medication?.drugName || '',dosage:medication?.dosage || '',unit:medication?.unit || null,instructions:medication?.instructions || null,withFood:medication?.withFood || false,mealTiming:medication?.mealTiming || null,startDate:medication?.startDate || patientDay(data.profile?.timezone),endDate:medication?.endDate || null,frequency:(schedules[0]?.frequency as PersonalMedicationInput['frequency']) || 'daily',times:[],days:(schedules[0]?.days || '').split(',').filter(Boolean).map(Number)});
 }
 async function save(){
  if(!draft || !enabled || busy)return;
  const input={...draft,startDate:normalizeDigits(draft.startDate.trim()),endDate:draft.endDate?normalizeDigits(draft.endDate.trim()):null,times:draft.frequency==='as_needed'?[]:normalizeDigits(times).split(/[,،]/).map(value=>value.trim()).filter(Boolean)};
  const issue=validatePersonalMedication(input);
  if(issue){setError(copy(({name:'اكتب اسم الدواء.',dosage:'اكتب الجرعة.',dates:'راجع تاريخ البداية والنهاية.',times:'اكتب مواعيد صحيحة ومختلفة، مثل 08:00, 20:00.',days:'اختر يومًا واحدًا على الأقل.'})[issue],({name:'Enter the medicine name.',dosage:'Enter the dosage.',dates:'Check the start and end dates.',times:'Enter distinct 24-hour times, such as 08:00, 20:00.',days:'Choose at least one weekday.'})[issue]));return;}
  try{await run(()=>editing?api.updatePersonalMedication(editing,input):api.createPersonalMedication(input));setDraft(null);setMessage(copy('تم حفظ الدواء الشخصي ومواعيده.','Personal medication and schedule saved.'));}catch{setError(copy('تعذّر الحفظ. راجع الاتصال، أو حدّث البيانات إذا عُدّل الدواء من جهاز آخر.','Could not save. Check connectivity, or refresh if the medicine was edited elsewhere.'));}
 }
 async function active(medication:{id:string;revision?:number},value:boolean){try{await run(()=>api.setMedicationActive(medication.id,medication.revision || 0,value));setMessage(copy(value?'تمت إعادة الدواء للجدول.':'تم إيقاف الدواء مع الاحتفاظ بسجله.',value?'Medication restored to the schedule.':'Medication archived; history was preserved.'));}catch{setMessage(copy('تعذّر التحديث. حدّث البيانات وحاول مجددًا.','Could not update. Refresh and try again.'));}}
 return <>
  <Section title={copy('الأدوية والوصفات','Medications and prescriptions')} />
  <Label style={s.body}>{copy('يمكنك إدارة الأدوية التي تضيفها بنفسك. وصفات الطبيب تظهر للعرض، ولا تتغير من هنا.','Manage medicines you add yourself. Doctor prescriptions are shown for viewing and cannot be edited here.')}</Label>
  {!enabled && <View style={s.card}><Label>{copy('إضافة الأدوية جاهزة في الواجهة، وتنتظر تفعيل تحديث الخدمة قبل الحفظ.','The medication form is ready. Saving awaits the service update.')}</Label></View>}
  <View style={{marginVertical:15}}><Button title={copy('إضافة دواء شخصي','Add a personal medication')} onPress={()=>open()} /></View>
  {!!message && <View accessibilityRole="alert" style={s.card}><Label>{message}</Label></View>}
  {data.medications.length===0 && <Label>{copy('لا توجد أدوية مسجلة بعد.','No medications yet.')}</Label>}
  {data.medications.map(medication=><View key={medication.id} style={[s.card,{gap:10,marginVertical:8}]}>
   <View style={[s.between,row]}><Label style={s.medium}>{medication.drugName}</Label><Pill title={medication.source==='personal'?copy('دواء شخصي','Personal'):copy('وصفة طبيب','Prescribed')} /></View>
   <Label>{medication.dosage} {medication.unit || ''}</Label>{!!medication.instructions && <Label>{medication.instructions}</Label>}<Label style={s.small}>{medication.startDate} — {medication.endDate || copy('بدون نهاية محددة','No end date')}</Label>
   {data.schedules.filter(item=>item.medicationId===medication.id).map(schedule=><Label key={schedule.id} style={s.small}>{schedule.frequency==='as_needed'?copy('عند الحاجة','As needed'):schedule.scheduledTime.slice(0,5)}{schedule.frequency==='specific_days'?` · ${schedule.days}`:''}</Label>)}
   {enabled && data.schedules.some(item=>item.medicationId===medication.id && item.frequency==='as_needed') && <Button title={copy('تسجيل جرعة عند الحاجة','Record an as-needed dose')} disabled={busy} onPress={()=>{setError('');setNeeded({medication,requestId:randomUUID(),notes:''});}} />}
   {enabled && medication.source==='personal' && <><Button title={copy('تعديل الدواء ومواعيده','Edit medication and schedule')} secondary disabled={busy} onPress={()=>open(medication)} /><Button title={copy('إيقاف وأرشفة الدواء','Archive medication')} secondary disabled={busy} onPress={()=>{void active(medication,false);}} /></>}
  </View>)}
  {!!data.archivedMedications?.length && <Section title={copy('الأدوية الشخصية المؤرشفة','Archived personal medications')} />}{data.archivedMedications?.map(medication=><View key={medication.id} style={[s.card,{gap:10,marginVertical:8}]}><Label>{medication.drugName}</Label><Button title={copy('إعادة للجدول','Restore to schedule')} secondary disabled={busy || !enabled} onPress={()=>{void active(medication,true);}} /></View>)}
  <Modal visible={!!draft} transparent animationType="fade" onRequestClose={()=>{if(!busy)setDraft(null);}}><View style={s.overlay}><ScrollView style={s.modal} contentContainerStyle={{gap:12,paddingBottom:24}} keyboardShouldPersistTaps="handled">
   <Label style={s.title}>{copy(editing?'تعديل دواء شخصي':'إضافة دواء شخصي',editing?'Edit personal medication':'Add personal medication')}</Label>
   <Label style={s.small}>{copy('الجدول الجديد يبدأ من المواعيد القادمة. تعديل المواعيد لا يعيد إنشاء جرعات سابقة، والسجل القديم يظل محفوظًا.','The new schedule starts with upcoming times. Editing times does not recreate past doses; existing history is preserved.')}</Label>
   {draft && <>
    <Label>{copy('اسم الدواء','Medication name')}</Label><TextInput accessibilityLabel={copy('اسم الدواء','Medication name')} style={[field,direction]} value={draft.drugName} maxLength={150} editable={!busy} onChangeText={value=>setDraft({...draft,drugName:value})} />
    <Label>{copy('الجرعة كما تستخدمها','Your dosage')}</Label><TextInput accessibilityLabel={copy('الجرعة','Dosage')} style={[field,direction]} value={draft.dosage} maxLength={150} editable={!busy} onChangeText={value=>setDraft({...draft,dosage:value})} />
    <Label>{copy('وحدة الجرعة (اختياري)','Unit (optional)')}</Label><View style={[row,{gap:6,flexWrap:'wrap'}]}>{[null,'mg','ml','tablet','drop'].map(value=><Pressable key={String(value)} disabled={busy} accessibilityRole="radio" accessibilityState={{checked:draft.unit===value}} onPress={()=>setDraft({...draft,unit:value})} style={{padding:10,borderRadius:10,backgroundColor:draft.unit===value?'#CDE4C3':'#EDF1E9'}}><Label>{value || copy('غير محددة','Unspecified')}</Label></Pressable>)}</View>
    <Label>{copy('تاريخ البداية (YYYY-MM-DD)','Start date (YYYY-MM-DD)')}</Label><TextInput accessibilityLabel={copy('تاريخ بداية الدواء','Medication start date')} style={field} value={draft.startDate} editable={!busy} onChangeText={value=>setDraft({...draft,startDate:value})} />
    <Label>{copy('تاريخ النهاية — اختياري','End date — optional')}</Label><TextInput accessibilityLabel={copy('تاريخ نهاية الدواء','Medication end date')} style={field} value={draft.endDate || ''} editable={!busy} onChangeText={value=>setDraft({...draft,endDate:value || null})} />
    <Label>{copy('التكرار','Frequency')}</Label><View style={[row,{gap:8,flexWrap:'wrap'}]}>{[['daily',copy('يوميًا','Daily')],['specific_days',copy('أيام محددة','Specific days')],['as_needed',copy('عند الحاجة','As needed')]].map(([value,label])=><Pressable key={value} disabled={busy} accessibilityRole="radio" accessibilityState={{checked:draft.frequency===value}} onPress={()=>setDraft({...draft,frequency:value as PersonalMedicationInput['frequency']})} style={{padding:10,borderRadius:10,backgroundColor:draft.frequency===value?'#CDE4C3':'#EDF1E9'}}><Label>{label}</Label></Pressable>)}</View>
    {draft.frequency!=='as_needed' && <><Label>{copy('المواعيد بنظام 24 ساعة، مثل 08:00, 20:00','24-hour times, such as 08:00, 20:00')}</Label><TextInput accessibilityLabel={copy('مواعيد الدواء','Medication times')} style={field} value={times} editable={!busy} onChangeText={setTimes} /></>}
    {draft.frequency==='specific_days' && <View style={[row,{gap:6,flexWrap:'wrap'}]}>{(rtl?['الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد']:['Mon','Tue','Wed','Thu','Fri','Sat','Sun']).map((day,index)=><Pressable key={day} accessibilityRole="checkbox" accessibilityState={{checked:draft.days.includes(index+1)}} disabled={busy} onPress={()=>setDraft({...draft,days:draft.days.includes(index+1)?draft.days.filter(value=>value!==index+1):[...draft.days,index+1]})} style={{padding:10,borderRadius:10,backgroundColor:draft.days.includes(index+1)?'#CDE4C3':'#EDF1E9'}}><Label>{day}</Label></Pressable>)}</View>}
    <Label>{copy('ملاحظات وتعليمات (اختياري)','Notes and instructions (optional)')}</Label><TextInput accessibilityLabel={copy('تعليمات الدواء','Medication instructions')} multiline style={[field,direction]} value={draft.instructions || ''} maxLength={2000} editable={!busy} onChangeText={value=>setDraft({...draft,instructions:value || null})} />
    <View style={[s.between,row]}><Label>{copy('مرتبط بالطعام','With food')}</Label><Switch accessibilityLabel={copy('مرتبط بالطعام','With food')} value={draft.withFood} disabled={busy} onValueChange={value=>setDraft({...draft,withFood:value,mealTiming:value?'with':null})} /></View>
    {!!error && <View accessibilityRole="alert"><Label>{error}</Label></View>}{!enabled && <Label style={s.small}>{copy('يمكنك مراجعة النموذج الآن. الحفظ يتاح بعد تفعيل تحديث الخدمة.','You can review this form now. Saving is available after the service update.')}</Label>}
    <Button title={copy('حفظ الدواء','Save medication')} disabled={busy || !enabled} onPress={()=>{void save();}} /><Button title={copy('إلغاء','Cancel')} secondary disabled={busy} onPress={()=>setDraft(null)} />
   </>}
  </ScrollView></View></Modal>
  <Modal visible={!!needed} transparent animationType="fade" onRequestClose={()=>{if(!busy)setNeeded(null);}}><View style={s.overlay}><View style={[s.modal,{gap:12}]}><Label style={s.title}>{copy('تأكيد تسجيل جرعة عند الحاجة','Confirm an as-needed dose')}</Label><Label>{needed?.medication.drugName} · {needed?.medication.dosage}</Label><Label>{copy('سيُحفظ وقت التسجيل الحالي في السجل.','The current time will be saved in your dose history.')}</Label><TextInput accessibilityLabel={copy('ملاحظة الجرعة','Dose note')} style={[field,direction]} value={needed?.notes || ''} maxLength={1000} onChangeText={value=>{if(needed)setNeeded({...needed,notes:value});}} editable={!busy} />{!!error && <Label>{error}</Label>}<Button title={copy('تأكيد أخذ الجرعة','Confirm dose taken')} disabled={busy} onPress={()=>{if(needed)void run(()=>api.recordAsNeeded({medicationId:needed.medication.id,requestId:needed.requestId,notes:needed.notes})).then(()=>setNeeded(null)).catch(()=>setError(copy('تعذّر تسجيل الجرعة. حاول مجددًا.','Could not record this dose. Try again.')));}} /><Button title={copy('إلغاء','Cancel')} secondary disabled={busy} onPress={()=>setNeeded(null)} /></View></View></Modal>
 </>;
}

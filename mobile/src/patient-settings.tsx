import React,{useEffect,useState} from 'react';
import {Pressable,Switch,TextInput,View} from 'react-native';
import {api,type PatientOverview} from './api';
import {usePatient} from './patient';
import {Button,Label,Section} from './components';
import {styles as s,colors as c} from './theme';
export function PatientSettings({data,busy,run}:{data:PatientOverview;busy:boolean;run:(action:()=>Promise<PatientOverview>)=>Promise<void>}){
 const {rtl,row,setState}=usePatient();const copy=(ar:string,en:string)=>rtl?ar:en;
 const [language,setLanguage]=useState<'ar'|'en'>(data.user.preferredLanguage==='en'?'en':'ar');
 const [timezone,setTimezone]=useState(data.profile?.timezone || 'Africa/Cairo');
 const [box,setBox]=useState(data.settings?.useSmartBox || false);const [message,setMessage]=useState('');
 useEffect(()=>{setLanguage(data.user.preferredLanguage==='en'?'en':'ar');setTimezone(data.profile?.timezone || 'Africa/Cairo');setBox(data.settings?.useSmartBox || false);},[data.user.preferredLanguage,data.profile?.timezone,data.settings?.useSmartBox]);
 async function save(){
  try{new Intl.DateTimeFormat('en',{timeZone:timezone.trim()}).format(new Date());}catch{setMessage(copy('اكتب منطقة زمنية صحيحة مثل Africa/Cairo.','Enter a valid timezone such as Africa/Cairo.'));return;}
  try{await run(()=>api.saveSettings({language,timezone:timezone.trim(),useSmartBox:box}));setState(previous=>({...previous,language}));setMessage(copy('تم حفظ إعدادات الحساب.','Account settings saved.'));}catch{setMessage(copy('تعذّر حفظ الإعدادات.','Could not save settings.'));}
 }
 return <><Section title={copy('إعدادات الحساب','Account settings')} /><View style={[s.card,{gap:14}]}>
  <Label style={s.medium}>{copy('اللغة الافتراضية للحساب','Default account language')}</Label><View style={[row,{gap:12}]}>{[['ar','العربية'],['en','English']].map(([value,title])=><Pressable key={value} disabled={busy} accessibilityRole="radio" accessibilityState={{checked:language===value}} onPress={()=>setLanguage(value as 'ar'|'en')} style={{padding:12,borderRadius:10,backgroundColor:language===value?'#CDE4C3':'#EDF1E9'}}><Label>{title}</Label></Pressable>)}</View>
  <Label>{copy('المنطقة الزمنية للمواعيد','Schedule timezone')}</Label><TextInput accessibilityLabel={copy('المنطقة الزمنية','Timezone')} value={timezone} onChangeText={setTimezone} editable={!busy} autoCapitalize="none" autoCorrect={false} style={{borderWidth:1,borderColor:c.line,borderRadius:12,padding:14,color:c.ink,backgroundColor:c.white}} />
  <View style={[s.between,row]}><Label>{copy('استخدام الصندوق الذكي','Use a smart box')}</Label><Switch accessibilityLabel={copy('استخدام الصندوق الذكي','Use a smart box')} value={box} onValueChange={setBox} disabled={busy} /></View><Label style={s.small}>{copy('يمكنك استخدام التطبيق بدون صندوق. تغيير المنطقة الزمنية يغيّر تفسير المواعيد المحلية القادمة.','You can use the app without a box. Changing timezone changes how future local schedule times are interpreted.')}</Label>
  {!data.features?.settings && <Label style={s.small}>{copy('حفظ هذه الإعدادات ينتظر تفعيل تحديث الخدمة.','Saving these settings awaits the service update.')}</Label>}
  <Button title={copy('حفظ إعدادات الحساب','Save account settings')} disabled={busy || !data.features?.settings} onPress={()=>{void save();}} />{!!message && <View accessibilityRole="alert"><Label>{message}</Label></View>}
 </View></>;
}

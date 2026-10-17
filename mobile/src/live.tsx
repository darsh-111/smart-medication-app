import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, ApiError, DEFAULT_API_URL, setAccessToken, setApiBaseUrl, type AuthResponse, type PatientOverview } from './api';
import { readSavedSession, sessionToSave } from './session-core';
import { deleteSession, readSession, sessionStorageLabel, writeSession } from './session-storage';
import { LiveDashboard } from './live-dashboard';
import { usePatient } from './patient';
import { Brand, Button, Label, LanguageButton, Pill } from './components';
import { styles as s, colors as c } from './theme';

export function LivePatient({ onBack }: { onBack: () => void }) {
  const { rtl, state, setState, row, direction } = usePatient();
  const copy = (ar: string, en: string) => rtl ? ar : en;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [remember,setRemember]=useState(false);
  const [restoring,setRestoring]=useState(true);
  const [expiresAt,setExpiresAt]=useState(0);
  const operation=useRef(false);
  const [register, setRegister] = useState(false);
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [overview, setOverview] = useState<PatientOverview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState<Date | null>(null);
  const generation = useRef(0);
  useEffect(() => {
    let active=true;const restoreGeneration=generation.current;setApiBaseUrl(DEFAULT_API_URL);
    void (async()=>{
      try {
        const saved=readSavedSession(await readSession(),DEFAULT_API_URL);
        if(!active || generation.current!==restoreGeneration)return;
        if(!saved){await deleteSession();return;}
        setRemember(true);setExpiresAt(saved.expiresAt);setAccessToken(saved.auth.accessToken);setSession(saved.auth);
        try {const data=await api.overview();if(!active || generation.current!==restoreGeneration)return;if(data.user.id!==saved.auth.userId)throw new ApiError(403);setOverview(data);setUpdated(new Date());setState(previous=>({...previous,language:data.user.preferredLanguage==='en'?'en':'ar'}));}
        catch(reason){if(!active || generation.current!==restoreGeneration)return;if(reason instanceof ApiError && [401,403].includes(reason.status)){setAccessToken(null);setSession(null);await deleteSession();}setError(describe(reason));}
      }catch{ /* Sign-in remains available if storage is blocked. */ }
      finally {if(active)setRestoring(false);}
    })();
    return()=>{active=false;generation.current++;setAccessToken(null);};
  }, []);
  useEffect(()=>{if(!session || !expiresAt)return;const timer=setTimeout(()=>{logout();setError(copy('انتهت الجلسة. سجّل الدخول مجددًا.','Your session expired. Sign in again.'));},Math.max(0,expiresAt-Date.now()));return()=>clearTimeout(timer);},[session,expiresAt]);
  const describe = (reason: unknown) => {
    if (reason instanceof ApiError) {
      if (reason.status === 401) return copy('البريد أو كلمة المرور غير صحيحة، أو الجلسة انتهت. سجّل الدخول مجددًا.', 'Invalid credentials or expired session. Sign in again.');
      if (reason.status === 403) return copy('الواجهة مخصصة لحساب مريض.', 'A patient account is required.');
      if (reason.status === 404) return copy('الخدمة غير متاحة حاليًا. حاول مجددًا بعد قليل.', 'The service is currently unavailable. Please try again shortly.');
      if (reason.status === 409) return copy('البيانات موجودة بالفعل. حدّث الصفحة للتأكد من الحالة؛ ولو بتنشئ حسابًا جرّب الدخول.', 'This entry already exists. Refresh to check its state; if registering, try signing in.');
      if (reason.status === 400) return copy('راجع البيانات المطلوبة ثم حاول مجددًا.', 'Check the required details and try again.');
      return copy('الباك إند لم يستطع إكمال الطلب. حاول مجددًا.', 'The backend could not complete the request. Try again.');
    }
    return copy('تعذّر الاتصال. تأكد من الإنترنت وحاول مجددًا بعد دقيقة.', 'Connection failed. Check your internet and try again after a minute.');
  };
  const logout = () => { operation.current=false;setExpiresAt(0);void deleteSession().catch(()=>{});setError('');generation.current++; setAccessToken(null); setSession(null); setOverview(null); setPassword(''); setUpdated(null); setBusy(false); };
  async function authenticate() {
    if (operation.current || restoring) return;
    if (!email.trim() || !password || (register && (!name.trim() || password.length < 8))) { setError(copy('اكتب البريد وكلمة المرور. لإنشاء حساب اكتب الاسم وكلمة مرور من 8 أحرف على الأقل.', 'Enter email and password. Registration requires a name and at least 8 password characters.')); return; }
    setApiBaseUrl(DEFAULT_API_URL);
    const current = ++generation.current;
    operation.current=true;
    setBusy(true); setError(''); setAccessToken(null);
    try {
      await deleteSession().catch(()=>{});
      const auth = register ? await api.register({ fullName: name.trim(), email: email.trim().toLowerCase(), password, role: 'patient', preferredLanguage: state.language }) : await api.login(email, password);
      if (current !== generation.current) return;
      if (auth.role !== 'patient') throw new ApiError(403);
      const saved=sessionToSave(auth,DEFAULT_API_URL);setExpiresAt(saved.expiresAt);
      setAccessToken(auth.accessToken); setSession(auth); setPassword('');
      if(remember)try{await writeSession(JSON.stringify(saved));}catch{setError(copy('تم الدخول، لكن تعذّر حفظ الجلسة على هذا الجهاز.','Signed in, but this device could not save the session.'));}
      const data = await api.overview();
      if(data.user.id!==auth.userId)throw new ApiError(403);
      if (current === generation.current) { setOverview(data); setUpdated(new Date());setState(previous=>({...previous,language:data.user.preferredLanguage==='en'?'en':'ar'})); }
    } catch (reason) {
      if (current === generation.current) { setError(describe(reason)); if (reason instanceof ApiError && [401,403].includes(reason.status)) { setAccessToken(null); setSession(null); setOverview(null);void deleteSession().catch(()=>{}); } }
    } finally { if (current === generation.current) {operation.current=false;setBusy(false);} }
  }
  async function refresh() {
    if (operation.current || restoring) return;
    const current = ++generation.current;operation.current=true;setBusy(true);setError('');
    try { const data = await api.overview(); if (current === generation.current) { setOverview(data); setUpdated(new Date()); } }
    catch (reason) { if (current === generation.current) { if (reason instanceof ApiError && reason.status === 401) logout(); setError(describe(reason)); } }
    finally { if (current === generation.current) {operation.current=false;setBusy(false);} }
  }
  const field = { borderWidth: 1, borderColor: c.line, borderRadius: 14, padding: 14, color: c.ink, backgroundColor: c.white, fontSize: 15 } as const;
  return <SafeAreaView style={s.safe}><View style={s.frame}><View style={[s.top,row]}><Brand /><LanguageButton /></View><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <View style={[s.between,row]}><Pill title={copy('حساب حقيقي', 'Live account')} /><Pressable accessibilityRole="button" onPress={() => { logout(); onBack(); }}><Label style={s.link}>{copy('العرض التجريبي', 'Demo preview')}</Label></Pressable></View>
    <Label style={[s.title,{marginTop:20}]}>{session ? overview?.user.fullName || copy('حساب المريض', 'Patient account') : copy(register ? 'إنشاء حساب مريض' : 'تسجيل الدخول', register ? 'Create a patient account' : 'Sign in')}</Label>
    {restoring && <ActivityIndicator color={c.green} style={{marginVertical:20}} />}
    {!session && !restoring && <><Label style={s.body}>{copy('سجّل الدخول لمتابعة أدويتك ومواعيدك.', 'Sign in to view your medications and schedule.')}</Label><View style={{gap:10,marginVertical:20}}>
      {register && <><Label>{copy('الاسم الكامل','Full name')}</Label><TextInput style={[field,direction]} accessibilityLabel={copy('الاسم الكامل','Full name')} value={name} onChangeText={setName} editable={!busy} /></>}
      <Label>{copy('البريد الإلكتروني','Email')}</Label><TextInput style={field} accessibilityLabel={copy('البريد الإلكتروني','Email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} editable={!busy} />
      <Label>{copy('كلمة المرور','Password')}</Label><TextInput style={field} accessibilityLabel={copy('كلمة المرور','Password')} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" editable={!busy} />

    </View><View style={[s.between,row,{marginBottom:18}]}><Label style={s.body}>{copy(sessionStorageLabel==='tab'?'احتفظ بالدخول في هذا التبويب':'احتفظ بالدخول على هذا الجهاز',sessionStorageLabel==='tab'?'Keep me signed in in this tab':'Keep me signed in on this device')}</Label><Switch accessibilityLabel={copy('الاحتفاظ بتسجيل الدخول','Keep me signed in')} value={remember} onValueChange={setRemember} disabled={busy} /></View><View pointerEvents={busy ? 'none':'auto'} style={busy ? {opacity:0.6}:undefined}><Button title={copy(register ? 'إنشاء الحساب' : 'دخول', register ? 'Create account' : 'Sign in')} onPress={authenticate} /></View><Pressable accessibilityRole="button" onPress={() => { if (!busy) { setRegister(!register); setError(''); } }} style={{padding:18}}><Label style={s.link}>{copy(register ? 'عندي حساب بالفعل' : 'إنشاء حساب جديد', register ? 'I already have an account' : 'Create an account')}</Label></Pressable><Label style={s.small}>{copy('كلمة المرور لا تُحفظ. خيار الاحتفاظ بالدخول يحفظ الجلسة حتى انتهاء صلاحيتها؛ في المتصفح تنتهي عند إغلاق التبويب.', 'Your password is never saved. Keeping signed in stores the session until it expires; browser storage ends when this tab closes.')}</Label></>}
    {busy && <ActivityIndicator color={c.green} style={{marginVertical:16}} />}
    {!!error && <View accessibilityRole="alert" style={[s.card,{marginTop:14,borderWidth:1,borderColor:'#B16D57'}]}><Label>{error}</Label><Pressable accessibilityRole="link" onPress={() => { void Linking.openURL(`${DEFAULT_API_URL}/swagger-ui/index.html`).catch(() => {}); }}><Label style={s.link}>{copy('تنشيط الاتصال', 'Wake connection')}</Label></Pressable></View>}
    {session && <><View style={{gap:10,marginTop:20}}><View pointerEvents={busy ? 'none':'auto'}><Button title={copy('تحديث البيانات','Refresh data')} onPress={refresh} /></View><Button title={copy('تسجيل الخروج','Sign out')} secondary onPress={logout} /></View>{updated && <Label style={[s.small,{marginTop:12}]}>{copy('آخر تحديث: ','Last updated: ')}{updated.toLocaleTimeString(rtl ? 'ar-EG':'en-GB')}</Label>}
      {overview && <LiveDashboard key={session.userId} overview={overview} busy={busy} run={async action => {
        if (operation.current) throw new Error('A request is already running');
        operation.current=true;const current = ++generation.current; setBusy(true); setError('');
        try { const data = await action(); if (current === generation.current) { setOverview(data); setUpdated(new Date()); } }
        catch(reason) { if(current === generation.current) { if(reason instanceof ApiError && [401,403].includes(reason.status)) logout(); setError(describe(reason)); } throw reason; }
        finally { if(current === generation.current) {operation.current=false;setBusy(false);} }
      }} />}
    </>}
  </ScrollView></View></SafeAreaView>;
}


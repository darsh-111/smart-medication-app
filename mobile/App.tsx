import React, { useState } from 'react';
import { LivePatient } from './src/live';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { PatientProvider, usePatient } from './src/patient';
import { styles as s, colors as c } from './src/theme';
import { Brand, Button, DemoNote, Icon, Label, LanguageButton, Pill } from './src/components';
import { Home, Welcome } from './src/home';
import { Inbox, Profile, Schedule } from './src/screens';
import { dateKey, type Medication } from './src/domain';
import type { Ionicons } from '@expo/vector-icons';

type Tab = 'home' | 'schedule' | 'inbox' | 'profile';
const tabs: { key: Tab; icon: React.ComponentProps<typeof Ionicons>['name']; active: React.ComponentProps<typeof Ionicons>['name'] }[] = [{ key: 'home', icon: 'home-outline', active: 'home' }, { key: 'schedule', icon: 'calendar-outline', active: 'calendar' }, { key: 'inbox', icon: 'notifications-outline', active: 'notifications' }, { key: 'profile', icon: 'person-outline', active: 'person' }];
export default function App() { return <SafeAreaProvider><PatientProvider><PatientApp /></PatientProvider></SafeAreaProvider>; }
function PatientApp() {
  const { ready, state, setState, row, t, today, formatDate, formatTime, status, record, notifications } = usePatient();
  const [tab, setTab] = useState<Tab>('home');
  const [live, setLive] = useState(true);
  const [selected, select] = useState(dateKey(new Date()));
  const [detail, setDetail] = useState<{ medication: Medication; day: string } | null>(null);
  const [reset, setReset] = useState(false);
  const open = (medication: Medication, day: string) => setDetail({ medication, day });
  const navigate = (value: Tab) => { if (value === 'schedule') select(today); setTab(value); };
  const unread = notifications.some(n => !state.readNotifications.includes(n.id));
  if (!ready) return <SafeAreaView style={[s.safe, { alignItems: 'center', justifyContent: 'center', gap: 15 }]}><ActivityIndicator color={c.green} /><Text style={s.small}>{t('loading')}</Text></SafeAreaView>;
  if (live) return <LivePatient onBack={() => setLive(false)} />;
  if (!state.entered) return <SafeAreaView style={s.safe}><StatusBar style="dark" /><ScrollView><Welcome onLive={() => setLive(true)} /></ScrollView></SafeAreaView>;
  return <SafeAreaView style={s.safe}><StatusBar style="dark" /><View style={s.frame}><View style={[s.top, row]}><View style={[s.row, row]}><Brand /><Pill title={t('demo')} muted /></View><LanguageButton /></View><ScrollView key={tab} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
    <View style={{ marginBottom: 20 }}><Button title={state.language === 'ar' ? 'تسجيل الدخول الحقيقي' : 'Sign in to live account'} secondary onPress={() => setLive(true)} /></View>{tab === 'home' ? <Home open={open} navigate={navigate} /> : tab === 'schedule' ? <Schedule selected={selected} select={select} open={open} /> : tab === 'inbox' ? <Inbox /> : <Profile reset={() => setReset(true)} exit={() => { setState(current => ({ ...current, entered: false })); setTab('home'); }} />}
  </ScrollView><View style={[s.tabs, row]}>{tabs.map(item => <Pressable key={item.key} accessibilityRole="tab" accessibilityLabel={t(item.key)} accessibilityState={{ selected: tab === item.key }} onPress={() => navigate(item.key)} style={s.tab}><View style={[s.tabIcon, item.key === tab && { backgroundColor: '#E6EFE0' }]}><Icon name={item.key === tab ? item.active : item.icon} color={item.key === tab ? c.green : c.muted} />{item.key === 'inbox' && unread && <View style={s.badge} />}</View><Text style={[s.tabLabel, item.key === tab && { color: c.green, fontWeight: '700' }]}>{t(item.key)}</Text></Pressable>)}</View></View>
    <Modal visible={!!detail} transparent animationType="fade" onRequestClose={() => setDetail(null)}><View style={s.overlay}><ScrollView style={s.modal} contentContainerStyle={{ paddingBottom: 24 }}><View style={[s.between, row]}><Label style={s.sectionTitle}>{t('doseDetails')}</Label><Pressable accessibilityRole="button" accessibilityLabel={t('close')} onPress={() => setDetail(null)} style={s.close}><Icon name="close" /></Pressable></View>{detail && <><View style={[s.detailIcon, { backgroundColor: detail.medication.color }]}><Icon name="medical-outline" size={40} /></View><Label style={s.title}>{t(detail.medication.name)}</Label><Label style={s.body}>{t('sampleDose')}</Label><View style={[s.detailTime, row]}><Icon name="time-outline" color={c.green} /><View style={s.flex}><Label style={s.small}>{t('scheduledFor')}</Label><Label style={s.medium}>{formatDate(detail.day, { day: 'numeric', month: 'long' })} · {formatTime(detail.medication.time)}</Label></View></View><Label style={s.medium}>{t('instructions')}</Label><Label style={s.body}>{t('sampleInstruction')}</Label><View style={{ marginTop: 24, gap: 10 }}>{status(detail.medication, detail.day) ? <><Pill title={t(status(detail.medication, detail.day)!)} /><Button title={t('undo')} secondary onPress={() => { record(detail.medication, detail.day, null); setDetail(null); }} /></> : <><Button title={t('record')} onPress={() => { record(detail.medication, detail.day, 'taken'); setDetail(null); }} /><Button title={t('recordMissed')} secondary onPress={() => { record(detail.medication, detail.day, 'missed'); setDetail(null); }} /></>}</View><DemoNote /></>}</ScrollView></View></Modal>
    <Modal visible={reset} transparent animationType="fade" onRequestClose={() => setReset(false)}><View style={s.overlay}><View style={s.modal}><Label style={s.title}>{t('resetTitle')}</Label><Label style={[s.body, { marginVertical: 18 }]}>{t('resetNote')}</Label><Button title={t('confirmReset')} onPress={() => { setState(current => ({ ...current, records: {}, readNotifications: [] })); setReset(false); }} /><View style={{ height: 10 }} /><Button title={t('cancel')} secondary onPress={() => setReset(false)} /></View></View></Modal>
  </SafeAreaView>;
}


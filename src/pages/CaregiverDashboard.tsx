import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type AdherenceLog = {
  time: string;
  medName: string;
  status: 'taken' | 'missed' | 'pending';
  relativeTime: string;
};

const mockLogs: AdherenceLog[] = [
  { time: '08:00 ص', medName: 'بانادول 500 مجم', status: 'taken', relativeTime: 'منذ ساعتين' },
  { time: '02:00 م', medName: 'كونكور 5 مجم', status: 'missed', relativeTime: 'منذ 10 دقائق' },
  { time: '08:00 م', medName: 'أوميجا 3 زيت كبد الحوت', status: 'pending', relativeTime: 'متبقي 6 ساعات' },
];

const LOGS_KEY = 'smartMedicationLogs';

export default function CaregiverDashboard() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AdherenceLog[]>([]);
  const [adherenceRate, setAdherenceRate] = useState(78); // نسبة افتراضية
  const [hasEmergency, setHasEmergency] = useState(true); // تنبيه طارئ افتراضي لعرض الفكرة
  const [prescription, setPrescription] = useState<any | null>(null);

  useEffect(() => {
    // تحميل السجل الحقيقي من LocalStorage لو موجود، أو استخدام الداتا المحاكاة
    const savedLogs = localStorage.getItem(LOGS_KEY);
    
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    } else {
      // حفظ الداتا المحاكاة أول مرة
      localStorage.setItem(LOGS_KEY, JSON.stringify(mockLogs));
      setLogs(mockLogs);
    }

    // حساب نسبة الالتزام بشكل تفاعلي بناء على الداتا
    if (savedLogs) {
      const parsed: AdherenceLog[] = JSON.parse(savedLogs);
      const takenCount = parsed.filter(l => l.status === 'taken').length;
      const completedCount = parsed.filter(l => l.status !== 'pending').length;
      if (completedCount > 0) {
        setAdherenceRate(Math.round((takenCount / completedCount) * 100));
      }
    }

    // جلب الروشتة النشطة أو أحدث روشتة من التاريخ للمريض (الحاج أحمد محمد - ID: 1)
    const activePresc = localStorage.getItem('smartMedicationActivePrescription');
    if (activePresc) {
      setPrescription(JSON.parse(activePresc));
    } else {
      const history = JSON.parse(localStorage.getItem('smartMedicationPrescriptions_1') || '[]');
      if (history.length > 0) {
        setPrescription(history[history.length - 1]);
      }
    }
  }, []);

  const handleClearEmergency = () => {
    setHasEmergency(false);
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-rose-50 text-slate-900 font-body" dir="rtl">
      
      {/* تأثير الإضاءة الخلفية الناعمة الخاصة بالمتابع باللون الوردي */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(244,63,94,0.12),transparent_24%)] pointer-events-none" />

      {/* 📱 هيكل الموبايل الكبير الموحد */}
      <div className="relative z-10 w-95 max-w-[95vw] min-h-165 border-4 border-white rounded-[40px] bg-white/95 backdrop-blur-md shadow-[0_0_0_1px_rgba(244,63,94,0.12),0_25px_50px_rgba(244,63,94,0.08)] p-6 pt-14 pb-9 flex flex-col justify-between overflow-hidden">
        
        {/* سماعة الموبايل العلوية المحاكاة */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-22.5 h-1.5 rounded-full border border-slate-200" />

        {/* هيدر المتابع */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 shrink-0">
          <div>
            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">بوابة المتابع ❤️</span>
            <h1 className="text-xl font-display font-black text-slate-900 mt-1">متابعة العائلة عن بُعد</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            خروج
          </button>
        </div>

        {/* محتوى الشاشة الأوسط */}
        <div className="grow overflow-y-auto my-4 space-y-4 px-1" style={{ maxHeight: '420px' }}>
          
          {/* التنبيه الطارئ الفلاشينج */}
          {hasEmergency && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl relative shadow-[0_4px_12px_rgba(239,68,68,0.15)] animate-pulse">
              <div className="flex items-start gap-2.5">
                <span className="text-2xl mt-0.5 shrink-0">🚨</span>
                <div className="space-y-1 text-right">
                  <h4 className="text-xs font-black text-red-950">تنبيه طارئ: عدم التزام بالجرعة!</h4>
                  <p className="text-[10px] text-red-900 leading-relaxed">
                    والدي (الحاج أحمد محمد) لم يفتح درج الصندوق الذكي لأخذ دواء **"كونكور 5 مجم"** والمقرر الساعة **02:00 م**.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <a
                  href="tel:01012345678"
                  className="flex-grow text-center py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-bold transition shadow-sm"
                >
                  اتصال هاتفي بالمريض 📞
                </a>
                <button
                  onClick={handleClearEmergency}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-[10px] font-medium hover:bg-slate-300 transition cursor-pointer"
                >
                  تجاهل
                </button>
              </div>
            </div>
          )}

          {/* كارت كفاءة الالتزام ورسم بياني بسيط */}
          <div className="p-4 bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold text-rose-800 uppercase">معدل التزام هذا الأسبوع</p>
              <h2 className="text-3xl font-display font-black text-slate-900">{adherenceRate}%</h2>
              <p className="text-[9px] text-slate-500">مستوى التزام متميز مقارنة بالأسبوع الماضي</p>
            </div>
            
            {/* رسم بياني دائري مبسط بالـ CSS */}
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center rounded-full bg-rose-100">
              <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
                <span className="text-xs font-black text-rose-600">📈</span>
              </div>
              {/* مجسم شريط التقدم الدائري */}
              <div className="w-full h-full rounded-full border-4 border-rose-500 border-t-transparent animate-spin-slow" />
            </div>
          </div>

          {/* كارت الروشتة والتشخيص الحالي */}
          {prescription && (
            <div className="p-4 bg-gradient-to-br from-emerald-50/40 to-white border border-emerald-100 rounded-2xl space-y-3 shadow-sm text-right">
              <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">📄</span>
                  <h4 className="text-xs font-black text-slate-900">الروشتة والتشخيص النشط:</h4>
                </div>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  د. أحمد سليمان
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="bg-emerald-50/30 p-2 rounded-xl border border-emerald-100/50">
                  <p className="text-[9px] text-slate-500 font-bold">🩺 التشخيص الطبي:</p>
                  <p className="text-xs font-extrabold text-emerald-950 mt-0.5">{prescription.diagnosis}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] text-slate-400 font-bold mr-1">الخطة العلاجية المقررة:</p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {prescription.medications.map((med: any, index: number) => (
                      <div key={index} className="p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-[10px]">
                        <span className="font-bold text-slate-800">💊 {med.name}</span>
                        <span className="text-[9px] text-slate-500 font-medium bg-white px-2 py-0.5 rounded-md border border-slate-100">
                          {med.dose} ({med.duration})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-[8px] text-slate-400 text-left border-t border-slate-50 pt-2">
                تاريخ الإصدار: {prescription.date}
              </div>
            </div>
          )}

          {/* سجل التنبيهات والأحداث اليومية */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400">سجل أحداث اليوم (عم أحمد محمد):</h3>
            
            <div className="space-y-2">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 border rounded-2xl flex items-center justify-between transition ${
                    log.status === 'taken'
                      ? 'border-emerald-100 bg-emerald-50/20'
                      : log.status === 'missed'
                      ? 'border-red-100 bg-red-50/20'
                      : 'border-slate-100 bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3 text-right">
                    <span className="text-lg shrink-0">
                      {log.status === 'taken' ? '✅' : log.status === 'missed' ? '❌' : '⏳'}
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900">{log.medName}</h4>
                      <p className="text-[9px] text-slate-500">الموعد المحدد: {log.time}</p>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full block text-center ${
                        log.status === 'taken'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'missed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {log.status === 'taken' ? 'تم التناول' : log.status === 'missed' ? 'تجاهل الجرعة' : 'متبقي'}
                    </span>
                    <span className="text-[8px] text-slate-400 block text-left mt-0.5">{log.relativeTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* شريط الهوم السفلي المحاكي للموبايل */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12.5 h-2.5 rounded-full border border-slate-200 shrink-0" />

      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const MEDICINES_KEY = 'smartMedicationMedicines';
const LOGS_KEY = 'smartMedicationLogs';

export default function SmartBoxSimulator() {
  const navigate = useNavigate();
  const [activeDrawer, setActiveDrawer] = useState<number | null>(null); // الدرج المفتوح حالياً
  const [isAlerting, setIsAlerting] = useState(false); // هل المنبه شغال وبيرن؟
  const [alertMedName, setAlertMedName] = useState('بانادول 500 مجم');
  const [alertDose, setAlertDose] = useState('قرص واحد');
  const [statusMessage, setStatusMessage] = useState('الصندوق متصل بالإنترنت ومستعد 🟢');
  
  const beepIntervalRef = useRef<any>(null);

  // تشغيل نغمة بيب حقيقية باستخدام متصفح الويب (Web Audio API)
  const playElectronicBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'square'; // صوت إلكتروني مثل الأجهزة الحقيقية
      oscillator.frequency.value = 1200; // تردد عالي وواضح للتنبيه
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      
      oscillator.start();
      
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 100);
    } catch (e) {
      console.log('Audio Context error: ', e);
    }
  };

  // التحكم في تكرار التنبيه الصوتي عند تفعيل المنبه
  useEffect(() => {
    if (isAlerting) {
      // رنة كل ثانية
      beepIntervalRef.current = setInterval(() => {
        playElectronicBeep();
      }, 1000);
    } else {
      if (beepIntervalRef.current) {
        clearInterval(beepIntervalRef.current);
      }
    }

    return () => {
      if (beepIntervalRef.current) {
        clearInterval(beepIntervalRef.current);
      }
    };
  }, [isAlerting]);

  // جلب اسم أول دواء مسجل في التطبيق لمحاكاته
  useEffect(() => {
    const list = JSON.parse(localStorage.getItem(MEDICINES_KEY) || '[]');
    if (list.length > 0) {
      setAlertMedName(list[0].name);
      setAlertDose(list[0].dose);
    }
  }, []);

  // محاكاة بدء المنبه
  const handleTriggerAlarm = (drawerNum: number) => {
    setActiveDrawer(drawerNum);
    setIsAlerting(true);
    setStatusMessage(`⚠️ ميعاد الجرعة! درج رقم ${drawerNum} مفتوح الآن`);
  };

  // الضغط على الزر المادي في الصندوق الذكي (تأكيد الجرعة)
  const handleConfirmDose = () => {
    if (!isAlerting) return;

    setIsAlerting(false);
    setActiveDrawer(null);
    setStatusMessage('✅ تم تناول الجرعة بنجاح وغلق الدرج');

    // تسجيل في السجل اليومي بالـ LocalStorage لإفادة بوابة المتابع
    const savedLogs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
    const newLog = {
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      medName: alertMedName,
      status: 'taken',
      relativeTime: 'منذ ثوانٍ قليلة (تأكيد من الصندوق الذكي)'
    };
    localStorage.setItem(LOGS_KEY, JSON.stringify([newLog, ...savedLogs]));

    alert('تم استقبال إشارة تناول الدواء من الصندوق الذكي! وتم إخطار الطبيب والأهل بنجاح ✅');
  };

  // محاكاة تجاهل الجرعة
  const handleIgnoreDose = () => {
    if (!isAlerting) return;

    setIsAlerting(false);
    setActiveDrawer(null);
    setStatusMessage('❌ تم إهمال الجرعة وغلق الدرج تلقائياً');

    // تسجيل إهمال في السجل لإفادة المتابع
    const savedLogs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
    const newLog = {
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      medName: alertMedName,
      status: 'missed',
      relativeTime: 'منذ ثوانٍ (لم يؤخذ العلاج)'
    };
    localStorage.setItem(LOGS_KEY, JSON.stringify([newLog, ...savedLogs]));

    alert('لم يتم الضغط على الزر المادي! تم إرسال تنبيه طارئ (Emergency Alert) لحساب المتابع فوراً 🚨');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-sky-900 text-slate-900 font-body" dir="rtl">
      
      {/* تأثير الإضاءة الخلفية الناعمة باللون الأزرق الداكن الفخم */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(14,165,233,0.3),transparent_35%)] pointer-events-none" />

      {/* 📱 هيكل الموبايل الكبير الموحد */}
      <div className="relative z-10 w-95 max-w-[95vw] min-h-165 border-4 border-white rounded-[40px] bg-slate-900 text-white shadow-[0_25px_50px_rgba(0,0,0,0.4)] p-6 pt-14 pb-9 flex flex-col justify-between overflow-hidden">
        
        {/* سماعة الموبايل العلوية المحاكاة */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-22.5 h-1.5 rounded-full border border-slate-700" />

        {/* هيدر الصندوق */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800 shrink-0">
          <div>
            <span className="text-[9px] bg-sky-950 text-sky-400 border border-sky-800 font-extrabold px-2.5 py-0.5 rounded-full">محاكي الصندوق الذكي 📦⚙️</span>
            <h1 className="text-lg font-display font-black text-white mt-1">Smart Medication Box</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/medicines')}
            className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            خروج
          </button>
        </div>

        {/* محتوى الشاشة الأوسط */}
        <div className="grow flex flex-col justify-between my-4 space-y-4 px-1">
          
          {/* شاشة حالة الصندوق الإلكترونية الصغيرة */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-center font-mono space-y-1">
            <p className="text-[10px] text-sky-400 tracking-wider font-semibold uppercase">نظام الشاشة الداخلية للصندوق</p>
            <p className={`text-xs font-bold ${isAlerting ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
              {statusMessage}
            </p>
            {isAlerting && (
              <p className="text-[10px] text-slate-400">
                العلاج الحالي: {alertMedName} ({alertDose})
              </p>
            )}
          </div>

          {/* مجسم ثلاثي الأبعاد مقرب للصندوق الذكي بالـ CSS */}
          <div className="bg-slate-800 border-2 border-slate-700 rounded-[32px] p-5 shadow-2xl relative space-y-4">
            
            {/* مؤشر ليد التنبيه الرئيسي بالأعلى */}
            <div className="flex justify-center items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${isAlerting ? 'bg-red-600 animate-ping' : 'bg-emerald-600'}`} />
              <div className={`w-3 h-3 rounded-full absolute ${isAlerting ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <span className="text-[10px] text-slate-400 font-semibold mr-4">لمبة إشارة التنبيه</span>
            </div>

            {/* الأدراج الثلاثة */}
            <div className="space-y-3 pt-2">
              {[1, 2, 3].map((drawerNum) => {
                const isOpen = activeDrawer === drawerNum;
                return (
                  <div key={drawerNum} className="relative">
                    {/* تجويف الدرج بالخلفية الداكنة */}
                    <div className="h-10 w-full bg-slate-950 rounded-xl border border-slate-700 shadow-inner flex items-center justify-between px-4">
                      <span className="text-[10px] text-slate-600">درج رقم {drawerNum} مقفل</span>
                    </div>

                    {/* مقبض وجسم الدرج المتحرك (Sliding Drawer Face) */}
                    <div
                      style={{
                        transform: isOpen ? 'translateY(16px) scaleY(0.95)' : 'translateY(0)',
                        opacity: isOpen ? 0.95 : 1
                      }}
                      className={`absolute inset-0 h-10 w-full rounded-xl border transition-all duration-300 flex items-center justify-between px-4 shadow-[0_4px_8px_rgba(0,0,0,0.3)] cursor-pointer ${
                        isOpen
                          ? 'bg-gradient-to-r from-red-600 to-red-500 border-red-400 text-white animate-bounce'
                          : 'bg-gradient-to-r from-slate-700 to-slate-600 border-slate-500 text-slate-200 hover:from-slate-600 hover:to-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>💊</span>
                        <span className="text-xs font-bold">الدرج الذكي {drawerNum}</span>
                      </div>
                      
                      {isOpen ? (
                        <span className="text-[10px] bg-white text-red-600 font-black px-2 py-0.5 rounded-md animate-pulse">مفتوح 🔓</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold">مغلق 🔒</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* زر التأكيد المادي (Physical Button on top of Box) */}
            {isAlerting && (
              <div className="pt-2 text-center animate-fade-in">
                <button
                  onClick={handleConfirmDose}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 border-2 border-emerald-400 text-white rounded-2xl text-xs font-bold cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-[0_8px_16px_rgba(16,185,129,0.3)]"
                >
                  🔘 اضغط الزر المادي بالصندوق لتأكيد أخذ الجرعة
                </button>
              </div>
            )}

          </div>

          {/* أزرار التحكم والمحاكاة الجانبية للمناقشة */}
          <div className="bg-slate-800/40 border border-slate-800 p-3 rounded-2xl space-y-2">
            <p className="text-[9px] text-slate-400 font-bold text-center">أدوات تحكم المحاكاة (خاص باللجنة والمطور):</p>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isAlerting}
                onClick={() => handleTriggerAlarm(1)}
                className="py-2 bg-sky-600/80 hover:bg-sky-600 text-white text-[10px] font-bold rounded-xl disabled:opacity-40 transition cursor-pointer"
              >
                🚨 رن منبه درج 1 (صباحاً)
              </button>
              <button
                disabled={isAlerting}
                onClick={() => handleTriggerAlarm(2)}
                className="py-2 bg-sky-600/80 hover:bg-sky-600 text-white text-[10px] font-bold rounded-xl disabled:opacity-40 transition cursor-pointer"
              >
                🚨 رن منبه درج 2 (ظهراً)
              </button>
            </div>

            {isAlerting && (
              <button
                onClick={handleIgnoreDose}
                className="w-full py-2 bg-red-950/80 border border-red-800 text-red-400 text-[10px] font-bold rounded-xl hover:bg-red-900 transition cursor-pointer"
              >
                ⚠️ محاكاة نسيان المريض (تجاهل المنبه)
              </button>
            )}
          </div>

        </div>

        {/* شريط الهوم السفلي المحاكي للموبايل */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12.5 h-2.5 rounded-full border border-slate-800 shrink-0" />

      </div>
    </div>
  );
}

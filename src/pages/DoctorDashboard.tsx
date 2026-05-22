import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type PrescribedMedication = {
  name: string;
  dose: string;
  notes?: string;
  times: { morning: boolean; afternoon: boolean; evening: boolean };
  duration: string;
};

type Patient = {
  id: string;
  name: string;
  age: number;
  condition: string;
  phone: string;
};

const mockPatients: Patient[] = [
  { id: '1', name: 'الحاج أحمد محمد', age: 67, condition: 'ارتفاع ضغط الدم والسكري', phone: '01012345678' },
  { id: '2', name: 'الحاجة فاطمة علي', age: 72, condition: 'قصور في الشريان التاجي', phone: '01298765432' },
];

const PRESCRIPTION_KEY = 'smartMedicationPrescriptions';
const MEDICINES_KEY = 'smartMedicationMedicines';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [patients] = useState<Patient[]>(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // فورم الدواء الجديد
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medNotes, setMedNotes] = useState('');
  const [medDuration, setMedDuration] = useState('30 يوم');
  const [times, setTimes] = useState({ morning: true, afternoon: false, evening: true });

  const [prescribedList, setPrescribedList] = useState<PrescribedMedication[]>([]);

  // تحميل الروشتات السابقة للمريض المحدد
  useEffect(() => {
    if (selectedPatient) {
      const saved = localStorage.getItem(`${PRESCRIPTION_KEY}_${selectedPatient.id}`);
      if (saved) {
        setPrescribedList(JSON.parse(saved));
      } else {
        setPrescribedList([]);
      }
    }
  }, [selectedPatient]);

  const handleAddMedication = () => {
    if (!medName || !medDose) return;

    const newMed: PrescribedMedication = {
      name: medName,
      dose: medDose,
      notes: medNotes,
      times,
      duration: medDuration,
    };

    const updatedList = [...prescribedList, newMed];
    setPrescribedList(updatedList);
    
    // حفظ في قاعدة الروشتات للمريض
    if (selectedPatient) {
      localStorage.setItem(`${PRESCRIPTION_KEY}_${selectedPatient.id}`, JSON.stringify(updatedList));
      
      // كحركة ذكية تفاعلية للفرونت إند:
      // بنضيف الدواء برضه في جدول أدوية المريض الموحد عشان يبان مباشرة في حسابه
      const currentPatientMeds = JSON.parse(localStorage.getItem(MEDICINES_KEY) || '[]');
      
      // تحويل مواعيد الطبيب إلى هيكل مواعيد الأدوية الأسبوعي
      const newPatientMed = {
        name: medName,
        dose: medDose,
        notes: `روشتة من الطبيب: ${medNotes || 'بدون ملاحظات'}`,
        schedule: {
          saturday: { firstTime: times.morning ? '08:00' : '', secondTime: times.afternoon ? '14:00' : '', thirdTime: times.evening ? '20:00' : '', repeat: true },
          sunday: { firstTime: times.morning ? '08:00' : '', secondTime: times.afternoon ? '14:00' : '', thirdTime: times.evening ? '20:00' : '', repeat: true },
          monday: { firstTime: times.morning ? '08:00' : '', secondTime: times.afternoon ? '14:00' : '', thirdTime: times.evening ? '20:00' : '', repeat: true },
          tuesday: { firstTime: times.morning ? '08:00' : '', secondTime: times.afternoon ? '14:00' : '', thirdTime: times.evening ? '20:00' : '', repeat: true },
          wednesday: { firstTime: times.morning ? '08:00' : '', secondTime: times.afternoon ? '14:00' : '', thirdTime: times.evening ? '20:00' : '', repeat: true },
          thursday: { firstTime: times.morning ? '08:00' : '', secondTime: times.afternoon ? '14:00' : '', thirdTime: times.evening ? '20:00' : '', repeat: true },
          friday: { firstTime: times.morning ? '08:00' : '', secondTime: times.afternoon ? '14:00' : '', thirdTime: times.evening ? '20:00' : '', repeat: true },
        }
      };
      
      localStorage.setItem(MEDICINES_KEY, JSON.stringify([...currentPatientMeds, newPatientMed]));
    }

    // إعادة تصفير الفورم
    setMedName('');
    setMedDose('');
    setMedNotes('');
    setShowAddForm(false);
    alert('تم إرسال الجرعة وإضافتها لروشتة المريض بنجاح! 🚀');
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-emerald-50 text-slate-900 font-body" dir="rtl">
      
      {/* تأثير الإضاءة الخلفية الناعمة الخاصة بالطبيب باللون الأخضر */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(16,185,129,0.12),transparent_24%)] pointer-events-none" />

      {/* 📱 هيكل الموبايل الكبير الموحد */}
      <div className="relative z-10 w-95 max-w-[95vw] min-h-165 border-4 border-white rounded-[40px] bg-white/95 backdrop-blur-md shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_25px_50px_rgba(16,185,129,0.08)] p-6 pt-14 pb-9 flex flex-col justify-between overflow-hidden">
        
        {/* سماعة الموبايل العلوية المحاكاة */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-22.5 h-1.5 rounded-full border border-slate-200" />

        {/* هيدر الطبيب */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 shrink-0">
          <div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">بوابة الطبيب 👨‍⚕️</span>
            <h1 className="text-xl font-display font-black text-slate-900 mt-1">لوحة العيادة الذكية</h1>
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
          
          {!selectedPatient ? (
            <>
              {/* قائمة المرضى */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400">اختر مريضاً لكتابة الروشتة ومتابعته:</p>
                {patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className="w-full p-4 border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/30 hover:border-emerald-300 rounded-2xl flex items-center justify-between text-right transition cursor-pointer"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                      <p className="text-[11px] text-slate-500">العمر: {p.age} سنة | {p.condition}</p>
                    </div>
                    <span className="text-emerald-500 text-lg">◀</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {/* كارت المريض المختار */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl relative">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="absolute top-2 left-2 text-[10px] font-bold text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                >
                  تغيير المريض
                </button>
                <h3 className="text-sm font-black text-emerald-950">{selectedPatient.name}</h3>
                <p className="text-[10px] text-emerald-900/80 mt-1">الحالة: {selectedPatient.condition}</p>
              </div>

              {/* الروشتة الحالية */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-400">الروشتة الرقمية الحالية:</h4>
                  {!showAddForm && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-sm"
                    >
                      + إضافة دواء
                    </button>
                  )}
                </div>

                {showAddForm ? (
                  // فورم إضافة دواء للروشتة
                  <div className="p-4 border-2 border-emerald-200 bg-slate-50 rounded-2xl space-y-3">
                    <h5 className="text-xs font-bold text-emerald-800">وصف دواء جديد</h5>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-600 block">اسم الدواء</label>
                      <input
                        type="text"
                        placeholder="مثال: كونكور 5 مجم"
                        value={medName}
                        onChange={(e) => setMedName(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-600 block">الجرعة</label>
                      <input
                        type="text"
                        placeholder="مثال: قرص واحد"
                        value={medDose}
                        onChange={(e) => setMedDose(e.target.value)}
                        className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-600 block">مواعيد الجرعة (تنبيهات اليوم)</label>
                      <div className="flex gap-4 pt-1">
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={times.morning}
                            onChange={(e) => setTimes({ ...times, morning: e.target.checked })}
                            className="accent-emerald-600"
                          />
                          <span>صباحاً</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={times.afternoon}
                            onChange={(e) => setTimes({ ...times, afternoon: e.target.checked })}
                            className="accent-emerald-600"
                          />
                          <span>ظهراً</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={times.evening}
                            onChange={(e) => setTimes({ ...times, evening: e.target.checked })}
                            className="accent-emerald-600"
                          />
                          <span>مساءً</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-600 block">مدة العلاج</label>
                        <input
                          type="text"
                          value={medDuration}
                          onChange={(e) => setMedDuration(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-600 block">ملاحظات (اختياري)</label>
                        <input
                          type="text"
                          placeholder="مثال: قبل الأكل"
                          value={medNotes}
                          onChange={(e) => setMedNotes(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleAddMedication}
                        className="flex-grow py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                      >
                        إرسال للمريض 🚀
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-300 transition cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* عرض الأدوية الموصوفة سابقاً */}
                <div className="space-y-2 mt-2">
                  {prescribedList.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                      لا يوجد أدوية موصوفة حالياً لهذا المريض.
                    </p>
                  ) : (
                    prescribedList.map((med, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div className="text-right">
                          <h6 className="text-xs font-bold text-slate-900">{med.name}</h6>
                          <p className="text-[10px] text-slate-500">
                            الجرعة: {med.dose} | المدة: {med.duration}
                          </p>
                          <p className="text-[9px] text-emerald-600 font-semibold mt-0.5">
                            المواعيد: {[
                              med.times.morning && 'صباحاً',
                              med.times.afternoon && 'ظهراً',
                              med.times.evening && 'مساءً'
                            ].filter(Boolean).join(' - ')}
                          </p>
                          {med.notes && <p className="text-[9px] text-slate-400">({med.notes})</p>}
                        </div>
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-lg">مرسل</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* شريط الهوم السفلي المحاكي للموبايل */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12.5 h-2.5 rounded-full border border-slate-200 shrink-0" />

      </div>
    </div>
  );
}

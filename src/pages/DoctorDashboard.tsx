import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type PrescribedMedication = {
  name: string;
  dose: string;
  notes?: string;
  times: { morning: boolean; afternoon: boolean; evening: boolean };
  duration: string;
};

type Prescription = {
  id: string;
  patientId: string;
  diagnosis: string;
  medications: PrescribedMedication[];
  doctorName: string;
  date: string;
  status?: 'pending' | 'imported';
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

const COMPLETED_PRESCRIPTIONS_KEY = 'smartMedicationPrescriptions';
const LOGS_KEY = 'smartMedicationLogs';

export default function DoctorDashboard() {
  const navigate = useNavigate();

  // تحميل قائمة المرضى من localStorage أو استخدام المجموعات الوهمية
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('smartMedicationPatients');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('smartMedicationPatients', JSON.stringify(mockPatients));
    return mockPatients;
  });
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // حقول إضافة مريض جديد
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [newPatName, setNewPatName] = useState('');
  const [newPatAge, setNewPatAge] = useState('');
  const [newPatPhone, setNewPatPhone] = useState('');
  const [newPatCondition, setNewPatCondition] = useState('');

  // حقول الروشتة الحالية
  const [diagnosis, setDiagnosis] = useState('');
  const [medicationsTemp, setMedicationsTemp] = useState<PrescribedMedication[]>([]);

  // حقول إضافة دواء جديد مؤقت للروشتة
  const [showAddMedForm, setShowAddMedForm] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medNotes, setMedNotes] = useState('');
  const [medDuration, setMedDuration] = useState('30 يوم');
  const [times, setTimes] = useState({ morning: true, afternoon: false, evening: true });

  // سجل التزام المريض المعروض للطبيب
  const [patientLogs, setPatientLogs] = useState<any[]>([]);
  const [patientCompliance, setPatientCompliance] = useState(78);
  const [prescriptionHistory, setPrescriptionHistory] = useState<Prescription[]>([]);

  // حالات الصلاحيات والامتيازات النشطة للطبيب (مطلوبة لتقديم فكرة المشروع التفاعلي وعرض الصلاحيات)
  const alertCaregiver = true;
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // إضافة مريض جديد
  const handleAddPatient = () => {
    if (!newPatName || !newPatAge || !newPatPhone || !newPatCondition) {
      showToast('الرجاء تعبئة جميع الحقول! ⚠️');
      return;
    }

    const newPatient: Patient = {
      id: String(Date.now()),
      name: newPatName,
      age: Number(newPatAge),
      condition: newPatCondition,
      phone: newPatPhone,
    };

    const updated = [...patients, newPatient];
    setPatients(updated);
    localStorage.setItem('smartMedicationPatients', JSON.stringify(updated));

    // تصفير النموذج
    setNewPatName('');
    setNewPatAge('');
    setNewPatPhone('');
    setNewPatCondition('');
    setShowAddPatientForm(false);
    showToast('تم إضافة المريض الجديد بنجاح! 🎉');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 2500);
  };

  // جلب سجلات التزام المريض عند اختياره لتسهيل متابعة الطبيب
  useEffect(() => {
    if (selectedPatient) {
      const savedLogs = JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
      setPatientLogs(savedLogs);

      const takenCount = savedLogs.filter((l: any) => l.status === 'taken').length;
      const completedCount = savedLogs.filter((l: any) => l.status !== 'pending').length;
      if (completedCount > 0) {
        setPatientCompliance(Math.round((takenCount / completedCount) * 100));
      } else {
        setPatientCompliance(78); // قيمة افتراضية
      }

      // جلب سجل الروشتات والتشخيصات السابقة
      const history = JSON.parse(localStorage.getItem(`${COMPLETED_PRESCRIPTIONS_KEY}_${selectedPatient.id}`) || '[]');
      setPrescriptionHistory(history);

      // تصفير بيانات الروشتة الجديدة عند تغيير المريض
      setDiagnosis('');
      setMedicationsTemp([]);
    }
  }, [selectedPatient]);

  // إضافة دواء مؤقت للروشتة قيد الإنشاء
  const handleAddMedicationTemp = () => {
    if (!medName || !medDose) return;

    const newMed: PrescribedMedication = {
      name: medName,
      dose: medDose,
      notes: medNotes,
      times,
      duration: medDuration,
    };

    setMedicationsTemp([...medicationsTemp, newMed]);
    
    // تصفير فورم الدواء
    setMedName('');
    setMedDose('');
    setMedNotes('');
    setShowAddMedForm(false);
  };

  // إزالة دواء من الروشتة المؤقتة
  const handleRemoveMedTemp = (indexToRemove: number) => {
    setMedicationsTemp(medicationsTemp.filter((_, idx) => idx !== indexToRemove));
  };

  // إصدار وإرسال الروشتة بالكامل للمريض
  const handleSendFullPrescription = () => {
    if (!selectedPatient) return;
    if (!diagnosis) {
      showToast('من فضلك أدخل التشخيص الطبي أولاً! ⚠️');
      return;
    }
    if (medicationsTemp.length === 0) {
      showToast('يجب إضافة دواء واحد على الأقل! ⚠️');
      return;
    }

    const newPrescription: Prescription = {
      id: String(Date.now()),
      patientId: selectedPatient.id,
      diagnosis,
      medications: medicationsTemp,
      doctorName: 'د. أحمد سليمان',
      date: new Date().toLocaleDateString('ar-EG'),
      status: 'pending',
    };

    // 1. حفظ في قاعدة الروشتات الشاملة لكل الأطباء للمريض
    const allPrescriptions = JSON.parse(localStorage.getItem('smartMedicationAllPrescriptions') || '[]');
    localStorage.setItem('smartMedicationAllPrescriptions', JSON.stringify([...allPrescriptions, newPrescription]));

    // 2. إضافتها لسجل الروشتات القديمة للمريض التاريخي
    const history = JSON.parse(localStorage.getItem(`${COMPLETED_PRESCRIPTIONS_KEY}_${selectedPatient.id}`) || '[]');
    const updatedHistory = [...history, newPrescription];
    localStorage.setItem(`${COMPLETED_PRESCRIPTIONS_KEY}_${selectedPatient.id}`, JSON.stringify(updatedHistory));
    setPrescriptionHistory(updatedHistory);

    // صياغة رسالة النجاح التفاعلية بناءً على الصلاحيات والتوجيهات
    let messageContent = `تم إصدار الروشتة الطبية بالكامل وإرسالها بنجاح للمريض (${selectedPatient.name})!`;
    messageContent += `\n\n🔒 تم إرسالها بأمان وبانتظار تأكيد واستيراد المريض إلى صندوقه الخاص.`;
    if (alertCaregiver) {
      messageContent += `\n\n🔔 [مُفعل] تم إرسال إشعار وتحديث التنبيهات في لوحة تحكم المتابع من الأهل.`;
    }

    setSuccessMsg(messageContent);
    setShowSuccessModal(true);

    // تصفير الشاشة
    setDiagnosis('');
    setMedicationsTemp([]);
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
              {/* قائمة المرضى وإضافة مريض جديد */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-slate-400">اختر مريضاً لكتابة الروشتة ومتابعته:</p>
                  {!showAddPatientForm && (
                    <button
                      onClick={() => setShowAddPatientForm(true)}
                      className="text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      + مريض جديد
                    </button>
                  )}
                </div>

                {showAddPatientForm && (
                  <div className="p-4 border-2 border-dashed border-emerald-200 bg-white rounded-2xl space-y-3 text-right">
                    <h4 className="text-xs font-black text-emerald-950">➕ تسجيل مريض جديد في العيادة:</h4>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">اسم المريض:</label>
                      <input
                        type="text"
                        value={newPatName}
                        onChange={(e) => setNewPatName(e.target.value)}
                        placeholder="مثال: الحاج محمود علي"
                        className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">العمر (سنوات):</label>
                        <input
                          type="number"
                          value={newPatAge}
                          onChange={(e) => setNewPatAge(e.target.value)}
                          placeholder="65"
                          className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 block">رقم الهاتف:</label>
                        <input
                          type="text"
                          value={newPatPhone}
                          onChange={(e) => setNewPatPhone(e.target.value)}
                          placeholder="010XXXXXXXX"
                          className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 block">الحالة الصحية العامة:</label>
                      <input
                        type="text"
                        value={newPatCondition}
                        onChange={(e) => setNewPatCondition(e.target.value)}
                        placeholder="مثال: ارتفاع ضغط الدم المزمن"
                        className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="flex gap-2 pt-1.5">
                      <button
                        type="button"
                        onClick={handleAddPatient}
                        className="flex-grow py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition cursor-pointer"
                      >
                        حفظ المريض
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddPatientForm(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-medium hover:bg-slate-200 cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
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
              </div>

              {/* بطاقة الصلاحيات والامتيازات النشطة للطبيب */}
              <div className="p-4 border border-emerald-100 bg-emerald-50/20 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
                  <span className="text-base">🛡️</span>
                  <h4 className="text-xs font-black text-emerald-950">صلاحيات الطبيب وتراخيص التحكم:</h4>
                </div>
                
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 text-right pl-2">
                      <h5 className="text-[11px] font-bold text-slate-800">إضافة وتعديل الروشتات الرقمية</h5>
                      <p className="text-[9px] text-slate-500">صياغة التشخيص الدقيق وإعداد جدول الجرعات العلاجية للمريض.</p>
                    </div>
                    <span className="text-emerald-600 text-sm font-black select-none">✓</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 text-right pl-2">
                      <h5 className="text-[11px] font-bold text-slate-800">إرسال وتحديث لوحة المتابع</h5>
                      <p className="text-[9px] text-slate-500">إخطار المتابع من العائلة وتحديث السجل فوراُ عند تغيير الروشتة.</p>
                    </div>
                    <span className="text-emerald-600 text-sm font-black select-none">✓</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 text-right pl-2">
                      <h5 className="text-[11px] font-bold text-slate-800">مراقبة الالتزام وسجل الصندوق</h5>
                      <p className="text-[9px] text-slate-500">الاطلاع المباشر على مؤشرات وفعالية التزام المريض بالمنزل.</p>
                    </div>
                    <span className="text-emerald-600 text-sm font-black select-none">✓</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              
              {/* كارت معلومات المريض المختار ونسبة التزامه الحالية */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl relative flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-emerald-950">{selectedPatient.name}</h3>
                  <p className="text-[9px] text-emerald-900/80">التشخيص الحالي: {selectedPatient.condition}</p>
                  <p className="text-[9px] text-slate-500">نسبة التزام المريض بالمنزل: <span className="font-extrabold text-emerald-700">{patientCompliance}%</span></p>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-[9px] font-bold text-emerald-700 bg-white px-2 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                >
                  تغيير
                </button>
              </div>

              {/* باني الروشتة المتكامل */}
              <div className="space-y-3 p-4 border border-slate-200 rounded-2xl bg-slate-50/30">
                <h4 className="text-xs font-black text-slate-700">📄 نموذج كتابة الروشتة الطبية الكاملة:</h4>
                
                {/* حقل التشخيص الطبي */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">التشخيص الطبي الحالي:</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="مثال: التهاب حاد في الصدر والشعب الهوائية"
                    className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-emerald-400"
                  />
                </div>

                {/* قائمة الأدوية المؤقتة في الروشتة */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500">الأدوية الموصوفة ({medicationsTemp.length}):</span>
                    {!showAddMedForm && (
                      <button
                        onClick={() => setShowAddMedForm(true)}
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg transition"
                      >
                        + أضف دواء
                      </button>
                    )}
                  </div>

                  {showAddMedForm && (
                    // فورم دواء داخل الروشتة
                    <div className="p-3 border-2 border-dashed border-emerald-200 bg-white rounded-xl space-y-2 text-right">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-bold text-slate-500 block">اسم الدواء</label>
                        <input
                          type="text"
                          placeholder="مثال: كونكور 5 مجم"
                          value={medName}
                          onChange={(e) => setMedName(e.target.value)}
                          className="w-full text-[11px] rounded-lg border border-slate-200 px-2.5 py-1.5 outline-none"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[9px] font-bold text-slate-500 block">الجرعة</label>
                        <input
                          type="text"
                          placeholder="مثال: قرص واحد"
                          value={medDose}
                          onChange={(e) => setMedDose(e.target.value)}
                          className="w-full text-[11px] rounded-lg border border-slate-200 px-2.5 py-1.5 outline-none"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <label className="text-[9px] font-bold text-slate-500 block">المواعيد اليومية</label>
                        <div className="flex gap-3 pt-0.5">
                          <label className="flex items-center gap-1 text-[10px] text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={times.morning}
                              onChange={(e) => setTimes({ ...times, morning: e.target.checked })}
                              className="accent-emerald-600"
                            />
                            <span>صباحاً</span>
                          </label>
                          <label className="flex items-center gap-1 text-[10px] text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={times.afternoon}
                              onChange={(e) => setTimes({ ...times, afternoon: e.target.checked })}
                              className="accent-emerald-600"
                            />
                            <span>ظهراً</span>
                          </label>
                          <label className="flex items-center gap-1 text-[10px] text-slate-700 cursor-pointer">
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
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 block">المدة</label>
                          <input
                            type="text"
                            value={medDuration}
                            onChange={(e) => setMedDuration(e.target.value)}
                            className="w-full text-[11px] rounded-lg border border-slate-200 px-2.5 py-1.5 outline-none"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[9px] font-bold text-slate-500 block">ملاحظات</label>
                          <input
                            type="text"
                            placeholder="مثال: قبل الأكل"
                            value={medNotes}
                            onChange={(e) => setMedNotes(e.target.value)}
                            className="w-full text-[11px] rounded-lg border border-slate-200 px-2.5 py-1.5 outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1.5">
                        <button
                          type="button"
                          onClick={handleAddMedicationTemp}
                          className="flex-grow py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 transition"
                        >
                          أضف للروشتة
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddMedForm(false)}
                          className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-medium"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}

                  {/* قائمة الأدوية المضافة مؤقتاً */}
                  <div className="space-y-1.5">
                    {medicationsTemp.length === 0 ? (
                      <p className="text-[10px] text-slate-400 text-center py-4 bg-slate-100 rounded-xl">
                        لم يتم إضافة أدوية في الروشتة بعد.
                      </p>
                    ) : (
                      medicationsTemp.map((med, index) => (
                        <div key={index} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                          <div className="text-right space-y-0.5">
                            <h5 className="text-[11px] font-bold text-slate-900">{med.name}</h5>
                            <p className="text-[9px] text-slate-500">الجرعة: {med.dose} | المواعيد: {[
                              med.times.morning && 'صباحاً',
                              med.times.afternoon && 'ظهراً',
                              med.times.evening && 'مساءً'
                            ].filter(Boolean).join(' - ')}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedTemp(index)}
                            className="text-[9px] text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded-lg"
                          >
                            حذف ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* زر إصدار الروشتة وإرسالها بالكامل للمريض */}
                <button
                  type="button"
                  onClick={handleSendFullPrescription}
                  className="w-full py-3 mt-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  إصدار وإرسال الروشتة للمريض 📄🚀
                </button>
              </div>

              {/* سجل التزام المريض التفصيلي للطبيب */}
              <div className="space-y-2 p-4 border border-slate-200 rounded-2xl bg-slate-50/20">
                <h4 className="text-xs font-bold text-slate-400">سجل التزام المريض الفعلي بالمنزل (أخر العمليات):</h4>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {patientLogs.length === 0 ? (
                    <p className="text-[10px] text-slate-400 text-center py-4 bg-slate-50 rounded-xl">
                      لا توجد سجلات التزام سابقة للمريض بعد.
                    </p>
                  ) : (
                    patientLogs.map((log: any, idx: number) => (
                      <div key={idx} className="p-2 bg-white border border-slate-100 rounded-lg flex items-center justify-between text-[10px]">
                        <span className="font-semibold">{log.medName}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold ${
                          log.status === 'taken' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.status === 'taken' ? 'تم أخذها' : 'تم إهمالها'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* سجل التشخيصات والروشتات السابقة للمريض */}
              <div className="space-y-3 p-4 border border-emerald-100 rounded-2xl bg-emerald-50/10">
                <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <span>📂</span> سجل تشخيصات وروشتات المريض السابقة:
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {prescriptionHistory.length === 0 ? (
                    <p className="text-[10px] text-slate-400 text-center py-5 bg-slate-50 border border-slate-100 rounded-xl">
                      لا توجد تشخيصات أو روشتات سابقة مسجلة لهذا المريض بعد.
                    </p>
                  ) : (
                    [...prescriptionHistory].reverse().map((pr: Prescription) => (
                      <div key={pr.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-right shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                          <span className="text-[11px] font-extrabold text-slate-800">{pr.diagnosis}</span>
                          <span className="text-[9px] text-slate-400 font-semibold">{pr.date}</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] text-slate-400 font-medium">الأدوية الموصوفة:</p>
                          <div className="flex flex-wrap gap-1">
                            {pr.medications.map((med, idx) => (
                              <span key={idx} className="text-[9px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium border border-slate-200/50">
                                {med.name} ({med.dose})
                              </span>
                            ))}
                          </div>
                        </div>
                        {pr.doctorName && (
                          <div className="text-left text-[8px] text-slate-400 font-medium">
                            بواسطة: {pr.doctorName}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* توست التنبيهات الجمالي التلقائي */}
        {toastMsg && (
          <div className="absolute top-16 inset-x-6 z-50 p-2.5 bg-slate-900/95 text-white rounded-xl text-center text-[10px] font-bold shadow-lg animate-fade-in flex items-center justify-center gap-1.5 border border-slate-800">
            <span>🛡️</span>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* 🏆 مودال النجاح المخصص الفخم */}
        {showSuccessModal && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-[85%] border-2 border-emerald-500 shadow-2xl space-y-4 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <span className="text-xl text-emerald-600">✓</span>
              </div>
              <h3 className="text-sm font-black text-slate-900">تمت العملية بنجاح!</h3>
              <p className="text-[10px] text-slate-600 whitespace-pre-line leading-relaxed text-right border-t border-b border-slate-100 py-3">
                {successMsg}
              </p>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md active:scale-98"
              >
                حسناً، فهمت 👍
              </button>
            </div>
          </div>
        )}

        {/* شريط الهوم السفلي المحاكي للموبايل */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12.5 h-2.5 rounded-full border border-slate-200 shrink-0" />

      </div>
    </div>
  );
}

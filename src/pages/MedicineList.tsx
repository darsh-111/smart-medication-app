import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Medicine = {
    name: string;
    dose: string;
    notes?: string;
    image?: string; // إضافة حقل الصورة لقراءته وعرضه في الكارت
};

const defaultMedicines: Medicine[] = [];
const STORAGE_KEY = 'smartMedicationMedicines';

function loadMedicines() {
    if (typeof window === 'undefined') return defaultMedicines;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultMedicines;
    try {
        return JSON.parse(saved) as Medicine[];
    } catch {
        return defaultMedicines;
    }
}

function saveMedicines(medicines: Medicine[]) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
}

export default function MedicineList() {
    const navigate = useNavigate();
    const [medicines, setMedicines] = useState(loadMedicines());
    const [activePrescription, setActivePrescription] = useState<any | null>(null);

    useEffect(() => {
        setMedicines(loadMedicines());
        
        // جلب آخر روشتة مرسلة من الأطباء
        const savedPrescriptions = localStorage.getItem('smartMedicationAllPrescriptions');
        if (savedPrescriptions) {
            const all = JSON.parse(savedPrescriptions);
            if (all.length > 0) {
                setActivePrescription(all[all.length - 1]);
            }
        }
    }, []);

    const handleImportPrescription = () => {
        if (!activePrescription) return;

        const existing = loadMedicines();
        
        // تحويل أدوية الطبيب لجدول منبهات المريض الأسبوعية
        const newMeds = activePrescription.medications.map((m: any) => {
            return {
                name: m.name,
                dose: m.dose,
                notes: `روشتة من الطبيب المعالج: ${m.notes || 'بدون ملاحظات'}`,
                image: undefined,
                schedule: {
                    saturday: { firstTime: m.times.morning ? '08:00' : '', secondTime: m.times.afternoon ? '14:00' : '', thirdTime: m.times.evening ? '20:00' : '', repeat: true },
                    sunday: { firstTime: m.times.morning ? '08:00' : '', secondTime: m.times.afternoon ? '14:00' : '', thirdTime: m.times.evening ? '20:00' : '', repeat: true },
                    monday: { firstTime: m.times.morning ? '08:00' : '', secondTime: m.times.afternoon ? '14:00' : '', thirdTime: m.times.evening ? '20:00' : '', repeat: true },
                    tuesday: { firstTime: m.times.morning ? '08:00' : '', secondTime: m.times.afternoon ? '14:00' : '', thirdTime: m.times.evening ? '20:00' : '', repeat: true },
                    wednesday: { firstTime: m.times.morning ? '08:00' : '', secondTime: m.times.afternoon ? '14:00' : '', thirdTime: m.times.evening ? '20:00' : '', repeat: true },
                    thursday: { firstTime: m.times.morning ? '08:00' : '', secondTime: m.times.afternoon ? '14:00' : '', thirdTime: m.times.evening ? '20:00' : '', repeat: true },
                    friday: { firstTime: m.times.morning ? '08:00' : '', secondTime: m.times.afternoon ? '14:00' : '', thirdTime: m.times.evening ? '20:00' : '', repeat: true },
                }
            };
        });

        const updatedMedicines = [...existing, ...newMeds];
        saveMedicines(updatedMedicines);
        setMedicines(updatedMedicines);

        // تحديث حالة الروشتة إلى imported في المصفوفة الشاملة
        const all = JSON.parse(localStorage.getItem('smartMedicationAllPrescriptions') || '[]');
        const updatedAll = all.map((p: any) => p.id === activePrescription.id ? { ...p, status: 'imported' } : p);
        localStorage.setItem('smartMedicationAllPrescriptions', JSON.stringify(updatedAll));
        
        setActivePrescription({ ...activePrescription, status: 'imported' });

        alert('تم تفعيل جميع أدوية الروشتة كمنبهات وتوصيلها بالصندوق الذكي بنجاح! ⏰✨');
    };

    const handleDelete = (index: number) => {
        if (!window.confirm('هل تريد حذف هذا الدواء؟')) return;
        const existing = loadMedicines();
        existing.splice(index, 1);
        saveMedicines(existing);
        setMedicines([...existing]);
    };

    const handleEdit = (index: number) => {
        navigate(`/medicines/edit/${index}`);
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-sky-50 text-slate-900 font-body" dir="rtl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(14,165,233,0.12),transparent_24%)] pointer-events-none" />

            <div className="relative z-10 w-full max-w-xl rounded-[40px] border border-sky-200 bg-white/95 backdrop-blur-md shadow-[0_25px_50px_rgba(14,165,233,0.12)] p-8 space-y-8">
                
                {/* الهيدر العلوي متناسق RTL */}
                <div className="flex items-center justify-between gap-4">
                    <div className="text-right">
                        <p className="text-sm uppercase tracking-[0.15em] text-slate-500 mb-2">قائمة الأدوية</p>
                        <h1 className="text-3xl font-display font-semibold text-slate-900">الأدوية المسجلة</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/choice')}
                        className="rounded-full border border-sky-200 bg-white/95 px-4 py-2 text-sm text-slate-900 transition hover:bg-slate-100 whitespace-nowrap"
                    >
                        العودة
                    </button>
                </div>

                {/* عرض كروت الأدوية */}
                <div className="space-y-4">
                    
                    {/* بنر الصندوق الذكي التفاعلي */}
                    <div className="p-4 bg-gradient-to-r from-sky-600 to-sky-500 rounded-3xl text-white flex items-center justify-between shadow-md">
                        <div className="space-y-1 text-right">
                            <h3 className="text-xs font-extrabold uppercase tracking-wider opacity-90">الجهاز متصل بالإنترنت 🟢</h3>
                            <h4 className="text-sm font-bold">صندوق الأدوية الذكي الخاص بك</h4>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/smart-box')}
                            className="bg-white text-sky-700 text-xs font-extrabold px-3 py-1.5 rounded-xl hover:bg-sky-50 transition cursor-pointer"
                        >
                            فتح المحاكي 📦
                        </button>
                    </div>

                    {/* زر التوجه لقائمة الروشتات الشاملة (دائماً ظاهر) */}
                    <button
                        type="button"
                        onClick={() => navigate('/prescriptions')}
                        className="w-full flex items-center justify-between p-4 bg-white border-2 border-indigo-100 rounded-3xl shadow-sm hover:border-indigo-300 hover:bg-indigo-50/50 transition cursor-pointer"
                    >
                        <div className="text-right">
                            <h3 className="text-sm font-bold text-indigo-900">قائمة الروشتات 📋</h3>
                            <p className="text-[10px] text-indigo-600 font-medium">سجل بجميع الروشتات من كل الأطباء</p>
                        </div>
                        <span className="text-indigo-400 font-bold">عرض الكل ◀</span>
                    </button>

                    {/* عرض آخر روشتة مرسلة من الطبيب لو موجودة */}
                    {activePrescription && (
                        <div className={`rounded-3xl border-2 p-5 shadow-[0_8px_24px_rgba(16,185,129,0.15)] text-right space-y-3 animate-fade-in relative overflow-hidden ${activePrescription.status === 'imported' ? 'border-slate-300 bg-slate-50' : 'border-emerald-500 bg-emerald-50/90'}`}>
                            <div className="flex justify-between items-start">
                                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${activePrescription.status === 'imported' ? 'bg-slate-200 text-slate-700' : 'bg-emerald-600 text-white'}`}>
                                    {activePrescription.status === 'imported' ? 'آخر روشتة (تمت مشاهدتها ✅)' : 'أحدث روشتة واردة 📄'}
                                </span>
                                <button
                                    onClick={() => {
                                        setActivePrescription(null); // إخفاء من الشاشة فقط دون الحذف
                                    }}
                                    className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    إخفاء ✕
                                </button>
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-xs font-bold text-slate-900">المرسل: {activePrescription.doctorName} ({activePrescription.date})</h3>
                                <p className="text-[11px] text-emerald-950 font-bold bg-white/60 p-2 rounded-xl border border-slate-200/50">
                                    🩺 التشخيص: {activePrescription.diagnosis}
                                </p>
                                <div className="pt-1.5 space-y-1">
                                    <p className="text-[9px] text-slate-500 font-bold mr-1">الأدوية الموصوفة:</p>
                                    {activePrescription.medications.map((m: any, idx: number) => (
                                        <div key={idx} className="text-[11px] text-slate-700 flex justify-between bg-white/80 p-2 rounded-xl border border-slate-100">
                                            <span className="font-bold">💊 {m.name}</span>
                                            <span className="font-extrabold text-[10px] text-slate-500">{m.dose} ({m.duration})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {activePrescription.status !== 'imported' && (
                                <button
                                    type="button"
                                    onClick={handleImportPrescription}
                                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-[0_4px_12px_rgba(16,185,129,0.2)] transition active:scale-[0.99] cursor-pointer"
                                >
                                    تفعيل الروشتة وتحويلها لمنبهات بالصندوق ⏰✅
                                </button>
                            )}
                        </div>
                    )}

                    {medicines.length === 0 ? (
                        <div className="rounded-3xl border border-sky-200 bg-slate-50 p-8 text-center text-slate-700">
                            <p className="text-lg font-medium text-slate-900">لا يوجد أدوية حالياً</p>
                            <p className="mt-2 text-sm text-slate-600">اضغط إضافة دواء جديد لتسجيل أول دواء.</p>
                        </div>
                    ) : (
                        medicines.map((medicine, index) => (
                            <div key={`${medicine.name}-${index}`} className="rounded-3xl border border-sky-200 bg-slate-50 p-5 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.12)] space-y-4">
                                
                                {/* المحتوى العلوي للكارت: الصورة والبيانات */}
                                <div className="flex items-start gap-4">
                                    
                                    {/* مصغر صورة الدواء الحقيقية */}
                                    {medicine.image ? (
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-sky-200 shrink-0 bg-white shadow-sm">
                                            <img src={medicine.image} alt={medicine.name} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-sky-200 shrink-0 bg-white flex items-center justify-center text-2xl shadow-sm">
                                            💊
                                        </div>
                                    )}

                                    {/* نصوص وتفاصيل الدواء محاذية لليمين بالكامل */}
                                    <div className="flex-grow text-right space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h2 className="text-xl font-display font-bold text-slate-900 leading-tight">{medicine.name}</h2>
                                            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800 whitespace-nowrap">نشط</span>
                                        </div>
                                        <p className="text-sm font-medium text-sky-600">{medicine.dose}</p>
                                        {medicine.notes && (
                                            <p className="text-xs text-slate-500 bg-white/60 px-2 py-1 rounded-lg inline-block border border-slate-100 mt-1">
                                                ملاحظات: {medicine.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* خط فاصل ناعم */}
                                <div className="border-t border-sky-100/70 pt-3 flex flex-wrap items-center justify-between gap-3">
                                    
                                    {/* 🔔 زرار تجربة المنبه (Test) المطور والمنير للمناقشة */}
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/alarm/${index}`)}
                                        className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-bold shadow-sm transition hover:bg-amber-100 active:scale-95"
                                    >
                                        <span className="animate-bounce inline-block">⏰</span>
                                        <span>تجربة التنبيه (Test)</span>
                                    </button>

                                    {/* أزرار الإجراءات التقليدية */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(index)}
                                            className="rounded-xl border border-cyan-300 bg-cyan-100 px-3 py-1.5 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-200"
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(index)}
                                            className="rounded-xl border border-red-300 bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:bg-red-200"
                                        >
                                            مسح
                                        </button>
                                    </div>

                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* زر إضافة دواء جديد السفلي */}
                <button
                    type="button"
                    onClick={() => navigate('/medicines/add')}
                    className="w-full rounded-3xl bg-sky-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-sky-700 shadow-md active:scale-[0.99]"
                >
                    إضافة دواء جديد
                </button>
            </div>
        </div>
    );
}
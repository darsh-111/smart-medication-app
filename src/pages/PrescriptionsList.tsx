import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PRESCRIPTIONS_KEY = 'smartMedicationAllPrescriptions';
const MEDICINES_KEY = 'smartMedicationMedicines';

export default function PrescriptionsList() {
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [expandedIds, setExpandedIds] = useState<string[]>([]); // حالة تتبع الروشتات المفتوحة

    const toggleExpand = (id: string) => {
        setExpandedIds((prev) => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        const saved = localStorage.getItem(PRESCRIPTIONS_KEY);
        if (saved) {
            setPrescriptions(JSON.parse(saved));
        }
    }, []);

    const handleImportPrescription = (prescription: any, index: number) => {
        // تحديث حالة الروشتة إلى 'imported'
        const updatedPrescriptions = [...prescriptions];
        updatedPrescriptions[index].status = 'imported';
        setPrescriptions(updatedPrescriptions);
        localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(updatedPrescriptions));

        // إضافة الأدوية إلى قائمة أدوية المريض كمنبهات
        const existingMedsSaved = localStorage.getItem(MEDICINES_KEY);
        const existingMeds = existingMedsSaved ? JSON.parse(existingMedsSaved) : [];
        
        const newMeds = prescription.medications.map((m: any) => {
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

        localStorage.setItem(MEDICINES_KEY, JSON.stringify([...existingMeds, ...newMeds]));
        alert('تم تفعيل جميع أدوية الروشتة كمنبهات وتوصيلها بالصندوق الذكي بنجاح! ⏰✨');
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-sky-50 text-slate-900 font-body" dir="rtl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(14,165,233,0.12),transparent_24%)] pointer-events-none" />

            <div className="relative z-10 w-full max-w-2xl rounded-[40px] border border-sky-200 bg-white/95 backdrop-blur-md shadow-[0_25px_50px_rgba(14,165,233,0.12)] p-8 space-y-8">
                
                <div className="flex items-center justify-between gap-4">
                    <div className="text-right">
                        <p className="text-sm uppercase tracking-[0.15em] text-slate-500 mb-2">سجل المريض</p>
                        <h1 className="text-3xl font-display font-semibold text-slate-900">قائمة الروشتات الشاملة</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/medicines')}
                        className="rounded-full border border-sky-200 bg-white/95 px-4 py-2 text-sm text-slate-900 transition hover:bg-slate-100 whitespace-nowrap"
                    >
                        العودة للأدوية
                    </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {prescriptions.length === 0 ? (
                        <div className="rounded-3xl border border-sky-200 bg-slate-50 p-8 text-center text-slate-700">
                            <p className="text-lg font-medium text-slate-900">لا توجد روشتات سابقة</p>
                            <p className="mt-2 text-sm text-slate-600">سيتم عرض الروشتات الواردة من الأطباء هنا.</p>
                        </div>
                    ) : (
                        [...prescriptions].reverse().map((prescription, reverseIndex) => {
                            const index = prescriptions.length - 1 - reverseIndex;
                            const isImported = prescription.status === 'imported';
                            const isExpanded = expandedIds.includes(prescription.id);

                            return (
                                <div key={prescription.id} className={`rounded-3xl border-2 shadow-sm relative overflow-hidden transition-all ${isImported ? 'border-slate-200 bg-slate-50 opacity-80' : 'border-emerald-500 bg-emerald-50'}`}>
                                    
                                    {/* الجزء القابل للنقر (رأس الروشتة) */}
                                    <div 
                                        className="p-5 cursor-pointer hover:bg-black/5 transition-colors"
                                        onClick={() => toggleExpand(prescription.id)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${isImported ? 'bg-slate-200 text-slate-600' : 'bg-emerald-600 text-white'}`}>
                                                    {isImported ? 'تمت المشاهدة والتفعيل ✅' : 'روشتة رقمية جديدة 📄'}
                                                </span>
                                                <h3 className="text-sm font-bold text-slate-900 mt-3">المرسل: {prescription.doctorName}</h3>
                                                <p className="text-[10px] text-slate-500 mt-1">{prescription.date}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {!isImported && (
                                                    <span className="flex h-3 w-3 relative">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                                    </span>
                                                )}
                                                <span className={`text-xs mt-2 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-emerald-600' : 'text-slate-400'}`}>
                                                    ▼
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* الجزء المخفي (تفاصيل الروشتة والأدوية) */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 pt-2 border-t border-slate-200/50 bg-white/40 animate-fade-in">
                                            <div className="space-y-3 mt-2">
                                                <p className="text-[11px] text-slate-800 font-bold bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                                                    🩺 التشخيص: {prescription.diagnosis}
                                                </p>
                                                <div className="pt-1.5 space-y-1.5">
                                                    <p className="text-[10px] text-slate-500 font-bold mr-1">الأدوية الموصوفة:</p>
                                                    {prescription.medications.map((m: any, idx: number) => (
                                                        <div key={idx} className="text-[11px] text-slate-700 flex justify-between bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                                                            <span className="font-bold">💊 {m.name}</span>
                                                            <span className="font-extrabold text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg">{m.dose} ({m.duration})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {!isImported && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // لمنع إغلاق الكارت عند الضغط على الزر
                                                        handleImportPrescription(prescription, index);
                                                    }}
                                                    className="w-full mt-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md transition active:scale-[0.99] cursor-pointer"
                                                >
                                                    تفعيل الروشتة وتحويلها لمنبهات بالصندوق ⏰✅
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

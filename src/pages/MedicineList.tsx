import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Medicine = {
    name: string;
    dose: string;
    notes?: string;
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

    useEffect(() => {
        setMedicines(loadMedicines());
    }, []);

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
        <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-sky-50 text-slate-900 font-body">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(14,165,233,0.12),transparent_24%)] pointer-events-none" />

            <div className="relative z-10 w-full max-w-xl rounded-[40px] border border-sky-200 bg-white/95 backdrop-blur-md shadow-[0_25px_50px_rgba(14,165,233,0.12)] p-8 space-y-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.32em] text-slate-500 mb-2">قائمة الأدوية</p>
                        <h1 className="text-3xl font-display font-semibold text-slate-900">الأدوية المسجلة</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/choice')}
                        className="rounded-full border border-sky-200 bg-white/95 px-4 py-2 text-sm text-slate-900 transition hover:bg-slate-100"
                    >
                        العودة
                    </button>
                </div>

                <div className="space-y-4">
                    {medicines.length === 0 ? (
                        <div className="rounded-3xl border border-sky-200 bg-slate-50 p-8 text-center text-slate-700">
                            <p className="text-lg font-medium text-slate-900">لا يوجد أدوية حالياً</p>
                            <p className="mt-2 text-sm text-slate-600">اضغط إضافة دواء جديد لتسجيل أول دواء.</p>
                        </div>
                    ) : (
                        medicines.map((medicine, index) => (
                            <div key={`${medicine.name}-${index}`} className="rounded-3xl border border-sky-200 bg-slate-50 p-5 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.12)]">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-display font-semibold text-slate-900">{medicine.name}</h2>
                                        <p className="text-sm text-slate-600">{medicine.dose}</p>
                                        {medicine.notes && <p className="mt-2 text-sm text-slate-700">ملاحظات: {medicine.notes}</p>}
                                    </div>
                                    <span className="rounded-full bg-sky-100 px-3 py-1 text-sm text-slate-700">نشط</span>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(index)}
                                        className="rounded-2xl border border-cyan-300 bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-800 transition hover:bg-cyan-200"
                                    >
                                        تعديل
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(index)}
                                        className="rounded-2xl border border-red-300 bg-red-100 px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-200"
                                    >
                                        مسح
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => navigate('/medicines/add')}
                    className="w-full rounded-3xl bg-sky-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                    إضافة دواء جديد
                </button>
            </div>
        </div>
    );
}

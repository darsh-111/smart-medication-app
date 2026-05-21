import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Medicine = {
    name: string;
    dose: string;
    notes?: string;
};

const defaultMedicines: Medicine[] = [
    { name: 'باراسيتامول', dose: '500 ملجم' },
    { name: 'أموكسيسيلين', dose: '250 ملجم' },
    { name: 'فيتامين د', dose: '1000 وحدة' },
];
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
        <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-[#050505] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.12),transparent_24%)] pointer-events-none" />

            <div className="relative z-10 w-full max-w-xl rounded-[40px] border border-white/20 bg-black/70 backdrop-blur-md shadow-[0_25px_50px_rgba(0,0,0,0.5)] p-8 space-y-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.32em] text-white/50 mb-2">قائمة الأدوية</p>
                        <h1 className="text-3xl font-semibold text-white">الأدوية المسجلة</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/choice')}
                        className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                    >
                        العودة
                    </button>
                </div>

                <div className="space-y-4">
                    {medicines.map((medicine, index) => (
                        <div key={`${medicine.name}-${index}`} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">{medicine.name}</h2>
                                    <p className="text-sm text-white/60">{medicine.dose}</p>
                                    {medicine.notes && <p className="mt-2 text-sm text-white/70">ملاحظات: {medicine.notes}</p>}
                                </div>
                                <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">نشط</span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleEdit(index)}
                                    className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/15"
                                >
                                    تعديل
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(index)}
                                    className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/15"
                                >
                                    مسح
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => navigate('/medicines/add')}
                    className="w-full rounded-3xl bg-[#68b6ff] px-5 py-4 text-sm font-semibold text-black transition hover:bg-[#4f94d0]"
                >
                    إضافة دواء جديد
                </button>
            </div>
        </div>
    );
}

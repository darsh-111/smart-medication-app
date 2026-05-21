import { useNavigate } from 'react-router-dom';

const mockMedicines = [
    { name: 'باراسيتامول', dose: '500 ملجم', time: 'صباحًا' },
    { name: 'أموكسيسيلين', dose: '250 ملجم', time: 'مساءً' },
    { name: 'فيتامين د', dose: '1000 وحدة', time: 'صباحًا' },
];

export default function MedicineList() {
    const navigate = useNavigate();

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
                    {mockMedicines.map((medicine) => (
                        <div key={medicine.name} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">{medicine.name}</h2>
                                    <p className="text-sm text-white/60">{medicine.dose} · {medicine.time}</p>
                                </div>
                                <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">نشط</span>
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

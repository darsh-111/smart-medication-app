import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const weekDays = [
    { name: 'السبت', key: 'saturday' },
    { name: 'الأحد', key: 'sunday' },
    { name: 'الاثنين', key: 'monday' },
    { name: 'الثلاثاء', key: 'tuesday' },
    { name: 'الأربعاء', key: 'wednesday' },
    { name: 'الخميس', key: 'thursday' },
    { name: 'الجمعة', key: 'friday' },
];

type Medicine = {
    name: string;
    dose: string;
    notes?: string;
};

const STORAGE_KEY = 'smartMedicationMedicines';

function loadMedicines() {
    if (typeof window === 'undefined') return [];
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
        return JSON.parse(saved) as Medicine[];
    } catch {
        return [];
    }
}

function saveMedicines(medicines: Medicine[]) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
}

export default function AddMedicine() {
    const navigate = useNavigate();
    const { index: editIndexParam } = useParams();
    const [name, setName] = useState('');
    const [dose, setDose] = useState('');
    const [notes, setNotes] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const [showSchedule, setShowSchedule] = useState(false);
    const [schedule, setSchedule] = useState(
        weekDays.reduce((acc, day) => {
            acc[day.key] = { firstTime: '', secondTime: '', thirdTime: '', repeat: false };
            return acc;
        }, {} as Record<string, { firstTime: string; secondTime: string; thirdTime: string; repeat: boolean }>)
    );

    useEffect(() => {
        if (!editIndexParam) return;
        const parsedIndex = Number(editIndexParam);
        if (Number.isNaN(parsedIndex)) return;

        const existing = loadMedicines();
        const medicine = existing[parsedIndex];
        if (!medicine) return;

        setName(medicine.name);
        setDose(medicine.dose);
        setNotes(medicine.notes ?? '');
        setIsEditing(true);
        setEditIndex(parsedIndex);
        setShowSchedule(false);
    }, [editIndexParam]);

    const toggleSchedule = (dayKey: string) => {
        setSchedule((prev) => ({
            ...prev,
            [dayKey]: {
                ...prev[dayKey],
                repeat: !prev[dayKey].repeat,
            },
        }));
    };

    const setScheduleTime = (dayKey: string, field: 'firstTime' | 'secondTime' | 'thirdTime', value: string) => {
        setSchedule((prev) => ({
            ...prev,
            [dayKey]: {
                ...prev[dayKey],
                [field]: value,
            },
        }));
    };

    const handleAddMedicine = () => {
        if (!name || !dose) return;

        const existing = loadMedicines();
        const newMedicine: Medicine = {
            name,
            dose,
            notes,
        };

        if (isEditing && editIndex !== null && existing[editIndex]) {
            existing[editIndex] = newMedicine;
            saveMedicines(existing);
        } else {
            saveMedicines([...existing, newMedicine]);
        }

        navigate('/medicines');
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-sky-50 text-slate-900 font-body">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(14,165,233,0.12),transparent_24%)] pointer-events-none" />

            <div className="relative z-10 w-full max-w-xl rounded-[40px] border border-sky-200 bg-white/95 backdrop-blur-md shadow-[0_25px_50px_rgba(14,165,233,0.12)] p-8 space-y-8">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm uppercase tracking-[0.32em] text-slate-500 mb-2">إضافة دواء جديد</p>
                        <h1 className="text-3xl font-display font-semibold text-slate-900">{isEditing ? 'تعديل الدواء' : 'أضف دواء إلى قائمتك'}</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/medicines')}
                        className="rounded-full border border-sky-200 bg-white/95 px-4 py-2 text-sm text-slate-900 transition hover:bg-slate-100"
                    >
                        العودة للقائمة
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="rounded-3xl border border-sky-200 bg-slate-50 p-4">
                        <div className="mb-2 text-sm text-slate-600">اسم الدواء</div>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.currentTarget.value)}
                            placeholder="أدخل اسم الدواء"
                            className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400"
                        />
                    </div>

                    <div className="rounded-3xl border border-sky-200 bg-slate-50 p-4">
                        <div className="mb-2 text-sm text-slate-600">الجرعة</div>
                        <input
                            type="text"
                            value={dose}
                            onChange={(event) => setDose(event.currentTarget.value)}
                            placeholder="أدخل الجرعة"
                            className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400"
                        />
                    </div>

                    <div className="rounded-3xl border border-sky-200 bg-slate-50 p-4">
                        <div className="mb-2 text-sm text-slate-600">جدول المواعيد</div>
                        <button
                            type="button"
                            onClick={() => setShowSchedule((current) => !current)}
                            className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-left text-slate-900 transition hover:bg-slate-200"
                        >
                            {showSchedule ? 'اضغط لإخفاء جدول المواعيد' : 'اضغط لإظهار جدول المواعيد'}
                        </button>
                        {!showSchedule ? (
                            <p className="mt-3 text-sm text-slate-600">اضغط الزر حتى يظهر جدول مواعيد الدواء.</p>
                        ) : (
                            <p className="mt-3 text-sm text-slate-600">اضغط مرة أخرى لإخفاء جدول المواعيد.</p>
                        )}
                    </div>

                    {showSchedule && (
                        <div className="rounded-3xl border border-sky-200 bg-slate-50 p-4">
                            <div className="mb-4 text-sm text-slate-600">جدول مواعيد أسبوعي</div>
                            <div className="overflow-x-auto rounded-3xl border border-slate-300 bg-slate-100">
                                <table className="min-w-full border-collapse text-sm">
                                    <thead className="bg-slate-100 text-slate-700">
                                        <tr>
                                            <th className="px-4 py-3 text-start font-semibold">اليوم</th>
                                            <th className="px-4 py-3 text-center font-semibold">الجرعة الأولى</th>
                                            <th className="px-4 py-3 text-center font-semibold">الجرعة الثانية</th>
                                            <th className="px-4 py-3 text-center font-semibold">الجرعة الثالثة</th>
                                            <th className="px-4 py-3 text-center font-semibold">التكرار الأسبوعي</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {weekDays.map((day) => (
                                            <tr key={day.key} className="hover:bg-slate-100 transition-colors">
                                                <td className="px-4 py-4 text-slate-900">{day.name}</td>
                                                <td className="px-4 py-4 text-center">
                                                    <select
                                                        className="w-full appearance-none rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-900 outline-none"
                                                        value={schedule[day.key].firstTime}
                                                        onChange={(event) => setScheduleTime(day.key, 'firstTime', event.currentTarget.value)}
                                                    >
                                                        <option value="">اختار الساعة</option>
                                                        {Array.from({ length: 24 }, (_, i) => {
                                                            const hour = String(i).padStart(2, '0');
                                                            return <option key={hour} value={`${hour}:00`}>{`${hour}:00`}</option>;
                                                        })}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <select
                                                        className="w-full appearance-none rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-900 outline-none"
                                                        value={schedule[day.key].secondTime}
                                                        onChange={(event) => setScheduleTime(day.key, 'secondTime', event.currentTarget.value)}
                                                    >
                                                        <option value="">اختار الساعة</option>
                                                        {Array.from({ length: 24 }, (_, i) => {
                                                            const hour = String(i).padStart(2, '0');
                                                            return <option key={hour} value={`${hour}:00`}>{`${hour}:00`}</option>;
                                                        })}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <select
                                                        className="w-full appearance-none rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-900 outline-none"
                                                        value={schedule[day.key].thirdTime}
                                                        onChange={(event) => setScheduleTime(day.key, 'thirdTime', event.currentTarget.value)}
                                                    >
                                                        <option value="">اختار الساعة</option>
                                                        {Array.from({ length: 24 }, (_, i) => {
                                                            const hour = String(i).padStart(2, '0');
                                                            return <option key={hour} value={`${hour}:00`}>{`${hour}:00`}</option>;
                                                        })}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={schedule[day.key].repeat}
                                                        onChange={() => toggleSchedule(day.key)}
                                                        className="h-4 w-4 rounded border-slate-300 bg-slate-100 text-sky-500"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="rounded-3xl border border-sky-200 bg-slate-50 p-4">
                        <div className="mb-2 text-sm text-slate-600">ملاحظات إضافية</div>
                        <input
                            type="text"
                            value={notes}
                            onChange={(event) => setNotes(event.currentTarget.value)}
                            placeholder="أي ملاحظات إضافية"
                            className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <button
                    type="button"
                    className="w-full rounded-3xl bg-sky-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-200"
                    onClick={handleAddMedicine}
                    disabled={!name || !dose}
                >
                    {isEditing ? 'حفظ التعديل' : 'حفظ وإضافة الدواء'}
                </button>
            </div>
        </div>
    );
}

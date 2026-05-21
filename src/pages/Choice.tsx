import { useNavigate } from 'react-router-dom';

export default function Choice() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-sky-50 text-slate-900 font-body">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(14,165,233,0.12),transparent_24%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl rounded-[40px] border border-sky-200 bg-white/95 backdrop-blur-md shadow-[0_25px_50px_rgba(14,165,233,0.12)] p-8 md:p-10 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-slate-500 mb-2">اختر وضع الاستخدام</p>
            <h1 className="text-3xl font-display font-semibold text-slate-900">طريقة الاستخدام</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-full border border-sky-200 bg-slate-100 px-4 py-2 text-sm text-slate-900 transition hover:bg-slate-200"
          >
            العودة
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-4xl border border-sky-200 bg-slate-50 p-6 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.12)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-100 text-xl">📦</span>
              <div>
                <h2 className="text-xl font-display font-semibold text-slate-900">مع صندوق الأدوية</h2>
                <p className="text-sm text-slate-600 mt-1">أفضل تجربة ذكية مع تنبيهات وتنظيم تلقائي للجرعات.</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 ">
              <li>• مسح الأدوية تلقائيًا</li>
              <li>• تنبيهات الجرعات والمواعيد</li>
              <li>• سجل المستخدم والدواء الذكي</li>
            </ul>
          </div>

          <div className="rounded-4xl border border-sky-200 bg-slate-50 p-6 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.12)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-xl">⚙️</span>
              <div>
                <h2 className="text-xl font-display font-semibold text-slate-900">بدون صندوق الأدوية</h2>
                <p className="text-sm text-slate-600 mt-1">طريقة يدوية سريعة للتحكم في الأدوية بدون جهاز إضافي.</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>• إضافة الدواء يدويًا</li>
              <li>• تذكير المواعيد بسلاسة</li>
              <li>• مرونة كاملـة في الاستخدام</li>
            </ul>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            className="w-full rounded-3xl bg-sky-600 px-5 py-4 text-sm font-display font-semibold text-white transition hover:bg-sky-700"
          >
            الاستخدام مع صندوق الأدوية
          </button>

          <button
            type="button"
            onClick={() => navigate('/medicines')}
            className="w-full rounded-3xl border border-sky-200 bg-slate-100 px-5 py-4 text-sm font-display font-semibold text-slate-900 transition hover:border-sky-300 hover:bg-slate-200"
          >
            الاستخدام بدون صندوق الأدوية
          </button>
        </div>
      </div>
    </div>
  );
}

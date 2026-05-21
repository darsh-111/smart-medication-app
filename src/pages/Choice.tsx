import { useNavigate } from 'react-router-dom';

export default function Choice() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.12),transparent_24%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl rounded-[40px] border border-white/20 bg-black/70 backdrop-blur-md shadow-[0_25px_50px_rgba(0,0,0,0.5)] p-8 md:p-10 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-white/50 mb-2">اختر وضع الاستخدام</p>
            <h1 className="text-3xl font-semibold text-white">طريقة الاستخدام</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            العودة
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[#68b6ff]/20 text-xl">📦</span>
              <div>
                <h2 className="text-xl font-semibold text-white">مع صندوق الأدوية</h2>
                <p className="text-sm text-white/60 mt-1">أفضل تجربة ذكية مع تنبيهات وتنظيم تلقائي للجرعات.</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-white/70">
              <li>• مسح الأدوية تلقائيًا</li>
              <li>• تنبيهات الجرعات والمواعيد</li>
              <li>• سجل المستخدم والدواء الذكي</li>
            </ul>
          </div>

          <div className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 text-xl">⚙️</span>
              <div>
                <h2 className="text-xl font-semibold text-white">بدون صندوق الأدوية</h2>
                <p className="text-sm text-white/60 mt-1">طريقة يدوية سريعة للتحكم في الأدوية بدون جهاز إضافي.</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-white/70">
              <li>• إضافة الدواء يدويًا</li>
              <li>• تذكير المواعيد بسلاسة</li>
              <li>• مرونة كاملـة في الاستخدام</li>
            </ul>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            className="w-full rounded-3xl bg-[#68b6ff] px-5 py-4 text-sm font-semibold text-black transition hover:bg-[#4f94d0]"
          >
            الاستخدام مع صندوق الأدوية
          </button>

          <button
            type="button"
            onClick={() => navigate('/medicines')}
            className="w-full rounded-3xl border border-white/20 bg-white/5 px-5 py-4 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
          >
            الاستخدام بدون صندوق الأدوية
          </button>
        </div>
      </div>
    </div>
  );
}

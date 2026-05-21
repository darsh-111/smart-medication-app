import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-sky-50 font-body">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(14,165,233,0.12),transparent_24%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-[40px] border border-sky-200 bg-white/95 backdrop-blur-md shadow-[0_25px_50px_rgba(14,165,233,0.12)] p-10">
        <h2 className="text-3xl font-display font-bold text-center text-slate-900 mb-8">تسجيل الدخول</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-700">
              الإيميل
            </label>
            <input
              id="login-email"
              type="email"
              className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-200"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-700">
              كلمة السر
            </label>
            <input
              id="login-password"
              type="password"
              className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-200"
            />
          </div>

          <button
            type="button"
            onClick={() => navigate('/choice')}
            className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-display font-semibold text-white transition hover:bg-sky-700"
          >
            تسجيل الدخول
          </button>

          <button
            type="button"
            onClick={() => navigate('/register')}
            className="w-full rounded-2xl border border-sky-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-sky-300 hover:bg-slate-200"
          >
            إنشاء حساب جديد
          </button>

          <button
            type="button"
            className="w-full rounded-2xl border border-sky-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-sky-300 hover:bg-slate-200"
          >
            تسجيل دخول بجوجل
          </button>
        </div>
      </div>
    </div>
  );
}

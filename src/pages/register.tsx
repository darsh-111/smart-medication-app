
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.12),transparent_24%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md rounded-[40px] border border-white/20 bg-black/50 backdrop-blur-md shadow-[0_25px_50px_rgba(0,0,0,0.4)] p-10">
        <h2 className="text-3xl font-bold text-center text-white mb-8">إنشاء حساب جديد</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="register-email" className="block text-sm font-medium text-white/80">
              الإيميل
            </label>
            <input
              id="register-email"
              type="email"
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-[#68b6ff] focus:ring-4 focus:ring-[#68b6ff]/20"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="register-name" className="block text-sm font-medium text-white/80">
              اسم الحساب
            </label>
            <input
              id="register-name"
              type="text"
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-[#68b6ff] focus:ring-4 focus:ring-[#68b6ff]/20"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="register-password" className="block text-sm font-medium text-white/80">
              كلمة السر
            </label>
            <input
              id="register-password"
              type="password"
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-[#68b6ff] focus:ring-4 focus:ring-[#68b6ff]/20"
            />
          </div>

          <button
            type="button"
            onClick={() => navigate('/choice')}
            className="w-full rounded-2xl bg-[#68b6ff] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#4f94d0] focus:outline-none focus:ring-4 focus:ring-[#68b6ff]/30"
          >
            إنشاء حساب
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/30"
          >
            تسجيل الدخول
          </button>

          <button
            type="button"
            className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-white/30"
          >
            تسجيل دخول بواسطة جوجل
          </button>
        </div>
      </div>
    </div>
  );
}

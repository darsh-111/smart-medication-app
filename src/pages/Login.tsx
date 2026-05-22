import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'patient'; // افتراضياً مريض

  const getRoleTitle = () => {
    if (role === 'doctor') return 'بوابة الطبيب المعالج 👨‍⚕️';
    if (role === 'caregiver') return 'بوابة المتابع من الأهل ❤️';
    return 'بوابة المريض / المستخدم 🤕';
  };

  const handleLogin = () => {
    if (role === 'doctor') {
      navigate('/doctor');
    } else if (role === 'caregiver') {
      navigate('/caregiver');
    } else {
      navigate('/choice');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-sky-50 font-body" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(14,165,233,0.12),transparent_24%)] pointer-events-none" />

      {/* 📱 هيكل الموبايل الكبير الموحد */}
      <div className="relative z-10 w-95 max-w-[95vw] min-h-155 border-4 border-white rounded-[40px] bg-white/95 backdrop-blur-md shadow-[0_0_0_1px_rgba(14,165,233,0.12),0_25px_50px_rgba(14,165,233,0.08)] p-8 pt-14 pb-9 flex flex-col justify-between overflow-hidden">
        
        {/* سماعة الموبايل العلوية المحاكاة */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-22.5 h-1.5 rounded-full border border-slate-200" />

        {/* زر العودة للخلف */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute top-5 left-6 text-xs font-semibold text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          رجوع
        </button>

        {/* المحتوى */}
        <div className="grow flex flex-col justify-center space-y-6 mt-4">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-extrabold text-sky-600 bg-sky-100/70 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
              {getRoleTitle()}
            </span>
            <h2 className="text-2xl font-display font-black text-slate-900">تسجيل الدخول</h2>
            <p className="text-[10px] text-slate-400">سجل دخولك للوصول إلى بياناتك الصحية ومتابعتها</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 text-right mr-1">
                الإيميل
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="doctor@app.com أو patient@app.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-400 text-right"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 text-right mr-1">
                كلمة السر
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-sky-400 text-right"
              />
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={handleLogin}
                className="w-full min-h-12 py-3 px-4 text-sm font-display font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-2xl shadow-md cursor-pointer transition active:scale-[0.99]"
              >
                تسجيل الدخول إلى حسابي 🚀
              </button>

              <button
                type="button"
                onClick={() => navigate(`/register?role=${role}`)}
                className="w-full min-h-12 py-3 px-4 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition"
              >
                ليس لدي حساب؟ إنشاء حساب جديد
              </button>
            </div>
          </div>
        </div>

        {/* زر شريط الهوم السفلي المحاكي للموبايل */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12.5 h-2.5 rounded-full border border-slate-200 shrink-0" />
      </div>
    </div>
  );
}

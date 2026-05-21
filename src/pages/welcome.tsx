

import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    // الخلفية الكاملة للصفحة مع تأثير الجراديانت وشبكة المربعات الخلفية
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-sky-50 font-body">

      {/* تأثيرات الإضاءة الخلفية الناعمة بـ Tailwind */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(14,165,233,0.12),transparent_24%)] pointer-events-none" />

      {/* 📱 هيكل الموبايل الكبير - متناسق وبأبعاد مظبوطة جداً */}
      <div className="relative z-10 w-95 max-w-[95vw] min-h-155 border border-sky-200 rounded-[40px] bg-white/95 backdrop-blur-md shadow-[0_0_0_1px_rgba(14,165,233,0.12),0_25px_50px_rgba(14,165,233,0.08)] p-11 pt-14 pb-9 flex flex-col justify-between">

        {/* سماعة الموبايل العلوية المحاكية للتصميم */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-22.5 h-1.5 rounded-full border border-slate-200" />

        {/* محتوى الصفحة الداخلي */}
        <div className="flex flex-col grow justify-center">
          <h1 className="text-xl font-display font-bold text-center text-slate-900 mb-12 tracking-wide">
            مساعد الدواء الذكي
          </h1>

          {/* 🔘 أزرار التوجيه والمسافة المظبوطة بالملي بينها (gap-5) */}
          <div className="flex flex-col gap-5">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full min-h-11.5 py-2.5 px-4 text-sm font-display font-semibold text-slate-900 bg-sky-200 border border-sky-300 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-300 hover:shadow-[0_12px_24px_rgba(14,165,233,0.2)] focus-visible:outline-2 focus-visible:outline-sky-400 focus-visible:outline-offset-3"
            >
              تسجيل دخول
            </button>

            <button
              type="button"
              onClick={() => navigate('/register')}
              className="w-full min-h-11.5 py-2.5 px-4 text-sm font-display font-semibold text-slate-900 bg-sky-100 border border-sky-200 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-200 hover:shadow-[0_12px_24px_rgba(14,165,233,0.15)] focus-visible:outline-2 focus-visible:outline-sky-300 focus-visible:outline-offset-3"
            >
              إنشاء حساب جديد
            </button>
          </div>
        </div>

        {/* زر الهوم السفلي للموبايل */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12.5 h-2.5 rounded-full border border-slate-200" />

      </div>
    </div>
  );
}
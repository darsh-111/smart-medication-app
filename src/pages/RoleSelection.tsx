import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showAuthOptions, setShowAuthOptions] = useState(false); // الـ State المسؤولة عن إظهار خيارات الدخول

  const roles = [
    {
      id: 'doctor',
      title: 'أنا طبيب معالج',
      desc: 'لكتابة الروشتات الرقمية، تحديد الجرعات، ومتابعة حالة التزام المرضى عن بُعد.',
      icon: '👨‍⚕️',
      activeColor: 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20',
      inactiveColor: 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/30'
    },
    {
      id: 'patient',
      title: 'أنا مريض / مستخدم',
      desc: 'لاستقبال مواعيد الأدوية، تفعيل التنبيهات الذكية، وربط حسابي بالصندوق الذكي.',
      icon: '🤕',
      activeColor: 'border-sky-500 bg-sky-50/70 text-sky-950 ring-2 ring-sky-500/20',
      inactiveColor: 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-sky-200 hover:bg-sky-50/30'
    },
    {
      id: 'caregiver',
      title: 'أنا متابع (من الأهل)',
      desc: 'لمراقبة سجل جرعات المريض، وتلقي إشعارات فورية طارئة في حالة نسيان الدواء.',
      icon: '❤️',
      activeColor: 'border-rose-500 bg-rose-50/70 text-rose-950 ring-2 ring-rose-500/20',
      inactiveColor: 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-rose-200 hover:bg-rose-50/30'
    }
  ];

  // دالة للحصول على اسم الدور باللغة العربية لعرضه في المودال
  const getRoleNameArabic = (id: string | null) => {
    if (id === 'doctor') return 'الطبيب';
    if (id === 'patient') return 'المريض';
    if (id === 'caregiver') return 'المتابع';
    return '';
  };

  const handleAction = (actionType: 'login' | 'register') => {
    // التوجيه لصفحة تسجيل الدخول أو إنشاء الحساب مع تمرير الدور المختار
    navigate(`/${actionType}?role=${selectedRole}`);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-sky-50 text-slate-900 font-body" dir="rtl">
      
      {/* تأثير الإضاءة الخلفية الناعمة */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(14,165,233,0.12),transparent_24%)] pointer-events-none" />

      {/* 📱 هيكل الموبايل الكبير الموحد */}
      <div className="relative z-10 w-95 max-w-[95vw] min-h-155 border-4 border-white rounded-[40px] bg-white/95 backdrop-blur-md shadow-[0_0_0_1px_rgba(14,165,233,0.12),0_25px_50px_rgba(14,165,233,0.08)] p-8 pt-14 pb-9 flex flex-col justify-between overflow-hidden">
        
        {/* سماعة الموبايل العلوية المحاكاة */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-22.5 h-1.5 rounded-full border border-slate-200" />

        {/* زر العودة الخلفي العلوي */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute top-5 left-6 text-xs font-semibold text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          رجوع
        </button>

        {/* محتوى الصفحة الداخلي */}
        <div className="flex-grow flex flex-col justify-center space-y-6 mt-4">
          <div className="text-right space-y-1.5 px-1">
            <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">مرحباً بك في مساعد الدواء</p>
            <h1 className="text-2xl font-display font-black text-slate-950 leading-tight">تحديد نوع الحساب</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              من فضلك اختر صفتك لتخصيص واجهة النظام والخدمات المناسبة لك.
            </p>
          </div>

          {/* خيارات الأدوار الثلاثة */}
          <div className="flex flex-col gap-3.5">
            {roles.map((role) => {
              const isSelected = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.id);
                    setShowAuthOptions(false); // إغلاق الخيارات لو غير الدور
                  }}
                  className={`w-full p-4 border-2 rounded-2xl flex items-start gap-4 text-right transition-all duration-200 cursor-pointer active:scale-[0.99] shadow-sm ${
                    isSelected ? role.activeColor : role.inactiveColor
                  }`}
                >
                  <span className="text-2xl bg-white border border-slate-100 p-2.5 rounded-xl shadow-sm shrink-0 mt-0.5">
                    {role.icon}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-display font-bold leading-none">
                      {role.title} {isSelected && '✨'}
                    </h3>
                    <p className="text-[11px] opacity-80 leading-relaxed font-medium">
                      {role.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* زر المتابعة الرئيسي */}
        <div className="mt-8 shrink-0">
          <button
            type="button"
            onClick={() => setShowAuthOptions(true)} // فتح نافذة الخيارات السفلية
            disabled={!selectedRole}
            className={`w-full min-h-13 py-3.5 px-6 text-base font-display font-bold text-white rounded-2xl shadow-md transition-all duration-200 ${
              selectedRole 
                ? 'bg-sky-600 hover:bg-sky-700 hover:-translate-y-0.5 cursor-pointer shadow-[0_8px_16px_rgba(14,165,233,0.25)]' 
                : 'bg-slate-300 cursor-not-allowed shadow-none opacity-60'
            }`}
          >
            المتابعة وتأكيد الاختيار 🚀
          </button>
        </div>

        {/* 🔼 النافذة المنبثقة الذكية (Bottom Sheet Modal) */}
        {showAuthOptions && (
          <div className="absolute inset-x-0 bottom-0 bg-slate-950/40 backdrop-blur-sm z-30 flex flex-col justify-end transition-all duration-300 animate-fade-in h-full">
            {/* المساحة الشفافة العلوية لإغلاق المودال عند الضغط عليها */}
            <div className="flex-grow" onClick={() => setShowAuthOptions(false)} />
            
            {/* جسم الـ Modal السفلي المحاكي للموبايل الفخم */}
            <div className="bg-white rounded-t-[32px] p-6 pb-10 border-t border-sky-100 space-y-5 shadow-[0_-15px_30px_rgba(0,0,0,0.08)] animate-slide-up relative">
              
              {/* شريط السحب الصغير ديكور للموبايل */}
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-2" />
              
              {/* عنوان المودال بدلالة الدور */}
              <div className="text-center space-y-1">
                <h3 className="text-lg font-display font-black text-slate-950">
                  مرحباً بك في بوابة {getRoleNameArabic(selectedRole)}
                </h3>
                <p className="text-xs text-slate-500">لديك حساب بالفعل أم تريد التسجيل كعضو جديد؟</p>
              </div>

              {/* أزرار تسجيل الدخول وإنشاء الحساب */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleAction('login')}
                  className="w-full min-h-12 py-3 px-4 text-sm font-display font-bold text-slate-950 bg-sky-200 border border-sky-300 rounded-xl cursor-pointer transition hover:bg-sky-300"
                >
                  تسجيل الدخول إلى حسابي
                </button>

                <button
                  type="button"
                  onClick={() => handleAction('register')}
                  className="w-full min-h-12 py-3 px-4 text-sm font-display font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition hover:bg-slate-100"
                >
                  إنشاء حساب جديد
                </button>
              </div>

              {/* زر إلغاء لتوفير حرية الحركة لليوزر */}
              <button
                type="button"
                onClick={() => setShowAuthOptions(false)}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
              >
                إلغاء وتغيير نوع الحساب
              </button>
            </div>
          </div>
        )}

        {/* زر شريط الهوم السفلي المحاكي للموبايل */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12.5 h-2.5 rounded-full border border-slate-200" />

      </div>
    </div>
  );
}

import { useParams, useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'smartMedicationMedicines';

export default function AlarmScreen() {
  const { index } = useParams();
  const navigate = useNavigate();

  // جلب البيانات الحقيقية من الـ LocalStorage بناءً على الـ index
  const savedMedicines = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const currentMedicine = savedMedicines[Number(index)];

  // إذا لم يعثر على دواء بالـ index (عند الدخول المباشر للشاشة مثلاً)، يستخدم الصورة والبيانات الافتراضية
  const medicineData = currentMedicine || {
    name: "بانادول 500 مجم",
    dose: "قرص واحد",
    notes: "بعد الأكل بنصف ساعة",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop", 
  };

  const handleConfirm = () => {
    alert(`تم تسجيل أخذ الجرعة بنجاح! شكراً لك.`);
    navigate('/medicines'); // يعود لصفحة الأدوية بعد التأكيد
  };

  const handleSnooze = () => {
    alert('سيتم تذكيرك مرة أخرى بعد 10 دقائق.');
    navigate('/medicines'); // يعود لصفحة الأدوية بعد التأجيل
  };

  return (
    // الخلفية الكاملة مع تأثير الجراديانت
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-sky-50 text-slate-900 font-body">
      
      {/* تأثير الإضاءة الخلفية الناعمة */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(14,165,233,0.12),transparent_24%)] pointer-events-none" />

      {/* 📱 هيكل الموبايل الكبير الموحد */}
      <div className="relative z-10 w-95 max-w-[95vw] min-h-155 border-4 border-white rounded-[40px] bg-white/95 backdrop-blur-md shadow-[0_0_0_1px_rgba(14,165,233,0.12),0_25px_50px_rgba(14,165,233,0.1)] p-8 pt-14 pb-9 flex flex-col justify-between" dir="rtl">
        
        {/* سماعة الموبايل العلوية المحاكاة */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-22.5 h-1.5 rounded-full border border-slate-200" />

        {/* 👈 زر العودة (إغلاق) المضاف حديثاً في أعلى الشاشة جهة اليسار */}
        <button
          type="button"
          onClick={() => navigate('/medicines')}
          className="absolute top-5 left-6 px-3 py-1 text-xs font-semibold text-slate-400 border border-slate-200 rounded-full hover:bg-slate-50 hover:text-slate-600 transition cursor-pointer z-20"
        >
          إغلاق ✕
        </button>

        {/* محتوى الشاشة الداخلي - مركز في المنتصف */}
        <div className="grow flex flex-col items-center justify-center space-y-6 text-center mt-4">
          
          {/* أيقونة المنبه النابضة */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-75" />
            <div className="relative p-4 bg-red-50 text-red-500 rounded-full border border-red-100 flex items-center justify-center text-3xl">
              ⏰
            </div>
          </div>

          {/* عنوان التنبيه الكبير */}
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-slate-400">تنبيه الآن</p>
            <h1 className="text-3xl font-display font-extrabold text-slate-950 leading-tight">وقت الدواء!</h1>
          </div>

          {/* 🖼️ صورة الدواء الكبيرة جداً والمميزة (تم الحفاظ عليها بالكامل) */}
          <div className="w-full aspect-square max-w-70 rounded-3xl overflow-hidden border-4 border-sky-100 shadow-[inset_0_4px_8px_rgba(0,0,0,0.05),0_12px_24px_rgba(14,165,233,0.15)] bg-white flex items-center justify-center p-1">
            {medicineData.image ? (
                <img src={medicineData.image} alt="Medicine" className="w-full h-full object-cover rounded-2xl" />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-sky-50 text-sky-400 rounded-2xl">
                    <span className="text-5xl mb-2">📷</span>
                    <span className="text-xs font-medium text-sky-600">لم يتم إضافة صورة</span>
                </div>
            )}
          </div>

          {/* معلومات الدواء والجرعة - بخطوط واضحة */}
          <div className="space-y-1 w-full bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-inner">
            <h2 className="text-xl font-display font-bold text-slate-950">{medicineData.name}</h2>
            <p className="text-lg text-sky-700 font-semibold">{medicineData.dose}</p>
            {medicineData.notes && (
                <p className="text-sm text-slate-600 mt-2 bg-white px-2 py-1 rounded-md inline-block">({medicineData.notes})</p>
            )}
          </div>
        </div>

        {/* 🔘 أزرار التحكم والعمليات الكبيرة جداً */}
        <div className="flex flex-col gap-4 mt-8 shrink-0">
          
          {/* زر التأكيد الأخضر الكبير - تم أخذ الجرعة */}
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full min-h-16 py-4 px-6 text-xl font-display font-bold text-white bg-emerald-600 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-[0_12px_24px_rgba(16,185,129,0.3)] focus-visible:outline-2 focus-visible:outline-emerald-400 focus-visible:outline-offset-3 shadow-[0_4px_6px_rgba(0,0,0,0.1)]"
          >
            تم أخذ الجرعة ✅
          </button>

          {/* زر التأجيل الرمادي - للتذكير لاحقاً (Snooze) */}
          <button
            type="button"
            onClick={handleSnooze}
            className="w-full min-h-12 py-3 px-6 text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-200"
          >
            تذكير لاحقاً ⏳
          </button>
        </div>

        {/* زر شريط الهوم السفلي المحاكي للموبايل */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12.5 h-2.5 rounded-full border border-slate-200" />

      </div>
    </div>
  );
}
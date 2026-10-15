// ====================================================
// أنواع البيانات الأساسية للتطبيق
// Hadith Memorizer App - Core TypeScript Types
// ====================================================

/** حالة حفظ الحديث */
export type HadithStatus = 'new' | 'learning' | 'review' | 'memorized';

/** تقييم المراجعة */
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

/** بطاقة الحديث الكاملة */
export interface HadithCard {
  id: string;
  number: number;          // رقم الحديث من 1 إلى 21
  text: string;            // نص الحديث الكامل بالعربية
  narrator: string;        // الراوي
  chain: string;           // مصدر الحديث (البخاري، مسلم، إلخ)
  notes?: string;          // ملاحظات إضافية اختيارية

  // بيانات التكرار المتباعد (Spaced Repetition)
  status: HadithStatus;
  interval: number;        // الفاصل الزمني بالدقائق
  easeFactor: number;      // معامل السهولة (1.3 - 2.5)
  repetitions: number;     // عدد المراجعات الناجحة المتتالية
  nextReview: number;      // طابع وقت المراجعة القادمة (ms)
  lastReview: number | null; // طابع وقت آخر مراجعة
}

/** إعدادات التطبيق */
export interface AppSettings {
  // إعدادات الإشعارات
  notificationsEnabled: boolean;
  notificationSound: boolean;

  // أوقات الهدوء
  quietHoursEnabled: boolean;
  quietHoursStart: string;   // تنسيق HH:MM
  quietHoursEnd: string;     // تنسيق HH:MM

  // إعدادات الفاصل الزمني
  useCustomInterval: boolean;
  customIntervalMinutes: number; // الفاصل الزمني المخصص بالدقائق

  // إعدادات التحويل النصي إلى صوت (TTS)
  ttsEnabled: boolean;
  ttsRate: number;           // سرعة القراءة 0.5 - 2.0
  ttsVoice: string;          // اسم الصوت المختار

  // المظهر
  theme: 'light' | 'dark';
}

/** نتيجة جلسة المراجعة */
export interface ReviewResult {
  hadithId: string;
  rating: ReviewRating;
  timestamp: number;
  previousInterval: number;
  newInterval: number;
}

/** إحصائيات التقدم العام */
export interface ProgressStats {
  total: number;
  newCount: number;
  learningCount: number;
  reviewCount: number;
  memorizedCount: number;
  dueNow: number;
  completionPercentage: number;
}

/** حالة الإشعار النشط */
export interface ActiveNotification {
  hadithId: string;
  showAt: number;
  shown: boolean;
}

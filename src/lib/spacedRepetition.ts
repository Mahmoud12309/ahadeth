// ====================================================
// خوارزمية التكرار المتباعد (Spaced Repetition)
// نسخة مبسطة من خوارزمية SM-2 بفواصل زمنية بالدقائق
// ====================================================

import { HadithCard, ReviewRating } from '../types';

/** الحد الأدنى لمعامل السهولة */
const MIN_EASE = 1.3;
/** الحد الأقصى لمعامل السهولة */
const MAX_EASE = 2.5;
/** الفاصل الزمني الأولي بالدقائق */
const INITIAL_INTERVAL = 5;
/** الحد الأقصى للفاصل الزمني (8 ساعات بالدقائق) */
const MAX_INTERVAL = 480;

/**
 * حساب الفاصل الزمني الجديد بناءً على التقييم
 * @param card - بطاقة الحديث الحالية
 * @param rating - تقييم المراجعة
 * @param customIntervalMinutes - فاصل زمني مخصص (اختياري)
 */
export function calculateNextInterval(
  card: HadithCard,
  rating: ReviewRating,
  customIntervalMinutes?: number
): { interval: number; easeFactor: number; repetitions: number; status: HadithCard['status'] } {
  // إذا كان هناك فاصل زمني مخصص، نستخدمه مباشرةً (إلا عند التقييم "مجدداً")
  if (customIntervalMinutes && rating !== 'again') {
    return {
      interval: customIntervalMinutes,
      easeFactor: card.easeFactor,
      repetitions: card.repetitions + 1,
      status: card.repetitions >= 2 ? 'memorized' : 'learning',
    };
  }

  let newInterval = card.interval;
  let newEase = card.easeFactor;
  let newReps = card.repetitions;
  let newStatus: HadithCard['status'] = card.status;

  switch (rating) {
    case 'again':
      // إعادة من البداية
      newInterval = INITIAL_INTERVAL;
      newEase = Math.max(MIN_EASE, card.easeFactor - 0.2);
      newReps = 0;
      newStatus = 'learning';
      break;

    case 'hard':
      // زيادة طفيفة — الحديث صعب
      newInterval = Math.round(card.interval * 1.2);
      newEase = Math.max(MIN_EASE, card.easeFactor - 0.15);
      newReps = card.repetitions + 1;
      newStatus = newReps >= 1 ? 'review' : 'learning';
      break;

    case 'good':
      // زيادة عادية باستخدام معامل السهولة
      if (card.repetitions === 0) {
        newInterval = INITIAL_INTERVAL * 2; // 10 دقائق للمرة الأولى
      } else if (card.repetitions === 1) {
        newInterval = INITIAL_INTERVAL * 5; // 25 دقيقة للمرة الثانية
      } else {
        newInterval = Math.round(card.interval * card.easeFactor);
      }
      newReps = card.repetitions + 1;
      newStatus = newReps >= 3 ? 'memorized' : 'review';
      break;

    case 'easy':
      // زيادة كبيرة — الحديث محفوظ جيداً
      newInterval = Math.round(card.interval * card.easeFactor * 1.3);
      newEase = Math.min(MAX_EASE, card.easeFactor + 0.15);
      newReps = card.repetitions + 1;
      newStatus = 'memorized';
      break;
  }

  // تطبيق الحد الأقصى للفاصل الزمني
  newInterval = Math.min(newInterval, MAX_INTERVAL);
  // الحد الأدنى 1 دقيقة
  newInterval = Math.max(1, newInterval);

  return {
    interval: newInterval,
    easeFactor: newEase,
    repetitions: newReps,
    status: newStatus,
  };
}

/**
 * تحديث بطاقة الحديث بعد المراجعة
 */
export function updateCardAfterReview(
  card: HadithCard,
  rating: ReviewRating,
  customIntervalMinutes?: number
): HadithCard {
  const { interval, easeFactor, repetitions, status } = calculateNextInterval(
    card,
    rating,
    customIntervalMinutes
  );

  const nextReview = Date.now() + interval * 60 * 1000;

  return {
    ...card,
    interval,
    easeFactor,
    repetitions,
    status,
    nextReview,
    lastReview: Date.now(),
  };
}

/**
 * الحصول على الأحاديث المستحقة للمراجعة الآن
 */
export function getDueHadiths(hadiths: HadithCard[]): HadithCard[] {
  const now = Date.now();
  return hadiths
    .filter((h) => h.nextReview <= now)
    .sort((a, b) => a.nextReview - b.nextReview);
}

/**
 * الحصول على الحديث التالي المستحق
 */
export function getNextDueHadith(hadiths: HadithCard[]): HadithCard | null {
  const due = getDueHadiths(hadiths);
  return due.length > 0 ? due[0] : null;
}

/**
 * تنسيق وقت المراجعة القادمة بالعربية
 */
export function formatNextReview(nextReview: number): string {
  const diffMs = nextReview - Date.now();
  if (diffMs <= 0) return 'مستحق الآن';

  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 60) {
    return `بعد ${diffMin} دقيقة`;
  }

  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) {
    return `بعد ${diffHours} ساعة`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `بعد ${diffDays} يوم`;
}

/**
 * حساب نسبة التقدم الكلية
 */
export function calculateProgress(hadiths: HadithCard[]): number {
  if (hadiths.length === 0) return 0;
  const memorized = hadiths.filter((h) => h.status === 'memorized').length;
  return Math.round((memorized / hadiths.length) * 100);
}

/**
 * التحقق مما إذا كان الوقت ضمن أوقات الهدوء
 */
export function isQuietHour(quietStart: string, quietEnd: string): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = quietStart.split(':').map(Number);
  const [endH, endM] = quietEnd.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // تجاوز منتصف الليل
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}

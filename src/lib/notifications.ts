// ====================================================
// خدمة الإشعارات ونظام التنبيهات الصوتية
// Notifications & Background Alert Service
// ====================================================

import { HadithCard, AppSettings } from '../types';
import { isQuietHour } from './spacedRepetition';

/** طلب إذن الإشعارات من المتصفح */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('هذا المتصفح لا يدعم الإشعارات');
    return false;
  }

  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/** التحقق من حالة إذن الإشعارات */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/** عرض إشعار للحديث */
export function showHadithNotification(
  hadith: HadithCard,
  onReview?: () => void
): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  // اختصار نص الحديث إذا كان طويلاً جداً
  const truncatedText =
    hadith.text.length > 150 ? hadith.text.substring(0, 147) + '...' : hadith.text;

  const notification = new Notification(`📖 الحديث ${hadith.number} — وقت المراجعة`, {
    body: truncatedText,
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    tag: `hadith-${hadith.id}`, // منع تراكم الإشعارات لنفس الحديث
    requireInteraction: true,   // إبقاء الإشعار حتى يتفاعل المستخدم
    dir: 'rtl',
    lang: 'ar',
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
    onReview?.();
  };
}

// ─── متغير المؤقت الداخلي ────────────────────────────

let intervalTimer: ReturnType<typeof setInterval> | null = null;

/**
 * بدء نظام التنبيهات التلقائية
 * يفحص كل دقيقة إذا كان هناك أحاديث مستحقة للمراجعة
 */
export function startNotificationScheduler(
  getHadiths: () => HadithCard[],
  getSettings: () => AppSettings,
  onHadithDue: (hadith: HadithCard) => void
): void {
  // إيقاف أي مجدول سابق
  stopNotificationScheduler();

  const CHECK_INTERVAL_MS = 60 * 1000; // فحص كل دقيقة

  const checkAndNotify = () => {
    const settings = getSettings();
    if (!settings.notificationsEnabled) return;

    // التحقق من أوقات الهدوء
    if (
      settings.quietHoursEnabled &&
      isQuietHour(settings.quietHoursStart, settings.quietHoursEnd)
    ) {
      return;
    }

    const hadiths = getHadiths();
    const now = Date.now();
    const dueHadiths = hadiths.filter((h) => h.nextReview <= now);

    if (dueHadiths.length > 0) {
      // عرض إشعار للحديث الأول المستحق
      const hadith = dueHadiths[0];
      showHadithNotification(hadith, () => onHadithDue(hadith));
    }
  };

  // فحص فوري عند التشغيل
  checkAndNotify();

  // تشغيل الفحص الدوري
  intervalTimer = setInterval(checkAndNotify, CHECK_INTERVAL_MS);
}

/** إيقاف نظام التنبيهات */
export function stopNotificationScheduler(): void {
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
  }
}

/** تسجيل Service Worker لدعم الإشعارات في الخلفية */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('تم تسجيل Service Worker بنجاح:', registration.scope);
    return registration;
  } catch (err) {
    console.error('فشل في تسجيل Service Worker:', err);
    return null;
  }
}

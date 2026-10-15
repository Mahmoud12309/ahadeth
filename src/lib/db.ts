// ====================================================
// طبقة قاعدة البيانات المحلية (LocalStorage)
// حفظ واسترجاع بيانات الأحاديث والإعدادات
// ====================================================

import { HadithCard, AppSettings } from '../types';
import { getInitialHadiths } from '../data/hadiths';

const HADITHS_KEY = 'hadith_memorizer_hadiths';
const SETTINGS_KEY = 'hadith_memorizer_settings';

/** الإعدادات الافتراضية للتطبيق */
export const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: false,
  notificationSound: true,
  quietHoursEnabled: false,
  quietHoursStart: '23:00',
  quietHoursEnd: '07:00',
  useCustomInterval: false,
  customIntervalMinutes: 30,
  ttsEnabled: true,
  ttsRate: 0.9,
  ttsVoice: '',
  theme: 'light',
};

// ─── الأحاديث ────────────────────────────────────────

/** تحميل الأحاديث من التخزين المحلي */
export function loadHadiths(): HadithCard[] {
  try {
    const raw = localStorage.getItem(HADITHS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as HadithCard[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('خطأ في تحميل الأحاديث:', e);
  }
  // أول مرة — تحميل البيانات الأولية
  const initial = getInitialHadiths();
  saveHadiths(initial);
  return initial;
}

/** حفظ الأحاديث في التخزين المحلي */
export function saveHadiths(hadiths: HadithCard[]): void {
  try {
    localStorage.setItem(HADITHS_KEY, JSON.stringify(hadiths));
  } catch (e) {
    console.error('خطأ في حفظ الأحاديث:', e);
  }
}

/** تحديث حديث واحد */
export function updateHadith(hadiths: HadithCard[], updated: HadithCard): HadithCard[] {
  const newList = hadiths.map((h) => (h.id === updated.id ? updated : h));
  saveHadiths(newList);
  return newList;
}

/** إضافة أو تعديل حديث */
export function upsertHadith(hadiths: HadithCard[], hadith: HadithCard): HadithCard[] {
  const exists = hadiths.some((h) => h.id === hadith.id);
  const newList = exists
    ? hadiths.map((h) => (h.id === hadith.id ? hadith : h))
    : [...hadiths, hadith];
  saveHadiths(newList);
  return newList;
}

/** إعادة تعيين حديث معين إلى حالته الأولية */
export function resetHadith(hadiths: HadithCard[], hadithId: string): HadithCard[] {
  const newList = hadiths.map((h) =>
    h.id === hadithId
      ? {
          ...h,
          status: 'new' as const,
          interval: 5,
          easeFactor: 2.5,
          repetitions: 0,
          nextReview: Date.now(),
          lastReview: null,
        }
      : h
  );
  saveHadiths(newList);
  return newList;
}

/** إعادة تعيين كل الأحاديث */
export function resetAllHadiths(): HadithCard[] {
  const initial = getInitialHadiths();
  saveHadiths(initial);
  return initial;
}

// ─── الإعدادات ────────────────────────────────────────

/** تحميل الإعدادات من التخزين المحلي */
export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('خطأ في تحميل الإعدادات:', e);
  }
  return DEFAULT_SETTINGS;
}

/** حفظ الإعدادات في التخزين المحلي */
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('خطأ في حفظ الإعدادات:', e);
  }
}

/** تحديث إعداد واحد */
export function updateSetting<K extends keyof AppSettings>(
  settings: AppSettings,
  key: K,
  value: AppSettings[K]
): AppSettings {
  const updated = { ...settings, [key]: value };
  saveSettings(updated);
  return updated;
}

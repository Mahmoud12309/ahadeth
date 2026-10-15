// ====================================================
// السياق العام للتطبيق (Global App Context)
// إدارة الحالة المشتركة بين كل المكونات
// ====================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { HadithCard, AppSettings, ReviewRating } from '../types';
import { loadHadiths, saveHadiths, loadSettings, saveSettings, updateHadith } from '../lib/db';
import { updateCardAfterReview, getDueHadiths } from '../lib/spacedRepetition';
import {
  startNotificationScheduler,
  stopNotificationScheduler,
  requestNotificationPermission,
} from '../lib/notifications';

// ─── نوع السياق ────────────────────────────────────────

interface AppContextType {
  // البيانات
  hadiths: HadithCard[];
  settings: AppSettings;
  activeTab: 'home' | 'list' | 'settings';

  // الدوال
  setHadiths: (hadiths: HadithCard[]) => void;
  updateSettings: (settings: AppSettings) => void;
  setActiveTab: (tab: 'home' | 'list' | 'settings') => void;
  reviewHadith: (hadith: HadithCard, rating: ReviewRating) => void;
  resetHadithCard: (id: string) => void;
  resetAllCards: () => void;
  toggleNotifications: () => Promise<void>;

  // حالة التطبيق
  dueHadiths: HadithCard[];
  currentReviewHadith: HadithCard | null;
  setCurrentReviewHadith: (hadith: HadithCard | null) => void;
  isReviewMode: boolean;
  setIsReviewMode: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

// ─── المزوّد ────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hadiths, setHadithsState] = useState<HadithCard[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings());
  const [activeTab, setActiveTab] = useState<'home' | 'list' | 'settings'>('home');
  const [currentReviewHadith, setCurrentReviewHadith] = useState<HadithCard | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const hadithsRef = useRef<HadithCard[]>([]);
  const settingsRef = useRef<AppSettings>(settings);

  // تحميل البيانات عند بدء التطبيق
  useEffect(() => {
    const loaded = loadHadiths();
    setHadithsState(loaded);
    hadithsRef.current = loaded;
  }, []);

  // مزامنة الرجوع مع refs
  useEffect(() => {
    hadithsRef.current = hadiths;
  }, [hadiths]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // تشغيل/إيقاف المجدول عند تغيير إعدادات الإشعارات
  useEffect(() => {
    if (settings.notificationsEnabled) {
      startNotificationScheduler(
        () => hadithsRef.current,
        () => settingsRef.current,
        (hadith) => {
          setCurrentReviewHadith(hadith);
          setIsReviewMode(true);
          setActiveTab('home');
        }
      );
    } else {
      stopNotificationScheduler();
    }

    return () => stopNotificationScheduler();
  }, [settings.notificationsEnabled]);

  /** حفظ الأحاديث وتحديث الحالة */
  const setHadiths = useCallback((newHadiths: HadithCard[]) => {
    setHadithsState(newHadiths);
    saveHadiths(newHadiths);
  }, []);

  /** تحديث الإعدادات */
  const updateSettings = useCallback((newSettings: AppSettings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
  }, []);

  /** مراجعة حديث وتحديث بياناته */
  const reviewHadith = useCallback(
    (hadith: HadithCard, rating: ReviewRating) => {
      const customInterval = settingsRef.current.useCustomInterval
        ? settingsRef.current.customIntervalMinutes
        : undefined;

      const updated = updateCardAfterReview(hadith, rating, customInterval);
      const newHadiths = updateHadith(hadithsRef.current, updated);
      setHadithsState(newHadiths);
    },
    []
  );

  /** إعادة تعيين بطاقة حديث واحد */
  const resetHadithCard = useCallback(
    (id: string) => {
      const newHadiths = hadithsRef.current.map((h) =>
        h.id === id
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
      setHadiths(newHadiths);
    },
    [setHadiths]
  );

  /** إعادة تعيين كل البطاقات */
  const resetAllCards = useCallback(() => {
    const reset = hadithsRef.current.map((h) => ({
      ...h,
      status: 'new' as const,
      interval: 5,
      easeFactor: 2.5,
      repetitions: 0,
      nextReview: Date.now(),
      lastReview: null,
    }));
    setHadiths(reset);
  }, [setHadiths]);

  /** تبديل حالة الإشعارات */
  const toggleNotifications = useCallback(async () => {
    if (!settings.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert('يرجى السماح بالإشعارات من إعدادات المتصفح للاستفادة من هذه الميزة');
        return;
      }
    }
    const newSettings = { ...settings, notificationsEnabled: !settings.notificationsEnabled };
    updateSettings(newSettings);
  }, [settings, updateSettings]);

  // الأحاديث المستحقة الآن
  const dueHadiths = getDueHadiths(hadiths);

  const value: AppContextType = {
    hadiths,
    settings,
    activeTab,
    setHadiths,
    updateSettings,
    setActiveTab,
    reviewHadith,
    resetHadithCard,
    resetAllCards,
    toggleNotifications,
    dueHadiths,
    currentReviewHadith,
    setCurrentReviewHadith,
    isReviewMode,
    setIsReviewMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Hook للوصول إلى السياق */
export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

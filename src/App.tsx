// ====================================================
// التطبيق الرئيسي (App.tsx)
// التوجيه بين الشاشات وشريط التنقل السفلي
// ====================================================

import React, { useEffect, useState } from 'react';
import { Home, List, Settings as SettingsIcon } from 'lucide-react';
import { AppProvider, useApp } from './contexts/AppContext';
import Dashboard from './components/Dashboard';
import HadithList from './components/HadithList';
import Settings from './components/Settings';
import ReviewSession from './components/ReviewSession';
import CompletionScreen from './components/CompletionScreen';
import { registerServiceWorker } from './lib/notifications';

// ─── المكوّن الداخلي (يستخدم السياق) ────────────────

function AppInner() {
  const {
    activeTab,
    setActiveTab,
    settings,
    dueHadiths,
    isReviewMode,
    setIsReviewMode,
    currentReviewHadith,
    setCurrentReviewHadith,
  } = useApp();

  const [showCompletion, setShowCompletion] = useState(false);

  // تطبيق المظهر الداكن/الفاتح
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  // تسجيل Service Worker
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // بدء جلسة المراجعة
  const handleStartReview = () => {
    if (dueHadiths.length > 0) {
      setCurrentReviewHadith(dueHadiths[0]);
      setIsReviewMode(true);
      setShowCompletion(false);
    }
  };

  // إنهاء جلسة المراجعة
  const handleCompleteReview = () => {
    setIsReviewMode(false);
    setCurrentReviewHadith(null);
    setShowCompletion(true);
  };

  // العودة من المراجعة
  const handleBackFromReview = () => {
    setIsReviewMode(false);
    setCurrentReviewHadith(null);
  };

  // عرض شاشة الإتمام
  if (showCompletion) {
    return (
      <CompletionScreen
        onGoHome={() => { setShowCompletion(false); setActiveTab('home'); }}
        onReviewAgain={() => { setShowCompletion(false); handleStartReview(); }}
      />
    );
  }

  // عرض شاشة المراجعة
  if (isReviewMode && currentReviewHadith) {
    return (
      <ReviewSession
        hadith={currentReviewHadith}
        onComplete={handleCompleteReview}
        onBack={handleBackFromReview}
      />
    );
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      {/* المحتوى الرئيسي */}
      <main>
        {activeTab === 'home' && <Dashboard onStartReview={handleStartReview} />}
        {activeTab === 'list' && <HadithList />}
        {activeTab === 'settings' && <Settings />}
      </main>

      {/* شريط التنقل السفلي */}
      <nav className="bottom-nav">
        <NavButton
          icon={<Home size={22} />}
          label="الرئيسية"
          active={activeTab === 'home'}
          badge={dueHadiths.length}
          onClick={() => setActiveTab('home')}
        />
        <NavButton
          icon={<List size={22} />}
          label="الأحاديث"
          active={activeTab === 'list'}
          onClick={() => setActiveTab('list')}
        />
        <NavButton
          icon={<SettingsIcon size={22} />}
          label="الإعدادات"
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
        />
      </nav>
    </div>
  );
}

// ─── مكوّن زر التنقل ──────────────────────────────────

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}

function NavButton({ icon, label, active, badge, onClick }: NavButtonProps) {
  return (
    <button
      className={`bottom-nav-btn ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span
            className="absolute -top-1 -left-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-bold"
            style={{ background: '#dc2626', fontSize: '0.6rem' }}
          >
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span>{label}</span>
    </button>
  );
}

// ─── التصدير الرئيسي ──────────────────────────────────

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

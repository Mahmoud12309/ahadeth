// ====================================================
// شاشة إتمام جلسة المراجعة
// عرض تهنئة وإحصائيات الجلسة
// ====================================================

import React from 'react';
import { Star, RotateCcw, Home } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { calculateProgress } from '../lib/spacedRepetition';

interface CompletionScreenProps {
  onGoHome: () => void;
  onReviewAgain: () => void;
}

export default function CompletionScreen({ onGoHome, onReviewAgain }: CompletionScreenProps) {
  const { hadiths } = useApp();
  const progress = calculateProgress(hadiths);
  const memorized = hadiths.filter((h) => h.status === 'memorized').length;

  // رسائل تشجيعية
  const messages = [
    'أحسنت! استمر في المراجعة المنتظمة',
    'ممتاز! الاستمرار هو مفتاح الحفظ',
    'بارك الله فيك! كل مراجعة تقربك من الحفظ التام',
    'رائع! الملائكة تشهد اجتهادك',
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-6 text-center animate-fade-in"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* نجمة الإنجاز */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-pulse-green"
        style={{ background: 'var(--color-primary-light)' }}
      >
        <Star size={48} style={{ color: 'var(--color-primary)' }} fill="currentColor" />
      </div>

      {/* رسالة التهنئة */}
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
        أكملت جلسة المراجعة!
      </h1>
      <p className="text-base mb-6" style={{ color: 'var(--color-text-muted)' }}>
        {message}
      </p>

      {/* الإحصائيات */}
      <div
        className="w-full rounded-2xl p-5 mb-6"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="mb-3">
          <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>
            نسبة الحفظ الكلية
          </p>
          <p className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {progress}٪
          </p>
        </div>
        <div className="progress-bar mb-2">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {memorized} من {hadiths.length} حديث محفوظ
        </p>
      </div>

      {/* الأزرار */}
      <div className="w-full space-y-3">
        <button
          onClick={onGoHome}
          className="w-full py-4 rounded-xl font-bold text-white text-lg"
          style={{ background: 'var(--color-primary)' }}
        >
          <span className="flex items-center justify-center gap-2">
            <Home size={20} />
            العودة للرئيسية
          </span>
        </button>
        <button
          onClick={onReviewAgain}
          className="w-full py-4 rounded-xl font-bold text-sm"
          style={{
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <RotateCcw size={16} />
            مراجعة مرة أخرى
          </span>
        </button>
      </div>
    </div>
  );
}

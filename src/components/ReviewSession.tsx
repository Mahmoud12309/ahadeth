// ====================================================
// مكوّن شاشة المراجعة (Review Session)
// عرض الحديث وأزرار التقييم وتشغيل الصوت
// ====================================================

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ChevronLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { HadithCard, ReviewRating } from '../types';
import { useApp } from '../contexts/AppContext';
import { speakArabic, stopSpeaking } from '../lib/tts';
import { formatNextReview } from '../lib/spacedRepetition';

interface ReviewSessionProps {
  hadith: HadithCard;
  onComplete: () => void;
  onBack: () => void;
}

export default function ReviewSession({ hadith, onComplete, onBack }: ReviewSessionProps) {
  const { reviewHadith, settings, dueHadiths } = useApp();
  const [revealed, setRevealed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rated, setRated] = useState(false);
  const [lastRating, setLastRating] = useState<ReviewRating | null>(null);
  const [currentHadith, setCurrentHadith] = useState<HadithCard>(hadith);

  useEffect(() => {
    setCurrentHadith(hadith);
    setRevealed(false);
    setRated(false);
    setLastRating(null);
    stopSpeaking();
    setIsSpeaking(false);

    // تشغيل الصوت تلقائياً إذا كان مُفعَّلاً
    if (settings.ttsEnabled) {
      setTimeout(() => handleSpeak(), 500);
    }
  }, [hadith.id]);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakArabic(currentHadith.text, {
      rate: settings.ttsRate,
      voiceName: settings.ttsVoice || undefined,
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleRating = (rating: ReviewRating) => {
    stopSpeaking();
    setIsSpeaking(false);
    reviewHadith(currentHadith, rating);
    setRated(true);
    setLastRating(rating);

    // الانتقال للحديث التالي بعد 1.5 ثانية
    setTimeout(() => {
      // ابحث عن الحديث التالي المستحق (غير الحالي)
      const next = dueHadiths.find((h) => h.id !== currentHadith.id);
      if (next) {
        setCurrentHadith(next);
        setRevealed(false);
        setRated(false);
        setLastRating(null);
        if (settings.ttsEnabled) {
          setTimeout(() => {
            speakArabic(next.text, {
              rate: settings.ttsRate,
              voiceName: settings.ttsVoice || undefined,
              onEnd: () => setIsSpeaking(false),
              onError: () => setIsSpeaking(false),
            });
            setIsSpeaking(true);
          }, 300);
        }
      } else {
        onComplete();
      }
    }, 1500);
  };

  // ترجمة التقييم للعربية
  const ratingLabels: Record<ReviewRating, string> = {
    again: 'من البداية',
    hard: 'صعب',
    good: 'جيد',
    easy: 'سهل',
  };

  const ratingColors: Record<ReviewRating, string> = {
    again: 'text-red-600',
    hard: 'text-orange-600',
    good: 'text-blue-600',
    easy: 'text-green-600',
  };

  // حالة اللون بناءً على التقييم
  const ratingBg: Record<ReviewRating, string> = {
    again: 'bg-red-50 border-red-200',
    hard: 'bg-orange-50 border-orange-200',
    good: 'bg-blue-50 border-blue-200',
    easy: 'bg-green-50 border-green-200',
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* الرأس */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
      >
        <button
          onClick={() => { stopSpeaking(); onBack(); }}
          className="flex items-center gap-1 text-sm"
          style={{ color: 'var(--color-primary)' }}
        >
          <ChevronLeft size={20} />
          <span>رجوع</span>
        </button>
        <div className="text-center">
          <div className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
            مراجعة الأحاديث
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {dueHadiths.length} مستحق للمراجعة
          </div>
        </div>
        <button
          onClick={handleSpeak}
          className="p-2 rounded-full"
          style={{
            background: isSpeaking ? 'var(--color-primary-light)' : 'transparent',
            color: isSpeaking ? 'var(--color-primary)' : 'var(--color-text-muted)',
          }}
        >
          {isSpeaking ? <Volume2 size={22} /> : <VolumeX size={22} />}
        </button>
      </div>

      {/* محتوى البطاقة */}
      <div className="flex-1 p-4 flex flex-col gap-4 animate-fade-in">
        {/* رقم الحديث وحالته */}
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-bold px-3 py-1 rounded-full"
            style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
          >
            الحديث {currentHadith.number}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full status-${currentHadith.status}`}>
            {currentHadith.status === 'new' && 'جديد'}
            {currentHadith.status === 'learning' && 'قيد الحفظ'}
            {currentHadith.status === 'review' && 'مراجعة'}
            {currentHadith.status === 'memorized' && 'محفوظ ✓'}
          </span>
        </div>

        {/* نص الحديث */}
        <div
          className="islamic-border p-6 animate-fade-in"
          style={{ background: 'var(--color-surface)', minHeight: 200 }}
        >
          <p className="hadith-text">{currentHadith.text}</p>
        </div>

        {/* بعد الكشف: الراوي والمصدر */}
        {revealed && (
          <div
            className="p-4 rounded-xl animate-slide-up"
            style={{ background: 'var(--color-gold-light)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🏮</span>
              <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                رواه: {currentHadith.narrator}
              </span>
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              📚 {currentHadith.chain}
            </div>
            {currentHadith.notes && (
              <div className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                💡 {currentHadith.notes}
              </div>
            )}
          </div>
        )}

        {/* زر الكشف */}
        {!revealed && !rated && (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all active:scale-95 animate-pulse-green"
            style={{ background: 'var(--color-primary)' }}
          >
            اكشف الجواب
          </button>
        )}

        {/* أزرار التقييم */}
        {revealed && !rated && (
          <div className="animate-slide-up">
            <p className="text-center text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
              كيف كان حفظك لهذا الحديث؟
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleRating('again')}
                className="rating-btn rating-btn-again"
              >
                🔁 مجدداً
              </button>
              <button
                onClick={() => handleRating('hard')}
                className="rating-btn rating-btn-hard"
              >
                😓 صعب
              </button>
              <button
                onClick={() => handleRating('good')}
                className="rating-btn rating-btn-good"
              >
                👍 جيد
              </button>
              <button
                onClick={() => handleRating('easy')}
                className="rating-btn rating-btn-easy"
              >
                ⭐ سهل
              </button>
            </div>
          </div>
        )}

        {/* رسالة بعد التقييم */}
        {rated && lastRating && (
          <div
            className={`p-4 rounded-xl text-center animate-slide-up border ${ratingBg[lastRating]}`}
          >
            <CheckCircle className={`mx-auto mb-2 ${ratingColors[lastRating]}`} size={32} />
            <p className={`font-bold text-lg ${ratingColors[lastRating]}`}>
              {ratingLabels[lastRating]}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              جاري الانتقال للحديث التالي...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

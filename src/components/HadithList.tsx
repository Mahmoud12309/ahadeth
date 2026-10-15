// ====================================================
// مكوّن قائمة الأحاديث (Hadith List)
// عرض كل الأحاديث الـ 21 مع حالتها وتفاصيلها
// ====================================================

import React, { useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Volume2,
  RotateCcw,
} from 'lucide-react';
import { HadithCard, HadithStatus } from '../types';
import { useApp } from '../contexts/AppContext';
import { formatNextReview } from '../lib/spacedRepetition';
import { speakArabic, stopSpeaking } from '../lib/tts';

export default function HadithList() {
  const { hadiths, resetHadithCard, resetAllCards, settings } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<HadithStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // تصفية وبحث
  const filtered = hadiths.filter((h) => {
    const matchSearch =
      search === '' ||
      h.text.includes(search) ||
      h.narrator.includes(search) ||
      h.number.toString().includes(search);
    const matchStatus = filterStatus === 'all' || h.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusLabels: Record<HadithStatus | 'all', string> = {
    all: 'الكل',
    new: 'جديد',
    learning: 'قيد الحفظ',
    review: 'مراجعة',
    memorized: 'محفوظ',
  };

  const handleSpeak = (hadith: HadithCard) => {
    if (speakingId === hadith.id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    stopSpeaking();
    setSpeakingId(hadith.id);
    speakArabic(hadith.text, {
      rate: settings.ttsRate,
      voiceName: settings.ttsVoice || undefined,
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const handleReset = (id: string) => {
    resetHadithCard(id);
  };

  return (
    <div className="pb-24" style={{ background: 'var(--color-bg)' }}>
      {/* الرأس */}
      <div
        className="px-4 pt-6 pb-4"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            الأحاديث الـ 21
          </h2>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
          >
            <RotateCcw size={14} />
            إعادة تعيين
          </button>
        </div>

        {/* حقل البحث */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
        >
          <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="ابحث في الأحاديث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-right"
            style={{ color: 'var(--color-text)', fontFamily: 'Tajawal, sans-serif' }}
            dir="rtl"
          />
        </div>

        {/* فلتر الحالة */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['all', 'new', 'learning', 'review', 'memorized'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                filterStatus === status ? 'text-white' : ''
              }`}
              style={{
                background: filterStatus === status ? 'var(--color-primary)' : 'var(--color-bg)',
                color: filterStatus === status ? 'white' : 'var(--color-text-muted)',
                border: `1px solid ${filterStatus === status ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              {statusLabels[status]}
              {status !== 'all' && (
                <span className="mr-1">
                  ({hadiths.filter((h) => h.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* قائمة الأحاديث */}
      <div className="px-4 py-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
            لا توجد نتائج
          </div>
        ) : (
          filtered.map((hadith) => (
            <HadithListItem
              key={hadith.id}
              hadith={hadith}
              isExpanded={expandedId === hadith.id}
              isSpeaking={speakingId === hadith.id}
              onToggle={() =>
                setExpandedId(expandedId === hadith.id ? null : hadith.id)
              }
              onSpeak={() => handleSpeak(hadith)}
              onReset={() => handleReset(hadith.id)}
            />
          ))
        )}
      </div>

      {/* نافذة تأكيد إعادة التعيين */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div
            className="rounded-2xl p-6 w-full max-w-sm animate-slide-up"
            style={{ background: 'var(--color-surface)' }}
          >
            <h3 className="font-bold text-lg mb-2 text-center" style={{ color: 'var(--color-text)' }}>
              إعادة تعيين كل الأحاديث؟
            </h3>
            <p className="text-sm text-center mb-6" style={{ color: 'var(--color-text-muted)' }}>
              سيتم حذف كل تقدمك في الحفظ وإعادة البدء من الصفر
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-xl font-bold"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
              >
                إلغاء
              </button>
              <button
                onClick={() => { resetAllCards(); setShowResetConfirm(false); }}
                className="flex-1 py-3 rounded-xl font-bold text-white"
                style={{ background: '#dc2626' }}
              >
                نعم، أعد التعيين
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── عنصر الحديث الواحد ──────────────────────────────

interface HadithListItemProps {
  hadith: HadithCard;
  isExpanded: boolean;
  isSpeaking: boolean;
  onToggle: () => void;
  onSpeak: () => void;
  onReset: () => void;
}

function HadithListItem({
  hadith,
  isExpanded,
  isSpeaking,
  onToggle,
  onSpeak,
  onReset,
}: HadithListItemProps) {
  const statusLabels: Record<string, string> = {
    new: 'جديد',
    learning: 'قيد الحفظ',
    review: 'مراجعة',
    memorized: 'محفوظ ✓',
  };

  return (
    <div
      className="hadith-card animate-fade-in"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* رأس البطاقة */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* رقم الحديث */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            {hadith.number}
          </div>

          {/* معلومات مختصرة */}
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-bold truncate"
              style={{ fontFamily: 'Amiri, serif', color: 'var(--color-text)' }}
            >
              {hadith.text.substring(0, 60)}
              {hadith.text.length > 60 ? '...' : ''}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {hadith.narrator}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* حالة الحديث */}
          <span className={`text-xs px-2 py-0.5 rounded-full status-${hadith.status}`}>
            {statusLabels[hadith.status]}
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* التفاصيل الموسعة */}
      {isExpanded && (
        <div className="mt-4 animate-fade-in">
          {/* نص الحديث كاملاً */}
          <div
            className="p-4 rounded-xl mb-3"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
          >
            <p className="hadith-text" style={{ fontSize: '1.1rem' }}>
              {hadith.text}
            </p>
          </div>

          {/* المعلومات */}
          <div className="space-y-2 mb-4">
            <div className="flex gap-2 text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>الراوي:</span>
              <span style={{ color: 'var(--color-text)' }}>{hadith.narrator}</span>
            </div>
            <div className="flex gap-2 text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>المصدر:</span>
              <span style={{ color: 'var(--color-text)' }}>{hadith.chain}</span>
            </div>
            <div className="flex gap-2 text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>المراجعة القادمة:</span>
              <span style={{ color: 'var(--color-primary)' }}>
                {formatNextReview(hadith.nextReview)}
              </span>
            </div>
            <div className="flex gap-2 text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>عدد المراجعات:</span>
              <span style={{ color: 'var(--color-text)' }}>{hadith.repetitions}</span>
            </div>
            {hadith.notes && (
              <div className="flex gap-2 text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>ملاحظة:</span>
                <span style={{ color: 'var(--color-text)' }}>{hadith.notes}</span>
              </div>
            )}
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-2">
            <button
              onClick={onSpeak}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: isSpeaking ? 'var(--color-primary)' : 'var(--color-primary-light)',
                color: isSpeaking ? 'white' : 'var(--color-primary)',
              }}
            >
              <Volume2 size={16} />
              {isSpeaking ? 'إيقاف' : 'استمع'}
            </button>
            <button
              onClick={onReset}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: '#fee2e2',
                color: '#dc2626',
              }}
            >
              <RotateCcw size={16} />
              إعادة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

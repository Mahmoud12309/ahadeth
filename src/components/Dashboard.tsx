// ====================================================
// مكوّن لوحة التحكم الرئيسية (Dashboard / Home)
// عرض التقدم والإحصائيات والبدء بالمراجعة
// ====================================================

import React from 'react';
import {
  Bell,
  BellOff,
  BookOpen,
  CheckCircle,
  Clock,
  Play,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { calculateProgress, formatNextReview } from '../lib/spacedRepetition';

interface DashboardProps {
  onStartReview: () => void;
}

export default function Dashboard({ onStartReview }: DashboardProps) {
  const { hadiths, dueHadiths, settings, toggleNotifications } = useApp();

  const progress = calculateProgress(hadiths);
  const newCount = hadiths.filter((h) => h.status === 'new').length;
  const learningCount = hadiths.filter((h) => h.status === 'learning').length;
  const reviewCount = hadiths.filter((h) => h.status === 'review').length;
  const memorizedCount = hadiths.filter((h) => h.status === 'memorized').length;

  // الحديث القادم (غير مستحق بعد)
  const upcoming = hadiths
    .filter((h) => h.nextReview > Date.now())
    .sort((a, b) => a.nextReview - b.nextReview)[0];

  return (
    <div className="pb-24" style={{ background: 'var(--color-bg)' }}>
      {/* الرأس مع التحية */}
      <div
        className="px-5 pt-8 pb-6"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #145e38 100%)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-green-200 text-sm">السلام عليكم</p>
            <h1 className="text-white text-2xl font-bold mt-1">حافظ الأحاديث</h1>
          </div>
          {/* زر الإشعارات */}
          <button
            onClick={toggleNotifications}
            className={`p-3 rounded-full transition-all ${
              settings.notificationsEnabled
                ? 'bg-white text-green-700 animate-pulse-green'
                : 'bg-white/20 text-white'
            }`}
          >
            {settings.notificationsEnabled ? <Bell size={22} /> : <BellOff size={22} />}
          </button>
        </div>

        {/* شريط التقدم الكلي */}
        <div className="bg-white/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold">نسبة الحفظ الكلية</span>
            <span className="text-white font-bold text-xl">{progress}٪</span>
          </div>
          <div className="progress-bar bg-white/30">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #fff, #a7f3d0)',
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-green-100 text-xs">
            <span>{memorizedCount} محفوظ</span>
            <span>{hadiths.length} إجمالاً</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* بطاقة المراجعة المستحقة */}
        {dueHadiths.length > 0 ? (
          <div
            className="rounded-2xl p-5 animate-slide-up"
            style={{
              background: 'var(--color-surface)',
              border: '2px solid var(--color-primary)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock size={20} style={{ color: 'var(--color-primary)' }} />
              <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                مستحق للمراجعة الآن
              </span>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
              {dueHadiths.length}
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              حديث ينتظر مراجعتك
            </p>
            <button
              onClick={onStartReview}
              className="w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{ background: 'var(--color-primary)' }}
            >
              <Play size={20} fill="white" />
              ابدأ المراجعة
            </button>
          </div>
        ) : (
          <div
            className="rounded-2xl p-5 text-center animate-fade-in"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <CheckCircle
              size={48}
              className="mx-auto mb-3"
              style={{ color: 'var(--color-primary)' }}
            />
            <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--color-text)' }}>
              أحسنت! لا يوجد مستحق
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {upcoming
                ? `الحديث القادم: ${formatNextReview(upcoming.nextReview)}`
                : 'رائع! أكملت كل مراجعاتك'}
            </p>
          </div>
        )}

        {/* إحصائيات سريعة */}
        <div>
          <h2 className="font-bold text-base mb-3" style={{ color: 'var(--color-text)' }}>
            إحصائيات الحفظ
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<BookOpen size={20} />}
              label="جديد"
              count={newCount}
              colorClass="status-new"
            />
            <StatCard
              icon={<TrendingUp size={20} />}
              label="قيد الحفظ"
              count={learningCount}
              colorClass="status-learning"
            />
            <StatCard
              icon={<Star size={20} />}
              label="مراجعة"
              count={reviewCount}
              colorClass="status-review"
            />
            <StatCard
              icon={<CheckCircle size={20} />}
              label="محفوظ"
              count={memorizedCount}
              colorClass="status-memorized"
            />
          </div>
        </div>

        {/* حالة الإشعارات */}
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-3">
            {settings.notificationsEnabled ? (
              <Bell size={22} style={{ color: 'var(--color-primary)' }} />
            ) : (
              <BellOff size={22} style={{ color: 'var(--color-text-muted)' }} />
            )}
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                تنبيهات المراجعة
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {settings.notificationsEnabled
                  ? settings.useCustomInterval
                    ? `كل ${settings.customIntervalMinutes} دقيقة`
                    : 'حسب خوارزمية الحفظ'
                  : 'معطلة'}
              </p>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={toggleNotifications}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>
    </div>
  );
}

// ─── مكوّن بطاقة الإحصاء ─────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  colorClass: string;
}

function StatCard({ icon, label, count, colorClass }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-4 flex items-center gap-3"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <div className={`p-2 rounded-lg ${colorClass}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          {count}
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {label}
        </p>
      </div>
    </div>
  );
}

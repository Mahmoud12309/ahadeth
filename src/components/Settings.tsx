// ====================================================
// مكوّن الإعدادات (Settings)
// إعدادات الإشعارات، أوقات الهدوء، TTS، المظهر
// ====================================================

import React, { useEffect, useState } from 'react';
import {
  Bell,
  Moon,
  Sun,
  Volume2,
  Clock,
  Sliders,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { AppSettings } from '../types';
import { loadVoices, isTTSSupported } from '../lib/tts';
import { requestNotificationPermission, getNotificationPermission } from '../lib/notifications';

export default function Settings() {
  const { settings, updateSettings } = useApp();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [notifPermission, setNotifPermission] = useState(getNotificationPermission());

  useEffect(() => {
    loadVoices().then(setVoices);
  }, []);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    updateSettings({ ...settings, [key]: value });
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermission(getNotificationPermission());
    if (granted) {
      update('notificationsEnabled', true);
    }
  };

  const arabicVoices = voices.filter((v) => v.lang.startsWith('ar'));
  const allVoices = voices;

  return (
    <div className="pb-24" style={{ background: 'var(--color-bg)' }}>
      {/* الرأس */}
      <div
        className="px-4 pt-6 pb-4"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
      >
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
          الإعدادات
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          خصّص تجربة الحفظ الخاصة بك
        </p>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* ─── قسم الإشعارات ───────────────────── */}
        <SettingsSection title="الإشعارات والتنبيهات" icon={<Bell size={18} />}>
          {/* تفعيل الإشعارات */}
          <SettingsRow
            label="تنبيهات المراجعة"
            description="إشعارات عند حلول موعد مراجعة حديث"
          >
            {notifPermission === 'denied' ? (
              <span className="text-xs text-red-500">محظورة من الإعدادات</span>
            ) : (
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={async (e) => {
                    if (e.target.checked) {
                      await handleEnableNotifications();
                    } else {
                      update('notificationsEnabled', false);
                    }
                  }}
                />
                <span className="toggle-slider" />
              </label>
            )}
          </SettingsRow>

          {/* الفاصل الزمني المخصص */}
          <SettingsRow
            label="فاصل زمني مخصص"
            description="بدلاً من خوارزمية التكرار المتباعد التلقائية"
          >
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.useCustomInterval}
                onChange={(e) => update('useCustomInterval', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </SettingsRow>

          {/* مدة الفاصل الزمني */}
          {settings.useCustomInterval && (
            <div className="pt-2 pb-1 px-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                  كل {settings.customIntervalMinutes} دقيقة
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={360}
                step={5}
                value={settings.customIntervalMinutes}
                onChange={(e) => update('customIntervalMinutes', Number(e.target.value))}
                className="w-full accent-green-600"
                dir="ltr"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                <span>5 دقائق</span>
                <span>6 ساعات</span>
              </div>
              {/* اختصارات سريعة */}
              <div className="flex gap-2 mt-2 flex-wrap">
                {[5, 15, 30, 60, 120, 240].map((min) => (
                  <button
                    key={min}
                    onClick={() => update('customIntervalMinutes', min)}
                    className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                    style={{
                      background:
                        settings.customIntervalMinutes === min
                          ? 'var(--color-primary)'
                          : 'var(--color-bg)',
                      color:
                        settings.customIntervalMinutes === min
                          ? 'white'
                          : 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {min < 60 ? `${min}د` : `${min / 60}س`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </SettingsSection>

        {/* ─── أوقات الهدوء ────────────────────── */}
        <SettingsSection title="أوقات الهدوء" icon={<Moon size={18} />}>
          <SettingsRow
            label="تفعيل أوقات الهدوء"
            description="إيقاف الإشعارات خلال وقت محدد"
          >
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.quietHoursEnabled}
                onChange={(e) => update('quietHoursEnabled', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </SettingsRow>

          {settings.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  من
                </label>
                <input
                  type="time"
                  value={settings.quietHoursStart}
                  onChange={(e) => update('quietHoursStart', e.target.value)}
                  className="w-full p-2 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                    fontFamily: 'Tajawal, sans-serif',
                  }}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  إلى
                </label>
                <input
                  type="time"
                  value={settings.quietHoursEnd}
                  onChange={(e) => update('quietHoursEnd', e.target.value)}
                  className="w-full p-2 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                    fontFamily: 'Tajawal, sans-serif',
                  }}
                  dir="ltr"
                />
              </div>
            </div>
          )}
        </SettingsSection>

        {/* ─── إعدادات الصوت ───────────────────── */}
        <SettingsSection title="القراءة الصوتية" icon={<Volume2 size={18} />}>
          {!isTTSSupported() && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm mb-2"
              style={{ background: '#fff7ed', color: '#ea580c' }}
            >
              <Info size={16} />
              <span>هذا المتصفح لا يدعم القراءة الصوتية</span>
            </div>
          )}

          <SettingsRow
            label="تشغيل الصوت تلقائياً"
            description="قراءة الحديث صوتياً عند بدء المراجعة"
          >
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.ttsEnabled}
                onChange={(e) => update('ttsEnabled', e.target.checked)}
                disabled={!isTTSSupported()}
              />
              <span className="toggle-slider" />
            </label>
          </SettingsRow>

          {/* سرعة القراءة */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                سرعة القراءة
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                {settings.ttsRate.toFixed(1)}×
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.1}
              value={settings.ttsRate}
              onChange={(e) => update('ttsRate', Number(e.target.value))}
              className="w-full accent-green-600"
              dir="ltr"
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              <span>بطيء</span>
              <span>سريع</span>
            </div>
          </div>

          {/* اختيار الصوت */}
          {voices.length > 0 && (
            <div className="pt-2">
              <label className="block text-sm mb-2" style={{ color: 'var(--color-text)' }}>
                الصوت المختار
              </label>
              <select
                value={settings.ttsVoice}
                onChange={(e) => update('ttsVoice', e.target.value)}
                className="w-full p-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  fontFamily: 'Tajawal, sans-serif',
                }}
                dir="rtl"
              >
                <option value="">تلقائي (أفضل صوت عربي)</option>
                {arabicVoices.length > 0 && (
                  <optgroup label="أصوات عربية">
                    {arabicVoices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="كل الأصوات">
                  {allVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}
        </SettingsSection>

        {/* ─── المظهر ──────────────────────────── */}
        <SettingsSection title="المظهر" icon={<Sun size={18} />}>
          <div className="flex gap-3">
            <button
              onClick={() => update('theme', 'light')}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all"
              style={{
                background: settings.theme === 'light' ? 'var(--color-primary)' : 'var(--color-bg)',
                color: settings.theme === 'light' ? 'white' : 'var(--color-text)',
                border: `2px solid ${settings.theme === 'light' ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              <Sun size={16} />
              فاتح
            </button>
            <button
              onClick={() => update('theme', 'dark')}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all"
              style={{
                background: settings.theme === 'dark' ? 'var(--color-primary)' : 'var(--color-bg)',
                color: settings.theme === 'dark' ? 'white' : 'var(--color-text)',
                border: `2px solid ${settings.theme === 'dark' ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              <Moon size={16} />
              داكن
            </button>
          </div>
        </SettingsSection>

        {/* ─── عن التطبيق ──────────────────────── */}
        <div
          className="rounded-2xl p-4 text-center"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <p className="text-lg mb-1">📖</p>
          <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
            حافظ الأحاديث
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            نظام التكرار المتباعد لحفظ 21 حديثاً نبوياً
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            الإصدار 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── مكونات مساعدة ────────────────────────────────────

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SettingsSection({ title, icon, children }: SettingsSectionProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {/* عنوان القسم */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{
          background: 'var(--color-primary-light)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
        <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
          {title}
        </span>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

interface SettingsRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingsRow({ label, description, children }: SettingsRowProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1">
        <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
          {label}
        </p>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

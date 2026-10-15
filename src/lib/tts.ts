// ====================================================
// خدمة تحويل النص إلى كلام (Text-to-Speech)
// دعم قراءة الأحاديث بالعربية
// ====================================================

/** الحصول على قائمة الأصوات العربية المتاحة */
export function getArabicVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.startsWith('ar'));
}

/** الحصول على كل الأصوات المتاحة */
export function getAllVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
}

/** تشغيل قراءة نص بالعربية */
export function speakArabic(
  text: string,
  options: {
    rate?: number;       // سرعة القراءة (0.5 - 2.0)
    voiceName?: string;  // اسم الصوت المختار
    onEnd?: () => void;  // دالة تُنفَّذ عند الانتهاء
    onError?: () => void;
  } = {}
): void {
  if (!('speechSynthesis' in window)) {
    console.warn('هذا المتصفح لا يدعم تحويل النص إلى كلام');
    options.onError?.();
    return;
  }

  // إيقاف أي قراءة جارية
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  utterance.rate = options.rate ?? 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // اختيار الصوت المناسب
  const voices = window.speechSynthesis.getVoices();
  
  if (options.voiceName) {
    const selectedVoice = voices.find((v) => v.name === options.voiceName);
    if (selectedVoice) utterance.voice = selectedVoice;
  } else {
    // البحث عن أفضل صوت عربي متاح
    const arabicVoice =
      voices.find((v) => v.lang === 'ar-SA') ||
      voices.find((v) => v.lang.startsWith('ar')) ||
      null;
    if (arabicVoice) utterance.voice = arabicVoice;
  }

  utterance.onend = () => options.onEnd?.();
  utterance.onerror = () => {
    console.error('خطأ في تشغيل الصوت');
    options.onError?.();
  };

  // تأخير بسيط لضمان تحميل الأصوات في بعض المتصفحات
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 100);
}

/** إيقاف القراءة الجارية */
export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/** التحقق من دعم المتصفح لـ TTS */
export function isTTSSupported(): boolean {
  return 'speechSynthesis' in window;
}

/** تحميل الأصوات بشكل غير متزامن */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // الأصوات قد تحتاج وقتاً للتحميل
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };

    // Timeout احتياطي
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 3000);
  });
}

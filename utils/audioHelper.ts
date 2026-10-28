// Native Web Speech API audio helper with fallback and speed controls

export const playEnglishAudio = (text: string, rate: number = 0.9): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = rate;

      // Prefer high-quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => (v.lang.startsWith('en-US') || v.lang.startsWith('en-GB')) && !v.name.includes('Google'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Audio playback error:', e);
      resolve();
    }
  });
};

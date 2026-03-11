import { useCallback, useEffect, useState } from "react";

interface TextToSpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface UseTextToSpeechResult {
  speak: (text: string, options?: TextToSpeechOptions) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
}

/**
 * Custom hook for text-to-speech functionality
 *
 * @example
 * const { speak, stop, isSpeaking, isSupported } = useTextToSpeech();
 *
 * // Speak Chinese text
 * speak("你好", { lang: "zh-CN" });
 *
 * // Speak with custom options
 * speak("Hello", { lang: "en-US", rate: 1.2, pitch: 1.0 });
 */
export function useTextToSpeech(): UseTextToSpeechResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if speech synthesis is supported
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);

      // Load available voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      // Load voices immediately
      loadVoices();

      // Some browsers load voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      // Cleanup
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string, options: TextToSpeechOptions = {}) => {
      if (!isSupported || !text) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set language (default to Chinese Mandarin)
      utterance.lang = options.lang || "zh-CN";

      // Set voice if available
      if (voices.length > 0) {
        // Try to find a voice that matches the language
        const matchingVoice = voices.find(
          (voice) =>
            voice.lang.startsWith(utterance.lang.split("-")[0]) ||
            voice.lang === utterance.lang,
        );
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      // Set speech parameters
      utterance.rate = options.rate ?? 0.9; // Slightly slower for better clarity
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;

      // Event listeners
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      // Speak
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, voices],
  );

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
  };
}

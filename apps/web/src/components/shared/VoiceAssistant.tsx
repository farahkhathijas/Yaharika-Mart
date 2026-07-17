'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAccessibilityStore } from '@/stores/accessibilityStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function VoiceAssistant() {
  const router = useRouter();
  const { addItem, setCartOpen } = useCartStore();
  const { highContrast, setHighContrast, voiceEnabled, setVoiceEnabled } = useAccessibilityStore();
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Text to Speech voice feedback
  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
        speak('Listening for command');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
        toast.error('Voice command not recognized.');
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log('[Voice Command]:', transcript);
        toast.info(`Voice command: "${transcript}"`);

        // Navigation Commands
        if (transcript.includes('go to shops') || transcript.includes('show shops') || transcript.includes('view shops')) {
          speak('Navigating to shops');
          router.push('/shops');
        } else if (transcript.includes('go to deals') || transcript.includes('show deals') || transcript.includes('deals radar')) {
          speak('Opening deals radar');
          router.push('/deals-radar');
        } else if (transcript.includes('go to waste') || transcript.includes('zero waste')) {
          speak('Opening zero waste marketplace');
          router.push('/zero-waste');
        } else if (transcript.includes('go to cart') || transcript.includes('open cart') || transcript.includes('show cart')) {
          speak('Opening shopping cart');
          setCartOpen(true);
          router.push('/cart');
        } else if (transcript.includes('go to account') || transcript.includes('show profile') || transcript.includes('open settings')) {
          speak('Opening your account settings');
          router.push('/account');
        }

        // Accessibility Commands
        else if (transcript.includes('enable contrast') || transcript.includes('high contrast on')) {
          setHighContrast(true);
          speak('High contrast mode enabled');
        } else if (transcript.includes('disable contrast') || transcript.includes('high contrast off')) {
          setHighContrast(false);
          speak('High contrast mode disabled');
        }

        // Action Commands
        else if (transcript.includes('add rice') || transcript.includes('order rice')) {
          // Add first seeded rice product to cart mock
          addItem({
            productId: 'rice-mock-id',
            shopId: 'patel-kirana-id',
            name: 'Sona Masoori Rice',
            price: 75,
            qty: 1,
            unit: '1 kg',
            stock: 120,
            version: 0,
          });
          speak('Sona Masoori Rice added to your cart');
        } else {
          speak(`Command "${transcript}" not recognized.`);
        }
      };

      recognitionRef.current = rec;
    }
  }, [router, setHighContrast, addItem, setCartOpen]);

  const toggleListening = () => {
    if (!supported) {
      toast.error('Voice commands not supported on this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  if (!voiceEnabled) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2">
      <button
        onClick={toggleListening}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-glow transition-all active:scale-95 tap-target ${
          isListening
            ? 'bg-danger text-white animate-pulse'
            : 'bg-primary-600 text-white hover:bg-primary-700'
        }`}
        aria-label={isListening ? 'Stop listening to voice commands' : 'Start listening to voice commands'}
        aria-pressed={isListening}
      >
        {isListening ? <MicOff size={22} /> : <Mic size={22} />}
      </button>

      {isListening && (
        <div className="bg-white/95 backdrop-blur-sm border border-primary-100 rounded-2xl px-4 py-2.5 shadow-card text-xs font-semibold text-primary-900 animate-fade-in flex items-center gap-2">
          <Sparkles size={14} className="text-accent-gold animate-pulse" />
          Say: "Go to shops", "Open cart", "Enable contrast"
        </div>
      )}
    </div>
  );
}

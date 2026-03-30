'use client'
import React, { useState, useEffect, useRef } from 'react';
import { AudioLines } from './animate-ui/icons/audio-lines';

const TextToSpeech = ({ content }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [voices, setVoices] = useState([]); 
  
  // Refs for bulletproof memory management
  const utterancesRef = useRef([]);
  const sentencesRef = useRef([]);
  const currentIndexRef = useRef(0); // Tracks exactly which sentence we are on

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    const fetchVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    fetchVoices();
    window.speechSynthesis.onvoiceschanged = fetchVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Timer Logic
  useEffect(() => {
    let interval;
    if (isPlaying && !isPaused) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isPaused]);

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const extractReadableText = (html) => {
    if (typeof window === 'undefined') return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    const selectorsToNuke = [
      'pre', 'code', '.code-outer', '.code-wrap', 
      '.ql-syntax', '.ql-code-block', '.ql-code-block-container',
      'iframe', 'video', 'img', 'table', 'figure'
    ];
    
    doc.querySelectorAll(selectorsToNuke.join(', ')).forEach(el => el.remove());
    
    let text = doc.body.textContent || '';
    
    text = text.replace(/https?:\/\/[^\s]+/g, 'a link');
    text = text.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu, '');
    text = text.replace(/[\u2190-\u21FF\u2500-\u27BF]/g, '');
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  };

  const getBestVoice = () => {
    if (voices.length === 0) return null;

    return (
      voices.find(v => v.name.includes('Google US English')) || 
      voices.find(v => v.name.includes('Samantha')) ||          
      voices.find(v => v.name.includes('Daniel')) ||            
      voices.find(v => v.name.includes('Premium') && v.lang.startsWith('en')) || 
      voices.find(v => v.name.includes('Natural') && v.lang.startsWith('en')) || 
      voices.find(v => v.lang === 'en-US') ||                   
      voices.find(v => v.lang.startsWith('en')) ||              
      voices[0]                                                 
    );
  };

  const handlePlay = () => {
    const synth = window.speechSynthesis;

    // 1. If we haven't extracted sentences yet, do it now
    if (sentencesRef.current.length === 0) {
      const plainText = extractReadableText(content);
      // Better Regex: Matches sentences even if they don't end in punctuation at the very end of the blog
      const rawSentences = plainText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [plainText];
      sentencesRef.current = rawSentences.map(s => s.trim()).filter(s => s.length > 0);
    }

    if (sentencesRef.current.length === 0) return;

    // 2. Cancel anything currently happening to ensure a clean slate
    synth.cancel();
    utterancesRef.current = [];

    const bestVoice = getBestVoice();

    // 3. Queue sentences starting FROM the saved index (this acts as our resume function)
    for (let i = currentIndexRef.current; i < sentencesRef.current.length; i++) {
      const sentence = sentencesRef.current[i];
      const utterance = new SpeechSynthesisUtterance(sentence);
      
      if (bestVoice) {
        utterance.voice = bestVoice;
      }
      
      utterance.rate = 0.92; 
      utterance.pitch = 1.0; 

      // Track exactly where we are in case the user pauses
      utterance.onstart = () => {
        currentIndexRef.current = i;
      };

      // Handle the end of the entire article
      utterance.onend = () => {
        if (i === sentencesRef.current.length - 1) {
          handleStop();
        }
      };

      utterance.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.error('Speech error:', e);
        }
      };

      utterancesRef.current.push(utterance);
      synth.speak(utterance);
    }

    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    // BUG FIX: Do NOT use window.speechSynthesis.pause()
    // It freezes mobile Safari and Chrome. 
    // Instead, we CANCEL the speech. Our currentIndexRef remembers where we were.
    window.speechSynthesis.cancel();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setSeconds(0); 
    currentIndexRef.current = 0; // Reset back to the first sentence
  };

  if (!isSupported) return null;

  return (
    <div className={`flex items-center justify-center w-full z-10 ${isPlaying || isPaused ? 'sticky' : 'static'} top-[45px]`}>
      <div 
        className={`flex items-center justify-between p-2 pr-3 w-[300px] rounded-full border transition-all duration-300 font-sans mt-4 ${
          isPlaying 
            ? 'bg-blue-50/70 border-blue-200 shadow-md backdrop-blur-sm' 
            : 'bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            {isPlaying ? (
              <div className="flex items-center gap-[3px] h-3.5">
                <AudioLines animate={true} loop={true} />
              </div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
              </svg>
            )}
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 leading-tight">
              {isPlaying ? 'Playing Article' : isPaused ? 'Paused' : 'Listen to article'}
            </span>
            <span className="text-xs text-slate-500 font-medium tabular-nums">
              {isPlaying || isPaused || seconds > 0 ? formatTime(seconds) : 'Audio version'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {(isPlaying || isPaused) && (
            <button 
              onClick={handleStop} 
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors"
              title="Stop"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
            </button>
          )}

          {!isPlaying ? (
            <button 
              onClick={handlePlay} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105 transition-all"
              title="Play"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
          ) : (
            <button 
              onClick={handlePause} 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105 transition-all"
              title="Pause"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;
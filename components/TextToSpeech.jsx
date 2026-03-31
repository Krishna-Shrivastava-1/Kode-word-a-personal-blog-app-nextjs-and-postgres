'use client'
import React, { useState, useEffect, useRef } from 'react';
import { AudioLines } from './animate-ui/icons/audio-lines';

const TextToSpeech = ({ content }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [voices, setVoices] = useState([]); 
  
  const utterancesRef = useRef([]);

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

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    synth.cancel();
    utterancesRef.current = [];
    setSeconds(0); 

    const plainText = extractReadableText(content);
    const rawSentences = plainText.match(/[^.!?]+[.!?]+/g) || [plainText];
    
    const sentences = rawSentences
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (sentences.length === 0) return;

    const bestVoice = getBestVoice();

    sentences.forEach((sentence, index) => {
      const utterance = new SpeechSynthesisUtterance(sentence);
      
      if (bestVoice) {
        utterance.voice = bestVoice;
      }
      
      utterance.rate = 0.92; 
      utterance.pitch = 1.0; 

      if (index === sentences.length - 1) {
        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };
      }

      // FIX: Ignore both 'canceled' and 'interrupted' which happen naturally when stopping
      utterance.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.error('Speech error:', e);
        }
      };

      utterancesRef.current.push(utterance);
      synth.speak(utterance);
    });

    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setSeconds(0); 
  };

  if (!isSupported) return null;

  return (
    <div className={`flex items-center justify-center w-full  z-10 ${isPlaying || isPaused ? 'sticky' : 'static'} top-[45px]`}>
      <div 
      className={` flex items-center justify-between p-2 pr-3  w-[300px] rounded-full  border transition-all duration-300 font-sans mt-4  ${
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
              {/* <span className="w-[3px] h-[10px] bg-blue-600 rounded-sm animate-pulse"></span>
              <span className="w-[3px] h-[14px] bg-blue-600 rounded-sm animate-pulse delay-75"></span>
              <span className="w-[3px] h-[8px] bg-blue-600 rounded-sm animate-pulse delay-150"></span>
              <span className="w-[3px] h-[12px] bg-blue-600 rounded-sm animate-pulse delay-100"></span> */}
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
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 hover:text-slate-800 transition-colors"
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
            className="w-10 h-10 hidden items-center sm:flex justify-center rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105 transition-all"
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



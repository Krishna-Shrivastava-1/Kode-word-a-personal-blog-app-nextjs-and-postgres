'use client'
import { ChevronLeft, ChevronRight, Play, Volume1, Volume2, VolumeX } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { toast } from 'sonner'
import JavaVisualizer from './JavaVisualizer'

// ─── Silent language detection ────────────────────────────────────────────────
function detectLang(code) {
  const c = code.trim()
  if (/public\s+(static\s+)?(class|void|int|boolean|String)/.test(c)) return 'java'
  if (c.includes('System.out.') || c.includes('ArrayList<') || c.includes('HashMap<')) return 'java'
  if (/^\s*def\s+\w+\s*\(/.test(c) || c.includes('elif ') || c.includes('self.') || c.includes('print(')) return 'python'
  if (/#include\s*</.test(c) || /int\s+main\s*\(/.test(c) || c.includes('cout ') || c.includes('nullptr') || c.includes('std::')) return 'cpp'
  if (/func\s+\w+\s*\(/.test(c) && (c.includes('fmt.') || c.includes(':=') || c.includes('go '))) return 'go'
  if (/fn\s+\w+/.test(c) && (c.includes('let mut') || c.includes('println!') || c.includes('impl '))) return 'rust'
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|FROM|WHERE|JOIN)\b/i.test(c)) return 'sql'
  if (c.startsWith('<') || (c.includes('</') && c.includes('className'))) return 'jsx'
  if (c.includes('const ') || c.includes('=>') || c.includes('console.') || c.includes('async ')) return 'javascript'
  return 'text'
}

// ─── Exports ──────────────────────────────────────────────────────────────────
export function ReadingTimeBadge({ wordCount }) {
  const minutes = Math.max(1, Math.ceil(wordCount / 200))
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', fontSize:'0.8rem', color:'#6b7280', fontWeight:500 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      {minutes} min read
    </span>
  )
}

export function ArticleAtmosphere() {
  return (
    <>
      <style>{`
        .atm{pointer-events:none;position:fixed;inset:0;z-index:0;overflow:hidden}
        .atm-orb{position:absolute;border-radius:50%;filter:blur(90px);animation:atmF var(--d,18s) ease-in-out infinite alternate}
        @keyframes atmF{from{transform:translate(0,0) scale(1)}to{transform:translate(var(--x,20px),var(--y,20px)) scale(1.08)}}
        @media(prefers-reduced-motion:reduce){.atm-orb{animation:none}}
      `}</style>
      <div className="atm" aria-hidden="true">
        <div className="atm-orb" style={{width:560,height:560,top:-140,left:-160,background:'#dbeafe',opacity:.22,'--d':'22s','--x':'30px','--y':'25px'}}/>
        <div className="atm-orb" style={{width:400,height:400,top:-80,right:-100,background:'#e0e7ff',opacity:.18,'--d':'17s','--x':'-20px','--y':'30px'}}/>
        <div className="atm-orb" style={{width:320,height:320,top:'40%',left:-120,background:'#e0f2fe',opacity:.14,'--d':'26s','--x':'15px','--y':'-20px'}}/>
        <div className="atm-orb" style={{width:480,height:480,bottom:-120,right:-120,background:'#fef9c3',opacity:.16,'--d':'20s','--x':'-25px','--y':'-15px'}}/>
      </div>
    </>
  )
}

// ─── Back To Top ──────────────────────────────────────────────────────────────
function BackToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const fn = () => {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      setVisible(scrolled > 400 && scrolled < total - 200)
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  if (!visible) return null
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top" className="btt-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    </button>
  )
}

// ─── Protected Video Player ───────────────────────────────────────────────────
function ProtectedVideoPlayer({ src }) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [showVolume, setShowVolume] = useState(false)
  const [thumbnail, setThumbnail] = useState(null)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const hideTimer = useRef(null)
  const pressTimer = useRef(null)
  const [isFastForward, setIsFastForward] = useState(false)
  const [actionLabel, setActionLabel] = useState('')
  const [showActionUI, setShowActionUI] = useState(false)
  const actionTimer = useRef(null)
  const wasLongPress = useRef(false)

  const optimizedSrc = src

  const skip = (seconds) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.min(Math.max(0, v.currentTime + seconds), v.duration)
  }

  useEffect(() => {
    const container = containerRef.current
    const video = videoRef.current
    if (!container || !video) return
    const blockCtx = (e) => e.preventDefault()
    const blockDrag = (e) => e.preventDefault()
    container.addEventListener('contextmenu', blockCtx, true)
    video.addEventListener('contextmenu', blockCtx, true)
    container.addEventListener('dragstart', blockDrag, true)
    video.addEventListener('dragstart', blockDrag, true)
    return () => {
      container.removeEventListener('contextmenu', blockCtx, true)
      video.removeEventListener('contextmenu', blockCtx, true)
      container.removeEventListener('dragstart', blockDrag, true)
      video.removeEventListener('dragstart', blockDrag, true)
    }
  }, [])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const toggleFullscreen = useCallback(async (e) => {
    e.stopPropagation()
    const container = containerRef.current
    if (!container) return
    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen()
        if (screen.orientation?.lock) await screen.orientation.lock('landscape').catch(() => {})
      } else {
        await document.exitFullscreen()
        if (screen.orientation?.unlock) screen.orientation.unlock()
      }
    } catch (err) { console.warn('Fullscreen not supported:', err) }
  }, [])

  const captureThumbnail = useCallback(() => {
    const v = videoRef.current
    const canvas = canvasRef.current
    if (!v || !canvas || thumbnail) return
    if (v.readyState < 2) return
    canvas.width = v.videoWidth || 640
    canvas.height = v.videoHeight || 360
    const ctx = canvas.getContext('2d')
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
    try { setThumbnail(canvas.toDataURL('image/jpeg', 0.8)) } catch (e) {}
  }, [thumbnail])

  const toggle = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else { v.pause(); setPlaying(false) }
  }, [])

  const resetHideTimer = useCallback(() => {
    setShowControls(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => { if (playing) setShowControls(false) }, 2500)
  }, [playing])

  const showAction = useCallback((text) => {
    if (actionTimer.current) clearTimeout(actionTimer.current)
    setShowActionUI(false)
    requestAnimationFrame(() => { setActionLabel(text); setShowActionUI(true) })
    actionTimer.current = setTimeout(() => setShowActionUI(false), 600)
  }, [])

  const handlePressStart = () => {
    const v = videoRef.current
    if (!v) return
    wasLongPress.current = false
    pressTimer.current = setTimeout(() => {
      v.playbackRate = 2; setIsFastForward(true); wasLongPress.current = true
    }, 300)
  }

  const handlePressEnd = () => {
    const v = videoRef.current
    if (!v) return
    clearTimeout(pressTimer.current)
    if (isFastForward) { v.playbackRate = 1; setIsFastForward(false) }
  }

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  }

  const handleKeyDown = useCallback((e) => {
    const v = videoRef.current
    if (!v) return
    switch (e.key.toLowerCase()) {
      case ' ': e.preventDefault(); toggle(); break
      case 'arrowleft': e.preventDefault(); showAction('< 5'); skip(-5); break
      case 'arrowright': e.preventDefault(); showAction('5 >'); skip(5); break
      case 'f': e.preventDefault(); toggleFullscreen(e); break
      case 'arrowup': v.volume = Math.min(1, v.volume + 0.1); setVolume(v.volume); showAction('soundUp'); break
      case 'arrowdown': v.volume = Math.max(0, v.volume - 0.1); setVolume(v.volume); showAction('soundDown'); break
      case 'm': v.muted = !v.muted; setMuted(v.muted); break
    }
  }, [toggle, toggleFullscreen])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => { containerRef.current?.focus() }, [])
  useEffect(() => { return () => { clearTimeout(hideTimer.current); clearTimeout(actionTimer.current) } }, [])

  return (
    <div ref={containerRef} tabIndex={0} className="vid-player"
      onContextMenu={e => e.preventDefault()}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <canvas ref={canvasRef} style={{ display: 'none' }}/>
      {thumbnail && !playing && (
        <img src={thumbnail} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', zIndex:0 }}/>
      )}
      <video ref={videoRef} preload="auto" src={optimizedSrc} className="vid-el"
        controlsList="nodownload noremoteplayback" disablePictureInPicture disableRemotePlayback playsInline
        muted={muted}
        onMouseDown={handlePressStart} onMouseUp={handlePressEnd} onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart} onTouchEnd={handlePressEnd}
        onContextMenu={e => e.preventDefault()}
        onTimeUpdate={() => {
          const v = videoRef.current
          if (v) setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0)
        }}
        onLoadedData={() => {
          const v = videoRef.current
          if (!v) return
          setDuration(v.duration)
          if (v.readyState >= 2) v.currentTime = 1
        }}
        onSeeked={captureThumbnail}
        onEnded={() => { setPlaying(false); setShowControls(true) }}
        onClick={(e) => { if (wasLongPress.current) { e.preventDefault(); return } toggle() }}
      />
      <div className={`vid-action-indicator${showActionUI ? ' show' : ''}`}>
        {actionLabel === '< 5' ? <div className="flex items-center gap-1"><ChevronLeft size={18}/><span>5s</span></div>
          : actionLabel === '5 >' ? <div className="flex items-center gap-1"><span>5s</span><ChevronRight size={18}/></div>
          : (actionLabel === 'soundUp' || actionLabel === 'soundDown') ? (
            <div className="flex items-center gap-2">
              {videoRef.current?.volume === 0 ? <VolumeX size={20}/> : videoRef.current?.volume < 0.5 ? <Volume1 size={20}/> : <Volume2 size={20}/>}
              <span>{Math.round((videoRef.current?.volume || 0) * 100) > 0 && Math.round((videoRef.current?.volume || 0) * 100) + '%'}</span>
            </div>
          ) : actionLabel && <span>{actionLabel}</span>}
      </div>
      {isFastForward && (
        <div className="vid-speed-indicator flex items-center">
          2x <Play className="ml-1" fill="white" size={8}/><Play fill="white" size={8}/>
        </div>
      )}
      {!playing && (
        <div className="vid-overlay">
          <div className="vid-skip-btn vid-skip-left" onClick={(e) => { e.stopPropagation(); skip(-5); showAction('< 5') }}>
            <ChevronLeft size={20}/><span className="vid-skip-text">5</span>
          </div>
          <div className="vid-play-btn" onClick={toggle}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <div className="vid-skip-btn vid-skip-right" onClick={(e) => { e.stopPropagation(); skip(5); showAction('5 >') }}>
            <span className="vid-skip-text">5</span><ChevronRight size={20}/>
          </div>
        </div>
      )}
      <div className={`vid-controls${showControls ? ' visible' : ''}`} onClick={e => e.stopPropagation()}>
        <button className="vid-ctrl-btn" onClick={toggle}>
          {playing
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>}
        </button>
        <div className="vid-progress" onClick={e => {
          const v = videoRef.current; if (!v) return
          const rect = e.currentTarget.getBoundingClientRect()
          v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration
        }}>
          <div className="vid-progress-fill" style={{ width: `${progress}%` }}/>
        </div>
        <span className="vid-time">{fmt(videoRef.current?.currentTime)} / {fmt(duration)}</span>
        <div className="vid-vol-wrap">
          <button className="vid-ctrl-btn" onClick={() => setShowVolume(v => !v)}>
            {muted || volume === 0
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              : volume < 0.5
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a3 3 0 0 1 0 7.07"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>}
          </button>
          {showVolume && (
            <div className="vid-vol-slider-wrap">
              <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} className="vid-vol-slider"
                onChange={e => {
                  const val = parseFloat(e.target.value); setVolume(val); setMuted(val === 0)
                  if (videoRef.current) { videoRef.current.volume = val; videoRef.current.muted = val === 0 }
                }}/>
            </div>
          )}
        </div>
        <button className="vid-ctrl-btn" onClick={toggleFullscreen}>
          {isFullscreen
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>}
        </button>
      </div>
    </div>
  )
}

// ─── Article Notepad ──────────────────────────────────────────────────────────
function ArticleNotepad({ articleSlug }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const key = `kode_note_article_${articleSlug}`

  useEffect(() => {
    if (typeof window !== 'undefined') setNote(localStorage.getItem(key) || '')
  }, [key])

  const save = () => {
    localStorage.setItem(key, note); setSaved(true)
    toast.success('Notes saved successfully')
    setTimeout(() => setSaved(false), 2000)
  }

  const clear = () => {
    if (confirm('Clear your notes for this article?')) {
      localStorage.removeItem(key); toast.success('Notes cleared successfully'); setNote('')
    }
  }

  if (!open) return (
    <button className="notepad-trigger" onClick={() => setOpen(true)}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
      My notes for this article
    </button>
  )

  return (
    <div className="notepad-wrap">
      <div className="notepad-header">
        <div style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'13px', fontWeight:600, color:'#1e293b' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          My notes
          <span style={{ fontSize:'11px', fontWeight:400, color:'#94a3b8' }}>— saved in your browser</span>
        </div>
        <div style={{ display:'flex', gap:'6px' }}>
          <button className="notepad-btn notepad-clear" onClick={clear}>Clear</button>
          <button className={`notepad-btn notepad-save${saved ? ' saved' : ''}`} onClick={save}>{saved ? '✓ Saved' : 'Save'}</button>
          <button className="notepad-btn" onClick={() => setOpen(false)} style={{ padding:'3px 8px' }}>✕</button>
        </div>
      </div>
      <textarea className="notepad-area" value={note} onChange={e => setNote(e.target.value)}
        placeholder="Write your notes, questions, or key takeaways..." spellCheck={false} style={{ minHeight:'180px' }}/>
      <div className="notepad-footer">Saved locally in your browser · {note.length} chars</div>
    </div>
  )
}

// ─── Code Block ───────────────────────────────────────────────────────────────
function CodeBlockWithCopy({ code }) {
  const [copied, setCopied] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [showMobileCode, setShowMobileCode] = useState(false);
  const dialogRef = useRef(null);
  const mobileCodeDialogRef = useRef(null);
  const codeScrollRef = useRef(null); // preserve scroll position

  const lineCount = code.split('\n').length;
  const lang = detectLang(code);
  const isAlgorithm = ['java', 'javascript', 'cpp', 'c', 'python'].includes(lang) || code.includes('for') || code.includes('if');

  // ── on mount: restore visualizer if hash + sessionStorage match
  useEffect(() => {
    if (!isAlgorithm) return;
    if (window.location.hash === '#visualize') {
      const saved = sessionStorage.getItem('visualizer-code');
      if (saved && saved === code) setShowVisualizer(true);
    }
  }, []);

  // ── open main dialog
  // const openVisualizer = () => {
  //   sessionStorage.setItem('visualizer-code', code);
  //   window.history.pushState(null, '', '#visualize');
  //   setShowVisualizer(true);
  // };
  const openVisualizer = () => {
  sessionStorage.setItem('visualizer-code', code);
  window.history.pushState(null, '', '#visualize');
  setShowVisualizer(true);
};

  // ── close main dialog
  // const closeVisualizer = () => {
  //   setShowVisualizer(false);
  //   sessionStorage.removeItem('visualizer-code');
  //   window.history.pushState(null, '', window.location.pathname + window.location.search);
  //   dialogRef.current?.close?.();
  // };
const closeVisualizer = () => {
  setShowVisualizer(false);
  sessionStorage.removeItem('visualizer-code');
  // replaceState instead of pushState — replaces the #visualize entry
  // so browser back goes to wherever user was before, not back to #visualize
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  dialogRef.current?.close?.();
};
  // ── open mobile code dialog (does NOT reset visualizer state)
  const openMobileCode = () => {
    setShowMobileCode(true);
    requestAnimationFrame(() => mobileCodeDialogRef.current?.showModal?.());
  };

  const closeMobileCode = () => {
    setShowMobileCode(false);
    mobileCodeDialogRef.current?.close?.();
  };

  // ── showModal when showVisualizer becomes true
  useEffect(() => {
    if (showVisualizer) {
      requestAnimationFrame(() => {
        if (dialogRef.current && !dialogRef.current.open) {
          dialogRef.current.showModal();
        }
      });
    }
  }, [showVisualizer]);

  useEffect(() => {
  const onPop = () => {
    if (showVisualizer) {
      setShowVisualizer(false);
      sessionStorage.removeItem('visualizer-code');
      // no history call needed here — popstate already moved back for us
      dialogRef.current?.close?.();
    }
  };
  window.addEventListener('popstate', onPop);
  return () => window.removeEventListener('popstate', onPop);
}, [showVisualizer]);
  // ── browser back closes main dialog
  useEffect(() => {
    const onPop = () => {
      if (showVisualizer) {
        setShowVisualizer(false);
        sessionStorage.removeItem('visualizer-code');
        dialogRef.current?.close?.();
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [showVisualizer]);

  // ── ESC closes main dialog
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeVisualizer(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // ── shared code block JSX (reused in both panels)
  const CodeContent = ({ fontSize = 'clamp(0.78rem, 2vw, 0.875rem)' }) => (
    <SyntaxHighlighter
      language={lang}
      style={vscDarkPlus}
      customStyle={{
        margin: 0,
        padding: '1.1rem 1.25rem',
        fontSize,
        background: 'transparent',
        lineHeight: '1.75',
        fontFamily: '"JetBrains Mono","Fira Code","Cascadia Code",monospace',
        minWidth: 'max-content',
      }}
      showLineNumbers={lineCount > 5}
      lineNumberStyle={{ color: '#3d444d', fontSize: '0.72rem', minWidth: '2.25rem', userSelect: 'none' }}
      wrapLongLines={false}
    >
      {code}
    </SyntaxHighlighter>
  );

  return (
    <>
      {/* ── Inline Code Block ── */}
      <div className="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-800">
        <div className="bg-[#1e1e1e]">
          <div className="flex justify-between items-center px-4 py-2 bg-[#2d2d2d] border-b border-[#404040]">
            <div className="flex gap-2">
              {['#ff5f56', '#ffbd2e', '#27c93f'].map(c => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <div className="flex gap-2">
              {isAlgorithm && (
                <button
                  onClick={openVisualizer}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded transition-all text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 19 21 12 17 5 21 12 2" />
                  </svg>
                  Visualize
                </button>
              )}
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded transition-colors ${copied ? 'text-green-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
              >
                {copied ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <CodeContent />
          </div>
        </div>
      </div>

      {/* ── Main Visualizer Dialog ── */}
      {showVisualizer && (
        <dialog
          ref={dialogRef}
          onClick={(e) => { if (e.target === dialogRef.current) closeVisualizer(); }}
          className="fixed inset-0 w-screen h-screen max-w-none max-h-none m-0 p-0 bg-transparent backdrop:bg-black/60 backdrop:backdrop-blur-sm"
          style={{ border: 'none' }}
        >
          {/* 
            DESKTOP: side by side, both full height
            MOBILE: only flowchart shown, code accessible via button
          */}
          <div className="flex w-full h-full bg-white dark:bg-[#0f0f0f]">

            {/* Left — Code Panel (hidden on mobile) */}
            <div className="hidden md:flex w-[40%] max-w-[480px] flex-col flex-shrink-0 border-r border-gray-200 dark:border-gray-800 h-full">
              <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Source Code</span>
                </div>
                <button
                  onClick={closeVisualizer}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              {/* 
                key point: ref keeps scroll position alive.
                overflow-auto on this div, NOT on a child, so scroll state is stable.
              */}
              <div ref={codeScrollRef} className="flex-1 overflow-auto bg-[#1e1e1e] h-0">
                <CodeContent fontSize="0.8rem" />
              </div>
            </div>

            {/* Right — Flowchart Panel (full width on mobile) */}
            <div className="flex flex-col flex-1 min-w-0 h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0f0f0f] flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Flow Diagram</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Mobile only: View Code button */}
                  <button
                    onClick={openMobileCode}
                    className="flex md:hidden items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                    </svg>
                    View Code
                  </button>
                  <span className="hidden md:block text-[10px] text-gray-400 dark:text-gray-600">Drag · Scroll to zoom · Pinch on mobile</span>
                  {/* Mobile close button */}
                  <button
                    onClick={closeVisualizer}
                    className="flex md:hidden items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    aria-label="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
              {/* JavaVisualizer — flex-1 + h-0 forces it to fill exactly, no overflow gap */}
              <div className="flex-1 h-0 min-h-0">
                <JavaVisualizer code={code} />
              </div>
            </div>
          </div>
        </dialog>
      )}

      {/* ── Mobile: View Code Dialog (separate, doesn't unmount visualizer) ── */}
      {showMobileCode && (
        <dialog
          ref={mobileCodeDialogRef}
          onClick={(e) => { if (e.target === mobileCodeDialogRef.current) closeMobileCode(); }}
          className="fixed inset-0 w-screen h-screen max-w-none max-h-none m-0 p-0 bg-transparent backdrop:bg-black/70 backdrop:backdrop-blur-sm"
          style={{ border: 'none' }}
        >
          <div className="flex flex-col w-full h-full bg-[#1e1e1e]">
            <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Source Code</span>
              </div>
              <button
                onClick={closeMobileCode}
                className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close code panel"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto h-0">
              <CodeContent fontSize="0.8rem" />
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}

// function CodeBlockWithCopy({ code }) {
//   const [copied, setCopied] = useState(false)
//   const [showVisualizer, setShowVisualizer] = useState(false);
//   const lineCount = code.split('\n').length
//   const lang = detectLang(code)

//   const handleCopy = async () => {
//     try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
//     catch (err) { console.error('Copy failed:', err) }
//   }
//   // Very basic check so the button only shows on Java/JS/C code, not JSON/HTML
//   const isAlgorithm = ['java', 'javascript', 'cpp', 'c', 'python'].includes(lang) || code.includes('for') || code.includes('if');

//   return (
//     <div className="code-outer my-6 rounded-xl overflow-hidden shadow-lg border border-gray-800">
//       <div className="code-wrap bg-[#1e1e1e]">
        
//         {/* HEADER */}
//         <div className="code-header flex justify-between items-center px-4 py-2 bg-[#2d2d2d] border-b border-[#404040]">
//           <div className="mac-dots flex gap-2">
//             {['#ff5f56','#ffbd2e','#27c93f'].map(c => <div key={c} style={{ width:12, height:12, borderRadius:'50%', background:c }}/>)}
//           </div>
          
//           <div className="flex gap-2">
//             {/* NEW VISUALIZE BUTTON */}
//             {isAlgorithm && (
//               <button 
//                 onClick={() => setShowVisualizer(!showVisualizer)} 
//                 className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded transition-colors ${showVisualizer ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
//               >
//                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>
//                 {showVisualizer ? 'Hide Flowchart' : 'Visualize'}
//               </button>
//             )}

//             {/* EXISTING COPY BUTTON */}
//             <button onClick={handleCopy} className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded transition-colors ${copied ? 'text-green-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
//               {copied
//                 ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>
//                 : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>}
//             </button>
//           </div>
//         </div>

//         {/* CODE BODY */}
//         <div className="code-body overflow-x-auto">
//           <SyntaxHighlighter language={lang} style={vscDarkPlus}
//             customStyle={{ margin:0, padding:'1.1rem 1.25rem', fontSize:'clamp(0.78rem,2vw,0.875rem)', background:'transparent', lineHeight:'1.75', fontFamily:'"JetBrains Mono","Fira Code","Cascadia Code",monospace', minWidth:'max-content' }}
//             showLineNumbers={lineCount > 5}
//             lineNumberStyle={{ color:'#3d444d', fontSize:'0.72rem', minWidth:'2.25rem', userSelect:'none' }}
//             wrapLongLines={false}
//           >{code}</SyntaxHighlighter>
//         </div>

//       </div>

//       {/* NEW: EXPANDABLE VISUALIZER CANVAS */}
//       {showVisualizer && (
//         <div className="visualizer-wrapper border-t-2 border-blue-500 animate-in slide-in-from-top-4 fade-in duration-300">
//           <div className="bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 flex justify-between items-center border-b border-blue-100">
//              <span>Algorithm Flowchart Generated</span>
//              <span className="font-normal opacity-70">Interactive · Drag & Zoom</span>
//           </div>
//           <JavaVisualizer code={code} />
//         </div>
//       )}
//     </div>
//   )
// }

// ─── Main Renderer ────────────────────────────────────────────────────────────
export default function BlogContentRenderer({ content, wordCount, articleSlug = 'article' }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [processedElements, setProcessedElements] = useState(null)

  useEffect(() => {
    if (!content) return
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content

    tempDiv.querySelectorAll('p').forEach(p => {
      if (p.querySelector('img, video, iframe')) return
      const text = p.textContent.trim()
      const onlyBr = p.children.length === 1 && p.children[0].tagName === 'BR'
      if (!text || onlyBr) p.remove()
    })

    const uploadedVideos = []
    tempDiv.querySelectorAll('.ql-video-wrapper').forEach(wrapper => {
      const src = wrapper.getAttribute('data-video-src') || ''
      if (!src) return
      const marker = `__UPLOADED_VIDEO_${uploadedVideos.length}__`
      uploadedVideos.push({ marker, src })
      wrapper.replaceWith(document.createTextNode(marker))
    })
    tempDiv.querySelectorAll('p').forEach(p => {
      const iframe = p.querySelector('iframe')
      if (!iframe) return
      const src = iframe.getAttribute('src') || ''
      if (!src) return
      const marker = `__UPLOADED_VIDEO_${uploadedVideos.length}__`
      uploadedVideos.push({ marker, src })
      p.replaceWith(document.createTextNode(marker))
    })

    tempDiv.querySelectorAll('table').forEach(table => {
      if (table.closest('.table-scroll-wrap')) return
      const wrapper = document.createElement('div')
      wrapper.className = 'table-scroll-wrap'
      table.parentNode.insertBefore(wrapper, table)
      wrapper.appendChild(table)
    })

    const codeContainers = tempDiv.querySelectorAll('.ql-code-block-container, pre')
    const codeBlocks = []
    codeContainers.forEach((container, i) => {
      let codeText = ''
      if (container.classList.contains('ql-code-block-container')) {
        codeText = Array.from(container.querySelectorAll('.ql-code-block')).map(l => l.textContent).join('\n')
      } else {
        codeText = container.textContent || ''
      }
      const marker = `__CODE_BLOCK_${i}__`
      codeBlocks.push({ marker, codeText })
      container.replaceWith(document.createTextNode(marker))
    })

    const parts = tempDiv.innerHTML.split(/(__CODE_BLOCK_\d+__|__UPLOADED_VIDEO_\d+__)/)
    const elements = parts.map((part, i) => {
      const cb = codeBlocks.find(b => b.marker === part)
      if (cb) return <CodeBlockWithCopy key={`code-${i}`} code={cb.codeText}/>
      const uv = uploadedVideos.find(v => v.marker === part)
      if (uv) return <ProtectedVideoPlayer key={`vid-${i}`} src={uv.src}/>
      if (!part.trim()) return null
      return <div key={`seg-${i}`} className="prose-segment" dangerouslySetInnerHTML={{ __html: part }}/>
    }).filter(Boolean)

    setProcessedElements(elements)
  }, [content, articleSlug])

  const handleClick = useCallback(e => {
    if (e.target.tagName === 'IMG') setSelectedImage(e.target.src)
  }, [])

  return (
    <>
      {/*
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        FONT STRATEGY — why bold always works here:
        "Plus Jakarta Sans" ships weights 200–800 as separate
        font files. The browser picks the exact 700-weight file
        for <strong>, so there is zero synthesis or override
        possible. Fraunces (display) does the same for headings.
        Both are variable fonts → one file, all weights crisp.
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      */}
    <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@500;600;700;800&display=swap');

  /* ── Reset & base ────────────────────────────────── */
  .brc {
    width: 100%;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: clamp(1rem, 2.2vw, 1.075rem);
    line-height: 1.8;
    color: #1e293b; /* Slightly softer modern dark gray */
    letter-spacing: -0.01em;
    font-synthesis: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     HEADINGS — Outfit (Modern Geometric Sans)
     A modern sans-serif looks much cleaner when bolded 
     compared to a traditional serif.
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .brc h1 {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(1.6rem, 4vw, 2.2rem);
    font-weight: 700;
    line-height: 1.2;
    color: #0f172a;
    margin: 2.5rem 0 1rem;
    letter-spacing: -0.03em;
    padding-bottom: 0.6rem;
    border-bottom: 2px solid #f1f5f9;
  }
  .brc h2 {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(1.3rem, 3vw, 1.6rem);
    font-weight: 600;
    line-height: 1.3;
    color: #0f172a;
    margin: 2rem 0 0.75rem;
    letter-spacing: -0.02em;
  }
  .brc h3 {
    font-family: 'Outfit', sans-serif;
    font-size: clamp(1.1rem, 2.2vw, 1.25rem);
    font-weight: 600;
    line-height: 1.4;
    color: #1e293b;
    margin: 1.6rem 0 0.6rem;
    letter-spacing: -0.01em;
  }
  .brc h1:first-child,
  .brc h2:first-child,
  .brc h3:first-child { margin-top: 0; }

  /* ── Paragraphs ── */
  .brc p {
    margin: 0 0 1.25rem;
    color: #334155;
    line-height: 1.8;
  }
  .brc p:last-child { margin-bottom: 0; }

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     THE BOLD FIX — Clean & Modern
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  .brc strong,
  .brc b,
  .prose-segment strong,
  .prose-segment b {
    font-weight: 600;
    color: #0f172a;
  }

  /* Bold inside headings — ExtraBold (800) in Outfit looks sleek, not messy */
  .brc h1 strong, .brc h1 b,
  .brc h2 strong, .brc h2 b,
  .brc h3 strong, .brc h3 b {
    font-weight: 800;
    color: inherit;
  }

  .brc em, .brc i,
  .prose-segment em, .prose-segment i {
    font-style: italic;
  }

  .brc u, .prose-segment u {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  /* ── Inline code ── */
  .brc :not(pre) > code,
  .prose-segment :not(pre) > code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.85em;
    color: #2563eb;
    font-weight: 500;
    background: #eff6ff;
    padding: 0.2em 0.4em;
    border-radius: 6px;
    border: 1px solid #dbeafe;
  }

  /* ── Blockquote ── */
  .brc blockquote {
    position: relative;
    border-left: 4px solid #3b82f6;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    margin: 2rem 0;
    padding: 1.25rem 1.5rem 1.25rem 2rem;
    border-radius: 0 12px 12px 0;
    font-family: 'Inter', sans-serif;
    font-style: italic;
    font-size: clamp(1rem, 2vw, 1.05rem);
    color: #334155;
    line-height: 1.8;
    overflow: hidden;
  }
  .brc blockquote::before {
    content: '"';
    position: absolute; top: -10px; left: 10px;
    font-size: 5.5rem; color: #3b82f6; opacity: 0.1;
    font-family: 'Outfit', sans-serif; line-height: 1; pointer-events: none;
  }

  /* ── Lists ── */
  .brc ul { list-style: none; margin: 0 0 1.25rem; padding: 0; }
  .brc ul li {
    position: relative;
    padding-left: 1.6rem;
    margin-bottom: 0.5rem;
    line-height: 1.8;
    color: #334155;
  }
  .brc ul li::before {
    content: '';
    position: absolute; left: 0; top: 0.72em;
    width: 6px; height: 6px; border-radius: 50%;
    background: #3b82f6; opacity: 0.8;
  }
  /* Quill bullet list */
  .brc li[data-list="bullet"] {
    position: relative;
    padding-left: 1.6rem;
    margin-bottom: 0.5rem;
    line-height: 1.8;
    color: #334155;
    list-style: none;
  }
  .brc li[data-list="bullet"]::before {
    content: '';
    position: absolute; left: 0; top: 0.72em;
    width: 6px; height: 6px; border-radius: 50%;
    background: #3b82f6; opacity: 0.8;
  }
  .brc .ql-ui { display: none; }

  .brc ol { list-style: none; margin: 0 0 1.25rem; padding: 0; counter-reset: ol-counter; }
  .brc ol li {
    position: relative;
    padding-left: 2rem;
    margin-bottom: 0.5rem;
    line-height: 1.8;
    color: #334155;
    counter-increment: ol-counter;
  }
  .brc ol li::before {
    content: counter(ol-counter);
    position: absolute; left: 0; top: 0.15em;
    width: 1.35rem; height: 1.35rem; border-radius: 50%;
    background: #eff6ff; border: 1px solid #bfdbfe;
    color: #2563eb; font-size: 0.75rem; font-weight: 600;
    display: flex; align-items: center; justify-content: center;
  }

  /* ── Links ── */
  .brc a {
    color: #2563eb;
    text-decoration: underline;
    text-underline-offset: 4px;
    text-decoration-thickness: 1px;
    transition: color 0.15s, text-decoration-color 0.15s;
  }
  .brc a:hover { color: #1d4ed8; text-decoration-color: #1d4ed8; }

  /* ── Images ── */
  .brc img {
    max-width: 100% !important; width: auto !important; height: auto !important;
    border-radius: 12px !important; cursor: zoom-in !important;
    margin: 1.75rem auto !important; display: block !important;
    border: 1px solid #e2e8f0 !important;
    transition: transform 0.25s ease, box-shadow 0.25s ease !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important;
  }
  .brc img:hover { transform: scale(1.01) !important; box-shadow: 0 8px 30px rgba(0,0,0,0.1) !important; }

  /* ── Quill alignment ── */
  .brc .ql-align-center { text-align: center !important; }
  .brc .ql-align-right  { text-align: right !important; }
  .brc .ql-align-left   { text-align: left !important; }
  .brc .ql-align-justify { text-align: justify !important; }

  /* ── Tables ── */
  .table-scroll-wrap {
    width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch;
    margin: 2rem 0; border-radius: 12px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 14px rgba(0,0,0,0.03);
  }
  .brc table { border-collapse: collapse; width: 100%; min-width: 380px; font-size: 0.95rem; }
  .brc table thead tr { background: #f8fafc; border-bottom: 2px solid #e2e8f0; }
  .brc table th {
    color: #0f172a; font-family: 'Outfit', sans-serif; font-weight: 600; text-align: left;
    padding: 14px 18px; font-size: 0.85rem;
    letter-spacing: 0.02em; text-transform: uppercase;
    border-right: 1px solid #e2e8f0; white-space: nowrap;
  }
  .brc table th:last-child { border-right: none; }
  .brc table tbody tr { border-bottom: 1px solid #e2e8f0; transition: background 0.15s; }
  .brc table tbody tr:last-child { border-bottom: none; }
  .brc table tbody tr:nth-child(even) { background: #fbfcfd; }
  .brc table tbody tr:hover { background: #f1f5f9; }
  .brc table td { padding: 12px 18px; color: #334155; border-right: 1px solid #f1f5f9; vertical-align: top; line-height: 1.55; }
  .brc table td:last-child { border-right: none; }
  @media(max-width:640px) {
    .brc table th, .brc table td { padding: 10px 14px; font-size: 0.85rem; }
  }

  /* ── iframes ── */
  .brc iframe {
    width: 100%; height: clamp(220px, 45vw, 440px);
    border-radius: 12px; border: none; margin: 1.75rem 0; display: block;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }

  .brc hr { border: none; border-top: 1.5px solid #e2e8f0; margin: 2.5rem 0; }
  .prose-segment { display: block; }
  .brc > *:first-child { margin-top: 0 !important; }
  .brc > *:last-child  { margin-bottom: 0 !important; }

  /* ── Code block ── */
  .code-outer { margin: 2rem 0; }
  .code-wrap {
    border-radius: 12px; overflow: hidden;
    border: 1px solid #1e293b;
    background: #0d1117;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }
  .code-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 16px; background: #1e293b; border-bottom: 1px solid #334155;
  }
  .mac-dots { display: flex; gap: 6px; align-items: center; }
  .code-body { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .copy-btn {
    display: flex; align-items: center; gap: 5px; padding: 4px 12px;
    border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.1); background: transparent; color: #94a3b8;
    transition: all 0.15s; font-family: 'Inter', sans-serif;
  }
  .copy-btn:hover { background: rgba(255,255,255,0.05); color: #f8fafc; border-color: rgba(255,255,255,0.2); }
  .copy-btn.copied { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.3); }

  /* ── Notepad ── */
  .notepad-trigger {
    display: inline-flex; align-items: center; gap: 8px;
    margin-top: 2.5rem; padding: 11px 22px;
    background: white; border: 1px solid #e2e8f0; border-radius: 10px;
    font-size: 14px; font-weight: 500; color: #475569;
    cursor: pointer; transition: all 0.15s;
    font-family: 'Inter', sans-serif; width: 100%; justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }
  .notepad-trigger:hover { background: #f8fafc; color: #2563eb; border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(37,99,235,0.08); }
  .notepad-wrap { margin-top: 2.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
  .notepad-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
  .notepad-btn { padding: 5px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; border: 1px solid #cbd5e1; background: white; color: #475569; transition: all 0.15s; }
  .notepad-btn:hover { background: #f1f5f9; }
  .notepad-save { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
  .notepad-save:hover { background: #dbeafe; }
  .notepad-save.saved { background: #f0fdf4; color: #16a34a; border-color: #bbf7d0; }
  .notepad-clear { color: #ef4444; border-color: #fecaca; background: #fff; }
  .notepad-clear:hover { background: #fef2f2; }
  .notepad-area { width: 100%; min-height: 140px; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; line-height: 1.7; color: #1e293b; border: none; outline: none; resize: vertical; background: white; }
  .notepad-footer { padding: 8px 16px; font-size: 12px; color: #64748b; background: #f8fafc; border-top: 1px solid #e2e8f0; }

  /* ── Video Player ── */
  .vid-player { position: relative; width: 100%; margin: 2rem 0; border-radius: 16px; overflow: hidden; background: #000; box-shadow: 0 20px 40px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.1); user-select: none; -webkit-user-select: none; cursor: pointer; min-height: 240px; }
  @media(max-width:640px) { .vid-player { min-height: 210px; border-radius: 12px; margin: 1.25rem 0; } }
  .vid-el { width: 100%; display: block; max-height: 480px; object-fit: contain; -webkit-user-drag: none; min-height: inherit; }
  @media(max-width:640px) { .vid-el { max-height: none; min-height: 210px; } }
  .vid-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 2; }
  .vid-play-btn { z-index: 2; cursor: pointer; width: 70px; height: 70px; border-radius: 50%; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1.5px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; padding-left: 4px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); transition: transform 0.2s, background 0.2s; }
  @media(max-width:640px) { .vid-play-btn { width: 54px; height: 54px; } }
  .vid-overlay:hover .vid-play-btn { transform: scale(1.05); background: rgba(0,0,0,0.6); }
  .vid-speed-indicator { position: absolute; top: 10%; left: 50%; transform: translate(-50%,-50%); background: rgba(0,0,0,0.6); color: white; padding: 10px 16px; border-radius: 24px; font-size: 15px; font-family: 'Outfit', sans-serif; font-weight: 600; pointer-events: none; z-index: 6; backdrop-filter: blur(6px); }
  .vid-skip-btn { position: absolute; top: 50%; transform: translateY(-50%); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; gap: 2px; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); color: white; cursor: pointer; z-index: 2; transition: all 0.2s; }
  .vid-skip-btn:hover { background: rgba(0,0,0,0.6); }
  .vid-skip-text { font-size: 12px; font-weight: 600; font-family: 'Outfit', sans-serif;}
  .vid-skip-left { left: 5%; }
  .vid-skip-right { right: 5%; }
  .vid-action-indicator { position: absolute; top: 10%; left: 50%; transform: translate(-50%,-50%) scale(0.95); background: rgba(0,0,0,0.5); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-family: 'Outfit', sans-serif; font-weight: 500; pointer-events: none; z-index: 5; opacity: 0; transition: opacity 0.15s ease, transform 0.15s ease; }
  .vid-action-indicator.show { opacity: 1; transform: translate(-50%,-50%) scale(1); }
  .vid-controls { position: absolute; bottom: 0; left: 0; right: 0; z-index: 3; display: flex; align-items: center; gap: 12px; padding: 12px 16px 14px; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); opacity: 0; transition: opacity 0.25s ease; }
  .vid-controls.visible { opacity: 1; }
  @media(max-width:640px) { .vid-controls { gap: 8px; padding: 10px 12px 12px; } }
  .vid-ctrl-btn { background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; color: white; opacity: 0.85; transition: opacity 0.15s, transform 0.15s; flex-shrink: 0; }
  .vid-ctrl-btn:hover { opacity: 1; transform: scale(1.1); }
  .vid-progress { flex: 1; height: 4px; background: rgba(255,255,255,0.25); border-radius: 2px; cursor: pointer; position: relative; transition: height 0.15s; }
  .vid-progress:hover { height: 6px; }
  .vid-progress-fill { height: 100%; border-radius: 2px; background: white; pointer-events: none; transition: width 0.1s linear; }
  .vid-time { font-size: 12px; color: rgba(255,255,255,0.9); white-space: nowrap; font-family: 'JetBrains Mono', monospace; flex-shrink: 0; }
  .vid-vol-wrap { position: relative; display: flex; align-items: center; }
  .vid-vol-slider-wrap { position: absolute; bottom: calc(100% + 12px); right: -6px; background: rgba(15,15,15,0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 8px; display: flex; align-items: center; justify-content: center; width: 40px; height: 100px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
  .vid-vol-slider { writing-mode: vertical-lr; direction: rtl; width: 4px; height: 80px; cursor: pointer; accent-color: white; appearance: slider-vertical; -webkit-appearance: slider-vertical; }
  .vid-player:fullscreen, .vid-player:-webkit-full-screen { border-radius: 0 !important; width: 100vw !important; height: 100vh !important; min-height: 100vh !important; margin: 0 !important; }
  .vid-player:fullscreen .vid-el, .vid-player:-webkit-full-screen .vid-el { width: 100vw !important; height: 100vh !important; max-height: 100vh !important; min-height: 100vh !important; object-fit: contain !important; }
  @media(max-width:640px) {
    .vid-player:fullscreen, .vid-player:-webkit-full-screen { width: 100svw !important; height: 100svh !important; min-height: 100svh !important; }
    .vid-player:fullscreen .vid-el, .vid-player:-webkit-full-screen .vid-el { height: 100svh !important; max-height: 100svh !important; }
  }

  /* ── Back to top ── */
  .btt-btn { position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%); z-index: 50; width: 40px; height: 40px; border-radius: 50%; background: #0f172a; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.25); transition: transform 0.2s, background 0.2s, box-shadow 0.2s; animation: bttIn 0.25s ease; }
  @keyframes bttIn { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
  .btt-btn:hover { background: #1e293b; transform: translateX(-50%) translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }

  /* ── Lightbox ── */
  .lightbox-overlay { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.9); padding: 1rem; animation: lbIn 0.2s ease; }
  @keyframes lbIn { from{opacity:0} to{opacity:1} }
  .lightbox-overlay img { max-width: 100% !important; max-height: 90vh !important; object-fit: contain !important; border-radius: 8px !important; border: none !important; box-shadow: 0 20px 60px rgba(0,0,0,0.6) !important; cursor: default !important; margin: 0 !important; transform: none !important; }
  .lightbox-close { position: absolute; top: 1.5rem; right: 1.5rem; width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; font-family: inherit; }
  .lightbox-close:hover { background: rgba(255,255,255,0.2); }
`}</style>

      <div className="brc" onClick={handleClick}>
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ display: processedElements !== null ? 'none' : 'block' }}
          aria-hidden={processedElements !== null}
        />
        {processedElements !== null && processedElements}
      </div>

      <ArticleNotepad articleSlug={articleSlug}/>
      <BackToTop/>

      {selectedImage && (
        <div className="lightbox-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedImage(null) }}>
          <img src={selectedImage} alt="Expanded"/>
          <button className="lightbox-close" onClick={() => setSelectedImage(null)} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}
    </>
  )
}













// 'use client'
// import { ChevronLeft, ChevronRight, Play, Volume1, Volume2, VolumeX } from 'lucide-react'
// import { useState, useEffect, useCallback, useRef } from 'react'
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
// import { toast } from 'sonner'

// // ─── Silent language detection — colors only, no label ever shown ─────────────
// function detectLang(code) {
//   const c = code.trim()
//   // Java — check before JS because Java patterns are more specific
//   if (/public\s+(static\s+)?(class|void|int|boolean|String)/.test(c)) return 'java'
//   if (c.includes('System.out.') || c.includes('ArrayList<') || c.includes('HashMap<')) return 'java'
//   if (/^\s*def\s+\w+\s*\(/.test(c) || c.includes('elif ') || c.includes('self.') || c.includes('print(')) return 'python'
//   if (/#include\s*</.test(c) || /int\s+main\s*\(/.test(c) || c.includes('cout ') || c.includes('nullptr') || c.includes('std::')) return 'cpp'
//   if (/func\s+\w+\s*\(/.test(c) && (c.includes('fmt.') || c.includes(':=') || c.includes('go '))) return 'go'
//   if (/fn\s+\w+/.test(c) && (c.includes('let mut') || c.includes('println!') || c.includes('impl '))) return 'rust'
//   if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|FROM|WHERE|JOIN)\b/i.test(c)) return 'sql'
//   if (c.startsWith('<') || (c.includes('</') && c.includes('className'))) return 'jsx'
//   if (c.includes('const ') || c.includes('=>') || c.includes('console.') || c.includes('async ')) return 'javascript'
//   // Plain text / test cases / IO — no highlighting, just monospace
//   return 'text'
// }

// // ─── Exports for BlogPostPage ─────────────────────────────────────────────────
// export function ReadingTimeBadge({ wordCount }) {
//   const minutes = Math.max(1, Math.ceil(wordCount / 200))
//   return (
//     <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', fontSize:'0.8rem', color:'#6b7280', fontWeight:500 }}>
//       <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//         <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
//       </svg>
//       {minutes} min read
//     </span>
//   )
// }

// export function ArticleAtmosphere() {
//   return (
//     <>
//       <style>{`
//         .atm { pointer-events:none; position:fixed; inset:0; z-index:0; overflow:hidden; }
//         .atm-orb { position:absolute; border-radius:50%; filter:blur(80px);
//           animation:atmF var(--d,18s) ease-in-out infinite alternate; }
//         @keyframes atmF { from{transform:translate(0,0) scale(1)} to{transform:translate(var(--x,20px),var(--y,20px)) scale(1.08)} }
//         @media(prefers-reduced-motion:reduce){.atm-orb{animation:none}}
//       `}</style>
//       <div className="atm" aria-hidden="true">
//         <div className="atm-orb" style={{width:520,height:520,top:-120,left:-140,background:'#dbeafe',opacity:.26,'--d':'22s','--x':'30px','--y':'25px'}}/>
//         <div className="atm-orb" style={{width:380,height:380,top:-60,right:-80,background:'#e0e7ff',opacity:.2,'--d':'17s','--x':'-20px','--y':'30px'}}/>
//         <div className="atm-orb" style={{width:300,height:300,top:'38%',left:-100,background:'#e0f2fe',opacity:.16,'--d':'26s','--x':'15px','--y':'-20px'}}/>
//         <div className="atm-orb" style={{width:440,height:440,bottom:-100,right:-100,background:'#fef9c3',opacity:.18,'--d':'20s','--x':'-25px','--y':'-15px'}}/>
//       </div>
//     </>
//   )
// }

// // ─── Back To Top ──────────────────────────────────────────────────────────────
// function BackToTop() {
//   const [visible, setVisible] = useState(false)
//   useEffect(() => {
//     const fn = () => {
//       const scrolled = window.scrollY
//       const total = document.documentElement.scrollHeight - window.innerHeight
//       // Show after 400px scroll, hide when within 200px of bottom
//       setVisible(scrolled > 400 && scrolled < total - 200)
//     }
//     window.addEventListener('scroll', fn, { passive:true })
//     return () => window.removeEventListener('scroll', fn)
//   }, [])
//   if (!visible) return null
//   return (
//     <button
//       onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
//       aria-label="Back to top"
//       className="btt-btn"
//     >
//       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
//         <polyline points="18 15 12 9 6 15"/>
//       </svg>
//     </button>
//   )
// }

// // ─── Protected Video Player ───────────────────────────────────────────────────


// function ProtectedVideoPlayer({ src }) {
//   const videoRef = useRef(null)
//   const containerRef = useRef(null)
//   const canvasRef = useRef(null)
//   const [playing, setPlaying] = useState(false)
//   const [progress, setProgress] = useState(0)
//   const [duration, setDuration] = useState(0)
//   const [muted, setMuted] = useState(false)
//   const [volume, setVolume] = useState(1)
//   const [showVolume, setShowVolume] = useState(false)
//   const [thumbnail, setThumbnail] = useState(null)
//   const [showControls, setShowControls] = useState(true)
//   const [isFullscreen, setIsFullscreen] = useState(false)
//   const hideTimer = useRef(null)
// const pressTimer = useRef(null)
// const [isFastForward, setIsFastForward] = useState(false)
// const [actionLabel, setActionLabel] = useState('')
// const [showActionUI, setShowActionUI] = useState(false)
// const actionTimer = useRef(null)
// const wasLongPress = useRef(false)

//   // Auto-optimize Cloudinary URLs — cuts file size 40-60% with no quality loss
//   const optimizedSrc = src
//   // const optimizedSrc = src.includes('res.cloudinary.com')
//   //   ? src.replace('/upload/', '/upload/f_auto,q_auto/')
//   //   : src
// const skip = (seconds) => {
//   const v = videoRef.current
//   if (!v) return
//   v.currentTime = Math.min(Math.max(0, v.currentTime + seconds), v.duration)
// }
//   // Block right-click and drag in capture phase
//   useEffect(() => {
//     const container = containerRef.current
//     const video = videoRef.current
//     if (!container || !video) return
//     const blockCtx = (e) => e.preventDefault()
//     const blockDrag = (e) => e.preventDefault()
//     container.addEventListener('contextmenu', blockCtx, true)
//     video.addEventListener('contextmenu', blockCtx, true)
//     container.addEventListener('dragstart', blockDrag, true)
//     video.addEventListener('dragstart', blockDrag, true)
//     return () => {
//       container.removeEventListener('contextmenu', blockCtx, true)
//       video.removeEventListener('contextmenu', blockCtx, true)
//       container.removeEventListener('dragstart', blockDrag, true)
//       video.removeEventListener('dragstart', blockDrag, true)
//     }
//   }, [])

//   // Track fullscreen state changes (e.g. user presses Escape)
//   useEffect(() => {
//     const onFsChange = () => {
//       setIsFullscreen(!!document.fullscreenElement)
//     }
//     document.addEventListener('fullscreenchange', onFsChange)
//     return () => document.removeEventListener('fullscreenchange', onFsChange)
//   }, [])

//   const toggleFullscreen = useCallback(async (e) => {
//     e.stopPropagation()
//     const container = containerRef.current
//     if (!container) return
//     try {
//       if (!document.fullscreenElement) {
//         await container.requestFullscreen()
//         // Force landscape on mobile
//         if (screen.orientation?.lock) {
//           await screen.orientation.lock('landscape').catch(() => {})
//         }
//       } else {
//         await document.exitFullscreen()
//         // Unlock orientation on exit
//         if (screen.orientation?.unlock) {
//           screen.orientation.unlock()
//         }
//       }
//     } catch (err) {
//       console.warn('Fullscreen not supported:', err)
//     }
//   }, [])

//   // Capture thumbnail frame at 1s
//   const captureThumbnail = useCallback(() => {
//   const v = videoRef.current
//   const canvas = canvasRef.current
//   if (!v || !canvas || thumbnail) return

//   if (v.readyState < 2) return // ensure frame exists

//   canvas.width = v.videoWidth || 640
//   canvas.height = v.videoHeight || 360

//   const ctx = canvas.getContext('2d')
//   ctx.drawImage(v, 0, 0, canvas.width, canvas.height)

//   try {
//     setThumbnail(canvas.toDataURL('image/jpeg', 0.8))
//   } catch (e) {}
// }, [thumbnail])
//   // const captureThumbnail = useCallback(() => {
//   //   const v = videoRef.current
//   //   const canvas = canvasRef.current
//   //   if (!v || !canvas || thumbnail) return
//   //   canvas.width = v.videoWidth || 640
//   //   canvas.height = v.videoHeight || 360
//   //   const ctx = canvas.getContext('2d')
//   //   ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
//   //   try {
//   //     setThumbnail(canvas.toDataURL('image/jpeg', 0.8))
//   //   } catch (e) {
//   //     // CORS may block — skip thumbnail silently
//   //   }
//   // }, [thumbnail])

//   const toggle = useCallback(() => {
//     const v = videoRef.current
//     if (!v) return
//     if (v.paused) { v.play(); setPlaying(true) }
//     else { v.pause(); setPlaying(false) }
//   }, [])

//   const resetHideTimer = useCallback(() => {
//     setShowControls(true)
//     clearTimeout(hideTimer.current)
//     hideTimer.current = setTimeout(() => {
//       if (playing) setShowControls(false)
//     }, 2500)
//   }, [playing])

//   useEffect(() => {
//     return () => clearTimeout(hideTimer.current)
//   }, [])
// const showAction = useCallback((text) => {
//   // Always clear previous timer FIRST
//   if (actionTimer.current) {
//     clearTimeout(actionTimer.current)
//   }

//   // Force update (even if same text)
//   setShowActionUI(false)

//   // Small delay ensures React applies state change cleanly
//   requestAnimationFrame(() => {
//     setActionLabel(text)
//     setShowActionUI(true)
//   })

//   // Set new hide timer
//   actionTimer.current = setTimeout(() => {
//     setShowActionUI(false)
//   }, 600)
// }, [])

// const handlePressStart = () => {
//   const v = videoRef.current
//   if (!v) return

//   wasLongPress.current = false

//   pressTimer.current = setTimeout(() => {
//     v.playbackRate = 2
//     setIsFastForward(true)

//     wasLongPress.current = true // 👈 mark long press
//   }, 300)
// }

// const handlePressEnd = () => {
//   const v = videoRef.current
//   if (!v) return

//   clearTimeout(pressTimer.current)

//   if (isFastForward) {
//     v.playbackRate = 1
//     setIsFastForward(false)
//   }
// }

//   const fmt = (s) => {
//     if (!s || isNaN(s)) return '0:00'
//     const m = Math.floor(s / 60)
//     const sec = Math.floor(s % 60)
//     return `${m}:${sec.toString().padStart(2, '0')}`
//   }

//   const handleKeyDown = useCallback((e) => {
//   const v = videoRef.current
//   if (!v) return

//   switch (e.key.toLowerCase()) {
//     case ' ':
//       e.preventDefault() // prevent page scroll
//       toggle()
//       break

//     case 'arrowleft':
//       e.preventDefault()
//       showAction("< 5")
//       skip(-5)
//       break

//     case 'arrowright':
//       e.preventDefault()
//       showAction(`5 >`)
//       skip(5)
//       break

//     case 'f':
//       e.preventDefault()
//       toggleFullscreen(e)
//       break
//     case 'arrowup':
//       v.volume = Math.min(1, v.volume + 0.1)
//   setVolume(v.volume) 
//       showAction(`soundUp`)
//       break

//     case 'arrowdown':
//       v.volume = Math.max(0, v.volume - 0.1)
//          setVolume(v.volume) 
//       showAction(`soundDown`)
//       break
//     case 'm':
//       v.muted = !v.muted
//       setMuted(v.muted)
//   break
//     default:
//       break
//   }
// }, [toggle, skip, toggleFullscreen])
// useEffect(() => {
//   const container = containerRef.current
//   if (!container) return

//   container.addEventListener('keydown', handleKeyDown)

//   return () => {
//     container.removeEventListener('keydown', handleKeyDown)
//   }
// }, [handleKeyDown])

// useEffect(() => {
//   containerRef.current?.focus()
// }, [])

// useEffect(() => {
//   return () => {
//     clearTimeout(actionTimer.current)
//   }
// }, [])
//   return (
//     <div
//       ref={containerRef}
//       tabIndex={0} 
//       className="vid-player"
//       onContextMenu={e => e.preventDefault()}
//       onMouseMove={resetHideTimer}
//       onMouseLeave={() => playing && setShowControls(false)}
//     >
//       <canvas ref={canvasRef} style={{ display:'none' }}/>

//       {thumbnail && !playing && (
//         <img
//           src={thumbnail}
//           alt=""
//           style={{
//             position:'absolute', inset:0, width:'100%', height:'100%',
//             objectFit:'cover', zIndex:0,
//           }}
//         />
//       )}

//       <video
//         ref={videoRef}
//         preload="auto"
//         src={optimizedSrc}
//         className="vid-el"
//         controlsList="nodownload noremoteplayback"
//         disablePictureInPicture
//         disableRemotePlayback
//         playsInline
//          onMouseDown={handlePressStart}
//   onMouseUp={handlePressEnd}
//   onMouseLeave={handlePressEnd}
//   onTouchStart={handlePressStart}
//   onTouchEnd={handlePressEnd}
//         muted={muted}
//         onContextMenu={e => e.preventDefault()}
//         onTimeUpdate={() => {
//           const v = videoRef.current
//           if (v) setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0)
//         }}
//       onLoadedData={() => {
//   const v = videoRef.current
//   if (!v) return
//   setDuration(v.duration)

//   // Wait until frame is actually ready
//   if (v.readyState >= 2) {
//     v.currentTime = 1
//   }
// }}
//         // onLoadedMetadata={() => {
//         //   const v = videoRef.current
//         //   if (v) { setDuration(v.duration); v.currentTime = 1 }
//         // }}
//         onSeeked={captureThumbnail}
//         onEnded={() => { setPlaying(false); setShowControls(true) }}
//         onClick={(e) => {
//     if (wasLongPress.current) {
//       e.preventDefault()
//       return
//     }
//     toggle()
//   }}
//       />
// <div className={`vid-action-indicator ${showActionUI ? 'show' : ''}`}>

//   {actionLabel === "< 5" ? (
//     <div className="flex items-center gap-1">
//       <ChevronLeft size={18} />
//       <span>5s</span>
//     </div>
//   ) : actionLabel === "5 >" ? (
//     <div className="flex items-center gap-1">
//       <span>5s</span>
//       <ChevronRight size={18} />
//     </div>
//   ) : actionLabel === "soundUp" || actionLabel === "soundDown" ? (
//     <div className="flex items-center gap-2">
//       {videoRef.current?.volume === 0 ? (
//         <VolumeX size={20} />
//       ) : videoRef.current?.volume < 0.5 ? (
//         <Volume1 size={20} />
//       ) : (
//         <Volume2 size={20} />
//       )}
//       <span>{Math.round((videoRef.current?.volume || 0) * 100) > 0 && Math.round((videoRef.current?.volume || 0) * 100)+'%'}</span>
//     </div>
//   ) : (
//     actionLabel && <span>{actionLabel}</span>
//   )}

// </div>
// {isFastForward && (
//   <div className="vid-speed-indicator flex items-center">
//     2x <Play className='ml-1' fill='white' size={8} /><Play fill='white' size={8} />
//   </div>
// )}
//       {/* <div className="vid-gradient-mask"/>  Black mask overlay bottom on video */}

// {!playing && (
//   <div className="vid-overlay">

//     {/* Backward 5s */}
//   <div
//   className="vid-skip-btn vid-skip-left"
//   onClick={(e) => {
//     e.stopPropagation()
//     skip(-5)
//     showAction("< 5")
//   }}
// >
//   <ChevronLeft size={20} />
//   <span className="vid-skip-text">5</span>
// </div>

//     {/* Play Button */}
//     <div className="vid-play-btn" onClick={toggle}>
//       <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
//         <polygon points="5 3 19 12 5 21 5 3"/>
//       </svg>
//     </div>

//     {/* Forward 5s */}
//    <div
//   className="vid-skip-btn vid-skip-right"
//   onClick={(e) => {
//     e.stopPropagation()
//     skip(5)
//     showAction("5 >")
//   }}
// >
//   <span className="vid-skip-text">5</span>
//   <ChevronRight size={20} />
// </div>

//   </div>
// )}
//       {/* {!playing && (
//         <div className="vid-overlay" onClick={toggle}>
//           <div className="vid-play-btn">
//             <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
//               <polygon points="5 3 19 12 5 21 5 3"/>
//             </svg>
//           </div>
//         </div>
//       )} */}

//       <div className={`vid-controls${showControls ? ' visible' : ''}`} onClick={e => e.stopPropagation()}>
        
//         <button className="vid-ctrl-btn" onClick={toggle}>
//           {playing ? (
//             <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
//           ) : (
//             <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
//           )}
//         </button>

//         <div
//           className="vid-progress"
//           onClick={e => {
//             const v = videoRef.current
//             if (!v) return
//             const rect = e.currentTarget.getBoundingClientRect()
//             v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration
//           }}
//         >
//           <div className="vid-progress-fill" style={{ width:`${progress}%` }}/>
//         </div>

//         <span className="vid-time">
//           {fmt(videoRef.current?.currentTime)} / {fmt(duration)}
//         </span>

//         {/* Volume */}
//         <div className="vid-vol-wrap">
//           <button className="vid-ctrl-btn" onClick={() => setShowVolume(v => !v)}>
//             {muted || volume === 0 ? (
//               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
//             ) : volume < 0.5 ? (
//               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a3 3 0 0 1 0 7.07"/></svg>
//             ) : (
//               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
//             )}
//           </button>
//           {showVolume && (
//             <div className="vid-vol-slider-wrap">
//               <input
//                 type="range" min="0" max="1" step="0.05"
//                 value={muted ? 0 : volume}
//                 onChange={e => {
//                   const val = parseFloat(e.target.value)
//                   setVolume(val); setMuted(val === 0)
//                   if (videoRef.current) { videoRef.current.volume = val; videoRef.current.muted = val === 0 }
//                 }}
//                 className="vid-vol-slider"
//               />
//             </div>
//           )}
//         </div>

//         {/* Fullscreen */}
//         <button className="vid-ctrl-btn" onClick={toggleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
//           {isFullscreen ? (
//             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
//               <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
//               <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
//             </svg>
//           ) : (
//             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
//               <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
//               <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
//             </svg>
//           )}
//         </button>
//       </div>
//     </div>
//   )
// }

// // ─── Article Notepad — one per article, shown at bottom ──────────────────────
// function ArticleNotepad({ articleSlug }) {
//   const [open, setOpen] = useState(false)
//   const [note, setNote] = useState('')
//   const [saved, setSaved] = useState(false)
//   const key = `kode_note_article_${articleSlug}`

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       setNote(localStorage.getItem(key) || '')
//     }
//   }, [key])

//   const save = () => {
//     localStorage.setItem(key, note)
//     setSaved(true)
//     toast.success("Notes saved successfully")
//     setTimeout(() => setSaved(false), 2000)
//   }

//   const clear = () => {
//     if (confirm('Clear your notes for this article?')) {
//       localStorage.removeItem(key)
//       toast.success("Notes cleared successfully")
//       setNote('')
//     }
//   }

//   if (!open) {
//     return (
//       <button className="article-notepad-trigger" onClick={() => setOpen(true)}>
//         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//           <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
//         </svg>
//         My notes for this article
//       </button>
//     )
//   }

//   return (
//     <div className="article-notepad-wrap">
//       <div className="notepad-header">
//         <div style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'13px', fontWeight:600, color:'#1e293b' }}>
//           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
//             <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
//           </svg>
//           My notes
//           <span style={{ fontSize:'11px', fontWeight:400, color:'#94a3b8' }}>— saved in your browser</span>
//         </div>
//         <div style={{ display:'flex', gap:'6px' }}>
//           <button className="notepad-btn clear" onClick={clear}>Clear</button>
//           <button className={`notepad-btn save${saved ? ' saved' : ''}`} onClick={save}>
//             {saved ? '✓ Saved' : 'Save'}
//           </button>
//           <button className="notepad-btn" onClick={() => setOpen(false)} style={{ padding:'3px 8px' }}>✕</button>
//         </div>
//       </div>
//       <textarea
//         className="notepad-area"
//         value={note}
//         onChange={e => setNote(e.target.value)}
//         placeholder={`Write your notes, questions, or key takeaways for this article...`}
//         spellCheck={false}
//         style={{ minHeight: '180px' }}
//       />
//       <div className="notepad-footer">
//         Saved locally in your browser · {note.length} chars
//       </div>
//     </div>
//   )
// }

// // ─── Code Block ───────────────────────────────────────────────────────────────
// function CodeBlockWithCopy({ code }) {
//   const [copied, setCopied] = useState(false)
//   const lineCount = code.split('\n').length
//   const lang = detectLang(code)

//   const handleCopy = async () => {
//     try {
//       await navigator.clipboard.writeText(code)
//       setCopied(true)
//       setTimeout(() => setCopied(false), 2000)
//     } catch (err) { console.error('Copy failed:', err) }
//   }

//   return (
//     <div className="code-outer">
//       <div className="code-block-wrap">
//         <div className="code-block-header">
//           <div className="mac-dots">
//             {['#ff5f56','#ffbd2e','#27c93f'].map(c => (
//               <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>
//             ))}
//           </div>
//           <button onClick={handleCopy} className={`copy-btn${copied ? ' copied' : ''}`}>
//             {copied ? (
//               <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Copied!</>
//             ) : (
//               <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>
//             )}
//           </button>
//         </div>
//         <div className="code-block-body">
//           <SyntaxHighlighter
//             language={lang}
//             style={vscDarkPlus}
//             customStyle={{
//               margin:0, padding:'1.1rem 1.25rem',
//               fontSize:'clamp(0.78rem, 2vw, 0.875rem)',
//               background:'transparent', lineHeight:'1.75',
//               fontFamily:'"JetBrains Mono","Fira Code","Cascadia Code",monospace',
//               minWidth:'max-content',
//             }}
//             showLineNumbers={lineCount > 5}
//             lineNumberStyle={{ color:'#3d444d', fontSize:'0.72rem', minWidth:'2.25rem', userSelect:'none' }}
//             wrapLongLines={false}
//           >
//             {code}
//           </SyntaxHighlighter>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ─── Main Renderer ────────────────────────────────────────────────────────────
// export default function BlogContentRenderer({ content, wordCount, articleSlug = 'article' }) {
//   const [selectedImage, setSelectedImage] = useState(null)
//   const [processedElements, setProcessedElements] = useState(null) // null = not yet processed

//   useEffect(() => {
//     if (!content) return
//     const tempDiv = document.createElement('div')
//     tempDiv.innerHTML = content

//     // Remove empty paragraphs
//     tempDiv.querySelectorAll('p').forEach(p => {
//       if (p.querySelector('img, video, iframe')) return
//       const text = p.textContent.trim()
//       const onlyBr = p.children.length === 1 && p.children[0].tagName === 'BR'
//       if (!text || onlyBr) p.remove()
//     })

//     // ── Detect and extract uploaded videos ───────────────────────────────────
//     // Handles both old format (iframe in p) and new format (ql-video-wrapper div)
//     const uploadedVideos = []

//     // New format: ql-video-wrapper divs saved by custom VideoBlot
//     tempDiv.querySelectorAll('.ql-video-wrapper').forEach(wrapper => {
//       const src = wrapper.getAttribute('data-video-src') || ''
//       if (!src) return
//       const marker = `__UPLOADED_VIDEO_${uploadedVideos.length}__`
//       const isUpload = src.includes('blob.vercel-storage.com') || src.match(/\.(mp4|webm|mov)(\?|$)/i)
//       uploadedVideos.push({ marker, src, isUpload })
//       wrapper.replaceWith(document.createTextNode(marker))
//     })

//     // Old format: iframe inside p tag (legacy posts)
//     tempDiv.querySelectorAll('p').forEach(p => {
//       const iframe = p.querySelector('iframe')
//       if (!iframe) return
//       const src = iframe.getAttribute('src') || ''
//       if (!src) return
//       const isUpload = src.includes('blob.vercel-storage.com') || src.match(/\.(mp4|webm|mov)(\?|$)/i)
//       const marker = `__UPLOADED_VIDEO_${uploadedVideos.length}__`
//       uploadedVideos.push({ marker, src, isUpload })
//       p.replaceWith(document.createTextNode(marker))
//     })

//     // Wrap tables
//     tempDiv.querySelectorAll('table').forEach(table => {
//       if (table.closest('.table-scroll-wrap')) return
//       const wrapper = document.createElement('div')
//       wrapper.className = 'table-scroll-wrap'
//       table.parentNode.insertBefore(wrapper, table)
//       wrapper.appendChild(table)
//     })

//     // Extract code blocks
//     const codeContainers = tempDiv.querySelectorAll('.ql-code-block-container, pre')
//     const codeBlocks = []
//     codeContainers.forEach((container, i) => {
//       let codeText = ''
//       if (container.classList.contains('ql-code-block-container')) {
//         codeText = Array.from(container.querySelectorAll('.ql-code-block')).map(l => l.textContent).join('\n')
//       } else {
//         codeText = container.textContent || ''
//       }
//       const marker = `__CODE_BLOCK_${i}__`
//       codeBlocks.push({ marker, codeText })
//       container.replaceWith(document.createTextNode(marker))
//     })

//     // Split and build elements
//     const allMarkers = /(__CODE_BLOCK_\d+__|__UPLOADED_VIDEO_\d+__)/
//     const parts = tempDiv.innerHTML.split(allMarkers)

//     const elements = parts.map((part, i) => {
//       const cb = codeBlocks.find(b => b.marker === part)
//       if (cb) {
//         return (
//           <CodeBlockWithCopy
//             key={`code-${i}`}
//             code={cb.codeText}
//           />
//         )
//       }
//       const uv = uploadedVideos.find(v => v.marker === part)
//       if (uv) return <ProtectedVideoPlayer key={`vid-${i}`} src={uv.src}/>
//       if (!part.trim()) return null
//       return <div key={`seg-${i}`} className="html-content-segment" dangerouslySetInnerHTML={{ __html: part }}/>
//     }).filter(Boolean)

//     setProcessedElements(elements)
//   }, [content, articleSlug])

//   const handleClick = useCallback(e => {
//     if (e.target.tagName === 'IMG') setSelectedImage(e.target.src)
//   }, [])

//   return (
//     <>
//       <style jsx global>{`
//         @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');

//         .blog-render-container {
//           width:100%; font-family:'DM Sans',-apple-system,sans-serif;
//           font-size:clamp(1rem,2.2vw,1.075rem); line-height:1.875;
//           color:#1e293b; letter-spacing:-0.01em;
//         }

//         /* Headings */
//         // .blog-render-container h1 {
//         //   font-family:'Lora',Georgia,serif;
//         //   font-size:clamp(1.3rem,3.6vw,1.85rem);
//         //   font-weight:600; line-height:1.25; color:#0f172a;
//         //   margin:2.25rem 0 0.75rem; letter-spacing:-0.02em;
//         //   padding-bottom:0.5rem; border-bottom:1px solid #f1f5f9;
//         // }
//         // .blog-render-container h2 {
//         //   font-family:'Lora',Georgia,serif;
//         //   font-size:clamp(1.1rem,2.8vw,1.45rem);
//         //   font-weight:600; line-height:1.3; color:#0f172a;
//         //   margin:1.875rem 0 0.625rem; letter-spacing:-0.015em;
//         // }
//         // .blog-render-container h3 {
//         //   font-family:'DM Sans',sans-serif;
//         //   font-size:clamp(0.95rem,2.2vw,1.1rem);
//         //   font-weight:600; line-height:1.4; color:#1e293b;
//         //   margin:1.5rem 0 0.45rem;
//         // }
//         /* REPLACE your h1, h2, h3 rules with these */
// .blog-render-container h1 {
//   font-family:'Lora',Georgia,serif;
//   font-size:clamp(1.3rem,3.6vw,1.85rem);
//   font-weight:600; line-height:1.25; color:#0f172a;
//   margin:2.25rem 0 0.75rem; letter-spacing:-0.02em;
//   padding-bottom:0.5rem; border-bottom:1px solid #f1f5f9;
// }
// .blog-render-container h2 {
//   font-family:'Lora',Georgia,serif;
//   font-size:clamp(1.1rem,2.8vw,1.45rem);
//   font-weight:600; line-height:1.3; color:#0f172a;
//   margin:1.875rem 0 0.625rem; letter-spacing:-0.015em;
// }
// .blog-render-container h3 {
//   font-family:'DM Sans',sans-serif;
//   font-size:clamp(0.95rem,2.2vw,1.1rem);
//   font-weight:600; line-height:1.4; color:#1e293b;
//   margin:1.5rem 0 0.45rem;
// }

// /* ADD this — strong inside headings needs higher specificity */
// .blog-render-container h1 strong,
// .blog-render-container h2 strong,
// .blog-render-container h3 strong {
//   font-weight:800 !important;
//   color:inherit;
// }
//         .blog-render-container h1:first-child,
//         .blog-render-container h2:first-child,
//         .blog-render-container h3:first-child { margin-top:0; }

//         .blog-render-container p { margin:0 0 1.1rem; color:#374151; line-height:1.875; }
//         .blog-render-container p:last-child { margin-bottom:0; }
//         .blog-render-container strong { font-weight:600; color:#0f172a; }
//         .blog-render-container em { font-style:italic; }
//         .blog-render-container u { text-decoration:underline; text-underline-offset:3px; }
//         .blog-render-container :not(pre)>code {
//           font-family:'JetBrains Mono','Fira Code',monospace;
//           font-size:0.85em; color:#2563eb; font-weight:500;
//         }

//         /* Blockquote */
//         .blog-render-container blockquote {
//           position:relative; border-left:3px solid #2563eb;
//           background:#f8faff; margin:2rem 0;
//           padding:1.25rem 1.5rem 1.25rem 1.75rem;
//           border-radius:0 10px 10px 0;
//           font-family:'Lora',Georgia,serif; font-style:italic;
//           font-size:clamp(0.975rem,2vw,1.05rem);
//           color:#1e3a5f; line-height:1.8; overflow:hidden;
//         }
//         .blog-render-container blockquote::before {
//           content:'"'; position:absolute; top:-10px; left:12px;
//           font-size:5rem; color:#2563eb; opacity:0.12;
//           font-family:Georgia,serif; line-height:1; pointer-events:none;
//         }

//         /* Lists */
//         .blog-render-container ul { list-style:none; margin:0 0 1.1rem; padding:0; }
//         .blog-render-container ul li {
//           position:relative; padding-left:1.5rem;
//           margin-bottom:0.45rem; line-height:1.75; color:#374151;
//         }
//         .blog-render-container ul li::before {
//           content:''; position:absolute; left:0; top:0.68em;
//           width:6px; height:6px; border-radius:50%;
//           background:#2563eb; opacity:0.65;
//         }
//         .blog-render-container ol {
//           list-style:none; margin:0 0 1.1rem; padding:0;
//           counter-reset:ol-counter;
//         }
//         .blog-render-container ol li {
//           position:relative; padding-left:1.75rem;
//           margin-bottom:0.45rem; line-height:1.75; color:#374151;
//           counter-increment:ol-counter;
//         }
//         .blog-render-container ol li::before {
//           content:counter(ol-counter);
//           position:absolute; left:0; top:0.1em;
//           width:1.25rem; height:1.25rem; border-radius:50%;
//           background:#eff6ff; border:1.5px solid #bfdbfe;
//           color:#2563eb; font-size:0.72rem; font-weight:600;
//           display:flex; align-items:center; justify-content:center;
//         }

//         .blog-render-container a { color:#2563eb; text-decoration:underline; text-underline-offset:3px; text-decoration-thickness:1px; transition:color 0.15s; }
//         .blog-render-container a:hover { color:#1d4ed8; }

//         .blog-render-container img {
//           max-width:100% !important; width:auto !important; height:auto !important;
//           border-radius:10px !important; cursor:zoom-in !important;
//           margin:1.5rem auto !important; display:block !important;
//           border:1px solid #e2e8f0 !important;
//           transition:transform 0.25s ease,box-shadow 0.25s ease !important;
//           box-shadow:0 2px 12px rgba(0,0,0,0.06) !important;
//         }
//         .blog-render-container img:hover { transform:scale(1.012) !important; box-shadow:0 8px 28px rgba(0,0,0,0.12) !important; }

//         .blog-render-container .ql-align-center { text-align:center !important; }
//         .blog-render-container .ql-align-right  { text-align:right !important; }
//         .blog-render-container .ql-align-left   { text-align:left !important; }
//         .blog-render-container .ql-align-justify { text-align:justify !important; }

//         /* ── Tables — beautiful redesign ── */
//         .table-scroll-wrap {
//           width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch;
//           margin:2rem 0; border-radius:14px;
//           border:1px solid #e2e8f0;
//           box-shadow:0 2px 16px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.04);
//         }
//         .blog-render-container table {
//           border-collapse:collapse; width:100%; min-width:380px;
//           font-size:0.9rem;
//         }
//         .blog-render-container table thead tr {
//           background:linear-gradient(135deg,#1e40af 0%,#2563eb 100%);
//         }
//         .blog-render-container table th {
//           color:white; font-weight:600; text-align:left;
//           padding:13px 18px; font-size:0.82rem;
//           letter-spacing:0.04em; text-transform:uppercase;
//           border-right:1px solid rgba(255,255,255,0.15);
//           white-space:nowrap;
//         }
//         .blog-render-container table th:last-child { border-right:none; }
//         .blog-render-container table tbody tr {
//           border-bottom:1px solid #f1f5f9;
//           transition:background 0.14s;
//         }
//         .blog-render-container table tbody tr:last-child { border-bottom:none; }
//         .blog-render-container table tbody tr:nth-child(even) { background:#f8fafc; }
//         .blog-render-container table tbody tr:hover { background:#eff6ff; }
//         .blog-render-container table td {
//           padding:11px 18px; color:#374151;
//           border-right:1px solid #f1f5f9;
//           vertical-align:top; line-height:1.55;
//         }
//         .blog-render-container table td:last-child { border-right:none; }
//         @media(max-width:640px) {
//           .blog-render-container table th,
//           .blog-render-container table td { padding:9px 12px; font-size:0.82rem; }
//         }

//         .blog-render-container iframe {
//           width:100%; height:clamp(220px,45vw,440px);
//           border-radius:10px; border:none; margin:1.5rem 0; display:block;
//           box-shadow:0 4px 20px rgba(0,0,0,0.08);
//         }

//         .blog-render-container hr { border:none; border-top:1.5px solid #f1f5f9; margin:2.25rem 0; }
//         .html-content-segment { display:block; }
//         .blog-render-container > *:first-child { margin-top:0 !important; }
//         .blog-render-container > *:last-child  { margin-bottom:0 !important; }

//         /* ── Code block ── */
//         .code-outer { margin:1.75rem 0; }
//         .code-block-wrap {
//           border-radius:12px 12px 0 0; overflow:hidden;
//           border:1px solid #1e293b; border-bottom:none;
//           background:#0d1117;
//           box-shadow:0 4px 24px rgba(0,0,0,0.15);
//         }
//         .code-block-header {
//           display:flex; justify-content:space-between; align-items:center;
//           padding:9px 14px; background:#161b22; border-bottom:1px solid #1e293b;
//         }
//         .mac-dots { display:flex; gap:5px; align-items:center; }
//         .code-block-body { overflow-x:auto; -webkit-overflow-scrolling:touch; }
//         .copy-btn {
//           display:flex; align-items:center; gap:5px; padding:4px 11px;
//           border-radius:6px; font-size:12px; font-weight:500; cursor:pointer;
//           border:1px solid #ffffff18; background:transparent; color:#8b949e;
//           transition:all 0.18s; font-family:'DM Sans',sans-serif;
//         }
//         .copy-btn:hover { background:#ffffff0f; color:#c9d1d9; border-color:#ffffff28; }
//         .copy-btn.copied { background:#10b98112; color:#10b981; border-color:#10b98130; }

//         /* ── Article Notepad ── */
//         .article-notepad-trigger {
//           display:inline-flex; align-items:center; gap:8px;
//           margin-top:2rem; padding:10px 20px;
//           background:white; border:1px solid #e2e8f0;
//           border-radius:10px;
//           font-size:13.5px; font-weight:500; color:#64748b;
//           cursor:pointer; transition:all 0.18s;
//           font-family:'DM Sans',sans-serif; width:100%;
//           justify-content:center;
//           box-shadow:0 2px 8px rgba(0,0,0,0.05);
//         }
//         .article-notepad-trigger:hover { background:#f8faff; color:#2563eb; border-color:#bfdbfe; box-shadow:0 4px 14px rgba(37,99,235,0.1); }
//         .article-notepad-wrap {
//           margin-top:2rem;
//           background:white; border:1px solid #e2e8f0;
//           border-radius:12px; overflow:hidden;
//           box-shadow:0 4px 16px rgba(0,0,0,0.06);
//         }
//         .notepad-header {
//           display:flex; justify-content:space-between; align-items:center;
//           padding:10px 14px; background:#f8fafc;
//           border-bottom:1px solid #f1f5f9;
//         }
//         .notepad-btn {
//           padding:4px 12px; border-radius:6px; font-size:12px; font-weight:500;
//           cursor:pointer; font-family:'DM Sans',sans-serif;
//           border:1px solid #e2e8f0; background:white; color:#64748b;
//           transition:all 0.16s;
//         }
//         .notepad-btn:hover { background:#f1f5f9; }
//         .notepad-btn.save { background:#eff6ff; color:#2563eb; border-color:#bfdbfe; }
//         .notepad-btn.save:hover { background:#dbeafe; }
//         .notepad-btn.save.saved { background:#f0fdf4; color:#16a34a; border-color:#bbf7d0; }
//         .notepad-btn.clear { color:#ef4444; border-color:#fecaca; background:#fff; }
//         .notepad-btn.clear:hover { background:#fef2f2; }
//         .notepad-area {
//           width:100%; min-height:140px; padding:14px;
//           font-family:'JetBrains Mono','Fira Code',monospace;
//           font-size:0.825rem; line-height:1.7; color:#1e293b;
//           border:none; outline:none; resize:vertical;
//           background:white;
//         }
//         .notepad-footer {
//           padding:6px 14px; font-size:11px; color:#94a3b8;
//           background:#f8fafc; border-top:1px solid #f1f5f9;
//         }

//         /* ── Protected Video Player ── */
//         .vid-player {
//           position:relative; width:100%; margin:1.75rem 0;
//           border-radius:16px; overflow:hidden;
//           background:#000;
//           box-shadow:0 20px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2);
//           user-select:none; -webkit-user-select:none;
//           cursor:pointer;
//           min-height:240px;
//         }
//         @media(max-width:640px) {
//           .vid-player { min-height:210px; border-radius:10px; margin:1.25rem 0; }
//         }
//         .vid-el {
//           width:100%; display:block;
//           max-height:480px; object-fit:contain;
//           -webkit-user-drag:none;
//           min-height:inherit;
//         }
//         @media(max-width:640px) {
//           .vid-el { max-height:none; min-height:210px; }
//         }
//         /* Black gradient mask at bottom */
//         .vid-gradient-mask {
//           position:absolute; bottom:0; left:0; right:0;
//           height:45%;
//           background:linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%);
//           pointer-events:none; z-index:1;
//         }
//         .vid-overlay {
//           position:absolute; inset:0;
//           display:flex; align-items:center; justify-content:center;
//           z-index:2;
//         }
//           .vid-play-btn {
//   z-index: 2;
//   cursor: pointer;
// }
// .vid-speed-indicator {
//   position: absolute;
//   top: 10%;
//   left: 50%;
//   transform: translate(-50%, -50%);
  
//   background: rgba(0,0,0,0.45);
//   color: white;

//   padding: 10px 16px;
//   border-radius: 24px;

//   font-size: 16px;
//   font-weight: 600;

//   pointer-events: none;
//   z-index: 6;

//   backdrop-filter: blur(6px);
// }
// /* Skip buttons */
// .vid-skip-btn {
//   position: absolute;
//   top: 50%;
//   transform: translateY(-50%);
  
//   width: 60px;
//   height: 60px;
//   border-radius: 50%;

//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 2px;

//   background:rgba(0,0,0,0.35);
//           backdrop-filter:blur(12px);

//   color: white;
//   cursor: pointer;
//   z-index: 2;

//   transition: all 0.2s ease;
// }

// .vid-skip-btn:hover {
//           background:rgba(0,0,0,0.45);
// }

// /* Text inside buttons */
// .vid-skip-text {
//   font-size: 12px;
//   font-weight: 600;
// }
//           .vid-skip-left {
//   left: 5%;
// }

// .vid-skip-right {
//   right: 5%;
// }
//  .vid-action-indicator {
//   position: absolute;
//   top: 10%;
//   left: 50%;
//   transform: translate(-50%, -50%) scale(0.95);

//   background: rgba(0,0,0,0.35);
//   color: white;
//   padding: 8px 14px;
//   border-radius: 20px;

//   font-size: 14px;
//   font-weight: 500;

//   pointer-events: none;
//   z-index: 5;

//   opacity: 0;
//   transition: opacity 0.15s ease, transform 0.15s ease;
// }

// .vid-action-indicator.show {
//   opacity: 1;
//   transform: translate(-50%, -50%) scale(1);
// }

// @keyframes fadeInOut {
//   0% { opacity: 0; transform: translate(-50%, -60%); }
//   20% { opacity: 1; transform: translate(-50%, -50%); }
//   80% { opacity: 1; }
//   100% { opacity: 0; }
// }
//         .vid-play-btn {
//           width:68px; height:68px; border-radius:50%;
//           background:rgba(0,0,0,0.35);
//           backdrop-filter:blur(12px);
//           -webkit-backdrop-filter:blur(12px);
//           border:1.5px solid rgba(255,255,255,0.3);
//           display:flex; align-items:center; justify-content:center;
//           padding-left:4px;
//           box-shadow:0 8px 32px rgba(0,0,0,0.3);
//           transition:transform 0.18s, background 0.18s;
//         }
//         @media(max-width:640px) {
//           .vid-play-btn { width:52px; height:52px; }
//         }
//         .vid-overlay:hover .vid-play-btn {
//           transform:scale(1.1);
//           background:rgba(0,0,0,0.45);
//         }
//         /* Glassmorphism controls bar */
//         .vid-controls {
//           position:absolute; bottom:0; left:0; right:0; z-index:3;
//           display:flex; align-items:center; gap:10px;
//           padding:10px 14px 12px;
//           background:rgba(0,0,0,0.75);
//           backdrop-filter:blur(16px);
//           -webkit-backdrop-filter:blur(16px);
//           border-top:1px solid rgba(255,255,255,0.08);
//           opacity:0; transition:opacity 0.25s ease;
//         }
//         .vid-controls.visible { opacity:1; }
//         @media(max-width:640px) {
//           .vid-controls { gap:6px; padding:8px 10px 10px; }
//         }
//         .vid-ctrl-btn {
//           background:none; border:none; cursor:pointer;
//           padding:4px; display:flex; align-items:center;
//           color:white; opacity:0.9; transition:opacity 0.15s, transform 0.15s;
//           flex-shrink:0;
//         }
//         .vid-ctrl-btn:hover { opacity:1; transform:scale(1.15); }
//         .vid-progress {
//           flex:1; height:3px;
//           background:rgba(255,255,255,0.25);
//           border-radius:2px; cursor:pointer; position:relative;
//           transition:height 0.15s;
//         }
//         .vid-progress:hover { height:5px; }
//         .vid-progress-fill {
//           height:100%; border-radius:2px;
//           background:white; pointer-events:none;
//           transition:width 0.1s linear;
//         }
//         .vid-time {
//           font-size:11px; color:rgba(255,255,255,0.8);
//           white-space:nowrap; font-family:monospace; flex-shrink:0;
//         }
//         @media(max-width:640px) {
//           .vid-time { font-size:10px; }
//         }
//         /* Volume control */
//         .vid-vol-wrap { position:relative; display:flex; align-items:center; }
//         .vid-vol-slider-wrap {
//           position:absolute; bottom:calc(100% + 10px); right:-4px;
//           background:rgba(20,20,20,0.7);
//           backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
//           border:1px solid rgba(255,255,255,0.12);
//           border-radius:10px; padding:10px 8px;
//           display:flex; align-items:center; justify-content:center;
//           width:36px; height:100px;
//           box-shadow:0 8px 24px rgba(0,0,0,0.4);
//         }
//         .vid-vol-slider {
//           writing-mode:vertical-lr; direction:rtl;
//           width:4px; height:80px;
//           cursor:pointer; accent-color:white;
//           appearance:slider-vertical; -webkit-appearance:slider-vertical;
//         }
//         /* Fullscreen — landscape fill */
//         .vid-player:fullscreen,
//         .vid-player:-webkit-full-screen {
//           border-radius:0 !important;
//           width:100vw !important; height:100vh !important;
//           min-height:100vh !important;
//           margin:0 !important;
//         }
//         .vid-player:fullscreen .vid-el,
//         .vid-player:-webkit-full-screen .vid-el {
//           width:100vw !important; height:100vh !important;
//           max-height:100vh !important; min-height:100vh !important;
//           object-fit:contain !important;
//         }
//         /* On mobile fullscreen — fill the rotated screen */
//         @media(max-width:640px) {
//           .vid-player:fullscreen,
//           .vid-player:-webkit-full-screen {
//             width:100svw !important; height:100svh !important;
//             min-height:100svh !important;
//           }
//           .vid-player:fullscreen .vid-el,
//           .vid-player:-webkit-full-screen .vid-el {
//             height:100svh !important; max-height:100svh !important;
//           }
//         }

//         /* ── Back to top — centered, black/white ── */
//         .btt-btn {
//           position:fixed; bottom:1.5rem;
//           left:50%; transform:translateX(-50%);
//           z-index:50;
//           width:34px; height:34px; border-radius:50%;
//           background:#0f172a; color:white; border:none; cursor:pointer;
//           display:flex; align-items:center; justify-content:center;
//           box-shadow:0 3px 12px rgba(0,0,0,0.2);
//           transition:transform 0.2s, background 0.2s, box-shadow 0.2s;
//           animation:bttIn 0.25s ease;
//         }
//         @keyframes bttIn { from{opacity:0;transform:translateX(-50%) translateY(8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
//         .btt-btn:hover {
//           background:#1e293b;
//           transform:translateX(-50%) translateY(-2px);
//           box-shadow:0 6px 18px rgba(0,0,0,0.26);
//         }

//         /* ── Lightbox ── */
//         .lightbox-overlay {
//           position:fixed; inset:0; z-index:9999;
//           display:flex; align-items:center; justify-content:center;
//           background:rgba(0,0,0,0.88); padding:1rem;
//           animation:lbIn 0.2s ease;
//         }
//         @keyframes lbIn { from{opacity:0} to{opacity:1} }
//         .lightbox-overlay img {
//           max-width:100% !important; max-height:90vh !important;
//           object-fit:contain !important; border-radius:8px !important;
//           border:none !important; box-shadow:0 30px 80px rgba(0,0,0,0.5) !important;
//           cursor:default !important; margin:0 !important; transform:none !important;
//         }
//         .lightbox-close {
//           position:absolute; top:1rem; right:1rem;
//           width:36px; height:36px; border-radius:50%;
//           background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.18);
//           color:white; cursor:pointer; display:flex;
//           align-items:center; justify-content:center; transition:background 0.15s;
//           font-family:inherit;
//         }
//         .lightbox-close:hover { background:rgba(255,255,255,0.2); }
        
//       `}</style>

//       <div className="blog-render-container" onClick={handleClick}>
//         {/* Raw HTML — always in DOM for Google/SSR, hidden once JS processes it */}
//         <div
//           dangerouslySetInnerHTML={{ __html: content }}
//           style={{ display: processedElements !== null ? 'none' : 'block' }}
//           aria-hidden={processedElements !== null}
//         />
//         {/* Processed elements — React-controlled, shown after useEffect runs */}
//         {processedElements !== null && processedElements}
//       </div>

//       {/* Article-level notepad — one per article at the bottom */}
//       <ArticleNotepad articleSlug={articleSlug} />

//       <BackToTop/>

//       {selectedImage && (
//         <div className="lightbox-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedImage(null) }}>
//           <img src={selectedImage} alt="Expanded"/>
//           <button className="lightbox-close" onClick={() => setSelectedImage(null)} aria-label="Close">
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//               <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
//             </svg>
//           </button>
//         </div>
//       )}
//     </>
//   )
// }
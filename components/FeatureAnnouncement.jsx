'use client';

import { useState, useEffect } from 'react';

export default function FeatureAnnouncement() {
  const [show, setShow] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem('announcement-visualizer-v1');
    if (!seen) setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem('announcement-visualizer-v1', 'seen');
    setShow(false);
  };

  if (!show) return null;

  const slides = [
    {
      image: 'https://res.cloudinary.com/da4qsaa82/image/upload/v1775765926/Screenshot_2026-04-10_014335_shgysq.png', // replace with your image
      label: 'Step 1 of 2',
      heading: 'Find it in every code block',
      detail: 'Look for the Visualize button in the top-right corner of any Java code block across the blog.',
    },
    {
      image: 'https://res.cloudinary.com/da4qsaa82/image/upload/v1775765684/Screenshot_2026-04-10_013901_wn0ops.png', // replace with your image
      label: 'Step 2 of 2',
      heading: 'See the logic, not just the code',
      detail: 'An interactive flow diagram opens instantly — with decision branches, loop back-edges, and recursive call arrows all mapped out.',
    },
  ];

  const current = slides[slide];

  return (
    <div
      className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
    //   onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div className="relative w-full sm:max-w-lg bg-white dark:bg-[#141414] sm:rounded-2xl rounded-t-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">

        {/* top accent */}
        <div className="h-[3px] w-full bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" />

        {/* close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
<h2 className='font-bold p-2 text-xl mt-2'>Code Logic Visualizer Chart</h2>
        {/* image carousel */}
        <div className="relative w-full bg-gray-50 dark:bg-[#0f0f0f] overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {slides.map((s, i) => (
            <img
              key={i}
              src={s.image}
              alt={s.heading}
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${i === slide ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}

          {/* slide dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? 'w-5 bg-blue-700' : 'w-1.5 bg-blue-700/40'}`}
              />
            ))}
          </div>

          {/* prev / next arrows */}
          {slide > 0 && (
            <button
              onClick={() => setSlide(slide - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          {slide < slides.length - 1 && (
            <button
              onClick={() => setSlide(slide + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        {/* content */}
        <div className="px-6 pt-5 pb-6">

          {/* badge + step label */}
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              New Feature
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium">{current.label}</span>
          </div>

          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">{current.heading}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{current.detail}</p>

          {/* actions */}
          <div className="flex gap-2 mt-5">
            {slide < slides.length - 1 ? (
              <>
                <button
                  onClick={dismiss}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={() => setSlide(slide + 1)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Next →
                </button>
              </>
            ) : (
              <button
                onClick={dismiss}
                className="flex-1 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Try it now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
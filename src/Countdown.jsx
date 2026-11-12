import React, { useEffect, useState } from 'react';

// Change these two to adjust the countdown
const TARGET_MONTH = 11; // 0-based: 11 = December
const TARGET_DAY = 15;
const START_MONTH = 10;  // Santa starts his trip on Nov 1
const START_DAY = 1;

function getDates(now) {
  const y = now.getFullYear();
  return {
    start: new Date(y, START_MONTH, START_DAY, 0, 0, 0),
    target: new Date(y, TARGET_MONTH, TARGET_DAY, 0, 0, 0),
  };
}

function Menorah() {
  const xs = [14, 32, 50, 68, 86, 104, 122, 140, 158];
  return (
    <svg viewBox="0 0 172 130" className="w-full h-auto" aria-label="menorah">
      {/* arms */}
      <path
        d="M14 70 C14 100 40 104 70 104 L102 104 C132 104 158 100 158 70"
        fill="none" stroke="#d4a017" strokeWidth="6" strokeLinecap="round"
      />
      <path d="M32 70 C32 92 52 96 70 96 L102 96 C120 96 140 92 140 70" fill="none" stroke="#d4a017" strokeWidth="5" strokeLinecap="round" />
      <path d="M50 70 C50 86 62 88 74 88 L98 88 C110 88 122 86 122 70" fill="none" stroke="#d4a017" strokeWidth="5" strokeLinecap="round" />
      <path d="M68 70 C68 80 74 80 78 80 L94 80 C98 80 104 80 104 70" fill="none" stroke="#d4a017" strokeWidth="5" strokeLinecap="round" />
      {/* stem + base */}
      <rect x="82" y="80" width="8" height="30" fill="#d4a017" />
      <path d="M58 126 L114 126 L104 110 L68 110 Z" fill="#d4a017" />
      {/* candles */}
      {xs.map((x, i) => {
        const shamash = i === 4;
        const top = shamash ? 28 : 46;
        return (
          <g key={x}>
            <rect x={x - 4} y={top} width="8" height={72 - top + (shamash ? 0 : 0)} rx="1.5" fill="#3b82c4" />
            <ellipse className="flame" cx={x} cy={top - 8} rx="4" ry="7" fill="#ffb703" style={{ animationDelay: `${i * 0.15}s` }} />
            <ellipse cx={x} cy={top - 6} rx="2" ry="4" fill="#fff3b0" />
          </g>
        );
      })}
    </svg>
  );
}

function Tree() {
  return (
    <svg viewBox="0 0 110 140" className="w-full h-auto" aria-label="christmas tree">
      <rect x="48" y="112" width="14" height="22" fill="#7a4a21" />
      <polygon points="55,38 18,84 92,84" fill="#1f7a4d" />
      <polygon points="55,24 10,100 100,100" fill="#17663f" opacity="0.0" />
      <polygon points="55,52 12,104 98,104" fill="#2a9d62" />
      <polygon points="55,70 6,120 104,120" fill="#1f7a4d" />
      <polygon points="55,12 61,28 78,28 64,38 69,54 55,44 41,54 46,38 32,28 49,28" fill="#ffd166" />
      <circle cx="40" cy="90" r="4.5" fill="#e63946" />
      <circle cx="66" cy="76" r="4.5" fill="#f4a261" />
      <circle cx="74" cy="104" r="4.5" fill="#457b9d" />
      <circle cx="30" cy="110" r="4.5" fill="#ffd166" />
      <circle cx="52" cy="102" r="4.5" fill="#e63946" />
    </svg>
  );
}

export default function Countdown() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { start, target } = getDates(now);
  const msLeft = target - now;
  const done = msLeft <= 0;
  const progress = Math.min(1, Math.max(0, (now - start) / (target - start)));

  const totalSec = Math.max(0, Math.floor(msLeft / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const units = [
    ['days', days],
    ['hours', hours],
    ['min', mins],
    ['sec', secs],
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 mt-2 mb-2">
      <style>{`
        @keyframes sleighBob { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-6px) rotate(1deg); } }
        @keyframes flameFlicker { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(1.18) translateY(-1px); } }
        @keyframes twinkle { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
        .sleigh-bob { animation: sleighBob 1.6s ease-in-out infinite; transform-origin: 50% 100%; }
        .flame { animation: flameFlicker .9s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
        .flake { animation: twinkle 2.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .sleigh-bob, .flame, .flake { animation: none; } }
      `}</style>

      <div className="rounded-3xl border border-emerald-900/15 bg-white/70 shadow-sm px-4 pt-4 pb-3 overflow-hidden">
        <div className="text-center mb-3">
          <p className="text-xs font-extrabold tracking-widest uppercase text-emerald-800">
            {done ? 'santa has arrived' : 'countdown to winter break'}
          </p>
          {done ? (
            <p
              className="text-3xl sm:text-4xl font-bold text-red-700 mt-1"
              style={{ fontFamily: "'Mountains of Christmas', cursive" }}
            >
              winter break is here! 🎄🕎
            </p>
          ) : (
            <div className="flex justify-center gap-2 sm:gap-3 mt-2">
              {units.map(([label, value]) => (
                <div key={label} className="min-w-[3.6rem] sm:min-w-[4.5rem] rounded-xl bg-emerald-950 text-white py-1.5 px-2">
                  <div className="text-xl sm:text-3xl font-extrabold tabular-nums leading-none">
                    {String(value).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-wider text-emerald-200 mt-1">{label}</div>
                </div>
              ))}
            </div>
          )}
          {!done && (
            <p className="text-xs text-emerald-900/70 mt-2">until december 15</p>
          )}
        </div>

        {/* Sleigh track */}
        <div className="relative h-44 sm:h-56" style={{ '--sw': 'clamp(110px, 20vw, 190px)' }}>
          {/* sparkles */}
          {[8, 22, 38, 55, 70, 84].map((l, i) => (
            <span
              key={l}
              className="flake absolute text-emerald-900/40 select-none"
              style={{ left: `${l}%`, top: `${(i * 17) % 55}%`, animationDelay: `${i * 0.4}s` }}
            >
              ❄
            </span>
          ))}

          {/* snowy ground */}
          <div className="absolute left-0 right-0 bottom-0 h-3 rounded-full bg-gradient-to-r from-emerald-100 via-white to-emerald-100 border border-emerald-900/10" />

          {/* menorah + tree at the finish */}
          <div className="absolute right-0 bottom-2 flex items-end gap-1 sm:gap-2" style={{ width: 'clamp(120px, 22vw, 200px)' }}>
            <div className="w-1/2"><Menorah /></div>
            <div className="w-1/2"><Tree /></div>
          </div>

          {/* lane Santa travels along (stops just before the menorah + tree) */}
          <div className="absolute left-0 bottom-2 top-0" style={{ right: 'clamp(120px, 22vw, 200px)' }}>
            <div
              className="absolute bottom-0"
              style={{
                width: 'var(--sw)',
                left: `calc((100% - var(--sw)) * ${progress})`,
                transition: 'left 1s linear',
              }}
            >
              <img
                src="/santa.png"
                alt="santa riding a sleigh toward winter break"
                className="sleigh-bob w-full h-auto select-none"
                draggable="false"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

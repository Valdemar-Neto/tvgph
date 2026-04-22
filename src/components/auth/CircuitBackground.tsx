'use client';

import React, { useState, useEffect } from 'react';

interface CircuitBackgroundProps {
  dark?: boolean;
}

export const CircuitBackground = ({ dark = true }: CircuitBackgroundProps) => {
  const [mounted, setMounted] = useState(false);
  const [vFlows, setVFlows] = useState<{ dur: string; begin: string }[]>([]);
  const [hFlows, setHFlows] = useState<{ dur: string; begin: string }[]>([]);

  useEffect(() => {
    // Generate random values only on client-side to avoid hydration mismatch
    const v = [...Array(15)].map(() => ({
      dur: `${15 + Math.random() * 20}s`,
      begin: `${Math.random() * 10}s`
    }));
    const h = [...Array(10)].map(() => ({
      dur: `${20 + Math.random() * 25}s`,
      begin: `${Math.random() * 12}s`
    }));
    
    setVFlows(v);
    setHFlows(h);
    setMounted(true);
  }, []);

  return (
    <div className={`absolute inset-0 z-0 ${dark ? 'bg-black' : 'bg-white'} overflow-hidden pointer-events-none`}>
      {/* Grid Pattern Layer */}
      <div 
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.35]"
        style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Animated Circuit Lines via SVG Animations */}
      <svg className="absolute inset-0 w-full h-full opacity-60 dark:opacity-80">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="line-gradient-h" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Vertical Data Flows */}
        {mounted && vFlows.map((flow, i) => (
          <rect
            key={`v-${i}`}
            x={`${(i + 1) * 7.5}%`}
            y="-40%"
            width="1"
            height="40%"
            fill="url(#line-gradient)"
          >
            <animate
              attributeName="y"
              from="-40%"
              to="100%"
              dur={flow.dur}
              begin={flow.begin}
              repeatCount="indefinite"
            />
          </rect>
        ))}

        {/* Horizontal Data Flows */}
        {mounted && hFlows.map((flow, i) => (
          <rect
            key={`h-${i}`}
            x="-40%"
            y={`${(i + 1) * 12}%`}
            width="40%"
            height="1"
            fill="url(#line-gradient-h)"
          >
            <animate
              attributeName="x"
              from="-40%"
              to="100%"
              dur={flow.dur}
              begin={flow.begin}
              repeatCount="indefinite"
            />
          </rect>
        ))}
      </svg>

      {/* Radial Vignette for Focus */}
      <div className={`absolute inset-0 ${dark ? 'bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-40' : 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.7)_100%)] opacity-30'}`} />
    </div>
  );
};

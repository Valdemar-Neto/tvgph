'use client';

import React from 'react';

interface CircuitBackgroundProps {
  dark?: boolean;
}

export const CircuitBackground = ({ dark = true }: CircuitBackgroundProps) => {
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

      {/* Animated Circuit Lines via SVG + CSS */}
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
        {[...Array(15)].map((_, i) => (
          <rect
            key={`v-${i}`}
            x={`${(i + 1) * 7.5}%`}
            y="-100%"
            width="1"
            height="40%"
            fill="url(#line-gradient)"
            className="animate-flow-v"
            style={{ 
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${10 + Math.random() * 15}s`
            }}
          />
        ))}

        {/* Horizontal Data Flows */}
        {[...Array(10)].map((_, i) => (
          <rect
            key={`h-${i}`}
            x="-100%"
            y={`${(i + 1) * 12}%`}
            width="40%"
            height="1"
            fill="url(#line-gradient-h)"
            className="animate-flow-h"
            style={{ 
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 20}s`
            }}
          />
        ))}
      </svg>

      {/* Radial Vignette for Focus */}
      <div className={`absolute inset-0 ${dark ? 'bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-40' : 'bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.7)_100%)] opacity-30'}`} />

      <style jsx>{`
        @keyframes flowV {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        @keyframes flowH {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-flow-v {
          animation: flowV linear infinite;
        }
        .animate-flow-h {
          animation: flowH linear infinite;
        }
      `}</style>
    </div>
  );
};

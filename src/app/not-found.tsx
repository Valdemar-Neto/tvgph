'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, MoveLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020A12] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="relative z-10 text-center px-4">
        {/* Error Icon/Graphic */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-[#0F172A] border border-primary/30 p-6 rounded-2xl shadow-2xl">
              <AlertTriangle className="w-16 h-16 text-primary" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-[120px] font-black text-white leading-none tracking-tighter opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
          404
        </h1>
        
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
          PROTOCOL <span className="text-primary italic">NOT FOUND</span>
        </h2>
        
        <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg font-medium leading-relaxed">
          The requested data stream or resource could not be established. 
          The connection was refused or the path is invalid.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            asChild
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-full font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Link href="/">
              <Home className="mr-2 w-4 h-4" />
              Return to Base
            </Link>
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="border-slate-800 bg-transparent text-slate-300 hover:bg-slate-900 px-8 h-12 rounded-full font-bold transition-all"
          >
            <MoveLeft className="mr-2 w-4 h-4" />
            Previous Node
          </Button>
        </div>

        {/* Technical Footer */}
        <div className="mt-16 pt-8 border-t border-slate-900 flex flex-col items-center gap-2">
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-bold">
            Error Code: ERR_PATH_NOT_ESTABLISHED
          </p>
          <div className="flex gap-4">
            <div className="w-2 h-2 rounded-full bg-primary/40 animate-ping" />
            <div className="w-2 h-2 rounded-full bg-slate-800" />
            <div className="w-2 h-2 rounded-full bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ReportCardImageProps {
  src: string;
  alt: string;
}

export function ReportCardImage({ src, alt }: ReportCardImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  const isUnoptimized = src.startsWith('/') || src.includes('.svg');

  return (
    <div className="h-48 overflow-hidden rounded-t-3xl relative">
      <Image 
        src={src} 
        alt={alt} 
        fill
        unoptimized={isUnoptimized}
        className="object-cover group-hover:scale-105 transition-transform duration-700" 
        onError={() => setOficialFallback()}
      />
    </div>
  );

  function setOficialFallback() {
    setHasError(true);
  }
}

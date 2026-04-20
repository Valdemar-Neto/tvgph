'use client';

import React, { useState } from 'react';

interface ReportCardImageProps {
  src: string;
  alt: string;
}

export function ReportCardImage({ src, alt }: ReportCardImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  return (
    <div className="h-48 overflow-hidden rounded-t-3xl relative">
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        onError={() => setHasError(true)}
      />
    </div>
  );
}

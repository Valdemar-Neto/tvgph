'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

export function LoadMoreButton({ currentLimit }: { currentLimit: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleLoadMore() {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', (currentLimit + 12).toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex justify-center pt-8 pb-12">
      <Button 
        variant="outline" 
        size="lg" 
        className="gap-2 px-8 py-6 rounded-full border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        onClick={handleLoadMore}
      >
        <ChevronDown className="h-5 w-5" />
        Carregar Mais Reports
      </Button>
    </div>
  );
}

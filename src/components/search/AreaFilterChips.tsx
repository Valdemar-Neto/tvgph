'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

const AREAS = ['TODOS', 'CURSOS', 'PROJETOS', 'EVENTOS', 'MARKETING'] as const;

export function AreaFilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentArea = searchParams.get('area') || 'TODOS';

  function handleClick(area: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (area === 'TODOS') {
      params.delete('area');
    } else {
      params.set('area', area);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {AREAS.map((area) => (
        <Button
          key={area}
          variant={currentArea === area ? 'default' : 'outline'}
          size="sm"
          className={`h-8 text-xs font-semibold rounded-full transition-all ${
            currentArea === area ? 'shadow-md' : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => handleClick(area)}
        >
          {area}
        </Button>
      ))}
    </div>
  );
}

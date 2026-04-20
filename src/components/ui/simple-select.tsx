'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SimpleSelectProps {
  options: Option[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  size?: 'sm' | 'default';
}

/**
 * Dropdown nativo Tailwind — seleciona com UM clique, sem depender do base-ui Select.
 * Use em substituição ao Select/SelectContent/SelectItem quando o base-ui causar problemas de UX.
 */
export function SimpleSelect({
  options,
  value,
  defaultValue,
  placeholder = 'Selecione...',
  className,
  onValueChange,
  disabled = false,
  size = 'default',
}: SimpleSelectProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string>(value ?? defaultValue ?? '');
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync value controlado externamente
  useEffect(() => {
    if (value !== undefined) setSelected(value);
  }, [value]);

  function handleSelect(val: string) {
    setSelected(val);
    setOpen(false);
    onValueChange?.(val);
  }

  const selectedLabel = options.find(o => o.value === selected)?.label;

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 text-sm transition-colors outline-none',
          'hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          size === 'sm' ? 'h-7' : 'h-8',
        )}
      >
        <span className={cn('flex-1 text-left truncate', !selectedLabel && 'text-muted-foreground')}>
          {selectedLabel ?? placeholder}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-150', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
          <div className="p-1">
            {options.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  'relative flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  selected === option.value && 'bg-accent/60 font-medium',
                )}
              >
                <span className="flex-1 text-left">{option.label}</span>
                {selected === option.value && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

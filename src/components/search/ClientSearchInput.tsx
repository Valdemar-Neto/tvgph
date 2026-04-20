'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function ClientSearchInput({ placeholder = "Search..." }: { placeholder?: string }) {
   const router = useRouter();
   const searchParams = useSearchParams();
   const initialQuery = searchParams.get('q') || '';
   const [query, setQuery] = useState(initialQuery);

   useEffect(() => {
      const timer = setTimeout(() => {
         const params = new URLSearchParams(searchParams.toString());
         if (query) {
            params.set('q', query);
         } else {
            params.delete('q');
         }
         router.push(`?${params.toString()}`, { scroll: false }); // Não scrolla a tela ao digitar
      }, 500);

      return () => clearTimeout(timer);
   }, [query, router, searchParams]);

   return (
      <div className="relative w-full md:w-80 shadow-sm transition-all focus-within:shadow-md rounded-md">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
         <Input
           type="text"
           placeholder={placeholder}
           className="pl-9 bg-background focus:bg-background h-10 border-muted-foreground/20"
           value={query}
           onChange={(e) => setQuery(e.target.value)}
         />
      </div>
   )
}

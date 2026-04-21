'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleLikeAction } from '@/app/actions/social';
import { toast } from 'sonner';

interface LikeButtonProps {
  reportId: string;
  initialLikes: number;
  initialIsLiked: boolean;
  variant?: 'feed' | 'detail';
}

export function LikeButton({ reportId, initialLikes, initialIsLiked, variant = 'feed' }: LikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic Update
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikes(prev => nextLiked ? prev + 1 : prev - 1);

    startTransition(async () => {
      const result = await toggleLikeAction(reportId);
      if (result.error) {
        // Rollback
        setIsLiked(isLiked);
        setLikes(likes);
        toast.error(result.error);
      }
    });
  };

  if (variant === 'detail') {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={handleToggle}
        className={cn(
          "circuit-border font-bold text-[10px] uppercase tracking-widest h-8 px-4 transition-all",
          isLiked
            ? "border-red-500/50 text-red-500 bg-red-500/5 hover:bg-red-500/10"
            : "border-primary/20 text-muted-foreground hover:text-primary hover:bg-primary/5"
        )}
      >
        <Heart className={cn("h-3 w-3 mr-2 transition-transform", isLiked && "fill-current scale-110")} />
        {isLiked ? 'LOVE' : 'SEND_SIGNAL'} <span className="ml-1 opacity-50">({likes})</span>
      </Button>
    );
  }

  return (
    <div
      onClick={handleToggle}
      className={cn(
        "flex items-center gap-1.5 h-8 px-2.5 rounded-xl transition-all cursor-pointer active:scale-95 group",
        isLiked
          ? "bg-red-50 text-red-500 shadow-sm shadow-red-100"
          : "hover:bg-slate-50 text-slate-400 hover:text-slate-600"
      )}
    >
      <Heart className={cn(
        "h-4 w-4 transition-all duration-300",
        isLiked ? "fill-current scale-110" : "group-hover:scale-110"
      )} />
      <span className={cn("text-xs font-bold", isLiked ? "text-red-600" : "text-slate-500")}>
        {likes}
      </span>
    </div>
  );
}

// Separate component for Button because detailed view uses shadcn Button
import { Button } from '@/components/ui/button';

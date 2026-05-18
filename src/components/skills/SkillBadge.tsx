import React from 'react';
import { Cpu, Users, X } from 'lucide-react';

interface SkillBadgeProps {
  name: string;
  type: 'HARD' | 'SOFT';
  onRemove?: () => void;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({ name, type, onRemove }) => {
  const isHard = type === 'HARD';

  const badgeStyles = isHard
    ? 'bg-cyan-50 text-cyan-600 border border-cyan-200 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/50'
    : 'bg-violet-50 text-violet-600 border border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/50';

  const Icon = isHard ? Cpu : Users;

  return (
    <span
      className={`text-[10px] font-extrabold uppercase rounded-lg px-2.5 py-1 inline-flex items-center gap-1 transition-all duration-200 ${badgeStyles}`}
    >
      <Icon className="h-3 w-3 flex-shrink-0" />
      <span>{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors inline-flex items-center justify-center focus:outline-none"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};

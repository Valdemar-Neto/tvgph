'use client';

import React, { useState } from 'react';
import { Sparkles, Pencil, BookOpen, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SkillBadge } from './SkillBadge';
import { SkillSelector } from './SkillSelector';
import { toast } from 'sonner';

interface Skill {
  id: string;
  name: string;
  type: 'HARD' | 'SOFT';
}

interface UserSkill {
  skill: Skill;
}

interface SkillsSectionProps {
  userId: string;
  userSkills: UserSkill[];
  onSkillsUpdated: (updatedSkills: Skill[]) => void;
}

export function SkillsSection({ userId, userSkills, onSkillsUpdated }: SkillsSectionProps) {
  const [showSelector, setShowSelector] = useState(false);

  const hardSkills = userSkills.filter(us => us.skill.type === 'HARD');
  const softSkills = userSkills.filter(us => us.skill.type === 'SOFT');
  const totalSkillsCount = userSkills.length;

  const handleSaveSkills = async (skillIds: string[]) => {
    try {
      const res = await fetch(`/api/users/${userId}/skills`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillIds }),
      });
      const data = await res.json();
      if (res.ok) {
        // The API returns { skills: UserSkill[] }
        const updatedSkills = (data.skills || []).map((us: UserSkill) => us.skill);
        onSkillsUpdated(updatedSkills);
        setShowSelector(false);
        toast.success('Skills inventory updated successfully');
      } else {
        toast.error(data.error || 'Failed to save skills');
      }
    } catch {
      toast.error('Connection error while saving skills');
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/20 dark:bg-slate-950/10">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Skills & Competencies</h3>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
              SKILL_MATRIX — {totalSkillsCount}/10 skills
            </p>
          </div>

          <Button
            variant="outline"
            className="rounded-xl h-10 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm font-bold text-slate-600 dark:text-slate-300 gap-2 px-5 hover:bg-slate-50 dark:hover:bg-slate-850"
            onClick={() => setShowSelector(true)}
          >
            <Pencil className="h-4 w-4" /> Edit Skills
          </Button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {totalSkillsCount > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Hard Skills */}
              <div className="space-y-3">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> Hard Skills
                </span>
                {hardSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {hardSkills.map(us => (
                      <SkillBadge
                        key={us.skill.id}
                        name={us.skill.name}
                        type={us.skill.type}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-semibold italic">No hard skills selected.</p>
                )}
              </div>

              {/* Soft Skills */}
              <div className="space-y-3">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-violet-600 dark:text-violet-400 flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5" /> Soft Skills
                </span>
                {softSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {softSkills.map(us => (
                      <SkillBadge
                        key={us.skill.id}
                        name={us.skill.name}
                        type={us.skill.type}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-semibold italic">No soft skills selected.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed">
              <Sparkles className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No skills added yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
                Click Edit to add your technical and team cooperation competencies.
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-xl h-9 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm font-bold text-slate-600 dark:text-slate-300 gap-1.5 px-4 hover:bg-slate-50 dark:hover:bg-slate-850"
                onClick={() => setShowSelector(true)}
              >
                Edit Skills
              </Button>
            </div>
          )}
        </div>
      </div>

      {showSelector && (
        <SkillSelector
          currentSkillIds={userSkills.map(us => us.skill.id)}
          onSave={handleSaveSkills}
          onClose={() => setShowSelector(false)}
        />
      )}
    </>
  );
}

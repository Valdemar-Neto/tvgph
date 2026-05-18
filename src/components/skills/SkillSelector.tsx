'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Skill {
  id: string;
  name: string;
  type: 'HARD' | 'SOFT';
}

interface SkillSelectorProps {
  currentSkillIds: string[];
  onSave: (skillIds: string[]) => void;
  onClose: () => void;
}

export function SkillSelector({ currentSkillIds, onSave, onClose }: SkillSelectorProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(currentSkillIds);

  useEffect(() => {
    let active = true;
    async function loadSkills() {
      try {
        const res = await fetch('/api/skills');
        const data = await res.json();
        if (res.ok && active) {
          setSkills(data.skills || []);
        } else if (active) {
          toast.error(data.error || 'Failed to load skills');
        }
      } catch {
        if (active) toast.error('Error fetching skills catalogue');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadSkills();
    return () => {
      active = false;
    };
  }, []);

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      if (selectedIds.length >= 10) {
        toast.error('Limit reached: Maximum of 10 skills allowed');
        return;
      }
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleSave = () => {
    onSave(selectedIds);
  };

  const filteredSkills = skills.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const hardSkills = filteredSkills.filter(s => s.type === 'HARD');
  const softSkills = filteredSkills.filter(s => s.type === 'SOFT');

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog Container */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none w-full max-w-lg mx-4 overflow-hidden border dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Select Skills</h2>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
              SKILL_MATRIX_CONFIG — {selectedIds.length}/10 selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-11 bg-slate-50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800 rounded-xl font-medium focus:bg-white dark:focus:bg-slate-950"
            />
          </div>

          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-6">
              {/* Hard Skills */}
              {hardSkills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                    Hard Skills
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {hardSkills.map(skill => {
                      const isChecked = selectedIds.includes(skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => handleToggle(skill.id)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-left font-semibold text-sm transition-all duration-200 ${
                            isChecked
                              ? 'border-cyan-200 bg-cyan-50/40 text-cyan-800 dark:border-cyan-800/50 dark:bg-cyan-950/20 dark:text-cyan-300'
                              : 'border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-850'
                          }`}
                        >
                          <span>{skill.name}</span>
                          <div
                            className={`h-5 w-5 rounded-md flex items-center justify-center transition-all ${
                              isChecked
                                ? 'bg-cyan-500 text-white'
                                : 'border border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Soft Skills */}
              {softSkills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                    Soft Skills
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {softSkills.map(skill => {
                      const isChecked = selectedIds.includes(skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => handleToggle(skill.id)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-left font-semibold text-sm transition-all duration-200 ${
                            isChecked
                              ? 'border-violet-200 bg-violet-50/40 text-violet-800 dark:border-violet-800/50 dark:bg-violet-950/20 dark:text-violet-300'
                              : 'border-slate-100 hover:border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-850'
                          }`}
                        >
                          <span>{skill.name}</span>
                          <div
                            className={`h-5 w-5 rounded-md flex items-center justify-center transition-all ${
                              isChecked
                                ? 'bg-violet-500 text-white'
                                : 'border border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {filteredSkills.length === 0 && (
                <div className="py-12 text-center text-slate-400 font-medium">
                  No skills found matching &ldquo;{search}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl h-11 font-bold text-slate-400 px-5"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="rounded-xl h-11 bg-primary text-white font-bold px-6 shadow-lg shadow-primary/20"
          >
            Save Skills
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

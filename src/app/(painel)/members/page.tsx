'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Users, Sparkles, RefreshCw, Mail, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SkillBadge } from '@/components/skills/SkillBadge';
import { toast } from 'sonner';

interface Skill {
  id: string;
  name: string;
  type: 'HARD' | 'SOFT';
}

interface Area {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'MEMBER' | 'MANAGER' | 'PROFESSOR';
  avatarUrl: string | null;
  bio: string | null;
  userSkills: { skill: Skill }[];
  userAreas: { area: Area }[];
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [skillsCatalog, setSkillsCatalog] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'HARD' | 'SOFT'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load skills catalog once on mount
  useEffect(() => {
    async function loadSkills() {
      try {
        const res = await fetch('/api/skills');
        const data = await res.json();
        if (res.ok) {
          setSkillsCatalog(data.skills || []);
        }
      } catch {
        // Silently handle catalog loading failures
      }
    }
    loadSkills();
  }, []);

  // Fetch filtered members dynamically
  useEffect(() => {
    let active = true;
    async function fetchMembers() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (search) queryParams.set('search', search);
        if (selectedSkillId) queryParams.set('skill', selectedSkillId);
        if (typeFilter !== 'ALL') queryParams.set('type', typeFilter);

        const res = await fetch(`/api/members?${queryParams.toString()}`);
        const data = await res.json();
        if (res.ok && active) {
          setMembers(data.members || []);
        } else if (active) {
          toast.error(data.error || 'Failed to load group members');
        }
      } catch {
        if (active) toast.error('Network connection error');
      } finally {
        if (active) setLoading(false);
      }
    }

    const delayDebounce = setTimeout(() => {
      fetchMembers();
    }, 250);

    return () => {
      active = false;
      clearTimeout(delayDebounce);
    };
  }, [search, selectedSkillId, typeFilter]);

  const handleReset = () => {
    setSearch('');
    setSelectedSkillId('');
    setTypeFilter('ALL');
  };

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    toast.success('Email copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2.5 rounded-2xl">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Team Members</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl px-1">
            Browse and discover team competencies across all research areas. Filter by technical skills or explore their core contributions.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col xl:flex-row gap-5 items-stretch xl:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search members by name, email, bio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-11 bg-slate-50 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800 rounded-xl font-medium focus:bg-white dark:focus:bg-slate-950 transition-all w-full text-sm"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {/* Type Toggle Pills */}
          <div className="flex bg-slate-50 dark:bg-slate-950/40 p-1 rounded-xl border border-slate-100 dark:border-slate-800 shrink-0">
            {(['ALL', 'HARD', 'SOFT'] as const).map(t => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  setSelectedSkillId(''); // Reset specific skill filter when type changes
                }}
                className={`px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all duration-200 ${
                  typeFilter === t
                    ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm border border-slate-100/10'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {t === 'ALL' ? 'All' : t === 'HARD' ? 'Hard' : 'Soft'}
              </button>
            ))}
          </div>

          {/* Skill Dropdown */}
          <select
            value={selectedSkillId}
            onChange={e => setSelectedSkillId(e.target.value)}
            className="h-11 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl px-3 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-950 transition-all w-full sm:w-56"
          >
            <option value="">Filter by Specific Skill</option>
            {typeFilter !== 'SOFT' && (
              <optgroup label="Hard Skills">
                {skillsCatalog
                  .filter(s => s.type === 'HARD')
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </optgroup>
            )}
            {typeFilter !== 'HARD' && (
              <optgroup label="Soft Skills">
                {skillsCatalog
                  .filter(s => s.type === 'SOFT')
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </optgroup>
            )}
          </select>

          {/* Reset Button */}
          {(search || selectedSkillId || typeFilter !== 'ALL') && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="h-11 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-none text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        /* Premium Skeleton Pulse Loading State */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-6 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-800 rounded" />
                  <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
              <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex gap-2">
                <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                <div className="h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                <div className="h-6 w-14 bg-slate-100 dark:bg-slate-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map(member => {
              const skills = member.userSkills.map(us => us.skill);
              const visibleSkills = skills.slice(0, 5);
              const remainingCount = skills.length - 5;

              return (
                <div
                  key={member.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:border-slate-200/50 dark:hover:border-slate-700/60 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    {/* Header: Avatar, Info, Role Badge */}
                    <div className="flex items-start justify-between gap-4 mb-4 pb-1">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 overflow-hidden relative shadow-inner flex-shrink-0">
                          <Image
                            src={
                              member.avatarUrl ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`
                            }
                            alt={member.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 text-base">
                            {member.name}
                          </h3>
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 block line-clamp-1 mt-0.5">
                            {member.email}
                          </span>
                        </div>
                      </div>

                      {/* Role Badge */}
                      <Badge
                        className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-lg border flex-shrink-0 ${
                          member.role === 'PROFESSOR'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                            : member.role === 'MANAGER'
                            ? 'bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-50 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/30'
                            : 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-50 dark:bg-cyan-950/20 dark:text-cyan-400 dark:border-cyan-900/30'
                        }`}
                      >
                        {member.role === 'PROFESSOR' ? 'PROFESSOR' : member.role}
                      </Badge>
                    </div>

                    {/* Areas of Interest */}
                    {member.userAreas && member.userAreas.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3.5">
                        {member.userAreas.map(ua => (
                          <Badge
                            key={ua.area.id}
                            variant="secondary"
                            className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-950/40 border border-slate-100/50 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-md"
                          >
                            {ua.area.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Biography */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed mb-6 min-h-[32px]">
                      {member.bio || 'This researcher has not updated their laboratory logs yet.'}
                    </p>
                  </div>

                  {/* Skills Section */}
                  <div className="border-t border-slate-50 dark:border-slate-800/80 pt-4 mt-auto space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" /> Active Core Skills
                      </span>

                      {skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {visibleSkills.map(skill => (
                            <SkillBadge
                              key={skill.id}
                              name={skill.name}
                              type={skill.type}
                            />
                          ))}
                          {remainingCount > 0 && (
                            <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold rounded-lg px-2 py-1 inline-flex items-center">
                              +{remainingCount} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-left py-2 italic text-slate-400 dark:text-slate-500 text-xs font-semibold">
                          No competencies registered yet.
                        </div>
                      )}
                    </div>

                    {/* Call to Action Button */}
                    <div className="pt-2">
                      <button
                        onClick={() => handleCopyEmail(member.email, member.id)}
                        className="w-full flex items-center justify-center gap-2 h-10 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-extrabold tracking-wide uppercase text-slate-600 dark:text-slate-300 transition-all duration-200"
                      >
                        {copiedId === member.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3]" />
                            <span>Email Copied!</span>
                          </>
                        ) : (
                          <>
                            <Mail className="h-3.5 w-3.5" />
                            <span>Contact Scientist</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {members.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-16 text-center shadow-sm max-w-md mx-auto">
              <div className="h-12 w-12 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-350 dark:text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1">No group members found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
                No matching members fit your active search string or chosen skill filters. Try resetting the criteria.
              </p>
              <Button
                onClick={handleReset}
                className="mt-6 rounded-xl h-10 bg-primary text-white font-bold px-6 shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

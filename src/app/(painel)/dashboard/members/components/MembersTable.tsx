'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { SimpleSelect } from '@/components/ui/simple-select';
import { updateUserRoleAction, approveUserAction } from '@/app/actions/manager';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, UserCheck, X, Check, Trash2 } from 'lucide-react';
import { deleteUserAction } from '@/app/actions/manager';

interface Area { id: string; name: string; }
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  avatarUrl: string | null;
  userAreas: { area: Area }[];
}

export function MembersTable({ users, areas, currentRole }: { users: User[]; areas: Area[]; currentRole: string }) {
  const [approveTarget, setApproveTarget] = useState<User | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const sorted = [...users].sort((a, b) => {
    if (!a.active && b.active) return -1;
    if (a.active && !b.active) return 1;
    return 0;
  });

  function toggleArea(areaId: string) {
    setSelectedAreas(prev =>
      prev.includes(areaId) ? prev.filter(id => id !== areaId) : [...prev, areaId]
    );
  }

  async function handleToggleStatus(userId: string, currentActive: boolean, role: string) {
    const res = await updateUserRoleAction(userId, !currentActive, role as 'MEMBER' | 'MANAGER' | 'PROFESSOR');
    if (res.error) toast.error(res.error);
    else toast.success(currentActive ? 'Member deactivated.' : 'Member reactivated!');
  }

  async function handleToggleRole(userId: string, active: boolean, newRole: string) {
    const res = await updateUserRoleAction(userId, active, newRole as 'MEMBER' | 'MANAGER' | 'PROFESSOR');
    if (res.error) toast.error(res.error);
    else toast.success(`Permission changed to ${newRole}.`);
  }

  async function handleDeleteUser(user: User) {
    if (!confirm(`Are you sure you want to PERMANENTLY DELETE the researcher ${user.name}? This action cannot be undone.`)) return;

    const res = await deleteUserAction(user.id);
    if (res.error) toast.error(res.error);
    else toast.success('User successfully removed from database.');
  }

  async function handleApprove() {
    if (!approveTarget || selectedAreas.length === 0) {
      toast.error('Select at least one area before approving.');
      return;
    }
    setApprovingId(approveTarget.id);
    const res = await approveUserAction(approveTarget.id, selectedAreas);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`${approveTarget.name} approved successfully!`);
      setApproveTarget(null);
      setSelectedAreas([]);
    }
    setApprovingId(null);
  }

  function closeModal() {
    setApproveTarget(null);
    setSelectedAreas([]);
  }

  const pendingCount = users.filter(u => !u.active).length;

  return (
    <>
      <div className="space-y-8">
        {/* RH Telemetry Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Active Members</h3>
              <p className="text-2xl font-black text-slate-900 leading-none">
                {users.filter(u => u.active).length} <span className="text-slate-300 font-medium text-lg">/ {users.length}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pending Approval</h3>
              <p className="text-2xl font-black text-slate-900 leading-none">
                {pendingCount} <span className="text-slate-300 font-medium text-sm">CANDIDATES</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Operation Rate</h3>
              <p className="text-2xl font-black text-slate-900 leading-none">
                {users.length > 0 ? Math.round((users.filter(u => u.active).length / users.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 border-b border-slate-100">
                <TableHead className="p-6 text-[10px] uppercase font-black tracking-widest text-slate-400">Researcher Entity</TableHead>
                <TableHead className="p-6 text-[10px] uppercase font-black tracking-widest text-slate-400 hidden xl:table-cell">Identity / E-mail</TableHead>
                <TableHead className="p-6 text-[10px] uppercase font-black tracking-widest text-slate-400">Research Area(s)</TableHead>
                <TableHead className="p-6 text-[10px] uppercase font-black tracking-widest text-slate-400">Access Tier</TableHead>
                <TableHead className="p-6 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Status / Command</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(user => (
                <TableRow
                  key={user.id}
                  className={cn(
                    "transition-all duration-300",
                    !user.active
                      ? user.userAreas.length === 0
                        ? 'bg-amber-50/30'
                        : 'bg-slate-50/30 opacity-60 grayscale-[0.5]'
                      : 'bg-white opacity-100'
                  )}
                >
                  <TableCell className="p-6 font-medium">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 shadow-sm overflow-hidden",
                        user.active ? "border-primary/20 bg-primary/5" : "border-slate-100 bg-slate-50"
                      )}>
                        <div className="h-full w-full relative">
                          <Image
                            src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                            alt={user.name}
                            fill
                            unoptimized={!user.avatarUrl}
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "font-black text-sm uppercase tracking-tight transition-colors",
                          user.active ? "text-slate-900" : "text-slate-400"
                        )}>
                          {user.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest xl:hidden">
                          {user.email.split('@')[0]}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-6 text-muted-foreground text-xs font-mono hidden xl:table-cell">
                    {user.email}
                  </TableCell>
                  <TableCell className="p-6">
                    {user.userAreas.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {user.userAreas.map(ua => (
                          <Badge key={ua.area.id} variant="secondary" className="px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter bg-slate-100/50 border-slate-100 text-slate-500 rounded">
                            {ua.area.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="outline" className="px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter border-amber-200 text-amber-600 bg-amber-50">
                        PENDING_AREA
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="p-6">
                    {user.active ? (
                      <SimpleSelect
                        value={user.role}
                        options={[
                          { label: 'Member', value: 'MEMBER' },
                          { label: 'Manager', value: 'MANAGER' },
                          { label: 'Main Manager', value: 'PROFESSOR' }
                        ]}
                        onValueChange={(val) => handleToggleRole(user.id, user.active, val)}
                        className="w-[160px] font-bold uppercase text-[10px] tracking-widest"
                        size="sm"
                      />
                    ) : (
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest animate-pulse">
                        Awaiting Activation
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!user.active ? (
                        <Button
                          size="sm"
                          className="h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[9px] bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 gap-2"
                          onClick={() => { setApproveTarget(user); setSelectedAreas([]); }}
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Approve Access
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 border-2",
                              user.active
                                ? "border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-200"
                                : "border-slate-100 text-slate-300"
                            )}
                            onClick={() => handleToggleStatus(user.id, user.active, user.role)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                            ACTIVE
                          </Button>

                          {currentRole === 'PROFESSOR' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-xl text-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              onClick={() => handleDeleteUser(user)}
                              title="Permanently delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-200 italic font-medium uppercase text-xs tracking-widest">
                    No researcher entities found in database.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Approval Modal */}
        {approveTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          >
            <div
              className="bg-background border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Approve Access</h2>
                    <p className="text-sm text-muted-foreground">Define areas before activation.</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="rounded-md p-1.5 hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Candidate Info */}
              <div className="rounded-lg border p-3 bg-muted/20 space-y-1 text-sm">
                <p><span className="text-muted-foreground">Name:</span> <strong>{approveTarget.name}</strong></p>
                <p><span className="text-muted-foreground">Email:</span> {approveTarget.email}</p>
              </div>

              {/* Area Checkboxes */}
              <div className="space-y-2">
                <label className="text-sm font-medium block">
                  Areas of Activity *{' '}
                  {selectedAreas.length > 0 && (
                    <span className="text-xs text-emerald-600 font-normal ml-1">
                      ({selectedAreas.length} selected)
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {areas.map(area => {
                    const checked = selectedAreas.includes(area.id);
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => toggleArea(area.id)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium text-left transition-all duration-150 ${checked
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background border-border hover:border-primary/50 hover:bg-muted/40'
                          }`}
                      >
                        <div className={`h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${checked ? 'bg-primary-foreground border-primary-foreground' : 'border-muted-foreground/40'
                          }`}>
                          {checked && <Check className="h-3 w-3 text-primary" />}
                        </div>
                        {area.name}
                      </button>
                    );
                  })}
                </div>
                {selectedAreas.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    Select at least one area — the member will not be able to create reports without it.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  onClick={handleApprove}
                  disabled={selectedAreas.length === 0 || approvingId === approveTarget.id}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {approvingId === approveTarget.id ? 'Approving...' : 'Approve and Activate'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

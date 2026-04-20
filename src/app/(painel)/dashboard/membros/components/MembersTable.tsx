'use client';

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { SimpleSelect } from '@/components/ui/simple-select';
import { updateUserRoleAction, approveUserAction } from '@/app/actions/manager';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, UserCheck, X, Check } from 'lucide-react';

interface Area { id: string; name: string; }
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  userAreas: { area: Area }[];
}

export function MembersTable({ users, areas }: { users: User[]; areas: Area[] }) {
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
      const res = await updateUserRoleAction(userId, !currentActive, role as 'MEMBER' | 'MANAGER');
      if (res.error) toast.error(res.error);
      else toast.success(currentActive ? 'Membro desativado.' : 'Membro reativado!');
   }

   async function handleToggleRole(userId: string, active: boolean, newRole: string) {
      const res = await updateUserRoleAction(userId, active, newRole as 'MEMBER' | 'MANAGER');
      if (res.error) toast.error(res.error);
      else toast.success(`Permissão alterada para ${newRole}.`);
   }

   async function handleApprove() {
      if (!approveTarget || selectedAreas.length === 0) {
        toast.error('Selecione ao menos uma área antes de aprovar.');
        return;
      }
      setApprovingId(approveTarget.id);
      const res = await approveUserAction(approveTarget.id, selectedAreas);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`${approveTarget.name} aprovado com sucesso!`);
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
        {pendingCount > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">
              {pendingCount} {pendingCount === 1 ? 'cadastro aguarda' : 'cadastros aguardam'} aprovação do líder.
            </span>
          </div>
        )}

        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[200px]">Membro</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Área(s)</TableHead>
                <TableHead>Nível de Acesso</TableHead>
                <TableHead className="text-right">Status / Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(user => (
                <TableRow
                  key={user.id}
                  className={!user.active ? 'bg-amber-50/30 dark:bg-amber-900/10 border-l-2 border-l-amber-400' : ''}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                  <TableCell>
                    {user.userAreas.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.userAreas.map(ua => (
                          <Badge key={ua.area.id} variant="secondary" className="text-[10px] font-mono">
                            {ua.area.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">Sem área</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.active ? (
                      <SimpleSelect
                        value={user.role}
                        options={[
                          { label: 'Membro', value: 'MEMBER' },
                          { label: 'Gerente/Líder', value: 'MANAGER' }
                        ]}
                        onValueChange={(val) => handleToggleRole(user.id, user.active, val)}
                        className="w-[140px]"
                        size="sm"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground italic">— aguardando —</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {!user.active ? (
                      <Button
                        size="sm"
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        onClick={() => { setApproveTarget(user); setSelectedAreas([]); }}
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Aprovar Acesso
                      </Button>
                    ) : (
                      <div className="flex items-center justify-end gap-3">
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-400 gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Ativo
                        </Badge>
                        <Switch
                          checked={user.active}
                          onCheckedChange={() => handleToggleStatus(user.id, user.active, user.role)}
                        />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhum pesquisador encontrado na base.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modal de Aprovação com checkboxes nativos */}
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
                    <h2 className="text-lg font-bold">Aprovar Acesso</h2>
                    <p className="text-sm text-muted-foreground">Defina as áreas antes de liberar.</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="rounded-md p-1.5 hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Info do candidato */}
              <div className="rounded-lg border p-3 bg-muted/20 space-y-1 text-sm">
                <p><span className="text-muted-foreground">Nome:</span> <strong>{approveTarget.name}</strong></p>
                <p><span className="text-muted-foreground">Email:</span> {approveTarget.email}</p>
              </div>

              {/* Checkboxes de área */}
              <div className="space-y-2">
                <label className="text-sm font-medium block">
                  Áreas de Atuação *{' '}
                  {selectedAreas.length > 0 && (
                    <span className="text-xs text-emerald-600 font-normal ml-1">
                      ({selectedAreas.length} selecionada{selectedAreas.length > 1 ? 's' : ''})
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
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium text-left transition-all duration-150 ${
                          checked
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-background border-border hover:border-primary/50 hover:bg-muted/40'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                          checked ? 'bg-primary-foreground border-primary-foreground' : 'border-muted-foreground/40'
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
                    Selecione ao menos uma área — o membro não conseguirá criar reports sem ela.
                  </p>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                  onClick={handleApprove}
                  disabled={selectedAreas.length === 0 || approvingId === approveTarget.id}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {approvingId === approveTarget.id ? 'Aprovando...' : 'Aprovar e Ativar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
   );
}

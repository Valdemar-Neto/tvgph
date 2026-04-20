'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toggleAttendanceAction } from '@/app/actions/manager';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { UserCheck, UserX, Users2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AttendanceTable({ attendances }: { attendances: { id: string, present: boolean, user: { name: string, email: string, avatarUrl: string | null } }[] }) {
   const totalPresent = attendances.filter(a => a.present).length;
   const totalStudents = attendances.length;

   async function handleToggle(id: string, newStatus: boolean, studentName: string) {
      const res = await toggleAttendanceAction(id, newStatus);
      if (res.error) toast.error(res.error);
      else {
         toast.success(newStatus ? `${studentName} marked Presence!` : `Absence recorded for ${studentName}.`);
      }
   }

   return (
      <div className="space-y-6">
         {/* Summary Header */}
         <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Users2 className="h-6 w-6" />
               </div>
               <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Engagement</h3>
                  <p className="text-2xl font-black text-slate-900 leading-none">
                     {totalPresent} <span className="text-slate-300 font-medium text-lg">/ {totalStudents} Present</span>
                  </p>
               </div>
            </div>

            <div className="flex gap-2">
               <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Real-Time Agenda</span>
               </div>
            </div>
         </div>

         {/* Table Row */}
         <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <Table>
               <TableHeader>
                  <TableRow className="bg-slate-50/50 border-b border-slate-100">
                     <TableHead className="p-6 text-[10px] uppercase font-black tracking-widest text-slate-400">Researcher Entity</TableHead>
                     <TableHead className="p-6 text-[10px] uppercase font-black tracking-widest text-slate-400 hidden md:table-cell">Identity / E-mail</TableHead>
                     <TableHead className="p-6 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Attendance Command</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {attendances.map(att => (
                     <TableRow
                        key={att.id}
                        className={cn(
                           "transition-all duration-300",
                           !att.present ? "bg-slate-50/30 opacity-60 grayscale-[0.5]" : "bg-white opacity-100"
                        )}
                     >
                        <TableCell className="p-6">
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                 "h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 overflow-hidden shadow-sm",
                                 att.present ? "border-emerald-200 bg-emerald-50" : "border-slate-100 bg-slate-50"
                              )}>
                                 <img
                                    src={att.user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${att.user.name}`}
                                    alt={att.user.name}
                                    className="h-full w-full object-cover"
                                 />
                              </div>
                              <div className="flex flex-col">
                                 <span className={cn(
                                    "font-black text-sm uppercase tracking-tight transition-colors",
                                    att.present ? "text-slate-900" : "text-slate-400"
                                 )}>
                                    {att.user.name}
                                 </span>
                                 <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest md:hidden">
                                    {att.user.email.split('@')[0]}
                                 </span>
                              </div>
                           </div>
                        </TableCell>
                        <TableCell className="p-6 hidden md:table-cell">
                           <span className="text-xs font-bold text-slate-400 font-mono italic">
                              {att.user.email}
                           </span>
                        </TableCell>
                        <TableCell className="p-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                              {/* Absent Button */}
                              <Button
                                 variant={!att.present ? "destructive" : "outline"}
                                 size="sm"
                                 className={cn(
                                    "px-4 h-10 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all duration-300",
                                    !att.present ? "shadow-lg shadow-rose-200" : "border-slate-100 text-slate-300 hover:text-rose-500 hover:border-rose-200"
                                 )}
                                 onClick={() => !att.present ? null : handleToggle(att.id, false, att.user.name)}
                              >
                                 <UserX className="h-3.5 w-3.5 mr-2" />
                                 ABSENT
                              </Button>

                              {/* Present Button */}
                              <Button
                                 variant={att.present ? "default" : "outline"}
                                 size="sm"
                                 className={cn(
                                    "px-4 h-10 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all duration-300",
                                    att.present
                                       ? "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                                       : "border-slate-100 text-slate-300 hover:text-emerald-500 hover:border-emerald-200"
                                 )}
                                 onClick={() => att.present ? null : handleToggle(att.id, true, att.user.name)}
                              >
                                 <UserCheck className="h-3.5 w-3.5 mr-2" />
                                 PRESENT
                              </Button>
                           </div>
                        </TableCell>
                     </TableRow>
                  ))}
                  {attendances.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={3} className="h-32 text-center text-slate-300 italic font-medium">
                           No research entities linked to this agenda.
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </div>
      </div>
   );
}

'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toggleAttendanceAction } from '@/app/actions/manager';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export function AttendanceTable({ attendances }: { attendances: any[] }) {
   async function handleToggle(id: string, currentStatus: boolean, studentName: string) {
      const res = await toggleAttendanceAction(id, !currentStatus);
      if (res.error) toast.error(res.error);
      else toast.success(!currentStatus ? `${studentName} marcou Presença!` : `Falta registrada para ${studentName}.`);
   }

   return (
      <div className="rounded-md border bg-card">
         <Table>
            <TableHeader>
               <TableRow className="bg-muted/30">
                  <TableHead className="w-[300px]">Nome do Pesquisador</TableHead>
                  <TableHead>Área / E-mail</TableHead>
                  <TableHead className="text-right">Ação (Falta / Presente)</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {attendances.map(att => (
                  <TableRow key={att.id}>
                     <TableCell className="font-bold">{att.user.name}</TableCell>
                     <TableCell className="text-muted-foreground">{att.user.email}</TableCell>
                     <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-3">
                           {att.present ? (
                              <Badge variant="default" className="text-[10px] bg-green-500 hover:bg-green-600">Presente</Badge>
                           ) : (
                              <Badge variant="destructive" className="text-[10px]">Falta</Badge>
                           )}
                           <Switch 
                              checked={att.present} 
                              onCheckedChange={() => handleToggle(att.id, att.present, att.user.name)} 
                           />
                        </div>
                     </TableCell>
                  </TableRow>
               ))}
               {attendances.length === 0 && (
                  <TableRow>
                     <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        Nenhum pesquisador encontrado nesta pauta.
                     </TableCell>
                  </TableRow>
               )}
            </TableBody>
         </Table>
      </div>
   );
}

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createMeetingAction } from '@/app/actions/manager';
import { toast } from 'sonner';
import { CalendarPlus } from 'lucide-react';

export function CreateMeetingForm() {
  const [loading, setLoading] = useState(false);

  async function handleAction(formData: FormData) {
     setLoading(true);
     const res = await createMeetingAction(formData);
     setLoading(false);
     
     if (res.error) {
         toast.error(res.error);
     } else {
         toast.success('Meeting agenda registered! Presence table generated.');
         // O revalidatePath já existe no server mode para forçar F5 na pagina.
     }
  }

  return (
    <form action={handleAction} className="flex flex-col md:flex-row gap-4 items-end bg-card border rounded-lg p-5">
       <div className="w-full md:flex-1">
         <label className="text-sm font-semibold mb-2 block">Physical Meeting Agenda</label>
         <Input name="title" required placeholder="Ex: Senior Project Update" />
       </div>
       <div className="w-full md:w-[200px]">
         <label className="text-sm font-semibold mb-2 block">Date</label>
         <Input type="date" name="date" required />
       </div>
       <Button disabled={loading} type="submit" className="w-full md:w-auto h-10 mt-2 md:mt-0 font-medium whitespace-nowrap">
          <CalendarPlus className="mr-2 h-4 w-4" />
          {loading ? 'Processing...' : 'Open Attendance Sheet'}
       </Button>
    </form>
  );
}

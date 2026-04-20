import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingMeusReports() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm">
             <div className="p-6 pb-4 flex justify-between items-start border-b">
                <div className="space-y-2">
                   <Skeleton className="h-5 w-40" />
                   <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
             </div>
             <div className="p-6 pt-4 space-y-3">
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-[85%]" />
               <div className="pt-4">
                  <Skeleton className="h-8 w-full" />
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingTvGPH() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="flex gap-2 mb-6">
         <Skeleton className="h-8 w-24 rounded-full" />
         <Skeleton className="h-8 w-24 rounded-full" />
         <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="flex flex-col space-y-1.5 p-6 pb-2 border-b bg-muted/10">
              <div className="flex items-center gap-3">
                 <Skeleton className="h-10 w-10 rounded-full" />
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                 </div>
              </div>
            </div>
            <div className="p-6 pt-4 space-y-3">
               <Skeleton className="h-4 w-full" />
               <Skeleton className="h-4 w-[90%]" />
               <Skeleton className="h-4 w-[60%]" />
               <div className="pt-4 flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

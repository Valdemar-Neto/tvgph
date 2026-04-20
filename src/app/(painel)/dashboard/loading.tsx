import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
         {[1, 2, 3, 4].map(i => (
            <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-2">
               <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
               </div>
               <Skeleton className="h-8 w-16" />
               <Skeleton className="h-3 w-32" />
            </div>
         ))}
      </div>

      <div className="mt-8 rounded-xl border p-6">
         <Skeleton className="h-6 w-48 mb-4 border-b pb-4" />
         <Skeleton className="h-[300px] w-full mt-4" />
      </div>
    </div>
  )
}

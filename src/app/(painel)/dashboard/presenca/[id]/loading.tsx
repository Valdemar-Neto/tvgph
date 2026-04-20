import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingChamada() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Skeleton className="h-9 w-40" />
      <div>
        <Skeleton className="h-10 w-80 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="rounded-xl border overflow-hidden">
        <div className="p-4 border-b bg-muted/10">
          <Skeleton className="h-5 w-48" />
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 border-b last:border-0">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

import { cn } from "@/lib/utils";

export function Skeleton({ className, style }) {
  return (
    <div
      className={cn("animate-pulse rounded-md", className)}
      style={{ background: "var(--surface-2)", ...style }}
    />
  );
}

export function SkeletonText({ width = "100%", height = 12, className }) {
  return (
    <Skeleton
      className={className}
      style={{ width, height, borderRadius: 6 }}
    />
  );
}

export function SkeletonAvatar({ size = 36 }) {
  return (
    <Skeleton style={{ width: size, height: size, borderRadius: "50%" }} />
  );
}

export function SkeletonKpiCard() {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-2">
          <SkeletonText width={80} height={10} />
          <SkeletonText width={64} height={22} />
        </div>
        <Skeleton style={{ width: 40, height: 40, borderRadius: 12 }} />
      </div>
      <SkeletonText width={100} height={10} />
    </div>
  );
}

export function SkeletonTableRows({ rows = 6, columns = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: columns }).map((__, c) => (
            <td key={c}>
              {c === 0 ? (
                <div className="flex items-center gap-3">
                  <SkeletonAvatar size={32} />
                  <div className="space-y-1.5">
                    <SkeletonText width={120} height={11} />
                    <SkeletonText width={70} height={9} />
                  </div>
                </div>
              ) : (
                <SkeletonText width={c % 2 === 0 ? 90 : 60} height={11} />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card p-5 space-y-4">
      <SkeletonText width={140} height={13} />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <SkeletonText width="35%" height={10} />
            <SkeletonText width="25%" height={10} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;
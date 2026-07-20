const EmailSkeleton = ({
  rows = 8,
}) => {
  return (
    <div
      className="space-y-2"
      aria-label="Loading emails"
      aria-busy="true"
    >
      {Array.from({
        length: rows,
      }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-lg border border-white/10 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded bg-white/10" />

            <div className="h-9 w-9 rounded-full bg-white/10" />

            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-white/10" />

              <div className="h-3 w-3/4 rounded bg-white/10" />

              <div className="h-3 w-1/2 rounded bg-white/5" />
            </div>

            <div className="h-3 w-14 rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmailSkeleton;
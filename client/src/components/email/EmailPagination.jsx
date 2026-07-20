const EmailPagination = ({
  pagination,
  onPageChange,
  disabled = false,
}) => {
  if (!pagination) {
    return null;
  }

  const {
    page = 1,
    total = 0,
    totalPages = 0,
    hasNextPage,
    hasPreviousPage,
  } = pagination;

  if (total === 0) {
    return null;
  }

  const canGoPrevious =
    hasPreviousPage ??
    page > 1;

  const canGoNext =
    hasNextPage ??
    page < totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
      <div className="text-sm text-gray-400">
        {total.toLocaleString()} email
        {total === 1 ? "" : "s"}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={
            disabled ||
            !canGoPrevious
          }
          onClick={() =>
            onPageChange(page - 1)
          }
          className="rounded-lg border border-white/10 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <span className="px-2 text-sm text-gray-400">
          Page {page}
          {totalPages > 0
            ? ` of ${totalPages}`
            : ""}
        </span>

        <button
          type="button"
          disabled={
            disabled ||
            !canGoNext
          }
          onClick={() =>
            onPageChange(page + 1)
          }
          className="rounded-lg border border-white/10 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmailPagination;
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Archive as ArchiveIcon,
  RefreshCw,
} from "lucide-react";

import emailAPI from "@/api/email.api";

import EmailList from "@/components/email/EmailList";
import EmailPreview from "@/components/email/EmailPreview";

const PAGE_SIZE = 25;

function getEmails(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.emails)) {
    return data.emails;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.emails)) {
    return data.data.emails;
  }

  return [];
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Unable to load archived emails."
  );
}

export default function Archive() {
  const [page, setPage] = useState(1);

  const [selectedEmails, setSelectedEmails] =
    useState([]);

  const [selectedEmail, setSelectedEmail] =
    useState(null);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "emails",
      "archive",
      page,
      PAGE_SIZE,
    ],

    queryFn: () =>
      emailAPI.getArchive({
        page,
        limit: PAGE_SIZE,
      }),

    placeholderData: (previousData) =>
      previousData,

    staleTime: 30_000,

    refetchOnWindowFocus: false,
  });

  const emails = getEmails(data);

  const pagination =
    data?.pagination ||
    data?.data?.pagination ||
    null;

  const currentPage =
    Number(
      pagination?.page ||
        pagination?.currentPage ||
        page
    ) || page;

  const totalPages =
    Number(
      pagination?.totalPages ||
        pagination?.pages
    ) || 0;

  const total =
    Number(
      pagination?.total ||
        pagination?.count ||
        pagination?.totalItems
    ) || emails.length;

  const hasPreviousPage =
    pagination?.hasPreviousPage ??
    currentPage > 1;

  const hasNextPage =
    pagination?.hasNextPage ??
    (totalPages > 0
      ? currentPage < totalPages
      : emails.length === PAGE_SIZE);

  const handleToggleSelect = (id) => {
    setSelectedEmails((previous) =>
      previous.includes(id)
        ? previous.filter(
            (emailId) => emailId !== id
          )
        : [...previous, id]
    );
  };

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
  };

  const handlePageChange = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage === page ||
      isFetching
    ) {
      return;
    }

    if (
      totalPages > 0 &&
      nextPage > totalPages
    ) {
      return;
    }

    setSelectedEmail(null);
    setSelectedEmails([]);
    setPage(nextPage);
  };

  if (isError && !data) {
    return (
      <div
        role="alert"
        className="flex min-h-[360px] items-center justify-center rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20"
      >
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
            <ArchiveIcon size={22} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-red-700 dark:text-red-400">
            Failed to load archive
          </h2>

          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {getErrorMessage(error)}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                isFetching
                  ? "animate-spin"
                  : ""
              }
            />

            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-180px)] min-h-[500px] min-w-0 overflow-hidden">
      {/* Archive List */}
      <section
        aria-label="Archived emails"
        className={[
          "min-h-0 min-w-0 overflow-hidden",
          "w-full lg:w-[38%] lg:max-w-[560px]",
          "lg:border-r lg:border-gray-200",
          "dark:lg:border-gray-800",
          selectedEmail
            ? "hidden lg:flex lg:flex-col"
            : "flex flex-col",
        ].join(" ")}
      >
        {/* Header */}
        <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-3 dark:border-gray-800 sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <ArchiveIcon size={18} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                Archive
              </h1>

              {!isLoading && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {total.toLocaleString()}{" "}
                  {total === 1
                    ? "message"
                    : "messages"}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh archive"
            title="Refresh"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
          >
            <RefreshCw
              size={17}
              className={
                isFetching
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </header>

        {/* List */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <EmailList
            emails={emails}
            loading={isLoading}
            fetching={isFetching}
            selectedEmails={selectedEmails}
            onToggleSelect={
              handleToggleSelect
            }
            onSelectEmail={
              handleSelectEmail
            }
          />
        </div>

        {/* Pagination */}
        {!isLoading &&
          total > 0 &&
          (hasPreviousPage ||
            hasNextPage ||
            totalPages > 1) && (
            <footer className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-t border-gray-200 px-3 dark:border-gray-800 sm:px-4">
              <button
                type="button"
                disabled={
                  !hasPreviousPage ||
                  isFetching
                }
                onClick={() =>
                  handlePageChange(
                    currentPage - 1
                  )
                }
                className="min-h-9 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 sm:text-sm"
              >
                Previous
              </button>

              <span className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                Page {currentPage}
                {totalPages > 0
                  ? ` of ${totalPages}`
                  : ""}
              </span>

              <button
                type="button"
                disabled={
                  !hasNextPage ||
                  isFetching
                }
                onClick={() =>
                  handlePageChange(
                    currentPage + 1
                  )
                }
                className="min-h-9 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 sm:text-sm"
              >
                Next
              </button>
            </footer>
          )}
      </section>

      {/* Preview */}
      <section
        aria-label="Archived email preview"
        className={[
          "min-h-0 min-w-0 flex-1 overflow-hidden",
          selectedEmail
            ? "block"
            : "hidden lg:block",
        ].join(" ")}
      >
        <EmailPreview
          email={selectedEmail}
          onClose={() =>
            setSelectedEmail(null)
          }
        />
      </section>
    </div>
  );
}
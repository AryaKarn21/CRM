import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import emailAPI from "@/api/email.api";

import EmailList from "@/components/email/EmailList";
import EmailPreview from "@/components/email/EmailPreview";

const PAGE_SIZE = 25;

export default function Inbox() {
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["emails", "inbox", page, PAGE_SIZE],

    queryFn: () =>
      emailAPI.getInbox({
        page,
        limit: PAGE_SIZE,
      }),

    placeholderData: keepPreviousData,

    staleTime: 30_000,

    refetchOnWindowFocus: false,
  });

  /*
   * Supports both possible API-client styles:
   *
   * 1. Axios interceptor already returns response.data:
   *    { success, emails, pagination }
   *
   * 2. Raw Axios response:
   *    { data: { success, emails, pagination } }
   */
  const response = data?.data ?? data;

  const emails = useMemo(() => {
    if (Array.isArray(response?.emails)) {
      return response.emails;
    }

    /*
     * Backward compatibility with the old API response,
     * which may have returned the array directly.
     */
    if (Array.isArray(response)) {
      return response;
    }

    return [];
  }, [response]);

  const pagination = response?.pagination ?? {
    page,
    limit: PAGE_SIZE,
    total: emails.length,
    totalPages: emails.length ? 1 : 0,
    hasNextPage: false,
    hasPreviousPage: page > 1,
  };

  /*
   * If the current page changes or refreshed data no longer contains
   * the opened message, close the stale preview.
   */
  useEffect(() => {
    if (!selectedEmail) {
      return;
    }

    const stillExists = emails.some(
      (email) => email.id === selectedEmail.id
    );

    if (!stillExists) {
      setSelectedEmail(null);
    }
  }, [emails, selectedEmail]);

  /*
   * Remove selections that no longer exist on the current page.
   */
  useEffect(() => {
    setSelectedEmails((previous) =>
      previous.filter((id) =>
        emails.some((email) => email.id === id)
      )
    );
  }, [emails]);

  const handleToggleSelect = (id) => {
    setSelectedEmails((previous) =>
      previous.includes(id)
        ? previous.filter((emailId) => emailId !== id)
        : [...previous, id]
    );
  };

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
  };

  const handleClosePreview = () => {
    setSelectedEmail(null);
  };

  const handlePageChange = (nextPage) => {
    const totalPages = Number(pagination.totalPages || 0);

    if (nextPage < 1) {
      return;
    }

    if (totalPages > 0 && nextPage > totalPages) {
      return;
    }

    if (nextPage === page) {
      return;
    }

    setSelectedEmail(null);
    setSelectedEmails([]);
    setPage(nextPage);
  };

  if (isError) {
    return (
      <div
        role="alert"
        className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center sm:p-8"
      >
        <h2 className="text-lg font-semibold text-red-500 sm:text-xl">
          Failed to load emails
        </h2>

        <p className="mt-2 max-w-md text-sm text-red-400">
          {error?.response?.data?.message ||
            error?.message ||
            "Unable to load inbox."}
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 min-h-10 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isFetching}
        >
          {isFetching ? "Retrying..." : "Retry"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-180px)] min-h-[500px] min-w-0 overflow-hidden">
      {/*
       * EMAIL LIST
       *
       * Mobile/tablet:
       * - Takes the full width.
       * - Hidden while a message is open.
       *
       * Desktop:
       * - Uses a responsive 38% column.
       * - No fixed 360px min-width that can cause horizontal overflow.
       */}
      <section
        aria-label="Inbox messages"
        className={[
          "min-h-0 min-w-0 overflow-hidden",
          "w-full lg:w-[38%] lg:max-w-[560px] lg:border-r",
          "border-slate-200 dark:border-slate-800",
          selectedEmail ? "hidden lg:block" : "block",
        ].join(" ")}
      >
        <EmailList
          emails={emails}
          loading={isLoading}
          fetching={isFetching}
          selectedEmails={selectedEmails}
          onToggleSelect={handleToggleSelect}
          onSelectEmail={handleSelectEmail}
        />

        {/*
         * Pagination is kept here instead of introducing another
         * component dependency before checking the existing
         * EmailPagination component contract.
         */}
        {!isLoading && pagination.total > 0 && (
          <div className="flex min-h-14 items-center justify-between gap-3 border-t border-slate-200 px-3 py-2 dark:border-slate-800 sm:px-4">
            <p className="min-w-0 truncate text-xs text-slate-500 sm:text-sm">
              {Number(pagination.total).toLocaleString()}{" "}
              {Number(pagination.total) === 1
                ? "email"
                : "emails"}
            </p>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={
                  isFetching ||
                  !(
                    pagination.hasPreviousPage ??
                    page > 1
                  )
                }
                className="min-h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:text-sm"
              >
                Previous
              </button>

              <span className="whitespace-nowrap text-xs text-slate-500 sm:text-sm">
                {page}
                {Number(pagination.totalPages) > 0
                  ? ` / ${pagination.totalPages}`
                  : ""}
              </span>

              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={
                  isFetching ||
                  !(
                    pagination.hasNextPage ??
                    page <
                      Number(pagination.totalPages || 0)
                  )
                }
                className="min-h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 sm:text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/*
       * EMAIL PREVIEW
       *
       * Mobile/tablet:
       * - Opens as the full content area.
       *
       * Desktop:
       * - Always keeps the preview pane available.
       */}
      <section
        aria-label="Email preview"
        className={[
          "min-h-0 min-w-0 flex-1 overflow-hidden",
          selectedEmail ? "block" : "hidden lg:block",
        ].join(" ")}
      >
        <EmailPreview
          email={selectedEmail}
          onClose={handleClosePreview}
        />
      </section>
    </div>
  );
}
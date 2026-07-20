import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Send,
} from "lucide-react";

import emailAPI from "@/api/email.api";

import EmailList from "@/components/email/EmailList";
import EmailPreview from "@/components/email/EmailPreview";

const PAGE_SIZE = 25;

function normalizeResponse(data) {
  if (Array.isArray(data)) {
    return {
      emails: data,
      pagination: null,
    };
  }

  return {
    emails:
      data?.emails ||
      data?.data?.emails ||
      data?.data ||
      [],

    pagination:
      data?.pagination ||
      data?.meta?.pagination ||
      data?.meta ||
      null,
  };
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Unable to load sent emails."
  );
}

export default function Sent() {
  const [page, setPage] = useState(1);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["emails", "sent", page],

    queryFn: () =>
      emailAPI.getSent({
        page,
        limit: PAGE_SIZE,
      }),

    placeholderData: (previousData) => previousData,

    staleTime: 30_000,
  });

  const { emails, pagination } = normalizeResponse(data);

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
    ) || 1;

  const totalEmails =
    Number(
      pagination?.total ||
        pagination?.totalItems ||
        pagination?.count
    ) || emails.length;

  const hasPreviousPage = currentPage > 1;

  const hasNextPage = pagination
    ? currentPage < totalPages
    : emails.length === PAGE_SIZE;

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

  const handlePreviousPage = () => {
    if (!hasPreviousPage || isFetching) {
      return;
    }

    setSelectedEmail(null);
    setSelectedEmails([]);

    setPage((previous) =>
      Math.max(1, previous - 1)
    );
  };

  const handleNextPage = () => {
    if (!hasNextPage || isFetching) {
      return;
    }

    setSelectedEmail(null);
    setSelectedEmails([]);

    setPage((previous) => previous + 1);
  };

  if (isError && !data) {
    return (
      <div className="flex min-h-[420px] items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-gray-950">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <Send size={22} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            Failed to load sent emails
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {getErrorMessage(error)}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
          >
            <RefreshCw size={16} />

            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="flex min-h-0 w-full flex-col">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Send size={18} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                Sent
              </h1>

              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                Emails you have sent
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          {!isLoading && totalEmails > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {totalEmails.toLocaleString()}{" "}
              {totalEmails === 1
                ? "message"
                : "messages"}
            </span>
          )}

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh sent emails"
            title="Refresh"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
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
        </div>
      </div>

      {/* Content */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)]">
        {/* Sent List */}
        <div className="min-w-0">
          <EmailList
            emails={emails}
            loading={isLoading}
            selectedEmails={selectedEmails}
            onToggleSelect={handleToggleSelect}
            onSelectEmail={handleSelectEmail}
          />

          {/* Pagination */}
          {!isLoading &&
            (hasPreviousPage ||
              hasNextPage ||
              totalPages > 1) && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Page {currentPage}
                  {totalPages > 1
                    ? ` of ${totalPages}`
                    : ""}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePreviousPage}
                    disabled={
                      !hasPreviousPage ||
                      isFetching
                    }
                    aria-label="Previous page"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                  >
                    <ChevronLeft size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={
                      !hasNextPage ||
                      isFetching
                    }
                    aria-label="Next page"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>
            )}
        </div>

        {/* Email Preview */}
        <div className="hidden min-w-0 xl:block">
          <div className="sticky top-0">
            <EmailPreview
              email={selectedEmail}
              onClose={() =>
                setSelectedEmail(null)
              }
            />
          </div>
        </div>

        {/* Mobile / Tablet Preview */}
        {selectedEmail && (
          <div className="fixed inset-0 z-40 overflow-y-auto bg-white dark:bg-gray-950 xl:hidden">
            <EmailPreview
              email={selectedEmail}
              onClose={() =>
                setSelectedEmail(null)
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}
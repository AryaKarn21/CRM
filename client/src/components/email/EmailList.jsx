import { memo } from "react";
import EmailCard from "./EmailCard";

const SKELETON_ROWS = 7;

function EmailList({
  emails = [],
  loading = false,
  fetching = false,
  selectedEmails = [],
  onSelectEmail,
  onToggleSelect,
}) {
  if (loading) {
    return (
      <div
        className="h-full min-h-0 overflow-hidden bg-white dark:bg-gray-950"
        aria-busy="true"
        aria-label="Loading emails"
      >
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {Array.from({ length: SKELETON_ROWS }).map(
            (_, index) => (
              <div
                key={index}
                className="animate-pulse px-3 py-4 sm:px-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-1 h-4 w-4 shrink-0 rounded bg-gray-200 dark:bg-gray-800" />

                  <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 dark:bg-gray-800" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-800" />
                      <div className="h-3 w-12 rounded bg-gray-200 dark:bg-gray-800" />
                    </div>

                    <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />

                    <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-900" />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  if (!emails.length) {
    return (
      <div className="flex min-h-[320px] h-full items-center justify-center bg-white px-6 text-center dark:bg-gray-950">
        <div className="max-w-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl dark:bg-gray-900">
            ✉
          </div>

          <h3 className="mt-4 text-base font-semibold text-gray-800 dark:text-gray-100">
            No Emails Found
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Your inbox is currently empty. New messages
            will appear here after your mailbox is
            synchronized.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-0 min-w-0 bg-white dark:bg-gray-950">
      {/*
        Background refresh indicator.

        We intentionally keep existing emails visible while React Query
        fetches newer data instead of replacing the list with a loader.
      */}
      {fetching && (
        <div
          className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-blue-100 dark:bg-blue-950"
          role="progressbar"
          aria-label="Refreshing inbox"
        >
          <div className="h-full w-1/3 animate-pulse bg-blue-600" />
        </div>
      )}

      <div
        className="h-full min-h-0 overflow-y-auto overscroll-contain"
        role="list"
        aria-label="Inbox emails"
        aria-busy={fetching}
      >
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {emails.map((email) => {
            if (!email?.id) {
              return null;
            }

            const selected = selectedEmails.includes(
              email.id
            );

            return (
              <div
                key={email.id}
                role="listitem"
                className="min-w-0"
              >
                <EmailCard
                  email={email}
                  selected={selected}
                  onSelect={() =>
                    onToggleSelect?.(email.id)
                  }
                  onOpen={() =>
                    onSelectEmail?.(email)
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default memo(EmailList);
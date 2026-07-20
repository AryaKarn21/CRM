import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useQueries,
  useQuery,
} from "@tanstack/react-query";
import {
  AlertCircle,
  Archive,
  ArrowRight,
  FileText,
  Inbox,
  Mail,
  Plus,
  RefreshCw,
  Send,
  Settings,
  Star,
  Trash2,
  TriangleAlert,
} from "lucide-react";

import emailAPI from "@/api/email.api";

const MAILBOX_QUERIES = [
  {
    key: "inbox",
    label: "Inbox",
    description: "Received messages",
    icon: Inbox,
    path: "/email/inbox",
    queryFn: () =>
      emailAPI.getInbox({
        page: 1,
        limit: 1,
      }),
  },
  {
    key: "sent",
    label: "Sent",
    description: "Sent messages",
    icon: Send,
    path: "/email/sent",
    queryFn: () =>
      emailAPI.getSent({
        page: 1,
        limit: 1,
      }),
  },
  {
    key: "drafts",
    label: "Drafts",
    description: "Saved drafts",
    icon: FileText,
    path: "/email/drafts",
    queryFn: () =>
      emailAPI.getDrafts({
        page: 1,
        limit: 1,
      }),
  },
  {
    key: "starred",
    label: "Starred",
    description: "Important messages",
    icon: Star,
    path: "/email/starred",
    queryFn: () =>
      emailAPI.getStarred({
        page: 1,
        limit: 1,
      }),
  },
  {
    key: "archive",
    label: "Archive",
    description: "Archived messages",
    icon: Archive,
    path: "/email/archive",
    queryFn: () =>
      emailAPI.getArchive({
        page: 1,
        limit: 1,
      }),
  },
  {
    key: "spam",
    label: "Spam",
    description: "Spam messages",
    icon: TriangleAlert,
    path: "/email/spam",
    queryFn: () =>
      emailAPI.getSpam({
        page: 1,
        limit: 1,
      }),
  },
  {
    key: "trash",
    label: "Trash",
    description: "Deleted messages",
    icon: Trash2,
    path: "/email/trash",
    queryFn: () =>
      emailAPI.getTrash({
        page: 1,
        limit: 1,
      }),
  },
];

function normalizeAccounts(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.accounts)) {
    return data.accounts;
  }

  if (Array.isArray(data?.data?.accounts)) {
    return data.data.accounts;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function getEmails(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.emails)) {
    return data.emails;
  }

  if (Array.isArray(data?.data?.emails)) {
    return data.data.emails;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function getTotal(data) {
  const candidates = [
    data?.pagination?.total,
    data?.pagination?.totalItems,
    data?.pagination?.count,

    data?.meta?.total,
    data?.meta?.totalItems,
    data?.meta?.count,

    data?.meta?.pagination?.total,
    data?.meta?.pagination?.totalItems,
    data?.meta?.pagination?.count,

    data?.data?.pagination?.total,
    data?.data?.pagination?.totalItems,
    data?.data?.pagination?.count,

    data?.data?.meta?.total,
    data?.data?.meta?.totalItems,
    data?.data?.meta?.count,

    data?.total,
    data?.totalItems,
    data?.count,
  ];

  const total = candidates.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      !Number.isNaN(Number(value))
  );

  if (total !== undefined) {
    return Number(total);
  }

  return getEmails(data).length;
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Unable to load email data."
  );
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function MailboxCard({
  mailbox,
  onOpen,
}) {
  const Icon = mailbox.icon;

  return (
    <button
      type="button"
      onClick={() =>
        onOpen(mailbox.path)
      }
      className="group min-w-0 rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-900 sm:p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/40 dark:text-blue-400">
          <Icon size={19} />
        </div>

        <ArrowRight
          size={17}
          className="text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500 dark:text-gray-700"
        />
      </div>

      <div className="mt-5">
        {mailbox.loading ? (
          <div className="h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        ) : mailbox.error ? (
          <div className="flex h-8 items-center gap-2 text-sm font-medium text-red-500">
            <AlertCircle size={15} />
            Unavailable
          </div>
        ) : (
          <p className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white">
            {formatNumber(
              mailbox.total
            )}
          </p>
        )}

        <h2 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
          {mailbox.label}
        </h2>

        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {mailbox.description}
        </p>
      </div>
    </button>
  );
}

function AccountStatus({
  accounts,
  loading,
  error,
  onSettings,
}) {
  const activeAccounts =
    accounts.filter(
      (account) =>
        account?.isActive !== false
    );

  const defaultAccount =
    accounts.find(
      (account) =>
        account?.isDefault === true
    );

  const defaultAddress =
    defaultAccount?.email ||
    defaultAccount?.emailAddress ||
    defaultAccount?.username ||
    null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <header className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-4 dark:border-gray-800 sm:px-5">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Email Accounts
          </h2>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Connection overview
          </p>
        </div>

        <button
          type="button"
          onClick={onSettings}
          aria-label="Open email settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
        >
          <Settings size={17} />
        </button>
      </header>

      <div className="p-4 sm:p-5">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-800" />

            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-800" />

            <div className="h-4 w-52 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0"
            />

            Unable to load email
            accounts.
          </div>
        ) : (
          <>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">
                {activeAccounts.length}
              </span>

              <span className="pb-1 text-sm text-gray-500 dark:text-gray-400">
                active
              </span>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Total accounts
                </span>

                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {accounts.length}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3 dark:border-gray-900">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Default account
                </p>

                <p className="mt-2 truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                  {defaultAddress ||
                    "Not configured"}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const navigate =
    useNavigate();

  const {
    data: accountsData,
    isLoading:
      accountsLoading,
    isError:
      accountsError,
  } = useQuery({
    queryKey: [
      "email",
      "accounts",
    ],

    queryFn: () =>
      emailAPI.getAccounts(),

    staleTime: 60_000,

    refetchOnWindowFocus:
      false,
  });

  const mailboxQueries =
    useQueries({
      queries:
        MAILBOX_QUERIES.map(
          (mailbox) => ({
            queryKey: [
              "emails",
              "dashboard",
              mailbox.key,
            ],

            queryFn:
              mailbox.queryFn,

            staleTime:
              60_000,

            refetchOnWindowFocus:
              false,

            retry: 1,
          })
        ),
    });

  const accounts = useMemo(
    () =>
      normalizeAccounts(
        accountsData
      ),
    [accountsData]
  );

  const mailboxes = useMemo(
    () =>
      MAILBOX_QUERIES.map(
        (mailbox, index) => ({
          ...mailbox,

          total: getTotal(
            mailboxQueries[index]
              ?.data
          ),

          loading:
            mailboxQueries[index]
              ?.isLoading ??
            false,

          fetching:
            mailboxQueries[index]
              ?.isFetching ??
            false,

          error:
            mailboxQueries[index]
              ?.isError ??
            false,

          errorObject:
            mailboxQueries[index]
              ?.error ??
            null,
        })
      ),
    [mailboxQueries]
  );

  const isRefreshing =
    mailboxQueries.some(
      (query) =>
        query.isFetching
    );

  const failedMailboxes =
    mailboxes.filter(
      (mailbox) =>
        mailbox.error
    );

  const primaryMailboxes =
    mailboxes.filter(
      (mailbox) =>
        [
          "inbox",
          "sent",
          "drafts",
          "starred",
        ].includes(
          mailbox.key
        )
    );

  const secondaryMailboxes =
    mailboxes.filter(
      (mailbox) =>
        [
          "archive",
          "spam",
          "trash",
        ].includes(
          mailbox.key
        )
    );

  const refreshDashboard =
    async () => {
      await Promise.all(
        mailboxQueries.map(
          (query) =>
            query.refetch()
        )
      );
    };

  return (
    <div className="mx-auto w-full max-w-[1800px]">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <Mail size={21} />
          </div>

          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-2xl">
              Email
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage messages,
              mailboxes, and connected
              email accounts.
            </p>
          </div>
        </div>

        <div className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            onClick={
              refreshDashboard
            }
            disabled={
              isRefreshing
            }
            aria-label="Refresh email dashboard"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
          >
            <RefreshCw
              size={16}
              className={
                isRefreshing
                  ? "animate-spin"
                  : ""
              }
            />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/email/compose"
              )
            }
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:flex-none"
          >
            <Plus size={17} />

            Compose
          </button>
        </div>
      </header>

      {/* Partial API Error */}
      {failedMailboxes.length >
        0 && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-400"
        >
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div className="min-w-0">
            <p className="text-sm font-semibold">
              Some mailbox data
              could not be loaded
            </p>

            <p className="mt-1 text-sm">
              {failedMailboxes
                .map(
                  (mailbox) =>
                    mailbox.label
                )
                .join(", ")}
            </p>

            {failedMailboxes.length ===
              1 && (
              <p className="mt-1 break-words text-xs opacity-80">
                {getErrorMessage(
                  failedMailboxes[0]
                    .errorObject
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="min-w-0">
          {/* Main Mailboxes */}
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Mailboxes
                </h2>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Quick access to your
                  email activity.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {primaryMailboxes.map(
                (mailbox) => (
                  <MailboxCard
                    key={
                      mailbox.key
                    }
                    mailbox={
                      mailbox
                    }
                    onOpen={
                      navigate
                    }
                  />
                )
              )}
            </div>
          </section>

          {/* Secondary Mailboxes */}
          <section className="mt-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {secondaryMailboxes.map(
                (mailbox) => (
                  <MailboxCard
                    key={
                      mailbox.key
                    }
                    mailbox={
                      mailbox
                    }
                    onOpen={
                      navigate
                    }
                  />
                )
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mt-5 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <header className="border-b border-gray-200 px-4 py-4 dark:border-gray-800 sm:px-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
            </header>

            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/email/compose"
                  )
                }
                className="flex min-h-14 items-center gap-3 rounded-xl border border-gray-200 px-4 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/40 dark:border-gray-800 dark:hover:border-blue-900 dark:hover:bg-blue-950/10"
              >
                <Send
                  size={18}
                  className="shrink-0 text-blue-600 dark:text-blue-400"
                />

                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Compose Email
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/email/templates"
                  )
                }
                className="flex min-h-14 items-center gap-3 rounded-xl border border-gray-200 px-4 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/40 dark:border-gray-800 dark:hover:border-blue-900 dark:hover:bg-blue-950/10"
              >
                <FileText
                  size={18}
                  className="shrink-0 text-blue-600 dark:text-blue-400"
                />

                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Templates
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/email/analytics"
                  )
                }
                className="flex min-h-14 items-center gap-3 rounded-xl border border-gray-200 px-4 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/40 dark:border-gray-800 dark:hover:border-blue-900 dark:hover:bg-blue-950/10"
              >
                <Mail
                  size={18}
                  className="shrink-0 text-blue-600 dark:text-blue-400"
                />

                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Email Analytics
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/email/settings"
                  )
                }
                className="flex min-h-14 items-center gap-3 rounded-xl border border-gray-200 px-4 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/40 dark:border-gray-800 dark:hover:border-blue-900 dark:hover:bg-blue-950/10"
              >
                <Settings
                  size={18}
                  className="shrink-0 text-blue-600 dark:text-blue-400"
                />

                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Email Settings
                </span>
              </button>
            </div>
          </section>
        </main>

        {/* Account Sidebar */}
        <aside className="min-w-0">
          <AccountStatus
            accounts={accounts}
            loading={
              accountsLoading
            }
            error={
              accountsError
            }
            onSettings={() =>
              navigate(
                "/email/settings"
              )
            }
          />

          <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950 sm:p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Shortcuts
            </h2>

            <div className="mt-4 space-y-1">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/email/inbox"
                  )
                }
                className="flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <Inbox
                    size={16}
                  />
                  Inbox
                </span>

                <ArrowRight
                  size={14}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/email/sent"
                  )
                }
                className="flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <Send
                    size={16}
                  />
                  Sent
                </span>

                <ArrowRight
                  size={14}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/email/drafts"
                  )
                }
                className="flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <FileText
                    size={16}
                  />
                  Drafts
                </span>

                <ArrowRight
                  size={14}
                />
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
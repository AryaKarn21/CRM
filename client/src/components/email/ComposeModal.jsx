import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  AlertCircle,
  ChevronDown,
  FileText,
  Loader2,
  Mail,
  Maximize2,
  Minimize2,
  Paperclip,
  Save,
  Send,
  X,
} from "lucide-react";

import emailAPI from "@/api/email.api";

const INITIAL_FORM = {
  accountId: "",
  to: "",
  cc: "",
  bcc: "",
  subject: "",
  body: "",
};

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function normalizeAccounts(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.accounts)) {
    return data.accounts;
  }

  return [];
}

function parseRecipients(value) {
  return String(value || "")
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateRecipients(value) {
  const recipients = parseRecipients(value);

  if (!recipients.length) {
    return false;
  }

  return recipients.every(isValidEmail);
}

export default function ComposeModal({
  open = true,
  onClose,
  initialData = null,
}) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState(INITIAL_FORM);

  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const [isExpanded, setIsExpanded] =
    useState(false);

  const [validationError, setValidationError] =
    useState("");

  const accountsQuery = useQuery({
    queryKey: ["email", "accounts"],

    queryFn: () => emailAPI.getAccounts(),

    enabled: open,

    staleTime: 60_000,
  });

  const accounts = useMemo(
    () => normalizeAccounts(accountsQuery.data),
    [accountsQuery.data]
  );

  /*
   * Initialize compose data for:
   * - New messages
   * - Reply/forward prefill later
   * - Draft editing later
   *
   * We do not mutate initialData.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialData) {
      setForm({
        accountId:
          initialData.accountId || "",

        to:
          Array.isArray(initialData.to)
            ? initialData.to.join(", ")
            : initialData.to || "",

        cc:
          Array.isArray(initialData.cc)
            ? initialData.cc.join(", ")
            : initialData.cc || "",

        bcc:
          Array.isArray(initialData.bcc)
            ? initialData.bcc.join(", ")
            : initialData.bcc || "",

        subject:
          initialData.subject || "",

        body:
          initialData.body ||
          initialData.bodyText ||
          "",
      });

      setShowCc(Boolean(initialData.cc));
      setShowBcc(Boolean(initialData.bcc));

      return;
    }

    setForm(INITIAL_FORM);
    setShowCc(false);
    setShowBcc(false);
    setValidationError("");
  }, [open, initialData]);

  /*
   * Select the default account once accounts load.
   * If there is no explicit default, use the first active account.
   */
  useEffect(() => {
    if (
      !open ||
      form.accountId ||
      !accounts.length
    ) {
      return;
    }

    const defaultAccount =
      accounts.find(
        (account) =>
          account.isDefault === true &&
          account.isActive !== false
      ) ||
      accounts.find(
        (account) =>
          account.isActive !== false
      ) ||
      accounts[0];

    if (defaultAccount?.id) {
      setForm((previous) => ({
        ...previous,
        accountId: defaultAccount.id,
      }));
    }
  }, [
    open,
    accounts,
    form.accountId,
  ]);

  const sendMutation = useMutation({
    mutationFn: (payload) =>
      emailAPI.sendEmail(payload),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["emails", "sent"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["email", "sent"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["emails", "drafts"],
        }),
      ]);

      handleSuccessfulClose();
    },
  });

  const draftMutation = useMutation({
    mutationFn: (payload) =>
      emailAPI.saveDraft(payload),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["emails", "drafts"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["email", "drafts"],
        }),
      ]);

      handleSuccessfulClose();
    },
  });

  const isSubmitting =
    sendMutation.isPending ||
    draftMutation.isPending;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (validationError) {
      setValidationError("");
    }
  };

  const buildPayload = () => {
    const payload = {
      accountId: form.accountId,
      to: parseRecipients(form.to),
      subject: form.subject.trim(),
      bodyText: form.body,
    };

    const cc = parseRecipients(form.cc);
    const bcc = parseRecipients(form.bcc);

    if (cc.length) {
      payload.cc = cc;
    }

    if (bcc.length) {
      payload.bcc = bcc;
    }

    return payload;
  };

  const validateSend = () => {
    if (!form.accountId) {
      return "Select an email account before sending.";
    }

    if (!form.to.trim()) {
      return "Add at least one recipient.";
    }

    if (!validateRecipients(form.to)) {
      return "Enter valid recipient email addresses.";
    }

    if (
      form.cc.trim() &&
      !validateRecipients(form.cc)
    ) {
      return "Enter valid Cc email addresses.";
    }

    if (
      form.bcc.trim() &&
      !validateRecipients(form.bcc)
    ) {
      return "Enter valid Bcc email addresses.";
    }

    if (!form.subject.trim()) {
      return "Add a subject before sending.";
    }

    if (!form.body.trim()) {
      return "Write a message before sending.";
    }

    return "";
  };

  const handleSend = () => {
    if (isSubmitting) {
      return;
    }

    const error = validateSend();

    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError("");

    sendMutation.mutate(buildPayload());
  };

  const handleSaveDraft = () => {
    if (isSubmitting) {
      return;
    }

    if (!form.accountId) {
      setValidationError(
        "Select an email account before saving the draft."
      );

      return;
    }

    const hasContent =
      form.to.trim() ||
      form.cc.trim() ||
      form.bcc.trim() ||
      form.subject.trim() ||
      form.body.trim();

    if (!hasContent) {
      setValidationError(
        "There is nothing to save as a draft."
      );

      return;
    }

    setValidationError("");

    draftMutation.mutate(buildPayload());
  };

  const handleSuccessfulClose = () => {
    setForm(INITIAL_FORM);
    setShowCc(false);
    setShowBcc(false);
    setValidationError("");
    setIsExpanded(false);

    onClose?.();
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setValidationError("");
    onClose?.();
  };

  if (!open) {
    return null;
  }

  const mutationError =
    sendMutation.error ||
    draftMutation.error;

  const errorMessage =
    validationError ||
    (mutationError
      ? getErrorMessage(
          mutationError,
          "Unable to process the email."
        )
      : "");

  return (
    <div
      className={[
        "fixed z-50",
        isExpanded
          ? "inset-0"
          : "inset-0 flex items-end justify-center sm:items-center sm:p-4",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="compose-email-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close compose window"
        onClick={handleClose}
        disabled={isSubmitting}
        className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-[1px]"
      />

      {/* Composer */}
      <div
        className={[
          "relative flex min-h-0 w-full flex-col overflow-hidden bg-white shadow-2xl dark:bg-gray-950",
          isExpanded
            ? "h-full rounded-none"
            : [
                "h-[min(760px,92dvh)]",
                "rounded-t-2xl",
                "sm:max-w-3xl",
                "sm:rounded-2xl",
              ].join(" "),
        ].join(" ")}
      >
        {/* Header */}
        <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 dark:border-gray-800">
          <div className="flex min-w-0 items-center gap-2">
            <Mail
              size={18}
              className="shrink-0 text-blue-600"
            />

            <h2
              id="compose-email-title"
              className="truncate text-sm font-semibold text-gray-900 dark:text-white sm:text-base"
            >
              New Message
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setIsExpanded(
                  (previous) => !previous
                )
              }
              aria-label={
                isExpanded
                  ? "Exit full screen"
                  : "Expand compose window"
              }
              title={
                isExpanded
                  ? "Exit full screen"
                  : "Expand"
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
            >
              {isExpanded ? (
                <Minimize2 size={17} />
              ) : (
                <Maximize2 size={17} />
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Close compose window"
              title="Close"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Form */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Account */}
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <label
              htmlFor="compose-account"
              className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400"
            >
              From
            </label>

            <div className="relative">
              <select
                id="compose-account"
                name="accountId"
                value={form.accountId}
                onChange={handleChange}
                disabled={
                  accountsQuery.isLoading ||
                  isSubmitting
                }
                className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 pr-10 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200"
              >
                <option value="">
                  {accountsQuery.isLoading
                    ? "Loading accounts..."
                    : "Select email account"}
                </option>

                {accounts.map((account) => (
                  <option
                    key={account.id}
                    value={account.id}
                  >
                    {account.displayName ||
                      account.emailAddress ||
                      account.email ||
                      "Email account"}
                    {account.isDefault
                      ? " — Default"
                      : ""}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            {accountsQuery.isError && (
              <p className="mt-2 text-xs text-red-500">
                {getErrorMessage(
                  accountsQuery.error,
                  "Unable to load email accounts."
                )}
              </p>
            )}
          </div>

          {/* Recipients */}
          <div className="border-b border-gray-200 dark:border-gray-800">
            <div className="flex min-w-0 items-center gap-3 px-4">
              <label
                htmlFor="compose-to"
                className="w-8 shrink-0 text-sm text-gray-500 dark:text-gray-400"
              >
                To
              </label>

              <input
                id="compose-to"
                name="to"
                type="text"
                value={form.to}
                onChange={handleChange}
                disabled={isSubmitting}
                autoComplete="off"
                placeholder="recipient@example.com"
                className="h-12 min-w-0 flex-1 border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-60 dark:text-white"
              />

              <div className="flex shrink-0 items-center gap-1">
                {!showCc && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowCc(true)
                    }
                    className="rounded px-1.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                  >
                    Cc
                  </button>
                )}

                {!showBcc && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowBcc(true)
                    }
                    className="rounded px-1.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                  >
                    Bcc
                  </button>
                )}
              </div>
            </div>

            {showCc && (
              <div className="flex min-w-0 items-center gap-3 border-t border-gray-100 px-4 dark:border-gray-900">
                <label
                  htmlFor="compose-cc"
                  className="w-8 shrink-0 text-sm text-gray-500 dark:text-gray-400"
                >
                  Cc
                </label>

                <input
                  id="compose-cc"
                  name="cc"
                  type="text"
                  value={form.cc}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="off"
                  placeholder="cc@example.com"
                  className="h-11 min-w-0 flex-1 border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-60 dark:text-white"
                />

                <button
                  type="button"
                  aria-label="Remove Cc field"
                  onClick={() => {
                    setShowCc(false);

                    setForm((previous) => ({
                      ...previous,
                      cc: "",
                    }));
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-900 dark:hover:text-gray-200"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {showBcc && (
              <div className="flex min-w-0 items-center gap-3 border-t border-gray-100 px-4 dark:border-gray-900">
                <label
                  htmlFor="compose-bcc"
                  className="w-8 shrink-0 text-sm text-gray-500 dark:text-gray-400"
                >
                  Bcc
                </label>

                <input
                  id="compose-bcc"
                  name="bcc"
                  type="text"
                  value={form.bcc}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  autoComplete="off"
                  placeholder="bcc@example.com"
                  className="h-11 min-w-0 flex-1 border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-60 dark:text-white"
                />

                <button
                  type="button"
                  aria-label="Remove Bcc field"
                  onClick={() => {
                    setShowBcc(false);

                    setForm((previous) => ({
                      ...previous,
                      bcc: "",
                    }));
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-900 dark:hover:text-gray-200"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="border-b border-gray-200 px-4 dark:border-gray-800">
            <input
              name="subject"
              type="text"
              value={form.subject}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Subject"
              className="h-12 w-full border-0 bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400 disabled:opacity-60 dark:text-white"
            />
          </div>

          {/* Message */}
          <div className="min-h-[280px] p-4">
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Write your message..."
              aria-label="Email message"
              className="min-h-[280px] w-full resize-none border-0 bg-transparent text-sm leading-7 text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-60 dark:text-gray-200"
            />
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div
            role="alert"
            className="mx-4 mb-3 flex shrink-0 items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
          >
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0"
            />

            <span className="min-w-0">
              {errorMessage}
            </span>
          </div>
        )}

        {/* Footer */}
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSend}
              disabled={
                isSubmitting ||
                accountsQuery.isLoading ||
                !accounts.length
              }
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sendMutation.isPending ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={
                isSubmitting ||
                accountsQuery.isLoading ||
                !accounts.length
              }
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
            >
              {draftMutation.isPending ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  <span className="hidden sm:inline">
                    Saving...
                  </span>
                </>
              ) : (
                <>
                  <Save size={16} />

                  <span className="hidden sm:inline">
                    Save draft
                  </span>
                </>
              )}
            </button>

            {/*
              Attachment upload is intentionally not wired yet.
              We will connect it only when we verify the backend
              upload endpoint and its multipart field names.
            */}
            <button
              type="button"
              disabled
              aria-label="Attach file"
              title="Attachments are not connected yet"
              className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-lg text-gray-400 opacity-50"
            >
              <Paperclip size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <FileText
              size={15}
              className="hidden text-gray-400 sm:block"
            />

            <span className="hidden text-xs text-gray-500 sm:inline">
              {form.body.length.toLocaleString()} characters
            </span>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="min-h-10 rounded-lg px-3 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
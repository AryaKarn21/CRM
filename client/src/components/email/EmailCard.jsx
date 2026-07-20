import { memo } from "react";
import {
  Archive,
  MoreVertical,
  Paperclip,
  Star,
  Trash2,
} from "lucide-react";

function getSenderName(email) {
  return (
    email?.fromName ||
    email?.fromAddress ||
    email?.from ||
    "Unknown sender"
  );
}

function getInitials(value) {
  const text = String(value || "?").trim();

  if (!text) {
    return "?";
  }

  return text
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function formatEmailDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  const isCurrentYear =
    date.getFullYear() === now.getFullYear();

  if (isCurrentYear) {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(date);
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function EmailCard({
  email,
  selected = false,
  onSelect,
  onOpen,
}) {
  /*
   * Backend Email model uses:
   *   isRead
   *   isStarred
   *   hasAttachments
   *   fromName
   *   fromAddress
   *   snippet
   *   deliveredAt / createdAt
   *
   * Fallbacks preserve compatibility with older frontend-shaped data.
   */
  const isRead =
    email?.isRead ?? email?.read ?? false;

  const isStarred =
    email?.isStarred ?? email?.starred ?? false;

  const hasAttachments =
    email?.hasAttachments ??
    email?.hasAttachment ??
    false;

  const sender = getSenderName(email);

  const subject =
    email?.subject?.trim() || "(No subject)";

  const preview =
    email?.snippet ||
    email?.preview ||
    email?.bodyText ||
    "";

  const dateLabel =
    formatEmailDate(
      email?.deliveredAt ||
        email?.sentAt ||
        email?.createdAt
    ) ||
    email?.time ||
    "";

  const handleOpen = () => {
    onOpen?.();
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      /*
       * Do not hijack keyboard events originating from
       * interactive controls inside the row.
       */
      if (
        event.target.closest(
          "button, input, a, select, textarea"
        )
      ) {
        return;
      }

      event.preventDefault();
      onOpen?.();
    }
  };

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open email from ${sender}: ${subject}`}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className={[
        "group relative flex min-w-0 cursor-pointer items-start gap-2 px-3 py-3",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500",
        "sm:gap-3 sm:px-4",
        selected
          ? "bg-blue-50 dark:bg-blue-950/30"
          : !isRead
            ? "bg-blue-50/40 dark:bg-blue-950/20"
            : "bg-white dark:bg-gray-950",
        "hover:bg-gray-50 dark:hover:bg-gray-900/80",
      ].join(" ")}
    >
      {/* Selection */}
      <div
        className="flex shrink-0 items-center pt-1"
        onClick={stopPropagation}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect?.()}
          aria-label={`Select email from ${sender}`}
          className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
        />
      </div>

      {/* Star indicator */}
      <button
        type="button"
        aria-label={
          isStarred
            ? "Starred email"
            : "Email is not starred"
        }
        title={
          isStarred
            ? "Starred"
            : "Not starred"
        }
        onClick={stopPropagation}
        className={[
          "mt-0.5 hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
          "sm:flex",
          isStarred
            ? "text-amber-500"
            : "text-gray-400",
        ].join(" ")}
      >
        <Star
          size={17}
          fill={
            isStarred
              ? "currentColor"
              : "none"
          }
        />
      </button>

      {/* Avatar */}
      <div
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white sm:h-10 sm:w-10 sm:text-sm"
      >
        {getInitials(sender)}
      </div>

      {/* Message */}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <h3
            className={[
              "min-w-0 flex-1 truncate text-sm",
              !isRead
                ? "font-semibold text-gray-950 dark:text-white"
                : "font-medium text-gray-700 dark:text-gray-300",
            ].join(" ")}
          >
            {sender}
          </h3>

          <div className="flex shrink-0 items-center gap-1.5">
            {isStarred && (
              <Star
                size={13}
                fill="currentColor"
                aria-label="Starred"
                className="text-amber-500 sm:hidden"
              />
            )}

            <time className="whitespace-nowrap text-[11px] text-gray-500 sm:text-xs">
              {dateLabel}
            </time>
          </div>
        </div>

        <div className="mt-1 flex min-w-0 items-center gap-1.5">
          <p
            className={[
              "min-w-0 truncate text-sm",
              !isRead
                ? "font-semibold text-gray-800 dark:text-gray-100"
                : "font-normal text-gray-600 dark:text-gray-400",
            ].join(" ")}
          >
            {subject}
          </p>

          {hasAttachments && (
            <Paperclip
              size={14}
              aria-label="Has attachments"
              className="shrink-0 text-gray-400"
            />
          )}
        </div>

        {preview && (
          <p className="mt-1 truncate text-xs leading-5 text-gray-500 dark:text-gray-500 sm:text-sm">
            {preview}
          </p>
        )}
      </div>

      {/*
       * These actions remain display-only until their backend mutations
       * are connected. They intentionally do not pretend to archive,
       * delete, or star an email.
       */}
      <div className="hidden shrink-0 items-center self-center rounded-lg bg-white shadow-sm ring-1 ring-gray-200 group-hover:flex group-focus-within:flex dark:bg-gray-900 dark:ring-gray-800">
        <button
          type="button"
          aria-label="Archive email"
          title="Archive"
          onClick={stopPropagation}
          className="flex h-8 w-8 items-center justify-center rounded-l-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          <Archive size={16} />
        </button>

        <button
          type="button"
          aria-label="Delete email"
          title="Delete"
          onClick={stopPropagation}
          className="flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
        >
          <Trash2 size={16} />
        </button>

        <button
          type="button"
          aria-label="More email actions"
          title="More actions"
          onClick={stopPropagation}
          className="flex h-8 w-8 items-center justify-center rounded-r-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
}

export default memo(EmailCard);
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import emailAPI from "@/api/email.api";

import EmailList from "@/components/email/EmailList";
import EmailPreview from "@/components/email/EmailPreview";

export default function Drafts() {
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["emails", "drafts"],
    queryFn: () => emailAPI.getDrafts(),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  const emails = Array.isArray(data)
    ? data
    : Array.isArray(data?.emails)
      ? data.emails
      : Array.isArray(data?.data)
        ? data.data
        : [];

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

  if (isError) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
            Failed to load drafts
          </h2>

          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error?.response?.data?.message ||
              error?.message ||
              "Unable to load draft emails."}
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:h-[calc(100vh-180px)] lg:flex-row lg:gap-6">
      {/* Draft List */}
      <section className="min-w-0 w-full lg:w-[38%] lg:min-w-[360px]">
        <EmailList
          emails={emails}
          loading={isLoading}
          selectedEmails={selectedEmails}
          onToggleSelect={handleToggleSelect}
          onSelectEmail={handleSelectEmail}
        />
      </section>

      {/* Draft Preview */}
      <section
        className={`min-w-0 flex-1 ${
          selectedEmail ? "block" : "hidden lg:block"
        }`}
      >
        <EmailPreview
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      </section>
    </div>
  );
}
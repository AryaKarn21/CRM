import { useMemo, useState } from "react";
import {
  Copy,
  FileText,
  Plus,
  Search,
  X,
} from "lucide-react";

/*
 * Template CRUD APIs have not been verified in the current emailAPI.
 *
 * This page therefore provides a safe UI foundation without making
 * fake backend requests. Once template endpoints exist, the local
 * template state can be replaced with React Query.
 */

const DEFAULT_TEMPLATES = [
  {
    id: "welcome",
    name: "Welcome Email",
    subject: "Welcome to our team",
    body: `Hi {{name}},

Welcome! We're glad to have you with us.

If you have any questions, please feel free to reach out.

Best regards,
{{senderName}}`,
  },
  {
    id: "follow-up",
    name: "Follow Up",
    subject: "Following up on our conversation",
    body: `Hi {{name}},

I wanted to follow up on our recent conversation.

Please let me know if you have any questions or if there is anything else I can help you with.

Best regards,
{{senderName}}`,
  },
  {
    id: "meeting",
    name: "Meeting Confirmation",
    subject: "Meeting confirmation",
    body: `Hi {{name}},

This is a confirmation for our upcoming meeting.

Date: {{date}}
Time: {{time}}

Looking forward to speaking with you.

Best regards,
{{senderName}}`,
  },
];

function TemplateCard({
  template,
  onPreview,
  onCopy,
}) {
  return (
    <article className="group flex min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <FileText size={19} />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {template.name}
            </h2>

            <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
              {template.subject}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 line-clamp-4 whitespace-pre-line text-sm leading-6 text-gray-600 dark:text-gray-400">
        {template.body}
      </p>

      <div className="mt-auto flex items-center gap-2 pt-5">
        <button
          type="button"
          onClick={() => onPreview(template)}
          className="min-h-9 flex-1 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Preview
        </button>

        <button
          type="button"
          onClick={() => onCopy(template)}
          aria-label={`Copy ${template.name}`}
          title="Copy template"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
        >
          <Copy size={16} />
        </button>
      </div>
    </article>
  );
}

export default function Templates() {
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const templates = DEFAULT_TEMPLATES;

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return templates;
    }

    return templates.filter((template) =>
      [
        template.name,
        template.subject,
        template.body,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [search, templates]);

  const handleCopy = async (template) => {
    const content = [
      `Subject: ${template.subject}`,
      "",
      template.body,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(content);

      setCopiedId(template.id);

      window.setTimeout(() => {
        setCopiedId((current) =>
          current === template.id ? null : current
        );
      }, 1500);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <FileText size={21} />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-2xl">
                Email Templates
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Reusable message templates for common
                conversations.
              </p>
            </div>
          </div>
        </div>

        {/*
         * Disabled until template CRUD endpoints are available.
         * This avoids presenting a button that silently loses data.
         */}
        <button
          type="button"
          disabled
          title="Template creation requires the template backend API"
          className="inline-flex min-h-10 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white opacity-50"
        >
          <Plus size={17} />
          New Template
        </button>
      </header>

      {/* Search */}
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={17}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search templates..."
            aria-label="Search email templates"
            className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-900 dark:hover:text-gray-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {filteredTemplates.length}{" "}
          {filteredTemplates.length === 1
            ? "template"
            : "templates"}
        </p>
      </div>

      {/* Templates */}
      {filteredTemplates.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={setSelectedTemplate}
              onCopy={handleCopy}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-950">
          <div className="max-w-sm">
            <FileText
              size={28}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
              No templates found
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              No email templates match your current
              search.
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      )}

      {/* Copy feedback */}
      {copiedId && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gray-950 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-white dark:text-gray-950"
        >
          Template copied
        </div>
      )}

      {/* Preview Modal */}
      {selectedTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="template-preview-title"
        >
          <button
            type="button"
            aria-label="Close template preview"
            onClick={() => setSelectedTemplate(null)}
            className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-[1px]"
          />

          <div className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-gray-950 sm:max-w-2xl sm:rounded-2xl">
            <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 dark:border-gray-800 sm:px-5">
              <div className="min-w-0">
                <h2
                  id="template-preview-title"
                  className="truncate text-base font-semibold text-gray-900 dark:text-white"
                >
                  {selectedTemplate.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedTemplate(null)
                }
                aria-label="Close preview"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Subject
                </p>

                <p className="mt-2 break-words text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedTemplate.subject}
                </p>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-6 dark:border-gray-900">
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-700 dark:text-gray-300">
                  {selectedTemplate.body}
                </p>
              </div>
            </div>

            <footer className="flex shrink-0 justify-end gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-800 sm:px-5">
              <button
                type="button"
                onClick={() =>
                  setSelectedTemplate(null)
                }
                className="min-h-10 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() =>
                  handleCopy(selectedTemplate)
                }
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Copy size={16} />
                Copy
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
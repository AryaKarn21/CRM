import { useState } from "react";
import {
  Search,
  RefreshCw,
  Archive,
  Trash2,
  AlertCircle,
  Star,
  Tag,
  MoreVertical,
} from "lucide-react";

export default function EmailToolbar() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
      {/* Left Actions */}
      <div className="flex items-center gap-2">
        <button className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <RefreshCw size={18} />
        </button>

        <button className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <Archive size={18} />
        </button>

        <button className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <Trash2 size={18} />
        </button>

        <button className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <AlertCircle size={18} />
        </button>

        <button className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <Star size={18} />
        </button>

        <button className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <Tag size={18} />
        </button>

        <button className="rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search emails..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
        />
      </div>
    </div>
  );
}
import { Search, Plus } from "lucide-react";

export default function ExpenseFilters({
  search, setSearch,
  category, setCategory,
  status, setStatus,
  onAddExpense,
}) {
  return (
    <div className="card p-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>

        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Salary">Salary</option>
          <option value="Travel">Travel</option>
          <option value="Marketing">Marketing</option>
          <option value="Office">Office</option>
          <option value="Utilities">Utilities</option>
          <option value="Rent">Rent</option>
        </select>

        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <button onClick={onAddExpense} className="btn btn-primary flex items-center justify-center gap-2">
          <Plus size={18} />
          Add Expense
        </button>
      </div>
    </div>
  );
}
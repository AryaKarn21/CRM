import { Upload } from "lucide-react";

const categories = [
  "Travel", "Office Supplies", "Software", "Marketing",
  "Utilities", "Salaries", "Rent", "Other",
];

const paymentMethods = [
  "Cash", "Bank Transfer", "Credit Card", "Debit Card", "Cheque", "Online Payment",
];

export default function ExpenseForm({
  register, errors, loading = false,
  onSubmit, handleSubmit, submitLabel = "Save Expense",
}) {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Expense Information</h2>
        <p className="text-sm text-gray-500 mt-1">Fill in the expense details below.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="form-label">Expense Title *</label>
          <input className="input" placeholder="Office Chairs" {...register("title")} />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="form-label">Amount *</label>
          <input type="number" className="input" placeholder="0.00" {...register("amount")} />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="form-label">Category *</label>
          <select className="input" {...register("category")}>
            <option value="">Select Category</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <div>
          <label className="form-label">Expense Date *</label>
          <input type="date" className="input" {...register("date")} />
        </div>

        <div>
          <label className="form-label">Payment Method</label>
          <select className="input" {...register("paymentMethod")}>
            {paymentMethods.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <div>
          <label className="form-label">Vendor</label>
          <input className="input" placeholder="ABC Pvt Ltd" {...register("vendor")} />
        </div>
      </div>

      <div>
        <label className="form-label">Description</label>
        <textarea rows={4} className="input" placeholder="Additional notes..." {...register("description")} />
      </div>

      <div>
        <label className="form-label">Receipt</label>
        <label className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition">
          <Upload size={32} />
          <p className="mt-3 text-sm">Upload Receipt (PDF, JPG, PNG)</p>
          <input type="file" className="hidden" />
        </label>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
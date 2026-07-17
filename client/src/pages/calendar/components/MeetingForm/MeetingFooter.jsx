import { Loader2, Save, X } from "lucide-react";

export default function MeetingFooter({
  isEditing,
  isSubmitting,
  onClose,
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-200">

      {/* Cancel Button */}
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-100 transition"
      >
        <X size={18} />
        Cancel
      </button>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save size={18} />
            {isEditing ? "Update Meeting" : "Create Meeting"}
          </>
        )}
      </button>

    </div>
  );
}
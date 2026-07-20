import clsx from "clsx";

export function Switch({
  checked = false,
  onChange,
  disabled = false,
  className = "",
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => {
        if (!disabled && onChange) {
          onChange(!checked);
        }
      }}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      style={{
        background: checked
          ? "var(--primary)"
          : "var(--border)",
      }}
    >
      <span
        className={clsx(
          "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

export default Switch;
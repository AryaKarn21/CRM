import clsx from "clsx";

export function Input({
  className = "",
  type = "text",
  ...props
}) {
  return (
    <input
      type={type}
      className={clsx(
        "w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        color: "var(--text-primary)",
      }}
      {...props}
    />
  );
}

export default Input;
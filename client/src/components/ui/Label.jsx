import clsx from "clsx";

export function Label({
  children,
  htmlFor,
  className = "",
  required = false,
  ...props
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx(
        "block text-sm font-medium mb-2",
        className
      )}
      style={{
        color: "var(--text-primary)",
      }}
      {...props}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1">*</span>
      )}
    </label>
  );
}

export default Label;
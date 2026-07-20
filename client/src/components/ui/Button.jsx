import clsx from "clsx";

const variants = {
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  outline: "btn btn-outline",
  ghost: "btn btn-ghost",
  destructive:  "btn btn-danger",
};

const sizes = {
  sm: "btn-sm",
  md: "",
  lg: "px-5 py-3 text-base",
  icon: "btn-icon",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  disabled = false,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        variants[variant],
        sizes[size],
        "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

export default Button;
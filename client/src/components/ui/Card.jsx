import clsx from "clsx";

export function Card({
  children,
  className = "",
  ...props
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border shadow-sm",
        className
      )}
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
}) {
  return (
    <div
      className={clsx(
        "px-6 py-5 border-b",
        className
      )}
      style={{
        borderColor: "var(--border)",
      }}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
}) {
  return (
    <h3
      className={clsx(
        "text-lg font-semibold",
        className
      )}
      style={{
        color: "var(--text-primary)",
      }}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
}) {
  return (
    <p
      className={clsx(
        "text-sm mt-1",
        className
      )}
      style={{
        color: "var(--text-muted)",
      }}
    >
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = "",
}) {
  return (
    <div
      className={clsx(
        "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
}) {
  return (
    <div
      className={clsx(
        "px-6 py-4 border-t flex items-center justify-end gap-3",
        className
      )}
      style={{
        borderColor: "var(--border)",
      }}
    >
      {children}
    </div>
  );
}

export default Card;
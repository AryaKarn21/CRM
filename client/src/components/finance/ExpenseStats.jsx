import {
  Receipt,
  Clock3,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function ExpenseStats({
  totalExpense = 0,
  pending = 0,
  approved = 0,
  rejected = 0,
}) {
  const stats = [
    {
      title: "Total Expense",
      value: totalExpense,
      icon: Receipt,
      color: "bg-blue-600",
    },
    {
      title: "Pending",
      value: pending,
      icon: Clock3,
      color: "bg-yellow-500",
    },
    {
      title: "Approved",
      value: approved,
      icon: CheckCircle2,
      color: "bg-green-600",
    },
    {
      title: "Rejected",
      value: rejected,
      icon: XCircle,
      color: "bg-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="card p-5 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-center">
              <div>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item.title}
                </p>

                <h2
                  className="text-3xl font-bold mt-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.value}
                </h2>
              </div>

              <div
                className={`${item.color} w-14 h-14 rounded-xl flex items-center justify-center text-white`}
              >
                <Icon size={28} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
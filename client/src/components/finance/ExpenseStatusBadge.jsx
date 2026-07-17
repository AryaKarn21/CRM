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
  const cards = [
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
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="card p-5 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {card.title}
                </p>

                <h2
                  className="text-3xl font-bold mt-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {card.value}
                </h2>
              </div>

              <div
                className={`${card.color} w-14 h-14 rounded-xl flex items-center justify-center text-white`}
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
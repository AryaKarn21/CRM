import { TrendingUp, TrendingDown } from "lucide-react";

export default function FinanceKPICard({
  title,
  value,
  icon: Icon,
  color = "bg-blue-600",
  growth = 0,
}) {
  const positive = growth >= 0;

  return (
    <div className="card p-5 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {title}
          </p>
          <h2 className="text-3xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>
            {value}
          </h2>
          <div className={`flex items-center gap-1 mt-3 ${positive ? "text-green-600" : "text-red-500"}`}>
            {positive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            <span className="text-sm font-medium">{Math.abs(growth)}%</span>
          </div>
        </div>
        <div className={`${color} w-14 h-14 rounded-xl flex items-center justify-center text-white`}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
}
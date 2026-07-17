import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  Landmark,
} from "lucide-react";

import { financeAPI } from "@/api/finance.api";
import { formatCurrency } from "@/lib/utils";

import FinanceKPICard from "@/components/finance/FinanceKPICard";
import RevenueExpenseChart from "@/components/finance/RevenueExpenseChart";
import CashFlowChart from "@/components/finance/CashFlowChart";
import ExpenseCategoryChart from "@/components/finance/ExpenseCategoryChart";
import IncomeSourceChart from "@/components/finance/IncomeSourceChart";

export default function FinanceOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["finance-overview"],
    queryFn: () => financeAPI.getOverview().then((r) => r.data),
  });

  const { data: monthlyRevenue, isLoading: chartLoading } = useQuery({
    queryKey: ["monthly-revenue"],
    queryFn: () =>
      financeAPI.getReports("revenue-by-month").then((r) => r.data),
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1
            className="text-[18px] font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Finance Overview
          </h1>

          <p
            className="text-[12px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            Real-time financial summary
          </p>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6">
        {/* ================= KPI CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <FinanceKPICard
            title="Total Revenue"
            value={
              isLoading ? "Loading..." : formatCurrency(data?.revenue || 0)
            }
            icon={TrendingUp}
            color="bg-green-600"
            growth={data?.revenueChange || 0}
          />

          <FinanceKPICard
            title="Total Expenses"
            value={
              isLoading ? "Loading..." : formatCurrency(data?.expenses || 0)
            }
            icon={Wallet}
            color="bg-red-600"
            growth={data?.expensesChange || 0}
          />

          <FinanceKPICard
            title="Net Profit"
            value={
              isLoading ? "Loading..." : formatCurrency(data?.profit || 0)
            }
            icon={DollarSign}
            color="bg-blue-600"
            growth={data?.profitChange || 0}
          />

          <FinanceKPICard
            title="Cash Balance"
            value={
              isLoading
                ? "Loading..."
                : formatCurrency(data?.cashBalance ?? data?.payables ?? 0)
            }
            icon={Landmark}
            color="bg-purple-600"
            growth={data?.cashBalanceChange || 0}
          />
        </div>

        {/* ================= CHART ROW 1 ================= */}
        <div className="grid lg:grid-cols-2 gap-6">
          <RevenueExpenseChart
            data={monthlyRevenue?.data || []}
            loading={chartLoading}
          />

          <CashFlowChart
            data={monthlyRevenue?.data || []}
            loading={chartLoading}
          />
        </div>

        {/* ================= CHART ROW 2 ================= */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ExpenseCategoryChart />

          <IncomeSourceChart />
        </div>

        {/* ================= RECENT TRANSACTIONS ================= */}
        <div className="card overflow-hidden">
          <div
            className="px-5 py-4 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <h3
              className="text-[14px] font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Recent Transactions
            </h3>
          </div>

          <div className="divide-y">
            {data?.recentTransactions?.length ? (
              data.recentTransactions.map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-5 py-3 hover:bg-[var(--surface-2)] transition-colors"
                >
                  <div>
                    <p
                      className="text-[13px] font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {tx.description}
                    </p>

                    <p
                      className="text-[11px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {tx.category} • {tx.date}
                    </p>
                  </div>

                  <span
                    className={`text-[14px] font-bold ${
                      tx.type === "income"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(Math.abs(tx.amount))}
                  </span>
                </div>
              ))
            ) : (
              <div
                className="px-5 py-10 text-center text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                No recent transactions found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
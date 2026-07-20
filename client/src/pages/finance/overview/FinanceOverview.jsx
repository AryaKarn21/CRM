import { useQuery } from "@tanstack/react-query";
import { DollarSign, Wallet, TrendingUp, Landmark } from "lucide-react";

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
    queryFn: () => financeAPI.getReports("revenue-by-month").then((r) => r.data),
  });

  return (
    <div className="animate-fade-in">
      {/*
        Header
        - Stacks vertically on small screens, sits inline from sm+ up.
        - Font size steps down on mobile so the title never wraps awkwardly
          on narrow phones (<380px).
      */}
      <div className="page-header flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 py-4">
        <div>
          <h1
            className="text-[16px] sm:text-[18px] font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Finance Overview
          </h1>
          <p
            className="text-[11px] sm:text-[12px] mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            Real-time financial summary
          </p>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6 flex flex-col gap-4 sm:gap-5 md:gap-6">
        {/*
          KPI cards
          - 1 col on phones (<640px)
          - 2 cols on tablets (640px–1279px)
          - 4 cols on laptop/desktop (1280px+)
          gap shrinks slightly on mobile to fit more on screen without
          feeling cramped.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <FinanceKPICard
            title="Total Revenue"
            value={isLoading ? "Loading..." : formatCurrency(data?.revenue || 0)}
            icon={TrendingUp}
            color="bg-green-600"
            growth={data?.revenueChange || 0}
          />
          <FinanceKPICard
            title="Total Expenses"
            value={isLoading ? "Loading..." : formatCurrency(data?.expenses || 0)}
            icon={Wallet}
            color="bg-red-600"
            growth={data?.expensesChange || 0}
          />
          <FinanceKPICard
            title="Net Profit"
            value={isLoading ? "Loading..." : formatCurrency(data?.profit || 0)}
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

        {/*
          Revenue vs Expenses + Cash Flow
          - Single column (charts stacked) below the lg breakpoint (1024px)
            so each chart keeps full width and stays readable on tablets
            and phones, where a squeezed side-by-side chart becomes
            unreadable.
          - Two columns from lg (1024px) up, i.e. laptop and desktop.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <div className="min-w-0">
            <RevenueExpenseChart data={monthlyRevenue?.data || []} loading={chartLoading} />
          </div>
          <div className="min-w-0">
            <CashFlowChart data={monthlyRevenue?.data || []} loading={chartLoading} />
          </div>
        </div>

        {/* Expense Categories + Income Sources — same stacking rule as above */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <div className="min-w-0">
            <ExpenseCategoryChart />
          </div>
          <div className="min-w-0">
            <IncomeSourceChart />
          </div>
        </div>

        {/*
          Recent Transactions
          - Row content wraps to two lines on very narrow phones instead
            of overflowing horizontally (amount drops below description).
          - overflow-x-auto as a safety net for anything that still
            doesn't wrap cleanly (e.g. long category names).
        */}
        <div className="card overflow-hidden">
          <div
            className="px-4 sm:px-5 py-3 sm:py-4 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <h3
              className="text-[13px] sm:text-[14px] font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Recent Transactions
            </h3>
          </div>

          <div className="divide-y overflow-x-auto">
            {data?.recentTransactions?.length ? (
              data.recentTransactions.map((tx, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 px-4 sm:px-5 py-3 hover:bg-[var(--surface-2)] transition-colors"
                >
                  <div className="min-w-0">
                    <p
                      className="text-[12px] sm:text-[13px] font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {tx.description}
                    </p>
                    <p
                      className="text-[10px] sm:text-[11px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {tx.category} • {tx.date}
                    </p>
                  </div>
                  <span
                    className={`text-[13px] sm:text-[14px] font-bold shrink-0 ${
                      tx.type === "income" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {formatCurrency(Math.abs(tx.amount))}
                  </span>
                </div>
              ))
            ) : (
              <div
                className="px-4 sm:px-5 py-8 sm:py-10 text-center text-sm"
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

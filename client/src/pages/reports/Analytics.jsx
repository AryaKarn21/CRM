import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  Users,
  Activity,
  CalendarDays,
  BarChart3,
  Target,
} from "lucide-react";

import { reportsAPI } from "@/api/reports.api";
import StatCard from "@/components/shared/StatCard";
import ChartWidget from "@/components/shared/ChartWidget";
import { formatCurrency } from "@/lib/utils";

export default function Analytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => reportsAPI.getDashboardStats().then((res) => res.data),
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["revenue-by-month"],
    queryFn: () =>
      reportsAPI
        .getRevenueByMonth(new Date().getFullYear())
        .then((res) => res.data),
  });

  const { data: salesData } = useQuery({
    queryKey: ["sales-report"],
    queryFn: () => reportsAPI.getSalesReport().then((res) => res.data),
  });

  const { data: forecastData } = useQuery({
    queryKey: ["sales-forecast"],
    queryFn: () => reportsAPI.getSalesForecast().then((res) => res.data),
  });

  const stats = [
    {
      title: "Revenue",
      value: data?.totalRevenue ? formatCurrency(data.totalRevenue) : "₹0",
      icon: DollarSign,
      color: "success",
      change: data?.revenueGrowth,
      label: "vs last year",
    },

    {
      title: "Won Deals",
      value: data?.wonDeals ?? 0,
      icon: TrendingUp,
      color: "primary",
      change: data?.dealsGrowth,
      label: "this month",
    },

    {
      title: "Employees",
      value: data?.employees ?? 0,
      icon: Users,
      color: "info",
    },

    {
      title: "Open Tickets",
      value: data?.openTickets ?? 0,
      icon: Activity,
      color: "warning",
      change: data?.ticketChange,
      label: "today",
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1
            className="text-[24px] font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Analytics Dashboard
          </h1>

          <p
            className="text-[13px] mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            Business intelligence across all CRM modules
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <CalendarDays size={16} />
            This Month
          </button>

          <button className="btn btn-primary">Export Report</button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              change={card.change}
              changeLabel={card.label}
              loading={isLoading}
            />
          ))}
        </div>

        {/* Revenue & Deals */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div
            className="card p-6 rounded-2xl shadow-sm border"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Revenue Trend
                </h3>

                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Monthly revenue overview
                </p>
              </div>

              <TrendingUp size={22} className="text-green-500" />
            </div>

            {revenueLoading ? (
              <div
                className="h-[320px] animate-pulse rounded-xl"
                style={{ background: "var(--border)" }}
              />
            ) : (
              <ChartWidget
                type="apex-line"
                title=""
                data={revenueData?.data || []}
                dataKey="revenue"
                xKey="month"
                height={320}
                formatter={(v) => formatCurrency(v)}
              />
            )}
          </div>

          {/* Deals Closed */}
          <div
            className="card p-6 rounded-2xl shadow-sm border"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Deals Closed
                </h3>

                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Monthly sales performance
                </p>
              </div>

              <BarChart3 size={22} className="text-blue-500" />
            </div>

            {revenueLoading ? (
              <div
                className="h-[320px] animate-pulse rounded-xl"
                style={{ background: "var(--border)" }}
              />
            ) : (
              <ChartWidget
                type="apex-bar"
                title=""
                data={salesData || []}
                dataKey="count"
                xKey="_id"
                height={320}
              />
            )}
          </div>
        </div>

        {/* Forecast & Pipeline */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Sales Forecast */}
          <div
            className="card p-6 rounded-2xl shadow-sm border"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Sales Forecast
                </h3>

                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Expected sales performance
                </p>
              </div>

              <TrendingUp size={22} className="text-amber-500" />
            </div>

            {revenueLoading ? (
              <div
                className="h-[320px] animate-pulse rounded-xl"
                style={{ background: "var(--border)" }}
              />
            ) : (
              <ChartWidget
                type="apex-area"
                title=""
                data={forecastData?.data || []}
                dataKey="forecast"
                xKey="month"
                height={320}
                color="#f59e0b"
                formatter={(v) => formatCurrency(v)}
              />
            )}
          </div>

          {/* Pipeline by Stage */}
          <div
            className="card p-6 rounded-2xl shadow-sm border"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Pipeline by Stage
                </h3>

                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Current opportunity pipeline
                </p>
              </div>

              <Target size={22} className="text-purple-500" />
            </div>

            <div className="space-y-4">
              {(Array.isArray(data?.pipeline) ? data.pipeline : []).map(
                (stage, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {stage.name}
                      </span>

                      <span
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatCurrency(stage.value)}
                      </span>
                    </div>

                    <div
                      className="w-full h-2 rounded-full"
                      style={{ background: "var(--border)" }}
                    >
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${stage.percent}%`,
                          background: "var(--primary)",
                        }}
                      />
                    </div>
                  </div>
                ),
              )}

              {(!data?.pipeline || data.pipeline.length === 0) && (
                <div
                  className="text-center py-10"
                  style={{ color: "var(--text-muted)" }}
                >
                  No pipeline data available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lead Sources */}
        <div
          className="card p-6 rounded-2xl shadow-sm border"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Lead Sources
              </h3>

              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Leads generated from different channels
              </p>
            </div>

            <Users size={22} className="text-indigo-500" />
          </div>

          {Array.isArray(data?.leadSources) && data.leadSources.length > 0 ? (
            <div className="space-y-5">
              {data.leadSources.map((source, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {source.source}
                    </span>

                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {source.count} Leads
                    </span>
                  </div>

                  <div
                    className="w-full h-2 rounded-full"
                    style={{ background: "var(--border)" }}
                  >
                    <div
                      className="h-2 rounded-full bg-green-500 transition-all"
                      style={{
                        width: `${source.percent}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="py-12 text-center"
              style={{ color: "var(--text-muted)" }}
            >
              No lead source data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

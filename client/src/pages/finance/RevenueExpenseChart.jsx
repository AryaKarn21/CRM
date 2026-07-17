import Chart from "react-apexcharts";

export default function RevenueExpenseChart({ data = [] }) {
  const options = {
    chart: {
      type: "bar",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      fontFamily: "inherit",
    },

    colors: ["#16a34a", "#ef4444"],

    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "45%",
      },
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },

    xaxis: {
      categories: data.map((item) => item.month),
      labels: {
        style: {
          colors: "#6b7280",
        },
      },
    },

    yaxis: {
      labels: {
        formatter: (value) => `$${value.toLocaleString()}`,
      },
    },

    legend: {
      position: "top",
      horizontalAlign: "right",
    },

    tooltip: {
      y: {
        formatter: (value) => `$${value.toLocaleString()}`,
      },
    },

    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
    },
  };

  const series = [
    {
      name: "Revenue",
      data: data.map((item) => item.revenue),
    },
    {
      name: "Expenses",
      data: data.map((item) => item.expenses),
    },
  ];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Revenue vs Expenses
          </h2>

          <p
            className="text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Monthly financial comparison
          </p>
        </div>
      </div>

      <Chart
        options={options}
        series={series}
        type="bar"
        height={360}
      />
    </div>
  );
}
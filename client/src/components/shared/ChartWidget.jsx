import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

import ReactApexChart from "react-apexcharts";

export default function ChartWidget({
  type = "line",
  data = [],
  dataKey,
  xKey = "label",
  color = "#3b82f6",
  height = 220,
  formatter,
  title,
}) {
  const Chart = {
    line: LineChart,
    bar: BarChart,
    area: AreaChart,
  }[type];

  const isApex = [
    "apex-line",
    "apex-bar",
    "apex-area",
    "donut",
    "horizontal-bar",
  ].includes(type);

  const apexSeries =
  type === "donut"
    ? data.map((d) => Number(d[dataKey]) || 0)
    : [
        {
          name: title || "Series",
          data: data.map((d) => Number(d[dataKey]) || 0),
        },
      ];

  const apexOptions = {
    chart: {
      background: "transparent",

      toolbar: {
        show: false,
      },

      zoom: {
        enabled: false,
      },

      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 900,
      },
    },

    theme: {
      mode: "light",
    },

    colors: [color],

    stroke: {
      curve: "smooth",
      width: 3,
    },

    dataLabels: {
      enabled: false,
    },

    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5,
    },

    xaxis: {
      categories: data.map((d) => d[xKey]),

      labels: {
        style: {
          colors: "#94A3B8",
          fontSize: "12px",
        },
      },

      axisBorder: {
        show: false,
      },

      axisTicks: {
        show: false,
      },
    },

    yaxis: {
      labels: {
        style: {
          colors: "#94A3B8",
          fontSize: "12px",
        },
      },
    },

    legend: {
      show: true,
      position: "bottom",
      fontSize: "13px",
    },

    tooltip: {
      theme: "light",
      shared: true,
      intersect: false,
    },

    fill: {
      type: type === "apex-area" ? "gradient" : "solid",

      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },

    labels: type === "donut" ? (data || []).map((d) => d?.[xKey]) : undefined,

    plotOptions: {
      bar: {
        horizontal: type === "horizontal-bar",

        borderRadius: 8,

        columnWidth: "45%",
      },

      pie: {
        donut: {
          size: "72%",

          labels: {
            show: true,

            total: {
              show: true,

              label: "Total",

              fontSize: "18px",
            },
          },
        },
      },
    },

    responsive: [
      {
        breakpoint: 1024,

        options: {
          chart: {
            height: 300,
          },
        },
      },

      {
        breakpoint: 640,

        options: {
          chart: {
            height: 260,
          },

          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };
 console.log("==================================");
console.log("Chart Type:", type);
console.log("Chart Data:", data);
console.log("Data Key:", dataKey);
console.log("X Key:", xKey);
console.log("Series:", apexSeries);
console.log("Options:", apexOptions);
console.log("==================================");
 
  return (
    <ReactApexChart
      options={apexOptions}
      series={apexSeries}
      type={
        type === "apex-line"
          ? "line"
          : type === "apex-bar"
            ? "bar"
            : type === "apex-area"
              ? "area"
              : type === "horizontal-bar"
                ? "bar"
                : "donut"
      }
      height={height}
      width="100%"
    />
  );
}

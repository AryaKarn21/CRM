import { memo, useMemo } from "react";
import ReactApexChart from "react-apexcharts";

function ChartWidget({
  type = "line",
  data = [],
  dataKey,
  xKey = "label",
  color = "#3b82f6",
  colors,
  series,
  stacked = false,
  height = 220,
  formatter,
  title,
}) {
  const isDonut = type === "donut";

  const seriesDefs = useMemo(
    () => series || (dataKey ? [{ name: title || "Series", dataKey, color }] : []),
    [series, dataKey, title, color]
  );

  const apexSeries = useMemo(() => {
    if (isDonut) return data.map((d) => Number(d[dataKey]) || 0);
    return seriesDefs.map((s) => ({
      name: s.name,
      data: data.map((d) => Number(d[s.dataKey]) || 0),
    }));
  }, [isDonut, data, dataKey, seriesDefs]);

  const paletteColors = useMemo(
    () => colors || seriesDefs.map((s) => s.color).filter(Boolean),
    [colors, seriesDefs]
  );

  const apexOptions = useMemo(
    () => ({
      chart: {
        background: "transparent",
        toolbar: { show: false },
        zoom: { enabled: false },
        stacked,
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 500,
        },
      },

      theme: { mode: "light" },

      colors: paletteColors.length ? paletteColors : [color],

      stroke: {
        curve: "smooth",
        width: type === "apex-bar" ? 0 : 3,
      },

      dataLabels: { enabled: false },

      grid: {
        borderColor: "var(--border)",
        strokeDashArray: 5,
      },

      xaxis: {
        categories: data.map((d) => d[xKey]),
        labels: {
          style: { colors: "#94A3B8", fontSize: "12px" },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },

      yaxis: {
        labels: {
          style: { colors: "#94A3B8", fontSize: "12px" },
          formatter: formatter ? (v) => formatter(v) : undefined,
        },
      },

      legend: {
        show: seriesDefs.length > 1 || isDonut,
        position: "bottom",
        fontSize: "13px",
        markers: { radius: 4 },
      },

      tooltip: {
        theme: "light",
        shared: true,
        intersect: false,
        y: {
          formatter: formatter ? (v) => formatter(v) : (v) => v,
        },
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

      labels: isDonut ? (data || []).map((d) => d?.[xKey]) : undefined,

      plotOptions: {
        bar: {
          horizontal: type === "horizontal-bar",
          borderRadius: 6,
          columnWidth: seriesDefs.length > 1 ? "55%" : "45%",
        },
        pie: {
          donut: {
            size: "72%",
            labels: {
              show: true,
              total: { show: true, label: "Total", fontSize: "18px" },
            },
          },
        },
      },

      noData: {
        text: "No data available",
        style: { color: "var(--text-muted)", fontSize: "13px" },
      },

      responsive: [
        {
          breakpoint: 1024,
          options: { chart: { height: Math.min(height, 300) } },
        },
        {
          breakpoint: 640,
          options: {
            chart: { height: Math.min(height, 260) },
            legend: { position: "bottom" },
          },
        },
      ],
    }),
    [type, stacked, paletteColors, color, data, xKey, formatter, seriesDefs, isDonut, height]
  );

  const apexType =
    type === "apex-line"
      ? "line"
      : type === "apex-bar"
        ? "bar"
        : type === "apex-area"
          ? "area"
          : type === "horizontal-bar"
            ? "bar"
            : "donut";

  return (
    <ReactApexChart
      options={apexOptions}
      series={apexSeries}
      type={apexType}
      height={height}
      width="100%"
    />
  );
}

export default memo(ChartWidget);
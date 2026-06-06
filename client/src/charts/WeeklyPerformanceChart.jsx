/**
 * WeeklyPerformanceChart.jsx
 * ─────────────────────────────────────────────────────────────
 * Line chart displaying weekly task completion counts over time.
 */

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const WeeklyPerformanceChart = ({ weeklyData }) => {
  const defaultLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];
  const defaultData = [12, 19, 15, 25, 22, 30];

  const labels = weeklyData?.labels || defaultLabels;
  const chartData = weeklyData?.data || defaultData;

  const data = {
    labels,
    datasets: [
      {
        label: "Completed Tasks",
        data: chartData,
        fill: true,
        backgroundColor: "rgba(34, 197, 94, 0.05)", // Soft green glow
        borderColor: "#22c55e",
        borderWidth: 2,
        pointBackgroundColor: "#22c55e",
        pointBorderColor: "#0f172a",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35, // Smooth curve
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#ffffff",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(255, 255, 255, 0.08)",
        borderWidth: 1,
        padding: 10,
        boxPadding: 6,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          font: { size: 10 },
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.04)",
        },
        ticks: {
          color: "#64748b",
          font: { size: 10 },
        },
        min: 0,
      },
    },
  };

  return (
    <div className="relative w-full h-64">
      <Line data={data} options={options} />
    </div>
  );
};

export default WeeklyPerformanceChart;
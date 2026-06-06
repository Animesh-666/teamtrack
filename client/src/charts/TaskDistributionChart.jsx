/**
 * TaskDistributionChart.jsx
 * ─────────────────────────────────────────────────────────────
 * Doughnut chart displaying task status distribution (Pending, In Progress, Completed).
 */

import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const TaskDistributionChart = ({ stats }) => {
  const data = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        data: [stats?.pending || 0, stats?.inProgress || 0, stats?.completed || 0],
        backgroundColor: [
          "rgba(245, 158, 11, 0.2)",  // Amber/Pending
          "rgba(59, 130, 246, 0.2)",   // Blue/In Progress
          "rgba(34, 197, 94, 0.2)",    // Green/Completed
        ],
        borderColor: [
          "#f59e0b",
          "#3b82f6",
          "#22c55e",
        ],
        borderWidth: 1.5,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#94a3b8", // text-slate-400
          font: {
            size: 11,
            family: "Inter, system-ui, sans-serif",
          },
          padding: 16,
          usePointStyle: true,
          pointStyle: "circle",
        },
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
    cutout: "75%",
  };

  return (
    <div className="relative w-full h-64">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default TaskDistributionChart;
/**
 * MemberProductivityChart.jsx
 * ─────────────────────────────────────────────────────────────
 * Horizontal bar chart displaying member productivity scores.
 */

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MemberProductivityChart = ({ members }) => {
  const sortedMembers = [...(members || [])]
    .sort((a, b) => (b.productivityScore || 0) - (a.productivityScore || 0))
    .slice(0, 6);

  const data = {
    labels: sortedMembers.map((m) => m.name || "Member"),
    datasets: [
      {
        label: "Productivity Score",
        data: sortedMembers.map((m) => m.productivityScore || 0),
        backgroundColor: "rgba(34, 197, 94, 0.15)", // Green gradient alpha
        borderColor: "#22c55e",
        borderWidth: 1.5,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y", // Horizontal Bar Chart
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
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.04)",
        },
        ticks: {
          color: "#64748b",
          font: { size: 10 },
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#94a3b8",
          font: { size: 11, weight: "500" },
        },
      },
    },
  };

  return (
    <div className="relative w-full h-72">
      <Bar data={data} options={options} />
    </div>
  );
};

export default MemberProductivityChart;
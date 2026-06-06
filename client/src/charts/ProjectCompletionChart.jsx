/**
 * ProjectCompletionChart.jsx
 * ─────────────────────────────────────────────────────────────
 * Vertical bar chart displaying project completion percentages.
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

const ProjectCompletionChart = ({ projects }) => {
  const chartProjects = [...(projects || [])].slice(0, 6);

  const data = {
    labels: chartProjects.map((p) => p.projectName || p.name || "Project"),
    datasets: [
      {
        label: "Completion Progress (%)",
        data: chartProjects.map((p) => p.completionPercentage || p.progress || 0),
        backgroundColor: "rgba(59, 130, 246, 0.15)", // Blue glow
        borderColor: "#3b82f6",
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false,
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
        max: 100,
      },
    },
  };

  return (
    <div className="relative w-full h-64">
      <Bar data={data} options={options} />
    </div>
  );
};

export default ProjectCompletionChart;
/**
 * MediTrack Dashboard Analytics & Home View Module
 */

const DashboardModule = (() => {
  let monthlyChartInstance = null;
  let specChartInstance = null;

  const init = async () => {
    await loadStats();
    await loadRecentActivity();
  };

  const loadStats = async () => {
    const res = await API.get("/api/dashboard/stats/");
    if (!res.ok || !res.success) {
      UI.showToast("Failed to load dashboard metrics.", "error");
      return;
    }

    const { kpis, top_specializations, monthly_trend } = res.data;

    // 1. Update KPI Counters with smooth animations
    UI.animateCounter(document.getElementById("kpi-patients"), kpis.total_patients);
    UI.animateCounter(document.getElementById("kpi-doctors"), kpis.total_doctors);
    UI.animateCounter(document.getElementById("kpi-mappings"), kpis.active_mappings);
    UI.animateCounter(document.getElementById("kpi-unassigned"), kpis.unassigned_patients);

    // 2. Render Monthly Intake Trend Chart
    renderMonthlyChart(monthly_trend || []);

    // 3. Render Specializations Donut Chart
    renderSpecializationChart(top_specializations || []);
  };

  const renderMonthlyChart = (trendData) => {
    const ctx = document.getElementById("chart-monthly-intake");
    if (!ctx || typeof Chart === "undefined") return;

    if (monthlyChartInstance) {
      monthlyChartInstance.destroy();
    }

    const isDark = document.documentElement.classList.contains("dark");
    const labels = trendData.length
      ? trendData.map((d) => d.month)
      : ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
    const counts = trendData.length
      ? trendData.map((d) => d.count)
      : [2, 4, 3, 5, 3, 6];

    monthlyChartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Patients Registered",
            data: counts,
            borderColor: "#0D9488",
            backgroundColor: "rgba(13, 148, 136, 0.12)",
            borderWidth: 2.5,
            fill: true,
            tension: 0.35,
            pointBackgroundColor: "#0D9488",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? "#1e293b" : "#0f172a",
            titleColor: "#fff",
            bodyColor: "#94a3b8",
            padding: 10,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              color: isDark ? "#64748b" : "#94a3b8",
              font: { size: 11 },
            },
          },
          y: {
            grid: {
              color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              drawBorder: false,
            },
            ticks: {
              stepSize: 1,
              color: isDark ? "#64748b" : "#94a3b8",
              font: { size: 11 },
            },
          },
        },
      },
    });
  };

  const renderSpecializationChart = (specData) => {
    const ctx = document.getElementById("chart-specialization");
    if (!ctx || typeof Chart === "undefined") return;

    if (specChartInstance) {
      specChartInstance.destroy();
    }

    const isDark = document.documentElement.classList.contains("dark");
    const labels = specData.length
      ? specData.map((s) => s.specialization)
      : ["General", "Cardiology", "Pediatrics", "Neurology", "Other"];
    const counts = specData.length
      ? specData.map((s) => s.count)
      : [4, 3, 3, 2, 2];

    const colors = [
      "#0D9488", // Teal
      "#10B981", // Emerald
      "#06B6D4", // Cyan
      "#3B82F6", // Blue
      "#8B5CF6", // Purple
    ];

    specChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: counts,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: isDark ? "#0f172a" : "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: isDark ? "#cbd5e1" : "#475569",
              padding: 12,
              font: { size: 11 },
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
        },
      },
    });
  };

  const loadRecentActivity = async () => {
    const feedContainer = document.getElementById("activity-feed-list");
    if (!feedContainer) return;

    const res = await API.get("/api/audit/", { page_size: 5 });
    if (!res.ok || !res.success) {
      feedContainer.innerHTML = `<p class="text-xs text-slate-400 py-4 text-center">Unable to load activity log.</p>`;
      return;
    }

    const logs = res.data.results || [];
    if (!logs.length) {
      feedContainer.innerHTML = `<p class="text-xs text-slate-400 py-4 text-center">No recent activities logged.</p>`;
      return;
    }

    const actionColors = {
      CREATE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
      UPDATE: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
      DELETE: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
      LOGIN: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
      LOGOUT: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    };

    feedContainer.innerHTML = logs
      .map((item) => {
        const timeFormatted = new Date(item.timestamp).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const badgeClass = actionColors[item.action] || "bg-slate-100 text-slate-800";
        return `
        <div class="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
          <span class="text-xs font-bold px-2 py-0.5 rounded-full ${badgeClass} uppercase">
            ${item.action}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              ${item.resource_type} #${item.resource_id}
            </p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              ${item.details?.name || item.details?.email || "Action recorded"}
            </p>
          </div>
          <span class="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
            ${timeFormatted}
          </span>
        </div>
      `;
      })
      .join("");
  };

  return { init, loadStats, loadRecentActivity };
})();

window.DashboardModule = DashboardModule;

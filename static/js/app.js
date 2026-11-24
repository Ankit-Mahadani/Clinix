/**
 * MediTrack Main Application Router & Controller
 */

document.addEventListener("DOMContentLoaded", async () => {
  UI.initTheme();
  UI.updateThemeIcons();
  UI.initKeyboardShortcuts();

  // Verify authentication
  const refreshToken = API.getRefreshToken();
  if (!refreshToken) {
    window.location.href = "/";
    return;
  }

  // Restore access token or refresh
  let accessToken = API.getAccessToken();
  if (!accessToken) {
    accessToken = await API.refreshAccessToken();
    if (!accessToken) {
      window.location.href = "/?expired=1";
      return;
    }
  }

  // Load and display current user profile
  const user = API.getCurrentUser();
  if (user) {
    updateUserDisplay(user);
  } else {
    const res = await API.get("/api/auth/me/");
    if (res.ok && res.success) {
      API.setCurrentUser(res.data);
      updateUserDisplay(res.data);
    }
  }

  // Setup theme toggle
  const themeToggle = document.getElementById("app-theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => UI.toggleTheme());
  }

  // Setup logout button
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
  const logoutBtnSettings = document.getElementById("btn-logout-settings");
  if (logoutBtnSettings) {
    logoutBtnSettings.addEventListener("click", handleLogout);
  }

  // Setup settings form
  const settingsForm = document.getElementById("profile-settings-form");
  if (settingsForm) {
    settingsForm.addEventListener("submit", handleProfileUpdate);
  }

  // Navigation Hash Router
  window.addEventListener("hashchange", handleHashChange);
  handleHashChange();
});

const updateUserDisplay = (user) => {
  const nameEl = document.getElementById("user-display-name");
  const emailEl = document.getElementById("user-display-email");
  const avatarEl = document.getElementById("user-avatar-initials");
  const greetingEl = document.getElementById("overview-greeting");
  const settingsNameInput = document.getElementById("settings-name-input");
  const settingsEmailInput = document.getElementById("settings-email-input");

  if (nameEl) nameEl.textContent = user.name || "Doctor";
  if (emailEl) emailEl.textContent = user.email || "";
  if (greetingEl) {
    const hour = new Date().getHours();
    const period = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    greetingEl.textContent = `${period}, ${user.name || "Doctor"}`;
  }

  if (avatarEl && user.name) {
    const initials = user.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    avatarEl.textContent = initials;
  }

  if (settingsNameInput) settingsNameInput.value = user.name || "";
  if (settingsEmailInput) settingsEmailInput.value = user.email || "";
};

const handleHashChange = () => {
  const hash = window.location.hash || "#overview";
  const views = ["overview", "patients", "doctors", "mappings", "activity", "settings"];
  const currentView = hash.replace("#", "");

  views.forEach((v) => {
    const section = document.getElementById(`view-${v}`);
    const navLink = document.getElementById(`nav-${v}`);
    const mobileNavLink = document.getElementById(`mobile-nav-${v}`);

    if (v === currentView) {
      if (section) section.classList.remove("hidden");
      if (navLink) {
        navLink.classList.add("bg-teal-50", "dark:bg-teal-950/80", "text-teal-700", "dark:text-teal-300", "font-bold");
        navLink.classList.remove("text-slate-600", "dark:text-slate-400");
      }
      if (mobileNavLink) {
        mobileNavLink.classList.add("text-teal-600", "dark:text-teal-400");
        mobileNavLink.classList.remove("text-slate-400");
      }
    } else {
      if (section) section.classList.add("hidden");
      if (navLink) {
        navLink.classList.remove("bg-teal-50", "dark:bg-teal-950/80", "text-teal-700", "dark:text-teal-300", "font-bold");
        navLink.classList.add("text-slate-600", "dark:text-slate-400");
      }
      if (mobileNavLink) {
        mobileNavLink.classList.remove("text-teal-600", "dark:text-teal-400");
        mobileNavLink.classList.add("text-slate-400");
      }
    }
  });

  // Trigger view initializers
  if (currentView === "overview") {
    DashboardModule.init();
  } else if (currentView === "patients") {
    PatientsModule.init();
  } else if (currentView === "doctors") {
    DoctorsModule.init();
  } else if (currentView === "mappings") {
    MappingsModule.init();
  } else if (currentView === "activity") {
    loadFullActivityLog();
  }
};

const handleLogout = () => {
  UI.showConfirmModal({
    title: "Sign Out",
    message: "Are you sure you want to sign out of MediTrack?",
    confirmText: "Sign Out",
    onConfirm: async () => {
      const refresh = API.getRefreshToken();
      await API.post("/api/auth/logout/", { refresh });
      API.clearSession();
      UI.showToast("Signed out successfully.", "info");
      window.location.href = "/";
    },
  });
};

const handleProfileUpdate = async (e) => {
  e.preventDefault();
  const name = document.getElementById("settings-name-input").value.trim();
  const res = await API.patch("/api/auth/me/", { name });
  if (res.ok && res.success) {
    API.setCurrentUser(res.data);
    updateUserDisplay(res.data);
    UI.showToast("Profile updated successfully.", "success");
  } else {
    UI.showToast(res.error?.message || "Failed to update profile.", "error");
  }
};

const loadFullActivityLog = async () => {
  const container = document.getElementById("activity-full-list");
  if (!container) return;

  container.innerHTML = `<p class="p-4 text-xs text-slate-400">Loading audit history...</p>`;
  const res = await API.get("/api/audit/", { page_size: 50 });
  if (!res.ok || !res.success) {
    container.innerHTML = `<p class="p-4 text-xs text-rose-500">Failed to load audit history.</p>`;
    return;
  }

  const logs = res.data.results || [];
  if (logs.length === 0) {
    container.innerHTML = `<p class="p-8 text-center text-xs text-slate-400">No audit events recorded yet.</p>`;
    return;
  }

  container.innerHTML = logs
    .map((item) => {
      const date = new Date(item.timestamp).toLocaleString();
      return `
      <tr class="border-b border-slate-100 dark:border-slate-800 text-xs">
        <td class="p-3 text-slate-400 whitespace-nowrap">${date}</td>
        <td class="p-3 font-semibold text-slate-900 dark:text-white">${item.user_email || "System"}</td>
        <td class="p-3 font-bold text-teal-600">${item.action}</td>
        <td class="p-3 text-slate-700 dark:text-slate-300">${item.resource_type} #${item.resource_id}</td>
        <td class="p-3 font-mono text-[11px] text-slate-500">${JSON.stringify(item.details)}</td>
      </tr>
    `;
    })
    .join("");
};

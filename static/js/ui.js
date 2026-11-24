/**
 * MediTrack UI & Interaction Manager
 */

const UI = (() => {
  // Theme management
  const initTheme = () => {
    const savedTheme = localStorage.getItem("meditrack_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("meditrack_theme", isDark ? "dark" : "light");
    updateThemeIcons();
  };

  const updateThemeIcons = () => {
    const isDark = document.documentElement.classList.contains("dark");
    document.querySelectorAll(".theme-icon-sun").forEach((el) => {
      el.classList.toggle("hidden", !isDark);
    });
    document.querySelectorAll(".theme-icon-moon").forEach((el) => {
      el.classList.toggle("hidden", isDark);
    });
  };

  // Toast notifications
  const toastContainer = () => {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className =
        "fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4";
      document.body.appendChild(container);
    }
    return container;
  };

  const showToast = (message, type = "success", duration = 4000) => {
    const container = toastContainer();
    const toast = document.createElement("div");

    const colorConfig = {
      success: {
        bg: "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200",
        icon: `<svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
      },
      error: {
        bg: "bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200",
        icon: `<svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
      },
      info: {
        bg: "bg-teal-50 dark:bg-teal-950/80 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200",
        icon: `<svg class="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
      },
    };

    const cfg = colorConfig[type] || colorConfig.info;

    toast.className = `pointer-events-auto flex items-center gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-4 opacity-0 ${cfg.bg}`;
    toast.innerHTML = `
      <div class="flex-shrink-0">${cfg.icon}</div>
      <div class="text-sm font-medium flex-1">${message}</div>
      <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition" onclick="this.parentElement.remove()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-4", "opacity-0");
    });

    setTimeout(() => {
      toast.classList.add("translate-y-4", "opacity-0");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // Confirm Modal
  const showConfirmModal = ({
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    isDanger = false,
    onConfirm = () => {},
  }) => {
    let modal = document.getElementById("global-confirm-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "global-confirm-modal";
      modal.className =
        "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity opacity-0 pointer-events-none";
      modal.innerHTML = `
        <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transform scale-95 transition-transform">
          <div class="flex items-center gap-3 mb-4">
            <div id="modal-icon-container" class="w-10 h-10 rounded-full flex items-center justify-center"></div>
            <h3 id="modal-title" class="text-lg font-bold text-slate-900 dark:text-white"></h3>
          </div>
          <p id="modal-message" class="text-sm text-slate-600 dark:text-slate-300 mb-6"></p>
          <div class="flex items-center justify-end gap-3">
            <button id="modal-cancel-btn" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
              Cancel
            </button>
            <button id="modal-confirm-btn" class="px-4 py-2 text-sm font-medium text-white rounded-xl shadow-md transition">
              Confirm
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const titleEl = modal.querySelector("#modal-title");
    const msgEl = modal.querySelector("#modal-message");
    const confirmBtn = modal.querySelector("#modal-confirm-btn");
    const cancelBtn = modal.querySelector("#modal-cancel-btn");
    const iconContainer = modal.querySelector("#modal-icon-container");

    titleEl.textContent = title;
    msgEl.innerHTML = message;
    confirmBtn.textContent = confirmText;

    if (isDanger) {
      confirmBtn.className =
        "px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition";
      iconContainer.className =
        "w-10 h-10 rounded-full flex items-center justify-center bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400";
      iconContainer.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
    } else {
      confirmBtn.className =
        "px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition";
      iconContainer.className =
        "w-10 h-10 rounded-full flex items-center justify-center bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400";
      iconContainer.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    }

    const closeModal = () => {
      modal.classList.add("opacity-0", "pointer-events-none");
      modal.querySelector("div").classList.add("scale-95");
    };

    modal.classList.remove("opacity-0", "pointer-events-none");
    modal.querySelector("div").classList.remove("scale-95");

    cancelBtn.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    confirmBtn.onclick = () => {
      closeModal();
      onConfirm();
    };
  };

  // Drawers
  const openDrawer = (drawerId) => {
    const drawer = document.getElementById(drawerId);
    if (!drawer) return;
    drawer.classList.remove("hidden");
    requestAnimationFrame(() => {
      const backdrop = drawer.querySelector(".drawer-backdrop");
      const content = drawer.querySelector(".drawer-content");
      if (backdrop) backdrop.classList.remove("opacity-0");
      if (content) content.classList.remove("translate-x-full");
    });
  };

  const closeDrawer = (drawerId) => {
    const drawer = document.getElementById(drawerId);
    if (!drawer) return;
    const backdrop = drawer.querySelector(".drawer-backdrop");
    const content = drawer.querySelector(".drawer-content");
    if (backdrop) backdrop.classList.add("opacity-0");
    if (content) content.classList.add("translate-x-full");
    setTimeout(() => {
      drawer.classList.add("hidden");
    }, 300);
  };

  // Animated Counter
  const animateCounter = (el, target, duration = 800) => {
    if (!el) return;
    const start = 0;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * ease);
      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(update);
  };

  // Keyboard Shortcuts
  const initKeyboardShortcuts = () => {
    window.addEventListener("keydown", (e) => {
      // Ignore if focus is in an input or textarea
      const inInput = ["INPUT", "TEXTAREA", "SELECT"].includes(
        document.activeElement.tagName
      );

      // Slash '/' focuses search
      if (e.key === "/" && !inInput) {
        e.preventDefault();
        const searchInput =
          document.getElementById("patient-search-input") ||
          document.getElementById("top-search-input");
        if (searchInput) searchInput.focus();
      }

      // 'n' opens Add Patient drawer
      if (e.key.toLowerCase() === "n" && !inInput) {
        e.preventDefault();
        openDrawer("patient-drawer");
      }

      // 'Escape' closes any open drawer or modal
      if (e.key === "Escape") {
        document.querySelectorAll("[id$='-drawer']").forEach((dr) => {
          if (!dr.classList.contains("hidden")) {
            closeDrawer(dr.id);
          }
        });
        const modal = document.getElementById("global-confirm-modal");
        if (modal && !modal.classList.contains("opacity-0")) {
          modal.classList.add("opacity-0", "pointer-events-none");
        }
      }
    });
  };

  return {
    initTheme,
    toggleTheme,
    updateThemeIcons,
    showToast,
    showConfirmModal,
    openDrawer,
    closeDrawer,
    animateCounter,
    initKeyboardShortcuts,
  };
})();

window.UI = UI;

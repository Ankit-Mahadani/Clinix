/**
 * MediTrack Authentication Screen Script
 */

document.addEventListener("DOMContentLoaded", () => {
  UI.initTheme();
  UI.updateThemeIcons();

  const themeToggle = document.getElementById("auth-theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => UI.toggleTheme());
  }

  // Check if session expired param is present
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("expired")) {
    UI.showToast("Your session has expired. Please sign in again.", "info");
  }

  // If already authenticated with valid token, redirect to /app/
  if (API.getRefreshToken()) {
    API.refreshAccessToken().then((token) => {
      if (token) {
        window.location.href = "/app/";
      }
    });
  }

  // Tabs switching
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const formLogin = document.getElementById("form-login");
  const formRegister = document.getElementById("form-register");

  const switchTab = (tab) => {
    if (tab === "login") {
      tabLogin.classList.add("border-teal-600", "text-teal-600", "dark:text-teal-400");
      tabLogin.classList.remove("border-transparent", "text-slate-500");
      tabRegister.classList.remove("border-teal-600", "text-teal-600", "dark:text-teal-400");
      tabRegister.classList.add("border-transparent", "text-slate-500");
      formLogin.classList.remove("hidden");
      formRegister.classList.add("hidden");
    } else {
      tabRegister.classList.add("border-teal-600", "text-teal-600", "dark:text-teal-400");
      tabRegister.classList.remove("border-transparent", "text-slate-500");
      tabLogin.classList.remove("border-teal-600", "text-teal-600", "dark:text-teal-400");
      tabLogin.classList.add("border-transparent", "text-slate-500");
      formRegister.classList.remove("hidden");
      formLogin.classList.add("hidden");
    }
    clearErrors();
  };

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener("click", () => switchTab("login"));
    tabRegister.addEventListener("click", () => switchTab("register"));
  }

  // Password visibility toggle
  document.querySelectorAll(".btn-toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input");
      if (input.type === "password") {
        input.type = "text";
        btn.querySelector(".icon-eye").classList.add("hidden");
        btn.querySelector(".icon-eye-off").classList.remove("hidden");
      } else {
        input.type = "password";
        btn.querySelector(".icon-eye").classList.remove("hidden");
        btn.querySelector(".icon-eye-off").classList.add("hidden");
      }
    });
  });

  // Password Strength Meter
  const regPassword = document.getElementById("register-password");
  const strengthBar = document.getElementById("strength-bar");
  const strengthText = document.getElementById("strength-text");

  if (regPassword && strengthBar && strengthText) {
    regPassword.addEventListener("input", (e) => {
      const val = e.target.value;
      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      const configs = [
        { width: "0%", bg: "bg-slate-300 dark:bg-slate-700", text: "Too short" },
        { width: "25%", bg: "bg-rose-500", text: "Weak" },
        { width: "50%", bg: "bg-amber-500", text: "Fair" },
        { width: "75%", bg: "bg-blue-500", text: "Good" },
        { width: "100%", bg: "bg-emerald-500", text: "Strong" },
      ];

      const c = configs[score];
      strengthBar.className = `h-1.5 rounded-full transition-all duration-300 ${c.bg}`;
      strengthBar.style.width = c.width;
      strengthText.textContent = c.text;
    });
  }

  // Demo Account Autofill
  const btnDemoLogin = document.getElementById("btn-demo-login");
  if (btnDemoLogin) {
    btnDemoLogin.addEventListener("click", async () => {
      switchTab("login");
      const emailInput = document.getElementById("login-email");
      const passInput = document.getElementById("login-password");
      emailInput.value = "demo@meditrack.com";
      passInput.value = "Password123!";

      // Simulate quick natural click
      btnDemoLogin.disabled = true;
      btnDemoLogin.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-teal-600 inline" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
        Signing in as Dr. Sarah Jenkins...
      `;
      await executeLogin("demo@meditrack.com", "Password123!");
    });
  }

  // Error rendering helper
  const clearErrors = () => {
    document.querySelectorAll(".field-error").forEach((el) => {
      el.textContent = "";
      el.classList.add("hidden");
    });
    document.querySelectorAll("input").forEach((inp) => {
      inp.classList.remove("border-rose-500", "focus:ring-rose-500");
    });
  };

  const showFieldError = (fieldId, message) => {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove("hidden");
    }
    if (inputEl) {
      inputEl.classList.add("border-rose-500", "focus:ring-rose-500");
    }
  };

  // Login handler
  const executeLogin = async (email, password) => {
    clearErrors();
    const btn = document.getElementById("btn-submit-login");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
      Authenticating...
    `;

    try {
      const res = await API.post("/api/auth/login/", { email, password });
      if (res.ok && res.success) {
        API.setAccessToken(res.data.access);
        API.setRefreshToken(res.data.refresh);
        API.setCurrentUser(res.data.user);
        UI.showToast("Welcome back! Redirecting to dashboard...", "success");
        setTimeout(() => {
          window.location.href = "/app/";
        }, 400);
      } else {
        btn.disabled = false;
        btn.innerHTML = originalText;
        const msg = res.error?.message || "Invalid email or password.";
        showFieldError("login-password", msg);
        UI.showToast(msg, "error");
      }
    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = originalText;
      UI.showToast("Network error. Please try again.", "error");
    }
  };

  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;
      executeLogin(email, password);
    });
  }

  // Register handler
  if (formRegister) {
    formRegister.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();

      const name = document.getElementById("register-name").value.trim();
      const email = document.getElementById("register-email").value.trim();
      const password = document.getElementById("register-password").value;
      const password2 = document.getElementById("register-password-confirm").value;

      if (password !== password2) {
        showFieldError("register-password-confirm", "Passwords do not match.");
        return;
      }

      const btn = document.getElementById("btn-submit-register");
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
        Creating account...
      `;

      try {
        const res = await API.post("/api/auth/register/", {
          name,
          email,
          password,
          password2,
        });

        if (res.ok && res.success) {
          API.setAccessToken(res.data.access);
          API.setRefreshToken(res.data.refresh);
          API.setCurrentUser(res.data.user);
          UI.showToast("Account created successfully! Preparing dashboard...", "success");
          setTimeout(() => {
            window.location.href = "/app/";
          }, 500);
        } else {
          btn.disabled = false;
          btn.innerHTML = originalText;
          const details = res.error?.details || {};
          let anyFieldFound = false;

          for (const [key, msgs] of Object.entries(details)) {
            const fieldId = `register-${key === "password2" ? "password-confirm" : key}`;
            const msg = Array.isArray(msgs) ? msgs[0] : msgs;
            showFieldError(fieldId, msg);
            anyFieldFound = true;
          }

          if (!anyFieldFound) {
            UI.showToast(res.error?.message || "Registration failed.", "error");
          }
        }
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = originalText;
        UI.showToast("Network error. Please try again.", "error");
      }
    });
  }
});

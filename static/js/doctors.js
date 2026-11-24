/**
 * MediTrack Doctors Catalog Module
 */

const DoctorsModule = (() => {
  let doctorsList = [];
  let currentFilterSpec = "";
  let currentSearch = "";
  let viewMode = "grid"; // 'grid' or 'table'

  const init = () => {
    bindEvents();
    loadDoctors();
  };

  const bindEvents = () => {
    // Search input
    const searchInput = document.getElementById("doctor-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        renderDoctors();
      });
    }

    // Grid / Table view toggle
    const btnToggleGrid = document.getElementById("btn-doc-grid-view");
    const btnToggleTable = document.getElementById("btn-doc-table-view");

    if (btnToggleGrid && btnToggleTable) {
      btnToggleGrid.addEventListener("click", () => {
        viewMode = "grid";
        btnToggleGrid.classList.add("bg-white", "dark:bg-slate-700", "shadow-sm");
        btnToggleTable.classList.remove("bg-white", "dark:bg-slate-700", "shadow-sm");
        renderDoctors();
      });

      btnToggleTable.addEventListener("click", () => {
        viewMode = "table";
        btnToggleTable.classList.add("bg-white", "dark:bg-slate-700", "shadow-sm");
        btnToggleGrid.classList.remove("bg-white", "dark:bg-slate-700", "shadow-sm");
        renderDoctors();
      });
    }

    // Add Doctor Button
    const btnAdd = document.getElementById("btn-add-doctor");
    if (btnAdd) {
      btnAdd.addEventListener("click", () => openDoctorForm());
    }

    // Form submission
    const form = document.getElementById("doctor-form");
    if (form) {
      form.addEventListener("submit", handleDoctorSubmit);
    }
  };

  const loadDoctors = async () => {
    const res = await API.get("/api/doctors/", { page_size: 100 });
    if (!res.ok || !res.success) {
      UI.showToast("Failed to load doctor catalog.", "error");
      return;
    }

    doctorsList = res.data.results || [];
    renderSpecializationChips();
    renderDoctors();
  };

  const renderSpecializationChips = () => {
    const container = document.getElementById("doctor-spec-chips");
    if (!container) return;

    const specs = [
      "All",
      ...new Set(doctorsList.map((d) => d.specialization).filter(Boolean)),
    ];

    container.innerHTML = specs
      .map((spec) => {
        const isActive = (currentFilterSpec === "" && spec === "All") || currentFilterSpec === spec;
        const activeClass = isActive
          ? "bg-teal-600 text-white font-bold shadow-sm"
          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700";
        return `
          <button onclick="DoctorsModule.filterBySpec('${spec === "All" ? "" : spec}')" class="px-3 py-1.5 rounded-full text-xs transition ${activeClass}">
            ${spec}
          </button>
        `;
      })
      .join("");
  };

  const filterBySpec = (spec) => {
    currentFilterSpec = spec;
    renderSpecializationChips();
    renderDoctors();
  };

  const renderDoctors = () => {
    const gridContainer = document.getElementById("doctors-grid-container");
    const tableContainer = document.getElementById("doctors-table-container");
    const tableBody = document.getElementById("doctors-table-body");
    const emptyState = document.getElementById("doctors-empty-state");

    let filtered = doctorsList;
    if (currentFilterSpec) {
      filtered = filtered.filter(
        (d) => d.specialization.toLowerCase() === currentFilterSpec.toLowerCase()
      );
    }
    if (currentSearch) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(currentSearch) ||
          d.specialization.toLowerCase().includes(currentSearch) ||
          (d.hospital && d.hospital.toLowerCase().includes(currentSearch))
      );
    }

    if (filtered.length === 0) {
      if (gridContainer) gridContainer.innerHTML = "";
      if (tableContainer) tableContainer.classList.add("hidden");
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");

    if (viewMode === "grid") {
      if (tableContainer) tableContainer.classList.add("hidden");
      if (gridContainer) {
        gridContainer.classList.remove("hidden");
        gridContainer.innerHTML = filtered
          .map((d) => {
            const initials = d.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            return `
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover-lift flex flex-col justify-between">
              <div>
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-teal-500/20">
                      ${initials}
                    </div>
                    <div>
                      <h4 class="text-sm font-bold text-slate-900 dark:text-white">Dr. ${d.name}</h4>
                      <p class="text-xs font-semibold text-teal-600 dark:text-teal-400">${d.specialization}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/50 dark:border-emerald-800/50">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Available
                  </div>
                </div>

                <div class="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 my-4">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    <span>${d.hospital || "Clinical Practice"}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                    <span>${d.years_of_experience} yrs exp • Lic: ${d.license_number}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span>${d.availability || "Mon - Fri (09:00 - 17:00)"}</span>
                  </div>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase tracking-wider block">Consultation</span>
                  <span class="text-sm font-extrabold text-slate-900 dark:text-white">$${parseFloat(d.consultation_fee).toFixed(0)}</span>
                </div>
                <div class="flex items-center gap-2">
                  ${
                    d.is_creator
                      ? `
                    <button onclick="DoctorsModule.confirmDelete(${d.id}, '${d.name.replace(/'/g, "\\'")}')" class="p-1.5 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition" title="Delete Doctor">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                    `
                      : ""
                  }
                  <button onclick="MappingsModule.openWizardForDoctor(${d.id})" class="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 hover:bg-teal-100 text-xs font-bold transition">
                    Assign Patient
                  </button>
                </div>
              </div>
            </div>
          `;
          })
          .join("");
      }
    } else {
      if (gridContainer) gridContainer.classList.add("hidden");
      if (tableContainer) {
        tableContainer.classList.remove("hidden");
        if (tableBody) {
          tableBody.innerHTML = filtered
            .map(
              (d) => `
            <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
              <td class="p-4 font-bold text-xs text-slate-900 dark:text-white">Dr. ${d.name}</td>
              <td class="p-4 text-xs font-semibold text-teal-600 dark:text-teal-400">${d.specialization}</td>
              <td class="p-4 text-xs text-slate-500">${d.hospital || "—"}</td>
              <td class="p-4 text-xs text-slate-500">${d.years_of_experience} yrs</td>
              <td class="p-4 text-xs font-bold text-slate-900 dark:text-white">$${parseFloat(d.consultation_fee).toFixed(0)}</td>
              <td class="p-4 text-right">
                <button onclick="MappingsModule.openWizardForDoctor(${d.id})" class="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold">
                  Assign
                </button>
              </td>
            </tr>
          `
            )
            .join("");
        }
      }
    }
  };

  const openDoctorForm = () => {
    const form = document.getElementById("doctor-form");
    if (form) form.reset();
    UI.openDrawer("doctor-drawer");
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById("doctor-name").value.trim(),
      specialization: document.getElementById("doctor-spec").value.trim(),
      license_number: document.getElementById("doctor-license").value.trim(),
      years_of_experience: parseInt(document.getElementById("doctor-exp").value || "0", 10),
      hospital: document.getElementById("doctor-hospital").value.trim(),
      phone: document.getElementById("doctor-phone").value.trim(),
      email: document.getElementById("doctor-email").value.trim(),
      consultation_fee: parseFloat(document.getElementById("doctor-fee").value || "100"),
      availability: document.getElementById("doctor-avail").value.trim(),
    };

    const submitBtn = document.getElementById("btn-submit-doctor");
    const origText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Registering...`;

    try {
      const res = await API.post("/api/doctors/", payload);
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;

      if (res.ok && res.success) {
        UI.showToast("Doctor profile registered successfully.", "success");
        UI.closeDrawer("doctor-drawer");
        loadDoctors();
        DashboardModule.loadStats();
      } else {
        const errorMsg =
          res.error?.message || Object.values(res.error?.details || {})[0] || "Validation failed.";
        UI.showToast(errorMsg, "error");
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
      UI.showToast("Network error registering doctor.", "error");
    }
  };

  const confirmDelete = (id, name) => {
    UI.showConfirmModal({
      title: "Remove Doctor Profile",
      message: `Are you sure you want to remove <strong>Dr. ${name}</strong> from the catalog? Only the creator may perform this action.`,
      confirmText: "Remove Doctor",
      isDanger: true,
      onConfirm: async () => {
        const res = await API.delete(`/api/doctors/${id}/`);
        if (res.ok && res.success) {
          UI.showToast("Doctor profile removed.", "success");
          loadDoctors();
          DashboardModule.loadStats();
        } else {
          UI.showToast(res.error?.message || "Permission denied or failed.", "error");
        }
      },
    });
  };

  return {
    init,
    loadDoctors,
    filterBySpec,
    openDoctorForm,
    confirmDelete,
  };
})();

window.DoctorsModule = DoctorsModule;

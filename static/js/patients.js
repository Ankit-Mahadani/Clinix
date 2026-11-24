/**
 * MediTrack Patients Module
 */

const PatientsModule = (() => {
  let currentPage = 1;
  let currentSearch = "";
  let currentGender = "";
  let currentBloodGroup = "";
  let currentOrdering = "-created_at";
  let searchTimeout = null;

  const init = () => {
    bindEvents();
    loadPatients();
  };

  const bindEvents = () => {
    // Search input debounced
    const searchInput = document.getElementById("patient-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          currentSearch = e.target.value.trim();
          currentPage = 1;
          loadPatients();
        }, 300);
      });
    }

    // Gender Filter
    const genderSelect = document.getElementById("patient-filter-gender");
    if (genderSelect) {
      genderSelect.addEventListener("change", (e) => {
        currentGender = e.target.value;
        currentPage = 1;
        loadPatients();
      });
    }

    // Blood Group Filter
    const bgSelect = document.getElementById("patient-filter-bg");
    if (bgSelect) {
      bgSelect.addEventListener("change", (e) => {
        currentBloodGroup = e.target.value;
        currentPage = 1;
        loadPatients();
      });
    }

    // Add Patient Button -> Open Drawer
    const btnAdd = document.getElementById("btn-add-patient");
    if (btnAdd) {
      btnAdd.addEventListener("click", () => openPatientForm());
    }

    // Patient Form Submit (Create / Update)
    const form = document.getElementById("patient-form");
    if (form) {
      form.addEventListener("submit", handleFormSubmit);
    }
  };

  const loadPatients = async () => {
    const tableBody = document.getElementById("patients-table-body");
    const emptyState = document.getElementById("patients-empty-state");
    const paginationControls = document.getElementById("patients-pagination");

    if (!tableBody) return;

    // Show skeleton loaders
    tableBody.innerHTML = Array(5)
      .fill(0)
      .map(
        () => `
      <tr class="animate-pulse border-b border-slate-100 dark:border-slate-800">
        <td class="p-4"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28"></div></td>
        <td class="p-4"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div></td>
        <td class="p-4"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12"></div></td>
        <td class="p-4"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div></td>
        <td class="p-4"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></td>
        <td class="p-4 text-right"><div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto"></div></td>
      </tr>
    `
      )
      .join("");

    const params = {
      page: currentPage,
      search: currentSearch,
      gender: currentGender,
      blood_group: currentBloodGroup,
      ordering: currentOrdering,
    };

    const res = await API.get("/api/patients/", params);

    if (!res.ok || !res.success) {
      tableBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-sm text-rose-500">Failed to load patients. Please check authentication.</td></tr>`;
      return;
    }

    const { results, count, total_pages, current_page } = res.data;

    if (!results || results.length === 0) {
      tableBody.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
      if (paginationControls) paginationControls.classList.add("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");
    if (paginationControls) paginationControls.classList.remove("hidden");

    // Render Rows
    tableBody.innerHTML = results
      .map((p) => {
        const initials = p.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        const genderColor =
          p.gender === "F"
            ? "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300"
            : p.gender === "M"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300";

        return `
        <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
          <td class="p-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                ${initials}
              </div>
              <div>
                <button onclick="PatientsModule.viewDetail(${p.id})" class="text-sm font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 text-left transition">
                  ${p.name}
                </button>
                <p class="text-xs text-slate-400">${p.email || "No email"}</p>
              </div>
            </div>
          </td>
          <td class="p-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
            ${p.age} yrs
          </td>
          <td class="p-4">
            <span class="text-xs font-bold px-2 py-0.5 rounded-full ${genderColor}">
              ${p.gender_display || p.gender}
            </span>
          </td>
          <td class="p-4">
            <span class="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              ${p.blood_group || "—"}
            </span>
          </td>
          <td class="p-4 text-xs text-slate-500 dark:text-slate-400">
            ${p.phone || "—"}
          </td>
          <td class="p-4 text-right space-x-1 whitespace-nowrap">
            <button onclick="PatientsModule.viewDetail(${p.id})" title="View Profile" class="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            </button>
            <button onclick="PatientsModule.openEdit(${p.id})" title="Edit Patient" class="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button onclick="PatientsModule.quickAssign(${p.id}, '${p.name.replace(/'/g, "\\'")}')" title="Assign Doctor" class="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            </button>
            <button onclick="PatientsModule.confirmDelete(${p.id}, '${p.name.replace(/'/g, "\\'")}')" title="Delete Patient" class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </td>
        </tr>
      `;
      })
      .join("");

    renderPagination(current_page, total_pages, count);
  };

  const renderPagination = (page, totalPages, totalCount) => {
    const infoEl = document.getElementById("patients-pagination-info");
    const prevBtn = document.getElementById("patients-prev-btn");
    const nextBtn = document.getElementById("patients-next-btn");

    if (infoEl) {
      infoEl.textContent = `Showing Page ${page} of ${totalPages || 1} (${totalCount} total)`;
    }

    if (prevBtn) {
      prevBtn.disabled = page <= 1;
      prevBtn.onclick = () => {
        if (currentPage > 1) {
          currentPage--;
          loadPatients();
        }
      };
    }

    if (nextBtn) {
      nextBtn.disabled = page >= totalPages;
      nextBtn.onclick = () => {
        if (currentPage < totalPages) {
          currentPage++;
          loadPatients();
        }
      };
    }
  };

  const openPatientForm = (patient = null) => {
    const drawerTitle = document.getElementById("patient-drawer-title");
    const idInput = document.getElementById("patient-id");
    const form = document.getElementById("patient-form");
    if (!form) return;

    form.reset();
    idInput.value = "";

    if (patient) {
      drawerTitle.textContent = "Edit Patient Record";
      idInput.value = patient.id;
      document.getElementById("patient-name").value = patient.name || "";
      document.getElementById("patient-age").value = patient.age || "";
      document.getElementById("patient-gender").value = patient.gender || "M";
      document.getElementById("patient-blood-group").value = patient.blood_group || "";
      document.getElementById("patient-phone").value = patient.phone || "";
      document.getElementById("patient-email").value = patient.email || "";
      document.getElementById("patient-address").value = patient.address || "";
      document.getElementById("patient-allergies").value = patient.allergies || "";
      document.getElementById("patient-medical-history").value = patient.medical_history || "";
      document.getElementById("patient-emergency").value = patient.emergency_contact || "";
    } else {
      drawerTitle.textContent = "Register New Patient";
    }

    UI.openDrawer("patient-drawer");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById("patient-id").value;
    const isEdit = Boolean(id);

    const payload = {
      name: document.getElementById("patient-name").value.trim(),
      age: parseInt(document.getElementById("patient-age").value, 10),
      gender: document.getElementById("patient-gender").value,
      blood_group: document.getElementById("patient-blood-group").value,
      phone: document.getElementById("patient-phone").value.trim(),
      email: document.getElementById("patient-email").value.trim(),
      address: document.getElementById("patient-address").value.trim(),
      allergies: document.getElementById("patient-allergies").value.trim(),
      medical_history: document.getElementById("patient-medical-history").value.trim(),
      emergency_contact: document.getElementById("patient-emergency").value.trim(),
    };

    const submitBtn = document.getElementById("btn-submit-patient");
    const origText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Saving...`;

    try {
      const res = isEdit
        ? await API.patch(`/api/patients/${id}/`, payload)
        : await API.post("/api/patients/", payload);

      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;

      if (res.ok && res.success) {
        UI.showToast(
          isEdit ? "Patient updated successfully." : "New patient registered.",
          "success"
        );
        UI.closeDrawer("patient-drawer");
        loadPatients();
        DashboardModule.loadStats();
      } else {
        const errorMsg =
          res.error?.message || Object.values(res.error?.details || {})[0] || "Validation failed.";
        UI.showToast(errorMsg, "error");
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
      UI.showToast("Network error saving patient.", "error");
    }
  };

  const openEdit = async (id) => {
    const res = await API.get(`/api/patients/${id}/`);
    if (res.ok && res.success) {
      openPatientForm(res.data);
    } else {
      UI.showToast("Could not retrieve patient details.", "error");
    }
  };

  const viewDetail = async (id) => {
    const res = await API.get(`/api/patients/${id}/`);
    if (!res.ok || !res.success) {
      UI.showToast("Failed to load patient profile.", "error");
      return;
    }

    const p = res.data;
    const modal = document.getElementById("patient-detail-drawer");
    if (!modal) return;

    // Fill profile fields
    document.getElementById("detail-patient-name").textContent = p.name;
    document.getElementById("detail-patient-id").textContent = `#${p.id}`;
    document.getElementById("detail-patient-age-gender").textContent = `${p.age} years old • ${p.gender_display || p.gender}`;
    document.getElementById("detail-patient-blood-group").textContent = p.blood_group || "Unknown";
    document.getElementById("detail-patient-phone").textContent = p.phone || "—";
    document.getElementById("detail-patient-email").textContent = p.email || "—";
    document.getElementById("detail-patient-address").textContent = p.address || "No address recorded";
    document.getElementById("detail-patient-allergies").textContent = p.allergies || "No known allergies (NKDA)";
    document.getElementById("detail-patient-history").textContent = p.medical_history || "No clinical history documented.";
    document.getElementById("detail-patient-emergency").textContent = p.emergency_contact || "—";

    // Fill assigned doctors
    const doctorsList = document.getElementById("detail-patient-doctors");
    if (doctorsList) {
      if (p.assigned_doctors && p.assigned_doctors.length > 0) {
        doctorsList.innerHTML = p.assigned_doctors
          .map(
            (d) => `
          <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <p class="text-xs font-bold text-slate-900 dark:text-white">Dr. ${d.doctor_name}</p>
                ${
                  d.is_primary
                    ? `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">PRIMARY</span>`
                    : ""
                }
              </div>
              <p class="text-[11px] text-teal-600 dark:text-teal-400">${d.specialization}</p>
              <p class="text-[11px] text-slate-400">${d.hospital || "General Hospital"}</p>
            </div>
            <button onclick="MappingsModule.removeMapping(${d.mapping_id}, '${p.name.replace(/'/g, "\\'")}', '${d.doctor_name.replace(/'/g, "\\'")}')" class="text-xs font-semibold text-rose-500 hover:text-rose-700 p-1.5 rounded transition">
              Unassign
            </button>
          </div>
        `
          )
          .join("");
      } else {
        doctorsList.innerHTML = `
          <div class="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <p class="text-xs text-slate-400 mb-2">No doctors assigned yet.</p>
            <button onclick="PatientsModule.quickAssign(${p.id}, '${p.name.replace(/'/g, "\\'")}')" class="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
              + Assign Physician Now
            </button>
          </div>
        `;
      }
    }

    UI.openDrawer("patient-detail-drawer");
  };

  const confirmDelete = (id, name) => {
    UI.showConfirmModal({
      title: "Delete Patient Record",
      message: `Are you sure you want to remove <strong>${name}</strong>? This action cannot be undone.`,
      confirmText: "Delete Record",
      isDanger: true,
      onConfirm: async () => {
        const res = await API.delete(`/api/patients/${id}/`);
        if (res.ok && res.success) {
          UI.showToast("Patient record removed.", "success");
          loadPatients();
          DashboardModule.loadStats();
        } else {
          UI.showToast(res.error?.message || "Failed to delete patient.", "error");
        }
      },
    });
  };

  const quickAssign = (patientId, patientName) => {
    UI.closeDrawer("patient-detail-drawer");
    window.location.hash = "#mappings";
    setTimeout(() => {
      const select = document.getElementById("wizard-patient-select");
      if (select) {
        select.value = patientId;
      }
    }, 200);
  };

  return {
    init,
    loadPatients,
    openPatientForm,
    openEdit,
    viewDetail,
    confirmDelete,
    quickAssign,
  };
})();

window.PatientsModule = PatientsModule;

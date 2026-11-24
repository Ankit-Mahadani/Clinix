/**
 * MediTrack Patient-Doctor Mappings & Assignment Wizard Module
 */

const MappingsModule = (() => {
  let allMappings = [];

  const init = async () => {
    bindEvents();
    await loadWizardDropdowns();
    await loadMappings();
  };

  const bindEvents = () => {
    const wizardForm = document.getElementById("mapping-wizard-form");
    if (wizardForm) {
      wizardForm.addEventListener("submit", handleWizardSubmit);
    }
  };

  const loadWizardDropdowns = async () => {
    const patientSelect = document.getElementById("wizard-patient-select");
    const doctorSelect = document.getElementById("wizard-doctor-select");

    if (!patientSelect || !doctorSelect) return;

    // Fetch user's patients
    const pRes = await API.get("/api/patients/", { page_size: 100 });
    if (pRes.ok && pRes.success) {
      const patients = pRes.data.results || [];
      patientSelect.innerHTML =
        `<option value="">— Select Patient —</option>` +
        patients
          .map(
            (p) => `<option value="${p.id}">${p.name} (Age: ${p.age}, ${p.gender})</option>`
          )
          .join("");
    }

    // Fetch doctors
    const dRes = await API.get("/api/doctors/", { page_size: 100 });
    if (dRes.ok && dRes.success) {
      const doctors = dRes.data.results || [];
      doctorSelect.innerHTML =
        `<option value="">— Select Doctor —</option>` +
        doctors
          .map(
            (d) =>
              `<option value="${d.id}">Dr. ${d.name} (${d.specialization} • ${d.hospital || "General"})</option>`
          )
          .join("");
    }
  };

  const loadMappings = async () => {
    const tableBody = document.getElementById("mappings-table-body");
    const emptyState = document.getElementById("mappings-empty-state");
    if (!tableBody) return;

    const res = await API.get("/api/mappings/");
    if (!res.ok || !res.success) {
      tableBody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-xs text-rose-500">Failed to load mappings.</td></tr>`;
      return;
    }

    allMappings = res.data || [];

    if (allMappings.length === 0) {
      tableBody.innerHTML = "";
      if (emptyState) emptyState.classList.remove("hidden");
      return;
    }

    if (emptyState) emptyState.classList.add("hidden");

    tableBody.innerHTML = allMappings
      .map((m) => {
        const assignedDate = new Date(m.assigned_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return `
        <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
          <td class="p-4">
            <span class="text-xs font-bold text-slate-900 dark:text-white">${m.patient_name}</span>
          </td>
          <td class="p-4">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">Dr. ${m.doctor_name}</span>
              ${
                m.is_primary
                  ? `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">PRIMARY</span>`
                  : ""
              }
            </div>
          </td>
          <td class="p-4 text-xs text-teal-600 dark:text-teal-400 font-medium">
            ${m.doctor_specialization}
          </td>
          <td class="p-4">
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 uppercase">
              ${m.status}
            </span>
          </td>
          <td class="p-4 text-xs text-slate-400">
            ${assignedDate}
          </td>
          <td class="p-4 text-right">
            <button onclick="MappingsModule.removeMapping(${m.id}, '${m.patient_name.replace(/'/g, "\\'")}', '${m.doctor_name.replace(/'/g, "\\'")}')" class="text-xs font-semibold text-rose-500 hover:text-rose-700 px-2 py-1 rounded-lg transition hover:bg-rose-50 dark:hover:bg-rose-950">
              Unassign
            </button>
          </td>
        </tr>
      `;
      })
      .join("");
  };

  const handleWizardSubmit = async (e) => {
    e.preventDefault();
    const patientId = document.getElementById("wizard-patient-select").value;
    const doctorId = document.getElementById("wizard-doctor-select").value;
    const isPrimary = document.getElementById("wizard-primary-checkbox").checked;
    const notes = document.getElementById("wizard-notes").value.trim();

    if (!patientId || !doctorId) {
      UI.showToast("Please select both a patient and a doctor.", "error");
      return;
    }

    const submitBtn = document.getElementById("btn-submit-wizard");
    const origText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Assigning...`;

    try {
      const res = await API.post("/api/mappings/", {
        patient: parseInt(patientId, 10),
        doctor: parseInt(doctorId, 10),
        is_primary: isPrimary,
        status: "active",
        notes: notes,
      });

      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;

      if (res.ok && res.success) {
        UI.showToast(
          isPrimary
            ? "Doctor assigned as primary physician successfully."
            : "Doctor assigned to patient successfully.",
          "success"
        );
        document.getElementById("mapping-wizard-form").reset();
        await loadMappings();
        DashboardModule.loadStats();
      } else {
        const msg =
          res.error?.message ||
          res.error?.details?.non_field_errors?.[0] ||
          "This doctor is already assigned to this patient.";
        UI.showToast(msg, "error");
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
      UI.showToast("Network error submitting assignment.", "error");
    }
  };

  const removeMapping = (mappingId, patientName, doctorName) => {
    UI.showConfirmModal({
      title: "Remove Assignment",
      message: `Are you sure you want to unassign <strong>Dr. ${doctorName}</strong> from <strong>${patientName}</strong>?`,
      confirmText: "Unassign Doctor",
      isDanger: true,
      onConfirm: async () => {
        const res = await API.delete(`/api/mappings/${mappingId}/`);
        if (res.ok && res.success) {
          UI.showToast("Assignment removed successfully.", "success");
          await loadMappings();
          DashboardModule.loadStats();
        } else {
          UI.showToast(res.error?.message || "Failed to remove assignment.", "error");
        }
      },
    });
  };

  const openWizardForDoctor = (doctorId) => {
    window.location.hash = "#mappings";
    setTimeout(() => {
      const docSelect = document.getElementById("wizard-doctor-select");
      if (docSelect) {
        docSelect.value = doctorId;
      }
    }, 200);
  };

  return {
    init,
    loadWizardDropdowns,
    loadMappings,
    removeMapping,
    openWizardForDoctor,
  };
})();

window.MappingsModule = MappingsModule;

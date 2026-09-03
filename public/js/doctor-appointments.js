const BACKEND_URL = window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:3001';

// Fetch all patient appointments from the backend database
async function loadDoctorAppointments() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/doctor/appointments`);
    const appointments = await response.json();
    renderAppointmentsTable(appointments);
  } catch (error) {
    console.error("Could not load appointments from backend:", error);
  }
}

// Render rows into the table
function renderAppointmentsTable(appointments) {
  let tbody = document.getElementById('appointments-table-body');
  if (!tbody) {
    tbody = document.querySelector('table tbody');
  }
  if (!tbody) return;

  if (!appointments || appointments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px; color:#64748b;">No patient bookings found in database.</td></tr>`;
    return;
  }

  tbody.innerHTML = appointments.map(app => {
    const patientName = app.userId?.name || app.patientName || app.userName || "Patient";
    const patientContact = app.userId?.email || app.patientEmail || app.userEmail || app.userId?.phone || "N/A";
    const doctorName = app.doctorId?.name || "Doctor";
    const specialty = app.doctorId?.specialty || "";
    const slot = app.slot || "N/A";
    const status = app.status || "booked";
    const utr = app.paymentTransactionId || "N/A";

    return `
      <tr>
        <td><strong>${patientName}</strong><br><small style="color:#64748b">${patientContact}</small></td>
        <td><strong>${doctorName}</strong><br><small style="color:#64748b">${specialty}</small></td>
        <td>${slot}</td>
        <td><span style="color:#16a34a; font-weight:600;">PAID</span><br><small style="color:#64748b">${utr}</small></td>
        <td><span style="padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold; background:${status === 'completed' ? '#d1e7dd' : status === 'cancelled' ? '#f8d7da' : '#e0f2fe'}; color:${status === 'completed' ? '#0f5132' : status === 'cancelled' ? '#842029' : '#0369a1'};">${status.toUpperCase()}</span></td>
        <td>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${status === 'booked' ? `
              <button onclick="changeStatus('${app._id}', 'completed')" style="background:#16a34a; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Done</button>
              <button onclick="changeStatus('${app._id}', 'cancelled')" style="background:#dc2626; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Cancel</button>
            ` : `<small style="color:#94a3b8; line-height: 24px;">Updated</small>`}
            <button onclick="viewPatientHistory('${patientContact}', '${patientName}')" style="background:#0284c7; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">📜 History</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Update status
async function changeStatus(appointmentId, newStatus) {
  try {
    await fetch(`${BACKEND_URL}/api/doctor/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    loadDoctorAppointments();
  } catch (err) {
    alert("Error updating appointment status");
  }
}

// View Patient Consultation History Modal
async function viewPatientHistory(patientEmail, patientName) {
  let modal = document.getElementById('doctorHistoryModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'doctorHistoryModal';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.7); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:1rem;';
    modal.innerHTML = `
      <div style="background:white; border-radius:16px; width:100%; max-width:750px; max-height:85vh; overflow-y:auto; padding:1.5rem; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); text-align:left;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:0.75rem; margin-bottom:1rem;">
          <div>
            <h3 style="margin:0; font-size:1.3rem; color:#0f172a;">📜 Patient Consultation History</h3>
            <p style="margin:0.2rem 0 0 0; color:#64748b; font-size:0.88rem;" id="docModalPatientSubtitle">Patient: --</p>
          </div>
          <button onclick="document.getElementById('doctorHistoryModal').style.display='none'" style="background:#e2e8f0; border:none; padding:0.4rem 0.8rem; border-radius:8px; font-weight:700; cursor:pointer; font-size:1rem; color:#475569;">✕</button>
        </div>
        <div id="docModalContent">
          <p style="color:#64748b;">Loading history records...</p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  document.getElementById('docModalPatientSubtitle').textContent = `Patient: ${patientName} (${patientEmail})`;
  const content = document.getElementById('docModalContent');
  content.innerHTML = '<p style="color:#64748b; text-align:center; padding:1.5rem;">Loading consultation history from database...</p>';
  modal.style.display = 'flex';

  try {
    const res = await fetch(`${BACKEND_URL}/api/doctor/patient-history/${encodeURIComponent(patientEmail)}`);
    const history = await res.json();

    if (!history || history.length === 0) {
      content.innerHTML = '<p style="color:#64748b; text-align:center; padding:1.5rem;">No previous consultation records found for this patient.</p>';
      return;
    }

    content.innerHTML = `
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">
          <thead>
            <tr style="background:#f1f5f9; text-align:left; border-bottom:2px solid #cbd5e1;">
              <th style="padding:10px;">Date & Slot</th>
              <th style="padding:10px;">Doctor / Specialty</th>
              <th style="padding:10px;">Hospital</th>
              <th style="padding:10px;">Fee / UTR</th>
              <th style="padding:10px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${history.map(h => {
              const docName = h.doctorId?.name || h.doctorName || 'Doctor';
              const spec = h.doctorId?.specialty || h.specialty || 'General';
              const hosp = h.hospitalName || (h.doctorId?.hospitals && h.doctorId.hospitals[0]) || 'Apollo Hospital';
              const st = h.status || 'booked';
              const stColor = st === 'completed' ? '#16a34a' : st === 'cancelled' ? '#dc2626' : '#2563eb';
              return `
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px;"><strong>${h.slot || 'N/A'}</strong><br><small style="color:#64748b;">${new Date(h.createdAt || Date.now()).toLocaleDateString()}</small></td>
                  <td style="padding:10px;"><strong>${docName}</strong><br><small style="color:#64748b;">${spec}</small></td>
                  <td style="padding:10px; color:#0284c7; font-weight:600;">${hosp}</td>
                  <td style="padding:10px;"><strong>₹${h.fee || 800}</strong><br><small style="font-family:monospace; color:#2563eb;">${h.paymentTransactionId || 'N/A'}</small></td>
                  <td style="padding:10px;"><span style="color:${stColor}; font-weight:700; text-transform:uppercase; font-size:0.8rem;">${st}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    content.innerHTML = '<p style="color:#dc2626; text-align:center; padding:1.5rem;">Failed to fetch consultation records.</p>';
  }
}

// Load immediately on open
loadDoctorAppointments();

// Auto-sync every 5 seconds so new patient bookings appear live
setInterval(loadDoctorAppointments, 5000);

const BACKEND_URL = window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:3000';

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
    const patientName = app.userId?.name || "Patient";
    const patientContact = app.userId?.phone || app.userId?.email || "N/A";
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
        <td><span style="padding:4px 8px; border-radius:4px; font-size:12px; font-weight:bold; background:#e0f2fe; color:#0369a1;">${status.toUpperCase()}</span></td>
        <td>
          ${status === 'booked' ? `
            <button onclick="changeStatus('${app._id}', 'completed')" style="background:#16a34a; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Done</button>
            <button onclick="changeStatus('${app._id}', 'cancelled')" style="background:#dc2626; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; margin-left:4px;">Cancel</button>
          ` : `<small style="color:#94a3b8">Updated</small>`}
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

// Load immediately on open
loadDoctorAppointments();

// Auto-sync every 5 seconds so new patient bookings appear live
setInterval(loadDoctorAppointments, 5000);

const BACKEND_URL = window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:3000';

// 1. Fetch live appointments from shared database
async function loadIncomingAppointments() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/doctor/appointments`);
    const appointments = await response.json();
    renderDoctorTable(appointments);
  } catch (error) {
    console.error("Failed to load doctor appointments:", error);
  }
}

// 2. Render appointments into the doctor table
function renderDoctorTable(appointments) {
  const tableBody = document.getElementById('doctor-appointment-table-body');
  if (!tableBody) return;

  if (!appointments || appointments.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">No patient bookings found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = appointments.map(app => {
    const patientName = app.userId?.name || "Patient";
    const patientEmail = app.userId?.email || "N/A";
    const patientPhone = app.userId?.phone || "N/A";
    const doctorName = app.doctorId?.name || "Assigned Doctor";
    const slot = app.slot || "N/A";
    const utr = app.paymentTransactionId || "N/A";
    const status = app.status || "booked";

    return `
      <tr>
        <td>
          <strong>${patientName}</strong><br>
          <small style="color: #64748b;">${patientEmail} | ${patientPhone}</small>
        </td>
        <td>${doctorName}</td>
        <td><strong>${slot}</strong></td>
        <td>
          <span style="color: #16a34a; font-weight: 600;">PAID</span><br>
          <small style="color: #64748b;">${utr}</small>
        </td>
        <td><span class="status-badge ${status}">${status}</span></td>
        <td>
          ${status === 'booked' ? `
            <button class="btn btn-done" onclick="updateAppointmentStatus('${app._id}', 'completed')">Done</button>
            <button class="btn btn-cancel" onclick="updateAppointmentStatus('${app._id}', 'cancelled')">Cancel</button>
          ` : `<small style="color:#94a3b8;">No actions</small>`}
        </td>
      </tr>
    `;
  }).join('');
}

// 3. Update appointment status (Mark completed or cancel)
async function updateAppointmentStatus(appointmentId, newStatus) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/doctor/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (res.ok) {
      loadIncomingAppointments();
    } else {
      alert("Failed to update status");
    }
  } catch (err) {
    console.error("Status update error:", err);
  }
}

// Initial load + poll every 5 seconds
loadIncomingAppointments();
setInterval(loadIncomingAppointments, 5000);

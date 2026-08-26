const BACKEND_URL = 'http://localhost:3000';

async function loadDoctorAppointments() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/doctor/appointments`);
    const appointments = await res.json();
    
    const tableBody = document.getElementById('appointments-table-body') || document.getElementById('doctor-appointment-table-body');
    if (!tableBody) return;

    if (!appointments || appointments.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No patient bookings found.</td></tr>';
      return;
    }

    tableBody.innerHTML = appointments.map(app => `
      <tr>
        <td><strong>${app.userId?.name || 'Patient'}</strong><br><small>${app.userId?.phone || ''}</small></td>
        <td>${app.doctorId?.name || 'Doctor'} (${app.doctorId?.specialty || ''})</td>
        <td>${app.slot || 'N/A'}</td>
        <td><span class="badge">${app.status || 'booked'}</span></td>
        <td>
          <button onclick="updateStatus('${app._id}', 'completed')">Done</button>
          <button onclick="updateStatus('${app._id}', 'cancelled')">Cancel</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error("Error loading doctor appointments:", err);
  }
}

async function updateStatus(id, newStatus) {
  await fetch(`${BACKEND_URL}/api/doctor/appointments/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });
  loadDoctorAppointments();
}

// Initial fetch + auto-sync every 5 seconds
loadDoctorAppointments();
setInterval(loadDoctorAppointments, 5000);

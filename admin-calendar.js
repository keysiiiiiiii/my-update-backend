document.addEventListener('DOMContentLoaded', () => {
  const daysContainer = document.getElementById("calendar-days");
  const monthYearEl = document.getElementById("month-year");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const modal = document.getElementById("calendar-modal");
  const closeBtn = document.getElementById("close-modal");
  const modalBody = document.getElementById("modal-body");

  let currentDate = new Date();

  function renderCalendar(date) {
    const y = date.getFullYear();
    const m = date.getMonth();
    const firstDow = new Date(y, m, 1).getDay();
    const lastDay = new Date(y, m + 1, 0).getDate();
    const today = new Date();

    monthYearEl.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    daysContainer.innerHTML = "";

    for (let i = 0; i < firstDow; i++) {
      daysContainer.innerHTML += `<div class="day empty"></div>`;
    }

    for (let d = 1; d <= lastDay; d++) {
      const fullDate = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      daysContainer.innerHTML += `
        <div class="day" data-date="${fullDate}">
          ${d}
        </div>`;
    }

    const trail = (7 - ((firstDow + lastDay) % 7)) % 7;
    for (let i = 0; i < trail; i++) {
      daysContainer.innerHTML += `<div class="day empty"></div>`;
    }

    daysContainer.querySelectorAll('.day[data-date]').forEach(el => {
      el.addEventListener('click', () => {
        showDetailsForDate(el.dataset.date);
      });
    });
  }

  async function showDetailsForDate(date) {
    modal.style.display = 'flex';
    modalBody.innerHTML = `<h3>Loading for ${date}...</h3>`;

    const [leaveRes, attendanceRes] = await Promise.all([
      fetch(`/api/leaves/date/${date}`),
      fetch(`/api/attendance/date/${date}`)
    ]);

    const leaves = await leaveRes.json();
    const attendance = await attendanceRes.json();

    let leaveHTML = `<h2>Leave Requests</h2>`;
    if (leaves.length === 0) {
      leaveHTML += `<p>No leave requests.</p>`;
    } else {
      leaveHTML += `<ul>`;
      leaves.forEach(req => {
        leaveHTML += `
          <li>
            <strong>${req.staff_name}</strong><br>
            Reason: ${req.reason}<br>
            Status: ${req.status}<br>
            <a href="${req.file_url}" target="_blank">View File</a><br>
            ${req.status === 'pending' ? `
              <button onclick="approveLeave('${req.id}')">Approve</button>
              <button onclick="rejectLeave('${req.id}')">Reject</button>
            ` : ''}
          </li><hr>`;
      });
      leaveHTML += `</ul>`;
    }

    let attendanceHTML = `<h2>Attendance Logs</h2>`;
    if (attendance.length === 0) {
      attendanceHTML += `<p>No attendance records.</p>`;
    } else {
      attendanceHTML += `<ul>`;
      attendance.forEach(log => {
        attendanceHTML += `
          <li>${log.staff_name || log.staff_id} - ${log.timestamp} - Status: ${log.status}</li>`;
      });
      attendanceHTML += `</ul>`;
    }

    modalBody.innerHTML = leaveHTML + attendanceHTML;
  }

  window.approveLeave = async function (id) {
    await fetch(`/api/leaves/${id}/approve`, { method: 'POST' });
    alert('Approved!');
    modal.style.display = 'none';
    renderCalendar(currentDate);
  };

  window.rejectLeave = async function (id) {
    await fetch(`/api/leaves/${id}/reject`, { method: 'POST' });
    alert('Rejected!');
    modal.style.display = 'none';
    renderCalendar(currentDate);
  };

  prevBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });

  nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  renderCalendar(currentDate);
});

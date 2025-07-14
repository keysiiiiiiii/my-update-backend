// vicepresident.js
document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('request-table-body');
  if (!tbody) return;

  // Load leave requests from MySQL
  function loadVPRequests() {
    fetch('http://localhost:3000/api/requests-for-vp/vp')
      .then(res => res.json())
      .then(data => {
        tbody.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6">No leave requests found.</td></tr>';
          return;
        }

        data.forEach(req => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${req.staff_id}</td>
            <td>${req.staff_name}</td>
            <td>${req.date}</td>
            <td>${req.reason}</td>
            <td><a href="${req.file_url}" download>${req.file_url.split('/').pop()}</a></td>
            <td>
              <button class="approve-btn" data-id="${req.id}">Approve</button>
              <button class="deny-btn" data-id="${req.id}">Deny</button>
              <span class="status">${req.status}</span>
            </td>
          `;
          tbody.appendChild(tr);
        });
      })
      .catch(err => {
        console.error('Error fetching requests:', err);
        tbody.innerHTML = '<tr><td colspan="6">Error loading requests</td></tr>';
      });
  }

  // Handle Approve/Deny buttons
  tbody.addEventListener('click', (e) => {
    const btn = e.target;
    if (!btn.matches('.approve-btn, .deny-btn')) return;

    const id = btn.dataset.id;
    const status = btn.classList.contains('approve-btn') ? 'approved' : 'denied';

    fetch('http://localhost:3000/api/requests-for-vp/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
      .then(res => res.json())
      .then(() => loadVPRequests())
      .catch(err => console.error('Error updating status:', err));
  });

  loadVPRequests();
});

// common.js

// — Helpers —
function goToLogin(role) {
  localStorage.setItem('selectedRole', role);
  window.location.href = 'login.html'; // ✅ All roles use this
}
function goBackToRoleSelect() {
  window.location.href = 'index.html';
}
function redirectToRolePage() {
  const role = localStorage.getItem('selectedRole');
  if (role === 'Vice President') return 'vicepresident.html';
  if (role === 'Faculty')        return 'faculty.html';
  if (role === 'Admin')          return 'admin-dashboard.html';
  if (role === 'Staff')          return 'staff.html';
}
function showView(id) {
  ['dashboard-view','leave-view','account-view'].forEach(v => {
    const el = document.getElementById(v);
    if (el) el.style.display = v===id?'block':'none';
  });
  document.querySelectorAll('.sidebar a').forEach(a => {
    a.classList.toggle('active', (a.getAttribute('onclick')||'').includes(id));
  });
}
function logout() {
  localStorage.removeItem('selectedRole');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  //
  // — Login page ↑ —
  //
  const loginForm = document.querySelector('form[onsubmit*="login"]');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const userId   = document.getElementById('id').value;
    const password = document.getElementById('password').value;
    const role     = localStorage.getItem('selectedRole');

    localStorage.setItem('userId', userId);

    // Optional: store full name, just for display
    if (role === 'Admin') {
      // Replace this check with actual backend validation if needed
      if (userId === 'cedie7' && password === 'group7') {
        localStorage.setItem('fullName', 'Admin');
        window.location.href = 'admin-dashboard.html';
      } else {
        alert('Invalid admin credentials');
      }
    } else {
      // Assume login OK for other roles (for now)
      localStorage.setItem('fullName', role + ' User');
      window.location.href = redirectToRolePage();
    }
  });
    // eye-toggle on login
    const pw = document.getElementById('password');
    const toggle = document.getElementById('togglePassword');
    if (pw && toggle) {
      toggle.addEventListener('click', e => {
        e.preventDefault();
        const hidden = pw.type==='password';
        pw.type   = hidden?'text':'password';
        toggle.style.opacity = hidden?'1':'0.6';
      });
    }
    // role-title
    const titleEl = document.getElementById('role-title');
    const role    = localStorage.getItem('selectedRole');
    if (titleEl && role) titleEl.innerText = 'Login as '+role;
  }

  //
  // — Multi-view pages (VP/Faculty/Staff) ↑ —
  //
  if (document.getElementById('dashboard-view')) {
    showView('dashboard-view');

    // sidebar logout
    document.querySelectorAll('.sidebar a').forEach(a => {
      if ((a.getAttribute('onclick')||'').includes('logout')) {
        a.addEventListener('click', e => { e.preventDefault(); logout(); });
      }
    });

    // account settings: prefill role + ID + name
    const roleDisp  = document.getElementById('employeeRole');
    const headerId  = document.querySelector('#account-view .employee-id');
    const headerName= document.querySelector('#account-view .account-header h1');
    if (roleDisp)   roleDisp.value = localStorage.getItem('selectedRole')||'';
    if (headerId)   headerId.textContent   = 'ID: '+(localStorage.getItem('userId')||'');
    if (headerName) headerName.textContent = localStorage.getItem('fullName')||headerName.textContent;

    // account eye-toggle
    document.querySelectorAll('#account-view .password-wrapper').forEach(w => {
      const inp = w.querySelector('input');
      const btn = w.querySelector('.eye-btn');
      if (inp && btn) {
        btn.addEventListener('click', e => {
          if (btn.disabled) return;
          e.preventDefault();
          const hidden = inp.type==='password';
          inp.type = hidden?'text':'password';
          btn.style.opacity = hidden?'1':'0.6';
        });
      }
    });

    // Edit↔Save
    const editBtn = document.querySelector('.btn-edit');
    const eyeBtns = document.querySelectorAll('#account-view .eye-btn');
    eyeBtns.forEach(b=>b.disabled=true);
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        const editing = editBtn.textContent.trim()==='Edit';
        document.querySelectorAll('#account-view .account-form input, #account-view .account-form select')
          .forEach(f=>f.disabled=!editing);
        eyeBtns.forEach(b=>b.disabled=!editing);
        editBtn.textContent = editing?'Save':'Edit';
        // on Save you can persist fullName if desired
      });
    }

    // Add-email button
    const addEmail = document.querySelector('#account-view .add-email-btn');
    const emailSec = document.querySelector('#account-view .email-section');
    if (addEmail && emailSec) {
      addEmail.addEventListener('click', () => {
        const email = prompt('Enter new email address:');
        if (!email) return;
        const div = document.createElement('div');
        div.className = 'email-item';
        div.innerHTML = `
          <div class="email-left">
            <input type="checkbox" disabled>
            <label>${email}</label>
          </div>
          <span class="email-timestamp">just now</span>
        `;
        emailSec.insertBefore(div, addEmail);
      });
    }
  }
});

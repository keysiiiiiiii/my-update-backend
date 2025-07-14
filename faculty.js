// staff.js
document.addEventListener('DOMContentLoaded', () => {
  const daysContainer = document.getElementById("calendar-days");
  if (!daysContainer) return;

  const monthYearEl = document.getElementById("month-year");
  const prevBtn     = document.getElementById("prev");
  const nextBtn     = document.getElementById("next");
  const modal       = document.getElementById("leave-modal");
  const closeBtn    = document.getElementById("close-modal");
  const form        = document.getElementById("leave-form");
  const dateSpan    = document.getElementById("modal-date");
  const reasonEl    = document.getElementById("leave-reason");
  const fileEl      = document.getElementById("leave-file");

  const roleKey     = (localStorage.getItem('selectedRole')||'staff').toLowerCase();
  let   currentDate = new Date();

  function renderCalendar(date) {
    const y        = date.getFullYear();
    const m        = date.getMonth();
    const firstDow = new Date(y,m,1).getDay();
    const lastDay  = new Date(y,m+1,0).getDate();
    const today    = new Date();

    monthYearEl.textContent = 
      date.toLocaleString('default',{month:'long',year:'numeric'});
    daysContainer.innerHTML = "";

    // blanks
    for(let i=0;i<firstDow;i++){
      daysContainer.innerHTML += `<div class="day empty"></div>`;
    }

    // days
    for(let d=1; d<=lastDay; d++){
      const key = `${roleKey}-request-${y}-${m+1}-${d}`;
      const rec = JSON.parse(localStorage.getItem(key)||'null');
      const status = rec?.status||'';
      const isToday = d===today.getDate()&&m===today.getMonth()&&y===today.getFullYear();
      daysContainer.innerHTML += `
        <div class="day ${status} ${isToday?'today':''}" 
             data-date="${y}-${m+1}-${d}">
          ${d}
        </div>`;
    }
    // trail blanks
    const trail = (7 - ((firstDow+lastDay)%7))%7;
    for(let i=0;i<trail;i++){
      daysContainer.innerHTML += `<div class="day empty"></div>`;
    }

    // clicks
    daysContainer.querySelectorAll('.day[data-date]').forEach(el=>{
      el.addEventListener('click', ()=>{
        dateSpan.innerText = el.dataset.date;
        reasonEl.value     = '';
        fileEl.value       = '';
        form.style.display = 'block';
        modal.style.display= 'flex';
      });
    });
  }

  prevBtn.addEventListener('click', ()=>{ 
    currentDate.setMonth(currentDate.getMonth()-1);
    renderCalendar(currentDate);
  });
  nextBtn.addEventListener('click', ()=>{
    currentDate.setMonth(currentDate.getMonth()+1);
    renderCalendar(currentDate);
  });

  // modal handlers
  closeBtn.addEventListener('click', ()=> modal.style.display='none');
  modal.addEventListener('click', e=>{
    if(e.target===modal) modal.style.display='none';
  });

  // submit form
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const dateKey = dateSpan.innerText;
    if(!fileEl.files.length) return;
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(
        `${roleKey}-request-${dateKey}`,
        JSON.stringify({
          reason: reasonEl.value,
          fileName: fileEl.files[0].name,
          fileData: reader.result,
          status: 'pending'
        })
      );
      modal.style.display='none';
      renderCalendar(currentDate);
    };
    reader.readAsDataURL(fileEl.files[0]);
  });

  renderCalendar(currentDate);
});

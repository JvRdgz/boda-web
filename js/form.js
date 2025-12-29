// js/form.js
// Lógica para el formulario de confirmación: mostrar/ocultar campo de pareja,
// mostrar aviso si se selecciona el autobús de ida y validar el nombre de la pareja.

document.addEventListener('DOMContentLoaded', function(){
  const partnerSelect = document.getElementById('partner-attendance');
  const partnerRow = document.getElementById('partner-name-row');
  const partnerInput = document.getElementById('partner-name');
  const busIda = document.getElementById('bus-ida');
  const busVuelta = document.getElementById('bus-vuelta');
  const busWarning = document.getElementById('bus-warning');
  const form = document.getElementById('rsvp-form');
  const guestInput = document.getElementById('guest-name');
  const attendance = document.getElementById('attendance');
  const successBox = document.getElementById('form-success');
  const STORAGE_KEY = 'boda_rsvp_draft';

  if(partnerSelect){
    partnerSelect.addEventListener('change', function(){
      const val = partnerSelect.value;
      if(val === 'si'){
        partnerRow.style.display = '';
        partnerInput.setAttribute('required','required');
        partnerInput.focus();
      } else {
        partnerRow.style.display = 'none';
        partnerInput.removeAttribute('required');
        partnerInput.value = '';
        partnerInput.setCustomValidity('');
      }
      saveDraft();
    });
  }

  if(busIda){
    busIda.addEventListener('change', function(){
      busWarning.style.display = busIda.checked ? '' : 'none';
      saveDraft();
    });
  }

  // Guardado automático de borrador en localStorage
  function saveDraft(){
    const data = {
      guest_name: guestInput ? guestInput.value : '',
      attendance: attendance ? attendance.value : '',
      partner_attendance: partnerSelect ? partnerSelect.value : '',
      partner_name: partnerInput ? partnerInput.value : '',
      bus_ida: busIda ? !!busIda.checked : false,
      bus_vuelta: busVuelta ? !!busVuelta.checked : false
    };
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }catch(e){}
  }

  function loadDraft(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return;
      const data = JSON.parse(raw);
      if(guestInput && data.guest_name) guestInput.value = data.guest_name;
      if(attendance && data.attendance) attendance.value = data.attendance;
      if(partnerSelect && data.partner_attendance) partnerSelect.value = data.partner_attendance;
      if(partnerInput && data.partner_name) partnerInput.value = data.partner_name;
      if(busIda) busIda.checked = !!data.bus_ida;
      if(busVuelta) busVuelta.checked = !!data.bus_vuelta;

      // Ajustes visuales según el borrador
      if(partnerSelect && partnerSelect.value === 'si'){
        partnerRow.style.display = '';
        partnerInput.setAttribute('required','required');
      }
      if(busIda && busIda.checked){
        busWarning.style.display = '';
      }
    }catch(e){}
  }

  // Guardar al cambiar cualquier campo relevante
  [guestInput, attendance, partnerSelect, partnerInput, busIda, busVuelta].forEach(el => {
    if(!el) return;
    const ev = (el.tagName === 'INPUT' && el.type === 'checkbox') ? 'change' : 'input';
    el.addEventListener(ev, saveDraft);
  });

  // Cargar borrador al inicio
  loadDraft();

  // Envío: comprobación extra de validación para el nombre de la pareja si corresponde
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      // Validación: si la pareja va, el campo partner-name debe estar relleno
      if(partnerSelect && partnerSelect.value === 'si'){
        if(!partnerInput.value.trim()){
          partnerInput.setCustomValidity('Por favor, indica el nombre y apellidos de tu acompañante.');
          partnerInput.reportValidity();
          return;
        } else {
          partnerInput.setCustomValidity('');
        }
      }

      // Preparar resumen en HTML (para el modal)
      const lines = [];
      if(guestInput && guestInput.value) lines.push(`<p><strong>Nombre:</strong> ${escapeHtml(guestInput.value)}</p>`);
      lines.push(`<p><strong>Asistencia:</strong> ${attendance ? (attendance.value === 'si' ? 'Sí' : 'No') : '—'}</p>`);
      if(partnerSelect && partnerSelect.value === 'si'){
        lines.push(`<p><strong>Acompañante:</strong> ${partnerInput.value ? escapeHtml(partnerInput.value) : '—'}</p>`);
      }
      lines.push(`<p><strong>Autobús ida:</strong> ${busIda && busIda.checked ? 'Sí' : 'No'}</p>`);
      lines.push(`<p><strong>Autobús vuelta:</strong> ${busVuelta && busVuelta.checked ? 'Sí' : 'No'}</p>`);

      // Mostrar modal con el resumen
      openConfirmModal(lines.join(''));
    });
  }

  /* Modal confirmation handling */
  const modal = document.getElementById('confirm-modal');
  const modalBody = document.getElementById('confirm-modal-body');
  const modalConfirmBtn = document.getElementById('modal-confirm');
  const modalCancelBtn = document.getElementById('modal-cancel');
  let lastSummaryHtml = '';
  let modalState = 'idle'; // 'idle' | 'confirm' | 'done'

  function openConfirmModal(html){
    if(!modal) return;
    lastSummaryHtml = html;
    modalState = 'confirm';
    modalBody.innerHTML = html;
    document.body.classList.add('modal-open');
    modal.setAttribute('aria-hidden', 'false');
    // asegurar que el success box (si hubiera quedado por pruebas anteriores) no se muestre
    if(successBox){ successBox.style.display = 'none'; successBox.innerHTML = ''; }
    // focus
    setTimeout(()=> modalConfirmBtn && modalConfirmBtn.focus(), 100);
    // asegurar estado inicial de botones
    if(modalConfirmBtn){
      modalConfirmBtn.textContent = 'Confirmar';
      modalConfirmBtn.disabled = false;
      modalConfirmBtn.removeEventListener('click', handleCloseOnce);
      modalConfirmBtn.removeEventListener('click', handleConfirm);
      modalConfirmBtn.addEventListener('click', handleConfirm);
    }
    if(modalCancelBtn){ modalCancelBtn.style.display = ''; modalCancelBtn.disabled = false; }
    // bind overlay click to close
    const overlay = modal.querySelector('.modal-overlay');
    if(overlay){ overlay.addEventListener('click', handleCancelOnce); }
    // trap tabs between confirm and cancel
    document.addEventListener('keydown', trapTab);
  }

  function closeConfirmModal(){
    if(!modal) return;
    document.body.classList.remove('modal-open');
    modal.setAttribute('aria-hidden', 'true');
    // quitar listener de overlay (si existía)
    const overlay = modal.querySelector('.modal-overlay');
    if(overlay) overlay.removeEventListener('click', handleCancelOnce);
    document.removeEventListener('keydown', trapTab);
  }

  function handleConfirm(){
    // Simular trabajo de backend: mostrar estado y luego mostrar confirmación dentro del modal
    if(modalConfirmBtn) modalConfirmBtn.disabled = true;
    if(modalCancelBtn) modalCancelBtn.disabled = true;
    modalBody.innerHTML = '<p>Guardando tu confirmación…</p>';
    // breve retardo simulado
    setTimeout(function(){
      try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
      Array.from(form.elements).forEach(el => el.disabled = true);
      const submitBtn = form.querySelector('button[type="submit"]');
      if(submitBtn) submitBtn.textContent = 'Confirmado ✅';

      // Mostrar éxito dentro del modal junto al resumen
      modalState = 'done';
      modalBody.innerHTML = '<p><strong>¡Gracias! Tu confirmación ha sido registrada.</strong></p>' + lastSummaryHtml;

      // Ajustar acciones: ocultar cancelar y convertir confirmar en Cerrar
      if(modalCancelBtn) modalCancelBtn.style.display = 'none';
      if(modalConfirmBtn){
        modalConfirmBtn.disabled = false;
        modalConfirmBtn.textContent = 'Cerrar';
        // quitar listener de confirm y asignar cierre
        modalConfirmBtn.removeEventListener('click', handleConfirm);
        modalConfirmBtn.addEventListener('click', handleCloseOnce);
        modalConfirmBtn.focus();
      }

      // quitar posibilidad de cerrar por overlay para evitar cierres accidentales en pantalla final
      const overlay = modal.querySelector('.modal-overlay');
      if(overlay) overlay.removeEventListener('click', handleCancelOnce);

    }, 800);
  }

  function handleCloseOnce(){ handleClose(); }

  function handleClose(){
    closeConfirmModal();
    // dejar el formulario deshabilitado y llevar foco a navegación
    try{ const navFirst = document.querySelector('nav a'); if(navFirst) navFirst.focus(); }catch(e){}
  }

  function handleCancel(){
    // Cancelar la selección: limpiar campos del formulario y borrar borrador
    try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
    form.reset();
    // ocultar cosas dependientes
    partnerRow.style.display = 'none';
    partnerInput.removeAttribute('required');
    busWarning.style.display = 'none';
    if(successBox){ successBox.style.display = 'none'; successBox.innerHTML = ''; }
    try{ guestInput.focus(); }catch(e){}
    closeConfirmModal();
  }

  function handleCancelOnce(){ handleCancel(); }

  if(modalConfirmBtn) modalConfirmBtn.addEventListener('click', handleConfirm);
  if(modalCancelBtn) modalCancelBtn.addEventListener('click', handleCancel);

  function trapTab(e){
    if(e.key !== 'Tab') return;
    // recalcular botones focuseables visibles dentro del modal
    const buttons = Array.from(modal.querySelectorAll('button')).filter(b => !b.disabled && b.offsetParent !== null);
    if(!buttons.length) return;
    const first = buttons[0], last = buttons[buttons.length-1];
    if(e.shiftKey){ if(document.activeElement === first){ e.preventDefault(); last.focus(); } }
    else { if(document.activeElement === last){ e.preventDefault(); first.focus(); } }
  }

  // pequeños helpers
  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, function(s){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s];
    });
  }

});
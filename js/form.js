// js/form.js
// Lógica para el formulario de confirmación: mostrar/ocultar campo de pareja,
// mostrar aviso si se selecciona el autobús de ida y validar el nombre de la pareja.

document.addEventListener('DOMContentLoaded', function () {
    const partnerSelect = document.getElementById('partner-attendance');
    const partnerRow = document.getElementById('partner-name-row');
    const partnerInput = document.getElementById('partner-name');
    const busIda = document.getElementById('bus-ida');
    const busVuelta = document.getElementById('bus-vuelta');
    const busWarning = document.getElementById('bus-warning');
    const foodAllergens = document.getElementById('food-allergens');
    const allergensRow = document.getElementById('allergens-row');
    const allergensDetail = document.getElementById('allergens-detail');
    const foodVegetarian = document.getElementById('food-vegetarian');
    const form = document.getElementById('rsvp-form');
    const guestInput = document.getElementById('guest-name');
    const attendance = document.getElementById('attendance');
    const successBox = document.getElementById('form-success');
    const STORAGE_KEY = 'boda_rsvp_draft';
    // Configuración para envío a Google Sheets via Apps Script
    // Sustituye por tu URL de despliegue y el token secreto que fijes en el Apps Script
    const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxdbWLXNggaOO2QzfjG0uy_Ietsj2WtUcQROOM0WhwukgMNUW6T0qWCPGlPHxTNpYBI0w/exec'; // e.g. 'https://script.google.com/macros/s/XXX/exec'
    const SHEET_TOKEN = 'JYL_rsvp_2025_x9f8a7c6d'; // token secreto para validar peticiones

    if (partnerSelect) {
        partnerSelect.addEventListener('change', function () {
            const val = partnerSelect.value;
            if (val === 'si') {
                partnerRow.style.display = '';
                partnerInput.setAttribute('required', 'required');
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

    if (busIda) {
        busIda.addEventListener('change', function () {
            busWarning.style.display = busIda.checked ? '' : 'none';
            saveDraft();
        });
    }

    if (foodAllergens) {
        foodAllergens.addEventListener('change', function () {
            if (foodAllergens.checked) {
                allergensRow.style.display = '';
                allergensDetail.setAttribute('required', 'required');
                allergensDetail.focus();
            } else {
                allergensRow.style.display = 'none';
                allergensDetail.removeAttribute('required');
                allergensDetail.value = '';
                allergensDetail.setCustomValidity('');
            }
            saveDraft();
        });
    }

    // Guardado automático de borrador en localStorage
    function saveDraft() {
        const data = {
            guest_name: guestInput ? guestInput.value : '',
            attendance: attendance ? attendance.value : '',
            partner_attendance: partnerSelect ? partnerSelect.value : '',
            partner_name: partnerInput ? partnerInput.value : '',
            bus_ida: busIda ? !!busIda.checked : false,
            bus_vuelta: busVuelta ? !!busVuelta.checked : false,
            food_allergens: foodAllergens ? !!foodAllergens.checked : false,
            allergens_detail: allergensDetail ? allergensDetail.value : '',
            food_vegetarian: foodVegetarian ? !!foodVegetarian.checked : false
        };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { }
    }

    function loadDraft() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (guestInput && data.guest_name) guestInput.value = data.guest_name;
            if (attendance && data.attendance) attendance.value = data.attendance;
            if (partnerSelect && data.partner_attendance) partnerSelect.value = data.partner_attendance;
            if (partnerInput && data.partner_name) partnerInput.value = data.partner_name;
            if (busIda) busIda.checked = !!data.bus_ida;
            if (busVuelta) busVuelta.checked = !!data.bus_vuelta;
            if (foodAllergens) foodAllergens.checked = !!data.food_allergens;
            if (allergensDetail && data.allergens_detail) allergensDetail.value = data.allergens_detail;
            if (foodVegetarian) foodVegetarian.checked = !!data.food_vegetarian;

            // Ajustes visuales según el borrador
            if (partnerSelect && partnerSelect.value === 'si') {
                partnerRow.style.display = '';
                partnerInput.setAttribute('required', 'required');
            }
            if (busIda && busIda.checked) {
                busWarning.style.display = '';
            }
            if (foodAllergens && foodAllergens.checked) {
                allergensRow.style.display = '';
                allergensDetail.setAttribute('required', 'required');
            }
        } catch (e) { }
    }

    // Guardar al cambiar cualquier campo relevante
    [guestInput, attendance, partnerSelect, partnerInput, busIda, busVuelta, foodAllergens, allergensDetail, foodVegetarian].forEach(el => {
        if (!el) return;
        const ev = (el.tagName === 'INPUT' && el.type === 'checkbox') ? 'change' : 'input';
        el.addEventListener(ev, saveDraft);
    });

    // Cargar borrador al inicio
    loadDraft();

    // Envío: comprobación extra de validación para el nombre de la pareja si corresponde
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            // Validación: si la pareja va, el campo partner-name debe estar relleno
            if (partnerSelect && partnerSelect.value === 'si') {
                if (!partnerInput.value.trim()) {
                    partnerInput.setCustomValidity('Por favor, indica el nombre y apellidos de tu acompañante.');
                    partnerInput.reportValidity();
                    return;
                } else {
                    partnerInput.setCustomValidity('');
                }
            }
            if (foodAllergens && foodAllergens.checked) {
                if (!allergensDetail.value.trim()) {
                    allergensDetail.setCustomValidity('Por favor, indica tus alergias o intolerancias.');
                    allergensDetail.reportValidity();
                    return;
                } else {
                    allergensDetail.setCustomValidity('');
                }
            }

            // Preparar resumen en HTML (para el modal)
            const lines = [];
            if (guestInput && guestInput.value) lines.push(`<p><strong>Nombre:</strong> ${escapeHtml(guestInput.value)}</p>`);
            lines.push(`<p><strong>Asistencia:</strong> ${attendance ? (attendance.value === 'si' ? 'Sí' : 'No') : '—'}</p>`);
            if (partnerSelect && partnerSelect.value === 'si') {
                lines.push(`<p><strong>Acompañante:</strong> ${partnerInput.value ? escapeHtml(partnerInput.value) : '—'}</p>`);
            }
            lines.push(`<p><strong>Autobús ida:</strong> ${busIda && busIda.checked ? 'Sí' : 'No'}</p>`);
            lines.push(`<p><strong>Autobús vuelta:</strong> ${busVuelta && busVuelta.checked ? 'Sí' : 'No'}</p>`);
            lines.push(`<p><strong>Alergias/intolerancias:</strong> ${foodAllergens && foodAllergens.checked ? 'Sí' : 'No'}</p>`);
            if (foodAllergens && foodAllergens.checked) {
                lines.push(`<p><strong>Detalles:</strong> ${allergensDetail.value ? escapeHtml(allergensDetail.value) : '—'}</p>`);
            }
            lines.push(`<p><strong>Menú vegetariano:</strong> ${foodVegetarian && foodVegetarian.checked ? 'Sí' : 'No'}</p>`);

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

    function openConfirmModal(html) {
        if (!modal) return;
        lastSummaryHtml = html;
        modalState = 'confirm';
        modalBody.innerHTML = html;
        document.body.classList.add('modal-open');
        modal.setAttribute('aria-hidden', 'false');
        // asegurar que el success box (si hubiera quedado por pruebas anteriores) no se muestre
        if (successBox) { successBox.style.display = 'none'; successBox.innerHTML = ''; }
        // focus
        setTimeout(() => modalConfirmBtn && modalConfirmBtn.focus(), 100);
        // asegurar estado inicial de botones
        if (modalConfirmBtn) {
            modalConfirmBtn.textContent = 'Confirmar';
            modalConfirmBtn.disabled = false;
            modalConfirmBtn.removeEventListener('click', handleCloseOnce);
            modalConfirmBtn.removeEventListener('click', handleConfirm);
            modalConfirmBtn.addEventListener('click', handleConfirm);
        }
        if (modalCancelBtn) { modalCancelBtn.style.display = ''; modalCancelBtn.disabled = false; }
        // bind overlay click to close
        const overlay = modal.querySelector('.modal-overlay');
        if (overlay) { overlay.addEventListener('click', handleCancelOnce); }
        // trap tabs between confirm and cancel
        document.addEventListener('keydown', trapTab);
    }

    function closeConfirmModal() {
        if (!modal) return;
        document.body.classList.remove('modal-open');
        modal.setAttribute('aria-hidden', 'true');
        // quitar listener de overlay (si existía)
        const overlay = modal.querySelector('.modal-overlay');
        if (overlay) overlay.removeEventListener('click', handleCancelOnce);
        document.removeEventListener('keydown', trapTab);
    }

    function handleConfirm() {
        // Enviar datos al backend (Google Apps Script). Si no está configurado, se simula como antes.
        if (modalConfirmBtn) modalConfirmBtn.disabled = true;
        if (modalCancelBtn) modalCancelBtn.disabled = true;
        modalBody.innerHTML = '<p>Guardando tu confirmación…</p>';

        // Construir objeto con los datos a enviar
        const payload = {
            guest_name: guestInput ? guestInput.value.trim() : '',
            attendance: attendance ? attendance.value : '',
            partner_attendance: partnerSelect ? partnerSelect.value : '',
            partner_name: partnerInput ? partnerInput.value.trim() : '',
            bus_ida: busIda ? !!busIda.checked : false,
            bus_vuelta: busVuelta ? !!busVuelta.checked : false,
            food_allergens: foodAllergens ? !!foodAllergens.checked : false,
            allergens_detail: allergensDetail ? allergensDetail.value.trim() : '',
            food_vegetarian: foodVegetarian ? !!foodVegetarian.checked : false,
            timestamp: new Date().toISOString()
        };

        // Helper: realiza el POST al Apps Script (si está configurado)
        function postToSheet(data) {
            if (!SHEET_ENDPOINT) return Promise.resolve({ ok: true, simulated: true });

            const body = new URLSearchParams();
            Object.keys(data).forEach(k => body.append(k, String(data[k])));
            body.append('token', SHEET_TOKEN);

            return fetch(SHEET_ENDPOINT, {
                method: 'POST',
                body
            })
                .then(res => res.json().catch(() => ({ ok: res.ok })))
                .catch(() => ({ ok: false }));
        }


        postToSheet(payload).then(function (res) {
            // si la petición falla o la respuesta indica error, mostrar mensaje
            if (!res || (res.ok === false)) {
                modalBody.innerHTML = '<p class="error"><strong>No hemos podido guardar tu confirmación.</strong> Por favor, intenta de nuevo más tarde.</p>' + lastSummaryHtml;
                if (modalConfirmBtn) { modalConfirmBtn.disabled = false; modalConfirmBtn.textContent = 'Reintentar'; }
                if (modalCancelBtn) { modalCancelBtn.disabled = false; modalCancelBtn.style.display = ''; }
                return;
            }

            // Éxito: limpiar borrador y deshabilitar el formulario
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) { }
            Array.from(form.elements).forEach(el => el.disabled = true);
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.textContent = 'Confirmado ✅';

            modalState = 'done';
            modalBody.innerHTML = '<p><strong>¡Gracias! Tu confirmación ha sido registrada.</strong></p>' + lastSummaryHtml;
            if (modalCancelBtn) modalCancelBtn.style.display = 'none';
            if (modalConfirmBtn) {
                modalConfirmBtn.disabled = false;
                modalConfirmBtn.textContent = 'Cerrar';
                modalConfirmBtn.removeEventListener('click', handleConfirm);
                modalConfirmBtn.addEventListener('click', handleCloseOnce);
                modalConfirmBtn.focus();
            }

            const overlay = modal.querySelector('.modal-overlay');
            if (overlay) overlay.removeEventListener('click', handleCancelOnce);

        }).catch(function (err) {
            console.error('Error enviando a sheet:', err);
            modalBody.innerHTML = '<p class="error"><strong>Error al guardar.</strong> Por favor, revisa tu conexión e inténtalo de nuevo.</p>' + lastSummaryHtml;
            if (modalConfirmBtn) { modalConfirmBtn.disabled = false; modalConfirmBtn.textContent = 'Reintentar'; }
            if (modalCancelBtn) { modalCancelBtn.disabled = false; modalCancelBtn.style.display = ''; }
        });
    }

    function handleCloseOnce() { handleClose(); }

    function handleClose() {
        closeConfirmModal();
        // dejar el formulario deshabilitado y llevar foco a navegación
        try { const navFirst = document.querySelector('nav a'); if (navFirst) navFirst.focus(); } catch (e) { }
    }

    function handleCancel() {
        // Cancelar la selección: limpiar campos del formulario y borrar borrador
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) { }
        form.reset();
        // ocultar cosas dependientes
        partnerRow.style.display = 'none';
        partnerInput.removeAttribute('required');
        busWarning.style.display = 'none';
        allergensRow.style.display = 'none';
        allergensDetail.removeAttribute('required');
        allergensDetail.value = '';
        if (foodAllergens) foodAllergens.checked = false;
        if (foodVegetarian) foodVegetarian.checked = false;
        if (successBox) { successBox.style.display = 'none'; successBox.innerHTML = ''; }
        try { guestInput.focus(); } catch (e) { }
        closeConfirmModal();
    }

    function handleCancelOnce() { handleCancel(); }

    if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', handleConfirm);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', handleCancel);

    function trapTab(e) {
        if (e.key !== 'Tab') return;
        // recalcular botones focuseables visibles dentro del modal
        const buttons = Array.from(modal.querySelectorAll('button')).filter(b => !b.disabled && b.offsetParent !== null);
        if (!buttons.length) return;
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
        else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    }

    // pequeños helpers
    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, function (s) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" })[s];
        });
    }

});

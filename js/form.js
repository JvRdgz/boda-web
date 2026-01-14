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
    const foodVegan = document.getElementById('food-vegan');
    const allergensApplyRow = document.getElementById('allergens-apply-row');
    const allergensApplyGuest = document.getElementById('allergens-apply-guest');
    const allergensApplyPartner = document.getElementById('allergens-apply-partner');
    const vegetarianApplyRow = document.getElementById('vegetarian-apply-row');
    const vegetarianApplyGuest = document.getElementById('vegetarian-apply-guest');
    const vegetarianApplyPartner = document.getElementById('vegetarian-apply-partner');
    const veganApplyRow = document.getElementById('vegan-apply-row');
    const veganApplyGuest = document.getElementById('vegan-apply-guest');
    const veganApplyPartner = document.getElementById('vegan-apply-partner');
    const applyNameSpans = document.querySelectorAll('.apply-name');
    const form = document.getElementById('rsvp-form');
    const guestInput = document.getElementById('guest-name');
    const attendance = document.getElementById('attendance');
    const successBox = document.getElementById('form-success');
    const STORAGE_KEY = 'boda_rsvp_draft';
    // Configuración para envío a Google Sheets via Apps Script
    // Sustituye por tu URL de despliegue y el token secreto que fijes en el Apps Script
    const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw_mKtFzX8H1VY_cwfCs5Fap8HHqJvuLzxjt1K5xZdcHyEDs8ZaAbsgL8iaFGpRdRuyow/exec'; // e.j. 'https://script.google.com/macros/s/XXX/exec'
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
        updatePartnerApplyVisibility();
        updateApplyLabels();
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
            toggleFoodOption(foodAllergens, allergensApplyRow, allergensApplyGuest, allergensApplyPartner, allergensRow, allergensDetail);
            saveDraft();
        });
    }

    if (foodVegetarian) {
        foodVegetarian.addEventListener('change', function () {
            enforceExclusiveMenus(foodVegetarian, foodVegan);
            toggleFoodOption(foodVegetarian, vegetarianApplyRow, vegetarianApplyGuest, vegetarianApplyPartner);
            saveDraft();
        });
    }

    if (foodVegan) {
        foodVegan.addEventListener('change', function () {
            enforceExclusiveMenus(foodVegan, foodVegetarian);
            toggleFoodOption(foodVegan, veganApplyRow, veganApplyGuest, veganApplyPartner);
            saveDraft();
        });
    }

    [allergensApplyGuest, allergensApplyPartner, vegetarianApplyGuest, vegetarianApplyPartner, veganApplyGuest, veganApplyPartner].forEach(el => {
        if (!el) return;
        el.addEventListener('change', function () {
            validateApplySelection();
            saveDraft();
        });
    });

    if (guestInput) {
        guestInput.addEventListener('input', function () {
            updateApplyLabels();
            saveDraft();
        });
    }

    if (partnerInput) {
        partnerInput.addEventListener('input', function () {
            updateApplyLabels();
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
            allergens_apply_guest: allergensApplyGuest ? !!allergensApplyGuest.checked : false,
            allergens_apply_partner: allergensApplyPartner ? !!allergensApplyPartner.checked : false,
            food_vegetarian: foodVegetarian ? !!foodVegetarian.checked : false,
            vegetarian_apply_guest: vegetarianApplyGuest ? !!vegetarianApplyGuest.checked : false,
            vegetarian_apply_partner: vegetarianApplyPartner ? !!vegetarianApplyPartner.checked : false,
            food_vegan: foodVegan ? !!foodVegan.checked : false,
            vegan_apply_guest: veganApplyGuest ? !!veganApplyGuest.checked : false,
            vegan_apply_partner: veganApplyPartner ? !!veganApplyPartner.checked : false
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
            if (allergensApplyGuest) allergensApplyGuest.checked = !!data.allergens_apply_guest;
            if (allergensApplyPartner) allergensApplyPartner.checked = !!data.allergens_apply_partner;
            if (foodVegetarian) foodVegetarian.checked = !!data.food_vegetarian;
            if (vegetarianApplyGuest) vegetarianApplyGuest.checked = !!data.vegetarian_apply_guest;
            if (vegetarianApplyPartner) vegetarianApplyPartner.checked = !!data.vegetarian_apply_partner;
            if (foodVegan) foodVegan.checked = !!data.food_vegan;
            if (veganApplyGuest) veganApplyGuest.checked = !!data.vegan_apply_guest;
            if (veganApplyPartner) veganApplyPartner.checked = !!data.vegan_apply_partner;

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
            if (foodAllergens && foodAllergens.checked && allergensApplyRow) {
                allergensApplyRow.style.display = '';
            }
            if (foodVegetarian && foodVegetarian.checked && vegetarianApplyRow) {
                vegetarianApplyRow.style.display = '';
            }
            if (foodVegan && foodVegan.checked && veganApplyRow) {
                veganApplyRow.style.display = '';
            }
            updatePartnerApplyVisibility();
            updateApplyLabels();
            validateApplySelection();
        } catch (e) { }
    }

    // Guardar al cambiar cualquier campo relevante
    [guestInput, attendance, partnerSelect, partnerInput, busIda, busVuelta, foodAllergens, allergensDetail, foodVegetarian, foodVegan].forEach(el => {
        if (!el) return;
        const ev = (el.tagName === 'INPUT' && el.type === 'checkbox') ? 'change' : 'input';
        el.addEventListener(ev, saveDraft);
    });

    // Cargar borrador al inicio
    loadDraft();
    updateApplyLabels();
    updatePartnerApplyVisibility();

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
                if (!validateApplySelection('alergias')) return;
                if (!allergensDetail.value.trim()) {
                    allergensDetail.setCustomValidity('Por favor, indica tus alergias o intolerancias.');
                    allergensDetail.reportValidity();
                    return;
                } else {
                    allergensDetail.setCustomValidity('');
                }
            }
            if (foodVegetarian && foodVegetarian.checked) {
                if (!validateExclusiveMenus()) return;
                if (!validateApplySelection('vegetariano')) return;
            }
            if (foodVegan && foodVegan.checked) {
                if (!validateExclusiveMenus()) return;
                if (!validateApplySelection('vegano')) return;
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
            lines.push(`<p><strong>Alergias/intolerancias:</strong> ${foodAllergens && foodAllergens.checked ? `Sí (${formatApplyTo(allergensApplyGuest, allergensApplyPartner)})` : 'No'}</p>`);
            if (foodAllergens && foodAllergens.checked) {
                lines.push(`<p><strong>Detalles:</strong> ${allergensDetail.value ? escapeHtml(allergensDetail.value) : '—'}</p>`);
            }
            lines.push(`<p><strong>Menú vegetariano:</strong> ${foodVegetarian && foodVegetarian.checked ? `Sí (${formatApplyTo(vegetarianApplyGuest, vegetarianApplyPartner)})` : 'No'}</p>`);
            lines.push(`<p><strong>Menú vegano:</strong> ${foodVegan && foodVegan.checked ? `Sí (${formatApplyTo(veganApplyGuest, veganApplyPartner)})` : 'No'}</p>`);

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
                food_vegan: foodVegan ? !!foodVegan.checked : false,
                allergens_apply_guest: allergensApplyGuest ? !!allergensApplyGuest.checked : false,
                allergens_apply_partner: allergensApplyPartner ? !!allergensApplyPartner.checked : false,
                vegetarian_apply_guest: vegetarianApplyGuest ? !!vegetarianApplyGuest.checked : false,
                vegetarian_apply_partner: vegetarianApplyPartner ? !!vegetarianApplyPartner.checked : false,
                vegan_apply_guest: veganApplyGuest ? !!veganApplyGuest.checked : false,
                vegan_apply_partner: veganApplyPartner ? !!veganApplyPartner.checked : false,
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
        if (foodVegan) foodVegan.checked = false;
        if (allergensApplyRow) allergensApplyRow.style.display = 'none';
        if (vegetarianApplyRow) vegetarianApplyRow.style.display = 'none';
        if (veganApplyRow) veganApplyRow.style.display = 'none';
        [allergensApplyGuest, allergensApplyPartner, vegetarianApplyGuest, vegetarianApplyPartner, veganApplyGuest, veganApplyPartner].forEach(el => {
            if (el) el.checked = false;
        });
        updatePartnerApplyVisibility();
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

    function toggleFoodOption(optionCheckbox, applyRow, applyGuest, applyPartner, detailRow, detailInput) {
        if (!optionCheckbox || !applyRow) return;
        const partnerActive = partnerSelect && partnerSelect.value === 'si';
        if (optionCheckbox.checked) {
            applyRow.style.display = partnerActive ? '' : 'none';
            if (detailRow) detailRow.style.display = '';
            if (detailInput) detailInput.setAttribute('required', 'required');
        } else {
            applyRow.style.display = 'none';
            if (applyGuest) applyGuest.checked = false;
            if (applyPartner) applyPartner.checked = false;
            if (detailRow) detailRow.style.display = 'none';
            if (detailInput) {
                detailInput.removeAttribute('required');
                detailInput.value = '';
                detailInput.setCustomValidity('');
            }
            optionCheckbox.setCustomValidity('');
        }
        updatePartnerApplyVisibility();
        updateApplyLabels();
        validateApplySelection();
    }

    function updateApplyLabels() {
        const guestName = guestInput && guestInput.value.trim() ? guestInput.value.trim() : 'Invitado principal';
        const partnerName = partnerInput && partnerInput.value.trim() ? partnerInput.value.trim() : 'Pareja';
        applyNameSpans.forEach(span => {
            if (span.dataset.role === 'guest') span.textContent = guestName;
            if (span.dataset.role === 'partner') span.textContent = partnerName;
        });
    }

    function updatePartnerApplyVisibility() {
        const partnerActive = partnerSelect && partnerSelect.value === 'si';
        const partnerLabels = document.querySelectorAll('.apply-option.apply-partner');
        partnerLabels.forEach(label => {
            label.style.display = partnerActive ? 'inline-flex' : 'none';
            const input = label.querySelector('input[type="checkbox"]');
            if (!partnerActive && input) input.checked = false;
        });

        const applyConfigs = [
            { opt: foodAllergens, row: allergensApplyRow, guest: allergensApplyGuest, partner: allergensApplyPartner },
            { opt: foodVegetarian, row: vegetarianApplyRow, guest: vegetarianApplyGuest, partner: vegetarianApplyPartner },
            { opt: foodVegan, row: veganApplyRow, guest: veganApplyGuest, partner: veganApplyPartner }
        ];

        applyConfigs.forEach(cfg => {
            if (!cfg.row || !cfg.opt) return;
            if (!cfg.opt.checked) {
                cfg.row.style.display = 'none';
                return;
            }
            if (partnerActive) {
                cfg.row.style.display = '';
            } else {
                cfg.row.style.display = 'none';
                if (cfg.guest) cfg.guest.checked = true;
                if (cfg.partner) cfg.partner.checked = false;
            }
        });
        validateExclusiveMenus();
        validateApplySelection();
    }

    function validateApplySelection(contextLabel) {
        const partnerActive = partnerSelect && partnerSelect.value === 'si';
        const configMap = {
            alergias: { opt: foodAllergens, guest: allergensApplyGuest, partner: allergensApplyPartner },
            vegetariano: { opt: foodVegetarian, guest: vegetarianApplyGuest, partner: vegetarianApplyPartner },
            vegano: { opt: foodVegan, guest: veganApplyGuest, partner: veganApplyPartner }
        };
        const targets = contextLabel ? [configMap[contextLabel]] : Object.values(configMap);
        for (let i = 0; i < targets.length; i += 1) {
            const cfg = targets[i];
            if (!cfg || !cfg.opt) continue;
            if (!cfg.opt.checked) {
                cfg.opt.setCustomValidity('');
                continue;
            }
            if (!partnerActive) {
                cfg.opt.setCustomValidity('');
                continue;
            }
            const anyChecked = (cfg.guest && cfg.guest.checked) || (cfg.partner && cfg.partner.checked);
            if (!anyChecked) {
                cfg.opt.setCustomValidity('Por favor, indica a quién aplica.');
                if (contextLabel) cfg.opt.reportValidity();
                return false;
            }
            cfg.opt.setCustomValidity('');
        }
        return true;
    }

    function enforceExclusiveMenus(activeOption, otherOption) {
        const partnerActive = partnerSelect && partnerSelect.value === 'si';
        if (!partnerActive && activeOption && otherOption && activeOption.checked && otherOption.checked) {
            otherOption.checked = false;
            toggleFoodOption(otherOption, otherOption === foodVegetarian ? vegetarianApplyRow : veganApplyRow,
                otherOption === foodVegetarian ? vegetarianApplyGuest : veganApplyGuest,
                otherOption === foodVegetarian ? vegetarianApplyPartner : veganApplyPartner);
        }
        validateExclusiveMenus();
    }

    function validateExclusiveMenus() {
        const partnerActive = partnerSelect && partnerSelect.value === 'si';
        if (!partnerActive && foodVegetarian && foodVegan && foodVegetarian.checked && foodVegan.checked) {
            foodVegetarian.setCustomValidity('Selecciona solo un menú cuando no viene pareja.');
            foodVegetarian.reportValidity();
            return false;
        }
        if (foodVegetarian) foodVegetarian.setCustomValidity('');
        if (foodVegan) foodVegan.setCustomValidity('');
        return true;
    }

    function formatApplyTo(guestCheck, partnerCheck) {
        const parts = [];
        if (guestCheck && guestCheck.checked) parts.push(getApplyName('guest'));
        if (partnerCheck && partnerCheck.checked) parts.push(getApplyName('partner'));
        return parts.length ? parts.map(escapeHtml).join(', ') : '—';
    }

    function getApplyName(role) {
        const span = Array.from(applyNameSpans).find(el => el.dataset.role === role);
        return span ? span.textContent : (role === 'guest' ? 'Invitado principal' : 'Pareja');
    }

});

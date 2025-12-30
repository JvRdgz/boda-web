(function () {
    const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
    const sections = Array.from(document.querySelectorAll('main section[id]'));

    if (!navLinks.length || !sections.length) return;

    // Añade id 'inicio' si no existe en el primer section (defensivo)
    if (!sections.some(s => s.id === 'inicio')) {
        const first = sections[0];
        if (first) first.id = 'inicio';
    }

    const getCurrentByMid = () => {
        const mid = window.scrollY + window.innerHeight / 2;
        for (const sec of sections) {
            const rect = sec.getBoundingClientRect();
            const top = window.scrollY + rect.top;
            const bottom = top + rect.height;
            if (mid >= top && mid < bottom) return sec.id;
        }
        // fallback: if scrolled to bottom, return last
        if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 2) {
            return sections[sections.length - 1].id;
        }
        return null;
    };

    const setActive = (id) => {
        if (!id) return;
        navLinks.forEach(a => {
            if (a.getAttribute('href') === `#${id}`) {
                if (!a.classList.contains('active')) a.classList.add('active');
                a.setAttribute('aria-current', 'location');
            } else {
                a.classList.remove('active');
                a.removeAttribute('aria-current');
            }
        });
    };

    // Marcar "Inicio" al cargar como estado inicial
    window.addEventListener('load', () => {
        const initial = getCurrentByMid() || 'inicio';
        setActive(initial);
    });

    // Optimizar scroll con requestAnimationFrame
    let ticking = false;
    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const id = getCurrentByMid();
                if (id) setActive(id);
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // Click en enlaces: marcar inmediatamente (UX)
    navLinks.forEach(a => {
        a.addEventListener('click', () => {
            navLinks.forEach(x => x.classList.remove('active'));
            a.classList.add('active');
        });
    });
})();

/**
 * const skipBtn = document.getElementById('skip-intro');
    if (skipBtn) {
        skipBtn.addEventListener('click', finishIntro);
    }
 */
// Intro tipo sobre: gestionar aparición y desaparición
window.addEventListener('load', () => {
    const overlay = document.getElementById('intro-overlay');
    if (!overlay) return;

    document.body.classList.add('intro-active');

    const finishIntro = () => {
        if (!overlay.parentElement) return;
        document.body.classList.remove('intro-active');
        overlay.remove();
    };

    // Botón de saltar intro (si lo activas en el HTML)
    const skipBtn = document.getElementById('skip-intro');
    if (skipBtn) {
        skipBtn.addEventListener('click', finishIntro);
    }

    overlay.addEventListener('animationend', (e) => {
        if (e.animationName === 'introFadeOut') {
            finishIntro();
        }
    });

    setTimeout(finishIntro, 6000); // fallback por si acaso
});

/* Copiar número de cuenta al portapapeles (formatear IBAN y mostrar toast) */
(function () {
    const copyBtn = document.getElementById('copy-account');
    const accEl = document.getElementById('account-number');
    const status = document.getElementById('copy-status');

    if (!copyBtn || !accEl) return;

    const originalBtnText = copyBtn.textContent;

    const showStatus = (text, isSuccess = true) => {
        // No actualizar el texto al lado del botón; sólo cambiar temporalmente el texto del botón
        if (copyBtn) copyBtn.textContent = isSuccess ? 'Copiado ✓' : 'Error';
        setTimeout(() => {
            if (copyBtn) copyBtn.textContent = originalBtnText;
        }, 2000);
    };

    const showToast = (text) => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = text;
        document.body.appendChild(toast);
        // Forzar reflow para animación
        void toast.offsetWidth;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        }, 2000);
    };

    const formatIbanForCopy = (text) => {
        if (!text) return '';
        // Eliminar caracteres no alfanuméricos y espacios, y pasar a mayúsculas
        return text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    };

    const copyText = async (text) => {
        try {
            const cleaned = formatIbanForCopy(text);
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(cleaned);
            } else {
                const ta = document.createElement('textarea');
                ta.value = cleaned;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            showStatus('¡Copiado!', true);
            showToast('Copiado!');
        } catch (err) {
            console.error('Error copiando al portapapeles:', err);
            showStatus('Error al copiar', false);
            showToast('Error al copiar');
        }
    };

    copyBtn.addEventListener('click', () => {
        const text = accEl.textContent.trim();
        if (text) copyText(text);
    });
})();

/* ===== Información de interés: tarjetas que abren modal con detalles ===== */
(function(){
    const infoModal = document.getElementById('info-modal');
    const infoModalBody = document.getElementById('info-modal-body');
    const infoModalTitle = document.getElementById('info-modal-title');
    const infoModalClose = document.getElementById('info-modal-close');

    if(!infoModal || !infoModalBody) return;

    const infoData = {
        hoteles: {
            title: 'Hoteles',
            html: `
                <h4>Hoteles con precio especial</h4>
                <ul class="info-list">
                    <li>NH PALACIO DEL DUERO <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=NH+PALACIO+DEL+DUERO+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>AC HOTEL ZAMORA <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=AC+HOTEL+ZAMORA" target="_blank">Ver en Maps</a></li>
                    <li>HOTEL REY DON SANCHO <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=HOTEL+REY+DON+SANCHO+Zamora" target="_blank">Ver en Maps</a></li>
                </ul>
                <h4 style="margin-top:1rem;">Otros hoteles</h4>
                <ul class="info-list">
                    <li>Hotel Alda Mercado de Zamora <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=Hotel+Alda+Mercado+de+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>Parador de Zamora <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=Parador+de+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>Hotel dos Infantas <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=Hotel+dos+Infantas+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>Hotel Ares <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=Hotel+Ares+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>San Gil Plaza <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=San+Gil+Plaza+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>Hostería Real <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=Hosteria+Real+Zamora" target="_blank">Ver en Maps</a></li>
                </ul>
            `
        },
        peluquerias: {
            title: 'Peluquerías y maquillaje',
            html: `
                <ul class="info-list">
                    <li>La pelu de Laura <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=La+pelu+de+Laura+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>Leti estilistas <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=Leti+estilistas+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>Different estilistas <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=Different+estilistas+Zamora" target="_blank">Ver en Maps</a></li>
                </ul>
            `
        },
        bares: {
            title: 'Bares de tapas',
            html: `
                <ul class="info-list">
                    <li>Meneses (un poco de todo) <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=Meneses+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>Vinacoteca (ibéricos, queso) <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=Vinacoteca+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>Portillo (de todo) <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=Portillo+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>Caballero (patatas bravas / chipirones) <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=Caballero+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>El Lobo (pinchos morunos) <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=El+Lobo+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>Bambú (tiberios) <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=Bambu+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>El Puente de Aliste (de todo) <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=El+Puente+de+Aliste+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>Calle de los Herreros (una calle llena de bares) <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=Calle+de+los+Herreros+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>La Salita <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=La+Salita+Zamora" target="_blank">Ver en Maps</a></li>
                </ul>
            `
        },
        restaurantes: {
            title: 'Restaurantes',
            html: `
                <ul class="info-list">
                    <li>La Sal <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=La+Sal+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>La Baraka (barakas y solomillo al vino tinto) <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=La+Baraka+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>Cuzeo <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=Cuzeo+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>El Portón <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=El+Porton+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>Eusebio <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=Eusebio+Zamora" target="_blank">Ver en Maps</a></li>
                    <li>Casa Mariano <a class="map-button small" href="https://www.google.com/maps/search/?api=1&query=Casa+Mariano+Zamora" target="_blank">Ver en Maps</a></li>
                </ul>
            `
        }
    };

    let _lastFocused = null;
    function openInfoModal(key){
        const data = infoData[key];
        if(!data) return;
        _lastFocused = document.activeElement;
        infoModalTitle.textContent = data.title;
        infoModalBody.innerHTML = data.html;
        infoModal.setAttribute('aria-hidden','false');
        document.body.classList.add('modal-open');
        infoModalClose && infoModalClose.focus();
        document.addEventListener('keydown', trapInfoTab);
    }

    function closeInfoModal(){
        // Mover el foco fuera del modal ANTES de ocultarlo para evitar advertencias de accesibilidad
        try{
            // restaurar foco al elemento que abrió el modal
            if(_lastFocused && _lastFocused.focus) _lastFocused.focus();
            // si por alguna razón sigue habiendo un elemento enfocado dentro del modal, desenfócalo
            if(document.activeElement && infoModal.contains(document.activeElement)){
                try{ document.activeElement.blur(); }catch(e){}
            }
        }catch(e){}

        infoModal.setAttribute('aria-hidden','true');
        document.body.classList.remove('modal-open');
        document.removeEventListener('keydown', trapInfoTab);
    }

    function trapInfoTab(e){
        if(e.key === 'Escape'){ closeInfoModal(); }
        if(e.key !== 'Tab') return;
        const buttons = Array.from(infoModal.querySelectorAll('button')).filter(b => !b.disabled && b.offsetParent !== null);
        if(!buttons.length) return;
        const first = buttons[0], last = buttons[buttons.length-1];
        if(e.shiftKey){ if(document.activeElement === first){ e.preventDefault(); last.focus(); } }
        else { if(document.activeElement === last){ e.preventDefault(); first.focus(); } }
    }

    // Bind click handlers
    document.querySelectorAll('.info-open').forEach(btn => {
        btn.addEventListener('click', function(e){ e.preventDefault(); const k = btn.getAttribute('data-key'); openInfoModal(k); });
    });

    // Make entire card keyboard accessible (enter/space)
    document.querySelectorAll('.info-card').forEach(card => {
        card.addEventListener('click', function(){ const k = card.getAttribute('data-key'); openInfoModal(k); });
        card.addEventListener('keydown', function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openInfoModal(card.getAttribute('data-key')); } });
    });

    // Overlay click and close button
    infoModal.addEventListener('click', function(e){ if(e.target && e.target.matches('.modal-overlay')) closeInfoModal(); });
    infoModalClose && infoModalClose.addEventListener('click', closeInfoModal);

})();
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
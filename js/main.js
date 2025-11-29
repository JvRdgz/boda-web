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
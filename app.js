(function () {
  'use strict';

  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  let current = 0;
  let animating = false;

  const progressBar = document.getElementById('progressBar');
  const navRail = document.getElementById('navRail');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const slideIndicator = document.getElementById('slideIndicator');

  const TRANSITION_MS = 500;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'nav-rail__dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Diapositiva ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    navRail.appendChild(dot);
  });

  function updateUI() {
    const pct = ((current + 1) / total) * 100;
    progressBar.style.width = pct + '%';
    progressBar.setAttribute('aria-valuenow', current + 1);
    slideIndicator.textContent = `${current + 1} / ${total}`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;

    navRail.querySelectorAll('.nav-rail__dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  /** Elimina estilos inline que bloquean la visibilidad al retroceder */
  function clearInlineStyles(slide) {
    if (!slide) return;
    slide.style.transform = '';
    slide.style.opacity = '';
    slide.style.visibility = '';
    slide.querySelectorAll('.reveal, .gantt__bar').forEach((el) => {
      el.removeAttribute('style');
    });
  }

  function goTo(index) {
    if (animating || index === current || index < 0 || index >= total) return;
    animating = true;

    const dir = index > current ? 1 : -1;
    const out = slides[current];
    const inc = slides[index];

    clearInlineStyles(inc);

    out.classList.remove('active', 'prev');
    if (dir > 0) {
      out.classList.add('prev');
    }

    inc.classList.remove('prev');

    if (dir < 0) {
      inc.style.transform = 'translateY(-24px)';
      inc.style.opacity = '0';
      inc.classList.add('active');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          inc.style.transform = '';
          inc.style.opacity = '';
        });
      });
    } else {
      inc.classList.add('active');
    }

    setTimeout(() => {
      out.classList.remove('prev');
      clearInlineStyles(out);
      clearInlineStyles(inc);
      current = index;
      updateUI();
      animating = false;
    }, TRANSITION_MS);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      next();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      prev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(total - 1);
    }
  });

  let touchX = 0;
  document.addEventListener('touchstart', (e) => {
    touchX = e.touches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) diff > 0 ? next() : prev();
  }, { passive: true });

  let wheelTimer;
  document.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) < 25) return;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      e.deltaY > 0 ? next() : prev();
    }, 60);
  }, { passive: true });

  slides.forEach(clearInlineStyles);
  updateUI();
})();

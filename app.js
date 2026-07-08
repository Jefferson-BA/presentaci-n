(function () {
  const slides = document.querySelectorAll('.slide');
  const totalSlides = slides.length;
  let current = 0;
  let isAnimating = false;

  const progressBar = document.getElementById('progressBar');
  const navDots = document.getElementById('navDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const slideIndicator = document.getElementById('slideIndicator');

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Ir a diapositiva ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    navDots.appendChild(dot);
  });

  function updateUI() {
    const pct = ((current + 1) / totalSlides) * 100;
    progressBar.style.width = pct + '%';
    slideIndicator.textContent = `${current + 1} / ${totalSlides}`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === totalSlides - 1;

    navDots.querySelectorAll('.nav-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    if (isAnimating || index === current || index < 0 || index >= totalSlides) return;
    isAnimating = true;

    const direction = index > current ? 1 : -1;
    const outgoing = slides[current];
    const incoming = slides[index];

    outgoing.classList.remove('active');
    outgoing.classList.add(direction > 0 ? 'prev' : '');

    incoming.style.transform = direction > 0 ? 'translateX(40px)' : 'translateX(-40px)';
    incoming.classList.add('active');

    requestAnimationFrame(() => {
      incoming.style.transform = '';
    });

    setTimeout(() => {
      outgoing.classList.remove('prev');
      outgoing.style.transform = '';
      current = index;
      updateUI();
      isAnimating = false;
      resetAnimations(incoming);
    }, 600);
  }

  function resetAnimations(slide) {
    const elements = slide.querySelectorAll('.animate-in, .gantt-bar, .arch-node');
    elements.forEach(el => {
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = '';
    });
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
      goTo(totalSlides - 1);
    }
  });

  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
    }
  }, { passive: true });

  let wheelTimeout;
  document.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) < 30) return;
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      e.deltaY > 0 ? next() : prev();
    }, 50);
  }, { passive: true });

  updateUI();
})();

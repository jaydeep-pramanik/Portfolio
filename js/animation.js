/**
 * animation.js — Scroll reveal, animated counters, skill bars
 */

(function () {

  /* =========================================================
   * INTERSECTION OBSERVER — generic reveal
   * ========================================================= */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /* =========================================================
   * TIMELINE ITEMS — slide in on scroll
   * ========================================================= */
  const timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          timelineObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll('.timeline-item').forEach((el) => timelineObserver.observe(el));

  /* =========================================================
   * ANIMATED COUNTERS
   * ========================================================= */
  function animateCounter(el) {
    const target  = parseInt(el.dataset.target, 10);
    const suffix  = el.dataset.suffix || '';
    const duration = 1800;
    let start = null;

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress  = Math.min((timestamp - start) / duration, 1);
      const eased     = easeOutExpo(progress);
      const current   = Math.floor(eased * target);
      el.textContent  = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('.stat-num[data-target]').forEach((el) =>
    counterObserver.observe(el)
  );

  /* =========================================================
   * SKILL BAR ANIMATIONS
   * ========================================================= */
  const skillBarObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fills = entry.target.querySelectorAll('.skill-fill');
          fills.forEach((fill) => {
            const width = fill.dataset.width || '0';
            fill.style.width = width + '%';
          });
          skillBarObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  const skillsGrid = document.getElementById('skills-grid');
  if (skillsGrid) skillBarObserver.observe(skillsGrid);

})();

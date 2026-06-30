/**
 * main.js — Navbar, mobile menu, scroll progress, project filter,
 *            form validation, back-to-top, cursor glow, ripple, preloader
 */

(function () {

  /* =========================================================
   * LOADING SCREEN — animated ring + code lines + counter
   * ========================================================= */
  (function initLoader() {
    var screen   = document.getElementById('loading-screen');
    var ringEl   = document.getElementById('ls-ring');
    var pctEl    = document.getElementById('ls-pct-num');
    var barFill  = document.getElementById('ls-bottom-fill');
    var lc1      = document.getElementById('lc1');
    var lc2      = document.getElementById('lc2');
    var lc3      = document.getElementById('lc3');
    var CIRC     = 2 * Math.PI * 52; // ≈ 326.7

    if (ringEl) {
      ringEl.style.strokeDasharray  = CIRC;
      ringEl.style.strokeDashoffset = CIRC;
    }

    var startTs = null;
    var DURATION = 1500; // ms for 0→100%
    var pageLoaded = false;

    window.addEventListener('load', function () { pageLoaded = true; });

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function tick(ts) {
      if (!startTs) startTs = ts;
      var elapsed  = ts - startTs;

      // If page hasn't loaded yet, cap at 85%
      var maxRaw = pageLoaded ? 1 : 0.85;
      var raw    = Math.min(elapsed / DURATION, maxRaw);
      var eased  = easeOutCubic(raw);
      var pct    = Math.floor(eased * 100);

      if (pctEl)  pctEl.textContent = pct;
      if (ringEl) ringEl.style.strokeDashoffset = CIRC * (1 - eased);
      if (barFill) barFill.style.width = (eased * 100) + '%';

      if (pct >= 20 && lc1) lc1.classList.add('visible');
      if (pct >= 55 && lc2) lc2.classList.add('visible');
      if (pct >= 88 && lc3) lc3.classList.add('visible');

      if (raw < maxRaw || !pageLoaded) {
        requestAnimationFrame(tick);
      } else {
        // Snap to 100 and hide
        if (pctEl)  pctEl.textContent = 100;
        if (ringEl) ringEl.style.strokeDashoffset = 0;
        if (barFill) barFill.style.width = '100%';
        if (lc1) lc1.classList.add('visible');
        if (lc2) lc2.classList.add('visible');
        if (lc3) lc3.classList.add('visible');

        setTimeout(function () {
          if (screen) screen.classList.add('hidden');
        }, 350);
      }
    }

    requestAnimationFrame(tick);
  })();

  /* =========================================================
   * HERO PARTICLE CANVAS
   * ========================================================= */
  (function initParticles() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrame;

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function Particle() {
      this.reset();
    }

    Particle.prototype.reset = function () {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.r  = Math.random() * 1.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.a  = Math.random() * 0.5 + 0.15;
    };

    Particle.prototype.update = function () {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
    };

    function createParticles() {
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 12000));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(function (p) {
        p.update();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59,130,246,' + p.a + ')';
        ctx.fill();
      });

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(59,130,246,' + (0.08 * (1 - dist / 100)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrame = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', function () {
      resize();
      createParticles();
    });
  })();

  /* =========================================================
   * CURRENT YEAR IN FOOTER
   * ========================================================= */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================================================
   * CURSOR GLOW
   * ========================================================= */
  const cursor = document.getElementById('cursor-glow');
  if (cursor) {
    document.addEventListener('mousemove', function (e) {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
    });
  }

  /* =========================================================
   * SCROLL PROGRESS BAR
   * ========================================================= */
  const progressBar = document.getElementById('scroll-progress');
  function updateProgress() {
    if (!progressBar) return;
    const scrollTop  = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });

  /* =========================================================
   * NAVBAR — scroll state + active section highlight
   * ========================================================= */
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  function updateNavbar() {
    if (!navbar) return;
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  function updateActiveLink() {
    let current = '';
    sections.forEach(function (section) {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', function () {
    updateNavbar();
    updateActiveLink();
    updateProgress();
    updateBackToTop();
  }, { passive: true });

  updateNavbar();
  updateActiveLink();

  /* =========================================================
   * SMOOTH SCROLL HELPER
   * ========================================================= */
  window.scrollToSection = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
      top: el.offsetTop - 75,
      behavior: 'smooth'
    });
  };

  // Intercept all nav links
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      if (href && href.length > 1) {
        e.preventDefault();
        scrollToSection(href.substring(1));
      }
    });
  });

  /* =========================================================
   * MOBILE MENU
   * ========================================================= */
  const hamburger    = document.getElementById('hamburger');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobOverlay   = document.getElementById('mob-overlay');
  const menuIcon     = document.getElementById('menu-icon');

  function openMobileMenu() {
    mobileDrawer && mobileDrawer.classList.add('open');
    mobOverlay   && mobOverlay.classList.add('show');
    if (menuIcon) menuIcon.className = 'bx bx-x';
  }

  window.closeMobileMenu = function () {
    mobileDrawer && mobileDrawer.classList.remove('open');
    mobOverlay   && mobOverlay.classList.remove('show');
    if (menuIcon) menuIcon.className = 'bx bx-menu';
  };

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      if (mobileDrawer && mobileDrawer.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  /* =========================================================
   * SKILL BAR COLORS (match icon brand color)
   * ========================================================= */
  function applySkillColors() {
    document.querySelectorAll('#skills-grid .skill-card').forEach(function (card) {
      var color = card.dataset.color;
      if (!color) return;
      var fill = card.querySelector('.skill-fill');
      var pct  = card.querySelector('.skill-pct');
      if (fill) fill.style.background = 'linear-gradient(90deg, ' + color + 'cc, ' + color + ')';
      if (pct)  pct.style.color = color;
    });
  }
  applySkillColors();

  /* =========================================================
   * SKILLS FILTER
   * ========================================================= */
  const skillFilterBtns = document.querySelectorAll('.skills-filter .filter-btn');
  const skillCards = document.querySelectorAll('#skills-grid .skill-card');

  skillFilterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      skillFilterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      skillCards.forEach(function (card) {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });

      // Re-trigger skill bar animation for visible cards
      const fills = document.querySelectorAll('#skills-grid .skill-card:not(.hidden) .skill-fill');
      fills.forEach(function (fill) {
        fill.style.width = '0%';
        setTimeout(function () {
          fill.style.width = (fill.dataset.width || '0') + '%';
        }, 50);
      });
      applySkillColors();
    });
  });

  /* =========================================================
   * PROJECTS FILTER
   * ========================================================= */
  const projFilterBtns = document.querySelectorAll('.proj-filter .filter-btn');
  const projCards = document.querySelectorAll('#projects-grid .proj-card');

  projFilterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      projFilterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      const filter = btn.dataset.projFilter;
      projCards.forEach(function (card) {
        if (filter === 'all' || card.dataset.cat === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* =========================================================
   * BACK TO TOP BUTTON + RING PROGRESS
   * ========================================================= */
  const backToTop = document.getElementById('back-to-top');
  const bttCircle  = document.getElementById('btt-circle');
  var CIRCUMFERENCE = 2 * Math.PI * 20; // r=20 → ~125.66

  function updateBackToTop() {
    if (!backToTop) return;
    const scrollTop    = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    if (bttCircle) {
      bttCircle.style.strokeDasharray  = CIRCUMFERENCE;
      bttCircle.style.strokeDashoffset = CIRCUMFERENCE * (1 - pct);
    }
    if (scrollTop > 500) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  }

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* =========================================================
   * COPY EMAIL BUTTON
   * ========================================================= */
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const text = btn.dataset.copy;
      if (!text) return;
      navigator.clipboard.writeText(text).then(function () {
        btn.classList.add('copied');
        btn.innerHTML = '<i class="bx bx-check"></i>';
        showToast('Email copied to clipboard!');
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.innerHTML = '<i class="bx bx-copy"></i>';
        }, 2000);
      }).catch(function () {
        showToast('Could not copy — please copy manually');
      });
    });
  });

  /* =========================================================
   * RIPPLE EFFECT
   * ========================================================= */
  document.querySelectorAll('.ripple').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      const rect   = btn.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      const circle = document.createElement('span');
      circle.classList.add('ripple-circle');
      circle.style.cssText = [
        'width:'  + size + 'px',
        'height:' + size + 'px',
        'left:'   + x + 'px',
        'top:'    + y + 'px'
      ].join(';');

      btn.appendChild(circle);
      circle.addEventListener('animationend', function () { circle.remove(); });
    });
  });

  /* =========================================================
   * CONTACT FORM VALIDATION
   * ========================================================= */
  const form = document.getElementById('contact-form');

  function setError(fieldId, errId, message) {
    const field = document.getElementById(fieldId);
    const err   = document.getElementById(errId);
    if (field) field.classList.toggle('error', !!message);
    if (err)   err.textContent = message || '';
    return !!message;
  }

  function validateForm(data) {
    let hasError = false;

    if (!data.name || data.name.trim().length < 2) {
      if (setError('f-name', 'err-name', 'Name must be at least 2 characters')) hasError = true;
    } else {
      setError('f-name', 'err-name', '');
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRe.test(data.email)) {
      if (setError('f-email', 'err-email', 'Please enter a valid email address')) hasError = true;
    } else {
      setError('f-email', 'err-email', '');
    }

    if (!data.subject || data.subject.trim().length < 5) {
      if (setError('f-subject', 'err-subject', 'Subject must be at least 5 characters')) hasError = true;
    } else {
      setError('f-subject', 'err-subject', '');
    }

    if (!data.message || data.message.trim().length < 10) {
      if (setError('f-message', 'err-message', 'Message must be at least 10 characters')) hasError = true;
    } else {
      setError('f-message', 'err-message', '');
    }

    return !hasError;
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 3500);
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const data = {
        name:    document.getElementById('f-name')   ? document.getElementById('f-name').value   : '',
        email:   document.getElementById('f-email')  ? document.getElementById('f-email').value  : '',
        subject: document.getElementById('f-subject')? document.getElementById('f-subject').value : '',
        message: document.getElementById('f-message')? document.getElementById('f-message').value : ''
      };

      if (!validateForm(data)) return;

      const btn   = document.getElementById('send-btn');
      const label = document.getElementById('send-label');
      const icon  = document.getElementById('send-icon');

      if (btn) btn.disabled = true;
      if (label) label.textContent = 'Sending...';
      if (icon) icon.className = 'bx bx-loader bx-spin';

      // Simulate sending (no real backend)
      setTimeout(function () {
        form.reset();
        if (btn) btn.disabled = false;
        if (label) label.textContent = 'Send Message';
        if (icon) icon.className = 'bx bx-send';
        showToast('Message sent! I\'ll get back to you soon.');
      }, 1600);
    });
  }

})();

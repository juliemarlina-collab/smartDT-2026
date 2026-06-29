/* Smart DT Project — ui.js
   Carousel, decorative elements, nav active state.
   Called by phase-engine.js after DOM is ready.
   --------------------------------------------------------- */
(function (global) {
  'use strict';

  /* ── Dot grid background ─────────────────────────────── */
  function _injectDotGrid() {
    if (document.body.dataset.dots !== 'true') return;
    if (document.querySelector('.dot-grid-bg')) return;
    var grid = document.createElement('div');
    grid.className = 'dot-grid-bg';
    grid.setAttribute('aria-hidden', 'true');
    document.body.appendChild(grid);
  }

  /* ── Pink blob decoration ────────────────────────────── */
  function _injectBlob() {
    if (document.querySelector('.pink-blob')) return;
    var blob = document.createElement('img');
    blob.src = 'assets/shared/pink-blob.png';
    blob.className = 'pink-blob';
    blob.alt = '';
    blob.setAttribute('aria-hidden', 'true');
    blob.onerror = function () { this.style.display = 'none'; };
    document.body.insertBefore(blob, document.body.firstChild);
  }

  /* ── Bottom nav active state ─────────────────────────── */
  function _setNavActive() {
    var page  = location.pathname.split('/').pop() || 'index.html';
    var items = document.querySelectorAll('.nav-item[data-page]');
    items.forEach(function (el) {
      var target = el.dataset.page || '';
      el.classList.toggle('active', target === page || page.indexOf(target) === 0);
    });
  }

  /* ── Carousel ────────────────────────────────────────── */
  function initCarousel(wrapId, dotRowId) {
    var wrap  = document.getElementById(wrapId  || 'phase-carousel');
    var track = document.getElementById('carousel-track');
    var dotRow = document.getElementById(dotRowId || 'carousel-dots');
    if (!wrap || !track) return;

    var slides = Array.from(track.querySelectorAll('.carousel-slide'));
    if (!slides.length) return;

    var current = 0;

    /* Build dots if dotRow exists */
    function buildDots() {
      if (!dotRow) return;
      dotRow.innerHTML = '';
      slides.forEach(function (_, i) {
        var dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.addEventListener('click', function () { goTo(i); });
        dotRow.appendChild(dot);
      });
    }

    function goTo(index) {
      slides[current].setAttribute('aria-hidden', 'true');
      current = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + current * 100 + '%)';
      slides.forEach(function (s, i) {
        s.setAttribute('aria-hidden', i !== current ? 'true' : 'false');
      });
      if (dotRow) {
        var dots = dotRow.querySelectorAll('.dot');
        dots.forEach(function (d, i) {
          d.classList.toggle('active', i === current);
          d.setAttribute('aria-selected', i === current ? 'true' : 'false');
        });
      }
    }

    buildDots();

    /* Touch/swipe */
    var startX = 0;
    wrap.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    wrap.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
    }, { passive: true });

    /* Auto-advance every 4 s */
    var timer = setInterval(function () { goTo(current + 1); }, 4000);
    wrap.addEventListener('touchstart', function () { clearInterval(timer); }, { passive: true });
  }

  /* ── Public API ──────────────────────────────────────── */
  global.SmartDTUI = {
    init: function () {
      _injectDotGrid();
      _setNavActive();
      initCarousel();
    },
    initCarousel: initCarousel
  };

}(window));

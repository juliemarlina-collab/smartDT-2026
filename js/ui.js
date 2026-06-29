/* Smart DT Project — UI helpers
   Exposes: window.SmartDTUI = { init, initCarousel }
*/
(function () {
  'use strict';

  function _setNavActive() {
    var page = document.body.dataset.page || '';
    document.querySelectorAll('.nav-item[data-nav]').forEach(function (el) {
      el.classList.toggle('active', el.dataset.nav === page);
    });
  }

  function _injectBlob() {
    var targets = document.querySelectorAll('[data-blob="true"]');
    targets.forEach(function (el) {
      if (el.querySelector('.blob-bg')) return;
      var div = document.createElement('div');
      div.className = 'blob-bg';
      el.prepend(div);
    });
  }

  function initCarousel(wrapId, dotRowId) {
    var wrap = document.getElementById(wrapId);
    var dotRow = document.getElementById(dotRowId);
    if (!wrap) return;
    var track = wrap.querySelector('.carousel-track');
    var slides = wrap.querySelectorAll('.carousel-slide');
    if (!track || slides.length === 0) return;

    var current = 0;
    var total = slides.length;
    var startX = 0;
    var timer;

    function go(idx) {
      current = (idx + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      if (dotRow) {
        dotRow.querySelectorAll('.dot').forEach(function (d, i) {
          d.classList.toggle('active', i === current);
        });
      }
    }

    if (dotRow) {
      dotRow.innerHTML = '';
      for (var i = 0; i < total; i++) {
        (function (idx) {
          var d = document.createElement('button');
          d.className = 'dot' + (idx === 0 ? ' active' : '');
          d.setAttribute('aria-label', 'Slide ' + (idx + 1));
          d.addEventListener('click', function () { go(idx); restart(); });
          dotRow.appendChild(d);
        })(i);
      }
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () { go(current + 1); }, 4000);
    }

    track.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { go(current + (dx < 0 ? 1 : -1)); restart(); }
    }, { passive: true });

    restart();
  }

  function init() {
    _setNavActive();
    _injectBlob();

    /* Guard: check auth on protected pages */
    var page = document.body.dataset.page || '';
    var open = ['welcome', 'login', 'register', '404'];
    if (open.indexOf(page) === -1) {
      var reg = localStorage.getItem('df_registered');
      if (!reg) {
        window.location.href = 'login.html';
      }
    }
  }

  window.SmartDTUI = { init: init, initCarousel: initCarousel };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());

/* Smart DT Project — phase-engine.js
   Tab switching, quiz rendering/scoring, template auto-save, phase submit.
   Requires: js/data.js (window.SMARTDT_QUIZ), js/ui.js (SmartDTUI)
   -------------------------------------------------------------------- */
(function (global) {
  'use strict';

  /* ── localStorage helpers ──────────────────────────── */
  var store = {
    get:     function (k)   { return localStorage.getItem(k) || ''; },
    set:     function (k,v) { localStorage.setItem(k, String(v)); },
    json:    function (k,d) { try { return JSON.parse(localStorage.getItem(k) || '') || d; } catch(e) { return d; } },
    setJson: function (k,v) { localStorage.setItem(k, JSON.stringify(v)); }
  };

  /* ── Toast notification ────────────────────────────── */
  function toast(msg, colour) {
    var el = document.getElementById('smartdt-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'smartdt-toast';
      el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);'
        + 'background:#081B44;color:#fff;padding:10px 20px;border-radius:24px;font-size:13px;'
        + 'font-weight:600;z-index:9999;opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;'
        + 'white-space:nowrap;max-width:90vw;text-align:center';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.background = colour || '#081B44';
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(el._timer);
    el._timer = setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2600);
  }

  /* ── Google Sheets sync ────────────────────────────── */
  function syncSheets(url, action, payload) {
    if (!url) return;
    var body = JSON.stringify({
      action: action,
      source: 'Smart DT Project',
      appVersion: 'v3.0.0',
      page: location.pathname.split('/').pop(),
      timestamp: new Date().toISOString(),
      student: {
        studentName: store.get('df_student_name'),
        email:       store.get('df_email'),
        regNo:       store.get('df_reg_no'),
        className:   store.get('df_class'),
        team:        store.get('df_team'),
        projectName: store.get('df_project_name')
      },
      payload: payload || {}
    });
    try {
      fetch(url, {
        method:  'POST',
        mode:    'no-cors',
        cache:   'no-store',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body:    body
      }).catch(function () {});
    } catch (e) {}
  }

  /* ── Tab system ────────────────────────────────────── */
  function initTabs(phaseNum) {
    var tabs   = document.querySelectorAll('.tab-btn[data-tab]');
    var panels = document.querySelectorAll('.tab-panel[id]');

    function showTab(id) {
      tabs.forEach(function (t) {
        var active = t.dataset.tab === id;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      panels.forEach(function (p) {
        var active = p.id === 'tab-' + id;
        p.classList.toggle('hidden', !active);
        p.removeAttribute('hidden');
        if (!active) p.setAttribute('hidden', '');
        else         p.removeAttribute('hidden');
      });
    }

    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.tab;
        if (id === 'templates' && btn.classList.contains('locked')) {
          toast('Pass the Quiz first to unlock Templates 🔒');
          showTab('quiz');
          return;
        }
        showTab(id);
      });
    });

    /* Restore last active tab */
    var lastTab = store.get('df_active_tab_p' + phaseNum);
    if (lastTab) showTab(lastTab);
    else         showTab('info');

    /* Persist tab choice */
    tabs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        store.set('df_active_tab_p' + phaseNum, btn.dataset.tab);
      });
    });
  }

  /* ── Quiz ──────────────────────────────────────────── */
  function initQuiz(phaseNum, sheetUrl) {
    var container = document.getElementById('quiz-container');
    if (!container) return;

    var questions = (window.SMARTDT_QUIZ || {})[phaseNum];
    if (!questions || !questions.length) {
      container.innerHTML = '<p style="padding:20px;color:#666">No quiz available for this phase.</p>';
      return;
    }

    var scoreKey    = 'df_quiz_phase' + phaseNum;
    var unlockedKey = 'df_unlocked_phase' + phaseNum;
    var savedScore  = parseInt(store.get(scoreKey) || '-1', 10);

    /* Already passed — show result immediately */
    if (savedScore >= 3) {
      renderResult(savedScore, questions.length);
      unlockTemplates();
      return;
    }

    var current  = 0;
    var answers  = [];
    var selected = null;

    function render() {
      var q = questions[current];
      var html = '<div class="quiz-card">'
        + '<p class="quiz-q-num">Question ' + (current + 1) + ' of ' + questions.length + '</p>'
        + '<p class="quiz-q-text">' + esc(q.q) + '</p>'
        + '<div class="quiz-options">'
        + q.o.map(function (opt, i) {
            return '<button class="quiz-option" data-idx="' + i + '" type="button">' + esc(opt) + '</button>';
          }).join('')
        + '</div>'
        + '<button class="quiz-next btn-primary" id="quiz-next-btn" disabled type="button">'
        + (current < questions.length - 1 ? 'Next →' : 'Submit Quiz')
        + '</button>'
        + '</div>';
      container.innerHTML = html;

      /* Restore prior answer for this question */
      if (answers[current] !== undefined) {
        var opts = container.querySelectorAll('.quiz-option');
        opts[answers[current]].classList.add('selected');
        selected = answers[current];
        document.getElementById('quiz-next-btn').disabled = false;
      } else {
        selected = null;
      }

      container.querySelectorAll('.quiz-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          container.querySelectorAll('.quiz-option').forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          selected = parseInt(btn.dataset.idx, 10);
          document.getElementById('quiz-next-btn').disabled = false;
        });
      });

      document.getElementById('quiz-next-btn').addEventListener('click', function () {
        if (selected === null) return;
        answers[current] = selected;
        if (current < questions.length - 1) {
          current++;
          render();
        } else {
          grade();
        }
      });
    }

    function grade() {
      var score = 0;
      questions.forEach(function (q, i) {
        if (answers[i] === q.a) score++;
      });
      store.set(scoreKey, score);

      if (score >= 3) {
        store.set(unlockedKey, 'true');
        unlockTemplates();
        syncSheets(sheetUrl, 'quiz_pass', { phase: phaseNum, score: score });
      }

      renderResult(score, questions.length);
    }

    function renderResult(score, total) {
      var passed = score >= 3;
      var html = '<div class="quiz-result ' + (passed ? 'pass' : 'fail') + '">'
        + '<p class="quiz-result-score">' + score + ' / ' + total + '</p>'
        + '<p class="quiz-result-label">' + (passed ? '🎉 Quiz Passed! Templates are now unlocked.' : '📚 Score 3 or more to unlock Templates.') + '</p>';

      if (!passed) {
        html += '<button class="btn-primary" id="quiz-retry-btn" type="button" style="margin-top:16px">Try Again</button>';
      }

      /* Explanations */
      html += '<div class="quiz-explanations">';
      questions.forEach(function (q, i) {
        var correct = answers[i] === q.a;
        var answered = answers[i] !== undefined;
        html += '<div class="quiz-exp-item ' + (answered ? (correct ? 'correct' : 'wrong') : '') + '">'
          + '<p class="quiz-exp-q">' + esc(q.q) + '</p>'
          + (answered ? '<p class="quiz-exp-a">' + (correct ? '✓ Correct' : '✗ You chose: ' + esc(q.o[answers[i]])) + '</p>' : '')
          + '<p class="quiz-exp-text">' + esc(q.e) + '</p>'
          + '</div>';
      });
      html += '</div></div>';

      container.innerHTML = html;

      var retryBtn = document.getElementById('quiz-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', function () {
          current = 0;
          answers = [];
          selected = null;
          render();
        });
      }
    }

    render();
  }

  function unlockTemplates() {
    var tmplBtn = document.querySelector('.tab-btn[data-tab="templates"]');
    if (tmplBtn) {
      tmplBtn.classList.remove('locked');
      var lock = tmplBtn.querySelector('.tab-lock-icon');
      if (lock) lock.remove();
    }
  }

  /* ── Template auto-save ────────────────────────────── */
  function initTemplateForm(namespace, phaseNum, sheetUrl) {
    var form = document.getElementById('template-form');
    if (!form) return;

    /* Restore saved values */
    var saved = store.json('df_p' + String(phaseNum).padStart(2,'0') + '_templates', {});
    Array.from(form.elements).forEach(function (el) {
      if (!el.name) return;
      if (saved[el.name] !== undefined) el.value = saved[el.name];
    });

    /* Debounced auto-save */
    var saveTimer = null;
    function doSave() {
      var data = {};
      Array.from(form.elements).forEach(function (el) {
        if (el.name) data[el.name] = el.value;
      });
      store.setJson('df_p' + String(phaseNum).padStart(2,'0') + '_templates', data);
      toast('Draft saved ✓', '#14B8A6');
      syncSheets(sheetUrl, 'template_draft', { phase: phaseNum, fields: data });
    }

    form.addEventListener('input', function () {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(doSave, 800);
    });
  }

  /* ── Phase submit ──────────────────────────────────── */
  function submitPhase(phaseNum, gateCode, namespaces) {
    var key = 'df_submitted_phase' + String(phaseNum).padStart(2,'0');
    store.set(key, 'true');

    var payload = { phase: phaseNum };
    (namespaces || []).forEach(function (ns) {
      var data = {};
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(ns) === 0) data[k] = localStorage.getItem(k);
      }
      Object.assign(payload, data);
    });

    /* Retrieve sheet URL from meta tag or data attribute */
    var sheetUrl = (document.querySelector('[data-sheet-url]') || {}).dataset
      ? (document.querySelector('[data-sheet-url]') || {}).dataset.sheetUrl || ''
      : '';

    syncSheets(sheetUrl || '', 'phase_submit', payload);
    toast('Phase ' + phaseNum + ' submitted! ✓', '#14B8A6');

    setTimeout(function () {
      var NEXT = {1:'phase02-define.html', 2:'phase03-ideation.html',
                  3:'phase04-prototype.html', 4:'phase05-test.html',
                  5:'portfolio-completion.html'};
      location.href = NEXT[phaseNum] || 'dashboard.html';
    }, 1200);
  }

  /* ── Main init ──────────────────────────────────────── */
  function init(opts) {
    opts = opts || {};
    var phaseNum  = opts.phaseNum  || 1;
    var namespace = opts.namespace || ('df_p' + String(phaseNum).padStart(2,'0') + '_');
    var sheetUrl  = opts.sheetUrl  || '';
    /* hasGate is intentionally ignored — supervisor gate removed */

    /* Check if quiz already passed and unlock templates immediately */
    var scoreKey    = 'df_quiz_phase' + phaseNum;
    var unlockedKey = 'df_unlocked_phase' + phaseNum;
    var savedScore  = parseInt(store.get(scoreKey) || '-1', 10);
    if (savedScore >= 3 || store.get(unlockedKey) === 'true') {
      unlockTemplates();
    }

    initTabs(phaseNum);
    initQuiz(phaseNum, sheetUrl);
    initTemplateForm(namespace, phaseNum, sheetUrl);

    if (global.SmartDTUI) global.SmartDTUI.init();
  }

  /* ── Escape HTML helper ─────────────────────────────── */
  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (m) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[m];
    });
  }

  /* ── Expose public API ──────────────────────────────── */
  global.PhaseEngine = {
    init:        init,
    submitPhase: submitPhase
  };

}(window));

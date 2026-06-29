/* Smart DT Project — Phase Engine
   Exposes: window.PhaseEngine = { init, submitPhase }

   init(opts):
     opts.phaseNum   — 1-5
     opts.namespace  — localStorage key prefix e.g. 'df_p01_'
     opts.hasGate    — false (no supervisor gate)
     opts.sheetUrl   — Google Apps Script Web App URL (or '')
*/
(function () {
  'use strict';

  var _sheetUrl = '';
  var _saveTimers = {};

  /* ── Utility ─────────────────────────────────────────── */
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function syncSheet(data) {
    if (!_sheetUrl) return;
    try {
      fetch(_sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {}
  }

  function studentInfo() {
    return {
      name: localStorage.getItem('df_student_name') || '',
      email: localStorage.getItem('df_email') || '',
      regNo: localStorage.getItem('df_reg_no') || '',
      class: localStorage.getItem('df_class') || '',
      team: localStorage.getItem('df_team') || '',
      project: localStorage.getItem('df_project_name') || ''
    };
  }

  /* ── Tabs ────────────────────────────────────────────── */
  function initTabs(phaseNum) {
    var tabBtns = qsa('.tab-btn');
    var panels = qsa('.tab-panel');
    var unlocked = localStorage.getItem('df_unlocked_phase' + phaseNum) === 'true';

    tabBtns.forEach(function (btn) {
      var target = btn.dataset.tab;

      if (target === 'templates' && !unlocked) {
        btn.classList.add('locked');
        btn.setAttribute('disabled', 'true');
        if (!btn.querySelector('.lock-icon')) {
          var icon = document.createElement('span');
          icon.className = 'lock-icon';
          icon.textContent = ' 🔒';
          btn.appendChild(icon);
        }
      }

      btn.addEventListener('click', function () {
        if (btn.classList.contains('locked')) return;
        tabBtns.forEach(function (b) { b.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.add('hidden'); });
        btn.classList.add('active');
        var panel = document.getElementById(target + 'Panel');
        if (panel) panel.classList.remove('hidden');
      });
    });
  }

  /* ── Quiz ────────────────────────────────────────────── */
  function initQuiz(phaseNum, sheetUrl) {
    var box = document.getElementById('quizBox');
    if (!box) return;
    var questions = (window.SMARTDT_QUIZ || {})[phaseNum];
    if (!questions || !questions.length) {
      box.innerHTML = '<p>No quiz available for this phase.</p>';
      return;
    }

    var current = 0;
    var score = 0;
    var answers = [];

    function renderQ() {
      var q = questions[current];
      box.innerHTML =
        '<div class="quiz-card">' +
          '<p class="quiz-progress">Question ' + (current + 1) + ' of ' + questions.length + '</p>' +
          '<p class="quiz-question">' + q.q + '</p>' +
          '<div class="quiz-options">' +
            q.o.map(function (opt, i) {
              return '<button class="quiz-option" data-idx="' + i + '">' + opt + '</button>';
            }).join('') +
          '</div>' +
        '</div>';

      qsa('.quiz-option', box).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var chosen = Number(btn.dataset.idx);
          answers.push(chosen);
          if (chosen === q.a) score++;
          qsa('.quiz-option', box).forEach(function (b) {
            b.disabled = true;
            if (Number(b.dataset.idx) === q.a) b.classList.add('correct');
            else if (Number(b.dataset.idx) === chosen) b.classList.add('wrong');
          });
          var exp = document.createElement('p');
          exp.className = 'quiz-explanation';
          exp.textContent = q.e;
          box.querySelector('.quiz-card').appendChild(exp);

          setTimeout(function () {
            current++;
            if (current < questions.length) {
              renderQ();
            } else {
              showResult();
            }
          }, 1400);
        });
      });
    }

    function showResult() {
      var pass = score >= 3;
      box.innerHTML =
        '<div class="quiz-result ' + (pass ? 'pass' : 'fail') + '">' +
          '<p class="quiz-score">' + score + ' / ' + questions.length + '</p>' +
          '<p>' + (pass ? '✅ Well done! You unlocked the Templates tab.' : '❌ Score at least 3 to unlock Templates. Try again!') + '</p>' +
          (!pass ? '<button class="btn-primary" id="quizRetry">Try Again</button>' : '') +
        '</div>';

      if (pass) {
        localStorage.setItem('df_quiz_phase' + phaseNum, score);
        unlockTemplates(phaseNum);
        syncSheet({ mode: 'quiz', phase: phaseNum, score: score, student: studentInfo(), ts: Date.now() });
      } else {
        var retry = document.getElementById('quizRetry');
        if (retry) retry.addEventListener('click', function () { current = 0; score = 0; answers = []; renderQ(); });
      }
    }

    renderQ();
  }

  function unlockTemplates(phaseNum) {
    localStorage.setItem('df_unlocked_phase' + phaseNum, 'true');
    var btn = qs('[data-tab="templates"]');
    if (btn) {
      btn.classList.remove('locked');
      btn.removeAttribute('disabled');
      var icon = btn.querySelector('.lock-icon');
      if (icon) icon.remove();
    }
  }

  /* ── Template Form ───────────────────────────────────── */
  function initTemplateForm(namespace, phaseNum, sheetUrl) {
    var form = document.getElementById('templateForm');
    if (!form) return;

    /* Restore saved values */
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(namespace + 'data') || '{}'); } catch (e) {}
    qsa('textarea, input', form).forEach(function (el) {
      if (el.name && saved[el.name] !== undefined) el.value = saved[el.name];
    });

    /* Debounced auto-save */
    function autoSave() {
      var data = {};
      qsa('textarea, input', form).forEach(function (el) { if (el.name) data[el.name] = el.value; });
      localStorage.setItem(namespace + 'data', JSON.stringify(data));
    }

    qsa('textarea, input', form).forEach(function (el) {
      el.addEventListener('input', function () {
        clearTimeout(_saveTimers[namespace]);
        _saveTimers[namespace] = setTimeout(autoSave, 800);
      });
    });

    /* Mode toggle: Example ↔ Fill */
    qsa('.mode-toggle-btn', form).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.template-card');
        if (!card) return;
        qsa('.mode-toggle-btn', card).forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var mode = btn.dataset.mode;
        qsa('.mode-panel', card).forEach(function (p) { p.hidden = p.dataset.panel !== mode; });
      });
    });

    /* Save Draft button */
    qsa('[data-save-draft]', form).forEach(function (btn) {
      btn.addEventListener('click', function () {
        autoSave();
        btn.textContent = 'Draft Saved ✓';
        setTimeout(function () { btn.textContent = 'Save Draft'; }, 2000);
      });
    });

    /* Printable button */
    qsa('[data-print-template]', form).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tCode = btn.dataset.printTemplate;
        window.location.href = 'printable.html?template=' + tCode + '&phase=' + phaseNum;
      });
    });
  }

  /* ── Submit Phase ────────────────────────────────────── */
  function submitPhase(phaseNum, gateCode, namespaces) {
    var confirmed = window.confirm(
      'Are you sure you want to submit Phase ' + phaseNum + '?\n\nThis marks the phase as Final. You can still view your answers.'
    );
    if (!confirmed) return;

    /* Collect all template data */
    var allData = {};
    (namespaces || []).forEach(function (ns) {
      try {
        var d = JSON.parse(localStorage.getItem(ns + 'data') || '{}');
        Object.assign(allData, d);
      } catch (e) {}
    });

    localStorage.setItem('df_submitted_phase' + phaseNum, 'true');

    var payload = {
      mode: 'submit_phase',
      phase: phaseNum,
      student: studentInfo(),
      templates: allData,
      ts: Date.now()
    };

    syncSheet(payload);

    /* Show confirmation then navigate to next phase or portfolio */
    var nextMap = { 1: 'phase02-define.html', 2: 'phase03-ideation.html', 3: 'phase04-prototype.html', 4: 'phase05-test.html', 5: 'portfolio-completion.html' };
    var next = nextMap[phaseNum] || 'dashboard.html';

    var box = document.getElementById('submitConfirm');
    if (box) {
      box.innerHTML = '<div class="submit-success">✅ Phase ' + phaseNum + ' submitted! Redirecting…</div>';
    }
    setTimeout(function () { window.location.href = next; }, 1800);
  }

  /* ── Public init ─────────────────────────────────────── */
  function init(opts) {
    opts = opts || {};
    var phaseNum = opts.phaseNum || 1;
    _sheetUrl = opts.sheetUrl || '';

    initTabs(phaseNum);

    if (document.getElementById('quizBox')) {
      initQuiz(phaseNum, _sheetUrl);
    }

    var ns = opts.namespace || ('df_p0' + phaseNum + '_');
    initTemplateForm(ns, phaseNum, _sheetUrl);

    /* Submit phase button */
    var submitBtn = document.getElementById('submitPhaseBtn');
    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        submitPhase(phaseNum, opts.gateCode || '', opts.namespaces || [ns]);
      });
    }
  }

  window.PhaseEngine = { init: init, submitPhase: submitPhase };
}());

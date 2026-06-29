/* Smart DT Project — Feedback Module
   Handles: student view of lecturer feedback, submission of peer feedback
   localStorage key: df_feedback_phase{N}
*/
(function () {
  'use strict';

  var PHASE_NAMES = { 1: 'Empathise', 2: 'Define', 3: 'Ideate', 4: 'Prototype', 5: 'Test & Pitch' };

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

  function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  function syncSheet(data) {
    var sheetUrl = localStorage.getItem('df_sheet_url') || '';
    if (!sheetUrl) return;
    try {
      fetch(sheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {}
  }

  function renderFeedbackList() {
    var root = document.getElementById('feedbackListRoot');
    if (!root) return;

    var allFeedback = [];
    for (var p = 1; p <= 5; p++) {
      try {
        var fb = JSON.parse(localStorage.getItem('df_feedback_phase' + p) || 'null');
        if (fb) allFeedback.push({ phase: p, data: fb });
      } catch (e) {}
    }

    if (!allFeedback.length) {
      root.innerHTML = '<div class="feedback-empty"><p>No feedback received yet. Submit your phases and wait for your lecturer to add feedback.</p></div>';
      return;
    }

    root.innerHTML = allFeedback.map(function (item) {
      var d = item.data;
      var scoreHtml = d.score !== undefined
        ? '<span class="feedback-score">' + d.score + ' / ' + (d.maxScore || 100) + '</span>'
        : '';
      return '<div class="feedback-card">' +
        '<div class="feedback-card-header">' +
          '<span class="feedback-phase-badge">Phase 0' + item.phase + ' · ' + escapeHTML(PHASE_NAMES[item.phase] || '') + '</span>' +
          scoreHtml +
        '</div>' +
        (d.comment ? '<p class="feedback-comment">' + escapeHTML(d.comment) + '</p>' : '') +
        (d.strengths ? '<div class="feedback-section"><b>Strengths</b><p>' + escapeHTML(d.strengths) + '</p></div>' : '') +
        (d.improve ? '<div class="feedback-section"><b>Areas to Improve</b><p>' + escapeHTML(d.improve) + '</p></div>' : '') +
        '<p class="feedback-date">' + (d.date ? 'Feedback date: ' + escapeHTML(d.date) : '') + '</p>' +
      '</div>';
    }).join('');
  }

  function renderSelfReflection() {
    var form = document.getElementById('selfReflectionForm');
    if (!form) return;

    var saved = {};
    try { saved = JSON.parse(localStorage.getItem('df_self_reflection') || '{}'); } catch (e) {}
    form.querySelectorAll('textarea, input').forEach(function (el) {
      if (el.name && saved[el.name]) el.value = saved[el.name];
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {};
      form.querySelectorAll('textarea, input').forEach(function (el) {
        if (el.name) data[el.name] = el.value;
      });
      localStorage.setItem('df_self_reflection', JSON.stringify(data));

      syncSheet({
        mode: 'self_reflection',
        student: studentInfo(),
        reflection: data,
        ts: Date.now()
      });

      var msg = document.getElementById('reflectionMsg');
      if (msg) { msg.textContent = 'Reflection saved ✓'; setTimeout(function () { msg.textContent = ''; }, 3000); }
    });
  }

  function init() {
    renderFeedbackList();
    renderSelfReflection();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SmartDTFeedback = { init: init };
}());

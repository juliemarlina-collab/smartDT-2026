/* Smart DT Project — Printable / PDF Export
   Reads template data from localStorage and renders a print-ready view.
   Called by printable.html via ?template=T01&phase=1 query params.
*/
(function () {
  'use strict';

  /* Template label map */
  var TEMPLATE_LABELS = {
    T01: { phase: 1, name: 'POEMS Observation Framework' },
    T02: { phase: 1, name: 'Interview Guide & Worksheet' },
    T03: { phase: 1, name: 'Audio-to-Text Transcription' },
    T04: { phase: 1, name: 'Empathy Map' },
    T05: { phase: 2, name: 'User Persona Template' },
    T06: { phase: 2, name: 'User Insight & Needs Statement' },
    T07: { phase: 3, name: 'Ideation Techniques & Mind Map' },
    T08: { phase: 3, name: 'Sketching Template' },
    T09: { phase: 3, name: 'SCAMPER Template' },
    T10: { phase: 3, name: 'Idea Prioritisation Matrix' },
    T11: { phase: 4, name: 'Prototype Direction Plan' },
    T12: { phase: 5, name: 'User Feedback & Feedback Grid' },
    T13: { phase: 5, name: '8-Slide Pitch Framework' }
  };

  /* Map template code to localStorage namespace */
  var TEMPLATE_NS = {
    T01: 'df_p01_', T02: 'df_p01_', T03: 'df_p01_', T04: 'df_p01_',
    T05: 'df_p02_', T06: 'df_p02_',
    T07: 'df_p03_', T08: 'df_p03_', T09: 'df_p03_', T10: 'df_p03_',
    T11: 'df_p04_',
    T12: 'df_p05_', T13: 'df_p05_'
  };

  function getParams() {
    var params = {};
    window.location.search.replace(/^\?/, '').split('&').forEach(function (pair) {
      var kv = pair.split('=');
      if (kv[0]) params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return params;
  }

  function studentInfo() {
    return {
      name: localStorage.getItem('df_student_name') || '—',
      email: localStorage.getItem('df_email') || '—',
      regNo: localStorage.getItem('df_reg_no') || '—',
      class: localStorage.getItem('df_class') || '—',
      team: localStorage.getItem('df_team') || '—',
      project: localStorage.getItem('df_project_name') || '—'
    };
  }

  function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  function renderPrintable(templateCode, phaseNum) {
    var root = document.getElementById('printableRoot');
    if (!root) return;

    var info = TEMPLATE_LABELS[templateCode] || { phase: phaseNum, name: templateCode };
    var ns = TEMPLATE_NS[templateCode] || ('df_p0' + phaseNum + '_');
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(ns + 'data') || '{}'); } catch (e) {}

    var stu = studentInfo();
    var now = new Date().toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' });

    var fieldsHtml = '';
    Object.keys(saved).forEach(function (key) {
      if (!saved[key]) return;
      var label = key.replace(/_/g, ' ').replace(/^(df |t\d\d |p0\d )/, '').trim();
      fieldsHtml +=
        '<div class="print-field">' +
          '<p class="print-field-label">' + escapeHTML(label) + '</p>' +
          '<div class="print-field-value">' + escapeHTML(saved[key]).replace(/\n/g, '<br>') + '</div>' +
        '</div>';
    });

    if (!fieldsHtml) {
      fieldsHtml = '<p class="print-empty">No data saved for this template yet. Complete the template first.</p>';
    }

    root.innerHTML =
      '<div class="print-page">' +
        '<div class="print-header">' +
          '<div class="print-logo-wrap">' +
            '<strong class="print-brand">Smart DT Project</strong>' +
            '<span class="print-phase-badge">Phase 0' + info.phase + '</span>' +
          '</div>' +
          '<div class="print-title-wrap">' +
            '<h1 class="print-title">' + escapeHTML(templateCode) + ' — ' + escapeHTML(info.name) + '</h1>' +
            '<p class="print-date">Printed: ' + now + '</p>' +
          '</div>' +
        '</div>' +
        '<table class="print-student-table">' +
          '<tr><td><b>Name</b></td><td>' + escapeHTML(stu.name) + '</td><td><b>Reg No</b></td><td>' + escapeHTML(stu.regNo) + '</td></tr>' +
          '<tr><td><b>Class</b></td><td>' + escapeHTML(stu.class) + '</td><td><b>Team</b></td><td>' + escapeHTML(stu.team) + '</td></tr>' +
          '<tr><td><b>Project</b></td><td colspan="3">' + escapeHTML(stu.project) + '</td></tr>' +
        '</table>' +
        '<div class="print-fields">' + fieldsHtml + '</div>' +
        '<div class="print-footer">' +
          'Smart DT Project · Design Thinking Evidence Record · ' + escapeHTML(templateCode) + ' · ' + now +
        '</div>' +
      '</div>';
  }

  function init() {
    var params = getParams();
    var templateCode = (params.template || 'T01').toUpperCase();
    var phaseNum = Number(params.phase) || 1;

    renderPrintable(templateCode, phaseNum);

    var printBtn = document.getElementById('triggerPrint');
    if (printBtn) {
      printBtn.addEventListener('click', function () { window.print(); });
    }

    /* Log print to sheet */
    var sheetUrl = localStorage.getItem('df_sheet_url') || '';
    if (sheetUrl) {
      try {
        fetch(sheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'print_log',
            template: templateCode,
            phase: phaseNum,
            student: studentInfo(),
            ts: Date.now()
          })
        });
      } catch (e) {}
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SmartDTPrintable = { renderPrintable: renderPrintable };
}());

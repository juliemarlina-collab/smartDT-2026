/* Smart DT Project — Marks / Rubric Module
   Displays per-phase rubric scores and overall grade.
   Scores are stored in localStorage by lecturer sync or manual entry.
   localStorage key: df_marks_phase{N}
   Overall: df_marks_overall
*/
(function () {
  'use strict';

  var RUBRIC = {
    1: [
      { criterion: 'User Evidence Quality', max: 20 },
      { criterion: 'Empathy Map Completion', max: 20 },
      { criterion: 'Interview Depth', max: 20 },
      { criterion: 'Template Accuracy', max: 20 },
      { criterion: 'Reflection & Insight', max: 20 }
    ],
    2: [
      { criterion: 'Persona Realism', max: 20 },
      { criterion: 'Needs Statement Clarity', max: 20 },
      { criterion: 'Evidence Linkage', max: 20 },
      { criterion: 'HMW Quality', max: 20 },
      { criterion: 'Insight Depth', max: 20 }
    ],
    3: [
      { criterion: 'Idea Quantity & Diversity', max: 20 },
      { criterion: 'SCAMPER Application', max: 20 },
      { criterion: 'Mind Map Breadth', max: 20 },
      { criterion: 'Matrix Justification', max: 20 },
      { criterion: 'Selected Idea Rationale', max: 20 }
    ],
    4: [
      { criterion: 'Prototype Alignment to Problem', max: 25 },
      { criterion: 'Version Documentation', max: 25 },
      { criterion: 'Materials & Feasibility', max: 25 },
      { criterion: 'Task Distribution', max: 25 }
    ],
    5: [
      { criterion: 'Test Planning', max: 20 },
      { criterion: 'Feedback Collection', max: 20 },
      { criterion: 'Improvement Plan', max: 20 },
      { criterion: 'Pitch Structure & Clarity', max: 20 },
      { criterion: 'Final Reflection', max: 20 }
    ]
  };

  var PHASE_NAMES = { 1: 'Empathise', 2: 'Define', 3: 'Ideate', 4: 'Prototype', 5: 'Test & Pitch' };
  var PHASE_WEIGHTS = { 1: 15, 2: 15, 3: 20, 4: 25, 5: 25 }; /* % of overall grade */

  function escapeHTML(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  function getMarks(phaseNum) {
    try { return JSON.parse(localStorage.getItem('df_marks_phase' + phaseNum) || 'null'); } catch (e) { return null; }
  }

  function calcGrade(pct) {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 75) return 'A-';
    if (pct >= 70) return 'B+';
    if (pct >= 65) return 'B';
    if (pct >= 60) return 'B-';
    if (pct >= 55) return 'C+';
    if (pct >= 50) return 'C';
    if (pct >= 45) return 'C-';
    if (pct >= 40) return 'D';
    return 'F';
  }

  function renderPhaseCards() {
    var root = document.getElementById('marksPhaseRoot');
    if (!root) return;

    var totalWeighted = 0;
    var totalWeight = 0;

    var html = '';
    for (var p = 1; p <= 5; p++) {
      var marks = getMarks(p);
      var rubric = RUBRIC[p] || [];
      var weight = PHASE_WEIGHTS[p] || 20;
      var submitted = localStorage.getItem('df_submitted_phase' + p) === 'true';

      var phaseScore = 0;
      var phaseMax = rubric.reduce(function (acc, r) { return acc + r.max; }, 0);
      var criteriaRows = '';

      rubric.forEach(function (row) {
        var score = marks && marks[row.criterion] !== undefined ? Number(marks[row.criterion]) : null;
        if (score !== null) phaseScore += score;
        criteriaRows +=
          '<tr>' +
            '<td>' + escapeHTML(row.criterion) + '</td>' +
            '<td class="marks-score-cell">' + (score !== null ? score + ' / ' + row.max : '—') + '</td>' +
          '</tr>';
      });

      var pct = phaseMax > 0 && marks ? Math.round((phaseScore / phaseMax) * 100) : null;
      var grade = pct !== null ? calcGrade(pct) : '—';

      if (pct !== null) {
        totalWeighted += pct * weight;
        totalWeight += weight;
      }

      var statusClass = submitted ? 'submitted' : 'pending';
      var statusLabel = submitted ? 'Submitted' : 'Not Submitted';

      html +=
        '<div class="marks-phase-card">' +
          '<div class="marks-phase-header">' +
            '<span class="marks-phase-name">Phase 0' + p + ' · ' + escapeHTML(PHASE_NAMES[p]) + '</span>' +
            '<span class="marks-status ' + statusClass + '">' + statusLabel + '</span>' +
          '</div>' +
          '<table class="marks-rubric-table">' +
            '<thead><tr><th>Criterion</th><th>Score</th></tr></thead>' +
            '<tbody>' + criteriaRows + '</tbody>' +
          '</table>' +
          '<div class="marks-phase-total">' +
            '<span>Phase Score: ' + (marks ? phaseScore + ' / ' + phaseMax : 'Pending') + '</span>' +
            '<span class="marks-grade-badge">' + grade + '</span>' +
          '</div>' +
        '</div>';
    }

    root.innerHTML = html;

    /* Overall summary */
    var overallEl = document.getElementById('marksOverall');
    if (overallEl && totalWeight > 0) {
      var overallPct = Math.round(totalWeighted / totalWeight);
      overallEl.innerHTML =
        '<div class="marks-overall-card">' +
          '<p class="marks-overall-label">Overall Grade</p>' +
          '<p class="marks-overall-pct">' + overallPct + '%</p>' +
          '<p class="marks-overall-grade">' + calcGrade(overallPct) + '</p>' +
        '</div>';
    }
  }

  function init() {
    renderPhaseCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SmartDTMarks = { init: init, calcGrade: calcGrade };
}());

/* =========================================================
   Smart DT Project · AI DT Buddy
   Version: 1.0 static/rule-based helper
   No API key needed. Safe for GitHub Pages.
   Later: replace buildBuddyReply() with Apps Script/Gemini endpoint.
   ========================================================= */
(function () {
  'use strict';

  var PHASES = {
    1: {
      name: 'Empathy', tagline: 'Understand people deeply before solving.',
      templates: ['T01 Interview Guide', 'T02 Empathy Map', 'T03 Persona', 'T04 User Needs Summary'],
      chips: ['Help me interview users', 'Check my empathy map', 'Create user needs', 'What to avoid?'],
      focus: 'Listen, observe, and collect evidence from real target users.'
    },
    2: {
      name: 'Define', tagline: 'Turn research into one clear problem.',
      templates: ['T05 Problem Statement', 'T06 How Might We'],
      chips: ['Improve my POV', 'Create HMW questions', 'Check problem statement', 'What to avoid?'],
      focus: 'Frame the user, need, and insight without jumping to a solution.'
    },
    3: {
      name: 'Ideation', tagline: 'Generate many ideas before choosing one.',
      templates: ['T07 Brainstorming', 'T08 SCAMPER', 'T09 Idea Selection Matrix', 'T10 Final Idea Justification'],
      chips: ['Give me idea prompts', 'Explain SCAMPER', 'Help choose idea', 'What to avoid?'],
      focus: 'Explore widely, build on ideas, then select using clear criteria.'
    },
    4: {
      name: 'Prototype', tagline: 'Build fast to learn faster.',
      templates: ['T11 Prototype Plan', 'T12 Version Log', 'T13 Prototype Evidence'],
      chips: ['Plan my prototype', 'What is low fidelity?', 'Improve my version log', 'What to avoid?'],
      focus: 'Make the idea tangible using a simple prototype and document iterations.'
    },
    5: {
      name: 'Test', tagline: 'Use real feedback to improve the solution.',
      templates: ['T14 User Feedback', 'T15 Improvement Plan', 'T16 Final Reflection'],
      chips: ['Create test questions', 'Summarise feedback', 'Write improvement plan', 'What to avoid?'],
      focus: 'Observe real users, capture feedback honestly, and decide improvements.'
    }
  };

  var state = { phase: 1, open: false, history: [] };

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m];
    });
  }

  function detectPhase() {
    var path = (location.pathname || '').toLowerCase();
    var m = path.match(/phase0?([1-5])/);
    if (m) return Number(m[1]);

    var counter = qs('.phase-counter-current');
    if (counter) {
      var n = Number(counter.textContent.trim());
      if (n >= 1 && n <= 5) return n;
    }

    var title = (document.title || '').toLowerCase();
    if (title.indexOf('define') >= 0) return 2;
    if (title.indexOf('ideation') >= 0 || title.indexOf('ideate') >= 0) return 3;
    if (title.indexOf('prototype') >= 0) return 4;
    if (title.indexOf('test') >= 0) return 5;
    return 1;
  }

  function storageKey() { return 'smartdt_ai_dt_buddy_phase_' + state.phase; }
  function loadHistory() {
    try { state.history = JSON.parse(localStorage.getItem(storageKey()) || '[]'); }
    catch (e) { state.history = []; }
  }
  function saveHistory() {
    try { localStorage.setItem(storageKey(), JSON.stringify(state.history.slice(-30))); }
    catch (e) {}
  }

  function iconRobot() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="4"></rect><path d="M12 3v4"></path><circle cx="9" cy="13" r="1"></circle><circle cx="15" cy="13" r="1"></circle><path d="M9 17h6"></path></svg>';
  }
  function iconClose() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  }
  function iconSend() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>';
  }

  function buildUI() {
    if (qs('#ai-dt-buddy-root')) return;

    var phase = PHASES[state.phase];
    var root = document.createElement('div');
    root.id = 'ai-dt-buddy-root';
    root.innerHTML =
      '<button class="ai-dt-buddy-fab" id="ai-dt-buddy-fab" aria-label="Open AI DT Buddy">' + iconRobot() + '</button>' +
      '<div class="ai-dt-buddy-overlay" id="ai-dt-buddy-overlay" aria-hidden="true">' +
        '<section class="ai-dt-buddy-panel" role="dialog" aria-modal="true" aria-labelledby="ai-dt-buddy-title">' +
          '<header class="ai-dt-buddy-header">' +
            '<div class="ai-dt-buddy-avatar">' + iconRobot() + '</div>' +
            '<div class="ai-dt-buddy-title-wrap">' +
              '<h2 class="ai-dt-buddy-title" id="ai-dt-buddy-title">AI DT Buddy</h2>' +
              '<p class="ai-dt-buddy-subtitle">' + escapeHTML(phase.name) + ' Phase · ' + escapeHTML(phase.tagline) + '</p>' +
            '</div>' +
            '<button class="ai-dt-buddy-close" id="ai-dt-buddy-close" aria-label="Close AI DT Buddy">' + iconClose() + '</button>' +
          '</header>' +
          '<div class="ai-dt-buddy-quickchips" id="ai-dt-buddy-quickchips"></div>' +
          '<div class="ai-dt-buddy-messages" id="ai-dt-buddy-messages" aria-live="polite"></div>' +
          '<div class="ai-dt-buddy-inputbar">' +
            '<textarea class="ai-dt-buddy-input" id="ai-dt-buddy-input" rows="1" placeholder="Ask your AI DT Buddy..."></textarea>' +
            '<button class="ai-dt-buddy-send" id="ai-dt-buddy-send" aria-label="Send message">' + iconSend() + '</button>' +
          '</div>' +
          '<div class="ai-dt-buddy-note">Buddy gives guidance only. Students still need to think, discuss, collect real evidence, and write their own final answers.</div>' +
        '</section>' +
      '</div>';

    document.body.appendChild(root);
    renderChips();
    renderMessages();
    bindEvents();
  }

  function renderChips() {
    var box = qs('#ai-dt-buddy-quickchips');
    var phase = PHASES[state.phase];
    if (!box) return;
    box.innerHTML = phase.chips.map(function (c) {
      return '<button class="ai-dt-chip" type="button" data-chip="' + escapeHTML(c) + '">' + escapeHTML(c) + '</button>';
    }).join('');
  }

  function defaultWelcome() {
    var p = PHASES[state.phase];
    return 'Hi, I am your AI DT Buddy for **' + p.name + ' Phase**.\n\nI can help you:\n• understand what to do next\n• improve your template answers\n• check whether your work matches Design Thinking principles\n• prepare questions, HMW, prototype/testing plans\n\nCurrent focus: ' + p.focus;
  }

  function formatBubbleText(text) {
    return escapeHTML(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  function renderMessages() {
    var box = qs('#ai-dt-buddy-messages');
    if (!box) return;
    var items = state.history.length ? state.history : [{ role: 'buddy', text: defaultWelcome() }];
    box.innerHTML = items.map(function (m) {
      return '<div class="ai-dt-msg ' + (m.role === 'user' ? 'user' : 'buddy') + '"><div class="ai-dt-bubble">' + formatBubbleText(m.text) + '</div></div>';
    }).join('');
    box.scrollTop = box.scrollHeight;
  }

  function openBuddy() {
    var overlay = qs('#ai-dt-buddy-overlay');
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    state.open = true;
    setTimeout(function () { var input = qs('#ai-dt-buddy-input'); if (input) input.focus(); }, 60);
  }
  function closeBuddy() {
    var overlay = qs('#ai-dt-buddy-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    state.open = false;
  }

  function collectPageContext() {
    var activeTab = qs('.tab-btn.active');
    var activeTabText = activeTab ? activeTab.textContent.replace(/\s+/g, ' ').trim() : '';
    var titles = qsa('.template-title').map(function (el) { return el.textContent.trim(); }).filter(Boolean).slice(0, 8);
    return { activeTab: activeTabText, visibleTemplates: titles };
  }

  function buildBuddyReply(input) {
    var p = PHASES[state.phase];
    var text = input.toLowerCase();
    var ctx = collectPageContext();

    if (/avoid|mistake|wrong|jangan|tak boleh/.test(text)) {
      return '**Common mistakes in ' + p.name + ' Phase:**\n' +
        phaseMistakes(state.phase) + '\n\nBetter approach: focus on evidence, clarity, and simple student-friendly wording.';
    }

    if (/template|form|t0|t1|sheet|submit/.test(text)) {
      return '**Templates for ' + p.name + ' Phase:**\n• ' + p.templates.join('\n• ') +
        '\n\nUse each template as evidence of thinking process, not just as a form to complete. Current tab: ' + (ctx.activeTab || 'not detected') + '.';
    }

    if (/quiz|unlock|locked|pass/.test(text)) {
      return 'To unlock the templates, students should complete the **Quick Check Quiz** and score at least **3 out of 5**. If the Templates tab is still locked, check whether the quiz score is saved in localStorage for this phase.';
    }

    if (/interview|question|user/.test(text)) {
      return interviewHelp(state.phase);
    }

    if (/hmw|how might we/.test(text)) {
      return '**HMW guide:**\nStart with: “How might we help [user] to [need] so that [benefit]?”\n\nGood HMW questions are open, user-centred, and not too broad. Avoid already naming the solution inside the question.';
    }

    if (/scamper|brainstorm|idea|ideation/.test(text)) {
      return '**Ideation support:**\nGenerate many ideas first. Then use SCAMPER: Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse. After that, use the matrix to select based on feasibility, impact, novelty, and cost.';
    }

    if (/prototype|version|low fidelity|build/.test(text)) {
      return '**Prototype support:**\nStart with a low-fidelity version: paper sketch, simple mockup, storyboard, role-play, or clickable draft. The goal is not perfection. The goal is to learn what users understand, struggle with, and need improved.';
    }

    if (/test|feedback|improve|reflection/.test(text)) {
      return '**Testing support:**\nTest with at least 3 real users. Observe silently first, then ask what worked, what confused them, and what they would improve. Summarise feedback into clear patterns before writing the improvement plan.';
    }

    return '**For ' + p.name + ' Phase**, here is a useful next step:\n' +
      nextStep(state.phase) + '\n\nYour message: “' + input.trim() + '”\n\nTry turning it into evidence: What did the user say/do? What pattern did your team notice? What decision will you make next?';
  }

  function phaseMistakes(phase) {
    var map = {
      1: '• Asking leading questions\n• Interviewing only friends\n• Assuming feelings without evidence\n• Skipping observation',
      2: '• Writing a solution inside the problem statement\n• Making the scope too broad\n• Ignoring empathy evidence\n• Skipping HMW questions',
      3: '• Judging ideas too early\n• Stopping at the first good idea\n• Choosing by preference only\n• Not using SCAMPER/matrix properly',
      4: '• Making it too perfect too soon\n• Not documenting versions\n• Forgetting user feedback\n• Building without linking to the problem',
      5: '• Explaining too much during testing\n• Only collecting positive feedback\n• Testing with too few users\n• Not turning feedback into improvements'
    };
    return map[phase] || map[1];
  }

  function interviewHelp(phase) {
    if (phase === 1) {
      return '**Empathy interview prompts:**\n• Tell me about your experience with this problem.\n• What is the hardest part for you?\n• What do you usually do when this happens?\n• How does it make you feel?\n• What would make the experience better?\n\nAvoid yes/no and leading questions.';
    }
    return 'Use user evidence from Empathy. Ask: What did users repeatedly mention? Which need is most urgent? Which insight explains why the problem matters?';
  }

  function nextStep(phase) {
    var map = {
      1: 'Complete at least 3 user interviews, then organise findings into Says / Thinks / Does / Feels.',
      2: 'Write one POV statement using: [user] needs [need] because [insight]. Then create 5 HMW questions.',
      3: 'Generate 20+ ideas first, then use SCAMPER and the Idea Selection Matrix.',
      4: 'Build a rough prototype version 1, collect feedback, and log what changed in version 2.',
      5: 'Test with real users, identify feedback patterns, then write a practical improvement plan.'
    };
    return map[phase] || map[1];
  }

  function sendMessage(text) {
    var value = (text || '').trim();
    if (!value) return;
    state.history.push({ role: 'user', text: value });
    renderMessages();
    var input = qs('#ai-dt-buddy-input');
    if (input) input.value = '';

    setTimeout(function () {
      state.history.push({ role: 'buddy', text: buildBuddyReply(value) });
      saveHistory();
      renderMessages();
    }, 220);
  }

  function bindEvents() {
    qs('#ai-dt-buddy-fab').addEventListener('click', openBuddy);
    qs('#ai-dt-buddy-close').addEventListener('click', closeBuddy);
    qs('#ai-dt-buddy-overlay').addEventListener('click', function (e) {
      if (e.target && e.target.id === 'ai-dt-buddy-overlay') closeBuddy();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.open) closeBuddy();
    });
    qs('#ai-dt-buddy-send').addEventListener('click', function () {
      sendMessage(qs('#ai-dt-buddy-input').value);
    });
    qs('#ai-dt-buddy-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(e.currentTarget.value);
      }
    });
    qs('#ai-dt-buddy-quickchips').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-chip]');
      if (btn) sendMessage(btn.getAttribute('data-chip'));
    });
  }

  function init() {
    state.phase = detectPhase();
    loadHistory();
    buildUI();
  }

  window.AIDTBuddy = { init: init, open: openBuddy, close: closeBuddy };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());

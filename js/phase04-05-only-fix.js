/* =========================================================
   Smart DT Project — Phase 04 + Phase 05 micro-fix only
   Safe DOM patch. It only activates on:
   - phase04-prototype.html: Confirm Before Submitting section
   - phase05-test.html: Iterate for improvement section
   ========================================================= */
(function () {
  'use strict';

  function textOf(el) {
    return (el && el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function closestCardFromHeading(heading) {
    return heading.closest('.card, .info-card, .template-card, .template-panel, .section-card, .phase-card, .quick-card, .content-card, section, article, div');
  }

  function fixPhase04Checklist() {
    if (!/phase04-prototype\.html/i.test(location.pathname)) return;

    var headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,p,strong,div'));
    var heading = headings.find(function (el) {
      return /Confirm Before Submitting/i.test(textOf(el));
    });
    if (!heading) return;

    var card = closestCardFromHeading(heading);
    if (!card || card.dataset.smartdtConfirmFixed === '1') return;
    card.dataset.smartdtConfirmFixed = '1';
    card.classList.add('smartdt-confirm-checklist-fixed');

    // Convert only the checklist bullets inside this card into checkbox rows.
    var listItems = Array.from(card.querySelectorAll('li'));
    if (!listItems.length) {
      // Some versions use bullet divs/p rows. Capture short checklist-like lines after the heading.
      listItems = Array.from(card.querySelectorAll('p,div')).filter(function (el) {
        var t = textOf(el);
        return t && !/Confirm Before Submitting/i.test(t) &&
          /(completed|saved|includes|uploaded|linked|connected|ready|agrees|testing|feedback|prototype)/i.test(t) &&
          t.length < 140;
      }).slice(0, 6);
    }

    listItems.forEach(function (item, index) {
      if (item.querySelector('input[type="checkbox"]')) return;
      var labelText = textOf(item).replace(/^[-•]\s*/, '');
      if (!labelText) return;

      var row = document.createElement('label');
      row.className = 'smartdt-check-row';
      row.innerHTML = '<input type="checkbox" name="phase04_ready_check_' + (index + 1) + '"><span></span>';
      row.querySelector('span').textContent = labelText;
      item.replaceWith(row);
    });

    // Group orange numbered instruction strips below the checklist, if present.
    var next = card.nextElementSibling;
    var orangeItems = [];
    while (next && orangeItems.length < 3) {
      var t = textOf(next);
      if (/Confirm all|Explain why|prototype is ready|revision before testing/i.test(t)) {
        orangeItems.push(next);
        next = next.nextElementSibling;
      } else {
        break;
      }
    }
    if (orangeItems.length) {
      var wrapper = document.createElement('div');
      wrapper.className = 'smartdt-phase04-orange-steps-fixed';
      orangeItems[0].parentNode.insertBefore(wrapper, orangeItems[0]);
      orangeItems.forEach(function (el) { wrapper.appendChild(el); });
    }
  }

  function fixPhase05IterateCards() {
    if (!/phase05-test\.html/i.test(location.pathname)) return;

    var headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,p,strong,div'));
    var heading = headings.find(function (el) {
      return /Iterate for improvement/i.test(textOf(el));
    });
    if (!heading) return;

    var section = closestCardFromHeading(heading);
    if (!section || section.dataset.smartdtIterateFixed === '1') return;
    section.dataset.smartdtIterateFixed = '1';

    // Find the immediate child group that contains the four steps.
    var candidates = Array.from(section.querySelectorAll('div')).filter(function (el) {
      var t = textOf(el);
      return /1\.\s*Observe/i.test(t) && /2\.\s*Pattern/i.test(t) && /3\.\s*Improve/i.test(t) && /4\.\s*Reflect/i.test(t);
    });
    var grid = candidates.length ? candidates[candidates.length - 1] : null;

    if (!grid) {
      // Fallback: use the widest child after heading with at least four children.
      grid = Array.from(section.children).find(function (el) {
        return el !== heading && el.children && el.children.length >= 4;
      });
    }

    if (grid) {
      grid.classList.add('smartdt-iterate-fixed');
      Array.from(grid.children).slice(0, 4).forEach(function (child) {
        child.classList.add('smartdt-iterate-card-fixed');
      });
    }
  }

  function runFixes() {
    fixPhase04Checklist();
    fixPhase05IterateCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runFixes);
  } else {
    runFixes();
  }
})();

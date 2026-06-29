(function(){
  'use strict';

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const store = {
    get: k => localStorage.getItem(k) || '',
    set: (k,v) => localStorage.setItem(k, String(v)),
    del: k => localStorage.removeItem(k),
    json: (k,def={}) => { try { return JSON.parse(localStorage.getItem(k) || '') || def; } catch { return def; } },
    setJson: (k,v) => localStorage.setItem(k, JSON.stringify(v))
  };

  const PHASE_ROUTES = {
    '01': 'phase01-empathy.html',
    '02': 'phase02-define.html',
    '03': 'phase03-ideation.html',
    '04': 'phase04-prototype.html',
    '05': 'phase05-test.html',
    portfolio: 'portfolio-completion.html'
  };

  const NEXT_PHASE = {
    '01': { label:'Phase 02 Define', url:'phase02-define.html' },
    '02': { label:'Phase 03 Ideation', url:'phase03-ideation.html' },
    '03': { label:'Phase 04 Prototype', url:'phase04-prototype.html' },
    '04': { label:'Phase 05 Test', url:'phase05-test.html' },
    '05': { label:'Portfolio Completion', url:'portfolio-completion.html' }
  };


  // ── Preview / Testing Mode ──────────────────────────────────────
  // Set to true to bypass gate locks for testing. Set back to false for production.
  const PREVIEW_MODE = false; // CRITICAL-FIX-01: production mode

  const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/a/macros/polipd.edu.my/s/AKfycbxkk8DZEMFCIq4tBrlNulKk-xSblFqEkz2UOkGBqr-aX9-uu8XAYt5oiYMCtJOcmIld/exec';
  window.SMART_DT_CONFIG = window.SMART_DT_CONFIG || {};
  window.SMART_DT_CONFIG.appsScriptWebAppUrl = APPS_SCRIPT_WEB_APP_URL

  function studentPayload(){
    return {
      studentName: store.get('df_student_name'),
      email: store.get('df_email'),
      regNo: store.get('df_reg_no') || store.get('df_registration_no'),
      className: store.get('df_class'),
      team: store.get('df_team'),
      supervisor: store.get('df_supervisor'),
      projectName: store.get('df_project_name')
    };
  }

  function syncToGoogleSheets(action, payload={}, useBeacon=false){
    if(!APPS_SCRIPT_WEB_APP_URL) return Promise.resolve(false);
    const body = JSON.stringify({
      action,
      source: 'Smart DT Project',
      appVersion: 'v3.0.0',
      page: document.body.dataset.page || '',
      phase: phase() || '',
      timestamp: new Date().toISOString(),
      student: studentPayload(),
      payload
    });
    store.set('df_last_sync_action', action);
    store.set('df_last_sync_status', 'pending');
    try {
      if(useBeacon && navigator.sendBeacon) {
        const ok = navigator.sendBeacon(APPS_SCRIPT_WEB_APP_URL, new Blob([body], { type: 'text/plain;charset=UTF-8' }));
        store.set('df_last_sync_status', ok ? 'sent' : 'beacon_failed');
        return Promise.resolve(ok);
      }
      return fetch(APPS_SCRIPT_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-store',
        keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body
      }).then(() => {
        store.set('df_last_sync_status', 'sent');
        store.set('df_last_sync_time', new Date().toISOString());
        return true;
      }).catch(err => {
        console.warn('Smart DT Google Sheets sync failed:', err);
        store.set('df_last_sync_status', 'failed');
        store.set('df_last_sync_error', String(err && err.message || err));
        return false;
      });
    } catch(err) {
      console.warn('Smart DT Google Sheets sync error:', err);
      store.set('df_last_sync_status', 'failed');
      store.set('df_last_sync_error', String(err && err.message || err));
      return Promise.resolve(false);
    }
  }

  const PHASE_TEMPLATES = {
    '01': ['t01','t02','t03','t04'],
    '02': ['t05','t06'],
    '03': ['t07','t08','t09','t10'],
    '04': ['t11'],
    '05': ['t12','t13']
  };

  const quizSets = {
    '01': [
      {q:'What is the MAIN goal of the Empathy phase?',a:0,o:['To understand users real feelings, needs and experiences','To build the final product immediately','To choose the cheapest solution','To prepare a presentation only'],e:'Empathy is about understanding real people — their feelings, struggles and actual needs — before any solution is considered. You cannot design well for someone you do not truly understand.'},
      {q:'Should you already know the solution before interviewing users?',a:1,o:['True — decide first','False — keep an open mind and discover','True — the app requires it','False — no interviews are needed'],e:'Entering an interview with a fixed solution causes you to ask leading questions and ignore evidence that contradicts your idea. Empathy requires an open, curious mind so real insights can surface.'},
      {q:'Which is the BEST interview question for Empathy?',a:2,o:['Do you agree my idea is good?','Do you want our product?','Tell me about your experience using the canteen during peak hours.','Is this problem serious?'],e:'Open-ended, experience-based questions invite users to share stories and feelings. Questions that lead or suggest solutions produce biased answers that do not reflect real needs.'},
      {q:'Is interviewing one person enough for the Empathy phase?',a:1,o:['True — one user is enough','False — interview at least 3 users to find patterns','True — if the user is your friend','False — no interviews are needed'],e:'One person\'s experience may be unique to them. Interviewing at least 3 users lets you spot repeated patterns — the pain points that keep appearing across different people — which are far more reliable to design for.'},
      {q:'Which tool maps what a user SAYS, THINKS, DOES and FEELS?',a:3,o:['Persona only','Problem Statement','SCAMPER','Empathy Map'],e:'The Empathy Map organises your interview evidence into four quadrants: Says (direct quotes), Thinks (inferred thoughts), Does (observed behaviours), and Feels (emotional states). It prevents you from mixing up fact and assumption.'}
    ],
    '02': [
      {q:'What is the MAIN output of the Define phase?',a:0,o:['A clear user-centred problem statement based on research','A finished prototype','A list of random ideas','A final presentation script'],e:'Define converts all the Empathy research into one focused problem statement. Without this step, your team may brainstorm solutions to the wrong problem — wasting effort on something users do not actually need.'},
      {q:'Should the problem statement include a solution?',a:1,o:['True — include the app idea immediately','False — define the problem only, never the solution','True — supervisors prefer solutions first','False — skip the problem statement'],e:'A problem statement that already contains a solution narrows thinking too early. The Define phase should frame the user need clearly so Ideation can explore many possible solutions freely.'},
      {q:'Which HMW question is correctly formatted?',a:2,o:['We should build a canteen app.','Can you make students eat faster?','How might we help students eat lunch faster on campus?','Why is the canteen crowded?'],e:'"How might we..." opens up creative possibilities without prescribing a solution. It is broad enough to generate many ideas but specific enough to stay connected to the user need identified in your problem statement.'},
      {q:'Can you skip Define if Empathy was thorough enough?',a:1,o:['True — Empathy is enough','False — Empathy and Define serve different purposes','True — go straight to Ideation','False — skip Ideation instead'],e:'Empathy collects raw evidence; Define makes sense of it. Jumping from interviews to brainstorming without framing the problem first usually results in scattered ideas that do not address the real user need.'},
      {q:'What should a good problem statement focus on?',a:1,o:['The technology your team likes','The user\'s need and the insight behind it','The cheapest available solution','The supervisor\'s preferred product'],e:'A user-centred problem statement always starts from a real person\'s need and the evidence that explains why that need exists. Technology preferences or budget should not drive the problem framing at this stage.'}
    ],
    '03': [
      {q:'What is the golden rule of brainstorming?',a:0,o:['No judging or evaluating ideas during the session','Choose the cheapest idea first','Only write ideas from the team leader','Start building the prototype immediately'],e:'Judging ideas during brainstorming shuts down creative thinking. When team members fear criticism, they hold back unusual ideas — and those unusual ideas are often where the most innovative solutions come from.'},
      {q:'Should you stop when you find your first good idea?',a:1,o:['True — one good idea is enough','False — push for 20+ ideas before evaluating','True — avoid wasting time','False — skip SCAMPER instead'],e:'The first idea is almost never the best one. Quantity builds quality — by pushing for 20 or more ideas, you exhaust the obvious options and reach more creative solutions that a quick stop would never uncover.'},
      {q:'What does the S in SCAMPER stand for?',a:2,o:['Score','Sketch','Substitute','Submit'],e:'SCAMPER is a creativity tool: Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse. Each prompt forces you to look at your existing ideas from a different angle to generate new variations.'},
      {q:'Does the Idea Selection Matrix use gut feelings to choose?',a:1,o:['True — choose based on preference','False — it uses criteria with numerical scores','True — the team leader decides','False — it uses interviews only'],e:'The Idea Selection Matrix scores each idea against criteria such as feasibility, user impact and originality using numbers. This makes the selection transparent and based on evidence, not personal preference.'},
      {q:'What is the correct order for the Ideation phase?',a:3,o:['Select → Brainstorm → SCAMPER → Justify','Prototype → Brainstorm → Submit → Test','SCAMPER → Test → Persona → Matrix','Brainstorm → SCAMPER → Select → Justify'],e:'You brainstorm freely first, then use SCAMPER to push ideas further, then evaluate using the selection matrix, and finally justify your chosen concept. This sequence separates creative divergence from critical convergence.'}
    ],
    '04': [
      {q:'What type of prototype should students build FIRST?',a:0,o:['Low-fidelity rough sketch or paper prototype','Fully polished final product','Expensive commercial version','Only a written report'],e:'Low-fidelity prototypes — paper sketches, cardboard mockups, simple wireframes — can be built quickly and tested immediately. Starting rough means you can learn and improve before investing time in polish.'},
      {q:'Must the prototype be polished before testing with users?',a:1,o:['True — it must look perfect','False — rough prototypes generate honest feedback','True — users cannot test rough ideas','False — do not test at all'],e:'A polished prototype can reduce feedback quality — users hesitate to criticise something that looks finished. Rough prototypes invite honest reactions because users feel their feedback can still change things.'},
      {q:'What is the MAIN purpose of building a prototype?',a:2,o:['To decorate the final report','To replace user testing','To test the idea and learn from real user feedback','To avoid improving the idea'],e:'The prototype is a learning tool, not the final product. Its purpose at this stage is to put something tangible in front of users so you can observe how they interact with it and discover what needs to change.'},
      {q:'If a prototype fails during testing, has the project failed?',a:1,o:['True — failure means stop the project','False — failure reveals problems to improve','True — delete the version log','False — ignore all feedback'],e:'In Design Thinking, a prototype that fails during testing is a success — it revealed a real problem before you built the final version. Every failure is information that tells you exactly what to improve next.'},
      {q:'What should the Version Log record for each iteration?',a:3,o:['Only the team members names','Only the final score','Only the supervisor comment','What was built, feedback received, and what to improve next'],e:'The Version Log documents your design decisions and learning process. Recording what was built, what feedback came back, and what changed shows supervisors that your design evolved based on real evidence.'}
    ],
    '05': [
      {q:'Who should you select as test participants?',a:1,o:['Your friends and family for convenience','Real target users who match the Persona from Phase 01','Only your classmates','Your supervisor and lecturers'],e:'Testing with actual target users gives you meaningful data because they experience the real problem your solution addresses. Friends and family often give positive feedback to avoid hurting your feelings, producing a false picture of usability.'},
      {q:'Should you explain how the prototype works before testing?',a:1,o:['True — explain every feature first','False — never explain first; watching struggle is useful data','True — users cannot test without full explanation','False — cancel the test instead'],e:'When a user struggles to find a feature without guidance, that struggle is critical usability data. Explaining everything first removes that data. If users cannot figure it out alone, that is a design problem you need to fix.'},
      {q:'What is most important to do during a user test?',a:2,o:['Persuade users to like the prototype','Change the design during the test','Observe and listen without interfering','Ask only yes/no questions'],e:'Your role during a test is to be a quiet observer. Helping, explaining or defending the design during the session contaminates the data. Real insights come from watching what users do and hearing what they say unprompted.'},
      {q:'If testers complete the task, is testing done?',a:1,o:['True — completion means no more analysis','False — also identify friction points and improvement opportunities','True — submit immediately','False — restart from Empathy'],e:'Task completion is only one measure. A user who completes a task but hesitates, takes a wrong path, or expresses frustration is giving you valuable improvement data. Always analyse the journey, not just the destination.'},
      {q:'What should happen AFTER collecting all test feedback?',a:1,o:['Submit directly to supervisor without analysis','Analyse feedback patterns, create an improvement plan, then reflect','Rebuild the entire prototype from scratch','Present results to class immediately'],e:'Raw feedback only becomes useful when analysed for patterns. Identifying which issues appeared most often, planning specific improvements, and reflecting on what the team learned completes the Design Thinking cycle properly.'}
    ]
  };

  function phase(){
    if (document.body.dataset.phase) return document.body.dataset.phase.padStart(2,'0');
    const t = document.title;
    if (/Phase 05|Test/i.test(t)) return '05';
    if (/Phase 04|Prototype/i.test(t)) return '04';
    if (/Phase 03|Ideation/i.test(t)) return '03';
    if (/Phase 02|Define/i.test(t)) return '02';
    if (/Phase 01|Empathy/i.test(t)) return '01';
    return '';
  }

  function initials(name){
    return (name || 'Student').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase() || 'ST';
  }

  function toast(msg){
    let el = $('#smartToast');
    if(!el){ el=document.createElement('div'); el.id='smartToast'; el.className='smart-toast'; document.body.appendChild(el); }
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'),2600);
  }

  function hydrateHeader(){
    const name = store.get('df_student_name') || (store.get('df_email') ? store.get('df_email').split('@')[0] : 'Student');
    $$('.student-name').forEach(e=>e.textContent=name);
    $$('.avatar,.profile-initials').forEach(e=>e.textContent=initials(name));
  }

  function isPhaseSubmitted(n){ return store.get('df_submitted_phase'+n)==='true'; }
  function quizScore(n){ return store.get('df_quiz_phase'+n); }
  function quizPassed(n){ const s = parseInt(quizScore(n)||'-1',10); return s >= 3 || store.get('df_unlocked_phase'+n)==='true'; }
  function completedCount(){ let c=0; ['01','02','03','04','05'].forEach(n=>{ if(isPhaseSubmitted(n)) c++; }); return c; }
  function currentPhase(){
    for(const n of ['01','02','03','04','05']){
      if(!isPhaseSubmitted(n)) return n;
    }
    return 'portfolio';
  }

  // GAP-6 FIX: show beginner-friendly device context note after login failure
  function _showLoginDeviceHelp(){
    if(document.getElementById('loginDeviceHelp')) return;
    const form = document.getElementById('loginForm');
    if(!form) return;
    const help = document.createElement('div');
    help.id = 'loginDeviceHelp';
    help.style.cssText = 'margin-top:14px;padding:12px 14px;background:rgba(8,27,68,.05);border:1.5px solid rgba(8,27,68,.12);border-radius:12px;font-size:12.5px;color:var(--navy,#081B44);line-height:1.6';
    help.innerHTML = '<strong>💡 Having trouble?</strong> Smart DT saves your profile on the browser you registered with. '
      + 'If you registered on a different phone or browser, your profile is not on this device — '
      + 'please <a href="registration.html" style="color:var(--teal,#14B8A6);font-weight:700">create a new profile</a> here instead.';
    form.parentNode.appendChild(help);
  }

  function setupAuth(){
    const reg = $('#registrationForm');
    if(reg){
      reg.addEventListener('submit',e=>{
        e.preventDefault();
        const data=Object.fromEntries(new FormData(reg));
        Object.entries(data).forEach(([k,v])=>store.set(k,(v||'').trim()));
        store.set('df_registered','true');
        syncToGoogleSheets('student_registration', { form: data }, true);
        location.href='dashboard.html';
      });
    }
    const login = $('#loginForm');
    if(login){
      login.addEventListener('submit',e=>{
        e.preventDefault();
        const data=Object.fromEntries(new FormData(login));
        // CRITICAL-FIX-02: validate credentials against stored profile
        const storedEmail = store.get('df_email');
        const storedReg   = store.get('df_reg_no');
        const enteredEmail = (data.df_email||'').trim().toLowerCase();
        const enteredReg   = (data.df_reg_no||'').trim().toUpperCase();
        if(store.get('df_registered')==='true' && storedEmail && storedReg){
          if(storedEmail.toLowerCase() !== enteredEmail){
            const eEl=document.getElementById('loginEmailErr');
            const msg='Email does not match the profile saved on this device.';
            if(eEl){eEl.textContent=msg;eEl.style.display='block';} else toast(msg);
            _showLoginDeviceHelp();
            return;
          }
          if(storedReg.toUpperCase() !== enteredReg){
            const rEl=document.getElementById('loginRegErr');
            const msg='Registration No. does not match. Check for typos (e.g. 01DTK23F1001).';
            if(rEl){rEl.textContent=msg;rEl.style.display='block';} else toast(msg);
            _showLoginDeviceHelp();
            return;
          }
        }
        Object.entries(data).forEach(([k,v])=>store.set(k,(v||'').trim()));
        store.set('df_registered','true');
        if(!store.get('df_student_name')) store.set('df_student_name',(data.df_email||'Student').split('@')[0]);
        syncToGoogleSheets('student_login', { form: data }, true);
        location.href='dashboard.html';
      });
    }
  }

  function setupAccordions(){
    $$('.accordion-item').forEach((item,idx)=>{
      const btn=$('.acc-head',item);
      if(idx===0) item.classList.add('open');
      btn?.addEventListener('click',()=>item.classList.toggle('open'));
    });
  }

  function setupDashboard(){
    if(document.body.dataset.page !== 'dashboard') return;
    hydrateHeader();
    // GAP-1 FIX: first-visit onboarding banner
    (function showFirstVisitBanner(){
      if(store.get('df_first_visit_dismissed')==='true') return;
      const main = $('main.page');
      if(!main) return;
      const banner = document.createElement('div');
      banner.id = 'firstVisitBanner';
      banner.style.cssText = 'margin:0 0 12px;padding:14px 16px;background:linear-gradient(135deg,rgba(20,184,166,.13),rgba(20,184,166,.05));border:1.5px solid rgba(20,184,166,.4);border-radius:16px;position:relative';
      banner.innerHTML = '<button id="dismissFirstVisit" aria-label="Dismiss" style="position:absolute;top:10px;right:12px;background:none;border:none;font-size:18px;cursor:pointer;color:rgba(8,27,68,.4);line-height:1">×</button>'
        + '<p style="font-size:13px;font-weight:700;color:var(--teal,#14B8A6);margin-bottom:4px">👋 Welcome to Smart DT Project!</p>'
        + '<p style="font-size:12.5px;color:var(--navy,#081B44);line-height:1.55;margin:0 0 10px">You\'re all set. Your journey starts with <strong>Phase 01 Empathy</strong>. Tap <strong>Learn</strong> in the bottom menu, then complete the Quiz to unlock the templates.</p>'
        + '<a class="btn primary full" href="phase01-empathy.html" style="font-size:13px">Start Phase 01 Empathy →</a>';
      // Insert after intro-card
      const introCard = main.querySelector('.intro-card');
      if(introCard) introCard.after(banner);
      else main.insertBefore(banner, main.firstChild);
      document.getElementById('dismissFirstVisit')?.addEventListener('click',()=>{
        store.set('df_first_visit_dismissed','true');
        banner.remove();
      });
    })();
    $('.greeting-name') && ($('.greeting-name').textContent = store.get('df_student_name') || 'Student');
    $('.project-title') && ($('.project-title').textContent = store.get('df_project_name') || 'My FYP Project');
    const meta = `${store.get('df_team') || 'My Team'} · Smart DT Project`;
    $('.project-meta') && ($('.project-meta').textContent = meta);
    const pct = Math.round(completedCount()/5*100);
    $$('.progress-fill').forEach(e=>e.style.width=pct+'%');
    $('.pct') && ($('.pct').textContent=pct+'%');
    // GAP-7 FIX: show template progress count on the dashboard project card
    (function renderDashTemplateCount(){
      const TMPL_TOTALS = {'01':4,'02':2,'03':4,'04':1,'05':2};
      const phList = ['01','02','03','04','05'];
      let totalSaved=0, totalPossible=0;
      phList.forEach(n=>{
        const possible = TMPL_TOTALS[n]||0;
        totalPossible += possible;
        const saved = store.json('df_phase'+n+'_templates',{});
        totalSaved += Object.keys(saved).length;
      });
      const hint = $('.hint');
      if(hint && hint.parentNode){
        let tCount = hint.parentNode.querySelector('.dash-tmpl-count');
        if(!tCount){
          tCount = document.createElement('p');
          tCount.className = 'dash-tmpl-count';
          tCount.style.cssText = 'font-size:11px;color:rgba(8,27,68,.5);margin-top:2px';
          hint.parentNode.appendChild(tCount);
        }
        tCount.textContent = totalSaved + ' of ' + totalPossible + ' templates saved';
      }
    })();
    const cp = currentPhase();
    // HIGH-FIX-07c(i): stepper locked visual state
    $$('.step').forEach((s,i)=>{ const n=String(i+1).padStart(2,'0'); s.classList.toggle('done',n<cp||(cp==='portfolio')); s.classList.toggle('active',n===cp); s.classList.toggle('locked',n>cp&&cp!=='portfolio'&&n!==cp); });
    $('[data-continue]')?.addEventListener('click',()=>{ location.href = PHASE_ROUTES[cp] || 'phase01-empathy.html'; });
    // HIGH-FIX-14: completion banner
    if(completedCount()>=5){ const banner=document.getElementById('dashCompletionBanner'); if(banner) banner.style.display=''; }
    // HIGH-FIX-07c(iii): dynamic Tasks
    const phN=['01','02','03','04','05'],phNm={'01':'Empathy','02':'Define','03':'Ideation','04':'Prototype','05':'Test'};
    const taskItems=[];
    phN.forEach(n=>{ if(!quizPassed(n)) taskItems.push('Phase '+n+' '+phNm[n]+': pass the quiz'); if(!isPhaseSubmitted(n)) taskItems.push('Phase '+n+' '+phNm[n]+': submit templates'); });
    const tasksSub=document.getElementById('acc-tasks-sub'),tasksBody=document.getElementById('acc-tasks-body');
    if(tasksSub) tasksSub.textContent=taskItems.length+' pending task'+(taskItems.length!==1?'s':'');
    if(tasksBody) tasksBody.innerHTML=taskItems.length ? '<ul class="list">'+taskItems.slice(0,6).map(t=>'<li>'+escapeHtml(t)+'</li>').join('')+'</ul>' : '<p style="color:var(--teal,#14B8A6);font-weight:600">All tasks complete!</p>';
    // HIGH-FIX-07c(iv): dynamic Recent Activity
    const actSub=document.getElementById('acc-activity-sub'),actBody=document.getElementById('acc-activity-body');
    const log=store.json('df_activity_log',[]);
    if(actSub) actSub.textContent=log.length?log.length+' recent action'+(log.length!==1?'s':''):'No activity yet';
    if(actBody){
      if(log.length){ const fmt=ts=>{try{const d=new Date(ts);return d.toLocaleDateString('en-MY',{day:'numeric',month:'short'})+' '+d.toLocaleTimeString('en-MY',{hour:'2-digit',minute:'2-digit'});}catch{return '';}};
        actBody.innerHTML='<ul class="list">'+log.slice(0,5).map(e=>'<li>'+escapeHtml(e.msg)+' <span style="font-size:11px;opacity:.55">'+fmt(e.ts)+'</span></li>').join('')+'</ul>';}
      else actBody.textContent='No recent activity yet. Start Phase 01 to begin tracking.';
    }
    // HIGH-FIX-07c(v): dynamic Evidence Files
    const evSub=document.getElementById('acc-evidence-sub'),evBody=document.getElementById('acc-evidence-body');
    const submitted=phN.filter(n=>isPhaseSubmitted(n));
    if(evSub) evSub.textContent=submitted.length?submitted.length+' phase'+(submitted.length!==1?'s':'')+' submitted':'No evidence yet';
    if(evBody) evBody.innerHTML=submitted.length?'<ul class="list">'+submitted.map(n=>'<li>Phase '+n+' templates submitted</li>').join('')+'</ul>':'No evidence submitted yet. Complete and submit a phase to track it here.';
    // HIGH-FIX-07c(vi): Team Members dynamic
    const tmBody=document.getElementById('acc-team-body');
    if(tmBody) tmBody.innerHTML='<p><strong>Team:</strong> '+escapeHtml(store.get('df_team')||'Not set')+'</p><p style="margin-top:6px"><strong>Workflow:</strong> Save Draft → Submit Final</p>';
  }

  function setupTabs(){
    const ph = phase();
    updateTemplateLock();
    // GAP-4 FIX: inject "Phase at a glance" strip below intro-card on phase pages
    if(ph && !document.getElementById('phaseGlanceStrip')){
      const GLANCE = {
        '01':{templates:'4 templates',effort:'Est. 2–3 sessions',output:'POEMS, Interview, Transcript & Empathy Map'},
        '02':{templates:'2 templates',effort:'Est. 1–2 sessions',output:'Persona & User Needs Statement'},
        '03':{templates:'4 templates',effort:'Est. 2 sessions',output:'Mind Map, Sketch, SCAMPER & Matrix'},
        '04':{templates:'1 template',effort:'Est. 1 session',output:'Prototype Direction Plan'},
        '05':{templates:'2 templates',effort:'Est. 1–2 sessions',output:'Feedback Matrix & Pitch Framework'}
      };
      const g = GLANCE[ph];
      if(g){
        const strip = document.createElement('div');
        strip.id = 'phaseGlanceStrip';
        strip.style.cssText = 'margin:0 0 0;padding:11px 16px;background:rgba(8,27,68,.035);border-radius:14px;display:flex;gap:0;flex-direction:column';
        strip.innerHTML = '<p style="font-size:11px;font-weight:700;color:rgba(8,27,68,.45);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Phase at a Glance</p>'
          + '<div style="display:flex;gap:10px;flex-wrap:wrap">'
          + '<span style="font-size:12px;color:var(--navy,#081B44);background:#fff;border:1px solid rgba(8,27,68,.1);border-radius:20px;padding:3px 10px">📋 '+g.templates+'</span>'
          + '<span style="font-size:12px;color:var(--navy,#081B44);background:#fff;border:1px solid rgba(8,27,68,.1);border-radius:20px;padding:3px 10px">🕐 '+g.effort+'</span>'
          + '<span style="font-size:12px;color:var(--navy,#081B44);background:#fff;border:1px solid rgba(8,27,68,.1);border-radius:20px;padding:3px 10px">📤 '+g.output+'</span>'
          + '</div>';
        const introCard = document.querySelector('.intro-card');
        const tabbar = document.querySelector('.tabbar');
        if(introCard && tabbar) introCard.after(strip);
        else if(tabbar) tabbar.parentNode.insertBefore(strip, tabbar);
      }
    }
    // GAP-7 FIX: inject template saved count strip into templates panel header
    if(ph){
      const tmplPanel = document.getElementById('templatesPanel');
      if(tmplPanel && !document.getElementById('tmplSavedCountStrip')){
        const TMPL_TOTALS = {'01':4,'02':2,'03':4,'04':1,'05':2};
        const total = TMPL_TOTALS[ph] || $$('.template-panel').length;
        const strip = document.createElement('div');
        strip.id = 'tmplSavedCountStrip';
        strip.style.cssText = 'font-size:12px;color:rgba(8,27,68,.55);text-align:center;margin:0 0 6px;font-weight:600';
        function refreshStrip(){
          const saved = Object.keys(store.json('df_phase'+ph+'_templates',{})).length;
          strip.textContent = 'Templates saved: ' + Math.min(saved,total) + ' / ' + total;
          strip.style.color = saved >= total ? 'var(--teal,#14B8A6)' : 'rgba(8,27,68,.55)';
        }
        refreshStrip();
        // Re-render count when a save happens (listen for storage changes on same page)
        document.addEventListener('click', e=>{ if(e.target && e.target.dataset && e.target.dataset.save!==undefined) setTimeout(refreshStrip,200); });
        const subtabArea = tmplPanel.querySelector('.subtabs') || tmplPanel.querySelector('.template-steps');
        if(subtabArea) subtabArea.parentNode.insertBefore(strip, subtabArea);
        else tmplPanel.insertBefore(strip, tmplPanel.firstChild);
      }
    }

    $$('.tab').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const id=btn.dataset.tab;
        if(id==='templatesPanel' && ph && !quizPassed(ph)){
          // GAP-3 FIX: switch to quiz tab and show inline guidance instead of toast-only
          switchPanel('quizPanel');
          const quizBox=$('#quizBox');
          if(quizBox){
            // Show a gentle hint above the quiz if not already shown
            if(!document.getElementById('quizGateHint')){
              const hint=document.createElement('div');
              hint.id='quizGateHint';
              hint.style.cssText='background:rgba(255,106,61,.08);border:1.5px solid rgba(255,106,61,.35);border-radius:12px;padding:12px 14px;margin-bottom:12px;font-size:13px;color:var(--navy,#081B44);line-height:1.55';
              hint.innerHTML='<strong style="color:var(--orange,#FF6A3D)">🔒 Templates are locked.</strong> Score 3/5 or more on the Quiz below to unlock the phase templates.';
              quizBox.parentNode.insertBefore(hint, quizBox);
            }
            setTimeout(()=>quizBox.scrollIntoView({behavior:'smooth',block:'start'}),80);
          }
          return;
        }
        switchPanel(id);
      });
    });

    $$('.subtab').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const id=btn.dataset.subtab;
        $$('.subtab').forEach(b=>b.classList.toggle('active',b===btn));
        $$('.template-panel').forEach(p=>p.classList.toggle('active',p.id===id));
      });
    });

    $$('.switch button').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const box=btn.closest('.template-card');
        if(!box) return;
        const mode=btn.dataset.mode;
        $$('.switch button',box).forEach(b=>b.classList.toggle('active',b===btn));
        const samplePanels = $$('[data-panel="sample"], .sample-panel', box);
        const fillPanels = $$('[data-panel="fill"], .fill-panel, .fill', box);
        if(samplePanels.length || fillPanels.length){
          samplePanels.forEach(p=>{ p.hidden = mode !== 'sample'; p.classList.toggle('hidden', mode !== 'sample'); });
          fillPanels.forEach(p=>{ p.hidden = mode !== 'fill'; p.classList.toggle('active', mode === 'fill'); });
        } else {
          $('.sample',box)?.classList.toggle('hidden',mode!=='sample');
          const fill=$('.fill',box); if(fill) fill.classList.toggle('active',mode==='fill');
        }
      });
    });
    $$('[data-next-subtab]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        // CRITICAL-FIX-03: quiz gate check before subtab navigation
        const ph=phase();
        if(ph && !quizPassed(ph)){
          toast('Pass the quiz with 3/5 or more to unlock templates.');
          switchPanel('quizPanel');
          return;
        }
        const next = btn.dataset.nextSubtab;
        const target = next ? document.querySelector(`[data-subtab="${next}"]`) : null;
        if(target){ target.click(); setTimeout(()=>document.getElementById(next)?.scrollIntoView({behavior:'smooth',block:'start'}), 50); }
      });
    });
  }

  function switchPanel(id){
    $$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
    $$('.panel').forEach(p=>p.classList.toggle('active',p.id===id));
    if(id==='templatesPanel') setTimeout(updateTemplateStatuses,50);
  }

  function updateTemplateLock(){
    const ph=phase(); if(!ph) return;
    const t=$('[data-tab="templatesPanel"]'); if(!t) return;
    const passed=quizPassed(ph);
    t.classList.toggle('locked',!passed);
    t.setAttribute('aria-disabled', String(!passed));
    t.title = passed ? 'Templates unlocked' : 'Pass quiz with 3/5 to unlock templates';
    // CRITICAL-FIX-04: clean lock icon add/remove
    const existingLock = t.querySelector('.lock-note');
    if(!passed && !existingLock){
      const lockIcon = document.createElement('span');
      lockIcon.className='lock-note';
      lockIcon.setAttribute('aria-hidden','true');
      lockIcon.textContent=' 🔒';
      t.appendChild(lockIcon);
    } else if(passed && existingLock){
      existingLock.remove();
    }
  }

  function setupQuiz(){
    const box=$('#quizBox'); if(!box) return;
    const ph=phase();
    const quiz=quizSets[ph] || quizSets['01'];
    let current=0;
    const selected = Array(quiz.length).fill(null);
    const letters=['A','B','C','D'];
    // HIGH-FIX-11a: review mode shows correct answers
    let reviewMode=false;
    if(!document.getElementById('quizReviewStyle')){
      const s=document.createElement('style');s.id='quizReviewStyle';
      s.textContent='.opt-correct{border-color:var(--teal,#14B8A6)!important;background:rgba(20,184,166,.10)!important}.opt-wrong{border-color:var(--orange,#FF6A3D)!important;background:rgba(255,106,61,.08)!important}.quiz-explain{font-size:12.5px;padding:10px 12px;background:rgba(20,184,166,.07);border-left:3px solid var(--teal,#14B8A6);border-radius:8px;margin:10px 0;line-height:1.6;color:var(--navy,#081B44)}';
      document.head.appendChild(s);
    }

    function render(){
      const q=quiz[current];
      const pct=Math.round(((current+1)/quiz.length)*100);
      box.innerHTML = `
        <div class="quiz-card smart-quiz" role="region" aria-label="Phase ${ph} quiz question ${current+1}">
          <div class="quiz-progress"><span>Question ${current+1} of ${quiz.length}</span><b>${pct}%</b></div>
          <div class="quiz-bar"><span style="width:${pct}%"></span></div>
          <span class="q-count">Phase ${ph} · Quick Check</span>
          <h2 class="q-title">${escapeHtml(q.q)}</h2>
          <div class="options-list">
            ${q.o.map((o,i)=>{ let c='option'+(selected[current]===i?' selected':''); if(reviewMode){ if(i===q.a) c+=' opt-correct'; else if(selected[current]===i) c+=' opt-wrong'; } return '<button type="button" class="'+c+'" data-opt="'+i+'"'+(reviewMode?' disabled':'')+'>'
              +'<span class="option-letter">'+letters[i]+'</span><span class="option-text">'+escapeHtml(o)+'</span></button>'; }).join('')}
          </div>
          ${reviewMode?'<div class="quiz-explain"><strong>✓ Correct answer: '+letters[q.a]+'. '+escapeHtml(q.o[q.a])+'</strong>'+(q.e?'<br><span style="font-weight:400;margin-top:6px;display:block">'+escapeHtml(q.e)+'</span>':'')+'</div>':''}
          <div class="quiz-nav">
            <button type="button" class="btn ghost" id="qPrev" ${current===0?'disabled':''}>Back</button>
            <span class="quiz-status">${reviewMode?'Review mode - answers shown':'Select A, B, C or D'}</span>
            <button type="button" class="btn primary" id="qNext">${reviewMode&&current===quiz.length-1?'Back to Result':(current===quiz.length-1?'Submit Quiz':'Next')}</button>
          </div>
        </div>`;
      // HIGH-FIX-11c: option clicks disabled in review mode
      if(!reviewMode) $$('.option',box).forEach(btn=>btn.addEventListener('click',()=>{ selected[current]=Number(btn.dataset.opt); render(); }));
      $('#qPrev')?.addEventListener('click',()=>{ if(current>0){ current--; render(); }});
      $('#qNext')?.addEventListener('click',()=>{
        if(reviewMode && current===quiz.length-1){ reviewMode=false; showQuizResult(); return; }
        if(!reviewMode && selected[current]===null){ toast('Please choose an answer first.'); return; }
        if(current < quiz.length-1){ current++; render(); return; }
        if(!reviewMode) showQuizResult();
      });
    }

    function showQuizResult(){
      const score = selected.reduce((s,v,i)=>s+(v===quiz[i].a?1:0),0);
      store.set('df_quiz_phase'+ph, String(score));
      if(score>=3) store.set('df_unlocked_phase'+ph,'true');
      syncToGoogleSheets('quiz_score', { phase: ph, score, total: quiz.length, passed: score >= 3, answers: selected });
      logActivity('Phase '+ph+' quiz - scored '+score+'/5'+(score>=3?' (passed)':' (retry)'));
      updateTemplateLock();
      const passed = score>=3;
      box.innerHTML = `
        <div class="quiz-result ${passed?'pass':'retry'}">
          <div class="result-badge">${passed?'✓':'!'}</div>
          <h2>${passed?'Templates Unlocked':'Try Again'}</h2>
          <p>You scored <strong>${score}/5</strong>. ${passed?'You can now continue to the phase templates.':'Score 3/5 or more to unlock templates.'}</p>
          <div class="result-actions">
            <button type="button" class="btn ghost" id="reviewQuiz">Review Quiz</button>
            ${passed?'<button type="button" class="btn primary" id="openTemplates">Open Templates</button>':'<button type="button" class="btn primary" id="retryQuiz">Retry Quiz</button>'}
          </div>
        </div>`;
      // HIGH-FIX-11d: reviewQuiz shows correct answers
      $('#reviewQuiz')?.addEventListener('click',()=>{ reviewMode=true; current=0; render(); });
      $('#retryQuiz')?.addEventListener('click',()=>{current=0; selected.fill(null); render();});
      $('#openTemplates')?.addEventListener('click',()=>switchPanel('templatesPanel'));
      toast(passed ? 'Great! Templates unlocked.' : 'Score saved. Try again when ready.');
    }
    render();
  }

  function formValues(root){
    const data={};
    $$('input, textarea, select', root).forEach(el=>{
      if(!el.name) return;
      if(el.type === 'file') { data[el.name] = el.files && el.files.length ? Array.from(el.files).map(f=>f.name).join(', ') : ''; }
      else if(el.type === 'checkbox') data[el.name] = el.checked ? 'true' : 'false';
      else data[el.name] = el.value;
    });
    return data;
  }

  function applyValues(root,data){
    $$('input, textarea, select', root).forEach(el=>{
      if(!el.name || data[el.name] === undefined || el.type === 'file') return;
      if(el.type === 'checkbox') el.checked = data[el.name] === 'true';
      else el.value = data[el.name];
    });
  }

  function panelIdFor(el){
    const panel = el.closest('.template-panel');
    if(panel?.id) return panel.id;
    const card = el.closest('.template-card');
    const title = card?.querySelector('h2')?.textContent || 'general';
    return title.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'') || 'general';
  }


  // HIGH-FIX-07a: activity log helper
  function logActivity(msg){
    const log = store.json('df_activity_log',[]);
    log.unshift({ msg, ts: new Date().toISOString() });
    if(log.length > 12) log.pop();
    store.setJson('df_activity_log', log);
  }

  function saveTemplateFrom(btn){
    const ph=phase(); if(!ph) return;
    const panel = btn.closest('.template-panel') || btn.closest('.template-card') || document;
    const tid = panelIdFor(btn);
    const all = store.json('df_phase'+ph+'_templates',{});
    all[tid] = { savedAt: new Date().toISOString(), values: formValues(panel) };
    store.setJson('df_phase'+ph+'_templates', all);
    store.set('df_template_phase'+ph+'_'+tid, 'true');
    syncToGoogleSheets('template_save', { phase: ph, templateId: tid, values: all[tid].values, savedAt: all[tid].savedAt });
    updateTemplateStatuses();
    logActivity(`Saved template ${tid.toUpperCase()} - Phase ${ph}`);
    toast(`Saved ${tid.toUpperCase()} on this device.`);
    // GAP-5 FIX: show persistent "Last saved" timestamp near the save button
    try {
      const panel = btn.closest('.template-panel') || btn.closest('.template-card');
      if(panel){
        const timeStr = new Date().toLocaleTimeString('en-MY',{hour:'2-digit',minute:'2-digit'});
        let savedNote = panel.querySelector('.save-timestamp');
        if(!savedNote){
          savedNote = document.createElement('p');
          savedNote.className = 'save-timestamp';
          savedNote.style.cssText = 'font-size:11.5px;color:var(--teal,#14B8A6);margin-top:6px;text-align:center;font-weight:600';
          btn.parentNode && btn.parentNode.appendChild(savedNote);
        }
        savedNote.textContent = '✓ Last saved at ' + timeStr;
      }
    } catch(e){}
  }

  function restoreTemplates(){
    const ph=phase(); if(!ph) return;
    const all = store.json('df_phase'+ph+'_templates',{});
    Object.entries(all).forEach(([tid,entry])=>{
      const panel = document.getElementById(tid);
      if(panel && entry.values) applyValues(panel,entry.values);
      // GAP-5 FIX: restore persistent save timestamp
      if(panel && entry.savedAt){
        try{
          const timeStr = new Date(entry.savedAt).toLocaleTimeString('en-MY',{hour:'2-digit',minute:'2-digit'});
          const dateStr = new Date(entry.savedAt).toLocaleDateString('en-MY',{day:'numeric',month:'short'});
          const actions = panel.querySelector('.template-actions');
          if(actions && !actions.querySelector('.save-timestamp')){
            const savedNote = document.createElement('p');
            savedNote.className = 'save-timestamp';
            savedNote.style.cssText = 'font-size:11.5px;color:var(--teal,#14B8A6);margin-top:6px;text-align:center;font-weight:600';
            savedNote.textContent = '✓ Last saved ' + dateStr + ' at ' + timeStr;
            actions.appendChild(savedNote);
          }
        }catch(e){}
      }
    });
    updateTemplateStatuses();
  }

  function templateFilled(id){
    const ph=phase();
    if(store.get('df_template_phase'+ph+'_'+id)==='true') return true;
    const panel=document.getElementById(id); if(!panel) return false;
    return Object.values(formValues(panel)).some(v => String(v||'').trim() !== '');
  }

  function updateTemplateStatuses(){
    // HIGH-FIX-12: inject CSS for saved badge visual
    if(!document.getElementById('statusSavedStyle')){
      const s=document.createElement('style');s.id='statusSavedStyle';
      s.textContent='.status.saved{background:rgba(20,184,166,.12)!important;color:var(--teal,#14B8A6)!important;font-weight:700!important}';
      document.head.appendChild(s);
    }
    const ph=phase(); if(!ph) return;
    $$('.template-panel').forEach(panel=>{
      const done = templateFilled(panel.id);
      panel.classList.toggle('template-saved', done);
      const status = panel.querySelector('.status');
      if(status){ status.textContent = done ? 'Saved \u2713' : (status.textContent==='Saved \u2713'?'Not Started':status.textContent); status.classList.toggle('saved',done); }
    });
    $$('.subtab').forEach(btn=>{
      const id=btn.dataset.subtab;
      if(id) btn.classList.toggle('saved', templateFilled(id));
    });
  }

  function setupForms(){
    restoreTemplates();
    $$('[data-save]').forEach(btn=>btn.addEventListener('click',()=>saveTemplateFrom(btn)));
    $('[data-print]')?.addEventListener('click',()=>window.print());

    const submit = $('[data-submit-phase]');
    if(submit){
      submit.addEventListener('click',()=>{
        const ph=phase();
        const expected = PHASE_TEMPLATES[ph] || $$('.template-panel').map(p=>p.id);
        const missing = expected.filter(id => document.getElementById(id) && !templateFilled(id));
        if(missing.length){
          const ok = confirm(`Some templates are not saved yet: ${missing.map(x=>x.toUpperCase()).join(', ')}.\n\nSubmit Phase ${ph} anyway?`);
          if(!ok) return;
        }
        const allData = {};
        expected.forEach(id=>{ const panel=document.getElementById(id); if(panel) allData[id]=formValues(panel); });
        store.setJson('df_phase'+ph+'_submission', { submittedAt:new Date().toISOString(), templates:allData });
        store.set('df_submitted_phase'+ph,'true');
        store.set('df_submission_status_phase'+ph, store.get('df_submitted_phase'+ph)==='true' ? 'Updated' : 'Submitted');
        syncToGoogleSheets('phase_submit', { phase: ph, submission: allData, submittedAt: new Date().toISOString(), nextPhase: NEXT_PHASE[ph] || null });
        const next = NEXT_PHASE[ph];
        showSubmitSuccess(ph,next);
      });
    }

    // ── T01 Interview Recording ──────────────────────────────────────────
    (function setupRecording(){
      const startBtn  = $('#startRec');
      const pauseBtn  = $('#pauseRec');
      const stopBtn   = $('#stopRec');
      const timerEl   = document.querySelector('.timer');
      if(!startBtn || !pauseBtn || !stopBtn) return;

      let mediaRecorder = null;
      let chunks        = [];
      let timerInterval = null;
      let elapsed       = 0;   // seconds
      let isPaused      = false;

      function formatTime(s){ return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }

      function tickTimer(){
        elapsed++;
        if(timerEl) timerEl.textContent = formatTime(elapsed);
      }

      function setButtons(state){
        // state: 'idle' | 'recording' | 'paused'
        startBtn.disabled  = state !== 'idle';
        pauseBtn.disabled  = state === 'idle';
        stopBtn.disabled   = state === 'idle';
        startBtn.textContent = state === 'idle' ? 'Start Recording' : '● Recording';
        pauseBtn.textContent = state === 'paused' ? 'Resume' : 'Pause';
        startBtn.style.opacity = state !== 'idle' ? '.55' : '1';
      }

      setButtons('idle');

      startBtn.addEventListener('click', async ()=>{
        if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
          toast('Microphone not supported on this browser.');
          return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          chunks = [];
          elapsed = 0;
          if(timerEl) timerEl.textContent = '00:00';
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.ondataavailable = e => { if(e.data.size > 0) chunks.push(e.data); };
          mediaRecorder.onstop = ()=>{
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const url  = URL.createObjectURL(blob);
            // Inject or update the audio player in the audio-box
            let audioBox = document.querySelector('.audio-box');
            if(audioBox){
              let player = audioBox.querySelector('audio#recPlayer');
              if(!player){
                player = document.createElement('audio');
                player.id      = 'recPlayer';
                player.controls = true;
                player.style.cssText = 'width:100%;margin-top:10px;border-radius:12px;';
                audioBox.appendChild(player);
              }
              player.src = url;
            }
            stream.getTracks().forEach(t=>t.stop());
            clearInterval(timerInterval);
            setButtons('idle');
            toast('Recording saved. Review the audio above.');
          };
          mediaRecorder.start(250);
          timerInterval = setInterval(tickTimer, 1000);
          setButtons('recording');
          isPaused = false;
          toast('Recording started. Speak clearly.');
        } catch(err){
          toast('Microphone access denied. Please allow microphone permission.');
        }
      });

      pauseBtn.addEventListener('click', ()=>{
        if(!mediaRecorder) return;
        if(mediaRecorder.state === 'recording'){
          mediaRecorder.pause();
          clearInterval(timerInterval);
          isPaused = true;
          setButtons('paused');
          toast('Recording paused.');
        } else if(mediaRecorder.state === 'paused'){
          mediaRecorder.resume();
          timerInterval = setInterval(tickTimer, 1000);
          isPaused = false;
          setButtons('recording');
          toast('Recording resumed.');
        }
      });

      stopBtn.addEventListener('click', ()=>{
        if(!mediaRecorder || mediaRecorder.state === 'inactive') return;
        mediaRecorder.stop();
        toast('Recording stopped.');
      });
    })();

    // ── T01 Auto Transcribe (Web Speech API) ─────────────────────────────
    (function setupAutoTranscribe(){
      const btn = $('#autoTranscribe');
      if(!btn) return;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if(!SpeechRecognition){
        btn.title = 'Speech recognition not supported on this browser.';
        btn.style.opacity = '.5';
        btn.addEventListener('click', ()=> toast('Auto Transcribe requires Chrome or Edge on desktop.'));
        return;
      }
      let recognising = false;
      const recog = new SpeechRecognition();
      recog.continuous    = true;
      recog.interimResults = true;
      recog.lang          = 'en-US';
      let finalTranscript = '';

      recog.onresult = e => {
        let interim = '';
        for(let i = e.resultIndex; i < e.results.length; i++){
          const t = e.results[i][0].transcript;
          if(e.results[i].isFinal) finalTranscript += t + ' ';
          else interim += t;
        }
        const ta = $('textarea[name="t01_transcript"]');
        if(ta) ta.value = finalTranscript + interim;
      };

      recog.onerror = e => {
        toast('Speech error: ' + e.error + '. Try again.');
        recognising = false;
        btn.textContent = 'Auto Transcribe';
      };

      recog.onend = () => {
        if(recognising){ recog.start(); } // keep alive while toggled on
      };

      btn.addEventListener('click', ()=>{
        if(!recognising){
          finalTranscript = $('textarea[name="t01_transcript"]')?.value || '';
          recog.start();
          recognising = true;
          btn.textContent = '⏹ Stop Transcribe';
          toast('Listening… speak now. Click Stop when done.');
        } else {
          recognising = false;
          recog.stop();
          btn.textContent = 'Auto Transcribe';
          toast('Transcription stopped. Review and edit the text.');
        }
      });
    })();

    // ── T05 POV Auto-Assembly ─────────────────────────────────────────────
    (function setupPOVAssembly(){
      const userEl    = $('[name="df_p02_t05_user"]');
      const needEl    = $('[name="df_p02_t05_need"]');
      const insightEl = $('[name="df_p02_t05_insight"]');
      const povEl     = $('[name="df_p02_t05_pov"]');
      if(!userEl || !needEl || !insightEl || !povEl) return;

      function assemblePOV(){
        const u = userEl.value.trim();
        const n = needEl.value.trim();
        const s = insightEl.value.trim();
        if(!u && !n && !s){ povEl.value = ''; return; }
        let pov = '';
        if(u) pov += u;
        if(n) pov += (pov ? ' ' : '') + n;
        if(s) pov += (pov ? ' ' : '') + (s.startsWith('because') || s.startsWith('Because') ? s : 'because ' + s);
        if(pov && !pov.endsWith('.')) pov += '.';
        // Only auto-fill if student hasn't manually edited the POV field beyond what assembly would produce
        povEl.value = pov;
      }

      [userEl, needEl, insightEl].forEach(el => el.addEventListener('input', assemblePOV));
    })();

    // ── T06 Best HMW Live Select ──────────────────────────────────────────
    (function setupHMWSelect(){
      // Replace the Best HMW textarea with a <select> that mirrors the 5 HMW fields
      const bestTa = $('[name="df_p02_t06_best_hmw"]');
      if(!bestTa) return;

      // Create the select element, styled exactly like .select
      const sel = document.createElement('select');
      sel.name      = 'df_p02_t06_best_hmw';
      sel.className = 'select';

      function rebuildOptions(){
        const current = sel.value;
        sel.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '— Select the best HMW question —';
        sel.appendChild(placeholder);

        const names = ['df_p02_t06_hmw1','df_p02_t06_hmw2','df_p02_t06_hmw3','df_p02_t06_hmw4','df_p02_t06_hmw5'];
        names.forEach((n, i) => {
          const src = $('[name="'+n+'"]');
          const text = src ? src.value.trim() : '';
          if(!text) return;
          const opt = document.createElement('option');
          opt.value = text;
          opt.textContent = 'HMW '+(i+1)+': '+text;
          sel.appendChild(opt);
        });

        // Custom typed option — always add so student can type their own
        const customOpt = document.createElement('option');
        customOpt.value   = '__custom__';
        customOpt.textContent = '✏️ Type my own…';
        sel.appendChild(customOpt);

        // Restore previous selection if it still exists
        const match = Array.from(sel.options).find(o => o.value === current);
        if(match) sel.value = current;
      }

      // Build a custom-input textarea that appears when student picks "Type my own"
      const customInput = document.createElement('textarea');
      customInput.className   = 'textarea';
      customInput.placeholder = 'Type your own best HMW question here…';
      customInput.name        = '__df_p02_t06_best_hmw_custom__';
      customInput.style.cssText = 'margin-top:8px;display:none;';

      sel.addEventListener('change', ()=>{
        if(sel.value === '__custom__'){
          customInput.style.display = 'block';
          customInput.focus();
        } else {
          customInput.style.display = 'none';
        }
      });

      // Replace textarea with select + customInput
      bestTa.parentNode.insertBefore(sel, bestTa);
      bestTa.parentNode.insertBefore(customInput, bestTa);
      bestTa.remove();

      // Listen on each HMW field to rebuild options dynamically
      const hmwNames = ['df_p02_t06_hmw1','df_p02_t06_hmw2','df_p02_t06_hmw3','df_p02_t06_hmw4','df_p02_t06_hmw5'];
      hmwNames.forEach(n => {
        const el = $('[name="'+n+'"]');
        if(el) el.addEventListener('input', rebuildOptions);
      });

      rebuildOptions();

      // On save, if custom was chosen, copy custom textarea value into the select's stored value
      // We override formValues for this field by patching after save
      const t06panel = document.getElementById('t06');
      if(t06panel){
        const saveBtn = t06panel.querySelector('[data-save]');
        if(saveBtn){
          saveBtn.addEventListener('click', ()=>{
            if(sel.value === '__custom__' && customInput.value.trim()){
              // Add the custom value as a real option and select it
              const existing = Array.from(sel.options).find(o => o.value === customInput.value.trim());
              if(!existing){
                const opt = document.createElement('option');
                opt.value = customInput.value.trim();
                opt.textContent = customInput.value.trim();
                sel.insertBefore(opt, sel.querySelector('[value="__custom__"]'));
              }
              sel.value = customInput.value.trim();
              customInput.style.display = 'none';
            }
          }, true); // capture phase so it fires before the main save handler
        }
      }

      // Restore saved value after restoreTemplates runs (it fires on DOMContentLoaded)
      // We use a small timeout to let applyValues complete first
      setTimeout(()=>{
        const saved = sel.value;
        rebuildOptions();
        if(saved && saved !== '__custom__'){
          // Try to re-select; if not in list (because HMW fields empty), add it
          const match = Array.from(sel.options).find(o => o.value === saved);
          if(!match && saved){
            const opt = document.createElement('option');
            opt.value = saved;
            opt.textContent = saved;
            sel.insertBefore(opt, sel.querySelector('[value="__custom__"]'));
          }
          sel.value = saved;
        }
      }, 150);
    })();
  }

  function showSubmitSuccess(ph,next){
    const panel=$('.panel.active') || $('main') || document.body;
    const card=document.createElement('div');
    card.className='submit-success-card';
    const nextHtml = next
      ? `<p style="font-size:13px;margin-bottom:10px">🎉 Great work completing Phase ${ph}! Your final submission is saved. Your next step is <strong>${next.label}</strong>.</p>
         <div class="success-actions"><a class="btn ghost" href="progress.html">View Progress</a><a class="btn primary" href="${next.url}">Go to ${next.label} →</a></div>`
      : `<div class="success-actions"><a class="btn ghost" href="progress.html">View Progress</a><a class="btn primary" href="portfolio-completion.html">Prepare Portfolio</a></div>`;
    card.innerHTML=`
      <div class="success-mark">✓</div>
      <h2>Phase ${ph} Submitted Successfully</h2>
      <p>Your work has been saved as a final Smart DT submission.</p>
      ${nextHtml}`;
    panel.prepend(card);
    card.scrollIntoView({behavior:'smooth',block:'start'});
    toast(`Phase ${ph} submitted.`);
  }

  // ── Gate approval: check with Google Sheets via GET ─────────────────
  function isGateApproved(ph){
    const key = ph==='02'?'df_gate_1':ph==='03'?'df_gate_2':ph==='05'?'df_gate_3':'';
    return key ? store.get(key)==='approved' : false;
  }

  function isGateApprovedByNum(num){
    return store.get('df_gate_'+num)==='approved';
  }

  function checkGateApproval(gateNum, email){
    if(!APPS_SCRIPT_WEB_APP_URL || !email) return Promise.resolve(false);
    const url = APPS_SCRIPT_WEB_APP_URL
      + '?action=check_gate'
      + '&gate='  + encodeURIComponent(gateNum)
      + '&email=' + encodeURIComponent(email);
    return fetch(url, { method:'GET', mode:'cors', cache:'no-store' })
      .then(r => r.json())
      .then(data => {
        if(data && data.approved === true){
          store.set('df_gate_'+gateNum, 'approved');
          return true;
        }
        return false;
      })
      .catch(()=> false);
  }

  function pollGateApproval(gateNum, onApproved){
    // Poll every 60 seconds while the gate lock screen is visible
    const email = store.get('df_email');
    if(!email) return;
    let attempts = 0;
    const MAX = 30; // stop after 30 minutes
    const id = setInterval(()=>{
      attempts++;
      if(attempts > MAX){ clearInterval(id); return; }
      checkGateApproval(gateNum, email).then(approved=>{
        if(approved){ clearInterval(id); onApproved(); }
      });
    }, 60000);
    // Also check immediately once on load
    checkGateApproval(gateNum, email).then(approved=>{ if(approved){ clearInterval(id); onApproved(); } });
    return id;
  }

  function setupGateGuard(){
    // General Smart DT workflow: no supervisor gate or approval lock.
    const lock = $('#gateLockScreen');
    if(lock) lock.remove();
    const main = $('main');
    if(main) main.style.display = '';
  }

  function setupNavActive(){
    const page=document.body.dataset.page;
    $$('.nav-item').forEach(a=>a.classList.toggle('active',a.dataset.nav===page));
    // CRITICAL-FIX-03 (cont): update Learn nav to point to student's current phase
    const learnNav = document.querySelector('.nav-item[data-nav="learn"]');
    if(learnNav){
      const cp = currentPhase();
      learnNav.href = PHASE_ROUTES[cp] || 'phase01-empathy.html';
    }
  }

  function renderProfile(){
    if(document.body.dataset.page!=='profile') return;
    const name=store.get('df_student_name') || (store.get('df_email') ? store.get('df_email').split('@')[0] : 'Student');
    $('.profile-name') && ($('.profile-name').textContent=name);
    $('[data-field="reg"]') && ($('[data-field="reg"]').textContent=store.get('df_reg_no')||store.get('df_registration_no')||'Not added');
    $('[data-field="class"]') && ($('[data-field="class"]').textContent=store.get('df_class')||'Not added');
    $('[data-field="team"]') && ($('[data-field="team"]').textContent=store.get('df_team')||'My Team');
    $('[data-field="supervisor"]') && ($('[data-field="supervisor"]').textContent=store.get('df_supervisor')||'My Supervisor');
    // Show project name field if present in HTML
    $('[data-field="project"]') && ($('[data-field="project"]').textContent=store.get('df_project_name')||'Not added');
    $('#profileTasks') && ($('#profileTasks').textContent=pendingTasks());
    $('#profileEvidence') && ($('#profileEvidence').textContent=completedCount());
    $('#profileFeedback') && ($('#profileFeedback').textContent=(isPhaseSubmitted('02')?1:0)+(isPhaseSubmitted('03')?1:0)+(isPhaseSubmitted('05')?1:0));
    $('#profileBadges') && ($('#profileBadges').textContent=badgeData().filter(b=>b.earned).length);
    $('#logoutBtn')?.addEventListener('click',()=>{ if(confirm('Log out from Smart DT Project on this device?')){ store.del('df_registered'); location.href='welcome.html'; } });
    $('#editProfileBtn')?.addEventListener('click',()=>enableProfileEdit());

    // ── Camera dot: upload photo stored as dataURL ────────────────────
    const cameraDot = $('.camera-dot');
    const avatarEl  = $('.profile-avatar-v9');
    const initialsEl = $('.profile-initials');
    if(cameraDot && avatarEl){
      // Restore saved photo
      const savedPhoto = store.get('df_profile_photo');
      if(savedPhoto){
        avatarEl.style.backgroundImage = `url(${savedPhoto})`;
        avatarEl.style.backgroundSize  = 'cover';
        avatarEl.style.backgroundPosition = 'center';
        if(initialsEl) initialsEl.style.display = 'none';
      }
      // Wire the + button to a hidden file input
      let photoInput = $('#profilePhotoInput');
      if(!photoInput){
        photoInput = document.createElement('input');
        photoInput.type    = 'file';
        photoInput.id      = 'profilePhotoInput';
        photoInput.accept  = 'image/*';
        photoInput.style.display = 'none';
        document.body.appendChild(photoInput);
      }
      cameraDot.addEventListener('click', ()=> photoInput.click());
      photoInput.addEventListener('change', ()=>{
        const file = photoInput.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = e => {
          const dataUrl = e.target.result;
          store.set('df_profile_photo', dataUrl);
          avatarEl.style.backgroundImage    = `url(${dataUrl})`;
          avatarEl.style.backgroundSize     = 'cover';
          avatarEl.style.backgroundPosition = 'center';
          if(initialsEl) initialsEl.style.display = 'none';
          toast('Profile photo updated.');
        };
        reader.readAsDataURL(file);
      });
    }

    // ── Profile menu buttons: inline expand panels ────────────────────
    setupProfileMenuPanels();
  }

  function setupProfileMenuPanels(){
    // Each button maps to a panel definition.
    // Panels expand below their button; only one open at a time.
    // Existing Edit Profile (card-level) and Logout are untouched.
    const menuList = $('.menu-list-v9');
    if(!menuList) return;

    const panels = {
      personalInfo: {
        title: 'Personal Information',
        render: ()=>{
          const email = store.get('df_email') || 'Not added';
          const reg   = store.get('df_reg_no') || store.get('df_registration_no') || 'Not added';
          const cls   = store.get('df_class') || 'Not added';
          return `
            <div class="profile-info-panel">
              <div class="profile-field"><span>Full Name</span><strong>${escapeHtml(store.get('df_student_name')||'Not added')}</strong></div>
              <div class="profile-field"><span>Email</span><strong>${escapeHtml(email)}</strong></div>
              <div class="profile-field"><span>Registration No.</span><strong>${escapeHtml(reg)}</strong></div>
              <div class="profile-field"><span>Class</span><strong>${escapeHtml(cls)}</strong></div>
              <div class="profile-field" style="grid-column:1/-1"><span>Project Title</span><strong>${escapeHtml(store.get('df_project_name')||'Not added')}</strong></div>
              <p style="font-size:11.5px;color:var(--muted);margin-top:8px">To update details, use <strong>Edit Profile</strong> above.</p>
            </div>`;
        }
      },
      teamRoles: {
        title: 'Team & Roles',
        render: ()=>{
          const team = store.get('df_team') || 'Not added';
          const sup  = store.get('df_supervisor') || 'Not added';
          // Pull T00 role assignments if saved
          const t00 = store.json('df_phase01_templates',{})['t00']?.values || {};
          const interviewer = t00['t00_interviewer'] || '—';
          const notetaker   = t00['t00_notetaker']   || '—';
          const recorder    = t00['t00_recorder']     || '—';
          const observer    = t00['t00_observer']     || '—';
          return `
            <div class="profile-info-panel">
              <div class="profile-field"><span>Team Name</span><strong>${escapeHtml(team)}</strong></div>
              <div class="profile-field"><span>Supervisor</span><strong>${escapeHtml(sup)}</strong></div>
              <div class="profile-field" style="grid-column:1/-1"><span>Interview Roles (from T00)</span>
                <strong style="font-weight:700;font-size:12px;line-height:1.6">
                  Interviewer: ${escapeHtml(interviewer)}<br>
                  Note-taker: ${escapeHtml(notetaker)}<br>
                  Recorder: ${escapeHtml(recorder)}<br>
                  Observer: ${escapeHtml(observer)}
                </strong>
              </div>
              <p style="font-size:11.5px;color:var(--muted);margin-top:8px">Role assignments are pulled from T00 Prepare Interview.</p>
            </div>`;
        }
      },
      myReflections: {
        title: 'My Reflections',
        render: ()=>{
          const t16 = store.json('df_phase05_templates',{})['t16']?.values || {};
          const wentWell   = t16['t16_went_well']   || '';
          const challenge  = t16['t16_challenge']   || '';
          const dtChange   = t16['t16_dt_change']   || '';
          const message    = t16['t16_message']     || '';
          const rating     = t16['t16_rating']      || '';
          const skill      = t16['t16_skill']       || '';
          const hasSaved   = wentWell || challenge || dtChange;
          if(!hasSaved){
            return `<div class="profile-info-panel"><p style="font-size:13px;color:var(--muted);padding:8px 0">Your Final Reflection (T16) has not been completed yet. Complete Phase 05 Test to see your reflection here.</p><a class="btn ghost" style="font-size:12px;min-height:40px;margin-top:8px" href="phase05-test.html">Go to Phase 05</a></div>`;
          }
          return `
            <div class="profile-info-panel">
              ${rating ? `<div class="profile-field" style="grid-column:1/-1"><span>Journey Rating</span><strong>${escapeHtml(rating)}</strong></div>` : ''}
              ${skill  ? `<div class="profile-field" style="grid-column:1/-1"><span>Top Skill Improved</span><strong>${escapeHtml(skill)}</strong></div>` : ''}
              ${wentWell  ? `<div class="profile-field" style="grid-column:1/-1"><span>What went well</span><strong style="font-weight:600;font-size:12px">${escapeHtml(wentWell)}</strong></div>` : ''}
              ${challenge ? `<div class="profile-field" style="grid-column:1/-1"><span>Biggest challenge</span><strong style="font-weight:600;font-size:12px">${escapeHtml(challenge)}</strong></div>` : ''}
              ${dtChange  ? `<div class="profile-field" style="grid-column:1/-1"><span>How DT changed my approach</span><strong style="font-weight:600;font-size:12px">${escapeHtml(dtChange)}</strong></div>` : ''}
              ${message   ? `<div class="profile-field" style="grid-column:1/-1"><span>Message to future students</span><strong style="font-weight:600;font-size:12px">${escapeHtml(message)}</strong></div>` : ''}
            </div>`;
        }
      },
      settings: {
        title: 'Settings',
        render: ()=>{
          return `
            <div class="profile-info-panel">
              <div class="profile-field" style="grid-column:1/-1">
                <span>Local Data</span>
                <strong style="font-weight:600;font-size:12px">All progress is saved on this device using local storage.</strong>
              </div>
              <div class="profile-field" style="grid-column:1/-1">
                <span>Sync Status</span>
                <strong style="font-weight:600;font-size:12px">Last action: ${escapeHtml(store.get('df_last_sync_action')||'None')} · Status: ${escapeHtml(store.get('df_last_sync_status')||'—')}</strong>
              </div>
              <div style="grid-column:1/-1;margin-top:8px">
                <button class="btn ghost" style="font-size:12px;min-height:40px;width:100%" id="clearPhotoBtn">Remove Profile Photo</button>
              </div>
              <p style="font-size:11px;color:var(--muted);margin-top:8px;grid-column:1/-1">To reset all progress, use Log Out and re-register.</p>
            </div>`;
        },
        afterRender: (panel)=>{
          panel.querySelector('#clearPhotoBtn')?.addEventListener('click',()=>{
            store.del('df_profile_photo');
            const av = $('.profile-avatar-v9');
            const init = $('.profile-initials');
            if(av){ av.style.backgroundImage=''; av.style.backgroundSize=''; }
            if(init) init.style.display='';
            toast('Profile photo removed.');
          });
        }
      }
    };

    // Map button text content to panel key
    const btnMap = [
      ['Personal Information', 'personalInfo'],
      ['Team & Roles',         'teamRoles'],
      ['My Reflections',       'myReflections'],
      ['Settings',             'settings']
    ];

    $$('.menu-row-v9', menuList).forEach(btn => {
      const label = btn.querySelector('strong')?.textContent?.trim() || '';
      const match = btnMap.find(([text]) => label.includes(text));
      if(!match) return;
      const [, key] = match;

      btn.addEventListener('click', ()=>{
        // Close any open panel for this button
        const existing = btn.nextElementSibling;
        if(existing && existing.classList.contains('profile-menu-panel')){
          existing.remove();
          btn.classList.remove('menu-row-open');
          return;
        }
        // Close all other open panels
        $$('.profile-menu-panel', menuList).forEach(p=>p.remove());
        $$('.menu-row-open', menuList).forEach(b=>b.classList.remove('menu-row-open'));

        // Build and insert panel
        const def = panels[key];
        const panel = document.createElement('div');
        panel.className = 'profile-menu-panel';
        panel.innerHTML = def.render();
        btn.insertAdjacentElement('afterend', panel);
        btn.classList.add('menu-row-open');
        if(def.afterRender) def.afterRender(panel);
        panel.scrollIntoView({behavior:'smooth', block:'nearest'});
      });
    });
  }

  function pendingTasks(){
    let count=0; ['01','02','03','04','05'].forEach(n=>{ if(!isPhaseSubmitted(n)) count++; if(!quizScore(n)) count++; });
    return Math.min(count,9);
  }

  function enableProfileEdit(){
    const card=$('.profile-card-v9'); if(!card || card.classList.contains('edit-mode')) return;
    card.classList.add('edit-mode');
    const fields={reg:['df_reg_no','Registration No.'], class:['df_class','Class'], team:['df_team','Team'], supervisor:['df_supervisor','Supervisor']};
    Object.entries(fields).forEach(([key,[storeKey,label]])=>{ const el=$(`[data-field="${key}"]`); if(el) el.innerHTML=`<input aria-label="${label}" value="${escapeAttr(store.get(storeKey)||'')}" data-edit-key="${storeKey}" placeholder="${label}">`; });
    const actions=document.createElement('div'); actions.className='edit-actions'; actions.innerHTML='<button class="btn teal" type="button" id="saveProfileEdit">Save Details</button><button class="btn ghost" type="button" id="cancelProfileEdit">Cancel</button>'; card.appendChild(actions);
    $('#saveProfileEdit').onclick=()=>{ $$('[data-edit-key]').forEach(i=>store.set(i.dataset.editKey,i.value.trim())); syncToGoogleSheets('profile_update', { profile: studentPayload() }, true); location.reload(); };
    $('#cancelProfileEdit').onclick=()=>location.reload();
  }

  function renderProgress(){
    if(document.body.dataset.page!=='progress') return;
    const phases=[
      {n:'01', name:'Phase 01 — Empathise', url:'phase01-empathy.html', templates:'T01–T04', output:'POEMS, Interview, Transcript, Empathy Map'},
      {n:'02', name:'Phase 02 — Define', url:'phase02-define.html', templates:'T05–T06', output:'Persona, User Insight & Needs Statement'},
      {n:'03', name:'Phase 03 — Ideate', url:'phase03-ideation.html', templates:'T07–T10', output:'Mind Map, Sketching, SCAMPER, Matrix'},
      {n:'04', name:'Phase 04 — Prototype', url:'phase04-prototype.html', templates:'T11', output:'Prototype Direction Plan'},
      {n:'05', name:'Phase 05 — Test & Pitch', url:'phase05-test.html', templates:'T12–T13', output:'Feedback Matrix & 8-Slide Pitch'}
    ];
    const done=completedCount(), pct=Math.round(done/5*100), current=currentPhase();
    $('#progressDoneText') && ($('#progressDoneText').textContent=`${done} of 5 phases complete`);
    $('#progressPct') && ($('#progressPct').textContent=pct+'%');
    $('#progressFill') && ($('#progressFill').style.width=pct+'%');
    const list=$('#phaseProgressList');
    if(list){ list.innerHTML=phases.map(p=>{
      const q=quizScore(p.n); const isDone=isPhaseSubmitted(p.n); const isCurrent=current===p.n;
      const saved=Object.keys(store.json('df_phase'+p.n+'_templates',{})).length;
      const total=(PHASE_TEMPLATES[p.n]||[]).length;
      return `<a class="phase-card-v9 ${isDone?'done':''} ${isCurrent?'current':''}" href="${p.url}"><span class="phase-num-v9">${isDone?'✓':p.n}</span><span class="phase-body-v9"><strong>${p.name}</strong><small>${p.templates} · ${p.output}</small><span class="phase-tags-v9"><em class="tag-v9 ${q?'pass':'locked'}">${q?'Quiz '+q+'/5':'Quiz pending'}</em><em class="tag-v9 ${saved>=total?'done':'pending'}">Drafts ${Math.min(saved,total)}/${total}</em><em class="tag-v9 ${isDone?'done':'pending'}">${isDone?'Submitted':'Not submitted'}</em></span></span><span class="phase-arrow-v9">›</span></a>`;
    }).join(''); }
    const workflow=$('#workflowList');
    if(workflow){ workflow.innerHTML=phases.map(p=>{
      const isDone=isPhaseSubmitted(p.n);
      const status=store.get('df_submission_status_phase'+p.n) || (isDone?'Submitted':'Draft');
      return `<div class="gate-row-v9"><span class="gate-ico ${isDone?'approved':''}">${isDone?'✓':'•'}</span><span class="gate-info-v9"><strong>${p.templates}</strong><small>${p.output}</small></span><span class="gate-pill-v9 ${isDone?'approved':'pending'}">${status}</span></div>`;
    }).join(''); }
    const grid=$('#badgeGrid');
    if(grid){
      const badges=badgeData(); const earned=badges.filter(b=>b.earned);
      grid.innerHTML=badges.length ? badges.map(b=>`<div class="badge-card-v9 ${b.earned?'':'locked'}"><img src="${b.img}" alt=""><strong>${b.name}</strong><small>${b.text}</small></div>`).join('') : '';
      if(!earned.length) grid.innerHTML+='<div style="grid-column:1/-1;text-align:center;padding:18px;color:var(--muted,#8892A4)"><p style="font-size:13px;margin-bottom:6px">No badges earned yet.</p><p style="font-size:12px">Submit Phase 01 to earn your first badge.</p></div>';
    }
    const pCta=document.getElementById('progressPortfolioCta');
    if(pCta){ pCta.style.display = done>=5 ? '' : 'none'; }
    $('#continuePhaseBtn')?.addEventListener('click',()=>{ location.href = PHASE_ROUTES[current] || 'portfolio-completion.html'; });
  }

  function gateSubmitted(g){ return false; }
  function badgeData(){
    const d=completedCount();
    return [
      {name:'DT Explorer', img:'https://iili.io/CdFdugj.png', earned:d>=3, text:'3 of 5 phases submitted'},
      {name:'Empathy Champion', img:'https://iili.io/CdFdnz7.png', earned:isPhaseSubmitted('01'), text:'T01–T04 completed'},
      {name:'Problem Framer', img:'https://iili.io/CdFdIqu.png', earned:isPhaseSubmitted('02'), text:'T05–T06 completed'},
      {name:'Idea Generator', img:'https://iili.io/CdFdqe2.png', earned:isPhaseSubmitted('03'), text:'T07–T10 completed'},
      {name:'Prototype Builder', img:'https://iili.io/CdFdT0b.png', earned:isPhaseSubmitted('04'), text:'T11 completed'},
      {name:'User Tester', img:'https://iili.io/CdFdRdx.png', earned:isPhaseSubmitted('05'), text:'T12–T13 completed'},
      {name:'DT Graduate', img:'https://iili.io/CdFdoX9.png', earned:d>=5, text:'All phases completed'},
      {name:'Full Portfolio', img:'https://iili.io/CdFdBbS.png', earned:d>=5, text:'Ready for portfolio'}
    ];
  }


  function renderPortfolio(){
    if(document.body.dataset.page!=='portfolio') return;
    const name  = store.get('df_student_name') || 'Student';
    const proj  = store.get('df_project_name') || 'My FYP Project';
    const team  = store.get('df_team')         || 'My Team';
    const sup   = store.get('df_supervisor')   || 'My Supervisor';
    const done  = completedCount();
    const badges = badgeData().filter(b=>b.earned);
    const allDone = done >= 5;
    const g1 = store.get('df_gate_1')==='submitted'||store.get('df_gate_1')==='approved';
    const g2 = store.get('df_gate_2')==='submitted'||store.get('df_gate_2')==='approved';
    const g3 = store.get('df_gate_3')==='submitted'||store.get('df_gate_3')==='approved';
    const gatesDone = [g1,g2,g3].filter(Boolean).length;
    const summaryCard = $('#portfolioSummary');
    if(summaryCard){
      const phasesLeft = 5-done;
      const gatesLeft  = 3-gatesDone;
      summaryCard.innerHTML =
        '<div class="portfolio-student-row">'
        +'<div class="portfolio-avatar">'+escapeHtml(initials(name))+'</div>'
        +'<div>'
        +'<h2 class="portfolio-student-name">'+escapeHtml(name)+'</h2>'
        +'<p class="portfolio-student-meta">'+escapeHtml(proj)+'</p>'
        +'<p class="portfolio-student-meta" style="margin-top:2px">'+escapeHtml(team)+' &middot; Smart DT Project: '+escapeHtml(team)+'</p>'
        +'</div></div>'
        +'<div class="portfolio-stats-row">'
        +'<div class="portfolio-stat '+(allDone?'done':'')+'"><strong>'+done+'/5</strong><span>Phases<br>Submitted</span></div>'
        +'<div class="portfolio-stat '+(gatesDone===3?'done':'')+'"><strong>'+gatesDone+'/3</strong><span>Final<br>Submissions</span></div>'
        +'<div class="portfolio-stat '+(badges.length>0?'done':'')+'"><strong>'+badges.length+'</strong><span>Badges<br>Earned</span></div>'
        +'</div>'
        +(allDone && gatesDone===3
          ? '<div class="portfolio-ready-banner">All phases and gates complete &mdash; ready for portfolio submission!</div>'
          : '<div class="portfolio-pending-banner">'
            +(phasesLeft>0 ? phasesLeft+' phase'+(phasesLeft!==1?'s':'')+' pending. ' : '')
            +(gatesLeft>0  ? gatesLeft+' gate'+(gatesLeft!==1?'s':'')+' pending.' : '')
            +'</div>');
    }
    const checklistEl = $('#portfolioChecklist');
    if(checklistEl){
      const t15v = store.json('df_phase05_templates',{})['t15']?.values || {};
      const t16v = store.json('df_phase05_templates',{})['t16']?.values || {};
      const items = [
        { label:'Phase 01 Empathy - T00 to T04 completed',                 done: isPhaseSubmitted('01') },
        { label:'Phase 02 Define - T05 to T06 submitted',          done: isPhaseSubmitted('02') },
        { label:'Phase 03 Ideation - T07 to T10 submitted',      done: isPhaseSubmitted('03') },
        { label:'Phase 04 Prototype - T11 to T13 and Readiness Check done', done: isPhaseSubmitted('04') },
        { label:'Phase 05 Test & Pitch - T12 to T13 submitted',          done: isPhaseSubmitted('05') },
        { label:'Phase 02 final submission saved',                    done: g1 },
        { label:'Phase 03 final submission saved',                    done: g2 },
        { label:'Phase 05 final submission saved',                    done: g3 },
        { label:'Final Reflection (T16) written honestly and in full',       done: !!(t16v['t16_went_well']) },
        { label:'Improvement Plan (T15) includes proposed fixes',            done: !!(t15v['t15_common']) },
        { label:'All prototype and test evidence labelled and accessible',   done: isPhaseSubmitted('04') },
        { label:'Team confirms all links and files can be opened',           done: allDone }
      ];
      checklistEl.innerHTML = items.map(item=>
        '<li class="portfolio-checklist-item '+(item.done?'done':'')+'">'
        +'<span class="checklist-dot '+(item.done?'done':'')+'">'+( item.done ? '&#10003;' : '&#9675;' )+'</span>'
        +'<span>'+escapeHtml(item.label)+'</span></li>'
      ).join('');
    }
    $('#portfolioPrintBtn')?.addEventListener('click',()=>window.print());
    $('#portfolioProgressBtn')?.addEventListener('click',()=>{ location.href='progress.html'; });
  }

  function escapeHtml(str){ return String(str||'').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":"&#39;",'"':'&quot;'}[c])); }
  function escapeAttr(str){ return escapeHtml(str).replace(/`/g,'&#96;'); }


  // ── Hamburger menu quick-nav ─────────────────────────────────────
  function setupHamburgerMenu(){
    const btn = $('.menu-lines');
    if(!btn) return;

    btn.addEventListener('click', ()=>{
      // Remove existing if open
      const existing = $('#quickNavPanel');
      if(existing){ existing.remove(); return; }

      const panel = document.createElement('div');
      panel.id = 'quickNavPanel';
      panel.innerHTML =
        '<div id="quickNavBackdrop" style="position:fixed;inset:0;background:rgba(8,27,68,.45);z-index:149;"></div>'
        +'<div style="position:fixed;top:0;right:0;width:min(300px,85vw);height:100dvh;background:#F8FAFC;'
        +'z-index:150;box-shadow:-18px 0 44px rgba(8,27,68,.18);overflow-y:auto;'
        +'display:flex;flex-direction:column;">'
        +'<div style="background:linear-gradient(135deg,#081B44,#12306A);padding:20px 18px 18px;">'
        +'<div style="display:flex;align-items:center;justify-content:space-between;">'
        +'<div style="display:flex;align-items:center;gap:10px;">'
        +'<img src="https://iili.io/Cd3i8QV.png" alt="" style="width:36px;height:36px;border-radius:11px;background:#fff;padding:4px;object-fit:contain;">'
        +'<div>'
        +'<div style="font-size:15px;font-weight:900;color:#fff;line-height:1.1;">Smart DT Project</div>'
        +'<div style="font-size:10px;color:rgba(255,255,255,.6);font-weight:700;margin-top:3px;">Design Thinking Journey</div>'
        +'</div></div>'
        +'<button id="closeNavPanel" style="width:34px;height:34px;border:1.5px solid rgba(255,255,255,.2);'
        +'border-radius:50%;background:rgba(255,255,255,.1);font-size:20px;cursor:pointer;display:grid;place-items:center;color:#fff;">'
        +'&times;</button></div></div>'
        +'<div style="padding:12px 14px 32px;">'
        +_navLinks()
        +'</div>'
        +'</div>';

      document.body.appendChild(panel);
      setTimeout(()=>{ panel.querySelector('div>div').style.transition='transform .22s ease'; }, 10);

      document.getElementById('quickNavBackdrop').addEventListener('click', ()=> panel.remove());
      document.getElementById('closeNavPanel').addEventListener('click', ()=> panel.remove());
    });
  }

  function _navLinks(){
    // Use SMART_DT_ASSETS CDN URLs — single source of truth from smartdt-assets.js
    const A = window.SMART_DT_ASSETS || {};
    const nav = A.nav || {};
    const ill = A.illustrations || {};
    const ui  = A.ui  || {};

    const pages = [
      { href:'dashboard.html',        label:'Dashboard',          img: nav.dashboard          || 'https://iili.io/Cd3ksWu.png' },
      { href:'phase01-empathy.html',  label:'Phase 01 Empathy',   img: ill.empathyCard        || 'https://iili.io/CdFTPLJ.png',  num:'01' },
      { href:'phase02-define.html',   label:'Phase 02 Define',    img: ill.defineCard         || 'https://iili.io/CdFTsqv.png',  num:'02' },
      { href:'phase03-ideation.html', label:'Phase 03 Ideation',  img: ill.ideationCard       || 'https://iili.io/CdFT6Xa.png',  num:'03' },
      { href:'phase04-prototype.html',label:'Phase 04 Prototype', img: ill.prototypeCard      || 'https://iili.io/CdFTS5P.png',  num:'04' },
      { href:'phase05-test.html',     label:'Phase 05 Test',      img: ill.testCard           || 'https://iili.io/CdFTgmF.png',  num:'05' },
      { href:'progress.html',         label:'My Progress',        img: nav.progress           || 'https://iili.io/Cd3k4O7.png' },
      { href:'profile.html',          label:'My Profile',         img: nav.profile            || 'https://iili.io/Cd3k6b9.png' },
    ];

    const current = window.location.pathname.split('/').pop() || 'dashboard.html';
    const divider = '<div style="height:1px;background:rgba(8,27,68,.07);margin:6px 0 8px;"></div>';

    return pages.map((p, i) => {
      const active  = current === p.href;
      const iconBg  = active ? 'rgba(255,255,255,.2)' : (p.num ? '#EEF6FF' : '#F0FBFA');
      const iconBdr = active ? 'none' : '1px solid rgba(8,27,68,.07)';
      const badge   = p.num
        ? '<span style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;border-radius:50%;'
          + 'background:' + (active ? 'rgba(255,255,255,.9)' : 'var(--teal,#14B8A6)') + ';'
          + 'color:' + (active ? 'var(--teal,#14B8A6)' : '#fff') + ';'
          + 'font-size:8px;font-weight:900;display:grid;place-items:center;border:2px solid #fff;">'
          + p.num + '</span>'
        : '';
      const pre = (i === 6) ? divider : '';
      return pre
        + '<a href="' + p.href + '" style="display:flex;align-items:center;gap:13px;padding:11px 12px;'
        + 'border-radius:16px;text-decoration:none;margin-bottom:5px;'
        + 'font-size:13.5px;font-weight:800;'
        + 'color:' + (active ? '#fff' : 'var(--navy,#081B44)') + ';'
        + 'background:' + (active ? 'var(--teal,#14B8A6)' : '#fff') + ';'
        + 'border:1px solid ' + (active ? 'transparent' : 'rgba(8,27,68,.07)') + ';'
        + 'box-shadow:' + (active ? '0 6px 18px rgba(20,184,166,.25)' : '0 1px 4px rgba(8,27,68,.05)') + ';">'
        + '<span style="position:relative;width:38px;height:38px;border-radius:12px;display:grid;place-items:center;'
        + 'flex-shrink:0;background:' + iconBg + ';border:' + iconBdr + ';">'
        + '<img src="' + p.img + '" alt="" style="width:' + (p.num ? '30px' : '24px') + ';height:' + (p.num ? '30px' : '24px') + ';object-fit:contain;display:block;">'
        + badge
        + '</span>'
        + '<span style="flex:1;line-height:1.2;">' + p.label + '</span>'
        + '<span style="font-size:16px;color:' + (active ? 'rgba(255,255,255,.7)' : 'rgba(8,27,68,.2)') + ';">›</span>'
        + '</a>';
    }).join('');
  }


  // HIGH-FIX-15: BM/EN language toggle
  const LANG_STRINGS={
    EN:{'Dashboard':'Dashboard','Learn':'Learn','Projects':'Projects','Progress':'Progress','Profile':'Profile',
        'Quick Info':'Quick Info','Quiz':'Quiz','Templates':'Templates',
        'View Sample':'View Sample','Fill Template':'Fill Template',
        'Start Quick Check Quiz':'Start Quick Check Quiz',
        'Continue Current Phase':'Continue Current Phase',
        'Back':'Back','Next':'Next','Save':'Save','Submit':'Submit','Print':'Print'},
    BM:{'Dashboard':'Papan Pemuka','Learn':'Belajar','Projects':'Projek','Progress':'Kemajuan','Profile':'Profil',
        'Quick Info':'Maklumat Pantas','Quiz':'Kuiz','Templates':'Templat',
        'View Sample':'Lihat Contoh','Fill Template':'Isi Templat',
        'Start Quick Check Quiz':'Mulakan Kuiz Semakan',
        'Continue Current Phase':'Teruskan Fasa Semasa',
        'Back':'Kembali','Next':'Seterusnya','Save':'Simpan','Submit':'Hantar','Print':'Cetak'}
  };
  function applyLanguage(lang){
    store.set('df_language',lang);
    $$('.lang-pill').forEach(p=>{ p.innerHTML='<span class="pill-symbol" aria-hidden="true">&#127760;</span> '+lang; });
    const strings=LANG_STRINGS[lang]||LANG_STRINGS.EN;
    const enS=LANG_STRINGS.EN;
    $$('.nav-label,.tab').forEach(el=>{ const k=Object.keys(enS).find(k=>enS[k]===el.textContent.trim()||(LANG_STRINGS.BM[k]===el.textContent.trim())); if(k&&strings[k]) el.textContent=strings[k]; });
    $$('button:not(.icon-btn):not(.option):not([data-tab]):not(.subtab):not(.switch button):not(.acc-head):not(.menu-lines)').forEach(el=>{ if(el.children.length>0) return; const t=el.textContent.trim(); const k=Object.keys(enS).find(k=>enS[k]===t||(LANG_STRINGS.BM[k]===t)); if(k&&strings[k]&&strings[k]!==t) el.textContent=strings[k]; });
    document.documentElement.lang=lang==='BM'?'ms':'en';
  }
  function setupLanguageToggle(){
    $$('.lang-pill').forEach(p=>{ p.style.cursor='pointer'; p.title='Toggle BM/EN'; p.addEventListener('click',()=>{
      const cur=store.get('df_language')||'EN';
      const nxt=cur==='EN'?'BM':'EN';
      applyLanguage(nxt);
      if(nxt==='BM'){
        toast('Bahasa Malaysia diaktifkan. Nota: kandungan templat masih dalam Bahasa Inggeris.');
      } else {
        toast('English interface active.');
      }
    }); });
    const saved=store.get('df_language');
    if(saved&&saved!=='EN') applyLanguage(saved);
  }

  document.addEventListener('DOMContentLoaded',()=>{
    setupGateGuard();
    setupHamburgerMenu();
    setupLanguageToggle(); // HIGH-FIX-15
    hydrateHeader();
    setupAuth();
    setupAccordions();
    setupDashboard();
    setupTabs();
    setupQuiz();
    setupForms();
    setupNavActive();
    renderProfile();
    renderProgress();
    renderPortfolio();
  });
})();

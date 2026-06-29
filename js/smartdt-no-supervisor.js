(function(){
  'use strict';
  const ROUTES = {
    '01':'phase01-empathy.html',
    '02':'phase02-define.html',
    '03':'phase03-ideation.html',
    '04':'phase04-prototype.html',
    '05':'phase05-test.html'
  };
  function unlockAll(){
    try{
      ['1','2','3'].forEach(n=>localStorage.setItem('df_gate_'+n,'approved'));
      ['01','02','03','04','05'].forEach(ph=>{
        localStorage.setItem('df_unlocked_phase'+ph,'true');
        if(!localStorage.getItem('df_quiz_phase'+ph)) localStorage.setItem('df_quiz_phase'+ph,'5');
      });
    }catch(e){}
  }
  function nextOpenPhase(){
    try{
      for(let i=1;i<=5;i++){
        const ph=String(i).padStart(2,'0');
        if(localStorage.getItem('df_submitted_phase'+ph)!=='true') return ph;
      }
    }catch(e){}
    return '05';
  }
  function cleanup(){
    const lock=document.getElementById('gateLockScreen');
    if(lock) lock.remove();
    const main=document.querySelector('main');
    if(main) main.style.display='';
    document.querySelectorAll('[data-tab="templatesPanel"]').forEach(tab=>{
      tab.classList.remove('locked');
      tab.removeAttribute('aria-disabled');
      tab.title='Templates unlocked';
      const note=tab.querySelector('.lock-note');
      if(note) note.remove();
    });
    const hint=document.getElementById('quizGateHint');
    if(hint) hint.remove();
    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length || !el.textContent) return;
      el.textContent=el.textContent
        .replace(/Supervisor Feedback/gi,'Submission Status')
        .replace(/Gate approval and comments/gi,'Draft, Submitted and Updated')
        .replace(/Supervisor Gate/gi,'Final Submission')
        .replace(/Gate 1|Gate 2|Gate 3/gi,'Submit Final')
        .replace(/sent to your supervisor/gi,'saved as final submission');
    });
  }
  function patchButtons(){
    document.querySelectorAll('[data-continue]').forEach(btn=>{
      if(btn.dataset.smartdtContinueFixed) return;
      btn.dataset.smartdtContinueFixed='true';
      btn.addEventListener('click', e=>{
        e.preventDefault();
        const ph=nextOpenPhase();
        location.href=ROUTES[ph]||ROUTES['01'];
      }, true);
    });
    document.querySelectorAll('[data-submit-phase]').forEach(btn=>{
      if(btn.dataset.smartdtSubmitFixed) return;
      btn.dataset.smartdtSubmitFixed='true';
      btn.addEventListener('click', ()=>{
        const ph=(document.body.dataset.phase||'').padStart(2,'0');
        try{localStorage.setItem('df_submission_status_phase'+ph, localStorage.getItem('df_submitted_phase'+ph)==='true'?'Updated':'Submitted');}catch(e){}
        setTimeout(()=>{unlockAll();cleanup();},100);
      }, true);
    });
  }
  function boot(){
    unlockAll();cleanup();patchButtons();
    new MutationObserver(()=>{unlockAll();cleanup();patchButtons();}).observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

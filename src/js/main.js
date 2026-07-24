// Phase 1 — main.js
// Minimal bootstrap and feature flags for later phases.
(function(){
  const FEATURES = {
    animations: false,
    music: false,
    gallery: false
  };

  function onReady(){
    // set current year in footer
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.textContent = new Date().getFullYear();

    // basic Open Invitation button handler (placeholder)
    const openBtn = document.getElementById('open-invite');
    if(openBtn){
      openBtn.addEventListener('click', ()=>{
        console.log('Open Invitation clicked');
        document.documentElement.classList.toggle('invitation-open');
        // In later phases: trigger book open animation / transition
      });
    }

    // accessibility note: ensure keyboard activation
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' && document.activeElement && document.activeElement.id === 'open-invite'){
        document.activeElement.click();
      }
    });

    // expose for debugging
    window.__ADELA = {FEATURES};
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', onReady);
  } else onReady();
})();

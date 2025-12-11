(function(){
  const LINK_ID = 'theme-link';
  const BTN_ID = 'bw-toggle';
  const KEY = 'boda_theme';
  // Default theme: beige (style.css). Alt theme: granate (style-granate.css)
  const STYLE_DEFAULT = 'css/style.css';
  const STYLE_ALT = 'css/style-granate.css';

  function setTheme(href){
    const link = document.getElementById(LINK_ID);
    const btn = document.getElementById(BTN_ID);
    if(!link || !btn) return;
    link.setAttribute('href', href);
    const isBw = href.indexOf('style.css') !== -1 && href.indexOf('style-granate') === -1;
    btn.setAttribute('aria-pressed', String(isBw));
    // visual state class (bw-on when showing the bw stylesheet)
    if(isBw) btn.classList.add('bw-on'); else btn.classList.remove('bw-on');
    try{ localStorage.setItem(KEY, isBw ? 'bw' : 'granate'); }catch(e){}
  }

  function toggle(){
    const link = document.getElementById(LINK_ID);
    if(!link) return;
    const current = link.getAttribute('href') || '';
    // toggle: if currently granate, switch to bw (style.css), otherwise to granate
    const newHref = current.indexOf('style-granate') !== -1 ? STYLE_DEFAULT : STYLE_ALT;
    setTheme(newHref);
  }

  // init on DOMContentLoaded to be safe
  document.addEventListener('DOMContentLoaded', function(){
    const link = document.getElementById(LINK_ID);
    const btn = document.getElementById(BTN_ID);
    if(!link || !btn) return;
    // restore
    let pref = null;
    try{ pref = localStorage.getItem(KEY); }catch(e){}
    if(pref === 'bw') setTheme(STYLE_DEFAULT);
    else if(pref === 'granate') setTheme(STYLE_ALT);
    else {
      // leave existing href but ensure aria state matches
      const href = link.getAttribute('href') || STYLE_DEFAULT;
      const isBw = href.indexOf('style.css') !== -1 && href.indexOf('style-granate') === -1;
      btn.setAttribute('aria-pressed', String(isBw));
      if(isBw) btn.classList.add('bw-on');
    }

    btn.addEventListener('click', function(){
      toggle();
    });
  });
})();

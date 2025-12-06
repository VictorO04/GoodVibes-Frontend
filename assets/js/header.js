// header.js
// Shared header helpers: set CSS --header-height and mark active nav link
(function(){
  function setHeaderHeight(){
    const header = document.querySelector('header');
    if(!header) return;
    const root = document.documentElement;
    function update(){
      root.style.setProperty('--header-height', header.clientHeight + 'px');
    }
    update();
    window.addEventListener('resize', update);
  }

  function markActiveNav(){
    try{
      const links = document.querySelectorAll('nav a.test, nav a');
      const path = location.pathname.split('/').pop();
      links.forEach(a => {
        const href = a.getAttribute('href') || '';
        if(!href) return;
        const target = href.split('/').pop();
        if(target === path){
          a.classList.add('active');
        }
      });
    }catch(e){/* ignore */}
  }

  // run on DOMContentLoaded
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => { setHeaderHeight(); markActiveNav(); });
  } else {
    setHeaderHeight(); markActiveNav();
  }
  // também sincroniza a foto de perfil salva (fotoPerfil) para qualquer avatar no header
  function syncHeaderAvatar(){
    try{
      const saved = localStorage.getItem('fotoPerfil');
      if(!saved) return;
      // seleciona imagens que normalmente representam o avatar no header
      const imgs = Array.from(document.querySelectorAll('img#headerAvatar, img#preview, a.img-header img'));
      imgs.forEach(img => {
        if(img && img.tagName === 'IMG') img.src = saved;
      });
    }catch(e){/* ignore */}
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => { syncHeaderAvatar(); });
  } else { syncHeaderAvatar(); }
})();

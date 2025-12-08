/* js/music.js
   Controla reproducción de música de fondo usando la IFrame API de YouTube.
   - Vídeo: id "jFHnQDV2_aM" (se reproduce mediante el iframe de YouTube)
   - El botón flotante con id `music-toggle` activa/desactiva reproducción.

   Nota: la reproducción no arrancará automáticamente en muchos navegadores; el usuario debe pulsar el botón.
*/

(function(){
  const VIDEO_ID = 'jFHnQDV2_aM';
  let player = null;
  let isReady = false;
  const toggle = () => document.getElementById('music-toggle');

  // Estado persistente
  const STORAGE_KEY = 'boda_music_playing';
  function savePlaying(v){ try{ localStorage.setItem(STORAGE_KEY, v ? '1' : '0'); }catch(e){} }
  function loadPlaying(){ try{ return localStorage.getItem(STORAGE_KEY) === '1'; }catch(e){ return false; } }

  // Crea el player cuando la API esté lista
  window.onYouTubeIframeAPIReady = function(){
    player = new YT.Player('yt-player', {
      height: '0',
      width: '0',
      videoId: VIDEO_ID,
      playerVars: {
        autoplay: 0,
        controls: 0,
        loop: 1,
        modestbranding: 1,
        rel: 0,
        playlist: VIDEO_ID
      },
      events: {
        onReady: function(e){
          isReady = true;
          // Opcional: ajustar volumen
          try{ player.setVolume(55); }catch(err){}
          // Intentar reproducir inmediatamente (autoplay). En muchos navegadores esto estará bloqueado
          // si no hay interacción del usuario; manejamos el rechazo comprobando el estado.
          try{
            player.playVideo();
          }catch(e){}

          // Tras un breve retardo comprobamos si está reproduciendo; si no, ponemos estado muted visual
          setTimeout(function(){
            try{
              var st = player.getPlayerState();
              if(st === YT.PlayerState.PLAYING){
                setButtonState(true);
                savePlaying(true);
              } else {
                // reproducción bloqueada por el navegador: mostrar botón en estado "muted" (necesita interacción)
                setButtonState(false);
                savePlaying(false);
              }
            }catch(err){
              setButtonState(false);
              savePlaying(false);
            }
          }, 700);
        },
        onStateChange: function(e){
          // Si finaliza (no ocurre con loop), actualizar estado
          if(e.data === YT.PlayerState.PAUSED){ setButtonState(false); savePlaying(false); }
          if(e.data === YT.PlayerState.PLAYING){ setButtonState(true); savePlaying(true); }
        }
      }
    });
  };

  // Crear contenedor del player (oculto)
  (function ensurePlayerDiv(){
    let el = document.getElementById('yt-player');
    if(!el){
      el = document.createElement('div');
      el.id = 'yt-player';
      el.style.display = 'none';
      document.body.appendChild(el);
    }
  })();

  function setButtonState(playing){
    const btn = toggle();
    if(!btn) return;
    btn.classList.toggle('music-on', !!playing);
    btn.classList.toggle('music-off', !playing);
    btn.setAttribute('aria-pressed', !!playing);
    btn.title = !!playing ? 'Pausar música' : 'Reproducir música';
  }

  function playMusic(){
    if(!player || !isReady){ setButtonState(true); savePlaying(true); return; }
    try{
      // intentar activar y desmutear
      player.unMute();
      player.setVolume(60);
      player.playVideo();
      setButtonState(true);
      savePlaying(true);
    }catch(e){
      // si falla, al menos actualizamos visual
      setButtonState(true);
      savePlaying(true);
    }
  }

  function pauseMusic(){
    if(player && isReady){ try{ player.pauseVideo(); player.mute(); }catch(e){} }
    setButtonState(false);
    savePlaying(false);
  }

  function toggleMusic(){
    const btn = toggle();
    if(!btn) return;
    const playing = btn.classList.contains('music-on');
    if(playing){ pauseMusic(); } else { playMusic(); }
  }

  // Button click binding
  document.addEventListener('DOMContentLoaded', function(){
    const btn = document.getElementById('music-toggle');
    if(!btn) return;
    btn.addEventListener('click', function(e){
      // user gesture: play/pause
      toggleMusic();
    });

    // establecer estado inicial visual según almacenamiento
    if(loadPlaying()) setButtonState(true);
  });

})();

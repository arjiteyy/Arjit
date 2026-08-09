/* ==========================================================================
   ROMANTIC ANTI-GRAVITY BIRTHDAY PAGE  –  index.js  v=20260810
   Fixes:
     1. Cross-device YouTube autoplay (muted start → unmute on gesture)
     2. Prominent "Tap to Play Music" overlay button on every device
     3. Desktop auto-unmute attempt after a short delay
     4. iPhone / Android tap-to-play fallback
     5. Console logs for easy debugging
     6. Full error handling
   ========================================================================== */

console.log('[Birthday] 🎉 index.js v20260810 loaded');

/* --------------------------------------------------------------------------
   CONSTANTS & STATE
   -------------------------------------------------------------------------- */
const YOUTUBE_VIDEO_ID  = 'T36r-O5k8Tc';
const VERSION_TAG       = 'v20260810';   // bump this with every deploy

let youtubePlayer       = null;
let musicStarted        = false;         // true once the user has played once
let autoUnmuteTimer     = null;
let retryInterval       = null;

/* Detect mobile/tablet (iOS Safari is the most restrictive) */
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isIOS    = /iPhone|iPad|iPod/i.test(navigator.userAgent);

console.log(`[Birthday] Device – mobile: ${isMobile}, iOS: ${isIOS}`);

/* ==========================================================================
   INIT – runs after DOM is ready
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Birthday] DOMContentLoaded');
  initSpaceCanvas();
  updateTapButton(false);

  // If the YouTube API script has already loaded and called onYouTubeIframeAPIReady,
  // window.YT.Player is available immediately.
  if (window.YT && window.YT.Player) {
    console.log('[Birthday] YT API already ready at DOMContentLoaded');
    createYouTubePlayer();
  }
});

/* ==========================================================================
   1. YOUTUBE IFRAME API
   ========================================================================== */

/** Called by the YouTube API script once it has fully loaded. */
window.onYouTubeIframeAPIReady = function () {
  console.log('[Birthday] onYouTubeIframeAPIReady fired');
  createYouTubePlayer();
};

function createYouTubePlayer() {
  if (youtubePlayer) {
    console.log('[Birthday] Player already created – skipping');
    return;
  }
  if (!document.getElementById('yt-player')) {
    console.warn('[Birthday] #yt-player element not found');
    return;
  }

  console.log('[Birthday] Creating YT.Player…');

  youtubePlayer = new YT.Player('yt-player', {
    videoId: YOUTUBE_VIDEO_ID,
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay:        1,   // request autoplay (browsers may block audible)
      mute:            1,   // start MUTED – this is the key to bypassing block
      loop:            1,
      playlist:        YOUTUBE_VIDEO_ID,
      enablejsapi:     1,
      controls:        1,
      playsinline:     1,   // critical for iOS inline play (no full-screen forced)
      modestbranding:  1,
      rel:             0,
      origin:          window.location.origin || '*'
    },
    events: {
      onReady:       onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError:       onPlayerError
    }
  });
}

function onPlayerReady(event) {
  console.log('[Birthday] Player ready. Attempting muted autoplay…');
  try {
    event.target.mute();
    event.target.playVideo();
    console.log('[Birthday] Muted playVideo() called successfully');
  } catch (err) {
    console.error('[Birthday] playVideo() failed:', err);
  }

  // ── Desktop strategy: attempt to unmute after 1.5 s ──────────────────────
  // Browsers allow unmuting if there has been any user interaction with the
  // document (e.g. scroll, click, key press) after the page loads.
  if (!isMobile) {
    autoUnmuteTimer = setTimeout(() => {
      tryUnmute('desktop-auto-timer');
    }, 1500);
  }

  // ── Retry loop: keep trying to play if the player stops ──────────────────
  retryInterval = setInterval(() => {
    if (!youtubePlayer) return;
    let state = -99;
    try { state = youtubePlayer.getPlayerState(); } catch (e) { return; }
    console.log(`[Birthday] Retry-check – player state: ${state}`);
    if (state !== YT.PlayerState.PLAYING) {
      try {
        youtubePlayer.playVideo();
      } catch (_) { /* ignore */ }
    }
  }, 3000);
}

function onPlayerStateChange(event) {
  const stateName = {
    '-1': 'UNSTARTED',
    '0':  'ENDED',
    '1':  'PLAYING',
    '2':  'PAUSED',
    '3':  'BUFFERING',
    '5':  'CUED'
  }[String(event.data)] || event.data;
  console.log(`[Birthday] Player state changed → ${stateName}`);

  if (event.data === YT.PlayerState.PLAYING) {
    const isMuted = youtubePlayer.isMuted();
    console.log(`[Birthday] Playing – muted: ${isMuted}`);
    if (!isMuted) {
      musicStarted = true;
      updateAudioUi(true);
    } else {
      // Still muted but playing – update UI to show "tap to unmute"
      updateAudioUi(false, true);
    }
  }

  if (
    event.data === YT.PlayerState.PAUSED  ||
    event.data === YT.PlayerState.ENDED   ||
    event.data === YT.PlayerState.CUED
  ) {
    if (event.data !== YT.PlayerState.PAUSED || !musicStarted) {
      // Auto-restart if not deliberately paused
      try { youtubePlayer.playVideo(); } catch (_) {}
    }
  }
}

function onPlayerError(event) {
  console.error('[Birthday] YouTube player error:', event.data);
  // Error codes: 2=invalid param, 5=HTML5 error, 100=not found, 101/150=embed blocked
  // Retry after a few seconds
  setTimeout(() => {
    if (youtubePlayer) {
      try { youtubePlayer.playVideo(); } catch (_) {}
    }
  }, 4000);
}

/* --------------------------------------------------------------------------
   UNMUTE HELPER – call from any user-gesture handler
   -------------------------------------------------------------------------- */
function tryUnmute(source) {
  if (!youtubePlayer) {
    console.log(`[Birthday] tryUnmute(${source}) – player not ready yet`);
    return false;
  }
  try {
    const state = youtubePlayer.getPlayerState();
    if (state !== YT.PlayerState.PLAYING) {
      youtubePlayer.playVideo();
    }
    youtubePlayer.unMute();
    youtubePlayer.setVolume(80);
    musicStarted = true;
    console.log(`[Birthday] ✅ Unmuted successfully via: ${source}`);
    updateAudioUi(true);
    return true;
  } catch (err) {
    console.error(`[Birthday] tryUnmute(${source}) failed:`, err);
    return false;
  }
}

/* --------------------------------------------------------------------------
   PUBLIC – called by the "Tap to Play Music" button and hero button
   -------------------------------------------------------------------------- */
function handleTapToPlay() {
  console.log('[Birthday] handleTapToPlay() – user gesture');

  if (!youtubePlayer) {
    console.log('[Birthday] Player not ready, will retry in 500 ms');
    setTimeout(handleTapToPlay, 500);
    return;
  }

  let state = -99;
  try { state = youtubePlayer.getPlayerState(); } catch (_) {}

  if (state === YT.PlayerState.PLAYING && !youtubePlayer.isMuted()) {
    // Music is already playing with sound → pause it
    pauseMusic();
  } else if (state === YT.PlayerState.PLAYING && youtubePlayer.isMuted()) {
    // Playing but muted → unmute
    tryUnmute('tap-button-unmute');
  } else {
    // Not playing → start with sound
    try {
      youtubePlayer.playVideo();
      setTimeout(() => tryUnmute('tap-button-play'), 300);
    } catch (err) {
      console.error('[Birthday] Could not start playback:', err);
    }
  }
}

function pauseMusic() {
  if (!youtubePlayer) return;
  try {
    youtubePlayer.pauseVideo();
    musicStarted = false;
    updateAudioUi(false);
    console.log('[Birthday] Music paused');
  } catch (err) {
    console.error('[Birthday] pauseMusic failed:', err);
  }
}

function toggleAudioState() {
  console.log('[Birthday] toggleAudioState()');
  handleTapToPlay();
}

/* --------------------------------------------------------------------------
   UI UPDATE
   -------------------------------------------------------------------------- */
function updateAudioUi(isPlaying, isMutedPlaying) {
  // "Tap to Play Music" overlay button
  const tapBtn  = document.getElementById('tapToPlayBtn');
  const tapIcon = document.getElementById('tapToPlayIcon');
  const tapText = document.getElementById('tapToPlayText');
  const tapHint = document.getElementById('tapToPlayHint');

  if (tapBtn) {
    if (isPlaying) {
      tapBtn.classList.add('music-playing');
      if (tapIcon) tapIcon.textContent = '🔊';
      if (tapText) tapText.textContent = 'Music Playing';
      if (tapHint) tapHint.textContent = 'Tap to pause';
    } else if (isMutedPlaying) {
      tapBtn.classList.remove('music-playing');
      if (tapIcon) tapIcon.textContent = '🔇';
      if (tapText) tapText.textContent = 'Tap to Unmute';
      if (tapHint) tapHint.textContent = 'Timi Sadhai Bhari 💖';
    } else {
      tapBtn.classList.remove('music-playing');
      if (tapIcon) tapIcon.textContent = '🎵';
      if (tapText) tapText.textContent = 'Tap to Play Music';
      if (tapHint) tapHint.textContent = 'Timi Sadhai Bhari 💖';
    }
  }

  // Top control bar
  const toggleBtn = document.getElementById('musicToggleBtn');
  const statusTxt = document.getElementById('musicStatusText');
  const heroBtn   = document.getElementById('heroPlayBtnText');
  const bannerTxt = document.getElementById('bannerPlayText');
  const volStatus = document.getElementById('volumeStatus');

  if (toggleBtn)  toggleBtn.classList.toggle('playing', isPlaying);
  if (statusTxt)  statusTxt.textContent  = isPlaying ? 'Timi Sadhai Bhari 💖 (Playing)' : isMutedPlaying ? '🔇 Tap to Unmute' : 'Tap to Play';
  if (heroBtn)    heroBtn.textContent    = isPlaying ? 'Soundtrack Playing 🎶'           : 'Play Soundtrack 🎶';
  if (bannerTxt)  bannerTxt.textContent  = isPlaying ? 'Pause Soundtrack'                : 'Play Soundtrack';
  if (volStatus)  volStatus.innerHTML    = isPlaying
    ? '<span>🔊 Soundtrack Active</span>'
    : isMutedPlaying
      ? '<span>🔇 Tap button above to unmute</span>'
      : '<span>🎵 Press Play to Start</span>';
}

function updateTapButton(isPlaying) {
  updateAudioUi(isPlaying);
}

/* --------------------------------------------------------------------------
   PASSIVE USER-GESTURE LISTENERS
   Any scroll, click or key-down counts as a gesture and lets us unmute
   on desktop browsers automatically.
   -------------------------------------------------------------------------- */
const gestureEvents = ['click', 'touchstart', 'keydown', 'scroll', 'touchend'];
let gestureListenersActive = true;

function onAnyGesture(e) {
  // Skip if the gesture is on the play button itself (handled separately)
  if (e.target && e.target.closest && e.target.closest('#tapToPlayOverlay')) return;

  if (!isMobile && youtubePlayer && !musicStarted) {
    console.log('[Birthday] Passive gesture detected on desktop – attempting unmute');
    tryUnmute('passive-gesture');
  }

  // Once music has started, we can remove these listeners
  if (musicStarted && gestureListenersActive) {
    gestureListenersActive = false;
    gestureEvents.forEach(ev => document.removeEventListener(ev, onAnyGesture, { passive: true }));
    console.log('[Birthday] Gesture listeners removed');
  }
}

gestureEvents.forEach(ev =>
  document.addEventListener(ev, onAnyGesture, { passive: true })
);

/* ==========================================================================
   2. SPACE CANVAS PARTICLE ENGINE & FLOATING HEARTS
   ========================================================================== */
let canvas, ctx;
let width, height;
const particleCount = window.innerWidth < 600 ? 70 : 120;
const particles = [];
const hearts    = [];
const mouse     = { x: -1000, y: -1000, radius: 150 };

function initSpaceCanvas() {
  canvas = document.getElementById('space-canvas');
  if (!canvas) { console.warn('[Birthday] #space-canvas not found'); return; }
  ctx = canvas.getContext('2d');

  width  = canvas.width  = window.innerWidth;
  height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (Math.random() < 0.25) {
      particles.push(new Particle(e.clientX, e.clientY, true));
    }
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  });

  window.addEventListener('click', (e) => {
    if (e.target.closest('button, a, input, video, .polaroid-card')) return;
    const heartCount = window.innerWidth < 600 ? 3 : 6;
    for (let i = 0; i < heartCount; i++) {
      hearts.push(new FloatingHeart(e.clientX, e.clientY));
    }
  });

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  requestAnimationFrame(animateSpaceCanvas);
  console.log('[Birthday] Space canvas initialised');
}

class Particle {
  constructor(x, y, isTemporary = false) {
    this.x = x || Math.random() * width;
    this.y = y || Math.random() * height;
    this.size = Math.random() * 2.2 + 0.6;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(Math.random() * 0.5 + 0.2);
    this.alpha = Math.random() * 0.7 + 0.3;
    this.color = Math.random() < 0.6 ? '#ff7eb3' : (Math.random() < 0.8 ? '#c084fc' : '#fbbf24');
    this.pulseSpeed = Math.random() * 0.03 + 0.01;
    this.isTemporary = isTemporary;
    this.life = 100;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha += Math.sin(Date.now() * this.pulseSpeed * 0.05) * 0.01;
    if (this.alpha < 0.1) this.alpha = 0.1;
    if (this.alpha > 0.9) this.alpha = 0.9;

    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < mouse.radius) {
      const force = (mouse.radius - dist) / mouse.radius;
      const angle = Math.atan2(dy, dx);
      this.x -= Math.cos(angle) * force * 3;
      this.y -= Math.sin(angle) * force * 3;
    }

    if (this.y < -10)         this.y = height + 10;
    if (this.x < -10)         this.x = width + 10;
    if (this.x > width + 10)  this.x = -10;
    if (this.isTemporary)     this.life -= 1.2;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha * (this.isTemporary ? this.life / 100 : 1);
    ctx.fillStyle   = this.color;
    ctx.shadowBlur  = 8;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class FloatingHeart {
  constructor(x, y) {
    this.x        = x;
    this.y        = y;
    this.size     = Math.random() * 14 + 10;
    this.vx       = (Math.random() - 0.5) * 2;
    this.vy       = -(Math.random() * 2 + 1.5);
    this.alpha    = 1;
    this.rotation = (Math.random() - 0.5) * 0.4;
    this.life     = 100;
    this.color    = Math.random() < 0.5 ? '#ff7eb3' : '#c084fc';
  }

  update() {
    this.x    += this.vx;
    this.y    += this.vy;
    this.life -= 1.2;
    this.alpha = Math.max(0, this.life / 100);
  }

  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle   = this.color;
    ctx.shadowBlur  = 12;
    ctx.shadowColor = this.color;
    ctx.font        = `${this.size}px serif`;
    ctx.fillText('❤️', 0, 0);
    ctx.restore();
  }
}

function animateSpaceCanvas() {
  ctx.clearRect(0, 0, width, height);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw();
    if (p.isTemporary && p.life <= 0) particles.splice(i, 1);
  }

  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    h.update();
    h.draw();
    if (h.life <= 0) hearts.splice(i, 1);
  }

  requestAnimationFrame(animateSpaceCanvas);
}

/* ==========================================================================
   3. CANDLE BLOW OUT & LIGHTBOX
   ========================================================================== */
function blowCandle() {
  const flame      = document.getElementById('candleFlame');
  const wishResult = document.getElementById('wishResult');

  if (flame)      flame.classList.add('extinguished');
  if (wishResult) wishResult.classList.add('active');

  const cakeWidget = document.getElementById('cakeWidget');
  if (cakeWidget) {
    const rect    = cakeWidget.getBoundingClientRect();
    const centerX = rect.left + rect.width  / 2;
    const centerY = rect.top  + rect.height / 2;
    for (let i = 0; i < 35; i++) {
      hearts.push(new FloatingHeart(centerX, centerY));
    }
  }
}

function revealReason(cardElement, title, secretNote) {
  const titleElem = cardElement.querySelector('.reason-title');
  const descElem  = cardElement.querySelector('.reason-desc');

  if (titleElem) titleElem.textContent = title;
  if (descElem) {
    descElem.textContent  = secretNote;
    descElem.style.color  = '#ff7eb3';
  }
  cardElement.style.borderColor = 'var(--primary-pink)';

  const rect = cardElement.getBoundingClientRect();
  for (let i = 0; i < 6; i++) {
    hearts.push(new FloatingHeart(rect.left + rect.width / 2, rect.top + rect.height / 2));
  }
}

function openLightbox(imgSrc, captionText) {
  const modal   = document.getElementById('lightboxModal');
  const img     = document.getElementById('modalImg');
  const caption = document.getElementById('modalCaption');

  if (img)     img.src           = imgSrc;
  if (caption) caption.textContent = captionText;
  if (modal)   modal.classList.add('active');
}

function closeLightbox(event) {
  const modal = document.getElementById('lightboxModal');
  if (modal) modal.classList.remove('active');
}

console.log('[Birthday] Script fully parsed – waiting for YT API callback');

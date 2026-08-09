/* ==========================================================================
   ROMANTIC ANTI-GRAVITY BIRTHDAY PAGE  –  index.js  v=20260810b
   ── YouTube completely removed ──
   ── Replaced with HTML5 <audio> engine ──
   Works on: iPhone Safari, Android Chrome, Windows Chrome/Edge/Firefox, macOS Safari
   ========================================================================== */

console.log('[Birthday] 🎉 index.js v20260810b loaded — HTML5 Audio edition');

/* --------------------------------------------------------------------------
   AUDIO STATE
   -------------------------------------------------------------------------- */
let audio        = null;   // HTMLAudioElement  (#bgAudio)
let isPlaying    = false;
let progressTimer = null;

/* --------------------------------------------------------------------------
   INIT
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  console.log('[Birthday] DOMContentLoaded');
  audio = document.getElementById('bgAudio');
  initAudioEngine();
  initSpaceCanvas();
});

/* ==========================================================================
   1. HTML5 AUDIO ENGINE
   ========================================================================== */
function initAudioEngine() {
  if (!audio) {
    console.warn('[Birthday] #bgAudio element not found');
    return;
  }

  audio.volume = 0.85;
  audio.loop   = true;

  /* ── Event listeners ── */
  audio.addEventListener('play',   () => { isPlaying = true;  updateMusicUI(true);  startProgressTimer(); });
  audio.addEventListener('pause',  () => { isPlaying = false; updateMusicUI(false); stopProgressTimer();  });
  audio.addEventListener('ended',  () => { isPlaying = false; updateMusicUI(false); });
  audio.addEventListener('error',  onAudioError);
  audio.addEventListener('canplaythrough', () => {
    console.log('[Birthday] Audio can play through — ready');
    updateSubtitle('Ready • Tap ▶ to play');
  });
  audio.addEventListener('waiting', () => updateSubtitle('Buffering…'));
  audio.addEventListener('playing', () => updateSubtitle('Now playing 🎵'));

  /* ── Desktop: attempt autoplay (muted first, then unmute) ── */
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (!isMobile) {
    console.log('[Birthday] Desktop detected — attempting muted autoplay');
    audio.muted = true;
    const ap = audio.play();
    if (ap !== undefined) {
      ap.then(() => {
        // Muted autoplay worked — unmute after 800 ms
        setTimeout(() => {
          audio.muted = false;
          console.log('[Birthday] Desktop autoplay unmuted ✅');
        }, 800);
      }).catch(err => {
        console.log('[Birthday] Desktop autoplay blocked, waiting for user tap:', err.message);
        audio.muted = false;
      });
    }
  } else {
    console.log('[Birthday] Mobile detected — waiting for user tap');
  }

  /* ── Any user gesture on the page will try to start audio ── */
  const gestureStart = () => {
    if (!isPlaying && audio.paused) {
      console.log('[Birthday] Gesture detected — attempting to play');
      audio.muted = false;
      audio.play().catch(e => console.log('[Birthday] Play on gesture failed:', e.message));
    }
    // Once started, remove the broad listeners (keep only intentional button taps)
    if (isPlaying) {
      document.removeEventListener('touchstart', gestureStart);
      document.removeEventListener('click',      gestureStart);
    }
  };
  document.addEventListener('touchstart', gestureStart, { passive: true });
  document.addEventListener('click',      gestureStart,  { passive: true });

  console.log('[Birthday] Audio engine ready');
}

/* ── Called by play/pause button and top controls ── */
function toggleAudio() {
  if (!audio) return;
  console.log(`[Birthday] toggleAudio — paused: ${audio.paused}`);
  if (audio.paused) {
    audio.muted = false;
    audio.play().catch(err => {
      console.error('[Birthday] play() failed:', err.message);
      updateSubtitle('Could not play — try again');
    });
  } else {
    audio.pause();
  }
}

/* Keep the legacy name so other buttons calling toggleAudioState() still work */
function toggleAudioState() { toggleAudio(); }

/* ── Progress bar ── */
function startProgressTimer() {
  stopProgressTimer();
  progressTimer = setInterval(() => {
    if (!audio || audio.duration === 0 || isNaN(audio.duration)) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    const bar = document.getElementById('musicProgressBar');
    if (bar) bar.style.width = pct + '%';
  }, 500);
}
function stopProgressTimer() {
  if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
}

/* ── Error handler ── */
function onAudioError(e) {
  const code = audio.error ? audio.error.code : '?';
  console.error(`[Birthday] Audio error code ${code}`, e);
  const msgs = {
    1: 'Aborted',
    2: 'Network error — check your connection',
    3: 'Decode error — file may be corrupted',
    4: 'music.mp3 not found — please upload your MP3 file'
  };
  const msg = msgs[code] || 'Unknown audio error';
  updateSubtitle('⚠️ ' + msg);
  updateMusicUI(false);
}

/* ── Update all UI elements ── */
function updateMusicUI(playing) {
  isPlaying = playing;

  /* Widget play/pause button */
  const btn  = document.getElementById('musicPlayPauseBtn');
  const disc = document.getElementById('musicDisc');
  const hint = document.getElementById('musicHint');

  if (btn) {
    btn.textContent = playing ? '⏸' : '▶';
    btn.classList.toggle('playing', playing);
  }
  if (disc) disc.classList.toggle('spinning', playing);
  if (hint) hint.classList.toggle('hidden', playing);

  /* Top bar */
  const topBtn    = document.getElementById('musicToggleBtn');
  const statusTxt = document.getElementById('musicStatusText');
  const heroBtn   = document.getElementById('heroPlayBtnText');

  if (topBtn)    topBtn.classList.toggle('playing', playing);
  if (statusTxt) statusTxt.textContent = playing ? 'Timi Sadhai Bhari 💖 (Playing)' : 'Tap to Play';
  if (heroBtn)   heroBtn.textContent   = playing ? '🔊 Soundtrack Playing' : '🎵 Play Soundtrack';
}

function updateSubtitle(text) {
  const el = document.getElementById('musicSubtitle');
  if (el) el.textContent = text;
}

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
  if (!canvas) return;
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
    if (Math.random() < 0.25) particles.push(new Particle(e.clientX, e.clientY, true));
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('click', (e) => {
    if (e.target.closest('button, a, input, video, .polaroid-card, #musicWidget')) return;
    const n = window.innerWidth < 600 ? 3 : 6;
    for (let i = 0; i < n; i++) hearts.push(new FloatingHeart(e.clientX, e.clientY));
  });

  for (let i = 0; i < particleCount; i++) particles.push(new Particle());
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
    const dx = mouse.x - this.x, dy = mouse.y - this.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < mouse.radius) {
      const force = (mouse.radius - dist) / mouse.radius;
      const angle = Math.atan2(dy, dx);
      this.x -= Math.cos(angle) * force * 3;
      this.y -= Math.sin(angle) * force * 3;
    }
    if (this.y < -10)        this.y = height + 10;
    if (this.x < -10)        this.x = width  + 10;
    if (this.x > width + 10) this.x = -10;
    if (this.isTemporary)    this.life -= 1.2;
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
    this.x = x; this.y = y;
    this.size = Math.random() * 14 + 10;
    this.vx   = (Math.random() - 0.5) * 2;
    this.vy   = -(Math.random() * 2 + 1.5);
    this.alpha    = 1;
    this.rotation = (Math.random() - 0.5) * 0.4;
    this.life  = 100;
    this.color = Math.random() < 0.5 ? '#ff7eb3' : '#c084fc';
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life  -= 1.2;
    this.alpha  = Math.max(0, this.life / 100);
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
    p.update(); p.draw();
    if (p.isTemporary && p.life <= 0) particles.splice(i, 1);
  }
  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    h.update(); h.draw();
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
    const rect = cakeWidget.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    for (let i = 0; i < 35; i++) hearts.push(new FloatingHeart(cx, cy));
  }
}

function revealReason(card, title, note) {
  const t = card.querySelector('.reason-title');
  const d = card.querySelector('.reason-desc');
  if (t) t.textContent = title;
  if (d) { d.textContent = note; d.style.color = '#ff7eb3'; }
  card.style.borderColor = 'var(--primary-pink)';
  const r = card.getBoundingClientRect();
  for (let i = 0; i < 6; i++) hearts.push(new FloatingHeart(r.left + r.width/2, r.top + r.height/2));
}

function openLightbox(imgSrc, captionText) {
  const modal   = document.getElementById('lightboxModal');
  const img     = document.getElementById('modalImg');
  const caption = document.getElementById('modalCaption');
  if (img)     img.src              = imgSrc;
  if (caption) caption.textContent  = captionText;
  if (modal)   modal.classList.add('active');
}

function closeLightbox(event) {
  const modal = document.getElementById('lightboxModal');
  if (modal) modal.classList.remove('active');
}

console.log('[Birthday] Script ready ✅');

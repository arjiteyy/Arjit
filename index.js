/* ========================================================================== 
   ROMANTIC ANTI-GRAVITY BIRTHDAY PAGE JAVASCRIPT
   ========================================================================== */

let youtubePlayer;
let youtubeRetryTimer;
const YOUTUBE_VIDEO_ID = 'T36r-O5k8Tc';

document.addEventListener('DOMContentLoaded', () => {
  initSpaceCanvas();
  initYouTubeAutoplay();
});

/* ==========================================================================
   1. YOUTUBE IFRAME API AUTOPLAY ENGINE

   Browsers permit muted autoplay, but no JavaScript can guarantee audible
   autoplay without a user gesture. We start muted, then request sound as
   quickly and repeatedly as the browser allows.
   ========================================================================== */
function initYouTubeAutoplay() {
  const attempt = () => {
    if (!youtubePlayer || typeof youtubePlayer.playVideo !== 'function') return;

    try {
      youtubePlayer.playVideo();
      youtubePlayer.unMute();
      youtubePlayer.setVolume(100);
      sessionStorage.setItem('birthday-youtube-autoplay-attempted', 'true');
      updateAudioUi(true);
    } catch (error) {
      console.info('YouTube autoplay will retry:', error);
    }
  };

  window.youtubeAutoplayAttempt = attempt;
  window.addEventListener('load', attempt);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) attempt();
  });

  youtubeRetryTimer = window.setInterval(() => {
    if (!youtubePlayer) return;
    let state = -1;
    try { state = youtubePlayer.getPlayerState(); } catch (_) { return; }
    if (state !== YT.PlayerState.PLAYING) attempt();
  }, 1500);

  if (window.YT && window.YT.Player) createYouTubePlayer();
}

function createYouTubePlayer() {
  if (youtubePlayer || !document.getElementById('yt-player')) return;

  youtubePlayer = new YT.Player('yt-player', {
    videoId: YOUTUBE_VIDEO_ID,
    playerVars: {
      autoplay: 1,
      mute: 1,
      loop: 1,
      playlist: YOUTUBE_VIDEO_ID,
      enablejsapi: 1,
      controls: 1,
      playsinline: 1,
      modestbranding: 1,
      rel: 0
    },
    events: {
      onReady: (event) => {
        event.target.mute();
        event.target.playVideo();
        // Unmute immediately after the allowed muted start.
        event.target.unMute();
        event.target.setVolume(100);
        sessionStorage.setItem('birthday-youtube-autoplay-attempted', 'true');
        updateAudioUi(true);
        if (window.youtubeAutoplayAttempt) window.youtubeAutoplayAttempt();
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.PLAYING) updateAudioUi(true);
        if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.CUED || event.data === YT.PlayerState.ENDED) {
          if (window.youtubeAutoplayAttempt) window.youtubeAutoplayAttempt();
        }
      },
      onError: () => {
        if (window.youtubeAutoplayAttempt) window.youtubeAutoplayAttempt();
      }
    }
  });
}

window.onYouTubeIframeAPIReady = createYouTubePlayer;

function toggleAudioState() {
  if (!youtubePlayer) return;
  const state = youtubePlayer.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    youtubePlayer.pauseVideo();
    updateAudioUi(false);
  } else {
    youtubePlayer.unMute();
    youtubePlayer.setVolume(100);
    youtubePlayer.playVideo();
    updateAudioUi(true);
  }
}

function updateAudioUi(isPlaying) {
  const button = document.getElementById('musicToggleBtn');
  const status = document.getElementById('musicStatusText');
  const heroText = document.getElementById('heroPlayBtnText');
  const bannerText = document.getElementById('bannerPlayText');
  const volume = document.getElementById('volumeStatus');
  if (button) button.classList.toggle('playing', isPlaying);
  if (status) status.textContent = isPlaying ? 'Timi Sadhai Bhari 💖 (Playing)' : 'Soundtrack Paused';
  if (heroText) heroText.textContent = isPlaying ? 'Soundtrack Playing 🎶' : 'Play Soundtrack 🎶';
  if (bannerText) bannerText.textContent = isPlaying ? 'Pause Soundtrack' : 'Play Soundtrack';
  if (volume) volume.innerHTML = isPlaying ? '<span>🔊 Soundtrack Active</span>' : '<span>🔇 Soundtrack Paused</span>';
}

// The API may already be available when this script runs.
if (window.YT && window.YT.Player) createYouTubePlayer();

/* ==========================================================================
   2. SPACE CANVAS PARTICLE ENGINE & FLOATING HEARTS
   ========================================================================== */
let canvas, ctx;
let width, height;
const particleCount = window.innerWidth < 600 ? 70 : 120;
const particles = [];
const hearts = [];
const mouse = { x: -1000, y: -1000, radius: 150 };

function initSpaceCanvas() {
  canvas = document.getElementById('space-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
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

    if (this.y < -10) this.y = height + 10;
    if (this.x < -10) this.x = width + 10;
    if (this.x > width + 10) this.x = -10;

    if (this.isTemporary) {
      this.life -= 1.2;
    }
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha * (this.isTemporary ? this.life / 100 : 1);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class FloatingHeart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 14 + 10;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = -(Math.random() * 2 + 1.5);
    this.alpha = 1;
    this.rotation = (Math.random() - 0.5) * 0.4;
    this.life = 100;
    this.color = Math.random() < 0.5 ? '#ff7eb3' : '#c084fc';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 1.2;
    this.alpha = Math.max(0, this.life / 100);
  }

  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.font = `${this.size}px serif`;
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
    if (p.isTemporary && p.life <= 0) {
      particles.splice(i, 1);
    }
  }

  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    h.update();
    h.draw();
    if (h.life <= 0) {
      hearts.splice(i, 1);
    }
  }

  requestAnimationFrame(animateSpaceCanvas);
}

/* ==========================================================================
   3. CANDLE BLOW OUT & LIGHTBOX
   ========================================================================== */
function blowCandle() {
  const flame = document.getElementById('candleFlame');
  const wishResult = document.getElementById('wishResult');

  if (flame) flame.classList.add('extinguished');
  if (wishResult) wishResult.classList.add('active');

  const cakeWidget = document.getElementById('cakeWidget');
  if (cakeWidget) {
    const rect = cakeWidget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 35; i++) {
      hearts.push(new FloatingHeart(centerX, centerY));
    }
  }
}

function revealReason(cardElement, title, secretNote) {
  const titleElem = cardElement.querySelector('.reason-title');
  const descElem = cardElement.querySelector('.reason-desc');

  if (titleElem) titleElem.textContent = title;
  if (descElem) {
    descElem.textContent = secretNote;
    descElem.style.color = '#ff7eb3';
  }
  cardElement.style.borderColor = 'var(--primary-pink)';

  const rect = cardElement.getBoundingClientRect();
  for (let i = 0; i < 6; i++) {
    hearts.push(new FloatingHeart(rect.left + rect.width / 2, rect.top + rect.height / 2));
  }
}

function openLightbox(imgSrc, captionText) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('modalImg');
  const caption = document.getElementById('modalCaption');

  if (img) img.src = imgSrc;
  if (caption) caption.textContent = captionText;
  if (modal) modal.classList.add('active');
}

function closeLightbox(event) {
  const modal = document.getElementById('lightboxModal');
  if (modal) modal.classList.remove('active');
}

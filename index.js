/* ========================================================================== 
   ROMANTIC ANTI-GRAVITY BIRTHDAY PAGE JAVASCRIPT
   ========================================================================== */

let youtubePlayer;
let youtubeRetryTimer;
let isUserInteracted = false;
let isMobile = false;
const YOUTUBE_VIDEO_ID = 'T36r-O5k8Tc';

document.addEventListener('DOMContentLoaded', () => {
  // Check if mobile device
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  initSpaceCanvas();
  initYouTubeAutoplay();
  
  // Listen for any user interaction to enable audio
  document.addEventListener('click', handleUserInteraction);
  document.addEventListener('touchstart', handleUserInteraction);
  document.addEventListener('keydown', handleUserInteraction);
});

function handleUserInteraction() {
  if (!isUserInteracted) {
    isUserInteracted = true;
    if (youtubePlayer) {
      try {
        youtubePlayer.unMute();
        youtubePlayer.setVolume(100);
        youtubePlayer.playVideo();
        updateAudioUi(true);
        // Hide the overlay when user interacts
        hideMobileOverlay();
      } catch (error) {
        console.info('User interaction triggered autoplay attempt:', error);
      }
    }
  }
}

/* ==========================================================================
   1. YOUTUBE IFRAME API AUTOPLAY ENGINE - UPDATED FOR ALL DEVICES
   ========================================================================== */
function initYouTubeAutoplay() {
  // Create visible play button for mobile devices
  createMobilePlayOverlay();
  
  const attempt = () => {
    if (!youtubePlayer || typeof youtubePlayer.playVideo !== 'function') return;

    try {
      youtubePlayer.playVideo();
      // Don't unmute immediately - let user interaction handle it
      if (isUserInteracted) {
        youtubePlayer.unMute();
        youtubePlayer.setVolume(100);
      }
      sessionStorage.setItem('birthday-youtube-autoplay-attempted', 'true');
      updateAudioUi(isUserInteracted);
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
    if (state !== YT.PlayerState.PLAYING && isUserInteracted) {
      attempt();
    }
  }, 1500);

  if (window.YT && window.YT.Player) createYouTubePlayer();
}

function createMobilePlayOverlay() {
  // Remove existing overlay if any
  const existingOverlay = document.getElementById('mobilePlayOverlay');
  if (existingOverlay) existingOverlay.remove();
  
  // Create overlay for both mobile and desktop
  const overlay = document.createElement('div');
  overlay.id = 'mobilePlayOverlay';
  overlay.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: linear-gradient(135deg, rgba(255, 126, 179, 0.95), rgba(192, 132, 252, 0.95));
    color: white;
    padding: 18px 30px;
    border-radius: 50px;
    font-family: 'Georgia', serif;
    font-size: ${isMobile ? '18px' : '16px'};
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 8px 32px rgba(255, 126, 179, 0.5);
    animation: pulseGlow 2s infinite;
    border: 2px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    text-align: center;
    max-width: 90%;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
  `;
  
  // Different text for mobile vs desktop
  if (isMobile) {
    overlay.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
        <span style="font-size: 28px;">🎵</span>
        <div>
          <div style="font-size: 20px; margin-bottom: 4px;">Tap to Play Music</div>
          <div style="font-size: 12px; opacity: 0.8; font-weight: normal;">🎶 Romantic Birthday Song</div>
        </div>
      </div>
    `;
  } else {
    overlay.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
        <span style="font-size: 24px;">🎵</span>
        <div>
          <div style="font-size: 18px; margin-bottom: 2px;">Click to Play Music</div>
          <div style="font-size: 12px; opacity: 0.8; font-weight: normal;">🎶 Romantic Birthday Song</div>
        </div>
      </div>
    `;
  }
  
  // Hover effects
  overlay.addEventListener('mouseenter', () => {
    overlay.style.transform = 'translateX(-50%) scale(1.05)';
    overlay.style.boxShadow = '0 12px 40px rgba(255, 126, 179, 0.7)';
  });
  
  overlay.addEventListener('mouseleave', () => {
    overlay.style.transform = 'translateX(-50%) scale(1)';
    overlay.style.boxShadow = '0 8px 32px rgba(255, 126, 179, 0.5)';
  });
  
  // Click handler
  overlay.addEventListener('click', function(e) {
    e.stopPropagation();
    if (youtubePlayer) {
      youtubePlayer.unMute();
      youtubePlayer.setVolume(100);
      youtubePlayer.playVideo();
      updateAudioUi(true);
      isUserInteracted = true;
      this.style.display = 'none';
      
      // Show success feedback
      showToastNotification('🎵 Music is now playing!', 'success');
    } else {
      showToastNotification('⏳ Loading music player...', 'info');
      // Retry after a moment
      setTimeout(() => {
        if (youtubePlayer) {
          youtubePlayer.unMute();
          youtubePlayer.setVolume(100);
          youtubePlayer.playVideo();
          updateAudioUi(true);
          isUserInteracted = true;
          this.style.display = 'none';
          showToastNotification('🎵 Music is now playing!', 'success');
        }
      }, 1000);
    }
  });
  
  document.body.appendChild(overlay);
  
  // Add pulse animation
  const style = document.createElement('style');
  style.id = 'pulseStyle';
  if (!document.getElementById('pulseStyle')) {
    style.textContent = `
      @keyframes pulseGlow {
        0%, 100% { 
          transform: translateX(-50%) scale(1);
          box-shadow: 0 8px 32px rgba(255, 126, 179, 0.5);
        }
        50% { 
          transform: translateX(-50%) scale(1.03);
          box-shadow: 0 12px 48px rgba(255, 126, 179, 0.8);
        }
      }
      
      @keyframes slideUp {
        from {
          transform: translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      #mobilePlayOverlay {
        animation: slideUp 0.8s ease-out, pulseGlow 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
  }
}

function hideMobileOverlay() {
  const overlay = document.getElementById('mobilePlayOverlay');
  if (overlay) {
    overlay.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    overlay.style.opacity = '0';
    overlay.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 500);
  }
}

function showToastNotification(message, type = 'info') {
  // Remove existing toast
  const existingToast = document.getElementById('toastNotification');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.id = 'toastNotification';
  const colors = {
    success: 'rgba(76, 175, 80, 0.95)',
    info: 'rgba(33, 150, 243, 0.95)',
    error: 'rgba(244, 67, 54, 0.95)'
  };
  
  toast.style.cssText = `
    position: fixed;
    bottom: 180px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1002;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 15px 25px;
    border-radius: 12px;
    font-family: 'Georgia', serif;
    font-size: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    animation: slideUp 0.5s ease-out;
    max-width: 90%;
    text-align: center;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.2);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 3000);
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
      rel: 0,
      origin: window.location.origin
    },
    events: {
      onReady: (event) => {
        event.target.mute();
        event.target.playVideo();
        
        // For desktop browsers, attempt immediate unmute
        if (!isMobile) {
          setTimeout(() => {
            event.target.unMute();
            event.target.setVolume(100);
            updateAudioUi(true);
            isUserInteracted = true;
            hideMobileOverlay();
          }, 100);
        }
        
        sessionStorage.setItem('birthday-youtube-autoplay-attempted', 'true');
        if (window.youtubeAutoplayAttempt) window.youtubeAutoplayAttempt();
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.PLAYING) {
          updateAudioUi(isUserInteracted);
          // Hide overlay when music starts playing
          if (isUserInteracted) {
            hideMobileOverlay();
          }
        }
        if (event.data === YT.PlayerState.PAUSED || 
            event.data === YT.PlayerState.CUED || 
            event.data === YT.PlayerState.ENDED) {
          if (window.youtubeAutoplayAttempt) window.youtubeAutoplayAttempt();
        }
      },
      onError: (error) => {
        console.warn('YouTube player error:', error);
        if (window.youtubeAutoplayAttempt) window.youtubeAutoplayAttempt();
        // Show error fallback
        showAudioFallback();
      }
    }
  });
}

function showAudioFallback() {
  // Remove existing fallback
  const existingFallback = document.getElementById('audioFallback');
  if (existingFallback) existingFallback.remove();
  
  const fallback = document.createElement('div');
  fallback.id = 'audioFallback';
  fallback.style.cssText = `
    position: fixed;
    bottom: 180px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1001;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 20px 30px;
    border-radius: 16px;
    font-family: 'Georgia', serif;
    text-align: center;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 126, 179, 0.3);
    max-width: 90%;
  `;
  fallback.innerHTML = `
    <p style="margin: 0 0 12px 0; font-size: 16px;">🎵 Click below to play the music</p>
    <button onclick="forcePlayMusic()" style="
      background: linear-gradient(135deg, #ff7eb3, #c084fc);
      border: none;
      color: white;
      padding: 12px 30px;
      border-radius: 30px;
      font-size: 18px;
      cursor: pointer;
      font-family: 'Georgia', serif;
      box-shadow: 0 4px 15px rgba(255, 126, 179, 0.4);
      transition: transform 0.2s;
    ">▶ Play Music</button>
  `;
  document.body.appendChild(fallback);
}

window.forcePlayMusic = function() {
  if (youtubePlayer) {
    youtubePlayer.unMute();
    youtubePlayer.setVolume(100);
    youtubePlayer.playVideo();
    updateAudioUi(true);
    isUserInteracted = true;
    const fallback = document.getElementById('audioFallback');
    if (fallback) fallback.remove();
    hideMobileOverlay();
    showToastNotification('🎵 Music is now playing!', 'success');
  }
};

window.onYouTubeIframeAPIReady = createYouTubePlayer;

function toggleAudioState() {
  if (!youtubePlayer) return;
  
  // Ensure user interaction for audio
  isUserInteracted = true;
  
  const state = youtubePlayer.getPlayerState();
  if (state === YT.PlayerState.PLAYING) {
    youtubePlayer.pauseVideo();
    updateAudioUi(false);
  } else {
    youtubePlayer.unMute();
    youtubePlayer.setVolume(100);
    youtubePlayer.playVideo();
    updateAudioUi(true);
    hideMobileOverlay();
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
  
  // Hide mobile overlay when playing
  if (isPlaying) {
    hideMobileOverlay();
  }
}

// The API may already be available when this script runs.
if (window.YT && window.YT.Player) createYouTubePlayer();

/* ==========================================================================
   2. SPACE CANVAS PARTICLE ENGINE & FLOATING HEARTS (unchanged)
   ========================================================================== */
// ... (rest of your existing code remains the same)

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
   3. CANDLE BLOW OUT & LIGHTBOX (unchanged)
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

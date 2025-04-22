document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.querySelector('.lightbox');
  const lightboxContent = lightbox.querySelector('.lightbox-content');
  const lightboxImg = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const downloadBtn = lightbox.querySelector('.lightbox-download');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  const zoomInBtn = document.querySelector('.lightbox-zoom-in');
  const zoomOutBtn = document.querySelector('.lightbox-zoom-out');
  
  // State variables
  let currentIndex = 0;
  let zoomLevel = 1;
  let isDragging = false;
  let startX, startY;
  let translateX = 0, translateY = 0;
  
  // Constants
  const maxZoom = 3;
  const zoomStep = 0.1;
  const imageSources = Array.from(galleryItems).map(item => item.querySelector('img').src);

  // Initialize gallery
  function initGallery() {
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        currentIndex = index;
        openLightbox();
      });
    });
  }

  // Lightbox functions
  function openLightbox() {
    lightbox.classList.add('active');
    updateLightbox();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    resetZoom();
    resetPan();
  }

  function updateLightbox() {
    lightboxImg.src = imageSources[currentIndex];
    resetZoom();
    resetPan();
  }

  function resetZoom() {
    zoomLevel = 1;
    updateTransform();
  }

  function resetPan() {
    translateX = 0;
    translateY = 0;
    updateTransform();
  }

  function updateTransform() {
    lightboxImg.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`;
  }

  // Navigation functions
  function navigate(direction) {
    currentIndex = (currentIndex + direction + imageSources.length) % imageSources.length;
    updateLightbox();
  }

  function zoomIn() {
    if (zoomLevel < maxZoom) {
      zoomLevel += zoomStep;
      updateTransform();
    }
  }

  function zoomOut() {
    if (zoomLevel > 1) {
      zoomLevel -= zoomStep;
      updateTransform();
    }
  }

  // Event handlers
  function handleMouseDown(e) {
    if (zoomLevel > 1) {
      isDragging = true;
      lightboxContent.classList.add('grabbing');
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
    }
  }

  function handleMouseMove(e) {
    if (isDragging && zoomLevel > 1) {
      e.preventDefault();
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform();
    }
  }

  function handleMouseUp() {
    isDragging = false;
    lightboxContent.classList.remove('grabbing');
  }

  function handleTouchStart(e) {
    if (zoomLevel > 1) {
      isDragging = true;
      lightboxContent.classList.add('grabbing');
      startX = e.touches[0].clientX - translateX;
      startY = e.touches[0].clientY - translateY;
    }
  }

  function handleTouchMove(e) {
    if (isDragging && zoomLevel > 1) {
      e.preventDefault();
      translateX = e.touches[0].clientX - startX;
      translateY = e.touches[0].clientY - startY;
      updateTransform();
    }
  }

  function handleTouchEnd() {
    isDragging = false;
    lightboxContent.classList.remove('grabbing');
  }

  function handleKeyDown(e) {
    if (lightbox.classList.contains('active')) {
      switch (e.key) {
        case 'Escape': closeLightbox(); break;
        case 'ArrowLeft': navigate(-1); break;
        case 'ArrowRight': navigate(1); break;
        case '+':
        case '=': zoomIn(); break;
        case '-': zoomOut(); break;
      }
    }
  }

  function handleWheel(e) {
    if (e.ctrlKey) {
      e.preventDefault();
      e.deltaY < 0 ? zoomIn() : zoomOut();
    }
  }

  // Event listeners
  lightboxContent.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  
  lightboxContent.addEventListener('touchstart', handleTouchStart);
  document.addEventListener('touchmove', handleTouchMove);
  document.addEventListener('touchend', handleTouchEnd);
  
  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => navigate(-1));
  nextBtn.addEventListener('click', () => navigate(1));
  
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = imageSources[currentIndex];
    link.download = `image-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
  
  document.addEventListener('keydown', handleKeyDown);
  lightbox.addEventListener('wheel', handleWheel);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Zoom controls
  zoomInBtn.addEventListener('click', () => {
    zoomLevel = Math.min(zoomLevel + 0.25, maxZoom);
    updateTransform();
  });

  zoomOutBtn.addEventListener('click', () => {
    zoomLevel = Math.max(zoomLevel - 0.25, 1);
    updateTransform();
  });

  // Initialize gallery
  initGallery();
}); 
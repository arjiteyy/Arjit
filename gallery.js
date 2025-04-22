document.addEventListener('DOMContentLoaded', function() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.querySelector('.lightbox');
  const lightboxContent = lightbox.querySelector('.lightbox-content');
  const lightboxImg = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const downloadBtn = lightbox.querySelector('.lightbox-download');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  let currentIndex = 0;
  let zoomLevel = 1;
  const maxZoom = 3;
  const zoomStep = 0.1;
  let isDragging = false;
  let startX, startY;
  let translateX = 0, translateY = 0;

  // Create array of image sources
  const imageSources = Array.from(galleryItems).map(item => item.querySelector('img').src);

  // Add event listeners to gallery items
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      currentIndex = index;
      openLightbox();
    });
  });

  // Lightbox functionality
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

  // Mouse events for panning
  lightboxContent.addEventListener('mousedown', (e) => {
    if (zoomLevel > 1) {
      isDragging = true;
      lightboxContent.classList.add('grabbing');
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging && zoomLevel > 1) {
      e.preventDefault();
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform();
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    lightboxContent.classList.remove('grabbing');
  });

  // Touch events for mobile
  lightboxContent.addEventListener('touchstart', (e) => {
    if (zoomLevel > 1) {
      isDragging = true;
      lightboxContent.classList.add('grabbing');
      startX = e.touches[0].clientX - translateX;
      startY = e.touches[0].clientY - translateY;
    }
  });

  document.addEventListener('touchmove', (e) => {
    if (isDragging && zoomLevel > 1) {
      e.preventDefault();
      translateX = e.touches[0].clientX - startX;
      translateY = e.touches[0].clientY - startY;
      updateTransform();
    }
  });

  document.addEventListener('touchend', () => {
    isDragging = false;
    lightboxContent.classList.remove('grabbing');
  });

  // Download functionality
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = imageSources[currentIndex];
    link.download = `image-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Zoom controls
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

  // Event listeners for lightbox controls
  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + imageSources.length) % imageSources.length;
    updateLightbox();
  });
  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % imageSources.length;
    updateLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('active')) {
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          currentIndex = (currentIndex - 1 + imageSources.length) % imageSources.length;
          updateLightbox();
          break;
        case 'ArrowRight':
          currentIndex = (currentIndex + 1) % imageSources.length;
          updateLightbox();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
      }
    }
  });

  // Mouse wheel zoom
  lightbox.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }
  });

  // Close lightbox when clicking outside the image
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
}); 

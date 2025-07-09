const hamburger = document.getElementById('hamburger');
const drawer = document.getElementById('drawer');
const drawerClose = document.getElementById('drawerClose');
const menuItems = document.querySelectorAll('.drawer-menu-list a');

hamburger.addEventListener('click', () => {
    drawer.classList.add('open');
    hamburger.classList.add('hide');
});

drawerClose.addEventListener('click', () => {
    drawer.classList.remove('open');
    hamburger.classList.remove('hide');
});

// Close drawer when menu items are clicked
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        drawer.classList.remove('open');
        hamburger.classList.remove('hide');
    });
});

// Optional: close drawer when clicking outside
document.addEventListener('click', (e) => {
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && !hamburger.contains(e.target)) {
        drawer.classList.remove('open');
        hamburger.classList.remove('hide');
    }
});

// Close drawer on menu item click and scroll smoothly
const drawerLinks = document.querySelectorAll('.drawer-menu-list a');
drawerLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        // Let the browser handle the smooth scroll
        setTimeout(() => {
            drawer.classList.remove('open');
        }, 400); // Wait for scroll to start before closing drawer
    });
});

// Photo Gallery Carousel
const photoElements = document.querySelectorAll('.framed-photo');
const captionElement = document.querySelector('.photo-caption');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');
let currentPhotoIndex = 0;

function updatePhoto(index) {
    if (index === currentPhotoIndex) return;

    // Fade out current photo and caption
    photoElements[currentPhotoIndex].classList.add('fade-out');
    captionElement.classList.add('fade-out');

    // Wait for fade out to complete before changing content
    setTimeout(() => {
        // Hide current photo
        photoElements[currentPhotoIndex].style.display = 'none';
        photoElements[currentPhotoIndex].classList.remove('fade-out');
        
        // Show new photo
        currentPhotoIndex = index;
        photoElements[currentPhotoIndex].style.display = 'block';
        captionElement.textContent = photoElements[currentPhotoIndex].getAttribute('data-caption');
        
        // Fade in new photo and caption
        requestAnimationFrame(() => {
            photoElements[currentPhotoIndex].classList.add('fade-in');
            captionElement.classList.remove('fade-out');
            captionElement.classList.add('fade-in');
        });
    }, 500);
}

leftArrow.addEventListener('click', () => {
    // When going left, we want to see the previous photo
    const newIndex = currentPhotoIndex === 0 ? photoElements.length - 1 : currentPhotoIndex - 1;
    updatePhoto(newIndex);
});

rightArrow.addEventListener('click', () => {
    // When going right, we want to see the next photo
    const newIndex = (currentPhotoIndex + 1) % photoElements.length;
    updatePhoto(newIndex);
});

// Initialize the first photo
photoElements.forEach((photo, index) => {
    if (index !== 0) {
        photo.style.display = 'none';
    }
});

// PDF Viewer functionality
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;
let currentScale = 1.2;
const ZOOM_STEP = 0.2;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;

// Initialize PDF viewer
const pdfViewer = document.getElementById('pdfViewer');
const canvas1 = document.createElement('canvas');
const ctx1 = canvas1.getContext('2d');
pdfViewer.appendChild(canvas1);

// Load the PDF file with error handling
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Check if we're on mobile and reduce initial scale
if (window.innerWidth <= 768) {
    currentScale = 0.8;
}

pdfjsLib.getDocument('pdf/first_3_chapters.pdf').promise
    .then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        document.getElementById('totalPages').textContent = pdfDoc.numPages;
        renderPage(pageNum);
    })
    .catch(function(error) {
        console.error('PDF loading error:', error);
        pdfViewer.innerHTML = '<div style="color: #CB9D33; text-align: center; padding: 20px;">Error loading PDF. Please try refreshing the page.</div>';
    });

function renderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
        return;
    }
    
    pageRendering = true;
    pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({scale: currentScale});
        
        // Limit canvas size on mobile to prevent memory issues
        const maxWidth = window.innerWidth <= 768 ? 800 : 1200;
        const maxHeight = window.innerWidth <= 768 ? 1000 : 1600;
        
        if (viewport.width > maxWidth || viewport.height > maxHeight) {
            const scale = Math.min(maxWidth / viewport.width, maxHeight / viewport.height);
            const adjustedViewport = page.getViewport({scale: currentScale * scale});
            canvas1.height = adjustedViewport.height;
            canvas1.width = adjustedViewport.width;
        } else {
            canvas1.height = viewport.height;
            canvas1.width = viewport.width;
        }
        
        const renderContext = {
            canvasContext: ctx1,
            viewport: viewport
        };
        
        page.render(renderContext).promise.then(function() {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        }).catch(function(error) {
            console.error('PDF rendering error:', error);
            pageRendering = false;
        });
    }).catch(function(error) {
        console.error('PDF page loading error:', error);
        pageRendering = false;
    });
    
    document.getElementById('currentPage').textContent = num;
    document.getElementById('prevPage').disabled = num <= 1;
    document.getElementById('nextPage').disabled = num >= pdfDoc.numPages;
}

// Navigation
function onPrevPage() {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
}
function onNextPage() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    renderPage(pageNum);
}
document.getElementById('prevPage').addEventListener('click', onPrevPage);
document.getElementById('nextPage').addEventListener('click', onNextPage);

// Zoom
function zoomIn() {
    if (currentScale < MAX_ZOOM) {
        currentScale += ZOOM_STEP;
        renderPage(pageNum);
    }
    updateZoomLevel();
}
function zoomOut() {
    if (currentScale > MIN_ZOOM) {
        currentScale -= ZOOM_STEP;
        renderPage(pageNum);
    }
    updateZoomLevel();
}
document.getElementById('zoomIn').addEventListener('click', zoomIn);
document.getElementById('zoomOut').addEventListener('click', zoomOut);

function updateZoomLevel() {
    document.getElementById('zoomLevel').textContent = Math.round(currentScale * 100) + '%';
}
updateZoomLevel();

// Behind the Scenes Carousel
const videoContainer = document.querySelector('#behind-the-scenes .video-container');
if (videoContainer) {
const videos = videoContainer.querySelectorAll('video');
const dots = videoContainer.querySelectorAll('.carousel-dot');
let currentVideoIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

// Mobile optimization: Add error handling for videos
videos.forEach(video => {
    video.addEventListener('error', function(e) {
        console.error('Video loading error:', e);
        // Hide broken video and show next one
        video.style.display = 'none';
        if (currentVideoIndex < videos.length - 1) {
            currentVideoIndex++;
            updateCarousel();
        }
    });
    
    // Mobile optimization: Reduce video quality on mobile
    if (isMobile) {
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');
    }
});

function updateCarousel() {
    // Hide all videos
    videos.forEach(video => {
        video.classList.remove('active');
        video.pause();
    });
    
    // Show current video
    videos[currentVideoIndex].classList.add('active');
    
    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentVideoIndex);
    });
}

function showNextVideo() {
    if (currentVideoIndex < videos.length - 1) {
        currentVideoIndex++;
        updateCarousel();
    }
}

function showPrevVideo() {
    if (currentVideoIndex > 0) {
        currentVideoIndex--;
        updateCarousel();
    }
}

// Add touch event listeners for swipe functionality
videoContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

videoContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            showNextVideo();
        } else {
            showPrevVideo();
        }
    }
}

// Add click handlers for dots
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentVideoIndex = index;
        updateCarousel();
    });
});

// Initialize carousel
updateCarousel();
}

// Spinning logo with pause after each rotation
const modelViewer = document.querySelector('.logo-3d-container model-viewer');
if (modelViewer) {
    let angle = 0;
    const duration = 6000; // ms for one full rotation (slower)
    const pause = 800; // ms to pause after each rotation
    let lastTime = null;
    let spinning = true;

    function animateLogo(time) {
        // Stop animation on mobile devices
        if (isMobile) {
            return;
        }
        
        if (!lastTime) lastTime = time;
        const delta = time - lastTime;
        lastTime = time;
        if (spinning) {
            angle -= (360 * delta) / duration;
            if (angle <= -360) {
                angle = -360;
                spinning = false;
                modelViewer.cameraOrbit = `${angle}deg 75deg 105%`;
                setTimeout(() => {
                    angle = 0;
                    spinning = true;
                    lastTime = null;
                    requestAnimationFrame(animateLogo);
                }, pause);
                return;
            }
            modelViewer.cameraOrbit = `${angle}deg 75deg 105%`;
            requestAnimationFrame(animateLogo);
        }
    }
    
    // Only start animation on desktop
    if (!isMobile) {
        requestAnimationFrame(animateLogo);
    }
}

// Contact Modal functionality
const contactModal = document.getElementById('contact-modal');
const contactModalBackdrop = document.querySelector('.contact-modal-backdrop');
const contactModalClose = document.querySelector('.contact-modal-close');
const contactMeLink = document.querySelector('.drawer-menu-list a[href="#contact-me"]');

if (contactMeLink && contactModal) {
    contactMeLink.addEventListener('click', function(e) {
        e.preventDefault();
        contactModal.classList.add('open');
    });
}
if (contactModalClose) {
    contactModalClose.addEventListener('click', function() {
        contactModal.classList.remove('open');
    });
}
if (contactModalBackdrop) {
    contactModalBackdrop.addEventListener('click', function() {
        contactModal.classList.remove('open');
    });
}

// Show thank you message after contact form submission
const contactForm = document.querySelector('.contact-form');
const contactThankyou = document.getElementById('contact-thankyou');
if (contactForm && contactThankyou) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(contactForm);
        fetch('https://formsubmit.co/ebnovels88@gmail.com', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            document.getElementById('contact-modal').classList.remove('open');
            contactThankyou.classList.add('open');
            setTimeout(() => {
                contactThankyou.classList.remove('open');
            }, 5000);
            contactForm.reset();
        })
        .catch(error => {
            alert('There was an error sending your message. Please try again later.');
        });
    });
}


// Drawer play/pause button logic
const drawerAudioToggleBtn = document.getElementById('drawerAudioToggle');
const siteAudio = document.getElementById('site-audio');
console.log(drawerAudioToggleBtn);
console.log(siteAudio);
if (drawerAudioToggleBtn && siteAudio) {
    function updateDrawerAudioToggleBtn() {
        if (siteAudio.paused) {
            drawerAudioToggleBtn.innerHTML = '&#9654;'; // Play icon
            drawerAudioToggleBtn.title = 'Play';
        } else {
            drawerAudioToggleBtn.innerHTML = '&#10073;&#10073;'; // Pause icon
            drawerAudioToggleBtn.title = 'Pause';
        }
    }
    drawerAudioToggleBtn.addEventListener('click', () => {
        if (siteAudio.paused) {
            siteAudio.play();
        } else {
            siteAudio.pause();
        }
        updateDrawerAudioToggleBtn();
    });
    siteAudio.addEventListener('play', updateDrawerAudioToggleBtn);
    siteAudio.addEventListener('pause', updateDrawerAudioToggleBtn);
    updateDrawerAudioToggleBtn();
}

if (siteAudio) {
    siteAudio.volume = 0.2; // Set volume to 20%
    
    // Mobile optimization: Reduce audio quality on mobile
    if (window.innerWidth <= 768) {
        siteAudio.volume = 0.1; // Lower volume on mobile
    }
    
    const playAudio = () => {
        const promise = siteAudio.play();
        if (promise !== undefined) {
            promise.catch(error => {
                console.log("Autoplay was prevented. Waiting for user interaction.");
                const playOnFirstInteraction = () => {
                    siteAudio.play().catch(e => console.error("Could not play audio on interaction:", e));
                    window.removeEventListener('click', playOnFirstInteraction);
                    window.removeEventListener('keydown', playOnFirstInteraction);
                };
                window.addEventListener('click', playOnFirstInteraction);
                window.addEventListener('keydown', playOnFirstInteraction);
            }).then(() => {
                // Autoplay started!
            });
        }
    };
    window.addEventListener('DOMContentLoaded', playAudio);
}

// Pause site audio when videos are played
document.addEventListener('DOMContentLoaded', () => {
    const siteAudio = document.getElementById('site-audio');
    const videosToMonitor = document.querySelectorAll('#book-trailer video, #behind-the-scenes video');

    if (siteAudio) {
        videosToMonitor.forEach(video => {
            video.addEventListener('play', () => {
                if (!siteAudio.paused) {
                    siteAudio.pause();
                }
            });

            video.addEventListener('pause', () => {
                if (siteAudio.paused) {
                    siteAudio.play();
                }
            });

            video.addEventListener('ended', () => {
                if (siteAudio.paused) {
                    siteAudio.play();
                }
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    var audio = document.getElementById('site-audio');
    if (audio) {
        audio.volume = 0.2;
    }
});

// Photo Gallery Modal Logic
const galleryModal = document.getElementById('photo-gallery-modal');
const modalBackdrop = galleryModal.querySelector('.modal-backdrop');
const modalLeftArrow = galleryModal.querySelector('.modal-arrow-left');
const modalRightArrow = galleryModal.querySelector('.modal-arrow-right');
const modalFrameImage = galleryModal.querySelector('.modal-fence-image');
const modalPhoto = galleryModal.querySelector('.modal-framed-photo');
const galleryPhotos = Array.from(document.querySelectorAll('#photo-gallery .framed-photo'));
let modalPhotoIndex = 0;

function openGalleryModal(index) {
    modalPhotoIndex = index;
    updateModalPhoto();
    galleryModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Update the main gallery to show the same photo
    updatePhoto(index);
}
function closeGalleryModal() {
    galleryModal.classList.remove('open');
    document.body.style.overflow = '';
}
function updateModalPhoto() {
    const photo = galleryPhotos[modalPhotoIndex];
    modalPhoto.src = photo.src;
    modalPhoto.alt = photo.alt;
}
modalLeftArrow.addEventListener('click', () => {
    modalPhotoIndex = (modalPhotoIndex - 1 + galleryPhotos.length) % galleryPhotos.length;
    updateModalPhoto();
    // Update the main gallery to show the same photo
    updatePhoto(modalPhotoIndex);
});
modalRightArrow.addEventListener('click', () => {
    modalPhotoIndex = (modalPhotoIndex + 1) % galleryPhotos.length;
    updateModalPhoto();
    // Update the main gallery to show the same photo
    updatePhoto(modalPhotoIndex);
});
modalBackdrop.addEventListener('click', closeGalleryModal);
document.addEventListener('keydown', (e) => {
    if (galleryModal.classList.contains('open')) {
        if (e.key === 'Escape') closeGalleryModal();
        if (e.key === 'ArrowLeft') modalLeftArrow.click();
        if (e.key === 'ArrowRight') modalRightArrow.click();
    }
});
galleryPhotos.forEach((photo, idx) => {
    photo.style.cursor = 'pointer';
    photo.addEventListener('click', () => openGalleryModal(idx));
});
// Swipe support for modal
let touchStartX_modal = 0;
let touchEndX_modal = 0;
galleryModal.addEventListener('touchstart', (e) => {
    touchStartX_modal = e.changedTouches[0].screenX;
});
galleryModal.addEventListener('touchend', (e) => {
    touchEndX_modal = e.changedTouches[0].screenX;
    const diff = touchStartX_modal - touchEndX_modal;
    if (Math.abs(diff) > 50) {
        if (diff > 0) modalRightArrow.click();
        else modalLeftArrow.click();
    }
});

// Memory cleanup function for mobile optimization
function cleanupMemory() {
    // Clear canvas context to free memory
    if (ctx1) {
        ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    }
    
    // Pause all videos to free resources
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(video => {
        if (!video.paused) {
            video.pause();
        }
    });
    
    // Force garbage collection if available
    if (window.gc) {
        window.gc();
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupMemory);

// Periodic cleanup on mobile devices
if (isMobile) {
    setInterval(cleanupMemory, 30000); // Cleanup every 30 seconds on mobile
}

// Mobile optimization: Pause animations when not visible
let isPageVisible = true;
let animationPaused = false;
let isMobile = window.innerWidth <= 768;

// Check if page is visible
function handleVisibilityChange() {
    isPageVisible = !document.hidden;
}

// Add visibility change listener
document.addEventListener('visibilitychange', handleVisibilityChange);

// Mobile optimization: Reduce 3D model quality on mobile
if (isMobile) {
    const modelViewers = document.querySelectorAll('model-viewer');
    modelViewers.forEach(viewer => {
        viewer.setAttribute('shadow-intensity', '0.5');
        viewer.setAttribute('exposure', '0.8');
    });
} 
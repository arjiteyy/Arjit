$(document).ready(function () {
    // Mobile menu toggle
    $('#menu').click(function () {
        $(this).toggleClass('fa-times');
        $('.navbar').toggleClass('nav-toggle');
    });

    // Scroll handling
    $(window).on('scroll load', function () {
        $('#menu').removeClass('fa-times');
        $('.navbar').removeClass('nav-toggle');

        // Scroll to top button
        if (window.scrollY > 60) {
            document.querySelector('#scroll-top').classList.add('active');
        } else {
            document.querySelector('#scroll-top').classList.remove('active');
        }

        // Scroll spy for navigation
        $('section').each(function () {
            let height = $(this).height();
            let offset = $(this).offset().top - 200;
            let top = $(window).scrollTop();
            let id = $(this).attr('id');

            if (top > offset && top < offset + height) {
                $('.navbar ul li a').removeClass('active');
                $('.navbar').find(`[href="#${id}"]`).addClass('active');
            }
        });
    });

    // Smooth scrolling
    $('a[href*="#"]').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top,
        }, 500, 'linear')
    });

    // Contact form submission
    $("#contact-form").submit(function (event) {
        emailjs.init("user_TTDmetQLYgWCLzHTDgqxm");
        emailjs.sendForm('contact_service', 'template_contact', '#contact-form')
            .then(function (response) {
                console.log('SUCCESS!', response.status, response.text);
                document.getElementById("contact-form").reset();
                alert("Form Submitted Successfully");
            }, function (error) {
                console.log('FAILED...', error);
                alert("Form Submission Failed! Try Again");
            });
        event.preventDefault();
    });
});

// Page visibility handling
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === "visible") {
        document.title = "Arjit Chapagain";
        $("#favicon").attr("href", "favcon.jpg");
    } else {
        document.title = "Portfolio | Arjit Chapagain";
        $("#favicon").attr("href", "favcon.jpg");
    }
});

// Typed.js effect
var typed = new Typed(".typing-text", {
    strings: ["I am a Student"],
    loop: true,
    typeSpeed: 60,
    backSpeed: 30,
    backDelay: 500,
});

// Scroll reveal animations
const srtop = ScrollReveal({
    origin: 'top',
    distance: '80px',
    duration: 1000,
    reset: true
});

// Section animations
srtop.reveal('.home .content h3, .home .content p, .home .content .btn', { delay: 200 });
srtop.reveal('.home .image', { delay: 400 });
srtop.reveal('.about .content h3, .about .content .tag, .about .content p, .about .content .box-container', { delay: 200 });
srtop.reveal('.skills .container', { interval: 200 });
srtop.reveal('.skills .container .bar', { delay: 400 });
srtop.reveal('.education .box', { interval: 200 });
srtop.reveal('.contact .container', { delay: 400 });
srtop.reveal('.work .box', { interval: 200 });

// Developer mode disable
document.onkeydown = function (e) {
    if (e.keyCode == 123 || 
        (e.ctrlKey && e.shiftKey && ['I', 'C', 'J'].includes(String.fromCharCode(e.keyCode))) ||
        (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0))) {
        return false;
    }
};

// Data fetching and display
async function fetchData(type = "skills") {
    const response = await fetch(type === "skills" ? "skills.json" : "./projects/projects.json");
    return await response.json();
}

function showSkills(skills) {
    const skillsContainer = document.getElementById("skillsContainer");
    const skillHTML = skills.map(skill => `
        <div class="bar">
            <div class="info">
                <img src=${skill.icon} alt="skill" />
                <span>${skill.name}</span>
            </div>
        </div>
    `).join('');
    skillsContainer.innerHTML = skillHTML;
}

function showProjects(projects) {
    const projectsContainer = document.querySelector("#work .box-container");
    const projectHTML = projects
        .slice(0, 10)
        .filter(project => project.category !== "android")
        .map(project => `
            <div class="box tilt">
                <img draggable="false" src="/assets/images/projects/${project.image}.png" alt="project" />
                <div class="content">
                    <div class="tag">
                        <h3>${project.name}</h3>
                    </div>
                    <div class="desc">
                        <p>${project.desc}</p>
                        <div class="btns">
                            <a href="${project.links.view}" class="btn" target="_blank"><i class="fas fa-eye"></i> View</a>
                            <a href="${project.links.code}" class="btn" target="_blank">Code <i class="fas fa-code"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    projectsContainer.innerHTML = projectHTML;

    // Initialize tilt effect
    VanillaTilt.init(document.querySelectorAll(".tilt"), {
        max: 15,
    });
}

// Initialize data
fetchData().then(showSkills);
fetchData("projects").then(showProjects);

// Preloader
function loader() {
    document.querySelector('.loader-container').classList.add('fade-out');
}

window.onload = function() {
    setTimeout(loader, 500);
};

//Start of Tawk.to Live Chat
//var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
 //(function () {
  //  var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
  //  s1.async = true;
  // s1.src = 'https://embed.tawk.to/60df10bf7f4b000ac03ab6a8/1f9jlirg6';
   //s1.charset = 'UTF-8';
  //  s1.setAttribute('crossorigin', '*');
  //  s0.parentNode.insertBefore(s1, s0);
 //})();
// // End of Tawk.to Live Chat

// Theme Switching Functionality
document.addEventListener('DOMContentLoaded', function() {
  const themeToggle = document.querySelector('.theme-toggle');
  const themeIcon = themeToggle.querySelector('i');
  
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  // Toggle theme on button click
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  // Update theme icon based on current theme
  function updateThemeIcon(theme) {
    if (theme === 'dark') {
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    } else {
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    }
  }
});

// Mobile Menu Toggle
const menuBtn = document.querySelector('#menu');
const navbar = document.querySelector('.navbar');

menuBtn.addEventListener('click', () => {
  menuBtn.classList.toggle('fa-times');
  navbar.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && !menuBtn.contains(e.target)) {
    menuBtn.classList.remove('fa-times');
    navbar.classList.remove('active');
  }
});

// Close mobile menu when clicking a nav link
document.querySelectorAll('.navbar ul li a').forEach(link => {
  link.addEventListener('click', () => {
    menuBtn.classList.remove('fa-times');
    navbar.classList.remove('active');
  });
});

// Animate progress circles when they come into view
const progressCircles = document.querySelectorAll('.progress-circle');

const animateProgress = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const circle = entry.target;
      const percent = circle.getAttribute('data-percent');
      circle.style.setProperty('--percent', percent);
      observer.unobserve(circle);
    }
  });
};

const progressObserver = new IntersectionObserver(animateProgress, {
  threshold: 0.5
});

progressCircles.forEach(circle => {
  progressObserver.observe(circle);
});

// Gallery Lightbox
const galleryItems = document.querySelectorAll('.gallery-item');
const lightbox = document.querySelector('.lightbox');
const lightboxImg = lightbox.querySelector('img');
const lightboxClose = lightbox.querySelector('.lightbox-close');
const lightboxPrev = lightbox.querySelector('.lightbox-prev');
const lightboxNext = lightbox.querySelector('.lightbox-next');
const lightboxDownload = lightbox.querySelector('.lightbox-download');

let currentImageIndex = 0;

// Open lightbox
galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => {
    currentImageIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
});

// Close lightbox
lightboxClose.addEventListener('click', () => {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
});

// Close lightbox when clicking outside
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Previous image
lightboxPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  currentImageIndex = (currentImageIndex - 1 + galleryItems.length) % galleryItems.length;
  updateLightboxImage();
});

// Next image
lightboxNext.addEventListener('click', (e) => {
  e.stopPropagation();
  currentImageIndex = (currentImageIndex + 1) % galleryItems.length;
  updateLightboxImage();
});

// Download image
lightboxDownload.addEventListener('click', (e) => {
  e.stopPropagation();
  const imgSrc = galleryItems[currentImageIndex].querySelector('img').src;
  const link = document.createElement('a');
  link.href = imgSrc;
  link.download = `image-${currentImageIndex + 1}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (lightbox.classList.contains('active')) {
    if (e.key === 'Escape') {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    } else if (e.key === 'ArrowLeft') {
      currentImageIndex = (currentImageIndex - 1 + galleryItems.length) % galleryItems.length;
      updateLightboxImage();
    } else if (e.key === 'ArrowRight') {
      currentImageIndex = (currentImageIndex + 1) % galleryItems.length;
      updateLightboxImage();
    }
  }
});

// Update lightbox image
function updateLightboxImage() {
  const imgSrc = galleryItems[currentImageIndex].querySelector('img').src;
  lightboxImg.src = imgSrc;
  lightboxImg.alt = `Gallery Image ${currentImageIndex + 1}`;
}

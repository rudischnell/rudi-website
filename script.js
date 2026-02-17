// Page load – ensure body is always visible (safety net)
document.body.style.opacity = '1';

// Randomize hero title + tagline on page load
(function() {
    const heroH1 = document.querySelector('.hero h1');
    const heroTagline = document.querySelector('.hero .hero-tagline');
    if (!heroH1) return;
    const variations = [
        { title: 'rudischnell<span class="hero-accent">.studio</span>', tagline: 'Kreativ \u00b7 Direkt \u00b7 Unkompliziert' },
        { title: 'Design <span class="hero-accent">&</span> Workshops', tagline: 'Logos \u00b7 Branding \u00b7 Jugendarbeit' },
        { title: 'Kreativ f\u00fcr <span class="hero-accent">Euch!</span>', tagline: 'Grafik \u00b7 Konzept \u00b7 Umsetzung' }
    ];
    var pick = variations[Math.floor(Math.random() * variations.length)];
    heroH1.innerHTML = pick.title;
    if (heroTagline) heroTagline.textContent = pick.tagline;
})();

// Theme Toggle (Dark Mode is default)
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
}

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    if (next === 'dark') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', next);
});

// Mobile Navigation Toggle
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Nav-logo: reload page to replay hero entrance animation
document.querySelectorAll('.nav-logo[href^="#"]').forEach(function(logo) {
    logo.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = logo.href.split('#')[0] || window.location.pathname;
    });
});

// Anchor navigation – instant scroll + subtle section highlight
document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
        if (link.classList.contains('nav-logo')) return; // handled above
        var hash = this.getAttribute('href');
        if (hash === '#') return;
        var target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();

        var headerOffset = 88;
        var targetY = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo(0, targetY);
        history.pushState(null, null, hash);

        // Highlight target section briefly
        target.classList.remove('section-arrive');
        void target.offsetWidth; // force reflow to restart animation
        target.classList.add('section-arrive');
        var onEnd = function() {
            target.classList.remove('section-arrive');
            target.removeEventListener('animationend', onEnd);
        };
        target.addEventListener('animationend', onEnd);
    });
});

// Page-exit fade for links to other pages (blog, shop, impressum, logo, lang-switcher)
document.querySelectorAll('.nav-links a, .nav-logo, .footer-bottom a, .lang-switcher a').forEach(function(link) {
    link.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (!href || href.startsWith('#')) return;
        var isPage = href.includes('.html') && !href.startsWith('#');
        if (!isPage) return;
        e.preventDefault();
        var isHome = href === 'index.html' || href === 'index-en.html' || href.split('#')[0] === '';
        document.body.classList.add(isHome ? 'page-exit-home' : 'page-exit');
        // Navigate after fade, with safety fallback
        var navigated = false;
        function go() {
            if (navigated) return;
            navigated = true;
            window.location.href = href;
        }
        document.body.addEventListener('transitionend', go, { once: true });
        setTimeout(go, isHome ? 600 : 500); // fallback – never stay black
    });
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Fade-in on scroll with stagger
const observerOptions = {
    threshold: 0.08,
    rootMargin: '0px 0px -60px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            var delay = entry.target.dataset.fadeDelay || 0;
            setTimeout(function() {
                entry.target.classList.add('visible');
            }, delay);
        }
    });
}, observerOptions);

// Add fade-in class to elements with stagger for siblings
document.querySelectorAll('.service-card, .portfolio-item, .stat-card, .about-text, .section-header, .blog-card, .shop-card').forEach(function(el, i) {
    el.classList.add('fade-in');
    // Stagger siblings within the same parent
    var siblings = el.parentElement.querySelectorAll('.fade-in');
    var index = Array.prototype.indexOf.call(siblings, el);
    el.dataset.fadeDelay = index * 80;
    observer.observe(el);
});

// Lightbox
function openLightbox(item) {
    var fullImg = item.querySelector('.portfolio-full');
    var title = item.querySelector('.portfolio-info h3');
    var desc = item.querySelector('.portfolio-info p');
    var lightbox = document.getElementById('lightbox');
    document.getElementById('lightbox-img').src = fullImg.src;
    document.getElementById('lightbox-img').alt = fullImg.alt;
    document.getElementById('lightbox-title').textContent = title ? title.textContent : '';
    document.getElementById('lightbox-desc').textContent = desc ? desc.textContent : '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox(event) {
    if (event.target === document.getElementById('lightbox') || event.target.classList.contains('lightbox-close')) {
        document.getElementById('lightbox').classList.remove('active');
        document.body.style.overflow = '';
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.getElementById('lightbox').classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Cookie Banner
function closeCookieBanner() {
    var banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.classList.remove('visible');
        banner.classList.add('hiding');
        localStorage.setItem('cookieBannerClosed', 'true');
    }
}

(function() {
    var banner = document.getElementById('cookie-banner');
    if (banner && !localStorage.getItem('cookieBannerClosed')) {
        setTimeout(function() { banner.classList.add('visible'); }, 500);
        setTimeout(function() {
            if (banner.classList.contains('visible') && !banner.classList.contains('hiding')) {
                closeCookieBanner();
            }
        }, 5500);
    }
})();

// Contact Form – AJAX submit with inline confirmation
var contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var btn = document.getElementById('contact-submit');
        var originalText = btn.textContent;
        btn.textContent = 'Wird gesendet...';
        btn.disabled = true;

        fetch(contactForm.action, {
            method: 'POST',
            body: new FormData(contactForm),
            headers: { 'Accept': 'application/json' }
        }).then(function(response) {
            if (response.ok) {
                contactForm.style.display = 'none';
                document.getElementById('form-success').classList.add('visible');
            } else {
                btn.textContent = 'Fehler – nochmal versuchen';
                btn.disabled = false;
                setTimeout(function() { btn.textContent = originalText; }, 3000);
            }
        }).catch(function() {
            btn.textContent = 'Fehler – nochmal versuchen';
            btn.disabled = false;
            setTimeout(function() { btn.textContent = originalText; }, 3000);
        });
    });
}

// Language Switcher – preserve current section on switch
const langLinks = document.querySelectorAll('.lang-switcher a');
if (langLinks.length) {
    const sections = document.querySelectorAll('section[id]');

    function updateLangLinks() {
        let currentHash = '';
        const scrollY = window.scrollY + 120;
        sections.forEach(section => {
            if (section.offsetTop <= scrollY) {
                currentHash = '#' + section.id;
            }
        });
        langLinks.forEach(link => {
            const base = link.href.split('#')[0];
            link.href = currentHash ? base + currentHash : base;
        });
    }

    window.addEventListener('scroll', updateLangLinks);
    updateLangLinks();
}

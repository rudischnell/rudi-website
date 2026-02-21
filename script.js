// Page load – ensure body is always visible (safety net)
document.body.style.opacity = '1';

// Always scroll to top on page load/refresh
if (history.scrollRestoration) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

// Pre-select contact subject from URL parameter (e.g. ?subject=Shop-Anfrage)
(function() {
    var params = new URLSearchParams(window.location.search);
    var subject = params.get('subject');
    if (!subject) {
        var hash = window.location.hash;
        if (hash && hash.includes('subject=')) {
            subject = decodeURIComponent(hash.split('subject=')[1]);
        }
    }
    if (subject) {
        var select = document.getElementById('subject');
        if (select) {
            for (var i = 0; i < select.options.length; i++) {
                if (select.options[i].value === subject) {
                    select.selectedIndex = i;
                    break;
                }
            }
        }
        // Jump to contact instantly (no smooth scroll)
        var contact = document.getElementById('contact');
        if (contact) {
            var headerOffset = 88;
            var targetY = contact.getBoundingClientRect().top + window.scrollY - headerOffset;
            window.scrollTo(0, targetY);
        }
    }
})();

// Arrive glow on subpages (Podcast/Shop)
(function() {
    var hero = document.querySelector('.blog-hero') || document.querySelector('.shop-hero');
    if (!hero) return;
    document.body.classList.add('section-arrive');
    document.body.addEventListener('animationend', function() {
        document.body.classList.remove('section-arrive');
    });
})();

// Randomize hero title + tagline on page load (no consecutive repeats, keystroke animation)
(function() {
    const heroH1 = document.querySelector('.hero h1');
    const heroTagline = document.querySelector('.hero .hero-tagline');
    if (!heroH1) return;

    const variations = [
        { title: 'KREATIV F\u00dcR DICH!', accent: 'DICH!', tagline: 'KONZEPT \u00b7 GRAFIK \u00b7 DRUCK' },
        { title: 'RUDI SCHNELL.STUDIO', accent: '.STUDIO', tagline: 'EHRLICH \u00b7 DIREKT \u00b7 EINFACH', spacing: { pos: 4, width: '0.1em' } },
        { title: 'Design & Workshops', accent: '&', tagline: 'BILDSCHIRM \u00b7 PAPIER \u00b7 BILDUNG' }
    ];

    // Prevent same title twice in a row
    var lastIndex = parseInt(localStorage.getItem('heroLastIndex'), 10);
    var idx;
    do {
        idx = Math.floor(Math.random() * variations.length);
    } while (idx === lastIndex && variations.length > 1);
    localStorage.setItem('heroLastIndex', idx);

    var pick = variations[idx];
    if (heroTagline) heroTagline.textContent = pick.tagline;

    // Build character spans with accent support
    var plainTitle = pick.title;
    var accentStr = pick.accent;
    var accentStart = plainTitle.indexOf(accentStr);

    heroH1.innerHTML = '';
    heroH1.style.opacity = '1';
    heroH1.style.animation = 'none';

    var charIndex = 0;
    var spacing = pick.spacing || null;
    for (var i = 0; i < plainTitle.length; i++) {
        var ch = plainTitle[i];
        var span = document.createElement('span');
        span.textContent = ch === ' ' ? '\u00a0' : ch;
        span.className = 'hero-char';
        span.style.animationDelay = (0.2 + charIndex * 0.022) + 's';
        if (accentStart !== -1 && i >= accentStart && i < accentStart + accentStr.length) {
            span.classList.add('hero-accent');
        }
        if (spacing && i === spacing.pos) {
            span.style.marginRight = spacing.width;
        }
        heroH1.appendChild(span);
        charIndex++;
    }

    // Auto-shrink font so title always fits in one line
    function fitHeroTitle() {
        var container = heroH1.parentElement;
        if (!container) return;
        heroH1.style.fontSize = '';
        var maxWidth = container.clientWidth;
        var size = parseFloat(getComputedStyle(heroH1).fontSize);
        while (heroH1.scrollWidth > maxWidth && size > 16) {
            size -= 1;
            heroH1.style.fontSize = size + 'px';
        }
    }
    fitHeroTitle();
    window.addEventListener('resize', fitHeroTitle);
})();

// Service cards: expand/collapse + pre-select contact subject
(function() {
    var cards = document.querySelectorAll('.service-card[data-subject]');
    if (!cards.length) return;

    function isSingleOrTwoCol() {
        return window.innerWidth <= 1024;
    }

    // Gleiche Höhe im geschlossenen Zustand (nicht bei 1 Spalte)
    function equalizeCards() {
        cards.forEach(function(c) { c.style.minHeight = ''; });
        if (window.innerWidth <= 768) return;
        var maxH = 0;
        cards.forEach(function(c) {
            if (!c.classList.contains('active')) {
                maxH = Math.max(maxH, c.offsetHeight);
            }
        });
        if (maxH > 0) {
            cards.forEach(function(c) { c.style.minHeight = maxH + 'px'; });
        }
    }
    var grid = document.querySelector('.services-grid');
    var gridLocked = false;
    var openHeight = 0;

    // Measure max expanded details height + grid height (nur Desktop)
    function measureOpenHeight() {
        openHeight = 0;
        grid.style.setProperty('--details-height', '');
        if (isSingleOrTwoCol()) return;
        var maxInner = 0;
        grid.style.transition = 'none';
        cards.forEach(function(c) {
            var details = c.querySelector('.service-details');
            var inner = c.querySelector('.service-details > div');
            if (details) details.style.transition = 'none';
            c.classList.add('active');
            void grid.offsetHeight;
            if (inner) maxInner = Math.max(maxInner, inner.offsetHeight);
            var h = grid.offsetHeight;
            if (h > openHeight) openHeight = h;
            c.classList.remove('active');
            void c.offsetHeight; // Reflow BEVOR Transition wiederhergestellt wird
            if (details) details.style.transition = '';
        });
        void grid.offsetHeight;
        grid.style.transition = '';
        grid.style.setProperty('--details-height', maxInner + 'px');
    }

    function initCards() {
        // 1. Erst alle Höhen-Overrides entfernen
        cards.forEach(function(c) { c.style.minHeight = ''; });
        grid.style.setProperty('--details-height', '');
        void grid.offsetHeight;
        // 2. Closed-Höhen egalisieren
        equalizeCards();
        // 3. Open-Höhen messen (ohne equalizeCards danach!)
        measureOpenHeight();
    }

    initCards();

    // Re-measure after fonts load
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function() { initCards(); });
    }
    window.addEventListener('resize', function() {
        if (!gridLocked) { initCards(); }
    });

    cards.forEach(function(card) {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.btn-service')) return;
            var wasActive = card.classList.contains('active');

            cards.forEach(function(c) { if (c !== card) c.classList.remove('active'); });
            card.classList.toggle('active', !wasActive);

            // Grid-Locking nur auf Desktop
            if (isSingleOrTwoCol()) return;

            var anyActive = grid.querySelector('.service-card.active') !== null;

            if (anyActive && !gridLocked) {
                gridLocked = true;
                grid.style.minHeight = openHeight + 'px';
            } else if (!anyActive && gridLocked) {
                gridLocked = false;
                grid.style.transition = 'min-height 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
                grid.style.minHeight = '';
                setTimeout(function() { grid.style.transition = ''; }, 450);
            }
        });
    });

    // CTA buttons: scroll to contact and pre-select subject
    document.querySelectorAll('.btn-service').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            var card = btn.closest('.service-card');
            var subject = card ? card.getAttribute('data-subject') : '';
            var select = document.getElementById('subject');
            if (select && subject) {
                for (var i = 0; i < select.options.length; i++) {
                    if (select.options[i].value === subject) {
                        select.selectedIndex = i;
                        break;
                    }
                }
            }
            var target = document.getElementById('contact');
            if (target) {
                var headerOffset = 88;
                var targetY = target.getBoundingClientRect().top + window.scrollY - headerOffset;
                window.scrollTo({ top: targetY, behavior: 'smooth' });
                target.classList.remove('section-arrive');
                void target.offsetWidth;
                target.classList.add('section-arrive');
                target.addEventListener('animationend', function onEnd() {
                    target.classList.remove('section-arrive');
                    target.removeEventListener('animationend', onEnd);
                });
            }
        });
    });
})();

// Theme Toggle (Dark Mode is default)
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    if (next === 'dark') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', next);
}

themeToggle.addEventListener('click', toggleTheme);
var themeToggleMobile = document.getElementById('theme-toggle-mobile');
if (themeToggleMobile) themeToggleMobile.addEventListener('click', toggleTheme);

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

// Carousel (infinite forward loop)
(function() {
    var track = document.querySelector('.carousel-track');
    var slides = document.querySelectorAll('.carousel-slide');
    var dotsContainer = document.querySelector('.carousel-dots');
    var nextBtn = document.querySelector('.carousel-next');
    if (!track || !slides.length) return;

    var total = slides.length;
    var pos = 0;          // internal position (can exceed total)
    var isMoving = false;

    // Klone anhängen für nahtlose Schleife
    for (var c = 0; c < total; c++) {
        var clone = slides[c].cloneNode(true);
        clone.classList.add('clone');
        track.appendChild(clone);
    }

    function getSlideOffset(index) {
        var allSlides = track.querySelectorAll('.carousel-slide');
        if (index <= 0 || !allSlides.length) return 0;
        var target = allSlides[Math.min(index, allSlides.length - 1)];
        return target.offsetLeft - allSlides[0].offsetLeft;
    }

    function setPos(index, animate) {
        track.style.transition = animate ? 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)' : 'none';
        track.style.transform = 'translateX(-' + getSlideOffset(index) + 'px)';
    }

    setPos(0, false);

    // Dots
    for (var i = 0; i < total; i++) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.dataset.index = i;
        dot.addEventListener('click', function() {
            if (isMoving) return;
            var target = parseInt(this.dataset.index);
            // Immer vorwärts zum Ziel
            var stepsForward = (target - (pos % total) + total) % total;
            if (stepsForward === 0) return;
            isMoving = true;
            pos += stepsForward;
            setPos(pos, true);
            updateDots();
        });
        dotsContainer.appendChild(dot);
    }
    var dots = dotsContainer.querySelectorAll('.carousel-dot');

    function updateDots() {
        var activeDot = pos % total;
        dots.forEach(function(d, i) {
            d.classList.toggle('active', i === activeDot);
        });
    }

    function next() {
        if (isMoving) return;
        isMoving = true;
        pos++;
        setPos(pos, true);
        updateDots();
    }

    track.addEventListener('transitionend', function() {
        // Unsichtbar zurücksetzen wenn wir in den Klon-Bereich gefahren sind
        if (pos >= total) {
            pos = pos % total;
            setPos(pos, false);
        }
        isMoving = false;
    });

    nextBtn.addEventListener('click', next);

    // Touch/swipe with velocity detection
    var touchStartX = 0, touchStartTime = 0, touchDiffX = 0;
    track.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartTime = Date.now();
        touchDiffX = 0;
    }, { passive: true });
    track.addEventListener('touchmove', function(e) {
        touchDiffX = e.touches[0].clientX - touchStartX;
    }, { passive: true });
    track.addEventListener('touchend', function() {
        if (isMoving) return;
        var elapsed = Date.now() - touchStartTime;
        var velocity = Math.abs(touchDiffX) / Math.max(elapsed, 1); // px/ms
        var threshold = 30;

        if (Math.abs(touchDiffX) < threshold) { touchDiffX = 0; return; }

        // Fast swipe: skip multiple slides based on velocity
        var steps = 1;
        if (velocity > 1.5) steps = 4;
        else if (velocity > 0.8) steps = 3;
        else if (velocity > 0.4) steps = 2;

        isMoving = true;
        if (touchDiffX < 0) {
            // Swipe left = forward
            pos = Math.min(pos + steps, total + pos - (pos % total));
        } else {
            // Swipe right = backward
            pos = Math.max(pos - steps, 0);
        }
        setPos(pos, true);
        updateDots();
        touchDiffX = 0;
    });

    window.addEventListener('resize', function() { setPos(pos, false); });
})();

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

// Navbar scroll effect + scroll-to-top button
const navbar = document.getElementById('navbar');
var scrollTopBtn = document.getElementById('scroll-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    // Show/hide scroll-to-top button after 50% of page
    if (scrollTopBtn) {
        var halfway = (document.documentElement.scrollHeight - window.innerHeight) * 0.35;
        scrollTopBtn.classList.toggle('visible', window.scrollY > halfway);
    }
});

if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Active nav highlighting with Intersection Observer
(function() {
    var sections = document.querySelectorAll('section[id]');
    var navLinksAll = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !navLinksAll.length) return;

    var sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var id = entry.target.getAttribute('id');
                navLinksAll.forEach(function(link) {
                    link.classList.toggle('nav-active', link.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { threshold: 0.15, rootMargin: '-88px 0px -40% 0px' });

    sections.forEach(function(s) { sectionObserver.observe(s); });
})();

// Fade-in on scroll with stagger
const observerOptions = {
    threshold: 0.08,
    rootMargin: '0px 0px -60px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            var delay = entry.target.dataset.fadeDelay || 0;
            var el = entry.target;
            setTimeout(function() {
                el.classList.add('visible');
                setTimeout(function() { el.classList.add('arrived'); }, 750);
            }, delay);
        }
    });
}, observerOptions);

// Add fade-in class to elements with stagger for siblings
document.querySelectorAll('.service-card, .carousel, .stat-card, .about-text, .section-header, .blog-card, .shop-card').forEach(function(el, i) {
    el.classList.add('fade-in');
    // Stagger siblings within the same parent
    var siblings = el.parentElement.querySelectorAll('.fade-in');
    var index = Array.prototype.indexOf.call(siblings, el);
    el.dataset.fadeDelay = index * 80;
    observer.observe(el);
});

// Lightbox with multi-image navigation
var lightboxImages = [];
var lightboxCurrentIndex = 0;
var lightboxTitle = '';
var lightboxDesc = '';

function openLightbox(item) {
    var fullImgs = item.querySelectorAll('.portfolio-full');
    var title = item.querySelector('.portfolio-info h3');
    var desc = item.querySelector('.portfolio-info p');
    var lightbox = document.getElementById('lightbox');

    lightboxImages = [];
    fullImgs.forEach(function(img) {
        lightboxImages.push({ src: img.src, alt: img.alt });
    });
    // Fallback: use thumbnail if no full images
    if (!lightboxImages.length) {
        var thumb = item.querySelector('.portfolio-image img');
        if (thumb) lightboxImages.push({ src: thumb.src, alt: thumb.alt });
    }
    if (!lightboxImages.length) return;

    lightboxTitle = title ? title.textContent : '';
    lightboxDesc = desc ? desc.textContent : '';
    lightboxCurrentIndex = 0;
    showLightboxImage();

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function showLightboxImage() {
    var img = lightboxImages[lightboxCurrentIndex];
    document.getElementById('lightbox-img').src = img.src;
    document.getElementById('lightbox-img').alt = img.alt;
    document.getElementById('lightbox-title').textContent = lightboxTitle;
    document.getElementById('lightbox-desc').textContent = lightboxDesc;

    var counter = document.getElementById('lightbox-counter');
    var prevBtn = document.getElementById('lightbox-prev');
    var nextBtn = document.getElementById('lightbox-next');

    if (lightboxImages.length > 1) {
        counter.textContent = (lightboxCurrentIndex + 1) + ' / ' + lightboxImages.length;
        counter.style.display = '';
        prevBtn.style.display = '';
        nextBtn.style.display = '';
    } else {
        counter.style.display = 'none';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
}

function lightboxPrev() {
    lightboxCurrentIndex = (lightboxCurrentIndex - 1 + lightboxImages.length) % lightboxImages.length;
    showLightboxImage();
}

function lightboxNext() {
    lightboxCurrentIndex = (lightboxCurrentIndex + 1) % lightboxImages.length;
    showLightboxImage();
}

document.getElementById('lightbox-prev').addEventListener('click', function(e) {
    e.stopPropagation();
    lightboxPrev();
});
document.getElementById('lightbox-next').addEventListener('click', function(e) {
    e.stopPropagation();
    lightboxNext();
});

function closeLightbox(event) {
    if (event.target === document.getElementById('lightbox') || event.target.classList.contains('lightbox-close')) {
        document.getElementById('lightbox').classList.remove('active');
        document.body.style.overflow = '';
    }
}

document.addEventListener('keydown', function(e) {
    var lightbox = document.getElementById('lightbox');
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    } else if (e.key === 'ArrowLeft') {
        lightboxPrev();
    } else if (e.key === 'ArrowRight') {
        lightboxNext();
    }
});

// Lightbox touch swipe
(function() {
    var lightbox = document.getElementById('lightbox');
    var startX = 0, diffX = 0;
    lightbox.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchmove', function(e) { diffX = e.touches[0].clientX - startX; }, { passive: true });
    lightbox.addEventListener('touchend', function() {
        if (diffX < -50) lightboxNext();
        else if (diffX > 50) lightboxPrev();
        diffX = 0;
    });
})();

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

// Contact Form – validation + AJAX submit
var contactForm = document.getElementById('contact-form');
if (contactForm) {
    var nameInput = contactForm.querySelector('#name');
    var emailInput = contactForm.querySelector('#email');
    var subjectSelect = contactForm.querySelector('#subject');
    var messageInput = contactForm.querySelector('#message');
    var submitBtn = document.getElementById('contact-submit');
    var isEN = document.documentElement.lang === 'en';

    var typoMap = {
        '.con': '.com', '.cmo': '.com', '.coom': '.com', '.ocm': '.com',
        '.cm': '.com', '.nett': '.net', '.orgg': '.org', '.dee': '.de',
        '.ed': '.de', '.gmal.com': '.gmail.com', '.gmial.com': '.gmail.com'
    };
    var typoTLDs = Object.keys(typoMap);
    var emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

    var disposableDomains = [
        '10minutemail.com', 'guerrillamail.com', 'tempmail.com', 'mailinator.com',
        'throwaway.email', 'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com',
        'grr.la', 'dispostable.com', 'trashmail.com', 'temp-mail.org', 'fakeinbox.com',
        'mailnesia.com', 'maildrop.cc', 'discard.email', 'tempr.email', 'tempail.com',
        'mohmal.com', 'burnermail.io', 'getnada.com', 'emailondeck.com'
    ];
    var disposableConfirmed = false;

    function showError(id, msg) {
        var el = document.getElementById('error-' + id);
        var input = contactForm.querySelector('#' + id);
        if (el && msg) {
            el.textContent = msg;
            el.classList.add('visible');
            if (input) input.classList.add('invalid');
        }
    }

    function clearError(id) {
        var el = document.getElementById('error-' + id);
        var input = contactForm.querySelector('#' + id);
        if (el) el.classList.remove('visible');
        if (input) input.classList.remove('invalid');
    }

    function validateField(id) {
        var valid = true;
        clearError(id);
        if (id === 'name') {
            var val = nameInput.value.trim();
            if (val.length < 2) {
                showError('name', isEN ? 'Please enter your name.' : 'Bitte gib deinen Namen ein.');
                valid = false;
            }
        } else if (id === 'email') {
            var val = emailInput.value.trim();
            var disposableWarning = document.getElementById('disposable-warning');
            if (!emailRegex.test(val)) {
                showError('email', isEN ? 'Please enter a valid email address.' : 'Bitte gib eine gültige E-Mail-Adresse ein.');
                if (disposableWarning) disposableWarning.classList.remove('visible');
                valid = false;
            } else {
                var typoFound = false;
                for (var i = 0; i < typoTLDs.length; i++) {
                    if (val.endsWith(typoTLDs[i])) {
                        var corrected = val.slice(0, -typoTLDs[i].length) + typoMap[typoTLDs[i]];
                        showError('email', isEN ? 'Did you mean ' + corrected + '?' : 'Meinten Sie ' + corrected + '?');
                        valid = false;
                        typoFound = true;
                        break;
                    }
                }
                if (!typoFound && disposableWarning) {
                    var domain = val.split('@')[1].toLowerCase();
                    if (disposableDomains.indexOf(domain) !== -1 && !disposableConfirmed) {
                        disposableWarning.classList.add('visible');
                        valid = false;
                    } else {
                        disposableWarning.classList.remove('visible');
                    }
                }
            }
        } else if (id === 'subject') {
            if (!subjectSelect.value) {
                showError('subject', isEN ? 'Please select a subject.' : 'Bitte wähle ein Anliegen aus.');
                valid = false;
            }
        } else if (id === 'message') {
            var val = messageInput.value.trim();
            var minMsg = isEN ? 10 : 3;
            if (val.length < minMsg) {
                showError('message', isEN ? 'Please write at least 10 characters.' : 'Ein bisschen mehr muss ich schon wissen!');
                valid = false;
            }
        }
        return valid;
    }

    function validateAll() {
        var v1 = validateField('name');
        var v2 = validateField('email');
        var v3 = validateField('subject');
        var v4 = validateField('message');
        return v1 && v2 && v3 && v4;
    }

    function isDisposableEmail(val) {
        if (!emailRegex.test(val)) return false;
        var domain = val.split('@')[1].toLowerCase();
        return disposableDomains.indexOf(domain) !== -1;
    }

    function updateSubmitState() {
        var nameOk = nameInput.value.trim().length >= 2;
        var emailVal = emailInput.value.trim();
        var emailOk = emailRegex.test(emailVal);
        var subjectOk = !!subjectSelect.value;
        var minMsg = isEN ? 10 : 3;
        var messageOk = messageInput.value.trim().length >= minMsg;
        var disposableBlock = emailOk && isDisposableEmail(emailVal) && !disposableConfirmed;
        submitBtn.disabled = !(nameOk && emailOk && subjectOk && messageOk && !disposableBlock);
    }

    [nameInput, emailInput, messageInput].forEach(function(input) {
        var id = input.id;
        input.addEventListener('blur', function() {
            input.value = input.value.trim();
            validateField(id);
            updateSubmitState();
        });
        input.addEventListener('input', function() {
            clearError(id);
            if (id === 'email') {
                disposableConfirmed = false;
                var dw = document.getElementById('disposable-warning');
                if (dw) dw.classList.remove('visible');
            }
            updateSubmitState();
        });
    });
    subjectSelect.addEventListener('change', function() {
        validateField('subject');
        updateSubmitState();
    });

    // Disposable email Ja/Nein handlers
    var disposableJa = document.getElementById('disposable-ja');
    var disposableNein = document.getElementById('disposable-nein');
    if (disposableJa) {
        disposableJa.addEventListener('click', function() {
            disposableConfirmed = true;
            var dw = document.getElementById('disposable-warning');
            if (dw) dw.classList.remove('visible');
            updateSubmitState();
            // Auto-submit if all other fields are valid
            if (!submitBtn.disabled) {
                contactForm.dispatchEvent(new Event('submit', { cancelable: true }));
            }
        });
    }
    if (disposableNein) {
        disposableNein.addEventListener('click', function() {
            var dw = document.getElementById('disposable-warning');
            if (dw) dw.classList.remove('visible');
            emailInput.focus();
        });
    }

    updateSubmitState();

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        nameInput.value = nameInput.value.trim();
        emailInput.value = emailInput.value.trim();
        messageInput.value = messageInput.value.trim();

        if (!validateAll()) return;

        var originalText = submitBtn.textContent;
        submitBtn.textContent = isEN ? 'Sending...' : 'Wird gesendet...';
        submitBtn.disabled = true;

        fetch(contactForm.action, {
            method: 'POST',
            body: new FormData(contactForm),
            headers: { 'Accept': 'application/json' }
        }).then(function(response) {
            if (response.ok) {
                contactForm.style.display = 'none';
                document.getElementById('form-success').classList.add('visible');
            } else {
                submitBtn.textContent = isEN ? 'Error – try again' : 'Fehler – nochmal versuchen';
                submitBtn.disabled = false;
                setTimeout(function() { submitBtn.textContent = originalText; }, 3000);
            }
        }).catch(function() {
            submitBtn.textContent = isEN ? 'Error – try again' : 'Fehler – nochmal versuchen';
            submitBtn.disabled = false;
            setTimeout(function() { submitBtn.textContent = originalText; }, 3000);
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

/**
 * Waseem Akram Shaik — Portfolio Interactive Scripts
 * Handles: Scroll animations, progress counter sync, mouse tilt,
 * form submission, lightbox modal, and mobile navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Current Year in Footer
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      mobileToggle.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      mobileMenu.setAttribute('aria-hidden', isExpanded);
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // 3. Header Scroll Effect & Active Section Tracking
  const header = document.getElementById('siteHeader');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link:not(.nav-cta-link)');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active Section Tracking
    let currentSection = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSection = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // 4. Scroll Reveal via IntersectionObserver
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const animObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        target.classList.add('animated');

        // Trigger Skills Animation
        if (target.id === 'skills' || target.classList.contains('skills-grid') || target.closest('#skills')) {
          animateSkills();
        }

        // Trigger Stats Counter Animation
        if (target.id === 'achievements' || target.classList.contains('stat-counters-row') || target.closest('#achievements')) {
          animateStatCounters();
        }

        observer.unobserve(target);
      }
    });
  }, observerOptions);

  // Observe all sections and animated elements
  document.querySelectorAll('section, [data-animate]').forEach(el => {
    animObserver.observe(el);
  });

  // 5. Skills Progress Bar & Number Counter Sync
  let skillsAnimated = false;
  function animateSkills() {
    if (skillsAnimated) return;
    skillsAnimated = true;

    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
      const barFill = item.querySelector('.bar-fill');
      const percentageEl = item.querySelector('.skill-percentage');
      if (!barFill || !percentageEl) return;

      const targetVal = parseInt(percentageEl.getAttribute('data-target'), 10) || 0;

      if (prefersReducedMotion) {
        barFill.style.width = targetVal + '%';
        percentageEl.textContent = targetVal + '%';
        return;
      }

      // Animate Bar Fill
      setTimeout(() => {
        barFill.style.width = targetVal + '%';
      }, 100);

      // Animate Counter Sync
      const duration = 1100; // ms
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out curve
        const easeOutVal = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.floor(easeOutVal * targetVal);

        percentageEl.textContent = currentCount + '%';

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          percentageEl.textContent = targetVal + '%';
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  // 6. Stat Counters Animation
  let statsAnimated = false;
  function animateStatCounters() {
    if (statsAnimated) return;
    statsAnimated = true;

    const counters = document.querySelectorAll('.counter-number');
    counters.forEach(counter => {
      const targetStr = counter.getAttribute('data-count');
      const suffix = counter.getAttribute('data-suffix') || '';
      const targetNum = parseFloat(targetStr);
      const isDecimal = targetStr.includes('.');

      if (prefersReducedMotion) {
        counter.textContent = targetStr + suffix;
        return;
      }

      const duration = 1200;
      const startTime = performance.now();

      function updateStat(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = easeOut * targetNum;

        if (isDecimal) {
          counter.textContent = currentVal.toFixed(1) + suffix;
        } else {
          counter.textContent = Math.floor(currentVal) + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(updateStat);
        } else {
          counter.textContent = targetStr + suffix;
        }
      }

      requestAnimationFrame(updateStat);
    });
  }

  // 7. Certifications Mouse-Follow 3D Tilt (3-4 degrees toward cursor)
  if (!prefersReducedMotion) {
    const certCards = document.querySelectorAll('.cert-card[data-tilt]');
    certCards.forEach(card => {
      const inner = card.querySelector('.cert-card-inner');
      if (!inner) return;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cardX = e.clientX - rect.left;
        const cardY = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const deltaX = (cardX - centerX) / centerX;
        const deltaY = (cardY - centerY) / centerY;

        // Bounded to ~3.5 degrees
        const tiltX = -(deltaY * 3.5).toFixed(2);
        const tiltY = (deltaX * 3.5).toFixed(2);

        inner.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        inner.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  // 8. Contact Form Handling & Validation
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('fullName');
      const emailInput = document.getElementById('emailAddr');
      const subjectInput = document.getElementById('subjectLine');
      const messageInput = document.getElementById('messageBody');

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const subject = subjectInput.value.trim();
      const message = messageInput.value.trim();

      if (!name || !email || !subject || !message) {
        showFeedback('Please fill out all fields before sending.', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showFeedback('Please provide a valid email address.', 'error');
        return;
      }

      // Build Mailto link directly addressing skrwaseemakram@gmail.com
      const mailtoRecipient = 'skrwaseemakram@gmail.com';
      const mailtoSubject = encodeURIComponent(`[Portfolio Inquiry] ${subject}`);
      const mailtoBody = encodeURIComponent(
        `Hi Waseem,\n\n${message}\n\n---\nFrom: ${name}\nEmail: ${email}`
      );

      const mailtoUrl = `mailto:${mailtoRecipient}?subject=${mailtoSubject}&body=${mailtoBody}`;

      // Open email client
      window.location.href = mailtoUrl;

      showFeedback(
        `Thank you, ${name}! Your email draft has been generated for skrwaseemakram@gmail.com.`,
        'success'
      );
      contactForm.reset();
    });
  }

  function showFeedback(text, type) {
    if (!formFeedback) return;
    formFeedback.textContent = text;
    formFeedback.className = `form-feedback ${type}`;
    formFeedback.style.display = 'block';

    setTimeout(() => {
      formFeedback.style.display = 'none';
    }, 6000);
  }

  // 9. Lightbox Modal for Certificates & Achievements
  const lightbox = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');

  function openLightbox(src, title) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = title;
    if (lightboxCaption) lightboxCaption.textContent = title;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lightboxImg) lightboxImg.src = '';
  }

  document.querySelectorAll('.lightbox-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const imgPath = trigger.getAttribute('data-img');
      const imgTitle = trigger.getAttribute('data-title') || 'View Document';
      if (imgPath) {
        openLightbox(imgPath, imgTitle);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });
});

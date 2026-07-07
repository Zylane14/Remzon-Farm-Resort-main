// Remzon's Farm & Resort — shared behavior

// Header: transparent over hero, solid once scrolled
const header = document.querySelector('.site-header');
if (header && !header.classList.contains('site-header--solid')) {
  const onScroll = () => header.classList.toggle('is-solid', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Mobile nav
const navToggle = document.querySelector('.nav-toggle');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    navToggle.innerHTML = open ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-list"></i>';
    navToggle.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.site-nav a').forEach(link => {
    link.addEventListener('click', () => {
      document.body.classList.remove('nav-open');
      navToggle.innerHTML = '<i class="bi bi-list"></i>';
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Scroll reveal
const revealables = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && revealables.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealables.forEach(el => io.observe(el));
} else {
  revealables.forEach(el => el.classList.add('revealed'));
}

// Room detail gallery: thumbnail swap + lightbox
const mainPhoto = document.getElementById('mainPhoto');
if (mainPhoto) {
  const thumbs = document.querySelectorAll('.thumb-row img');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      mainPhoto.src = thumb.dataset.image || thumb.src;
      thumbs.forEach(t => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
    });
  });

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = '<img alt="Enlarged view">';
  document.body.appendChild(lightbox);

  mainPhoto.addEventListener('click', () => {
    lightbox.querySelector('img').src = mainPhoto.src;
    lightbox.classList.add('is-open');
  });
  lightbox.addEventListener('click', () => lightbox.classList.remove('is-open'));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') lightbox.classList.remove('is-open');
  });
}

// Dining food strip: drifts slowly on its own, loops seamlessly, and yields
// to the guest — pausing on hover/touch/wheel and supporting mouse drag.
const autoStrip = document.querySelector('.photo-strip--auto');
if (autoStrip) {
  const originals = Array.from(autoStrip.children);
  originals.forEach(img => {
    const clone = img.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.alt = '';
    autoStrip.appendChild(clone);
  });

  // the clones start where the originals end; that offset is one full loop
  let wrapAt = 0;
  const measure = () => { wrapAt = autoStrip.children[originals.length].offsetLeft; };
  measure();
  window.addEventListener('resize', measure);

  let pos = 0;
  let paused = false;
  let dragging = false;
  let resumeTimer;
  const pause = () => { paused = true; clearTimeout(resumeTimer); };
  const resumeSoon = () => {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => { pos = autoStrip.scrollLeft; paused = false; }, 2000);
  };

  autoStrip.addEventListener('mouseenter', pause);
  autoStrip.addEventListener('mouseleave', resumeSoon);
  autoStrip.addEventListener('touchstart', pause, { passive: true });
  autoStrip.addEventListener('touchend', resumeSoon);
  autoStrip.addEventListener('wheel', () => { pause(); resumeSoon(); }, { passive: true });

  let dragStartX = 0;
  let dragStartScroll = 0;
  autoStrip.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    e.preventDefault();
    dragging = true;
    dragStartX = e.clientX;
    dragStartScroll = autoStrip.scrollLeft;
    pause();
  });
  window.addEventListener('pointermove', e => {
    if (dragging) autoStrip.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
  });
  window.addEventListener('pointerup', () => {
    if (dragging) { dragging = false; resumeSoon(); }
  });

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const drift = () => {
      if (!paused && !dragging) {
        pos += 0.5;
        if (wrapAt && pos >= wrapAt) pos -= wrapAt;
        autoStrip.scrollLeft = pos;
      }
      requestAnimationFrame(drift);
    };
    requestAnimationFrame(drift);
  }
}

// Chat bubble
const chatBubble = document.querySelector('.chat-bubble');
if (chatBubble) {
  const chatToggle = chatBubble.querySelector('.chat-toggle');
  const setChat = open => {
    chatBubble.classList.toggle('is-open', open);
    chatToggle.firstElementChild.className = open ? 'bi bi-x-lg' : 'bi bi-chat-dots-fill';
    chatToggle.setAttribute('aria-expanded', open);
  };
  chatToggle.addEventListener('click', () => setChat(!chatBubble.classList.contains('is-open')));
  document.addEventListener('click', e => {
    if (chatBubble.classList.contains('is-open') && !e.composedPath().includes(chatBubble)) setChat(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setChat(false);
  });
}

// Share button
const shareBtn = document.querySelector('.share-button');
if (shareBtn) {
  shareBtn.addEventListener('click', async () => {
    const data = { title: document.title, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(data); } catch (_) { /* dismissed */ }
    } else {
      await navigator.clipboard.writeText(data.url);
      const original = shareBtn.innerHTML;
      shareBtn.innerHTML = '<i class="bi bi-check-lg"></i> Link copied';
      setTimeout(() => { shareBtn.innerHTML = original; }, 2000);
    }
  });
}

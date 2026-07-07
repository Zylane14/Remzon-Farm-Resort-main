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

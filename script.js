/* Fresh Lanka (Pvt) Ltd — shared behaviour */
(function () {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  /* header solidifies on scroll */
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile menu */
  if (toggle && nav) {
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.setAttribute('aria-expanded', 'false');
    const close = () => {
      nav.classList.remove('open');
      header.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    window.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* scroll reveal */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* footer year */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* contact form -> send via Web3Forms (delivers to our inbox, no server needed) */
  const form = document.getElementById('enquiry-form');
  const ok = document.getElementById('form-ok');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      const showMsg = (text, good) => {
        if (!ok) return;
        ok.textContent = text;
        ok.style.color = good ? 'var(--green)' : '#b23b3b';
        ok.style.display = 'block';
      };
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        const out = await res.json().catch(() => ({}));
        if (res.ok && out.success) {
          form.reset();
          showMsg("Thank you — your enquiry has been sent. We'll reply by email shortly.", true);
        } else {
          showMsg('Sorry, something went wrong. Please email freshlankapvtltd@gmail.com directly.', false);
        }
      } catch (err) {
        showMsg('Sorry, something went wrong. Please email freshlankapvtltd@gmail.com directly.', false);
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = original; }
      }
    });
  }
})();

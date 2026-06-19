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

  /* contact form -> compose email (no backend) */
  const form = document.getElementById('enquiry-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get('name') || '';
      const email = data.get('email') || '';
      const phone = data.get('phone') || '';
      const type = data.get('type') || 'General enquiry';
      const msg = data.get('message') || '';
      const lines = [
        'Name: ' + name,
        'Email: ' + email,
        'Phone: ' + phone,
        'Enquiry type: ' + type,
        '',
        msg
      ].join('\r\n');
      const subject = 'Website enquiry: ' + type;
      window.location.href =
        'mailto:freshlankapvtltd@gmail.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines);
      const ok = document.getElementById('form-ok');
      if (ok) ok.style.display = 'block';
    });
  }
})();

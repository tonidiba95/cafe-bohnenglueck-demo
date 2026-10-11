(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const heading = document.querySelector('h1');
  const title = heading.textContent;
  if (!motion.matches) {
    heading.setAttribute('aria-label', title);
    heading.replaceChildren(...title.split(' ').flatMap((word, index) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.style.setProperty('--word', index);
      span.setAttribute('aria-hidden', 'true');
      span.textContent = word;
      return [span, document.createTextNode(' ')];
    }));
  }
  const status = document.querySelector('#opening-status');
  const updateOpening = () => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Berlin', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date()).map(part => [part.type, part.value]));
    const weekend = ['Sat', 'Sun'].includes(parts.weekday);
    const minutes = Number(parts.hour) * 60 + Number(parts.minute);
    const open = minutes >= (weekend ? 9 : 8) * 60 && minutes < (weekend ? 17 : 18) * 60;
    status.textContent = open ? 'Jetzt geöffnet' : 'Zurzeit geschlossen';
    status.classList.toggle('is-open', open);
  };
  updateOpening();
  setInterval(updateOpening, 30000);
  document.addEventListener('visibilitychange', () => {if (!document.hidden) updateOpening();});
  if ('IntersectionObserver' in window) {
    if (!motion.matches) document.documentElement.classList.add('js-motion');
    const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {entry.target.classList.add('visible'); reveals.unobserve(entry.target);}
    }), {threshold: .12});
    document.querySelectorAll('.reveal').forEach(section => reveals.observe(section));
    const prices = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      prices.unobserve(entry.target);
      if (motion.matches) return;
      const element = entry.target;
      const target = Number(element.dataset.price);
      const finalText = element.textContent;
      const start = performance.now();
      element.setAttribute('aria-label', finalText);
      const frame = now => {
        const progress = Math.min((now - start) / 1100, 1);
        if (motion.matches || progress === 1) { element.textContent = finalText; return; }
        element.textContent = (target * (1 - Math.pow(1 - progress, 3))).toLocaleString('de-DE', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' €';
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }), {threshold: .8});
    document.querySelectorAll('[data-price]').forEach(price => prices.observe(price));
    const numbers = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      numbers.unobserve(entry.target);
      if (motion.matches) return;
      const element = entry.target;
      const finalText = element.textContent;
      const start = performance.now();
      element.setAttribute('aria-label', finalText);
      const tick = now => {
        const progress = Math.min((now - start) / 1400, 1);
        if (motion.matches || progress === 1) {element.textContent = finalText; return;}
        element.textContent = Math.round(Number(element.dataset.count) * (1 - Math.pow(1 - progress, 3)));
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), {threshold: .8});
    document.querySelectorAll('[data-count]').forEach(number => numbers.observe(number));
    const navigation = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('nav a').forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    }), {rootMargin: '-15% 0px -45% 0px'});
    document.querySelectorAll('section[id]').forEach(section => navigation.observe(section));
  }
  motion.addEventListener('change', () => {
    if (motion.matches) document.documentElement.classList.remove('js-motion');
  });
})();

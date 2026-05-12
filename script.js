(() => {
  const stage       = document.getElementById('stage');
  const candleWrap  = document.getElementById('candleWrap');
  const flame       = document.getElementById('flame');
  const smoke       = document.getElementById('smoke');
  const ambient     = document.getElementById('ambient');
  const hint        = document.getElementById('hint');
  const celebration = document.getElementById('celebration');
  const confetti    = document.getElementById('confetti');
  const replay      = document.getElementById('replay');

  const PALETTE = ['#f3e7d4', '#cdb38a', '#8b7763', '#4a3318'];

  let state = 'idle'; // idle -> swaying -> out

  // Pixel-mode body sits below the wrap's geometric centre because the wrap is
  // 560 tall and the body bottom anchors near the wrap bottom. Empirically the
  // visual body centre is ~29px south of the wrap centre when scale(.45) is
  // applied with transform-origin 50% 95%.
  const BODY_OFFSET_Y = 29;

  function alignStageToCandleSlot() {
    const slot = document.querySelector('.candle-slot');
    if (!slot) return;
    // Caller guarantees the stage is at its natural (un-translated) position,
    // so the slot↔wrap delta is the translation we want.
    const slotRect = slot.getBoundingClientRect();
    const wrapRect = candleWrap.getBoundingClientRect();
    const dx = (slotRect.left + slotRect.width / 2) - (wrapRect.left + wrapRect.width / 2);
    const dy = (slotRect.top + slotRect.height / 2) - (wrapRect.top + wrapRect.height / 2 + BODY_OFFSET_Y);
    stage.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function setHint(text) {
    if (!text) { hint.classList.remove('show'); return; }
    hint.innerHTML = '<span class="dot"></span> ' + text + ' <span class="dot"></span>';
    hint.classList.add('show');
  }

  function step() {
    if (state === 'idle') {
      flame.classList.add('sway');
      state = 'swaying';
      setHint('再點一下吹熄');
    } else if (state === 'swaying') {
      blowOut();
    }
  }

  function blowOut() {
    state = 'out';
    flame.classList.remove('sway');
    flame.classList.add('out');
    smoke.classList.remove('go'); void smoke.offsetWidth; smoke.classList.add('go');
    ambient.classList.add('out');
    setHint('');
    setTimeout(() => {
      // Re-light the candle for the celebration — it's now the "I" in BIRTHDAY,
      // so it needs to be visible and lit, not blown-out and faded.
      flame.classList.remove('out');
      smoke.classList.remove('go');
      ambient.classList.remove('out');
      celebration.classList.add('show');
      celebration.setAttribute('aria-hidden', 'false');
      // After the celebration is in the DOM and laid out, measure .candle-slot
      // and slide the stage to align the candle body with it. Using setTimeout
      // instead of rAF — some embedding environments throttle/skip rAF in
      // ways that prevent the callback from firing reliably.
      setTimeout(alignStageToCandleSlot, 60);
      launchConfetti();
      setTimeout(launchConfetti, 900);
      setTimeout(launchConfetti, 1900);
    }, 950);
  }

  function launchConfetti() {
    const N = 70;
    const w = window.innerWidth;
    for (let i = 0; i < N; i++) {
      const p = document.createElement('div');
      const kind = Math.random();
      p.className = 'piece' + (kind < .33 ? ' round' : kind < .66 ? ' bar' : '');
      const x = Math.random() * w;
      const dx = (Math.random() - 0.5) * 400;
      const dur = 3.4 + Math.random() * 2.6;
      const delay = Math.random() * 1.2;
      const rot = (Math.random() * 900 - 300) + 'deg';
      p.style.left = x + 'px';
      p.style.background = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--rot', rot);
      p.style.animationDuration = dur + 's';
      p.style.animationDelay = delay + 's';
      confetti.appendChild(p);
      setTimeout(() => p.remove(), (dur + delay) * 1000 + 100);
    }
  }

  function reset() {
    state = 'idle';
    flame.classList.remove('sway', 'out');
    smoke.classList.remove('go');
    ambient.classList.remove('out');
    stage.classList.remove('faded', 'celebrating');
    stage.style.transform = '';
    celebration.classList.remove('show');
    celebration.setAttribute('aria-hidden', 'true');
    confetti.innerHTML = '';
    setHint('點一下蠟燭');
    // Re-trigger the Chinese letter-drop on .title
    const title = document.getElementById('title');
    title.querySelectorAll('span').forEach(s => {
      s.style.animation = 'none';
      void s.offsetWidth;
      s.style.animation = '';
    });
    // Re-trigger the poster-title fade
    const poster = document.querySelector('.poster-title');
    if (poster) {
      poster.style.animation = 'none';
      void poster.offsetWidth;
      poster.style.animation = '';
    }
  }

  candleWrap.addEventListener('click', step);
  candleWrap.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); step(); }
  });
  replay.addEventListener('click', reset);

  setTimeout(() => stage.classList.remove('intro'), 1800);
})();

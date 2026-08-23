document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const screen1 = document.getElementById('screen1');
  const screen2 = document.getElementById('screen2');
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const toastContainer = document.getElementById('toastContainer');
  const envelope = document.getElementById('envelope');
  const sendLoveBtn = document.getElementById('sendLoveBtn');
  const replayBtn = document.getElementById('replayBtn');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const heartBurstLayer = document.getElementById('heartBurstLayer');

  let yesScale = 1;
  let noDodgeCount = 0;
  let isAudioPlaying = false;
  let audioContext = null;
  let melodyInterval = null;

  // Funny & cute messages when No tries to dodge
  const teasingMessages = [
    "Oops! No is not an option! 🙈䙡" ,
    "Nice try amma! But you can't say No! 🥺✨" ,
    "The No button got too shy and ran away! 💅" ,
    "Hehehe, only YES is allowed for my queen! 🧩🌶" ,
    "Come on amma, click YES already! 💅🥺👋👈" ,
    "I will keep chasing your smile forever! 💋✅" ,
    "Look how big the YES button is getting! 🌶"
  ];

  /* ==================================================================
     CANVAS FLOATING HEARTS & SPARKLES ENGINE
     ================================================================= */
  const canvas = document.getElementById('heartCanvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const hearts = [];
  const heartColors = ['#ff8fab', '#ffb3c6', '#ffc2d1', '#fb6f92', '#ff4d6d', '#ffffff'];

  class FloatingHeart {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
      this.size = Math.random() * 16 + 8;
      this.speedY = Math.random() * 1.2 + 0.5;
      this.speedX = Math.sin(Math.random() * Math.PI) * 0.8;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.color = heartColors[Math.floor(Math.random() * heartColors.length)];
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;

      // Draw Heart Shape
      const s = this.size / 20;
      ctx.beginPath();
      ctx.moveTo(0, -5 * s);
      ctx.bezierCurveTo(-10 * s, -20 * s, -25 * s, 0, 0, 20 * s);
      ctx.bezierCurveTo(25 * s, 0, 10 * s, -20 * s, 0, -5 * s);
      ctx.fill();
      ctx.restore();
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX + Math.sin(this.y * 0.01) * 0.4;
      this.rotation += this.rotSpeed;

      if (this.y < -30 || this.x < -30 || this.x > canvas.width + 30) {
        this.reset();
      }
    }
  }

  // Create initial pool of floating background hearts
  const heartCount = window.innerWidth < 600 ? 25 : 45;
  for (let i = 0; i < heartCount; i++) {
    hearts.push(new FloatingHeart());
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let heart of hearts) {
      heart.update();
      heart.draw();
    }
    requestAnimationFrame(animateCanvas);
  }
  animateCanvas();

  /* ==================================================================
     WEB AUDIO API - SWEET CHIMES & ROMANTIC MELODY (100% OFFLINE)
     ================================================================= */
  function getAudioCtx() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  }

  function playChime(freq, type = 'sine', duration = 0.6, gainLevel = 0.15) {
    try {
      const actx = getAudioCtx();
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, actx.currentTime);

      gain.gain.setValueAtTime(gainLevel, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + duration);

      osc.connect(gain);
      gain.connect(actx.destination);

      osc.start();
      osc.stop(actx.currentTime + duration);
    } catch (e) {
      // Audio fallback silent if restricted
    }
  }

  function playSparkleSound() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => playChime(freq, 'triangle', 0.5, 0.12), idx * 70);
    });
  }

  function playCelebrationFanfare() {
    const melody = [
      { f: 523.25, d: 0.2 },
      { f: 659.25, d: 0.2 },
      { f: 783.99, d: 0.25 },
      { f: 1046.50, d: 0.6 },
      { f: 880.00, d: 0.2 },
      { f: 1046.50, d: 0.8 }
    ];
    melody.forEach((item, idx) => {
      setTimeout(() => playChime(item.f, 'sine', item.d, 0.2), idx * 160);
    });
  }

  // Sweet music box continuous melody loop
  const musicBoxNotes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 783.99, 659.25];
  let noteIndex = 0;

  function toggleMusic() {
    isAudioPlaying = !isAudioPlaying;
    if (isAudioPlaying) {
      getAudioCtx();
      musicToggleBtn.classList.add('playing');
      musicToggleBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> <span class="music-label">Playing 💡</span>';
      showToast('🍶 Playing soft romantic chimes! ✥');
      
      melodyInterval = setInterval(() => {
        const note = musicBoxNotes[noteIndex % musicBoxNotes.length];
        playChime(note, 'sine', 1.0, 0.08);
        noteIndex++;
      }, 420);
    } else {
      musicToggleBtn.classList.remove('playing');
      musicToggleBtn.innerHTML = '<i class="fa-solid fa-music"></i> <span class="music-label">Music</span>';
      if (melodyInterval) clearInterval(melodyInterval);
    }
  }

  musicToggleBtn.addEventListener('click', toggleMusic);

  /* ==================================================================
     DODGING NO BUTTON ENGINE (TOUCH & MOUSE EVASION)
     ================================================================= */
  function showToast(text) {
    const toast = document.createElement('div');
    toast.className = 'cute-toast';
    toast.textContent = text;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-15px)';
      setTimeout(() => toast.remove(), 400);
    }, 2000);
  }

  function evadeNoButton(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    noDodgeCount++;
    noBtn.classList.add('evading');
    document.body.appendChild(noBtn);

    // Calculate safe screen bounds with safe margins
    const padding = 25;
    const btnWidth = noBtn.offsetWidth || 120;
    const btnHeight = noBtn.offsetHeight || 50;

    const maxLeft = Math.max(20, window.innerWidth - btnWidth - padding);
    const maxTop = Math.max(20, window.innerHeight - btnHeight - padding);

    const randomLeft = Math.max(padding, Math.floor(Math.random() * maxLeft));
    const randomTop = Math.max(padding, Math.floor(Math.random() * maxTop));

    noBtn.style.position = 'fixed';
    noBtn.style.left = randomLeft + 'px';
    noBtn.style.top = randomTop + 'px';

    // Make YES button grow larger & glow more on each dodge
    yesScale = Math.min(yesScale + 0.08, 1.6);
    yesBtn.style.transform = 'scale(' + yesScale + ')';
    yesBtn.style.boxShadow = '0 10px 30px rgba(255, 26, 83, ' + (0.4 + (yesScale - 1) * 0.4) + ')';

    // Cute playful rotate
    const randomRotation = (Math.random() - 0.5) * 25;
    noBtn.style.transform = 'rotate(' + randomRotation + 'deg)';

    // Sound effect
    playChime(350 + Math.random() * 200, 'triangle', 0.2, 0.1);

    // Show funny teasing toasts
    const msg = teasingMessages[(noDodgeCount - 1) % teasingMessages.length];
    showToast(msg);

    // Spawn tiny heart sparkles around YES button
    const yesRect = yesBtn.getBoundingClientRect();
    spawnHeartBurst(yesRect.left + yesRect.width / 2, yesRect.top + yesRect.height / 2, 4);
  }

  // Trigger dodge on all pointer & touch events
  noBtn.addEventListener('mouseenter', evadeNoButton);
  noBtn.addEventListener('mouseover', evadeNoButton);
  noBtn.addEventListener('touchstart', evadeNoButton, { passive: false });
  noBtn.addEventListener('click', evadeNoButton);

  /* ==================================================================
     CLICK / TOUCH BURST OF FLOATING HEARTS
     ================================================================= */
  const burstEmojis = ['💅', '💉', '🌶', '✅', '🧩', '🢧', '📋'];

  function spawnHeartBurst(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('div');
      heart.className = 'burst-heart';
      heart.textContent = burstEmojis[Math.floor(Math.random() * burstEmojis.length)];
      
      const dx = (Math.random() - 0.5) * 160 + 'px';
      const dy = -(Math.random() * 120 + 40) + 'px';
      const rot = (Math.random() - 0.5) * 90 + 'deg';

      heart.style.left = x + 'px';
      heart.style.top = y + 'px';
      heart.style.setProperty('--dx', dx);
      heart.style.setProperty('--dy', dy);
      heart.style.setProperty('--rot', rot);

      heartBurstLayer.appendChild(heart);

      setTimeout(() => heart.remove(), 1200);
    }
  }

  window.addEventListener('click', (e) => {
    // Avoid double spawning if clicking specific buttons
    if (!+e.target.closest('#yesBtn') && !e.target.closest('#sendLoveBtn')) {
      spawnHeartBurst(e.clientX, e.clientY, 3);
    }
  });

  /* =================================================================
     YES BUTTON CLICKED -> TRANSITION TO SCREEN 2
     ================================================================= */
  function triggerCelebration() {
    playCelebrationFanfare();

    // Trigger Canvas Confetti Shower
    if (typeof confetti === 'function') {
      // Big initial burst
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ff4d6d', '#ff8fab', '#fb6f92', '#ffd700', '#ffffff']
      });

      // Side cannons for full magical celebration
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    }

    // Smooth Screen Transition
    screen1.classList.remove('active-screen');
    screen1.classList.add('hidden-screen');

    setTimeout(() => {
      screen2.classList.remove('hidden-screen');
      screen2.classList.add('active-screen');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Automatically pop open the envelope after 1.2s for romantic surprise
      setTimeout(() => {
        if (envelope && !envelope.classList.contains('open')) {
          envelope.classList.add('open');
          playSparkleSound();
          const rect = envelope.getBoundingClientRect();
          spawnHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
        }
      }, 1200);
    }, 400);
  }

  yesBtn.addEventListener('click', (e) => {
    const rect = yesBtn.getBoundingClientRect();
    spawnHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
    triggerCelebration();
  });

  /* =================================================================
     SCREEN 2: ENVELOPE INTERACTION & LOVE BURST BUTTON
     ================================================================ */
  if (envelope) {
    envelope.addEventListener('click', () => {
      envelope.classList.toggle('open');
      playSparkleSound();
      const rect = envelope.getBoundingClientRect();
      spawnHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
    });
  }

  if (sendLoveBtn) {
    sendLoveBtn.addEventListener('click', (e) => {
      playSparkleSound();
      const rect = sendLoveBtn.getBoundingClientRect();
      spawnHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 15);

      if (typeof confetti === 'function') {
        confetti({
          particleCount: 75,
          spread: 100,
          origin: { y: 0.7 },
          colors: ['#ff1493', '#ff69b4', '#ffb6c1', '#ffd700']
        });
      }

      showToast('💅 Millions of kisses & hugs delivered to you! 💎🧩');
    });
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      // Reset state and return to Screen 1
      yesScale = 1;
      noDodgeCount = 0;
      yesBtn.style.transform = 'scale(1)';
      yesBtn.style.boxShadow = '';
      noBtn.classList.remove('evading');
      noBtn.style.position = '';
      noBtn.style.left = '';
      noBtn.style.top = '';
      noBtn.style.transform = '';

      if (envelope) envelope.classList.remove('open');

      screen2.classList.remove('active-screen');
      screen2.classList.add('hidden-screen');

      setTimeout(() => {
        screen1.classList.remove('hidden-screen');
        screen1.classList.add('active-screen');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    });
  }
});
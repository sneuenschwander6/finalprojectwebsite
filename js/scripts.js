/*!
* Start Bootstrap - One Page Wonder v6.0.6 (https://startbootstrap.com/theme/one-page-wonder)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-one-page-wonder/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project

(function () {
  const canvas = document.getElementById('everest-game');
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const timerEl = document.getElementById('everest-timer');
  const statusEl = document.getElementById('everest-status');
  const startBtn = document.getElementById('game-start-btn');
  const overlayEl = document.getElementById('game-overlay');
  const overlayRestartBtn = document.getElementById('overlay-restart-btn');
  const goalProgress = 3400;
  const gravity = 1400;
  const jumpSpeed = -520;
  const moveSpeed = 240;
  const runSpeed = 260;
  let lastTime = performance.now();
  let timerStart = null;
  let elapsed = 0;
  let progress = 0;
  let worldY = 0;
  let started = false;
  let won = false;
  const keys = { left: false, right: false, up: false };
  const particles = [];
  const player = {
    x: width / 2 - 18,
    y: height - 100,
    w: 36,
    h: 46,
    vx: 0,
    vy: 0,
    onGround: false,
  };

  const obstacles = [];
  const scenery = [];

  function init() {
    progress = 0;
    worldY = 0;
    elapsed = 0;
    timerStart = null;
    started = false;
    won = false;
    particles.length = 0;
    player.x = width / 2 - 18;
    player.y = height - 82;
    player.vx = 0;
    player.vy = 0;
    player.onGround = true;
    obstacles.length = 0;
    scenery.length = 0;
    generateObstacles();
    generateScenery();
    if (startBtn) {
      startBtn.textContent = 'Start Run';
    }
    if (overlayEl) {
      overlayEl.classList.add('d-none');
    }
    updateStatus('Press Start to begin your downhill run.');
    updateTimer();
    requestAnimationFrame(loop);
  }

  function generateObstacles() {
    let y = -100;
    for (let i = 0; i < 30; i += 1) {
      y -= 140 + Math.random() * 80;
      const type = i % 5 === 0 ? 'rock' : 'tree';
      const x = 30 + Math.random() * (width - 100);
      obstacles.push({ x, y, type, w: type === 'rock' ? 72 : 40, h: type === 'rock' ? 30 : 100 });
    }
  }

  function generateScenery() {
    const featureTypes = ['ice-shard', 'sherpa', 'flag', 'snow-patch'];
    for (let i = 1; i < 40; i += 1) {
      const y = -i * 90 - Math.random() * 40;
      const x = 20 + Math.random() * (width - 40);
      const type = featureTypes[i % featureTypes.length];
      const scale = 0.7 + Math.random() * 0.7;
      scenery.push({ x, y, type, scale });
    }
  }

  function updateStatus(text) {
    if (statusEl) {
      statusEl.textContent = text;
    }
  }

  function updateTimer() {
    if (timerEl) {
      timerEl.textContent = `Time: ${elapsed.toFixed(2)}s`;
    }
  }

  function loop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.035);
    lastTime = time;
    if (started && timerStart && !won) {
      elapsed = (time - timerStart) / 1000;
      updateTimer();
    }
    if (!won) {
      updateGame(dt);
    }
    draw();
    requestAnimationFrame(loop);
  }

  function updateGame(dt) {
    if (!started) {
      return;
    }

    if (keys.left) {
      player.vx = -moveSpeed;
    } else if (keys.right) {
      player.vx = moveSpeed;
    } else {
      player.vx = 0;
    }

    player.x += player.vx * dt;
    player.x = Math.max(0, Math.min(width - player.w, player.x));

    player.vy += gravity * dt;
    player.y += player.vy * dt;

    if (player.y >= height - 82) {
      player.y = height - 82;
      player.vy = 0;
      player.onGround = true;
    } else {
      player.onGround = false;
    }

    if (player.onGround && keys.up) {
      player.vy = jumpSpeed;
    }

    progress += runSpeed * dt;
    worldY = progress;

    obstacles.forEach((obs) => {
      const obsY = obs.y + worldY;
      if (obsY > height + 80 || obsY < -80) {
        return;
      }
      if (
        player.x + player.w > obs.x + 6 &&
        player.x < obs.x + obs.w - 6 &&
        player.y + player.h > obsY &&
        player.y < obsY + obs.h
      ) {
        const isRock = obs.type === 'rock';
        const isJumping = player.y < height - 130;
        if (isRock && isJumping) {
          return;
        }
        resetGame();
      }
    });

    if (progress >= goalProgress && !won) {
      won = true;
      started = false;
      if (startBtn) {
        startBtn.textContent = 'Restart';
      }
      updateStatus('You made it to the bottom!');
      spawnConfetti();
    }

    updateParticles(dt);
  }

  function resetGame() {
    player.x = width / 2 - 18;
    player.y = height - 82;
    player.vx = 0;
    player.vy = 0;
    player.onGround = true;
    progress = 0;
    worldY = 0;
    timerStart = null;
    elapsed = 0;
    started = false;
    won = false;
    particles.length = 0;
    if (startBtn) {
      startBtn.textContent = 'Start Run';
    }
    if (overlayEl) {
      overlayEl.classList.remove('d-none');
    }
    updateStatus('You hit an obstacle. Click restart to try again.');
    updateTimer();
  }

  function spawnConfetti() {
    const colors = ['#f7c3c3', '#fde6a5', '#a8e6cf', '#aec6cf', '#d9c3ff'];
    for (let i = 0; i < 80; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * -160,
        vx: (Math.random() - 0.5) * 120,
        vy: 80 + Math.random() * 120,
        size: 5 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 6,
      });
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.rotation += particle.rotationSpeed * dt;
      if (particle.y > height + 20) {
        particles.splice(i, 1);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    drawBackground();
    drawObstacles();
    drawPlayer();
    if (won) {
      drawVictory();
    }
    drawParticles();
  }

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#dbe8f7');
    gradient.addColorStop(0.45, '#e9f2fb');
    gradient.addColorStop(1, '#f8fbff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ced8e6';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.7);
    ctx.lineTo(width * 0.14, height * 0.48);
    ctx.lineTo(width * 0.28, height * 0.62);
    ctx.lineTo(width * 0.38, height * 0.46);
    ctx.lineTo(width * 0.5, height * 0.68);
    ctx.lineTo(width * 0.64, height * 0.42);
    ctx.lineTo(width * 0.82, height * 0.58);
    ctx.lineTo(width, height * 0.45);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fbfbff';
    ctx.beginPath();
    ctx.moveTo(width * 0.22, height * 0.6);
    ctx.lineTo(width * 0.3, height * 0.46);
    ctx.lineTo(width * 0.36, height * 0.54);
    ctx.lineTo(width * 0.44, height * 0.42);
    ctx.lineTo(width * 0.5, height * 0.5);
    ctx.lineTo(width * 0.58, height * 0.38);
    ctx.lineTo(width * 0.66, height * 0.48);
    ctx.lineTo(width * 0.74, height * 0.4);
    ctx.lineTo(width * 0.88, height * 0.52);
    ctx.lineTo(width * 0.88, height * 0.6);
    ctx.lineTo(width * 0.22, height * 0.6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#eef3fb';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.54);
    ctx.lineTo(width * 0.18, height * 0.32);
    ctx.lineTo(width * 0.34, height * 0.38);
    ctx.lineTo(width * 0.5, height * 0.22);
    ctx.lineTo(width * 0.66, height * 0.34);
    ctx.lineTo(width * 0.82, height * 0.26);
    ctx.lineTo(width, height * 0.5);
    ctx.lineTo(width, height * 0.54);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(width * 0.48, height * 0.28);
    ctx.lineTo(width * 0.52, height * 0.18);
    ctx.lineTo(width * 0.58, height * 0.26);
    ctx.lineTo(width * 0.64, height * 0.16);
    ctx.lineTo(width * 0.7, height * 0.24);
    ctx.lineTo(width * 0.74, height * 0.14);
    ctx.lineTo(width * 0.8, height * 0.22);
    ctx.lineTo(width * 0.85, height * 0.16);
    ctx.lineTo(width * 0.92, height * 0.26);
    ctx.lineTo(width * 0.92, height * 0.32);
    ctx.lineTo(width * 0.48, height * 0.32);
    ctx.closePath();
    ctx.fill();

    scenery.forEach((item) => {
      const py = item.y + worldY;
      if (py < -40 || py > height + 40) return;
      if (item.type === 'ice-shard') {
        ctx.save();
        ctx.translate(item.x, py);
        ctx.fillStyle = '#c9e2f2';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(12 * item.scale, -24 * item.scale);
        ctx.lineTo(6 * item.scale, -6 * item.scale);
        ctx.lineTo(18 * item.scale, -12 * item.scale);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(4 * item.scale, 4 * item.scale);
        ctx.lineTo(20 * item.scale, -10 * item.scale);
        ctx.lineTo(14 * item.scale, -30 * item.scale);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      if (item.type === 'snow-patch') {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.ellipse(item.x, py, 24 * item.scale, 12 * item.scale, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (item.type === 'flag') {
        ctx.fillStyle = '#5e5b57';
        ctx.fillRect(item.x, py - 28 * item.scale, 4 * item.scale, 28 * item.scale);
        ctx.fillStyle = '#ee0979';
        ctx.beginPath();
        ctx.moveTo(item.x + 4 * item.scale, py - 28 * item.scale);
        ctx.lineTo(item.x + 18 * item.scale, py - 22 * item.scale);
        ctx.lineTo(item.x + 4 * item.scale, py - 16 * item.scale);
        ctx.closePath();
        ctx.fill();
      }
      if (item.type === 'sherpa') {
        ctx.save();
        ctx.translate(item.x, py);
        ctx.fillStyle = '#3b3b3b';
        ctx.beginPath();
        ctx.arc(0, -16 * item.scale, 8 * item.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2d3b52';
        ctx.fillRect(-7 * item.scale, -12 * item.scale, 14 * item.scale, 20 * item.scale);
        ctx.fillStyle = '#f0f3f8';
        ctx.fillRect(-7 * item.scale, 0, 14 * item.scale, 4 * item.scale);
        ctx.strokeStyle = '#1d2838';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-2 * item.scale, 1 * item.scale);
        ctx.lineTo(-2 * item.scale, 12 * item.scale);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(2 * item.scale, 1 * item.scale);
        ctx.lineTo(2 * item.scale, 12 * item.scale);
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  function drawObstacles() {
    obstacles.forEach((obs) => {
      const py = obs.y + worldY;
      if (py < -80 || py > height + 80) {
        return;
      }
      if (obs.type === 'tree') {
        ctx.fillStyle = '#8a5c2a';
        ctx.fillRect(obs.x + obs.w * 0.33, py, obs.w * 0.34, obs.h * 0.4);
        ctx.fillStyle = '#2d5f3f';
        ctx.beginPath();
        ctx.moveTo(obs.x - obs.w * 0.3, py + obs.h * 0.28);
        ctx.lineTo(obs.x + obs.w * 0.5, py - obs.h * 0.55);
        ctx.lineTo(obs.x + obs.w * 1.2, py + obs.h * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(obs.x - obs.w * 0.2, py + obs.h * 0.45);
        ctx.lineTo(obs.x + obs.w * 0.5, py - obs.h * 0.35);
        ctx.lineTo(obs.x + obs.w * 1.1, py + obs.h * 0.45);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#6b7a8f';
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.w / 2, py + obs.h / 2, obs.w / 2, obs.h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#8fa1b2';
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.w / 2 + 4, py + obs.h / 2 - 6, obs.w * 0.24, obs.h * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
      if (obs.type === 'tree') {
        ctx.strokeRect(obs.x + obs.w * 0.33, py, obs.w * 0.34, obs.h * 0.4);
      } else {
        ctx.stroke();
      }
    });
  }

  function drawPlayer() {
    const px = player.x;
    const py = player.y;
    ctx.save();
    ctx.translate(px + player.w / 2, py + player.h / 2);

    // Head
    ctx.fillStyle = '#fde2b7';
    ctx.beginPath();
    ctx.arc(0, -18, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Beanie
    ctx.fillStyle = '#bf4a7b';
    ctx.beginPath();
    ctx.arc(0, -23, 11, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-11, -23, 22, 8);
    ctx.fillStyle = '#f8d8e3';
    ctx.beginPath();
    ctx.arc(0, -25, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a3a3a';
    ctx.stroke();

    // Face
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.arc(-3, -18, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3, -18, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -14, 3.5, 0, Math.PI);
    ctx.stroke();

    // Body and limbs
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 18);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-18, 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(18, 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(-10, 32);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(10, 32);
    ctx.stroke();

    // Hood detail
    ctx.strokeStyle = '#bf4a7b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-7, -14);
    ctx.quadraticCurveTo(0, -8, 7, -14);
    ctx.stroke();

    // Ski poles
    ctx.strokeStyle = '#6b7d94';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, 8);
    ctx.lineTo(-32, 28);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(18, 8);
    ctx.lineTo(32, 28);
    ctx.stroke();

    // Skis
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-22, 38);
    ctx.lineTo(18, 48);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-2, 38);
    ctx.lineTo(38, 48);
    ctx.stroke();

    ctx.restore();
  }

  function drawParticles() {
    particles.forEach((particle) => {
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.fillStyle = particle.color;
      ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.6);
      ctx.restore();
    });
  }

  function drawVictory() {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillRect(40, 90, width - 80, 120);
    ctx.strokeStyle = '#5e5b57';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 90, width - 80, 120);
    ctx.fillStyle = '#3b3b3b';
    ctx.font = '700 36px "Space Mono", monospace';
    ctx.fillText('WINNER', 72, 140);
    ctx.font = '500 18px "Space Mono", monospace';
    ctx.fillText(`Time: ${elapsed.toFixed(2)}s`, 72, 175);
  }

  document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowLeft') {
      keys.left = true;
    }
    if (event.code === 'ArrowRight') {
      keys.right = true;
    }
    if (event.code === 'ArrowUp') {
      keys.up = true;
      event.preventDefault();
    }
  });

  document.addEventListener('keyup', (event) => {
    if (event.code === 'ArrowLeft') {
      keys.left = false;
    }
    if (event.code === 'ArrowRight') {
      keys.right = false;
    }
    if (event.code === 'ArrowUp') {
      keys.up = false;
    }
  });

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (won) {
        init();
      } else {
        started = true;
        if (!timerStart) {
          timerStart = performance.now();
        }
        if (startBtn) {
          startBtn.textContent = 'Restart';
        }
        if (overlayEl) {
          overlayEl.classList.add('d-none');
        }
        updateStatus('Downhill run started!');
      }
    });
  }

  if (overlayRestartBtn) {
    overlayRestartBtn.addEventListener('click', () => {
      init();
      started = true;
      if (!timerStart) {
        timerStart = performance.now();
      }
      updateStatus('Downhill run started!');
    });
  }

  window.addEventListener('blur', () => {
    keys.left = false;
    keys.right = false;
    keys.up = false;
  });

  init();
})();
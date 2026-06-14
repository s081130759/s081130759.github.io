const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const overlay = document.querySelector('#game-overlay');
const startButton = document.querySelector('#start-button');
const overlayLabel = document.querySelector('#overlay-label');
const overlayTitle = document.querySelector('#overlay-title');
const overlayCopy = document.querySelector('#overlay-copy');
const scoreElement = document.querySelector('#score');
const highScoreElement = document.querySelector('#high-score');
const waveElement = document.querySelector('#wave');
const livesElement = document.querySelector('#lives');
const soundButton = document.querySelector('.sound-button');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const keys = { left: false, right: false, fire: false };
let audioContext;
let soundEnabled = false;
let animationId;
let lastTime = 0;
let state = 'ready';
let score = 0;
let highScore = Number(localStorage.getItem('signal-invaders-high-score')) || 0;
let wave = 1;
let lives = 3;
let stars = [];
let player;
let enemies = [];
let playerShots = [];
let enemyShots = [];
let particles = [];
let enemyDirection = 1;
let enemyStepTimer = 0;
let enemyShotTimer = 0;
let nextEnemyShot = 1;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const intersects = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
const formatScore = (value) => String(value).padStart(6, '0');

function updateHud() {
  scoreElement.textContent = formatScore(score);
  highScoreElement.textContent = formatScore(highScore);
  waveElement.textContent = String(wave).padStart(2, '0');
  livesElement.textContent = '●'.repeat(lives) || '—';
}

function tone(frequency, duration = 0.06, type = 'square', volume = 0.035) {
  if (!soundEnabled) return;
  if (!audioContext) audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function makeStars() {
  stars = Array.from({ length: 85 }, () => ({
    x: Math.random() * WIDTH,
    y: Math.random() * HEIGHT,
    size: Math.random() * 2 + .4,
    alpha: Math.random() * .65 + .2,
  }));
}

function resetPlayer() {
  player = { x: WIDTH / 2 - 29, y: HEIGHT - 72, width: 58, height: 28, speed: 350, cooldown: 0, invulnerable: 1.4 };
}

function createWave() {
  enemies = [];
  const columns = 9;
  const rows = 5;
  const gapX = 14;
  const gapY = 18;
  const enemyWidth = 48;
  const enemyHeight = 32;
  const formationWidth = columns * enemyWidth + (columns - 1) * gapX;
  const startX = (WIDTH - formationWidth) / 2;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      enemies.push({
        x: startX + col * (enemyWidth + gapX),
        y: 95 + row * (enemyHeight + gapY),
        width: enemyWidth,
        height: enemyHeight,
        row,
        col,
        phase: (row + col) % 2,
      });
    }
  }
  enemyDirection = 1;
  enemyStepTimer = 0;
  enemyShotTimer = 0;
  nextEnemyShot = Math.max(.35, 1.05 - wave * .06);
}

function beginGame() {
  score = 0;
  wave = 1;
  lives = 3;
  playerShots = [];
  enemyShots = [];
  particles = [];
  resetPlayer();
  createWave();
  updateHud();
  state = 'playing';
  overlay.classList.add('is-hidden');
  lastTime = performance.now();
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameLoop);
  tone(220, .08, 'sawtooth');
}

function showOverlay(label, title, copy, buttonText) {
  overlayLabel.textContent = label;
  overlayTitle.textContent = title;
  overlayCopy.textContent = copy;
  startButton.textContent = buttonText;
  overlay.classList.remove('is-hidden');
}

function shoot() {
  if (player.cooldown > 0 || state !== 'playing') return;
  playerShots.push({ x: player.x + player.width / 2 - 2, y: player.y - 12, width: 4, height: 16, speed: 610 });
  player.cooldown = .24;
  tone(520, .045, 'square', .025);
}

function enemyShoot() {
  const bottomEnemies = [];
  for (const enemy of enemies) {
    const current = bottomEnemies[enemy.col];
    if (!current || enemy.y > current.y) bottomEnemies[enemy.col] = enemy;
  }
  const shooters = bottomEnemies.filter(Boolean);
  if (!shooters.length) return;
  const enemy = shooters[Math.floor(Math.random() * shooters.length)];
  enemyShots.push({ x: enemy.x + enemy.width / 2 - 3, y: enemy.y + enemy.height, width: 6, height: 15, speed: 250 + wave * 14 });
  tone(105, .04, 'sawtooth', .018);
}

function burst(x, y, color, count = 10) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 45 + Math.random() * 135;
    particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: .55 + Math.random() * .35, color, size: 2 + Math.random() * 3 });
  }
}

function loseLife() {
  if (player.invulnerable > 0) return;
  lives -= 1;
  burst(player.x + player.width / 2, player.y + player.height / 2, '#ff6948', 24);
  tone(65, .35, 'sawtooth', .055);
  updateHud();
  enemyShots = [];
  if (lives <= 0) {
    endGame('GAME OVER', `スコア ${formatScore(score)}。侵入者を止められませんでした。`);
  } else {
    resetPlayer();
  }
}

function endGame(title, copy) {
  state = 'ended';
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('signal-invaders-high-score', highScore);
  }
  updateHud();
  showOverlay('MISSION RESULT', title, copy, 'RETRY');
}

function nextWave() {
  wave += 1;
  playerShots = [];
  enemyShots = [];
  createWave();
  player.invulnerable = 1;
  updateHud();
  tone(330, .12, 'triangle', .04);
  setTimeout(() => tone(440, .16, 'triangle', .04), 120);
}

function update(delta) {
  player.cooldown = Math.max(0, player.cooldown - delta);
  player.invulnerable = Math.max(0, player.invulnerable - delta);
  if (keys.left) player.x -= player.speed * delta;
  if (keys.right) player.x += player.speed * delta;
  player.x = clamp(player.x, 18, WIDTH - player.width - 18);
  if (keys.fire) shoot();

  playerShots.forEach((shot) => { shot.y -= shot.speed * delta; });
  enemyShots.forEach((shot) => { shot.y += shot.speed * delta; });
  playerShots = playerShots.filter((shot) => shot.y + shot.height > 0);
  enemyShots = enemyShots.filter((shot) => shot.y < HEIGHT);

  const enemySpeed = 32 + wave * 7 + (45 - enemies.length) * .75;
  let hitEdge = false;
  for (const enemy of enemies) {
    enemy.x += enemyDirection * enemySpeed * delta;
    if (enemy.x < 15 || enemy.x + enemy.width > WIDTH - 15) hitEdge = true;
  }
  if (hitEdge) {
    enemyDirection *= -1;
    enemies.forEach((enemy) => {
      enemy.x = clamp(enemy.x, 15, WIDTH - enemy.width - 15);
      enemy.y += 18;
    });
    tone(85, .035, 'square', .012);
  }

  enemyStepTimer += delta;
  if (enemyStepTimer > .38) {
    enemies.forEach((enemy) => { enemy.phase = 1 - enemy.phase; });
    enemyStepTimer = 0;
  }
  enemyShotTimer += delta;
  if (enemyShotTimer >= nextEnemyShot) {
    enemyShoot();
    enemyShotTimer = 0;
    nextEnemyShot = Math.max(.28, .75 + Math.random() * .55 - wave * .055);
  }

  for (let shotIndex = playerShots.length - 1; shotIndex >= 0; shotIndex -= 1) {
    const shot = playerShots[shotIndex];
    const enemyIndex = enemies.findIndex((enemy) => intersects(shot, enemy));
    if (enemyIndex !== -1) {
      const enemy = enemies[enemyIndex];
      score += (5 - enemy.row) * 20;
      burst(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.row < 2 ? '#ff6948' : '#68e6da');
      tone(180 + (4 - enemy.row) * 45, .07, 'square', .025);
      enemies.splice(enemyIndex, 1);
      playerShots.splice(shotIndex, 1);
      updateHud();
    }
  }

  if (player.invulnerable <= 0 && enemyShots.some((shot) => intersects(shot, player))) loseLife();
  if (enemies.some((enemy) => enemy.y + enemy.height >= player.y - 8)) endGame('OVERRUN', '侵入者が防衛ラインへ到達しました。');
  if (!enemies.length && state === 'playing') nextWave();

  particles.forEach((particle) => {
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    particle.vy += 80 * delta;
    particle.life -= delta;
  });
  particles = particles.filter((particle) => particle.life > 0);
}

function drawPlayer() {
  if (player.invulnerable > 0 && Math.floor(player.invulnerable * 12) % 2 === 0) return;
  ctx.fillStyle = '#eff6ef';
  ctx.fillRect(player.x + 23, player.y, 12, 8);
  ctx.fillRect(player.x + 12, player.y + 8, 34, 7);
  ctx.fillRect(player.x, player.y + 15, 58, 13);
  ctx.fillStyle = '#68e6da';
  ctx.fillRect(player.x + 8, player.y + 21, 8, 7);
  ctx.fillRect(player.x + 42, player.y + 21, 8, 7);
}

function drawEnemy(enemy) {
  const colors = ['#ff6948', '#ff6948', '#ffd35a', '#68e6da', '#68e6da'];
  ctx.fillStyle = colors[enemy.row];
  const x = Math.round(enemy.x);
  const y = Math.round(enemy.y);
  ctx.fillRect(x + 12, y, 24, 5);
  ctx.fillRect(x + 6, y + 5, 36, 5);
  ctx.fillRect(x, y + 10, 48, 12);
  ctx.fillRect(x + 6, y + 22, 9, 5);
  ctx.fillRect(x + 33, y + 22, 9, 5);
  if (enemy.phase) {
    ctx.fillRect(x, y + 27, 7, 5);
    ctx.fillRect(x + 41, y + 27, 7, 5);
  } else {
    ctx.fillRect(x + 11, y + 27, 7, 5);
    ctx.fillRect(x + 30, y + 27, 7, 5);
  }
  ctx.fillStyle = '#050911';
  ctx.fillRect(x + 11, y + 13, 6, 6);
  ctx.fillRect(x + 31, y + 13, 6, 6);
}

function draw() {
  ctx.fillStyle = '#050911';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  stars.forEach((star) => {
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = '#b8c9dc';
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
  ctx.globalAlpha = 1;

  ctx.strokeStyle = '#1c2a3d';
  ctx.setLineDash([6, 9]);
  ctx.beginPath();
  ctx.moveTo(0, HEIGHT - 33);
  ctx.lineTo(WIDTH, HEIGHT - 33);
  ctx.stroke();
  ctx.setLineDash([]);

  enemies.forEach(drawEnemy);
  ctx.fillStyle = '#eff6ef';
  playerShots.forEach((shot) => ctx.fillRect(shot.x, shot.y, shot.width, shot.height));
  ctx.fillStyle = '#ff6948';
  enemyShots.forEach((shot) => ctx.fillRect(shot.x, shot.y, shot.width, shot.height));
  particles.forEach((particle) => {
    ctx.globalAlpha = Math.min(1, particle.life * 2);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  });
  ctx.globalAlpha = 1;
  if (player) drawPlayer();
}

function gameLoop(time) {
  const delta = Math.min((time - lastTime) / 1000, .034);
  lastTime = time;
  if (state === 'playing') update(delta);
  draw();
  if (state === 'playing') animationId = requestAnimationFrame(gameLoop);
}

function setKey(key, pressed) {
  if (key === 'ArrowLeft' || key.toLowerCase() === 'a') keys.left = pressed;
  if (key === 'ArrowRight' || key.toLowerCase() === 'd') keys.right = pressed;
  if (key === ' ') keys.fire = pressed;
}

window.addEventListener('keydown', (event) => {
  if (['ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault();
  setKey(event.key, true);
});
window.addEventListener('keyup', (event) => setKey(event.key, false));
window.addEventListener('blur', () => Object.keys(keys).forEach((key) => { keys[key] = false; }));
startButton.addEventListener('click', beginGame);
soundButton.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundButton.setAttribute('aria-pressed', String(soundEnabled));
  soundButton.textContent = soundEnabled ? 'SOUND OFF' : 'SOUND ON';
  if (soundEnabled) tone(440, .08, 'triangle');
});

function bindControl(selector, key) {
  const button = document.querySelector(selector);
  const press = (event) => {
    event.preventDefault();
    keys[key] = true;
    if (key === 'fire') shoot();
    button.classList.add('is-pressed');
  };
  const release = (event) => { event.preventDefault(); keys[key] = false; button.classList.remove('is-pressed'); };
  button.addEventListener('pointerdown', press);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('pointerleave', release);
}

bindControl('#move-left', 'left');
bindControl('#move-right', 'right');
bindControl('#fire', 'fire');
makeStars();
resetPlayer();
updateHud();
draw();

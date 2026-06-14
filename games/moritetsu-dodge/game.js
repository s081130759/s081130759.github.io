const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');
const overlay = document.querySelector('#game-overlay');
const startButton = document.querySelector('#start-button');
const overlayLabel = document.querySelector('#overlay-label');
const overlayTitle = document.querySelector('#overlay-title');
const overlayCopy = document.querySelector('#overlay-copy');
const scoreElement = document.querySelector('#score');
const highScoreElement = document.querySelector('#high-score');
const levelElement = document.querySelector('#level');
const livesElement = document.querySelector('#lives');
const soundButton = document.querySelector('.sound-button');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND_Y = 714;
const keys = { left: false, right: false };
const JUMP_HOLD_LIMIT = .24;
const images = {};
const assetNames = ['moritetsu', 'jump', 'bolt', 'nut', 'wrench', 'pliers', 'insulator', 'steel'];
const hazardTypes = [
  { name: 'bolt', size: 54, speed: 330, spin: 3.8, points: 18 },
  { name: 'nut', size: 62, speed: 290, spin: -4.8, points: 22 },
  { name: 'wrench', size: 86, speed: 245, spin: 2.5, points: 28 },
  { name: 'pliers', size: 82, speed: 265, spin: -3.1, points: 30 },
  { name: 'insulator', size: 96, speed: 220, spin: 1.6, points: 35 },
  { name: 'steel', size: 126, speed: 185, spin: .75, points: 50 },
];
const trainTypes = [
  { series: '315', category: 'LOCAL', formations: [4, 8], speed: [88, 105], weight: 28 },
  { series: '383', category: 'LIMITED EXPRESS', formations: [6, 8, 10], speed: [142, 166], weight: 18 },
  { series: '385', category: 'TEST RUN', formations: [8], speed: [150, 174], weight: 10 },
  { series: '211', category: 'MEMORY', formations: [3, 6], speed: [80, 96], weight: 9 },
  { series: '313', category: 'LOCAL', formations: [2, 4, 6], speed: [96, 118], weight: 35 },
];

let audioContext;
let soundEnabled = false;
let musicTimer;
let musicStep = 0;
let animationId;
let lastTime = 0;
let state = 'ready';
let score = 0;
let highScore = Number(localStorage.getItem('moritetsu-safety-dash-high-score')) || 0;
let lives = 3;
let level = 1;
let elapsed = 0;
let spawnTimer = 0;
let nextSpawn = .75;
let player;
let hazards = [];
let impacts = [];
let particles = [];
let clouds = [];
let train;
let jumpHeld = false;
let jumpHoldTime = 0;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const random = (min, max) => min + Math.random() * (max - min);
const formatScore = (value) => String(Math.floor(value)).padStart(6, '0');

function loadAssets() {
  return Promise.all(assetNames.map((name) => new Promise((resolve) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = resolve;
    image.src = `assets/${name}.png`;
    images[name] = image;
  })));
}

function updateHud() {
  scoreElement.textContent = formatScore(score);
  highScoreElement.textContent = formatScore(highScore);
  levelElement.textContent = String(level).padStart(2, '0');
  livesElement.textContent = '●'.repeat(lives) || '—';
}

function tone(frequency, duration = .07, type = 'square', volume = .035) {
  if (!soundEnabled) return;
  if (!audioContext) audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function impactSound(weight = 1) {
  if (!soundEnabled) return;
  tone(72 - weight * 8, .18 + weight * .05, 'sine', .045);
  setTimeout(() => tone(125 - weight * 10, .07, 'square', .018), 18);
  if (!audioContext) return;
  const duration = .09 + weight * .035;
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
  }
  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  source.buffer = buffer;
  filter.type = 'lowpass';
  filter.frequency.value = 480 - weight * 55;
  gain.gain.value = .045 + weight * .012;
  source.connect(filter).connect(gain).connect(audioContext.destination);
  source.start();
}

function playMusicBeat() {
  if (!soundEnabled || state !== 'playing') return;
  const bass = [110, 110, 147, 123, 110, 165, 147, 123];
  const melody = [330, 392, 440, 392, 330, 494, 440, 392];
  const step = musicStep % bass.length;
  tone(bass[step], .16, 'triangle', .009);
  if (step % 2 === 0) tone(melody[step], .1, 'sine', .006);
  musicStep += 1;
}

function startMusic() {
  clearInterval(musicTimer);
  if (!soundEnabled || state !== 'playing') return;
  musicStep = 0;
  playMusicBeat();
  musicTimer = setInterval(playMusicBeat, 360);
}

function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = undefined;
}

function resetPlayer() {
  player = {
    x: WIDTH / 2 - 43,
    y: GROUND_Y - 128,
    baseY: GROUND_Y - 128,
    width: 86,
    height: 128,
    speed: 365,
    vy: 0,
    onGround: true,
    invulnerable: 1.25,
  };
}

function makeClouds() {
  clouds = Array.from({ length: 7 }, (_, index) => ({
    x: index * 135 + random(-45, 45),
    y: random(70, 310),
    size: random(45, 95),
    speed: random(5, 13),
  }));
  prepareNextTrain(.65);
}

function weightedChoice(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let pick = Math.random() * total;
  for (const item of items) {
    pick -= item.weight;
    if (pick <= 0) return item;
  }
  return items[items.length - 1];
}

function prepareNextTrain(wait = random(6, 12)) {
  const type = weightedChoice(trainTypes);
  const cars = type.formations[Math.floor(Math.random() * type.formations.length)];
  const direction = Math.random() < .5 ? 1 : -1;
  const carWidth = type.series === '383' || type.series === '385' ? 104 : 94;
  const length = cars * carWidth + 42;
  const initialRun = wait < 1;
  train = {
    ...type,
    cars,
    direction,
    carWidth,
    length,
    x: initialRun
      ? (direction > 0 ? -length * .62 : WIDTH - length * .38)
      : (direction > 0 ? -length - 80 : WIDTH + 80),
    speed: random(type.speed[0], type.speed[1]),
    wait,
  };
}

function beginGame() {
  score = 0;
  lives = 3;
  level = 1;
  elapsed = 0;
  spawnTimer = 0;
  nextSpawn = .9;
  hazards = [];
  impacts = [];
  particles = [];
  jumpHeld = false;
  jumpHoldTime = 0;
  resetPlayer();
  updateHud();
  state = 'playing';
  overlay.classList.add('is-hidden');
  lastTime = performance.now();
  cancelAnimationFrame(animationId);
  animationId = requestAnimationFrame(gameLoop);
  tone(330, .08, 'triangle');
  setTimeout(() => tone(495, .1, 'triangle'), 80);
  startMusic();
}

function showOverlay(label, title, copy, buttonText) {
  overlayLabel.textContent = label;
  overlayTitle.textContent = title;
  overlayCopy.textContent = copy;
  startButton.textContent = buttonText;
  overlay.classList.remove('is-hidden');
}

function beginJump() {
  if (state !== 'playing' || !player.onGround) return;
  player.vy = -610;
  player.onGround = false;
  jumpHeld = true;
  jumpHoldTime = 0;
  tone(430, .08, 'square', .025);
}

function endJump() {
  jumpHeld = false;
  if (player && player.vy < -180) player.vy *= .65;
}

function spawnHazard() {
  const maxIndex = Math.min(hazardTypes.length, 3 + Math.floor(level / 2));
  const type = hazardTypes[Math.floor(Math.random() * maxIndex)];
  const scale = random(.82, 1.18);
  const size = type.size * scale;
  hazards.push({
    ...type,
    x: random(18, WIDTH - size - 18),
    y: random(72, 112) - size,
    width: size,
    height: size,
    speed: type.speed * random(.9, 1.16) * (1 + (level - 1) * .045),
    angle: random(0, Math.PI * 2),
    spin: type.spin * random(.75, 1.25),
    scored: false,
  });
}

function playerHitbox() {
  return {
    x: player.x + 27,
    y: player.y + 20,
    width: player.width - 54,
    height: player.height - 31,
  };
}

function hazardHitbox(hazard) {
  const inset = hazard.name === 'steel' ? .14 : .22;
  return {
    x: hazard.x + hazard.width * inset,
    y: hazard.y + hazard.height * inset,
    width: hazard.width * (1 - inset * 2),
    height: hazard.height * (1 - inset * 2),
  };
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function burst(x, y, color, count = 12) {
  for (let index = 0; index < count; index += 1) {
    const angle = random(0, Math.PI * 2);
    const speed = random(45, 180);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: random(.35, .8),
      color,
      size: random(3, 8),
    });
  }
}

function takeHit(x, y) {
  if (player.invulnerable > 0) return;
  lives -= 1;
  player.invulnerable = 1.55;
  player.vy = -280;
  player.onGround = false;
  burst(x, y, '#e8562a', 24);
  tone(75, .3, 'sawtooth', .055);
  updateHud();
  if (lives <= 0) endGame();
}

function endGame() {
  state = 'ended';
  stopMusic();
  if (score > highScore) {
    highScore = Math.floor(score);
    localStorage.setItem('moritetsu-safety-dash-high-score', highScore);
  }
  updateHud();
  showOverlay('SAFETY REPORT', '作業終了', `スコア ${formatScore(score)}。安全を確認して、もう一度挑戦しましょう。`, 'RETRY');
}

function update(delta) {
  elapsed += delta;
  const nextLevel = Math.min(12, 1 + Math.floor(elapsed / 14));
  if (nextLevel !== level) {
    level = nextLevel;
    updateHud();
    tone(600, .12, 'triangle', .03);
  }

  player.invulnerable = Math.max(0, player.invulnerable - delta);
  if (keys.left) player.x -= player.speed * delta;
  if (keys.right) player.x += player.speed * delta;
  player.x = clamp(player.x, 15, WIDTH - player.width - 15);
  if (jumpHeld && player.vy < 0 && jumpHoldTime < JUMP_HOLD_LIMIT) {
    player.vy -= 1180 * delta;
    jumpHoldTime += delta;
  } else if (jumpHoldTime >= JUMP_HOLD_LIMIT) {
    jumpHeld = false;
  }
  player.vy += 1420 * delta;
  player.y += player.vy * delta;
  if (player.y >= player.baseY) {
    player.y = player.baseY;
    player.vy = 0;
    player.onGround = true;
  }

  spawnTimer += delta;
  if (spawnTimer >= nextSpawn) {
    spawnHazard();
    if (level >= 6 && Math.random() < .16) spawnHazard();
    spawnTimer = 0;
    nextSpawn = random(.42, .78) * Math.max(.52, 1 - (level - 1) * .045);
  }

  const hitbox = playerHitbox();
  for (const hazard of hazards) {
    hazard.y += hazard.speed * delta;
    hazard.angle += hazard.spin * delta;
    if (player.invulnerable <= 0 && intersects(hitbox, hazardHitbox(hazard))) {
      hazard.y = HEIGHT + 100;
      takeHit(player.x + player.width / 2, player.y + player.height / 2);
    }
    if (!hazard.scored && hazard.y > player.y + player.height) {
      hazard.scored = true;
      score += hazard.points;
      updateHud();
    }
    if (hazard.y + hazard.height >= GROUND_Y && hazard.y < GROUND_Y) {
      hazard.y = GROUND_Y;
      impacts.push({ x: hazard.x + hazard.width / 2, radius: 10, life: .46, maxLife: .46 });
      burst(hazard.x + hazard.width / 2, GROUND_Y, '#d9a024', 9);
      const weight = clamp(hazard.width / 70, .7, 1.8);
      impactSound(weight);
    }
  }
  hazards = hazards.filter((hazard) => hazard.y < HEIGHT + 50);

  for (const impact of impacts) {
    impact.life -= delta;
    impact.radius += 270 * delta;
    const feetX = player.x + player.width / 2;
    const nearImpact = Math.abs(feetX - impact.x) < impact.radius + 18;
    const onGround = player.y > player.baseY - 30;
    if (impact.life > .18 && nearImpact && onGround) takeHit(feetX, GROUND_Y - 8);
  }
  impacts = impacts.filter((impact) => impact.life > 0);

  particles.forEach((particle) => {
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    particle.vy += 260 * delta;
    particle.life -= delta;
  });
  particles = particles.filter((particle) => particle.life > 0);

  clouds.forEach((cloud) => {
    cloud.x += cloud.speed * delta;
    if (cloud.x - cloud.size > WIDTH) cloud.x = -cloud.size * 2;
  });

  if (train.wait > 0) {
    train.wait -= delta;
  } else {
    train.x += train.speed * train.direction * delta;
    const leftScene = train.direction < 0 && train.x + train.length < -80;
    const rightScene = train.direction > 0 && train.x > WIDTH + 80;
    if (leftScene || rightScene) prepareNextTrain();
  }

  score += delta * (5 + level);
  if (Math.floor(score) % 5 === 0) updateHud();
}

function drawCloud(cloud) {
  ctx.fillStyle = 'rgba(255,255,255,.72)';
  ctx.beginPath();
  ctx.arc(cloud.x, cloud.y, cloud.size * .28, 0, Math.PI * 2);
  ctx.arc(cloud.x + cloud.size * .28, cloud.y - cloud.size * .1, cloud.size * .35, 0, Math.PI * 2);
  ctx.arc(cloud.x + cloud.size * .62, cloud.y, cloud.size * .27, 0, Math.PI * 2);
  ctx.fill();
}

function getDaylight() {
  const cycle = (elapsed % 90) / 90;
  if (cycle < .38) return { phase: 'DAY', amount: 0, stars: 0 };
  if (cycle < .55) {
    const amount = (cycle - .38) / .17;
    return { phase: 'SUNSET', amount, stars: 0 };
  }
  if (cycle < .83) return { phase: 'NIGHT', amount: 1, stars: clamp((cycle - .55) / .08, 0, 1) };
  const amount = 1 - (cycle - .83) / .17;
  return { phase: 'DAWN', amount, stars: clamp(amount, 0, 1) };
}

function colorMix(day, night, amount) {
  const parse = (hex) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
  const a = parse(day);
  const b = parse(night);
  return `rgb(${a.map((value, index) => Math.round(value + (b[index] - value) * amount)).join(',')})`;
}

function drawSky(daylight) {
  const night = daylight.amount;
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  const top = daylight.phase === 'SUNSET' || daylight.phase === 'DAWN'
    ? colorMix('#79c9eb', '#3a245d', night)
    : colorMix('#70c6eb', '#07182e', night);
  const horizon = daylight.phase === 'SUNSET' || daylight.phase === 'DAWN'
    ? colorMix('#e8f5ed', '#e98252', Math.min(1, night * .78))
    : colorMix('#e9f8ee', '#17344d', night);
  gradient.addColorStop(0, top);
  gradient.addColorStop(.68, horizon);
  gradient.addColorStop(1, colorMix('#d9d0ac', '#172638', night));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (daylight.stars > 0) {
    ctx.fillStyle = `rgba(255,246,205,${daylight.stars * .88})`;
    for (let index = 0; index < 34; index += 1) {
      const x = (index * 83 + 37) % WIDTH;
      const y = 26 + ((index * 47) % 315);
      const radius = index % 7 === 0 ? 1.7 : 1;
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    }
  }

  const orbX = daylight.phase === 'NIGHT' ? 575 : 590;
  const orbY = daylight.phase === 'NIGHT' ? 105 : 125;
  ctx.fillStyle = daylight.amount > .65 ? '#f3edd2' : '#fff1a6';
  ctx.beginPath(); ctx.arc(orbX, orbY, daylight.amount > .65 ? 25 : 32, 0, Math.PI * 2); ctx.fill();
  if (daylight.amount > .65) {
    ctx.fillStyle = colorMix('#70c6eb', '#07182e', daylight.amount);
    ctx.beginPath(); ctx.arc(orbX + 10, orbY - 8, 23, 0, Math.PI * 2); ctx.fill();
  }
}

function drawDistantRailway(daylight) {
  ctx.fillStyle = colorMix('#8b806b', '#293239', daylight.amount);
  ctx.fillRect(0, 508, WIDTH, 18);
  ctx.fillStyle = colorMix('#596c72', '#26343b', daylight.amount);
  ctx.fillRect(0, 500, WIDTH, 8);
  ctx.fillStyle = colorMix('#a99b7d', '#42464a', daylight.amount);
  for (let x = 0; x < WIDTH; x += 28) ctx.fillRect(x, 506, 18, 15);
  ctx.strokeStyle = colorMix('#39464a', '#111a20', daylight.amount);
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 502); ctx.lineTo(WIDTH, 502); ctx.moveTo(0, 518); ctx.lineTo(WIDTH, 518); ctx.stroke();
}

function drawPantograph(x, y, width) {
  ctx.strokeStyle = '#28343a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x + width * .35, y - 13); ctx.lineTo(x + width * .62, y); ctx.lineTo(x + width * .25, y - 13); ctx.lineTo(x + width, y - 13);
  ctx.stroke();
}

function drawTrainCar(series, carIndex, cars, x, y, width, direction, daylight) {
  const isFront = direction > 0 ? carIndex === cars - 1 : carIndex === 0;
  const isRear = direction > 0 ? carIndex === 0 : carIndex === cars - 1;
  const endCar = isFront || isRear;
  const h = series === '383' || series === '385' ? 62 : 58;
  const bodyTop = y + (series === '383' ? 4 : 8);
  ctx.save();
  ctx.translate(x, 0);

  ctx.fillStyle = series === '385' ? '#f5f3e9' : '#e8edeb';
  if (endCar && (series === '383' || series === '385')) {
    ctx.beginPath();
    const nose = isFront ? width : 0;
    if (isFront) {
      ctx.moveTo(0, bodyTop); ctx.lineTo(width - 22, bodyTop); ctx.quadraticCurveTo(width + 7, bodyTop + 18, width + 11, bodyTop + h - 5); ctx.lineTo(0, bodyTop + h); ctx.closePath();
    } else {
      ctx.moveTo(width, bodyTop); ctx.lineTo(22, bodyTop); ctx.quadraticCurveTo(-7, bodyTop + 18, -11, bodyTop + h - 5); ctx.lineTo(width, bodyTop + h); ctx.closePath();
    }
    ctx.fill();
  } else {
    ctx.fillRect(0, bodyTop, width - 3, h);
  }

  if (series === '315') {
    ctx.fillStyle = '#f18a21'; ctx.fillRect(0, bodyTop + 37, width - 3, 7);
    ctx.fillStyle = '#9baab0'; ctx.fillRect(0, bodyTop + 45, width - 3, 3);
  } else if (series === '313') {
    ctx.fillStyle = '#ef7c22'; ctx.fillRect(0, bodyTop + 39, width - 3, 6);
    ctx.fillStyle = '#3e738e'; ctx.fillRect(0, bodyTop + 47, width - 3, 3);
  } else if (series === '211') {
    ctx.fillStyle = '#ef7921'; ctx.fillRect(0, bodyTop + 37, width - 3, 7);
    ctx.fillStyle = '#2e7b5d'; ctx.fillRect(0, bodyTop + 45, width - 3, 5);
  } else if (series === '383') {
    ctx.fillStyle = '#ef7b22'; ctx.fillRect(0, bodyTop + 42, width, 5);
    ctx.fillStyle = '#616b70'; ctx.fillRect(0, bodyTop + 48, width, 3);
  } else {
    const green = ctx.createLinearGradient(0, 0, width, 0);
    green.addColorStop(0, '#184c3b'); green.addColorStop(.55, '#51a46d'); green.addColorStop(1, '#224d3d');
    ctx.fillStyle = green;
    ctx.beginPath(); ctx.moveTo(0, bodyTop + 46); ctx.bezierCurveTo(width * .3, bodyTop + 27, width * .65, bodyTop + 58, width, bodyTop + 34); ctx.lineTo(width, bodyTop + 54); ctx.lineTo(0, bodyTop + 54); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ed7e26'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, bodyTop + 50); ctx.bezierCurveTo(width * .42, bodyTop + 32, width * .7, bodyTop + 55, width, bodyTop + 40); ctx.stroke();
  }

  ctx.fillStyle = series === '385' ? '#183b37' : '#17394e';
  const windowY = bodyTop + 15;
  if (endCar && (series === '383' || series === '385')) {
    const cabX = isFront ? width - 29 : 7;
    ctx.beginPath();
    if (isFront) { ctx.moveTo(cabX, windowY); ctx.lineTo(width - 8, windowY + 7); ctx.lineTo(width - 3, windowY + 25); ctx.lineTo(cabX, windowY + 25); }
    else { ctx.moveTo(8, windowY + 7); ctx.lineTo(29, windowY); ctx.lineTo(29, windowY + 25); ctx.lineTo(3, windowY + 25); }
    ctx.closePath(); ctx.fill();
  }
  const windowStart = endCar && (series === '383' || series === '385') ? 34 : 10;
  const windowEnd = endCar && (series === '383' || series === '385') ? width - 34 : width - 8;
  for (let wx = windowStart; wx < windowEnd - 12; wx += 22) ctx.fillRect(wx, windowY, 15, series === '383' || series === '385' ? 23 : 18);

  if (series === '315' || series === '313' || series === '211') {
    ctx.fillStyle = '#cfd8d5';
    for (let door = 22; door < width - 12; door += 42) ctx.fillRect(door, bodyTop + 12, 13, 43);
  }
  ctx.strokeStyle = colorMix('#52646c', '#18242a', daylight.amount); ctx.lineWidth = 2; ctx.strokeRect(0, bodyTop, width - 3, h);
  ctx.fillStyle = '#273238';
  ctx.beginPath(); ctx.arc(width * .25, bodyTop + h + 2, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(width * .75, bodyTop + h + 2, 7, 0, Math.PI * 2); ctx.fill();
  if (carIndex % 2 === 1 && !endCar) drawPantograph(width * .2, bodyTop, width * .54);

  if (isFront && daylight.amount > .45) {
    ctx.fillStyle = '#ffe8a5';
    const lampX = direction > 0 ? width + 1 : -2;
    ctx.beginPath(); ctx.arc(lampX, bodyTop + 39, 3.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawTrain(daylight) {
  if (train.wait > 0) return;
  const y = 425;
  ctx.save();
  ctx.globalAlpha = .9;
  for (let car = 0; car < train.cars; car += 1) {
    drawTrainCar(train.series, car, train.cars, train.x + car * train.carWidth, y, train.carWidth, train.direction, daylight);
  }
  ctx.restore();
}

function drawCatenaryPole(x, daylight, mirror = false) {
  const direction = mirror ? -1 : 1;
  const metal = colorMix('#49606a', '#1b2931', daylight.amount);
  ctx.strokeStyle = metal;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 7, 18); ctx.lineTo(x - 7, 600);
  ctx.moveTo(x + 7, 18); ctx.lineTo(x + 7, 600);
  ctx.stroke();
  ctx.lineWidth = 2;
  for (let y = 30; y < 580; y += 42) {
    ctx.beginPath();
    ctx.moveTo(x - 7, y); ctx.lineTo(x + 7, y + 42);
    ctx.moveTo(x + 7, y); ctx.lineTo(x - 7, y + 42);
    ctx.stroke();
  }
  ctx.fillStyle = metal;
  ctx.fillRect(x - 14, 596, 28, 8);
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(x, 68); ctx.lineTo(x + direction * 132, 68); ctx.lineTo(x + direction * 108, 104); ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x + direction * 24, 68); ctx.lineTo(x + direction * 82, 28); ctx.lineTo(x + direction * 119, 68); ctx.stroke();
  ctx.fillStyle = colorMix('#dde6e2', '#89979c', daylight.amount);
  for (let offset = 74; offset <= 98; offset += 8) {
    ctx.beginPath(); ctx.ellipse(x + direction * 111, offset, 11, 4, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = metal;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x + direction * 111, 101); ctx.lineTo(x + direction * 111, 132); ctx.stroke();

  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x, 215); ctx.lineTo(x + direction * 52, 215); ctx.stroke();
  ctx.fillStyle = colorMix('#f0e8c8', '#ffe6a0', daylight.amount);
  ctx.beginPath(); ctx.ellipse(x + direction * 62, 218, 14, 8, .12 * direction, 0, Math.PI * 2); ctx.fill();
  if (daylight.amount > .45) {
    const glow = ctx.createRadialGradient(x + direction * 62, 220, 2, x + direction * 62, 220, 55);
    glow.addColorStop(0, `rgba(255,229,143,${daylight.amount * .48})`);
    glow.addColorStop(1, 'rgba(255,229,143,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x + direction * 62, 220, 55, 0, Math.PI * 2); ctx.fill();
  }
}

function drawCatenary(daylight) {
  drawCatenaryPole(42, daylight, false);
  drawCatenaryPole(678, daylight, true);
  ctx.strokeStyle = colorMix('#263f4c', '#111b23', daylight.amount);
  ctx.lineCap = 'round';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 102); ctx.bezierCurveTo(170, 77, 550, 77, WIDTH, 102);
  ctx.moveTo(0, 137); ctx.bezierCurveTo(180, 130, 540, 130, WIDTH, 137);
  ctx.stroke();
  for (let x = 42; x <= 678; x += 53) {
    const messengerY = 85 + 17 * Math.pow((x - WIDTH / 2) / (WIDTH / 2), 2);
    const contactY = 133 + 4 * Math.pow((x - WIDTH / 2) / (WIDTH / 2), 2);
    ctx.beginPath(); ctx.moveTo(x, messengerY); ctx.lineTo(x, contactY); ctx.stroke();
  }
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 158); ctx.lineTo(WIDTH, 154); ctx.stroke();
  ctx.lineCap = 'butt';
}

function drawTracksideEquipment(daylight) {
  const dark = colorMix('#334951', '#17242b', daylight.amount);
  const pale = colorMix('#d6ddda', '#667279', daylight.amount);
  ctx.fillStyle = dark;
  ctx.fillRect(78, 575, 3, 108);
  ctx.fillRect(72, 571, 15, 7);
  ctx.fillStyle = '#1c2b32';
  ctx.fillRect(68, 584, 24, 56);
  ctx.fillStyle = daylight.amount > .45 ? '#f05a3e' : '#b84431';
  ctx.beginPath(); ctx.arc(80, 598, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#26373e';
  ctx.beginPath(); ctx.arc(80, 616, 5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = pale;
  ctx.fillRect(595, 584, 57, 78);
  ctx.strokeStyle = dark;
  ctx.lineWidth = 3;
  ctx.strokeRect(595, 584, 57, 78);
  ctx.beginPath(); ctx.moveTo(623, 584); ctx.lineTo(623, 662); ctx.stroke();
  ctx.fillStyle = '#f0c541';
  ctx.fillRect(603, 596, 41, 9);

  ctx.fillStyle = colorMix('#c6bd9d', '#4b5153', daylight.amount);
  ctx.fillRect(110, 675, 485, 13);
  ctx.strokeStyle = dark;
  ctx.lineWidth = 2;
  for (let x = 120; x < 590; x += 35) {
    ctx.beginPath(); ctx.moveTo(x, 676); ctx.lineTo(x, 687); ctx.stroke();
  }

  ctx.strokeStyle = colorMix('#6f7c79', '#303b3e', daylight.amount);
  ctx.lineWidth = 3;
  for (let x = 155; x <= 555; x += 80) {
    ctx.beginPath(); ctx.moveTo(x, 612); ctx.lineTo(x, 672); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(155, 622); ctx.lineTo(555, 622); ctx.moveTo(155, 646); ctx.lineTo(555, 646); ctx.stroke();
}

function drawBackground() {
  const daylight = getDaylight();
  drawSky(daylight);
  clouds.forEach(drawCloud);

  ctx.fillStyle = colorMix('#77a862', '#263c35', daylight.amount);
  ctx.beginPath();
  ctx.moveTo(0, 520);
  ctx.quadraticCurveTo(100, 430, 210, 515);
  ctx.quadraticCurveTo(340, 390, 470, 510);
  ctx.quadraticCurveTo(590, 430, 720, 520);
  ctx.lineTo(720, 640);
  ctx.lineTo(0, 640);
  ctx.fill();

  drawDistantRailway(daylight);
  drawTrain(daylight);
  drawCatenary(daylight);
  drawTracksideEquipment(daylight);

  ctx.fillStyle = colorMix('#7d715b', '#2d3133', daylight.amount);
  ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);
  ctx.fillStyle = colorMix('#b7a27b', '#4a4c4d', daylight.amount);
  for (let x = -10; x < WIDTH; x += 52) ctx.fillRect(x, GROUND_Y + 38, 35, 10);
  ctx.strokeStyle = '#343c3f';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + 26); ctx.lineTo(WIDTH, GROUND_Y + 26);
  ctx.moveTo(0, GROUND_Y + 72); ctx.lineTo(WIDTH, GROUND_Y + 72);
  ctx.stroke();
  ctx.strokeStyle = '#f4d23e';
  ctx.lineWidth = 5;
  ctx.setLineDash([22, 18]);
  ctx.beginPath(); ctx.moveTo(0, GROUND_Y - 3); ctx.lineTo(WIDTH, GROUND_Y - 3); ctx.stroke();
  ctx.setLineDash([]);

  if (daylight.amount > 0) {
    ctx.fillStyle = `rgba(4,14,28,${daylight.amount * .24})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
}

function drawHazard(hazard) {
  const image = images[hazard.name];
  if (!image?.complete) return;
  ctx.save();
  ctx.translate(hazard.x + hazard.width / 2, hazard.y + hazard.height / 2);
  ctx.rotate(hazard.angle);
  ctx.drawImage(image, -hazard.width / 2, -hazard.height / 2, hazard.width, hazard.height);
  ctx.restore();
}

function drawPlayer() {
  const sprite = player.onGround ? images.moritetsu : images.jump;
  if (!sprite?.complete) return;
  if (player.invulnerable > 0 && Math.floor(player.invulnerable * 12) % 2 === 0) return;
  ctx.save();
  if (keys.left && !keys.right) {
    ctx.translate(player.x + player.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(sprite, 0, player.y, player.width, player.height);
  } else {
    ctx.drawImage(sprite, player.x, player.y, player.width, player.height);
  }
  ctx.restore();
}

function drawPlayerHeadlight(daylight, foreground = false) {
  if (daylight.amount < .42 || !player) return;
  const facing = keys.left && !keys.right ? -1 : 1;
  const lampX = player.x + player.width / 2 + facing * 4;
  const lampY = player.y + 19;
  const strength = clamp((daylight.amount - .42) / .4, 0, 1);

  if (!foreground) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const pool = ctx.createRadialGradient(lampX, lampY, 6, lampX, lampY + 92, 205);
    pool.addColorStop(0, `rgba(255,247,190,${.42 * strength})`);
    pool.addColorStop(.35, `rgba(255,225,126,${.19 * strength})`);
    pool.addColorStop(1, 'rgba(255,214,100,0)');
    ctx.fillStyle = pool;
    ctx.beginPath(); ctx.ellipse(lampX, lampY + 105, 215, 155, 0, 0, Math.PI * 2); ctx.fill();

    const beam = ctx.createLinearGradient(lampX, lampY, lampX + facing * 245, lampY + 170);
    beam.addColorStop(0, `rgba(255,250,204,${.32 * strength})`);
    beam.addColorStop(1, 'rgba(255,227,132,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(lampX, lampY);
    ctx.lineTo(lampX + facing * 260, lampY + 115);
    ctx.lineTo(lampX + facing * 220, lampY + 235);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(lampX, lampY);
  ctx.fillStyle = '#26343a';
  ctx.strokeStyle = '#101a1f';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(-9, -5, 18, 11, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff2a8';
  ctx.beginPath(); ctx.arc(facing * 5, 0, 4.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function draw() {
  drawBackground();
  const daylight = getDaylight();
  impacts.forEach((impact) => {
    ctx.globalAlpha = Math.max(0, impact.life / impact.maxLife);
    ctx.strokeStyle = '#f7c633';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(impact.x, GROUND_Y, impact.radius, impact.radius * .16, 0, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  hazards.forEach(drawHazard);
  drawPlayerHeadlight(daylight, false);
  particles.forEach((particle) => {
    ctx.globalAlpha = Math.min(1, particle.life * 2);
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  });
  ctx.globalAlpha = 1;
  if (player) {
    drawPlayer();
    drawPlayerHeadlight(daylight, true);
  }

  if (state === 'playing') {
    ctx.fillStyle = 'rgba(16,37,54,.72)';
    ctx.font = '500 14px DM Mono, monospace';
    ctx.fillText(`LEVEL ${String(level).padStart(2, '0')}`, 18, 30);
    ctx.fillText(daylight.phase, WIDTH - 82, 30);
    if (train.wait <= 0 && train.x + train.length > 0 && train.x < WIDTH) {
      ctx.fillStyle = 'rgba(16,37,54,.68)';
      ctx.font = '500 11px DM Mono, monospace';
      ctx.fillText(`${train.series} SERIES / ${train.cars} CARS / ${train.category}`, 18, 50);
    }
  }
}

function gameLoop(time) {
  const delta = Math.min((time - lastTime) / 1000, .034);
  lastTime = time;
  if (state === 'playing') update(delta);
  draw();
  if (state === 'playing') animationId = requestAnimationFrame(gameLoop);
}

function setKey(key, pressed) {
  const lower = key.toLowerCase();
  if (key === 'ArrowLeft' || lower === 'a') keys.left = pressed;
  if (key === 'ArrowRight' || lower === 'd') keys.right = pressed;
}

window.addEventListener('keydown', (event) => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(event.key)) event.preventDefault();
  setKey(event.key, true);
  if (!event.repeat && (event.key === ' ' || event.key === 'ArrowUp' || event.key.toLowerCase() === 'w')) beginJump();
});
window.addEventListener('keyup', (event) => {
  setKey(event.key, false);
  if (event.key === ' ' || event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') endJump();
});
window.addEventListener('blur', () => {
  Object.keys(keys).forEach((key) => { keys[key] = false; });
  endJump();
});

function bindMoveControl(selector, key) {
  const button = document.querySelector(selector);
  const press = (event) => {
    event.preventDefault();
    keys[key] = true;
    button.setPointerCapture?.(event.pointerId);
    button.classList.add('is-pressed');
  };
  const release = (event) => {
    event.preventDefault();
    keys[key] = false;
    button.classList.remove('is-pressed');
  };
  button.addEventListener('pointerdown', press);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
}

bindMoveControl('#move-left', 'left');
bindMoveControl('#move-right', 'right');
const jumpButton = document.querySelector('#jump');
jumpButton.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  jumpButton.setPointerCapture?.(event.pointerId);
  jumpButton.classList.add('is-pressed');
  beginJump();
});
const releaseJumpButton = (event) => {
  event.preventDefault();
  jumpButton.classList.remove('is-pressed');
  endJump();
};
jumpButton.addEventListener('pointerup', releaseJumpButton);
jumpButton.addEventListener('pointercancel', releaseJumpButton);
jumpButton.addEventListener('lostpointercapture', releaseJumpButton);

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * WIDTH / rect.width,
    y: (event.clientY - rect.top) * HEIGHT / rect.height,
  };
}

function releaseCanvasControls(event) {
  keys.left = false;
  keys.right = false;
  endJump();
  if (event) event.preventDefault();
}

canvas.addEventListener('pointerdown', (event) => {
  if (state !== 'playing') return;
  event.preventDefault();
  canvas.setPointerCapture?.(event.pointerId);
  const point = getCanvasPoint(event);
  if (point.y > HEIGHT * .68 && point.x > WIDTH * .32 && point.x < WIDTH * .68) {
    beginJump();
  } else if (point.x < WIDTH * .34) {
    keys.left = true;
  } else if (point.x > WIDTH * .66) {
    keys.right = true;
  } else {
    beginJump();
  }
});
canvas.addEventListener('pointerup', releaseCanvasControls);
canvas.addEventListener('pointercancel', releaseCanvasControls);
canvas.addEventListener('lostpointercapture', releaseCanvasControls);

startButton.addEventListener('click', beginGame);
soundButton.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundButton.setAttribute('aria-pressed', String(soundEnabled));
  soundButton.textContent = soundEnabled ? 'SOUND: ON' : 'SOUND: OFF';
  if (soundEnabled) {
    if (!audioContext) audioContext = new AudioContext();
    audioContext.resume?.();
    tone(440, .08, 'triangle');
    startMusic();
  } else {
    stopMusic();
  }
});

makeClouds();
resetPlayer();
updateHud();
loadAssets().then(draw);

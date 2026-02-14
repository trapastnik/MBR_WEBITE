/**
 * Biotech Molecular Network — animated canvas background
 * Only active when data-theme="academic" is set on <html>
 */
(function () {
  'use strict';

  var canvas, ctx, animId;
  var particles = [];
  var hexagons = [];
  var helixPhase = 0;
  var W, H;
  var PARTICLE_COUNT = 55;
  var HEXAGON_COUNT = 8;
  var CONNECTION_DIST = 160;

  // Academic blue palette
  var COLORS = [
    'rgba(26, 82, 118, 0.35)',   // deep blue
    'rgba(46, 134, 193, 0.3)',   // medium blue
    'rgba(133, 193, 233, 0.25)', // light blue
    'rgba(40, 116, 166, 0.3)',   // teal blue
  ];

  var LINE_COLOR = 'rgba(46, 134, 193, 0.08)';
  var HELIX_COLOR_1 = 'rgba(26, 82, 118, 0.06)';
  var HELIX_COLOR_2 = 'rgba(133, 193, 233, 0.05)';

  function init() {
    canvas = document.getElementById('biotech-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    createParticles();
    createHexagons();
    window.addEventListener('resize', resize);
    loop();
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 3 + 1.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.005
      });
    }
  }

  function createHexagons() {
    hexagons = [];
    for (var i = 0; i < HEXAGON_COUNT; i++) {
      hexagons.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() * 25 + 15,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.003,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.06 + 0.02
      });
    }
  }

  function drawHexagon(x, y, size, rotation, opacity) {
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var angle = rotation + (Math.PI / 3) * i;
      var hx = x + size * Math.cos(angle);
      var hy = y + size * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(26, 82, 118, ' + opacity + ')';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  function drawDNAHelix(time) {
    var centerX = W * 0.82;
    var amplitude = 40;
    var frequency = 0.008;
    var step = 6;

    for (var y = -20; y < H + 20; y += step) {
      var offset = Math.sin(y * frequency + time) * amplitude;

      // Strand 1
      ctx.beginPath();
      ctx.arc(centerX + offset, y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = HELIX_COLOR_1;
      ctx.fill();

      // Strand 2
      ctx.beginPath();
      ctx.arc(centerX - offset, y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = HELIX_COLOR_2;
      ctx.fill();

      // Cross-links (base pairs)
      if (y % 24 < step) {
        ctx.beginPath();
        ctx.moveTo(centerX + offset, y);
        ctx.lineTo(centerX - offset, y);
        ctx.strokeStyle = 'rgba(46, 134, 193, 0.04)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Second smaller helix on left side
    var centerX2 = W * 0.12;
    var amplitude2 = 28;

    for (var y2 = -20; y2 < H + 20; y2 += step) {
      var offset2 = Math.sin(y2 * frequency * 1.2 + time * 0.7 + 2) * amplitude2;

      ctx.beginPath();
      ctx.arc(centerX2 + offset2, y2, 1.3, 0, Math.PI * 2);
      ctx.fillStyle = HELIX_COLOR_1;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX2 - offset2, y2, 1.3, 0, Math.PI * 2);
      ctx.fillStyle = HELIX_COLOR_2;
      ctx.fill();

      if (y2 % 30 < step) {
        ctx.beginPath();
        ctx.moveTo(centerX2 + offset2, y2);
        ctx.lineTo(centerX2 - offset2, y2);
        ctx.strokeStyle = 'rgba(46, 134, 193, 0.03)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  function loop() {
    var isAcademic = document.documentElement.getAttribute('data-theme') === 'academic';
    if (!isAcademic) {
      animId = requestAnimationFrame(loop);
      return;
    }

    ctx.clearRect(0, 0, W, H);

    helixPhase += 0.015;

    // Draw DNA helixes
    drawDNAHelix(helixPhase);

    // Update and draw hexagons
    for (var h = 0; h < hexagons.length; h++) {
      var hex = hexagons[h];
      hex.x += hex.vx;
      hex.y += hex.vy;
      hex.rotation += hex.rotSpeed;

      if (hex.x < -60) hex.x = W + 60;
      if (hex.x > W + 60) hex.x = -60;
      if (hex.y < -60) hex.y = H + 60;
      if (hex.y > H + 60) hex.y = -60;

      drawHexagon(hex.x, hex.y, hex.size, hex.rotation, hex.opacity);
    }

    // Update particles
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += p.pulseSpeed;

      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    }

    // Draw connections
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          var alpha = (1 - dist / CONNECTION_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(46, 134, 193, ' + alpha + ')';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var pulseR = p.r + Math.sin(p.pulse) * 0.8;

      ctx.beginPath();
      ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Glow effect on larger particles
      if (p.r > 3) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseR + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(46, 134, 193, 0.04)';
        ctx.fill();
      }
    }

    animId = requestAnimationFrame(loop);
  }

  // Observe theme changes
  var mo = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.attributeName === 'data-theme') {
        // Reposition particles on theme switch for fresh look
        if (document.documentElement.getAttribute('data-theme') === 'academic') {
          resize();
          createParticles();
          createHexagons();
        }
      }
    });
  });

  mo.observe(document.documentElement, { attributes: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

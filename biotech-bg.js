/**
 * Molecular DNA Background — animated canvas
 * Only active when data-theme="academic" or "executive" is set on <html>
 * Features: smooth drift, random rotation angles, mouse repulsion, scroll parallax
 */
(function () {
  'use strict';

  var canvas, ctx, animId;
  var W, H;
  var time = 0;
  var dt = 0;
  var lastFrame = 0;

  // Mouse tracking (smoothed)
  var mouseX = -9999, mouseY = -9999;
  var smoothMouseX = -9999, smoothMouseY = -9999;
  var mouseActive = false;
  var MOUSE_RADIUS = 200;
  var MOUSE_FORCE = 2.8;

  // Scroll tracking
  var scrollY = 0;
  var scrollVel = 0;
  var lastScrollY = 0;

  // Molecule nodes (atoms)
  var atoms = [];
  var ATOM_COUNT = 90;
  var BOND_DIST = 130;

  // 5 helixes at various angles
  var helixes = [];
  var HELIX_COUNT = 5;

  // Floating molecules
  var molecules = [];
  var MOL_COUNT = 9;

  // Colors
  var BLUE_DEEP = 'rgba(26, 82, 118, ';
  var BLUE_MED = 'rgba(46, 134, 193, ';
  var BLUE_LIGHT = 'rgba(133, 193, 233, ';
  var TEAL = 'rgba(40, 116, 166, ';

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function init() {
    canvas = document.getElementById('biotech-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    createHelixes();
    createAtoms();
    createMolecules();
    window.addEventListener('resize', function () {
      resize();
      createHelixes();
      createAtoms();
      createMolecules();
    });

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
    });
    window.addEventListener('mouseleave', function () {
      mouseActive = false;
      mouseX = -9999;
      mouseY = -9999;
    });

    window.addEventListener('scroll', function () {
      scrollY = window.pageYOffset || document.documentElement.scrollTop;
    }, { passive: true });

    lastFrame = performance.now();
    loop();
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createHelixes() {
    helixes = [];
    for (var i = 0; i < HELIX_COUNT; i++) {
      var angle = (Math.random() - 0.5) * 1.4; // -0.7 to 0.7 radians (~±40°)
      helixes.push({
        // Position
        baseX: (i + 0.5) / HELIX_COUNT + (Math.random() - 0.5) * 0.15,
        baseY: 0.5,
        driftX: 0, driftY: 0,
        driftVX: 0, driftVY: 0,
        // Rotation
        angle: angle,
        targetAngle: angle,
        angleVel: 0,
        // Per-helix properties
        amplitude: 28 + Math.random() * 30,
        freq: 0.005 + Math.random() * 0.005,
        phase: Math.random() * Math.PI * 2,
        scale: 0.6 + Math.random() * 0.5,
        opacity: 0.06 + Math.random() * 0.1,
        parallax: 0.1 + Math.random() * 0.25,
        // Timer for angle changes
        angleTimer: Math.random() * 600
      });
    }
  }

  function createAtoms() {
    atoms = [];
    for (var i = 0; i < ATOM_COUNT; i++) {
      atoms.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.1 + 0.03,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function createMolecules() {
    molecules = [];
    for (var i = 0; i < MOL_COUNT; i++) {
      var type = Math.floor(Math.random() * 3);
      molecules.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.15,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.003,
        type: type,
        size: Math.random() * 18 + 14,
        opacity: Math.random() * 0.04 + 0.02
      });
    }
  }

  // Draw a DNA double helix rotated at an angle
  function drawHelix(cx, cy, angle, yOffset, amplitude, freq, phaseOffset, scale, opacity) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // The helix extends along the local Y axis, centered at (0,0)
    var halfLen = Math.max(W, H) * 0.8;
    var step = 3;
    var baseW = 2.2 * scale;

    // Strand 1 backbone
    ctx.beginPath();
    for (var y = -halfLen; y < halfLen; y += 2) {
      var drawY = y + yOffset;
      var phase = y * freq + time + phaseOffset;
      var offset = Math.sin(phase) * amplitude;
      if (y === -halfLen) ctx.moveTo(offset, drawY);
      else ctx.lineTo(offset, drawY);
    }
    ctx.strokeStyle = BLUE_DEEP + (opacity * 0.6) + ')';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // Strand 2 backbone
    ctx.beginPath();
    for (var y = -halfLen; y < halfLen; y += 2) {
      var drawY = y + yOffset;
      var phase = y * freq + time + phaseOffset;
      var offset = Math.sin(phase) * amplitude;
      if (y === -halfLen) ctx.moveTo(-offset, drawY);
      else ctx.lineTo(-offset, drawY);
    }
    ctx.strokeStyle = BLUE_MED + (opacity * 0.5) + ')';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // Nodes and base pairs
    for (var y = -halfLen; y < halfLen; y += step) {
      var drawY = y + yOffset;
      var phase = y * freq + time + phaseOffset;
      var offset = Math.sin(phase) * amplitude;

      ctx.beginPath();
      ctx.arc(offset, drawY, baseW, 0, Math.PI * 2);
      ctx.fillStyle = BLUE_DEEP + (opacity * 0.55) + ')';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(-offset, drawY, baseW, 0, Math.PI * 2);
      ctx.fillStyle = BLUE_MED + (opacity * 0.45) + ')';
      ctx.fill();

      // Base pairs (rungs)
      if (y % 14 < step) {
        var x1 = offset;
        var x2 = -offset;
        var midX = 0;

        ctx.beginPath();
        ctx.moveTo(x1, drawY);
        ctx.lineTo(midX - 2, drawY);
        ctx.strokeStyle = BLUE_DEEP + (opacity * 0.5) + ')';
        ctx.lineWidth = 1.8 * scale;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(midX + 2, drawY);
        ctx.lineTo(x2, drawY);
        ctx.strokeStyle = TEAL + (opacity * 0.5) + ')';
        ctx.lineWidth = 1.8 * scale;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(-3, drawY, 2.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = BLUE_LIGHT + (opacity * 0.6) + ')';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(3, drawY, 2.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = TEAL + (opacity * 0.6) + ')';
        ctx.fill();
      }

      // Phosphate backbone markers
      if (y % 28 < step) {
        ctx.beginPath();
        ctx.arc(offset, drawY, 4 * scale, 0, Math.PI * 2);
        ctx.fillStyle = BLUE_DEEP + (opacity * 0.5) + ')';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(-offset, drawY, 4 * scale, 0, Math.PI * 2);
        ctx.fillStyle = BLUE_MED + (opacity * 0.5) + ')';
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // Draw benzene ring
  function drawBenzene(x, y, size, rotation, opacity) {
    var pts = [];
    for (var i = 0; i < 6; i++) {
      var angle = rotation + (Math.PI / 3) * i;
      pts.push({ x: x + size * Math.cos(angle), y: y + size * Math.sin(angle) });
    }

    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var next = (i + 1) % 6;
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[next].x, pts[next].y);
    }
    ctx.strokeStyle = BLUE_DEEP + opacity + ')';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();
    var innerSize = size * 0.65;
    for (var i = 0; i < 6; i++) {
      var angle = rotation + (Math.PI / 3) * i;
      var ix = x + innerSize * Math.cos(angle);
      var iy = y + innerSize * Math.sin(angle);
      var next = (i + 1) % 6;
      var nextAngle = rotation + (Math.PI / 3) * next;
      var inx = x + innerSize * Math.cos(nextAngle);
      var iny = y + innerSize * Math.sin(nextAngle);
      if (i % 2 === 0) { ctx.moveTo(ix, iy); ctx.lineTo(inx, iny); }
    }
    ctx.strokeStyle = BLUE_MED + (opacity * 0.6) + ')';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    for (var i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = BLUE_DEEP + (opacity * 1.2) + ')';
      ctx.fill();
    }
  }

  function drawWaterMol(x, y, size, rotation, opacity) {
    var h1Angle = rotation - 0.9;
    var h2Angle = rotation + 0.9;
    var h1X = x + size * Math.cos(h1Angle);
    var h1Y = y + size * Math.sin(h1Angle);
    var h2X = x + size * Math.cos(h2Angle);
    var h2Y = y + size * Math.sin(h2Angle);

    ctx.beginPath();
    ctx.moveTo(h1X, h1Y);
    ctx.lineTo(x, y);
    ctx.lineTo(h2X, h2Y);
    ctx.strokeStyle = BLUE_DEEP + opacity + ')';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = BLUE_MED + (opacity * 1.5) + ')';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(h1X, h1Y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = BLUE_LIGHT + (opacity * 1.2) + ')';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(h2X, h2Y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = BLUE_LIGHT + (opacity * 1.2) + ')';
    ctx.fill();
  }

  function drawTriMol(x, y, size, rotation, opacity) {
    var pts = [];
    for (var i = 0; i < 3; i++) {
      var angle = rotation + (Math.PI * 2 / 3) * i;
      pts.push({ x: x + size * Math.cos(angle), y: y + size * Math.sin(angle) });
    }

    for (var i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = BLUE_DEEP + opacity + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = TEAL + (opacity * 1.5) + ')';
    ctx.fill();

    for (var i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = BLUE_LIGHT + (opacity * 1.2) + ')';
      ctx.fill();
    }
  }

  function mouseRepel(px, py, strength) {
    if (!mouseActive) return { x: 0, y: 0 };
    var dx = px - smoothMouseX;
    var dy = py - smoothMouseY;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MOUSE_RADIUS && dist > 1) {
      var force = (1 - dist / MOUSE_RADIUS) * strength;
      return { x: (dx / dist) * force, y: (dy / dist) * force };
    }
    return { x: 0, y: 0 };
  }

  function loop(now) {
    if (!now) now = performance.now();
    dt = Math.min((now - lastFrame) / 16.667, 3); // normalize to ~60fps, cap at 3x
    lastFrame = now;

    var theme = document.documentElement.getAttribute('data-theme');
    var isActive = (theme === 'academic' || theme === 'executive');
    if (!isActive) {
      animId = requestAnimationFrame(loop);
      return;
    }

    ctx.clearRect(0, 0, W, H);
    time += 0.01 * dt;

    // Smooth mouse position
    if (mouseActive) {
      smoothMouseX = lerp(smoothMouseX, mouseX, 0.08 * dt);
      smoothMouseY = lerp(smoothMouseY, mouseY, 0.08 * dt);
    } else {
      smoothMouseX = lerp(smoothMouseX, -9999, 0.03 * dt);
      smoothMouseY = lerp(smoothMouseY, -9999, 0.03 * dt);
    }

    // Update scroll velocity (smoothed)
    scrollVel = lerp(scrollVel, (scrollY - lastScrollY) * 0.3, 0.15 * dt);
    lastScrollY = lerp(lastScrollY, scrollY, 0.08 * dt);

    // ── Update helix drift & rotation ──
    for (var h = 0; h < helixes.length; h++) {
      var hx = helixes[h];

      // Periodically pick a new target angle
      hx.angleTimer -= dt;
      if (hx.angleTimer <= 0) {
        hx.targetAngle = (Math.random() - 0.5) * 1.4; // new random angle ±40°
        hx.angleTimer = 400 + Math.random() * 500; // next change in ~7-15 seconds
      }

      // Smoothly rotate toward target angle
      var angleDiff = hx.targetAngle - hx.angle;
      hx.angleVel += angleDiff * 0.0003 * dt;
      hx.angleVel *= (1 - 0.02 * dt); // damping
      hx.angle += hx.angleVel * dt;

      // Random acceleration (smooth brownian)
      hx.driftVX += (Math.random() - 0.5) * 0.025 * dt;
      hx.driftVY += (Math.random() - 0.5) * 0.015 * dt;

      // Mouse repulsion on helixes
      var helixScreenX = W * hx.baseX + hx.driftX;
      var helixScreenY = H * hx.baseY + hx.driftY;
      var repel = mouseRepel(helixScreenX, helixScreenY, MOUSE_FORCE * 0.5);
      hx.driftVX += repel.x * 0.1 * dt;
      hx.driftVY += repel.y * 0.05 * dt;

      // Damping
      hx.driftVX *= Math.pow(0.98, dt);
      hx.driftVY *= Math.pow(0.98, dt);

      // Apply
      hx.driftX += hx.driftVX * dt;
      hx.driftY += hx.driftVY * dt;

      // Soft boundary (spring-back instead of hard bounce)
      var maxDriftX = W * 0.1;
      var maxDriftY = 60;
      hx.driftVX -= (hx.driftX / maxDriftX) * 0.02 * dt;
      hx.driftVY -= (hx.driftY / maxDriftY) * 0.02 * dt;
    }

    // ── Draw DNA Helixes ──
    for (var h = 0; h < helixes.length; h++) {
      var hx = helixes[h];
      var cx = W * hx.baseX + hx.driftX;
      var cy = H * hx.baseY + hx.driftY;
      var yOff = -(scrollY * hx.parallax) % (H * 0.5);
      drawHelix(cx, cy, hx.angle, yOff, hx.amplitude, hx.freq, hx.phase, hx.scale, hx.opacity);
    }

    // ── Floating molecules ──
    for (var m = 0; m < molecules.length; m++) {
      var mol = molecules[m];

      var mr = mouseRepel(mol.x, mol.y, MOUSE_FORCE);
      mol.vx += mr.x * 0.04 * dt;
      mol.vy += mr.y * 0.04 * dt;

      mol.vy -= scrollVel * 0.002 * dt;

      var speed = Math.sqrt(mol.vx * mol.vx + mol.vy * mol.vy);
      if (speed > 1.2) {
        mol.vx = (mol.vx / speed) * 1.2;
        mol.vy = (mol.vy / speed) * 1.2;
      }

      mol.vx *= Math.pow(0.996, dt);
      mol.vy *= Math.pow(0.996, dt);

      mol.x += mol.vx * dt;
      mol.y += mol.vy * dt;
      mol.rotation += mol.rotSpeed * dt;

      if (mouseActive) {
        var mdx = mol.x - smoothMouseX;
        var mdy = mol.y - smoothMouseY;
        var mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < MOUSE_RADIUS) {
          mol.rotation += (1 - mdist / MOUSE_RADIUS) * 0.02 * dt;
        }
      }

      if (mol.x < -80) mol.x = W + 80;
      if (mol.x > W + 80) mol.x = -80;
      if (mol.y < -80) mol.y = H + 80;
      if (mol.y > H + 80) mol.y = -80;

      if (mol.type === 0) drawBenzene(mol.x, mol.y, mol.size, mol.rotation, mol.opacity);
      else if (mol.type === 1) drawWaterMol(mol.x, mol.y, mol.size, mol.rotation, mol.opacity);
      else drawTriMol(mol.x, mol.y, mol.size, mol.rotation, mol.opacity);
    }

    // ── Atomic network ──
    for (var i = 0; i < atoms.length; i++) {
      var a = atoms[i];

      var ar = mouseRepel(a.x, a.y, MOUSE_FORCE);
      a.vx += ar.x * 0.03 * dt;
      a.vy += ar.y * 0.03 * dt;

      a.vy -= scrollVel * 0.0015 * dt;

      var aspeed = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
      if (aspeed > 1.0) {
        a.vx = (a.vx / aspeed) * 1.0;
        a.vy = (a.vy / aspeed) * 1.0;
      }

      a.vx *= Math.pow(0.998, dt);
      a.vy *= Math.pow(0.998, dt);

      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.pulse += 0.008 * dt;

      if (a.x < -10) a.x = W + 10;
      if (a.x > W + 10) a.x = -10;
      if (a.y < -10) a.y = H + 10;
      if (a.y > H + 10) a.y = -10;
    }

    // Draw bonds
    for (var i = 0; i < atoms.length; i++) {
      for (var j = i + 1; j < atoms.length; j++) {
        var dx = atoms[i].x - atoms[j].x;
        var dy = atoms[i].y - atoms[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < BOND_DIST) {
          var alpha = (1 - dist / BOND_DIST) * 0.05;
          ctx.beginPath();
          ctx.moveTo(atoms[i].x, atoms[i].y);
          ctx.lineTo(atoms[j].x, atoms[j].y);
          ctx.strokeStyle = BLUE_MED + alpha + ')';
          ctx.lineWidth = 0.7;
          ctx.stroke();

          if (dist < BOND_DIST * 0.4) {
            var perpX = -dy / dist * 2.5;
            var perpY = dx / dist * 2.5;
            ctx.beginPath();
            ctx.moveTo(atoms[i].x + perpX, atoms[i].y + perpY);
            ctx.lineTo(atoms[j].x + perpX, atoms[j].y + perpY);
            ctx.strokeStyle = BLUE_LIGHT + (alpha * 0.5) + ')';
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }
    }

    // Draw atoms
    for (var i = 0; i < atoms.length; i++) {
      var a = atoms[i];
      var pulseR = a.r + Math.sin(a.pulse) * 0.5;

      ctx.beginPath();
      ctx.arc(a.x, a.y, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = BLUE_DEEP + a.opacity + ')';
      ctx.fill();

      if (a.r > 2.5) {
        ctx.beginPath();
        ctx.arc(a.x, a.y, pulseR + 5, 0, Math.PI * 2);
        ctx.fillStyle = BLUE_LIGHT + '0.02)';
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(a.x, a.y, pulseR + 7, pulseR + 3, a.pulse * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = BLUE_MED + '0.04)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    animId = requestAnimationFrame(loop);
  }

  // Observe theme changes
  var mo = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (m.attributeName === 'data-theme') {
        var t = document.documentElement.getAttribute('data-theme');
        if (t === 'academic' || t === 'executive') {
          resize();
          createHelixes();
          createAtoms();
          createMolecules();
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

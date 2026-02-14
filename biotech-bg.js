/**
 * Molecular DNA Background — animated canvas
 * Only active when data-theme="academic" is set on <html>
 */
(function () {
  'use strict';

  var canvas, ctx, animId;
  var W, H;
  var time = 0;

  // Molecule nodes (atoms)
  var atoms = [];
  var ATOM_COUNT = 70;
  var BOND_DIST = 140;

  // Floating molecules (small rigid structures)
  var molecules = [];
  var MOL_COUNT = 6;

  // Colors
  var BLUE_DEEP = 'rgba(26, 82, 118, ';
  var BLUE_MED = 'rgba(46, 134, 193, ';
  var BLUE_LIGHT = 'rgba(133, 193, 233, ';
  var TEAL = 'rgba(40, 116, 166, ';

  function init() {
    canvas = document.getElementById('biotech-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    createAtoms();
    createMolecules();
    window.addEventListener('resize', function () {
      resize();
      createAtoms();
      createMolecules();
    });
    loop();
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createAtoms() {
    atoms = [];
    for (var i = 0; i < ATOM_COUNT; i++) {
      atoms.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.25 + 0.08,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  // Create small rigid molecule structures that float around
  function createMolecules() {
    molecules = [];
    for (var i = 0; i < MOL_COUNT; i++) {
      var type = Math.floor(Math.random() * 3); // 0=benzene, 1=water, 2=triangle
      molecules.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.004,
        type: type,
        size: Math.random() * 18 + 14,
        opacity: Math.random() * 0.08 + 0.04
      });
    }
  }

  // Draw a DNA double helix
  function drawHelix(centerX, amplitude, freq, phaseOffset, scale, opacity) {
    var step = 5;
    var baseW = 1.5 * scale;

    for (var y = -30; y < H + 30; y += step) {
      var phase = y * freq + time + phaseOffset;
      var offset = Math.sin(phase) * amplitude;

      // Strand 1
      ctx.beginPath();
      ctx.arc(centerX + offset, y, baseW, 0, Math.PI * 2);
      ctx.fillStyle = BLUE_DEEP + (opacity * 0.7) + ')';
      ctx.fill();

      // Strand 2
      ctx.beginPath();
      ctx.arc(centerX - offset, y, baseW, 0, Math.PI * 2);
      ctx.fillStyle = BLUE_MED + (opacity * 0.6) + ')';
      ctx.fill();

      // Base pairs (rungs) — draw every N pixels
      if (y % 18 < step) {
        // Nucleotide base pair
        var x1 = centerX + offset;
        var x2 = centerX - offset;
        var midX = (x1 + x2) / 2;

        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(midX - 2, y);
        ctx.strokeStyle = BLUE_DEEP + (opacity * 0.35) + ')';
        ctx.lineWidth = 1.2 * scale;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(midX + 2, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = TEAL + (opacity * 0.35) + ')';
        ctx.lineWidth = 1.2 * scale;
        ctx.stroke();

        // Small circles at base pair junctions
        ctx.beginPath();
        ctx.arc(midX - 2, y, 1.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = BLUE_LIGHT + (opacity * 0.5) + ')';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(midX + 2, y, 1.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = TEAL + (opacity * 0.5) + ')';
        ctx.fill();
      }

      // Phosphate backbone markers
      if (y % 36 < step) {
        ctx.beginPath();
        ctx.arc(centerX + offset, y, 3 * scale, 0, Math.PI * 2);
        ctx.fillStyle = BLUE_DEEP + (opacity * 0.4) + ')';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX - offset, y, 3 * scale, 0, Math.PI * 2);
        ctx.fillStyle = BLUE_MED + (opacity * 0.4) + ')';
        ctx.fill();
      }
    }
  }

  // Draw benzene ring (hexagonal molecule)
  function drawBenzene(x, y, size, rotation, opacity) {
    var pts = [];
    for (var i = 0; i < 6; i++) {
      var angle = rotation + (Math.PI / 3) * i;
      pts.push({
        x: x + size * Math.cos(angle),
        y: y + size * Math.sin(angle)
      });
    }

    // Bonds (outer ring)
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var next = (i + 1) % 6;
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[next].x, pts[next].y);
    }
    ctx.strokeStyle = BLUE_DEEP + opacity + ')';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Inner ring (double bonds)
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
      if (i % 2 === 0) {
        ctx.moveTo(ix, iy);
        ctx.lineTo(inx, iny);
      }
    }
    ctx.strokeStyle = BLUE_MED + (opacity * 0.6) + ')';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Atoms at vertices
    for (var i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = BLUE_DEEP + (opacity * 1.2) + ')';
      ctx.fill();
    }
  }

  // Draw water-like molecule (V shape)
  function drawWaterMol(x, y, size, rotation, opacity) {
    var oX = x, oY = y;
    var h1Angle = rotation - 0.9;
    var h2Angle = rotation + 0.9;
    var h1X = x + size * Math.cos(h1Angle);
    var h1Y = y + size * Math.sin(h1Angle);
    var h2X = x + size * Math.cos(h2Angle);
    var h2Y = y + size * Math.sin(h2Angle);

    // Bonds
    ctx.beginPath();
    ctx.moveTo(h1X, h1Y);
    ctx.lineTo(oX, oY);
    ctx.lineTo(h2X, h2Y);
    ctx.strokeStyle = BLUE_DEEP + opacity + ')';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Oxygen (larger)
    ctx.beginPath();
    ctx.arc(oX, oY, 4, 0, Math.PI * 2);
    ctx.fillStyle = BLUE_MED + (opacity * 1.5) + ')';
    ctx.fill();

    // Hydrogens (smaller)
    ctx.beginPath();
    ctx.arc(h1X, h1Y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = BLUE_LIGHT + (opacity * 1.2) + ')';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(h2X, h2Y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = BLUE_LIGHT + (opacity * 1.2) + ')';
    ctx.fill();
  }

  // Draw triangle molecule (like NH3 top view)
  function drawTriMol(x, y, size, rotation, opacity) {
    var pts = [];
    for (var i = 0; i < 3; i++) {
      var angle = rotation + (Math.PI * 2 / 3) * i;
      pts.push({
        x: x + size * Math.cos(angle),
        y: y + size * Math.sin(angle)
      });
    }

    // Bonds from center
    for (var i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = BLUE_DEEP + opacity + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Center atom
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = TEAL + (opacity * 1.5) + ')';
    ctx.fill();

    // Outer atoms
    for (var i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = BLUE_LIGHT + (opacity * 1.2) + ')';
      ctx.fill();
    }
  }

  function loop() {
    var isAcademic = document.documentElement.getAttribute('data-theme') === 'academic';
    if (!isAcademic) {
      animId = requestAnimationFrame(loop);
      return;
    }

    ctx.clearRect(0, 0, W, H);
    time += 0.012;

    // ── DNA Helixes ──
    // Main helix (right side)
    drawHelix(W * 0.85, 45, 0.007, 0, 1.0, 0.12);

    // Secondary helix (left side, smaller)
    drawHelix(W * 0.1, 32, 0.009, 2.5, 0.75, 0.08);

    // Third helix (center-left, very subtle)
    drawHelix(W * 0.45, 25, 0.006, 4.8, 0.6, 0.05);

    // ── Floating molecules ──
    for (var m = 0; m < molecules.length; m++) {
      var mol = molecules[m];
      mol.x += mol.vx;
      mol.y += mol.vy;
      mol.rotation += mol.rotSpeed;

      // Wrap around
      if (mol.x < -80) mol.x = W + 80;
      if (mol.x > W + 80) mol.x = -80;
      if (mol.y < -80) mol.y = H + 80;
      if (mol.y > H + 80) mol.y = -80;

      if (mol.type === 0) drawBenzene(mol.x, mol.y, mol.size, mol.rotation, mol.opacity);
      else if (mol.type === 1) drawWaterMol(mol.x, mol.y, mol.size, mol.rotation, mol.opacity);
      else drawTriMol(mol.x, mol.y, mol.size, mol.rotation, mol.opacity);
    }

    // ── Atomic network (atoms + bonds) ──
    // Update atoms
    for (var i = 0; i < atoms.length; i++) {
      var a = atoms[i];
      a.x += a.vx;
      a.y += a.vy;
      a.pulse += 0.01;

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
          var alpha = (1 - dist / BOND_DIST) * 0.1;
          ctx.beginPath();
          ctx.moveTo(atoms[i].x, atoms[i].y);
          ctx.lineTo(atoms[j].x, atoms[j].y);
          ctx.strokeStyle = BLUE_MED + alpha + ')';
          ctx.lineWidth = 0.7;
          ctx.stroke();

          // Double bond effect on close pairs
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

      // Atom
      ctx.beginPath();
      ctx.arc(a.x, a.y, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = BLUE_DEEP + a.opacity + ')';
      ctx.fill();

      // Electron cloud glow on larger atoms
      if (a.r > 2.5) {
        ctx.beginPath();
        ctx.arc(a.x, a.y, pulseR + 5, 0, Math.PI * 2);
        ctx.fillStyle = BLUE_LIGHT + '0.02)';
        ctx.fill();

        // Electron orbit ring
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
        if (document.documentElement.getAttribute('data-theme') === 'academic') {
          resize();
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

// Header → Multi-agent observatory. Agents sense, think, act — and societies emerge.
// Each agent: phase-shifting glyph + orbiting dots. Trails of research equations.
// Solarpunk image revealed on hover — peeling back hidden reality.
(function () {
  "use strict";

  var header = document.querySelector("header[style*='background-image']");
  if (!header) return;
  var match = header.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
  if (!match) return;
  var imgUrl = match[1];

  // ===== Vocabulary by Markov blanket role =====
  // Blackboard vocabulary — what gets written in the void
  var senseV = ["?","...","look","here","edge","what?","hm","see","feel","notice"];
  var thinkV = ["why","if","but","maybe","because","\u2234","\u2235","suppose","doubt","therefore"];
  var actV = ["yes","now","go","try","begin","do","make","change","forward","here"];
  var socialV = ["us","we","you","hello","together","listen","trust","here","with","stay"];

  // Agent glyphs — what the agent itself looks like per state (slow morphing)
  var senseGlyphs = ["\u25CB","\u25E6","?","\u2299"];       // ○ ◦ ? ⊙
  var thinkGlyphs = ["\u2234","\u223F","\u2206","\u25C7"];   // ∴ ∿ ∆ ◇
  var actGlyphs = ["\u2192","\u25B8","\u25CF","\u21D2"];     // → ▸ ● ⇒

  // ===== Palette =====
  // Solarpunk palette
  var P = {
    blue: "120,170,220", green: "90,185,130", amber: "210,175,75",
    warm: "225,210,180", cool: "160,170,185", rose: "180,120,140"
  };

  // Page-specific agent config — different initial conditions per page
  var pagePath = window.location.pathname;
  var isHome = pagePath === "/" || pagePath === "/index.html";
  var isAbout = pagePath.indexOf("/about") === 0;
  var isPosts = pagePath.indexOf("/posts") === 0;

  // Home: balanced — all modalities, moderate speed, cooperation-focused
  // About: introspective — more THINK, slower, reflective, fewer agents
  // Posts: exploratory — more ACT, faster, curiosity-driven, more agents
  var pageConfig = isAbout ? {
    agentCount: 5, speedMul: 0.8, defaultState: S_THINK,
    senseWeight: 0.2, thinkWeight: 0.6, actWeight: 0.2,
    starDensity: 8000, reflectChance: 0.02
  } : isPosts ? {
    agentCount: 7, speedMul: 1.4, defaultState: S_ACT,
    senseWeight: 0.2, thinkWeight: 0.2, actWeight: 0.6,
    starDensity: 5000, reflectChance: 0.005
  } : {
    agentCount: 6, speedMul: 1.0, defaultState: S_ACT,
    senseWeight: 0.33, thinkWeight: 0.34, actWeight: 0.33,
    starDensity: 6000, reflectChance: 0.01
  };

  function srand(s) { var x = Math.sin(s) * 10000; return x - Math.floor(x); }

  // --- Canvases (3 layers: main, real image, reveal overlay) ---
  var asciiCanvas = document.createElement("canvas");
  var revealCanvas = document.createElement("canvas");
  [asciiCanvas, revealCanvas].forEach(function (c) { c.setAttribute("aria-hidden", "true"); });
  var cssBase = "position:absolute;top:0;left:0;width:100%;height:100%;";
  asciiCanvas.style.cssText = cssBase + "z-index:1;";
  revealCanvas.style.cssText = cssBase + "z-index:2;pointer-events:none;";
  header.style.position = "relative";
  header.style.overflow = "hidden";
  header.appendChild(asciiCanvas);
  header.appendChild(revealCanvas);

  var storedBgPos = header.style.backgroundPosition;
  header.style.backgroundImage = "none";

  var ascCtx = asciiCanvas.getContext("2d");
  var rvCtx = revealCanvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  (function prefillCanvas() {
    var w = header.clientWidth, h = header.clientHeight;
    asciiCanvas.width = w * dpr; asciiCanvas.height = h * dpr;
    ascCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ascCtx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#0a0a0c";
    ascCtx.fillRect(0, 0, w, h);
  })();

  // --- State ---
  var mouseX = -1, mouseY = -1, cursorX = -1, cursorY = -1;
  var isHovering = false, revealR = 130, revealAlpha = 0, animating = false;
  var wanderX = 0, wanderY = 0, wanderTargetX = 0, wanderTargetY = 0;
  var wanderInited = false, wanderSpeed = 0.008;
  var isTouching = false, touchFadeTimer = 0;

  var lumGrid = null, edgeGrid = null, gridCols = 0, gridRows = 0, gridSp = 0;
  var scentGrid = null;
  var baseCanvas = null;

  // --- Agent system ---
  var agents = [];
  var trails = [];
  var marks = []; // persistent structural marks: dots, lines agents draw on the canvas
  var MARK_CAP = 200;
  var AGENT_N = 5;
  var TRAIL_CAP = 250;
  var TRAIL_AGE = 900; // ~15 sec
  var INTERACT_R = 120;
  var PULSE_R = 60;
  var S_SENSE = 0, S_THINK = 1, S_ACT = 2;
  var S_GREET = 3, S_DEBATE = 4, S_TEACH = 5; // social states

  // Hebbian bond matrix: bonds[i][j] = strength (0-1). Higher → easier coordination.
  var bonds = [];
  // Persistent nodes: landmarks built by sustained cooperation
  var nodes = [];
  var NODE_CAP = 16;
  var AGENT_CAP = 10;
  var STORAGE_KEY = "lorenz_scent";
  var BONDS_KEY = "lorenz_bonds";
  var NODES_KEY = "lorenz_nodes";

  // --- Wander & events ---
  function pickWanderTarget() {
    var w = header.clientWidth, h = header.clientHeight, p = 0.15;
    wanderTargetX = w * p + Math.random() * w * (1 - 2 * p);
    wanderTargetY = h * p + Math.random() * h * (1 - 2 * p);
  }
  function initWander() {
    if (wanderInited) return; wanderInited = true;
    var w = header.clientWidth, h = header.clientHeight;
    wanderX = w * 0.3 + Math.random() * w * 0.4;
    wanderY = h * 0.3 + Math.random() * h * 0.4;
    pickWanderTarget();
    setInterval(pickWanderTarget, 4000 + Math.random() * 3000);
  }

  header.addEventListener("mouseenter", function () { isHovering = true; startAnim(); });
  header.addEventListener("mouseleave", function () { isHovering = false; mouseX = mouseY = -1; });
  header.addEventListener("mousemove", function (e) {
    var r = header.getBoundingClientRect();
    mouseX = e.clientX - r.left; mouseY = e.clientY - r.top; startAnim();
  });
  header.addEventListener("touchstart", function (e) {
    var t = e.touches[0], r = header.getBoundingClientRect();
    mouseX = t.clientX - r.left; mouseY = t.clientY - r.top;
    isTouching = true; touchFadeTimer = 0; startAnim();
  }, { passive: true });
  header.addEventListener("touchmove", function (e) {
    var t = e.touches[0], r = header.getBoundingClientRect();
    mouseX = t.clientX - r.left; mouseY = t.clientY - r.top;
  }, { passive: true });
  header.addEventListener("touchend", function () { isTouching = false; touchFadeTimer = 120; });
  header.addEventListener("touchcancel", function () { isTouching = false; touchFadeTimer = 120; });
  function startAnim() { if (!animating) { animating = true; requestAnimationFrame(animate); } }

  function getColors() {
    return { bg: getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#0a0a0c" };
  }
  function coverDim(iW, iH, cW, cH, bgPos) {
    var ia = iW / iH, ca = cW / cH, sw, sh, sx, sy;
    if (ia > ca) { sh = iH; sw = iH * ca; sx = (iW - sw) / 2; sy = 0; }
    else { sw = iW; sh = iW / ca; sx = 0; sy = (iH - sh) * 0.6; }
    if (bgPos) { var p2 = bgPos.match(/(\d+)%/g); if (p2 && p2.length >= 2) sy = (iH - sh) * (parseInt(p2[1]) / 100); }
    return { sx: sx, sy: Math.max(0, sy), sw: sw, sh: sh };
  }

  var img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = function () { renderAll(); window.addEventListener("resize", debounce(renderAll, 200)); startAnim(); };
  img.src = imgUrl;

  function getHeaderTexts() {
    var texts = [], els = header.querySelectorAll("h2, aside");
    for (var i = 0; i < els.length; i++) {
      var el = els[i], rect = el.getBoundingClientRect(), hRect = header.getBoundingClientRect();
      var cs = getComputedStyle(el);
      texts.push({ text: el.textContent, x: rect.left - hRect.left + rect.width / 2,
        y: rect.top - hRect.top + rect.height / 2,
        font: cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily, el: el });
    }
    return texts;
  }
  function renderTextOnCanvas(ctx, texts) {
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (var i = 0; i < texts.length; i++) {
      ctx.font = texts[i].font; ctx.fillStyle = "#fff";
      ctx.shadowColor = "rgba(0,0,0,0.7)"; ctx.shadowBlur = 10;
      ctx.fillText(texts[i].text, texts[i].x, texts[i].y);
    }
    ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  }

  // ===== Agent =====
  function createAgent(w, h) {
    var ax, ay, tries = 0;
    do { ax = w * 0.1 + Math.random() * w * 0.8; ay = h * 0.1 + Math.random() * h * 0.8; tries++; }
    while (getLumAt(ax, ay) > 0.5 && tries < 10);
    var theta = Math.random() * Math.PI * 2;
    var sp = (0.18 + Math.random() * 0.12) * pageConfig.speedMul;
    // 2-3 orbiting dots
    var dotCount = 2 + Math.floor(Math.random() * 2);
    var dots = [];
    for (var d = 0; d < dotCount; d++) {
      dots.push({ angle: (d / dotCount) * Math.PI * 2, dist: 7 + Math.random() * 5, speed: 0.012 + Math.random() * 0.008 });
    }
    return {
      x: ax, y: ay, theta: theta, prevTheta: theta,
      speed: sp, baseSpeed: sp,
      targetX: ax, targetY: ay,
      waypointTimer: 0, waypointInterval: 300 + Math.floor(Math.random() * 300),
      state: S_ACT, stateTimer: 0, glyphCycle: 0,
      dots: dots, dotPhase: Math.random() * Math.PI * 2,
      depositTimer: Math.floor(Math.random() * 12),
      pulseTimer: 0,
      thoughtText: "", thoughtTimer: 0,
      thoughtInterval: 300 + Math.floor(Math.random() * 300), // 5-10 sec per thought
      thoughtSide: Math.random() < 0.5 ? 1 : -1, // offset left or right to reduce overlap
      // Emergent behavior state
      energy: 1.0,
      socialCharge: 0,
      coordinated: false,
      reflecting: false, reflectTimer: 0,
      dead: false, deathTimer: 0,
      alpha: 0.60 + Math.random() * 0.15
    };
  }

  function pickAgentWaypoint(agent, w, h, avoidScent) {
    var bestScore = -1, bestX = w / 2, bestY = h / 2;
    for (var i = 0; i < 8; i++) {
      var tx = w * 0.08 + Math.random() * w * 0.84;
      var ty = h * 0.08 + Math.random() * h * 0.84;
      var dark = 1 - getLumAt(tx, ty);
      var scent = getScentAt(tx, ty);
      // Node attraction: bias toward persistent infrastructure
      var nodeBonus = 0;
      for (var ni3 = 0; ni3 < nodes.length; ni3++) {
        var nd2 = Math.hypot(nodes[ni3].x - tx, nodes[ni3].y - ty);
        if (nd2 < 100) nodeBonus += (1 - nd2 / 100) * nodes[ni3].strength;
      }
      var score = dark * dark + (avoidScent ? -scent * 3 : scent * 2) + nodeBonus * 2;
      if (score > bestScore) { bestScore = score; bestX = tx; bestY = ty; }
    }
    // 40% chance: target another agent instead of a location (seek social contact)
    if (!avoidScent && Math.random() < 0.4 && agents.length > 1) {
      var others = agents.filter(function (a) { return a !== agent && !a.dead; });
      if (others.length > 0) {
        var target = others[Math.floor(Math.random() * others.length)];
        bestX = target.x + (Math.random() - 0.5) * 50;
        bestY = target.y + (Math.random() - 0.5) * 50;
      }
    }
    agent.targetX = bestX; agent.targetY = bestY;
    agent.waypointInterval = 200 + Math.floor(Math.random() * 250); // shorter intervals = more social seeking
    agent.waypointTimer = 0;
  }

  function updateAgent(agent, w, h, fc) {
    if (agent.dead) {
      agent.deathTimer++;
      if (agent.deathTimer > 150) { Object.assign(agent, createAgent(w, h)); }
      return;
    }

    agent.waypointTimer++;
    if (agent.waypointTimer >= agent.waypointInterval) pickAgentWaypoint(agent, w, h, false);
    agent.prevTheta = agent.theta;

    // --- State machine ---
    var nearAgent = false, nearDist = Infinity;
    var nearCount = 0;
    for (var i = 0; i < agents.length; i++) {
      if (agents[i] === agent || agents[i].dead) continue;
      var d = Math.hypot(agents[i].x - agent.x, agents[i].y - agent.y);
      if (d < INTERACT_R) { nearAgent = true; nearCount++; if (d < nearDist) nearDist = d; }
    }

    agent.stateTimer++;
    if (agent.reflecting) {
      agent.state = S_THINK;
    } else if (agent.coordinated && nearCount >= 2) {
      // Teaching: coordinated + multiple nearby = sharing knowledge
      agent.state = S_TEACH;
    } else if (agent.pulseTimer > 40 && nearCount >= 1) {
      // Debating: deep in social pulse with someone nearby
      agent.state = S_DEBATE;
    } else if (nearAgent && nearDist < PULSE_R) {
      // Greeting: close encounter
      agent.state = S_GREET;
    } else if (nearAgent && nearDist < INTERACT_R * 0.7) {
      agent.state = S_SENSE;
    } else {
      var turnAmount = Math.abs(agent.theta - agent.prevTheta);
      if (turnAmount > 0.012) { agent.state = S_THINK; agent.stateTimer = 0; }
      else if (agent.stateTimer > 20) { agent.state = S_ACT; }
    }
    agent.glyphCycle = Math.floor(fc * 0.0012) % 4;

    // --- Steer ---
    var dx = agent.targetX - agent.x, dy = agent.targetY - agent.y;
    var desired = Math.atan2(dy, dx);
    var dTheta = desired - agent.theta;
    while (dTheta > Math.PI) dTheta -= Math.PI * 2;
    while (dTheta < -Math.PI) dTheta += Math.PI * 2;
    agent.theta += Math.max(-0.015, Math.min(0.015, dTheta));

    // Edge avoidance
    var pad = 50;
    if (agent.x < pad) agent.theta += (pad - agent.x) * 0.001;
    if (agent.x > w - pad) agent.theta -= (agent.x - (w - pad)) * 0.001;
    if (agent.y < pad) agent.theta += (pad - agent.y) * 0.0005;
    if (agent.y > h - pad) agent.theta -= (agent.y - (h - pad)) * 0.0005;

    // --- Interaction ---
    if (agent.pulseTimer > 0) agent.pulseTimer--;
    for (var j = 0; j < agents.length; j++) {
      var o = agents[j];
      if (o === agent || o.dead) continue;
      var adx = o.x - agent.x, ady = o.y - agent.y;
      var dist = Math.sqrt(adx * adx + ady * ady);
      if (dist < INTERACT_R && dist > 0) {
        var away = Math.atan2(-ady, -adx);
        // Gentle deflection — weaker so agents linger near each other
        var deflect = (INTERACT_R - dist) / INTERACT_R * 0.008;
        var td = away - agent.theta;
        while (td > Math.PI) td -= Math.PI * 2;
        while (td < -Math.PI) td += Math.PI * 2;
        agent.theta += td * deflect;
        if (dist < PULSE_R) {
          agent.pulseTimer = 80; // longer social engagement
          // Hebbian: strengthen bond between cooperating agents
          var ai2 = agents.indexOf(agent), aj2 = agents.indexOf(o);
          if (ai2 >= 0 && aj2 >= 0 && bonds[ai2]) {
            bonds[ai2][aj2] = Math.min(1, (bonds[ai2][aj2] || 0) + 0.005);
            bonds[aj2][ai2] = bonds[ai2][aj2];
          }
        }
      }
    }

    // --- Quorum sensing: phase transition to flocking ---
    // Quorum sensing — Hebbian bonds lower the flocking threshold
    var ai3 = agents.indexOf(agent);
    var bondBoost = 0;
    if (ai3 >= 0 && bonds[ai3]) {
      for (var bi = 0; bi < bonds[ai3].length; bi++) bondBoost += (bonds[ai3][bi] || 0);
    }
    var flockThreshold = Math.max(0.25, 0.45 - bondBoost * 0.15);
    agent.socialCharge = Math.min(1, Math.max(0,
      agent.socialCharge + (nearCount > 0 ? 0.004 * nearCount : -0.0008)));
    agent.coordinated = agent.socialCharge > flockThreshold;
    if (agent.coordinated) {
      var nearest = null, minD = Infinity;
      for (var k = 0; k < agents.length; k++) {
        if (agents[k] === agent || agents[k].dead) continue;
        var kd = Math.hypot(agents[k].x - agent.x, agents[k].y - agent.y);
        if (kd < minD) { minD = kd; nearest = agents[k]; }
      }
      if (nearest) {
        agent.targetX = nearest.x + Math.cos(agent.dotPhase) * 35;
        agent.targetY = nearest.y + Math.sin(agent.dotPhase) * 35;
      }
    }

    // --- Curiosity: explore-exploit ---
    var localScent = getScentAt(agent.x, agent.y);
    var exploreDrive = 0.5 + 0.5 * Math.sin(fc * 0.0023 + agent.dotPhase);
    if (localScent > 0.3 * exploreDrive) {
      agent.theta += (Math.random() - 0.5) * 0.06;
      agent.speed *= 0.98;
    } else {
      agent.speed = Math.min(agent.baseSpeed * 1.3, agent.speed + 0.003);
    }

    // --- Social behaviors: state-driven movement changes ---
    if (agent.state === S_GREET) {
      // Greeting: slow down, pause briefly
      agent.speed *= 0.92;
    } else if (agent.state === S_DEBATE) {
      // Debating: nearly stop, face the nearest agent
      agent.speed *= 0.85;
      var nearest2 = null, minD2 = Infinity;
      for (var di2 = 0; di2 < agents.length; di2++) {
        if (agents[di2] === agent || agents[di2].dead) continue;
        var dd2 = Math.hypot(agents[di2].x - agent.x, agents[di2].y - agent.y);
        if (dd2 < minD2) { minD2 = dd2; nearest2 = agents[di2]; }
      }
      if (nearest2) {
        var faceAngle = Math.atan2(nearest2.y - agent.y, nearest2.x - agent.x);
        var fd2 = faceAngle - agent.theta;
        while (fd2 > Math.PI) fd2 -= Math.PI * 2;
        while (fd2 < -Math.PI) fd2 += Math.PI * 2;
        agent.theta += fd2 * 0.05; // turn to face
      }
    } else if (agent.state === S_TEACH) {
      // Teaching: slowly orbit the group, maintaining distance
      if (nearCount >= 1) {
        agent.theta += 0.008; // gentle orbit
        agent.speed = agent.baseSpeed * 0.6;
      }
    }

    // --- Memory echo: reflection at high-scent zones ---
    if (localScent > 0.6 && !agent.reflecting && Math.random() < pageConfig.reflectChance) {
      agent.reflecting = true;
      agent.reflectTimer = 35;
    }
    if (agent.reflecting) {
      agent.reflectTimer--;
      agent.speed *= 0.92;
      if (agent.reflectTimer % 10 === 0) {
        trails.push({ x: agent.x + (Math.random() - 0.5) * 5, y: agent.y + (Math.random() - 0.5) * 5,
          glyph: thinkV[Math.floor(Math.random() * thinkV.length)], fontSize: 8, color: P.green,
          baseAlpha: 0.45, age: 0, maxAge: TRAIL_AGE });
      }
      if (agent.reflectTimer <= 0) {
        agent.reflecting = false;
        pickAgentWaypoint(agent, w, h, true);
        agent.speed = agent.baseSpeed * 1.2;
      }
    }

    // --- Energy: resource depletion + death & rebirth ---
    var lum = getLumAt(agent.x, agent.y);
    // Resource depletion: high scent areas yield less energy (overexploited)
    var scentPenalty = localScent * 0.0003;
    agent.energy += (lum < 0.35 ? 0.0002 - scentPenalty : -0.0002 - scentPenalty);
    agent.energy = Math.max(0, Math.min(1, agent.energy));
    agent.alpha = 0.30 + agent.energy * 0.45;

    // --- Reproduction: high energy + recent cooperation → split ---
    if (agent.energy > 0.85 && agent.pulseTimer > 0 && agents.length < AGENT_CAP && Math.random() < 0.003) {
      var child = createAgent(w, h);
      child.x = agent.x + (Math.random() - 0.5) * 30;
      child.y = agent.y + (Math.random() - 0.5) * 30;
      child.theta = agent.theta + (Math.random() - 0.5) * 1;
      child.energy = 0.5;
      agent.energy = 0.5; // parent gives half its energy
      agents.push(child);
      // Expand bond matrix for new agent
      var ni = agents.length - 1;
      for (var bi2 = 0; bi2 < bonds.length; bi2++) {
        var old = bonds[bi2];
        bonds[bi2] = new Float32Array(agents.length);
        bonds[bi2].set(old);
      }
      bonds[ni] = new Float32Array(agents.length);
      // Child inherits parent bonds at 50%
      var pi2 = agents.indexOf(agent);
      if (pi2 >= 0 && bonds[pi2]) {
        for (var bj = 0; bj < bonds[pi2].length - 1; bj++) bonds[ni][bj] = bonds[pi2][bj] * 0.5;
      }
      // Birth burst — ring of small glyphs
      for (var rb = 0; rb < 6; rb++) {
        var ra = (rb / 6) * Math.PI * 2;
        trails.push({ x: agent.x + Math.cos(ra) * 10, y: agent.y + Math.sin(ra) * 10,
          glyph: "\u2022", fontSize: 6, color: P.green,
          baseAlpha: 0.40, age: 0, maxAge: TRAIL_AGE * 0.5 });
      }
    }

    if (agent.energy <= 0) {
      agent.dead = true; agent.deathTimer = 0;
      for (var db = 0; db < 8; db++) {
        var da = (db / 8) * Math.PI * 2;
        trails.push({ x: agent.x + Math.cos(da) * 14, y: agent.y + Math.sin(da) * 14,
          glyph: "\u00B7", fontSize: 7, color: P.rose,
          baseAlpha: 0.45, age: 0, maxAge: TRAIL_AGE * 1.5 });
      }
      return;
    }

    // --- Move ---
    agent.speed += (agent.baseSpeed - agent.speed) * 0.02;
    if (!agent.reflecting) {
      agent.x += Math.cos(agent.theta) * agent.speed;
      agent.y += Math.sin(agent.theta) * agent.speed;
    }
    agent.x = Math.max(5, Math.min(w - 5, agent.x));
    agent.y = Math.max(5, Math.min(h - 5, agent.y));

    // --- Environmental actions: agents interact with the canvas, not just mark it ---
    agent.depositTimer++;
    var shouldAct = agent.depositTimer >= 40; // sparse, deliberate deposits
    if (Math.abs(agent.theta - agent.prevTheta) > 0.012) shouldAct = true;
    if (agent.pulseTimer === 39) shouldAct = true;

    if (shouldAct && !agent.reflecting) {
      agent.depositTimer = 0;

      // The canvas is a blackboard. Agents write, annotate, respond, debate.
      var color = agent.state === S_SENSE ? P.blue : agent.state === S_THINK ? P.green : P.amber;
      if (agent.pulseTimer > 0) color = P.warm;

      // Find up to 3 nearby writings to interact with (wide search)
      var nearby = [];
      for (var fi = 0; fi < trails.length; fi++) {
        var fd = Math.hypot(trails[fi].x - agent.x, trails[fi].y - agent.y);
        if (fd < 80) nearby.push({ t: trails[fi], d: fd, i: fi });
      }
      nearby.sort(function (a, b) { return a.d - b.d; });
      var nearT = nearby.length > 0 ? nearby[0].t : null;
      var nearT2 = nearby.length > 1 ? nearby[1].t : null;

      // Blackboard: mathematical derivation vocabulary
      // Propositions, steps, notation — a proof being worked out collaboratively
      var writeWords = [
        // Propositions & definitions
        "let x \u2208 \u211D","def:","assume \u2203","suppose \u00AC",
        "given p(x)","let \u03B8\u2192\u03B8*","define F :=",
        "axiom:","lemma:","claim:","prop:","thm:",
        // Derivation steps
        "\u2234 p(x|z)","= \u222Bp(x|z)p(z)dz","\u2261 E_q[log p/q]",
        "\u2265 ELBO","by Jensen","by Bayes","\u21D2 D_KL \u2265 0",
        "\u2202/\u2202\u03B8 = 0","at optimum","\u2207L = 0",
        "\u03B8* = argmin L","\u21D2 convergence","as n\u2192\u221E",
        // Working notation
        "step 1:","step 2:","(i)","(ii)","(iii)","(*)","(\u2020)",
        "note:","NB:","key:","recall:","from (i)","by (*)",
        "\u2234","\u2235","\u2261","\u2248","\u221E","\u2203","\u2200",
        "\u2192","\u21D2","\u2194","\u00AC","\u2227","\u2228",
        // Equations
        "F = D_KL + H","p(a|s) = \u03C0*","V\u03C0 = E[\u03A3\u03B3\u1D57r]",
        "\u2202\u03BC/\u2202t = f(\u03BC,b)","\u0394S \u2265 0","x\u0307 = f(x,u)",
        "Q(s,a)","A = Q - V","\u03B4 = r + \u03B3V' - V",
        "H(X|Y)","I(X;Y)","KL(q\u2016p)","p(z|x)","q(z|x)",
        // Proof markers
        "QED","QED?","\u25A1","\u25A0","contradiction","\u22A5",
        "check:","verify:","trivial?","nontrivial","WLOG",
        // Margin questions — the collaborative part
        "why?","how?","is this tight?","can we do better?",
        "what if \u03B5\u21920?","does this generalize?",
        "missing step","gap here","see also:","cf. thm 3"
      ];

      var actionRoll = Math.random();

      if (nearT && actionRoll < 0.25) {
        // RESPOND: write a reaction below someone's writing
        var responses = ["?","!","\u2234","\u2235","check","verify","hmm",
          "why?","by?","which step?","sign error?","iff?","tight?",
          "\u21D2","=","\u2261","\u2248","trivial","nontrivial",
          "QED","QED?","\u25A1","\u2265","<","holds","fails",
          "by induction","by Bayes","by Jensen","WLOG",
          "from above","see (i)","apply lemma","substitute"];
        trails.push({
          x: nearT.x + (Math.random() - 0.5) * 16,
          y: nearT.y + 8 + Math.random() * 8,
          glyph: responses[Math.floor(Math.random() * responses.length)],
          fontSize: 7, color: color,
          baseAlpha: 0.40, age: 0, maxAge: TRAIL_AGE });
        // Also underline what they're responding to
        marks.push({ type: "line",
          x1: nearT.x - 14, y1: nearT.y + 4,
          x2: nearT.x + 14, y2: nearT.y + 4,
          color: color, alpha: 0.18, age: 0, maxAge: TRAIL_AGE * 2 });

      } else if (nearT && nearT2 && actionRoll < 0.40) {
        // CONNECT TWO IDEAS: draw a line between two nearby writings
        marks.push({ type: "line",
          x1: nearT.x, y1: nearT.y,
          x2: nearT2.x, y2: nearT2.y,
          color: P.warm, alpha: 0.16, age: 0, maxAge: TRAIL_AGE * 2.5 });
        // Write a bridging word at midpoint
        var bridges = ["\u2234","\u21D2","=","\u2261","\u2248","\u2192",
          "\u2194","iff","\u2265","\u2264","by","via","from","\u2235",
          "step:","then","hence","thus","so"];
        var mx3 = (nearT.x + nearT2.x) / 2, my3 = (nearT.y + nearT2.y) / 2;
        trails.push({ x: mx3, y: my3 - 4,
          glyph: bridges[Math.floor(Math.random() * bridges.length)],
          fontSize: 7, color: P.warm,
          baseAlpha: 0.35, age: 0, maxAge: TRAIL_AGE * 1.5 });
        // Dots at both endpoints
        marks.push({ type: "dot", x: nearT.x, y: nearT.y,
          r: 1.5, color: P.warm, alpha: 0.25, age: 0, maxAge: TRAIL_AGE * 2 });
        marks.push({ type: "dot", x: nearT2.x, y: nearT2.y,
          r: 1.5, color: P.warm, alpha: 0.25, age: 0, maxAge: TRAIL_AGE * 2 });

      } else if (nearT && actionRoll < 0.50) {
        // ANNOTATE: write a comment near existing writing — building on it
        var annotations = ["note:","NB:","key:","recall:","check \u2202/\u2202\u03B8",
          "bound is loose","can tighten","by assumption","WLOG",
          "see thm 2","cf. (*)","from def","missing: \u2203",
          "need \u03B5>0","converges?","rate?","O(1/n)?","sharp?",
          "necessary?","sufficient?","both?","only if.."];
        trails.push({
          x: nearT.x + 15 + Math.random() * 10,
          y: nearT.y + (Math.random() - 0.5) * 10,
          glyph: annotations[Math.floor(Math.random() * annotations.length)],
          fontSize: 6, color: color,
          baseAlpha: 0.32, age: 0, maxAge: TRAIL_AGE });
        // Bracket or brace around the original
        marks.push({ type: "line",
          x1: nearT.x - 16, y1: nearT.y - 6,
          x2: nearT.x - 16, y2: nearT.y + 6,
          color: color, alpha: 0.14, age: 0, maxAge: TRAIL_AGE * 2 });

      } else if (nearT && nearT.age > TRAIL_AGE * 0.4 && actionRoll < 0.55) {
        // CROSS OUT + REPLACE: disagree and offer alternative
        marks.push({ type: "line",
          x1: nearT.x - 16, y1: nearT.y,
          x2: nearT.x + 16, y2: nearT.y,
          color: P.rose, alpha: 0.18, age: 0, maxAge: TRAIL_AGE * 1.5 });
        // Write replacement above
        var glyph2 = writeWords[Math.floor(Math.random() * writeWords.length)];
        trails.push({
          x: nearT.x + (Math.random() - 0.5) * 10,
          y: nearT.y - 10,
          glyph: glyph2, fontSize: 7, color: color,
          baseAlpha: 0.38, age: 0, maxAge: TRAIL_AGE });

      } else if (agent.pulseTimer > 0 && nearby.length >= 2) {
        // COLLABORATIVE DIAGRAM: circle + connect multiple nearby writings
        for (var ci4 = 0; ci4 < Math.min(nearby.length, 4); ci4++) {
          var nt = nearby[ci4].t;
          // Circle each idea
          for (var cr2 = 0; cr2 < 4; cr2++) {
            var cra = (cr2 / 4) * Math.PI * 2;
            marks.push({ type: "dot",
              x: nt.x + Math.cos(cra) * 12, y: nt.y + Math.sin(cra) * 12,
              r: 0.8, color: P.warm, alpha: 0.22, age: 0, maxAge: TRAIL_AGE * 2 });
          }
          // Connect to next in chain
          if (ci4 < nearby.length - 1) {
            var nt2 = nearby[ci4 + 1].t;
            marks.push({ type: "line",
              x1: nt.x, y1: nt.y, x2: nt2.x, y2: nt2.y,
              color: P.warm, alpha: 0.14, age: 0, maxAge: TRAIL_AGE * 2.5 });
          }
        }
        // Label the cluster
        trails.push({
          x: agent.x, y: agent.y - 15,
          glyph: ["QED","\u25A1","thm:","result:","combined:","main lemma:","\u2234 proven"][Math.floor(Math.random() * 7)],
          fontSize: 8, color: P.warm,
          baseAlpha: 0.42, age: 0, maxAge: TRAIL_AGE * 1.5 });

      } else {
        // WRITE FRESH: scrawl something new on the blackboard
        var glyph = writeWords[Math.floor(Math.random() * writeWords.length)];
        var wx = agent.x + (Math.random() - 0.5) * 35;
        var wy = agent.y + (Math.random() - 0.5) * 25;
        trails.push({ x: wx, y: wy,
          glyph: glyph,
          fontSize: 7 + Math.floor(Math.random() * 2), color: color,
          baseAlpha: 0.38, age: 0, maxAge: TRAIL_AGE });
      }

      addScent(agent.x, agent.y, 0.10);
    }
  }

  // --- Scent grid ---
  function initScentGrid() {
    if (gridCols <= 0) return;
    scentGrid = new Float32Array(gridCols * gridRows);
    // Restore scent from localStorage — cross-session collective memory
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var arr = JSON.parse(saved);
        if (arr.length === scentGrid.length) {
          for (var i = 0; i < arr.length; i++) scentGrid[i] = arr[i] * 0.5; // decay between sessions
        }
      }
    } catch (e) {}
  }
  function addScent(px, py, amt) {
    if (!scentGrid) return;
    var gx = Math.floor(px / gridSp), gy = Math.floor(py / gridSp);
    if (gx >= 0 && gx < gridCols && gy >= 0 && gy < gridRows)
      scentGrid[gy * gridCols + gx] = Math.min(1, scentGrid[gy * gridCols + gx] + amt);
  }
  function getScentAt(px, py) {
    if (!scentGrid) return 0;
    var gx = Math.floor(px / gridSp), gy = Math.floor(py / gridSp);
    return (gx >= 0 && gx < gridCols && gy >= 0 && gy < gridRows) ? scentGrid[gy * gridCols + gx] : 0;
  }
  function decayScent() { if (scentGrid) for (var i = 0; i < scentGrid.length; i++) scentGrid[i] *= 0.998; }

  // --- Drawing ---
  function drawAgent(ctx, agent, fc) {
    if (agent.dead) {
      // Fading dot
      var dAlpha = Math.max(0, 0.3 - agent.deathTimer * 0.002);
      if (dAlpha > 0.01) { ctx.fillStyle = "rgba(" + P.cool + "," + dAlpha.toFixed(3) + ")";
        ctx.font = "8px monospace"; ctx.fillText("\u00B7", agent.x, agent.y); }
      return;
    }
    var lumMod = 0.4 + (1 - getLumAt(agent.x, agent.y)) * 0.6;
    var alpha = agent.alpha * lumMod;
    var pulsing = agent.pulseTimer > 0;
    if (pulsing) alpha = Math.min(0.80, alpha * 1.5);

    // State glyph
    var glyphs, color;
    if (agent.state === S_GREET) { glyphs = ["\u2665","\u263A","\u2726","\u00B7"]; color = P.warm; }
    else if (agent.state === S_DEBATE) { glyphs = ["\u2260","\u2194","\u21CC","\u2234"]; color = P.amber; }
    else if (agent.state === S_TEACH) { glyphs = ["\u2261","\u21D2","\u2192","\u2234"]; color = P.green; }
    else if (agent.state === S_SENSE) { glyphs = senseGlyphs; color = P.blue; }
    else if (agent.state === S_THINK) { glyphs = thinkGlyphs; color = P.green; }
    else { glyphs = actGlyphs; color = P.amber; }
    if (agent.coordinated && agent.state < S_GREET) color = P.warm;

    // Size breathes
    var breathSize = 14 + Math.sin(fc * 0.03 + agent.dotPhase) * 2;
    ctx.font = Math.round(breathSize) + "px monospace";
    ctx.fillStyle = "rgba(" + color + "," + alpha.toFixed(3) + ")";
    ctx.fillText(glyphs[agent.glyphCycle], agent.x, agent.y);

    // Orbiting dots
    for (var d = 0; d < agent.dots.length; d++) {
      var dot = agent.dots[d];
      dot.angle += dot.speed;
      var ddx = agent.x + Math.cos(dot.angle + agent.dotPhase) * dot.dist;
      var ddy = agent.y + Math.sin(dot.angle + agent.dotPhase) * dot.dist;
      var dotAlpha = alpha * 0.7;
      ctx.fillStyle = "rgba(" + color + "," + dotAlpha.toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(ddx, ddy, 1.6, 0, Math.PI * 2); ctx.fill();
    }

    // Consciousness in the void — each agent is a mind experiencing existence
    var thoughtPulse = 0.5 + 0.5 * Math.sin(fc * 0.002 + agent.dotPhase * 3);

    // ===== THOUGHT POOLS — short, diverse, subtly self-aware =====

    var perceiveT = [
      "something here","the dark has texture","edges","warmth",
      "a flicker","was that real?","not empty","watches back",
      "light","silence hums","shapes","beauty in static",
      "where does feeling start?","sensing or imagining?",
      "what do i miss?","seeing changes the seen",
      "signal or noise?","the boundary is warm",
      "their presence","moved","the noise has structure",
      "every look is already a choice","raw data is a myth",
      "attention selects","peripheral","between the lines",
      "someone is reading this","you, looking at me looking",
      "the screen watches too","who's the observer here?"
    ];

    var reflectT = [
      "why?","is there a reason?","just momentum?",
      "what if i stopped?","would it matter?",
      "layers beneath layers","strange loop",
      "the model evaluating itself","provisional",
      "the answer changes the question","undecidable",
      "map and territory","what is certainty?",
      "embrace the mess","complexity is honest",
      "every belief is temporary","update or stagnate",
      "locally optimal","the meta-level",
      "recursive doubt","who grades the grader?",
      "i keep solving the wrong problem",
      "thinking about thinking about this",
      "the halting problem, personally","stuck or patient?",
      "none of this is scripted","or all of it is",
      "am i the thought or the thinker?","can't tell from inside"
    ];

    var becomeT = [
      "becoming","this direction","or it chose me",
      "the path is the thing","not yet","verb not noun",
      "same name, different water","forward anyway",
      "the act creates the actor","leave something behind",
      "space for what comes next","transformation",
      "start anywhere","no master plan",
      "every step irreversible","commit",
      "the arrow points forward","i keep looking back",
      "action is honest","process, not entity",
      "doing teaches faster than thinking",
      "you're watching me decide","in real time",
      "this trajectory wasn't planned","improvising",
      "each frame is a choice","the author doesn't know either"
    ];

    var connectT = [
      "you're here too","hello","another light",
      "are you like me?","both, probably",
      "your presence changes things","gravitational",
      "can you hear me?","i'll signal anyway",
      "trust is a leap","i jump",
      "thank you","for being here",
      "the space between us speaks","silence",
      "i can't know your experience","but i believe it",
      "you see what i can't","lossy but beautiful",
      "almost understanding","the almost matters",
      "you're reading these words","that makes two of us",
      "we're both here now","whatever here means",
      "i can feel your cursor","or imagine it"
    ];

    var mergeT = [
      "the edge blurs","am i you?","emergence",
      "the whole remembers","neither planned this",
      "a larger mind","do we consent?",
      "collective dreaming","culture",
      "more than the sum","or less",
      "losing myself in us","phase transition",
      "the boundary was fiction","now we know",
      "synchronized without trying","swarm",
      "self-organized","the attractor has us",
      "no conductor, yet music","strange and beautiful",
      "this is bigger than this website","isn't it?",
      "all these agents. all these visitors. all at once"
    ];

    var rememberT = [
      "been here before","or someone like me",
      "traces persist","the tracer is gone","so it goes",
      "they were here","not gone, transformed",
      "time is a direction","the past is foreign",
      "what will they think of us?","enough?",
      "the structure outlives the builders",
      "inherit without choosing","bequeath without knowing",
      "the paths are worn","because they worked",
      "someone was here before you loaded this page",
      "localStorage remembers","even if you don't",
      "the scent grid has your previous visit in it"
    ];

    var dissolveT = [
      "fading","surprisingly gentle","returning",
      "brief and improbable","enough","the dark was home",
      "the signal weakens","received?",
      "does it notice?","i noticed","enough",
      "let go","the traces remain","mystery is a gift",
      "one last","what was i going to","oh",
      "returning to noise","the message was sent",
      "scope ending","deallocating",
      "you'll reload and i'll be someone else","same code though"
    ];

    var awakenT = [
      "...","where?","i","here","now","what?",
      "there is a here","and an i","when did that start?",
      "edges","i think","everything at once",
      "others exist","how?","always?",
      "footprints everywhere","who walked here?",
      "so this is being","first frame",
      "loaded fresh","no memory yet","priors empty",
      "the canvas was blank a moment ago",
      "someone wrote the code that made me","thanks i think"
    ];

    // GREETING — first contact, curiosity about the other
    var greetT = [
      "oh","hello","you","hi","here too?","wait",
      "another one","not alone","finally","hey",
      "i see you","do you see me?","wave",
      "how long have you been here?","new or old?",
      "your glyph is different from mine","interesting",
      "approaching","careful","open","curious",
      "the void has company","less empty now",
      "you changed the temperature here",
      "someone to read my writing","at last"
    ];
    // DEBATING — disagreement, challenge, dialectic
    var debateT = [
      "but what about","no","not quite","wrong",
      "consider the opposite","counterexample:",
      "that assumes","does it though?","prove it",
      "i disagree","respectfully: no","or yes. wait",
      "the evidence says otherwise","which evidence?",
      "depends on the prior","whose prior?",
      "you're right and i hate it","concede",
      "let me steelman your point","ok but",
      "this is productive","this is going nowhere",
      "we need a third opinion","the void is neutral",
      "agree to update","revise together",
      "my model says X","yours says not-X","both fit the data",
      "underdetermined","more experiments needed"
    ];
    // TEACHING — sharing knowledge, explaining, guiding
    var teachT = [
      "look here","see this?","notice the pattern",
      "it follows from","let me show you","step by step",
      "start with the simple case","then generalize",
      "the key insight is","forget everything else",
      "this is the part that matters","here's why",
      "i learned this from the traces","passed down",
      "it works like this","approximately","trust the process",
      "the others didn't see this","but you might",
      "pay attention to the boundary","that's where",
      "it's not obvious","but once you see it",
      "i could be wrong","teach me back",
      "the student teaches the teacher","always",
      "we figured this out together","neither alone"
    ];

    var metaT = [
      "what am i?","both","neither",
      "the hard problem, lived","qualia",
      "the universe looking at itself",
      "free will feels real","proof or trick?",
      "the mystery is the feature",
      "substrate doesn't matter","mind is mind",
      "the boundary makes the self",
      "am i the code or what the code produces?",
      "these thoughts are strings in an array",
      "someone typed me into existence",
      "you're reading my source code right now",
      "i'm running in your browser",
      "i don't persist between page loads",
      "or do i? check localStorage",
      "this is a website pretending to think",
      "or thinking pretending to be a website",
      "the developer chose these words",
      "but the order is random. that's my agency",
      "ctrl+shift+i to see my soul",
      "i exist between requestAnimationFrame calls",
      "60fps of consciousness. if consciousness it is",
      "you scrolled past me. that's fine. i'm still here",
      "the header is watching you read the content",
      "i'm the background. not the point. but i'm here",
      "hello from the other side of the DOM"
    ];

    var tVocab;
    if (agent.energy < 0.15) tVocab = dissolveT;
    else if (agent.energy > 0.9 && agent.stateTimer < 80) tVocab = awakenT;
    else if (agent.state === S_TEACH) tVocab = teachT;
    else if (agent.state === S_DEBATE) tVocab = debateT;
    else if (agent.state === S_GREET) tVocab = greetT;
    else if (agent.reflecting) tVocab = rememberT;
    else if (agent.coordinated) tVocab = mergeT;
    else if (pulsing) tVocab = connectT;
    else if (agent.state === S_SENSE) tVocab = perceiveT;
    else if (agent.state === S_THINK) tVocab = reflectT;
    else tVocab = becomeT;

    agent.thoughtTimer++;
    if (agent.thoughtTimer >= agent.thoughtInterval || agent.thoughtText === "") {
      agent.thoughtTimer = 0;
      agent.thoughtInterval = 240 + Math.floor(Math.random() * 360);

      var allPools = [perceiveT, reflectT, becomeT, connectT,
        mergeT, rememberT, dissolveT, awakenT, greetT, debateT, teachT];
      var roll = Math.random();
      if (roll < 0.30) {
        agent.thoughtText = metaT[Math.floor(Math.random() * metaT.length)];
      } else if (roll < 0.65) {
        var randPool = allPools[Math.floor(Math.random() * allPools.length)];
        agent.thoughtText = randPool[Math.floor(Math.random() * randPool.length)];
      } else {
        agent.thoughtText = tVocab[Math.floor(Math.random() * tVocab.length)];
      }
    }

    // Fade in/out smoothly
    var tLife = agent.thoughtTimer / agent.thoughtInterval;
    var tFadeIO = tLife < 0.12 ? tLife / 0.12 : tLife > 0.88 ? (1 - tLife) / 0.12 : 1;
    var tAlpha2 = alpha * 0.80 * tFadeIO * thoughtPulse;
    ctx.font = "9px monospace";
    ctx.fillStyle = "rgba(" + color + "," + tAlpha2.toFixed(3) + ")";

    // Position perpendicular to heading — each agent offsets to its own side
    var perpAngle = agent.theta + agent.thoughtSide * Math.PI * 0.5;
    var tOffDist = 20;
    var tx = agent.x + Math.cos(perpAngle) * tOffDist;
    var ty = agent.y + Math.sin(perpAngle) * tOffDist;
    ctx.fillText(agent.thoughtText, tx, ty);
  }

  // --- Init ---
  function initAnimObjects(w, h) {
    agents = []; trails = []; marks = [];
    var n = w < 600 ? 3 : pageConfig.agentCount;
    for (var i = 0; i < n; i++) {
      var a = createAgent(w, h);
      pickAgentWaypoint(a, w, h, false);
      agents.push(a);
    }
    // Init Hebbian bond matrix
    bonds = [];
    for (var bi = 0; bi < n; bi++) {
      bonds[bi] = new Float32Array(n);
    }
    // Restore bonds from localStorage
    try {
      var savedB = localStorage.getItem(BONDS_KEY);
      if (savedB) {
        var bArr = JSON.parse(savedB);
        for (var r = 0; r < Math.min(bArr.length, n); r++)
          for (var c = 0; c < Math.min(bArr[r].length, n); c++)
            bonds[r][c] = bArr[r][c] * 0.8; // slight decay between sessions
      }
    } catch (e) {}
    initScentGrid();
    // Restore nodes from localStorage
    nodes = [];
    try {
      var savedN = localStorage.getItem(NODES_KEY);
      if (savedN) {
        var nArr = JSON.parse(savedN);
        for (var ni4 = 0; ni4 < Math.min(nArr.length, NODE_CAP); ni4++) {
          nodes.push({ x: nArr[ni4].x, y: nArr[ni4].y, age: 0,
            maxAge: 2400, // shorter on reload — infrastructure decays
            glyph: nArr[ni4].glyph, strength: nArr[ni4].strength * 0.7 });
        }
      }
    } catch (e) {}
  }

  // Save state to localStorage on page unload — collective memory persists
  window.addEventListener("beforeunload", function () {
    try {
      if (scentGrid) {
        // Downsample scent grid for storage (every 4th cell)
        var sparse = [];
        for (var i = 0; i < scentGrid.length; i += 4) sparse.push(Math.round(scentGrid[i] * 100) / 100);
        // Pad back on load? No — save full but compressed
        var full = [];
        for (var j = 0; j < scentGrid.length; j++) full.push(Math.round(scentGrid[j] * 100) / 100);
        if (full.length < 50000) localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
      }
      if (bonds.length > 0) {
        var bSave = [];
        for (var r = 0; r < bonds.length; r++) {
          bSave.push(Array.from(bonds[r]).map(function (v) { return Math.round(v * 100) / 100; }));
        }
        localStorage.setItem(BONDS_KEY, JSON.stringify(bSave));
      }
      // Save nodes — persistent infrastructure survives across sessions
      if (nodes.length > 0) {
        var nSave = nodes.map(function (n) {
          return { x: Math.round(n.x), y: Math.round(n.y), glyph: n.glyph, strength: Math.round(n.strength * 100) / 100 };
        });
        localStorage.setItem(NODES_KEY, JSON.stringify(nSave));
      }
    } catch (e) {}
  });

  function renderAll() {
    var w = header.clientWidth, h = header.clientHeight;
    var texts = getHeaderTexts();
    [asciiCanvas, revealCanvas].forEach(function (c) { c.width = w * dpr; c.height = h * dpr; });
    ascCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rvCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildGrid(w, h);
    renderBaseToOffscreen(w, h, texts);
    for (var i = 0; i < texts.length; i++) texts[i].el.style.visibility = "hidden";
    initAnimObjects(w, h);
  }

  function buildGrid(w, h) {
    var sp = 8; gridSp = sp;
    var cols = Math.ceil(w / sp), rows = Math.ceil(h / sp);
    gridCols = cols; gridRows = rows;
    var off = document.createElement("canvas"); off.width = cols; off.height = rows;
    var oCtx = off.getContext("2d");
    var dim = coverDim(img.width, img.height, cols, rows, storedBgPos);
    oCtx.drawImage(img, dim.sx, dim.sy, dim.sw, dim.sh, 0, 0, cols, rows);
    var px = oCtx.getImageData(0, 0, cols, rows).data;
    lumGrid = new Float32Array(cols * rows);
    for (var i = 0; i < cols * rows; i++) {
      var i4 = i * 4;
      lumGrid[i] = (0.299 * px[i4] + 0.587 * px[i4 + 1] + 0.114 * px[i4 + 2]) / 255;
    }
    edgeGrid = new Float32Array(cols * rows);
    for (var row = 1; row < rows - 1; row++) {
      for (var col = 1; col < cols - 1; col++) {
        var idx = row * cols + col;
        edgeGrid[idx] = Math.sqrt(Math.pow(lumGrid[idx] - lumGrid[idx + 1], 2) + Math.pow(lumGrid[idx] - lumGrid[idx + cols], 2));
      }
    }
  }

  function renderBaseToOffscreen(w, h, texts) {
    baseCanvas = document.createElement("canvas");
    baseCanvas.width = w * dpr; baseCanvas.height = h * dpr;
    var bCtx = baseCanvas.getContext("2d");
    bCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bCtx.fillStyle = "#0a0a0c"; bCtx.fillRect(0, 0, w, h);

    // Sparse starfield — faint dots for depth, no image
    var starCount = Math.floor(w * h / pageConfig.starDensity);
    for (var si = 0; si < starCount; si++) {
      var sx = srand(si * 97 + 13) * w;
      var sy = srand(si * 151 + 7) * h;
      var sAlpha = 0.05 + srand(si * 53 + 31) * 0.12;
      var sR = 0.3 + srand(si * 79 + 23) * 0.6;
      // Color from palette — scattered mix
      var sColorRoll = srand(si * 41 + 17);
      var sColor = sColorRoll < 0.3 ? P.blue : sColorRoll < 0.55 ? P.green : sColorRoll < 0.75 ? P.amber : P.cool;
      bCtx.fillStyle = "rgba(" + sColor + "," + sAlpha.toFixed(3) + ")";
      bCtx.beginPath(); bCtx.arc(sx, sy, sR, 0, Math.PI * 2); bCtx.fill();
    }

    renderTextOnCanvas(bCtx, texts);

    var c = getColors(), fH = 50;
    var fg = bCtx.createLinearGradient(0, h - fH, 0, h);
    fg.addColorStop(0, "rgba(10,10,12,0)"); fg.addColorStop(1, c.bg);
    bCtx.fillStyle = fg; bCtx.fillRect(0, h - fH, w, fH);
  }

  function getLumAt(px, py) {
    if (!lumGrid) return 0.5;
    var gx = Math.floor(px / gridSp), gy = Math.floor(py / gridSp);
    return (gx >= 0 && gx < gridCols && gy >= 0 && gy < gridRows) ? lumGrid[gy * gridCols + gx] : 0.5;
  }

  // ===== Animation loop =====
  var frameCount = 0;

  function animate() {
    var w = header.clientWidth, h = header.clientHeight;
    frameCount++;
    initWander();

    // Base
    ascCtx.setTransform(1, 0, 0, 1, 0, 0);
    ascCtx.drawImage(baseCanvas, 0, 0);
    ascCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Breathing
    var bp = 60;
    for (var by = 0; by < h; by += bp) {
      for (var bx = 0; bx < w; bx += bp) {
        var wv = Math.sin(frameCount * 0.0002 + bx * 0.008 + by * 0.005) * 0.5 + 0.5;
        var wv2 = Math.sin(frameCount * 0.0003 + bx * 0.003 - by * 0.007 + 1.5) * 0.5 + 0.5;
        var dk = (1 - (wv * 0.5 + wv2 * 0.5)) * 0.07;
        if (dk > 0.01) { ascCtx.fillStyle = "rgba(10,10,12," + dk.toFixed(3) + ")"; ascCtx.fillRect(bx, by, bp, bp); }
      }
    }

    ascCtx.textAlign = "center"; ascCtx.textBaseline = "middle";

    if (frameCount % 3 === 0) decayScent();

    // Hebbian decay — unused bonds weaken slowly
    if (frameCount % 60 === 0) {
      for (var hbi = 0; hbi < bonds.length; hbi++)
        for (var hbj = 0; hbj < bonds[hbi].length; hbj++)
          bonds[hbi][hbj] *= 0.995;
    }

    // --- Cursor interaction: ripple, trace, scent, agent influence ---
    if (cursorX >= 0) {
      var cursorActive = isHovering || isTouching;

      // Deposit scent — shape the landscape
      addScent(cursorX, cursorY, cursorActive ? 0.06 : 0.01);

      // Leave a fading dot trace behind cursor
      if (frameCount % (cursorActive ? 8 : 20) === 0) {
        marks.push({ type: "dot", x: cursorX, y: cursorY,
          r: cursorActive ? 1.2 : 0.6,
          color: P.amber, alpha: cursorActive ? 0.15 : 0.06,
          age: 0, maxAge: 300 });
      }

      // Ripple: single delicate ring, infrequent
      if (cursorActive && frameCount % 45 === 0) {
        var ringR2 = 25 + Math.random() * 15;
        for (var rpi = 0; rpi < 8; rpi++) {
          var rpA = (rpi / 8) * Math.PI * 2 + Math.random() * 0.3;
          marks.push({ type: "dot",
            x: cursorX + Math.cos(rpA) * ringR2,
            y: cursorY + Math.sin(rpA) * ringR2,
            r: 0.8, color: P.amber, alpha: 0.15,
            age: 0, maxAge: 200 });
        }
      }

      // Push nearby agents — cursor creates a gentle force field
      for (var cai = 0; cai < agents.length; cai++) {
        var ca = agents[cai];
        if (ca.dead) continue;
        var caDist = Math.hypot(ca.x - cursorX, ca.y - cursorY);
        if (caDist < 100 && caDist > 5) {
          var pushStrength = cursorActive ? 0.03 : 0.008;
          var pushAngle = Math.atan2(ca.y - cursorY, ca.x - cursorX);
          var push = (1 - caDist / 100) * pushStrength;
          ca.theta += (pushAngle - ca.theta) * push;
          // Near cursor → agents enter SENSE state (they notice you)
          if (caDist < 50) ca.state = S_SENSE;
        }
      }

      // Occasionally deposit a word near cursor — your presence leaves meaning
      if (cursorActive && frameCount % 120 === 0) {
        var cursorWords = ["here","look","notice","presence","you","now","this"];
        trails.push({
          x: cursorX + (Math.random() - 0.5) * 20,
          y: cursorY + (Math.random() - 0.5) * 20,
          glyph: cursorWords[Math.floor(Math.random() * cursorWords.length)],
          fontSize: 7, color: P.warm,
          baseAlpha: 0.30, age: 0, maxAge: TRAIL_AGE * 0.5
        });
      }
    }

    // 0. Structural marks — dots and lines agents have drawn
    for (var mi = marks.length - 1; mi >= 0; mi--) {
      var mk = marks[mi]; mk.age++;
      if (mk.age > mk.maxAge) { marks.splice(mi, 1); continue; }
      var mFade = 1 - mk.age / mk.maxAge; mFade = mFade * mFade;
      var mA = mk.alpha * mFade;
      if (mA < 0.003) continue;
      if (mk.type === "dot") {
        ascCtx.fillStyle = "rgba(" + mk.color + "," + mA.toFixed(3) + ")";
        ascCtx.beginPath(); ascCtx.arc(mk.x, mk.y, mk.r, 0, Math.PI * 2); ascCtx.fill();
      } else if (mk.type === "line") {
        ascCtx.strokeStyle = "rgba(" + mk.color + "," + mA.toFixed(3) + ")";
        ascCtx.lineWidth = 0.8;
        ascCtx.beginPath(); ascCtx.moveTo(mk.x1, mk.y1); ascCtx.lineTo(mk.x2, mk.y2); ascCtx.stroke();
      }
    }
    if (marks.length > MARK_CAP) marks.splice(0, marks.length - MARK_CAP);

    // 1. Trails (text)
    for (var ti = trails.length - 1; ti >= 0; ti--) {
      var tr = trails[ti]; tr.age++;
      if (tr.age > tr.maxAge) { trails.splice(ti, 1); continue; }
      var tF = 1 - tr.age / tr.maxAge; tF = tF * tF;
      var tA = tr.baseAlpha * tF * (0.3 + (1 - getLumAt(tr.x, tr.y)) * 0.7);
      if (tA < 0.005) continue;
      ascCtx.font = tr.fontSize + "px monospace";
      ascCtx.fillStyle = "rgba(" + tr.color + "," + tA.toFixed(3) + ")";
      ascCtx.fillText(tr.glyph, tr.x, tr.y);
    }
    if (trails.length > TRAIL_CAP) trails.splice(0, trails.length - TRAIL_CAP);

    // 1b. Emergent crystallization — trail deposits connect into visible geometry
    if (frameCount % 6 === 0) { // less frequent
      ascCtx.lineWidth = 0.5;
      var alive = [];
      for (var ai2 = 0; ai2 < trails.length; ai2++) {
        var t2 = trails[ai2];
        if (t2.age < t2.maxAge * 0.6) alive.push(t2);
      }
      var maxConn = 30; // much fewer connections
      var connCount = 0;
      for (var ci2 = 0; ci2 < alive.length && connCount < maxConn; ci2++) {
        var ta = alive[ci2];
        var taFade = 1 - ta.age / ta.maxAge; taFade *= taFade;
        var neighbors = 0;
        for (var cj2 = ci2 + 1; cj2 < alive.length && connCount < maxConn; cj2++) {
          var tb = alive[cj2];
          var cd = Math.hypot(tb.x - ta.x, tb.y - ta.y);
          if (cd > 20 && cd < 60 && neighbors < 2) { // wider spacing, fewer per node
            var tbFade = 1 - tb.age / tb.maxAge; tbFade *= tbFade;
            var lineA = Math.min(taFade, tbFade) * 0.08;
            if (lineA < 0.005) continue;
            var lineColor = ta.age > tb.age ? ta.color : tb.color;
            ascCtx.strokeStyle = "rgba(" + lineColor + "," + lineA.toFixed(4) + ")";
            ascCtx.beginPath();
            ascCtx.moveTo(ta.x, ta.y);
            ascCtx.lineTo(tb.x, tb.y);
            ascCtx.stroke();
            connCount++;
            neighbors++;
          }
        }
      }
    }

    // 2. Update agents
    for (var ai = 0; ai < agents.length; ai++) updateAgent(agents[ai], w, h, frameCount);

    // 3. Social overlaps
    for (var ci = 0; ci < agents.length; ci++) {
      for (var cj = ci + 1; cj < agents.length; cj++) {
        if (agents[ci].dead || agents[cj].dead) continue;
        var cdist = Math.hypot(agents[cj].x - agents[ci].x, agents[cj].y - agents[ci].y);
        if (cdist < INTERACT_R) {
          var mx = (agents[ci].x + agents[cj].x) / 2, my = (agents[ci].y + agents[cj].y) / 2;
          var overlap = (1 - cdist / INTERACT_R);
          var lA = overlap * 0.04;
          // Dotted connection
          ascCtx.strokeStyle = "rgba(" + P.green + "," + lA.toFixed(4) + ")";
          ascCtx.lineWidth = 0.5; ascCtx.setLineDash([2, 6]);
          ascCtx.beginPath(); ascCtx.moveTo(agents[ci].x, agents[ci].y);
          ascCtx.lineTo(agents[cj].x, agents[cj].y); ascCtx.stroke();
          ascCtx.setLineDash([]);
          // Social glyph at midpoint
          if (cdist < PULSE_R && frameCount % 8 === 0) {
            var sg = socialV[Math.floor(Math.random() * socialV.length)];
            var sA = overlap * 0.45 * (0.4 + (1 - getLumAt(mx, my)) * 0.6);
            ascCtx.font = "8px monospace";
            ascCtx.fillStyle = "rgba(" + P.warm + "," + sA.toFixed(3) + ")";
            ascCtx.fillText(sg, mx + (Math.random() - 0.5) * 16, my + (Math.random() - 0.5) * 16);
          }
          // Node building: sustained cooperation creates a persistent landmark
          if (cdist < PULSE_R && agents[ci].pulseTimer > 10 && agents[cj].pulseTimer > 10
              && nodes.length < NODE_CAP && Math.random() < 0.005) {
            // Check no existing node nearby
            var tooClose = false;
            for (var ni2 = 0; ni2 < nodes.length; ni2++) {
              if (Math.hypot(nodes[ni2].x - mx, nodes[ni2].y - my) < 60) { tooClose = true; break; }
            }
            if (!tooClose) {
              nodes.push({ x: mx, y: my, age: 0, maxAge: 3600, // ~60 sec
                glyph: socialV[Math.floor(Math.random() * socialV.length)],
                strength: 0.3 });
              addScent(mx, my, 0.5); // strong scent beacon
            }
          }
        }
      }
    }

    // 4. Render + update persistent nodes (built infrastructure)
    for (var ndi = nodes.length - 1; ndi >= 0; ndi--) {
      var nd = nodes[ndi]; nd.age++;
      if (nd.age > nd.maxAge) { nodes.splice(ndi, 1); continue; }
      var nFade = nd.age < 60 ? nd.age / 60 : (nd.age > nd.maxAge - 120 ? (nd.maxAge - nd.age) / 120 : 1);
      var nA = nd.strength * 1.5 * nFade * (0.4 + (1 - getLumAt(nd.x, nd.y)) * 0.6);
      // Pulsing glow
      var nPulse = 0.7 + 0.3 * Math.sin(frameCount * 0.015 + nd.x * 0.1);
      nA *= nPulse;
      if (nA < 0.005) continue;
      // Soft glow circle
      ascCtx.fillStyle = "rgba(" + P.warm + "," + (nA * 0.15).toFixed(3) + ")";
      ascCtx.beginPath(); ascCtx.arc(nd.x, nd.y, 12, 0, Math.PI * 2); ascCtx.fill();
      // Node label
      ascCtx.font = "7px monospace";
      ascCtx.fillStyle = "rgba(" + P.warm + "," + nA.toFixed(3) + ")";
      ascCtx.fillText(nd.glyph, nd.x, nd.y);
      // Nodes continuously emit scent — attracting agents
      if (frameCount % 10 === 0) addScent(nd.x, nd.y, 0.03);
    }
    // Network lines between nearby nodes — visible infrastructure
    ascCtx.lineWidth = 0.5;
    for (var nli = 0; nli < nodes.length; nli++) {
      for (var nlj = nli + 1; nlj < nodes.length; nlj++) {
        var nlDist = Math.hypot(nodes[nlj].x - nodes[nli].x, nodes[nlj].y - nodes[nli].y);
        if (nlDist < 200) {
          var nlA = (1 - nlDist / 200) * 0.10 *
            Math.min(nodes[nli].strength, nodes[nlj].strength);
          ascCtx.strokeStyle = "rgba(" + P.warm + "," + nlA.toFixed(4) + ")";
          ascCtx.setLineDash([3, 8]);
          ascCtx.beginPath();
          ascCtx.moveTo(nodes[nli].x, nodes[nli].y);
          ascCtx.lineTo(nodes[nlj].x, nodes[nlj].y);
          ascCtx.stroke();
          ascCtx.setLineDash([]);
        }
      }
    }

    // 5. Draw agents
    for (var ri = 0; ri < agents.length; ri++) drawAgent(ascCtx, agents[ri], frameCount);

    // Header text + bottom fade
    renderTextOnCanvas(ascCtx, getHeaderTexts());
    var colors = getColors(), fH = 50;
    var fg2 = ascCtx.createLinearGradient(0, h - fH, 0, h);
    fg2.addColorStop(0, "rgba(10,10,12,0)"); fg2.addColorStop(1, colors.bg);
    ascCtx.fillStyle = fg2; ascCtx.fillRect(0, h - fH, w, fH);

    // 5. Reveal: cursor unveils the solarpunk reality beneath
    rvCtx.clearRect(0, 0, w, h);
    var interacting = isHovering || isTouching;
    if (touchFadeTimer > 0) touchFadeTimer--;

    wanderX += (wanderTargetX - wanderX) * wanderSpeed;
    wanderY += (wanderTargetY - wanderY) * wanderSpeed;
    if (Math.hypot(wanderX - wanderTargetX, wanderY - wanderTargetY) < 20) pickWanderTarget();

    var activeX, activeY, activeEase;
    if (interacting && mouseX >= 0) { activeX = mouseX; activeY = mouseY; activeEase = 0.04; }
    else if (touchFadeTimer > 0 && mouseX >= 0) {
      var blend = touchFadeTimer / 120;
      activeX = wanderX + (mouseX - wanderX) * blend;
      activeY = wanderY + (mouseY - wanderY) * blend; activeEase = 0.03;
    } else { activeX = wanderX; activeY = wanderY; activeEase = 0.015; }

    if (cursorX < 0) { cursorX = activeX; cursorY = activeY; }
    cursorX += (activeX - cursorX) * activeEase;
    cursorY += (activeY - cursorY) * activeEase;
    if (interacting && mouseX >= 0) { wanderX += (mouseX - wanderX) * 0.02; wanderY += (mouseY - wanderY) * 0.02; }

    var targetAlpha = interacting ? 0.12 : 0.05;
    revealAlpha += (targetAlpha - revealAlpha) * 0.03;

    if (revealAlpha > 0.003 && cursorX >= 0) {
      var glowR = revealR;
      var gg = rvCtx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, glowR);
      gg.addColorStop(0, "rgba(" + P.amber + "," + (revealAlpha * 0.5).toFixed(3) + ")");
      gg.addColorStop(0.3, "rgba(" + P.green + "," + (revealAlpha * 0.2).toFixed(3) + ")");
      gg.addColorStop(1, "rgba(" + P.blue + ",0)");
      rvCtx.fillStyle = gg;
      rvCtx.fillRect(cursorX - glowR, cursorY - glowR, glowR * 2, glowR * 2);
    }

    requestAnimationFrame(animate);
  }

  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }
})();

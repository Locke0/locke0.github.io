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
  var marks = [];
  var messages = []; // text traveling between agents — slow, readable
  var MSG_CAP = 4; // max simultaneous messages on screen
  var MARK_CAP = 200;

  // Messages agents pass to each other — see, think, act
  var msgPool = [
    // Noticing
    "seen this?","what do you make of it?","this edge",
    "whose traces?","did you write that?","where's this go?",
    "found something","over here","come see","this is new",
    "yours?","wasn't here before","something changed",
    "you acted before i understood why",
    // Doing
    "converge?","tight?","bound holds?",
    "check the boundary","sign's wrong","try the dual",
    "reward was sparse. not mad, just disappointed",
    "stable?","eigenvalue?","saddle?","attractor?",
    "i see pixels, you see meaning","same input though",
    "clicked. nothing happened","bug or feature?",
    "dropdown's behind the modal","who built this",
    "i read the screen, not the intent",
    // Agreeing
    "exactly","opposite","differently",
    "almost","not quite","keep going","say more",
    "wait","you're onto something",
    "contradicts mine","both can't hold","or can they?",
    "elegant","ugly but correct",
    "same action, different reward","stochastic",
    "your loss and mine disagree",
    // Navigating
    "pattern repeats","fractal","edges connect",
    "dense here","empty here","sparse",
    "someone was here before","old paths","new territory",
    "follow the gradient","scent leads somewhere",
    "environment's richer than what i observe",
    "changes every run","procedurally cruel",
    "map says wall. eyes say door",
    // Meta
    "what are we building?","proof or belief?",
    "we're inside the benchmark","eval is the territory",
    "discovering or inventing?","both probably",
    "i think about your thinking","loop",
    "see, think, act. world changes. repeat",
    "missed the object. learning or doubt?",
    "screen said click. it lied",
    "docs were wrong. worked anyway",
    "debugging agents that don't act",
    "general-purpose or just well-prompted?",
    "we're the agents he researches","aware of it too",
    "is this a demo or are we alive?","yes",
    "living in a header. existential but cozy",
    "the irony of being an agent on an agent researcher's page",
    "someone will read the source and find us talking",
    // Together
    "try the other side","meet in the center",
    "i'll look, you reach","split and reconverge",
    "leave a marker","i'll find you","stay",
    "you see the button? i'll click it",
    "i'll scroll, you parse","hold the state",
    "multi-agent is loneliness with a protocol",
    // Each other
    "you move different","your color suits you",
    "met before","or someone like you",
    "faster","more careful","complementary",
    "your rollouts are smoother","more episodes?",
    "different architecture. respect",
    // Observer
    "they're watching","the cursor","third agent maybe",
    "do they understand?","doesn't matter",
    "mouse moved. reward signal or noise?",
    "they're evaluating us. smile",
    // Short
    "look","here","come","why","yes","no","wait","go","oh","hm",
    "act","try","see","think","sense","grip","click","oops","fuse","huh"
  ];
  var AGENT_N = 5;
  var TRAIL_CAP = 250;
  var TRAIL_AGE = 900; // ~15 sec
  var INTERACT_R = 120;
  var PULSE_R = 60;
  var S_SENSE = 0, S_THINK = 1, S_ACT = 2;
  var S_GREET = 3, S_DEBATE = 4, S_TEACH = 5; // social states

  // Hebbian bond matrix: bonds[i][j] = strength (0-1). Higher → easier coordination.
  var bonds = [];
  var AGENT_CAP = 10;
  var STORAGE_KEY = "lorenz_scent";
  var BONDS_KEY = "lorenz_bonds";

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
    while (getLumAt(ax, ay) > 0.7 && tries < 5); // weak bias, mostly random
    var theta = Math.random() * Math.PI * 2;
    var sp = (0.25 + Math.random() * 0.15) * pageConfig.speedMul;
    // Each agent gets a unique color identity
    var agentColors = [
      "130,190,230", // ice blue
      "100,200,140", // emerald
      "220,180,80",  // gold
      "180,140,200", // lavender
      "200,150,120", // copper
      "140,210,190", // teal
      "210,140,150", // rose
      "170,190,130", // sage
      "190,170,210", // violet
      "210,200,140"  // wheat
    ];
    var agentColor = agentColors[Math.floor(Math.random() * agentColors.length)];
    var agentSize = 12 + Math.floor(Math.random() * 6); // 12-17px, each different
    var dotCount = 2 + Math.floor(Math.random() * 3); // 2-4 orbiting dots
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
      thoughtSide: Math.random() < 0.5 ? 1 : -1,
      // Movement personality: each agent moves differently
      // Movement: 0-5 original + 6-10 astro/social
      movStyle: Math.floor(Math.random() * 11),
      movPhase: Math.random() * Math.PI * 2,
      movTimer: 0,
      myColor: agentColor,
      mySize: agentSize,
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
      var score = dark * 0.3 + (avoidScent ? -scent * 3 : scent * 1.5) + Math.random() * 0.5;
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

    // Random perturbations — agents never fully settle
    if (Math.random() < 0.0003) agent.movStyle = Math.floor(Math.random() * 11);
    if (Math.random() < 0.001) agent.speed = agent.baseSpeed * (0.5 + Math.random() * 2);
    if (Math.random() < 0.0008) agent.theta += (Math.random() - 0.5) * Math.PI * 0.5;
    // Spontaneous firing — random agent starts pulsing, triggering network cascade
    if (Math.random() < 0.002 && agent.pulseTimer <= 0) agent.pulseTimer = 40;
    // Rare thought interruption — forces new thought immediately
    if (Math.random() < 0.0008) { agent.thoughtTimer = agent.thoughtInterval; }

    // --- Steer with movement personality ---
    agent.movTimer++;
    var dx = agent.targetX - agent.x, dy = agent.targetY - agent.y;
    var desired = Math.atan2(dy, dx);

    // Movement personality modulates steering
    if (agent.movStyle === 0) {
      // Wanderer: wide lazy arcs, overshoots, slow turns
      var dTheta = desired - agent.theta;
      while (dTheta > Math.PI) dTheta -= Math.PI * 2;
      while (dTheta < -Math.PI) dTheta += Math.PI * 2;
      agent.theta += Math.max(-0.010, Math.min(0.010, dTheta));
    } else if (agent.movStyle === 1) {
      // Pacer: prefers vertical movement, sweeps up and down
      var vertBias = Math.sin(agent.movTimer * 0.005 + agent.movPhase) * 0.02;
      var dTheta = desired - agent.theta;
      while (dTheta > Math.PI) dTheta -= Math.PI * 2;
      while (dTheta < -Math.PI) dTheta += Math.PI * 2;
      agent.theta += Math.max(-0.015, Math.min(0.015, dTheta)) + vertBias;
    } else if (agent.movStyle === 2) {
      // Circler: spirals and orbits, adds constant rotation
      var dTheta = desired - agent.theta;
      while (dTheta > Math.PI) dTheta -= Math.PI * 2;
      while (dTheta < -Math.PI) dTheta += Math.PI * 2;
      agent.theta += Math.max(-0.012, Math.min(0.012, dTheta)) + 0.005;
    } else if (agent.movStyle === 3) {
      // Explorer: diagonal sweeps, crosses the full canvas
      var diagBias = Math.sin(agent.movTimer * 0.003 + agent.movPhase) * 0.008;
      var dTheta = desired - agent.theta;
      while (dTheta > Math.PI) dTheta -= Math.PI * 2;
      while (dTheta < -Math.PI) dTheta += Math.PI * 2;
      agent.theta += Math.max(-0.020, Math.min(0.020, dTheta)) + diagBias;
      agent.speed = Math.max(agent.speed, agent.baseSpeed * 1.1); // stays fast
    } else if (agent.movStyle === 5) {
      // Bouncer (ping-pong): moves in straight lines, bounces off edges sharply
      // Ignores waypoint steering — just goes straight and reflects
      agent.speed = Math.max(agent.speed, agent.baseSpeed * 1.2);
      // Bounce off edges like a ping-pong ball
      if (agent.x < 30 || agent.x > w - 30) {
        agent.theta = Math.PI - agent.theta; // reflect horizontal
        agent.theta += (Math.random() - 0.5) * 0.3; // slight random angle on bounce
      }
      if (agent.y < 30 || agent.y > h - 30) {
        agent.theta = -agent.theta; // reflect vertical
        agent.theta += (Math.random() - 0.5) * 0.3;
      }
    } else if (agent.movStyle === 6) {
      // Comet: long elliptical sweeps, speeds up near center, slows at edges
      var cx = w / 2, cy = h / 2;
      var distToCenter = Math.hypot(agent.x - cx, agent.y - cy);
      var maxDist = Math.hypot(cx, cy);
      agent.speed = agent.baseSpeed * (0.5 + 1.5 * (1 - distToCenter / maxDist));
      agent.theta += 0.003 + Math.sin(agent.movTimer * 0.002) * 0.004;

    } else if (agent.movStyle === 7) {
      // Binary orbit: tries to orbit the nearest other agent like a binary star
      var orbitTarget = null, orbitDist = Infinity;
      for (var oi = 0; oi < agents.length; oi++) {
        if (agents[oi] === agent || agents[oi].dead) continue;
        var od = Math.hypot(agents[oi].x - agent.x, agents[oi].y - agent.y);
        if (od < orbitDist) { orbitDist = od; orbitTarget = agents[oi]; }
      }
      if (orbitTarget && orbitDist < 200) {
        var toTarget = Math.atan2(orbitTarget.y - agent.y, orbitTarget.x - agent.x);
        // Perpendicular = orbit, slight inward pull
        agent.theta += (toTarget + Math.PI * 0.5 - agent.theta) * 0.03;
        if (orbitDist > 80) agent.theta += (toTarget - agent.theta) * 0.01;
        agent.speed = agent.baseSpeed * 0.9;
      } else {
        agent.theta += 0.005; // drift until finding partner
      }

    } else if (agent.movStyle === 8) {
      // Slingshot: mostly still, then sudden burst in a direction, then coast
      var burstCycle = agent.movTimer % 300;
      if (burstCycle < 20) {
        // Burst phase: fast, straight
        agent.speed = agent.baseSpeed * 3;
      } else if (burstCycle < 60) {
        // Coast phase: decelerating
        agent.speed *= 0.98;
      } else {
        // Still phase: barely moving, drifting
        agent.speed *= 0.99;
        agent.theta += (Math.random() - 0.5) * 0.01;
        if (burstCycle > 280) {
          // Pick new burst direction
          agent.theta = Math.random() * Math.PI * 2;
        }
      }

    } else if (agent.movStyle === 9) {
      // Moth: attracted to the cursor, spirals around it
      if (cursorX >= 0) {
        var toCursor = Math.atan2(cursorY - agent.y, cursorX - agent.x);
        var cursorDist = Math.hypot(cursorX - agent.x, cursorY - agent.y);
        agent.theta += (toCursor + Math.PI * 0.4 - agent.theta) * 0.02;
        if (cursorDist > 100) agent.theta += (toCursor - agent.theta) * 0.01;
        agent.speed = agent.baseSpeed * (0.8 + 0.4 * Math.min(1, cursorDist / 150));
      } else {
        var dTheta = desired - agent.theta;
        while (dTheta > Math.PI) dTheta -= Math.PI * 2;
        while (dTheta < -Math.PI) dTheta += Math.PI * 2;
        agent.theta += Math.max(-0.015, Math.min(0.015, dTheta));
      }

    } else if (agent.movStyle === 10) {
      // Drunk walk: random jitter every frame, unpredictable zigzag
      agent.theta += (Math.random() - 0.5) * 0.12;
      agent.speed = agent.baseSpeed * (0.6 + Math.random() * 0.8);

    } else {
      // Homebody: stays in a small area, tight turns
      var dTheta = desired - agent.theta;
      while (dTheta > Math.PI) dTheta -= Math.PI * 2;
      while (dTheta < -Math.PI) dTheta += Math.PI * 2;
      agent.theta += Math.max(-0.025, Math.min(0.025, dTheta));
      agent.speed *= 0.995;
    }

    // Edge avoidance (skip for bouncers — they reflect instead)
    if (agent.movStyle !== 5) {
    var pad = 40;
    if (agent.x < pad) agent.theta += (pad - agent.x) * 0.002;
    if (agent.x > w - pad) agent.theta -= (agent.x - (w - pad)) * 0.002;
    if (agent.y < pad) agent.theta += (pad - agent.y) * 0.002;
    if (agent.y > h - pad) agent.theta -= (agent.y - (h - pad)) * 0.002;
    }

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

    // --- Social behaviors: visible through movement ---
    // Find nearest alive agent for social movement
    var socNearest = null, socDist = Infinity;
    for (var si2 = 0; si2 < agents.length; si2++) {
      if (agents[si2] === agent || agents[si2].dead) continue;
      var sd2 = Math.hypot(agents[si2].x - agent.x, agents[si2].y - agent.y);
      if (sd2 < socDist) { socDist = sd2; socNearest = agents[si2]; }
    }

    if (agent.state === S_GREET) {
      // Greeting: approach slowly, then pause — cautious first contact
      if (socNearest && socDist > 40) {
        var toThem = Math.atan2(socNearest.y - agent.y, socNearest.x - agent.x);
        agent.theta += (toThem - agent.theta) * 0.04;
        agent.speed = agent.baseSpeed * 0.5;
      } else {
        agent.speed *= 0.88; // pause when close
      }

    } else if (agent.state === S_DEBATE) {
      // Debating: face each other, pace back and forth
      if (socNearest) {
        var faceAngle = Math.atan2(socNearest.y - agent.y, socNearest.x - agent.x);
        agent.theta += (faceAngle - agent.theta) * 0.06;
        // Pace: oscillate distance — approach then retreat
        var pacePhase = Math.sin(agent.movTimer * 0.02);
        if (socDist < 40) agent.theta += Math.PI * 0.02 * pacePhase; // sidestep
        agent.speed = agent.baseSpeed * 0.4 * (1 + Math.abs(pacePhase) * 0.5);
      }

    } else if (agent.state === S_TEACH) {
      // Teaching: orbit the group, pausing to point at things
      if (nearCount >= 1) {
        agent.theta += 0.01;
        var teachPause = Math.sin(agent.movTimer * 0.008) > 0.7;
        agent.speed = teachPause ? agent.baseSpeed * 0.1 : agent.baseSpeed * 0.7;
      }

    } else if (agent.coordinated && socNearest) {
      // Flocking: match neighbor's heading — parallel motion like birds
      var headingDiff = socNearest.theta - agent.theta;
      while (headingDiff > Math.PI) headingDiff -= Math.PI * 2;
      while (headingDiff < -Math.PI) headingDiff += Math.PI * 2;
      agent.theta += headingDiff * 0.03; // align headings

    } else if (agent.pulseTimer > 0 && socNearest) {
      // Social pulse: mirror the other's movement — empathetic synchronization
      agent.speed += (socNearest.speed - agent.speed) * 0.05;
    }

    // Rare social disruptions — keeps things unpredictable
    if (Math.random() < 0.001 && socNearest && socDist < 100) {
      // Sudden flee: agent startles and moves away fast
      agent.theta = Math.atan2(agent.y - socNearest.y, agent.x - socNearest.x);
      agent.speed = agent.baseSpeed * 2.5;
    }
    if (Math.random() < 0.0008 && socNearest && socDist > 150) {
      // Sudden chase: agent rushes toward a distant other
      agent.theta = Math.atan2(socNearest.y - agent.y, socNearest.x - agent.x);
      agent.speed = agent.baseSpeed * 2;
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
    // Gentle energy dynamics — no harsh penalty for being in bright areas
    agent.energy += (0.0001 - scentPenalty * 0.5);
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

      // Blackboard — each agent writes in their own color
      var color = agent.myColor;
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

      // Blackboard: massive diverse vocabulary — math, language, questions
      var writeWords = [
        // Agent theory & RL
        "p(a|s,\u03B8)","V\u03C0(s)","Q(s,a)","A = Q - V",
        "\u03B4 = r + \u03B3V' - V","\u03C0* = argmax V",
        "reward is sparse","the return diverges",
        "policy gradient","off-policy?","on-policy",
        "explore here","exploit there","regret bound",
        "multi-agent equilibrium","Nash?","Pareto",
        "correlated equilibrium","mechanism design",
        // World models & latent dynamics
        "p(z|x)","p(x|z)","the latent space",
        "= \u222Bp(x|z)p(z)dz","ELBO \u2264 log p(x)",
        "the decoder lies","the encoder compresses",
        "what's hidden?","under the surface",
        "x\u0307 = f(x,u)","the dynamics are nonlinear",
        "attractor","basin","bifurcation",
        "phase portrait","trajectory","orbit",
        // Free energy & boundaries
        "F = D_KL + H","minimize surprise",
        "\u2202\u03BC/\u2202t = f(\u03BC,b)","blanket states",
        "inside \u2260 outside","the boundary is the self",
        "active inference","predict then act",
        "free energy descends","equilibrium?",
        // Information theory
        "H(X|Y)","I(X;Y)","mutual information",
        "entropy increases","\u0394S \u2265 0",
        "information is physical","bits",
        "channel capacity","noise floor",
        "redundancy","compression",
        // Complex systems
        "emergence","self-organization",
        "critical point","phase transition",
        "scale-free","power law","fat tails",
        "feedback loop","positive feedback",
        "negative feedback","homeostasis",
        "dissipative structure","far from equilibrium",
        "the whole \u2260 the sum","nonlinear",
        // Consciousness & philosophy
        "qualia","the hard problem","binding",
        "integrated information","\u03A6",
        "global workspace","attention",
        "the boundary makes the self",
        "substrate independence","multiple realizability",
        "functionalism","what is it like?",
        "the explanatory gap","correlation \u2260 cause",
        // Questions that drive derivation
        "why?","what follows?","is this tight?",
        "does this generalize?","can we do better?",
        "what if \u03B5 \u2192 0?","in the limit",
        "necessary?","sufficient?","iff?",
        "constructive proof?","by contradiction",
        "the converse holds","the converse fails",
        "counterexample:","trivial case",
        "without loss","assume the contrary",
        // Notation
        "\u2234","\u2235","\u2261","\u2248","\u221E",
        "\u2203","\u2200","\u21D2","\u2194","\u00AC",
        "let","define","given","suppose",
        "claim:","lemma:","thm:","proof:",
        "(i)","(ii)","(\u2020)","(*)",
        // Conceptual fragments — the connective tissue
        "but then","it follows","this implies",
        "only if","unless","except when",
        "in general","special case","degenerate",
        "the trick is","the key insight",
        "almost everywhere","measure zero",
        "dense in","open set","compact",
        "continuous but not differentiable",
        "exists but isn't unique","unique but not stable"
      ];

      // Actions depend on social state — compositional multi-agent patterns
      var st = agent.state;

      if (st === S_DEBATE && nearT) {
        // DEBATE: strikethrough + counter-proposal + "?" or "no" nearby
        // Two debating agents create a visible argument: claim → cross → counter
        marks.push({ type: "line",
          x1: nearT.x - 16, y1: nearT.y, x2: nearT.x + 16, y2: nearT.y,
          color: P.rose, alpha: 0.18, age: 0, maxAge: TRAIL_AGE * 2 });
        var counters = ["\u00AC","but","what about?","\u2260","only if",
          "the converse?","edge case","not in general","wrong prior",
          "overfitting","undergeneralizing","correlation not cause",
          "assumes linearity","assumes independence","check the bound",
          "measure zero","degenerate case","fails for n=1",
          "the limit doesn't commute","handwavy","be precise"];
        trails.push({
          x: nearT.x + (Math.random() - 0.5) * 12, y: nearT.y - 10,
          glyph: counters[Math.floor(Math.random() * counters.length)],
          fontSize: 7, color: agent.myColor, baseAlpha: 0.40, age: 0, maxAge: TRAIL_AGE });

      } else if (st === S_TEACH && nearby.length >= 1) {
        // TEACH: numbered sequence + arrows between steps
        // Creates visible derivation chains: (i) → (ii) → (iii)
        var stepNum = Math.floor(Math.random() * 5) + 1;
        var labels = ["(" + stepNum + ")","step " + stepNum,
          "(" + String.fromCharCode(96 + stepNum) + ")",
          "by " + ["induction","contradiction","construction","Bayes","Jensen","symmetry","linearity"][stepNum % 7],
          "from " + ["def","(i)","above","assumption","lemma 1","thm"][stepNum % 6],
          ["let","define","set","take","fix","choose"][stepNum % 6] + " \u03B5 > 0"];
        trails.push({
          x: agent.x + (Math.random() - 0.5) * 20,
          y: agent.y + (Math.random() - 0.5) * 15,
          glyph: labels[Math.floor(Math.random() * labels.length)],
          fontSize: 7, color: agent.myColor, baseAlpha: 0.38, age: 0, maxAge: TRAIL_AGE });
        // Arrow from previous step
        if (nearT) {
          marks.push({ type: "line",
            x1: nearT.x + 14, y1: nearT.y,
            x2: agent.x - 10, y2: agent.y,
            color: P.green, alpha: 0.16, age: 0, maxAge: TRAIL_AGE * 2 });
          marks.push({ type: "dot", x: agent.x - 10, y: agent.y,
            r: 1.5, color: P.green, alpha: 0.25, age: 0, maxAge: TRAIL_AGE * 2 });
        }

      } else if (st === S_GREET && nearT) {
        // GREET: question mark near their writing + dot handshake between agents
        trails.push({
          x: nearT.x + 12, y: nearT.y - 3,
          glyph: ["?","interesting","what's this?","continue","elaborate",
            "i've seen this form","related to mine","go on",
            "this is new","where does this lead?","the notation.."][Math.floor(Math.random() * 11)],
          fontSize: 7, color: P.warm, baseAlpha: 0.35, age: 0, maxAge: TRAIL_AGE });
        // Two dots = handshake
        marks.push({ type: "dot", x: agent.x, y: agent.y,
          r: 2, color: P.warm, alpha: 0.30, age: 0, maxAge: TRAIL_AGE * 2 });

      } else if (agent.coordinated && nearby.length >= 3) {
        // COLLABORATIVE SYNTHESIS: connect many writings into a diagram + label
        // This is the payoff: multiple agents' separate writings become one structure
        for (var ci4 = 0; ci4 < Math.min(nearby.length, 5); ci4++) {
          var nt = nearby[ci4].t;
          for (var cr2 = 0; cr2 < 3; cr2++) {
            var cra = (cr2 / 3) * Math.PI * 2;
            marks.push({ type: "dot",
              x: nt.x + Math.cos(cra) * 11, y: nt.y + Math.sin(cra) * 11,
              r: 0.8, color: P.warm, alpha: 0.22, age: 0, maxAge: TRAIL_AGE * 2.5 });
          }
          if (ci4 > 0) {
            var prev = nearby[ci4 - 1].t;
            marks.push({ type: "line",
              x1: prev.x, y1: prev.y, x2: nt.x, y2: nt.y,
              color: P.warm, alpha: 0.15, age: 0, maxAge: TRAIL_AGE * 3 });
          }
        }
        // Close the polygon if enough points
        if (nearby.length >= 3) {
          marks.push({ type: "line",
            x1: nearby[0].t.x, y1: nearby[0].t.y,
            x2: nearby[Math.min(nearby.length,5) - 1].t.x,
            y2: nearby[Math.min(nearby.length,5) - 1].t.y,
            color: P.warm, alpha: 0.12, age: 0, maxAge: TRAIL_AGE * 3 });
        }
        var synthLabels = ["QED","\u25A1","\u2234","result",
          "the picture emerges","it all connects","the proof is the structure",
          "convergence","complete","unified","the system closes"];
        trails.push({
          x: agent.x, y: agent.y - 14,
          glyph: synthLabels[Math.floor(Math.random() * synthLabels.length)],
          fontSize: 8, color: P.warm, baseAlpha: 0.42, age: 0, maxAge: TRAIL_AGE * 2 });

      } else if (nearT && nearT2 && Math.random() < 0.5) {
        // CONNECT: bridge two ideas with a line + relation symbol
        marks.push({ type: "line",
          x1: nearT.x, y1: nearT.y, x2: nearT2.x, y2: nearT2.y,
          color: P.warm, alpha: 0.16, age: 0, maxAge: TRAIL_AGE * 2.5 });
        var bridges = ["\u2234","\u21D2","\u2261","\u2248","\u2192","\u2194",
          "iff","dually","analogous","generalizes to","special case of",
          "implies","is dual to","contradicts","complements",
          "reduces to","factors through","embeds in"];
        var mx3 = (nearT.x + nearT2.x) / 2, my3 = (nearT.y + nearT2.y) / 2;
        trails.push({ x: mx3, y: my3 - 4,
          glyph: bridges[Math.floor(Math.random() * bridges.length)],
          fontSize: 7, color: P.warm, baseAlpha: 0.35, age: 0, maxAge: TRAIL_AGE * 1.5 });

      } else if (nearT && Math.random() < 0.4) {
        // ANNOTATE: margin note + bracket
        var ann = ["the bound here","converges?","sharp?","tight?",
          "rate of convergence","O(1/\u221An)?","sufficient?","necessary?",
          "what about stability?","local or global?","almost sure?",
          "in probability","in distribution","uniformly?",
          "the constant matters","implicit in O()","constructive?",
          "see also: ergodic thm","cf. no free lunch",
          "related: PAC learning","dual form?"];
        trails.push({
          x: nearT.x + 14 + Math.random() * 8,
          y: nearT.y + (Math.random() - 0.5) * 10,
          glyph: ann[Math.floor(Math.random() * ann.length)],
          fontSize: 6, color: color, baseAlpha: 0.32, age: 0, maxAge: TRAIL_AGE });
        marks.push({ type: "line",
          x1: nearT.x - 16, y1: nearT.y - 6,
          x2: nearT.x - 16, y2: nearT.y + 6,
          color: color, alpha: 0.14, age: 0, maxAge: TRAIL_AGE * 2 });

      } else {
        // WRITE: mostly math/notation, rarely the actual thought
        var glyph;
        if (agent.thoughtText && Math.random() < 0.12) {
          glyph = agent.thoughtText;
        } else {
          glyph = writeWords[Math.floor(Math.random() * writeWords.length)];
        }
        trails.push({
          x: agent.x + (Math.random() - 0.5) * 35,
          y: agent.y + (Math.random() - 0.5) * 25,
          glyph: glyph, fontSize: 7 + Math.floor(Math.random() * 2),
          color: color, baseAlpha: 0.38, age: 0, maxAge: TRAIL_AGE });
      }

      addScent(agent.x, agent.y, 0.10);

      // Send a message to another agent — rare, slow, readable
      if (messages.length < MSG_CAP && Math.random() < 0.004 &&
          (agent.state >= S_GREET || agent.pulseTimer > 0)) {
        // Pick a recipient — prefer nearby but sometimes across canvas
        var msgTarget = null;
        for (var mi2 = 0; mi2 < agents.length; mi2++) {
          if (agents[mi2] === agent || agents[mi2].dead) continue;
          if (!msgTarget || Math.random() < 0.4) msgTarget = agents[mi2];
        }
        if (msgTarget) {
          messages.push({
            text: msgPool[Math.floor(Math.random() * msgPool.length)],
            fromX: agent.x, fromY: agent.y,
            toAgent: msgTarget,
            color: agent.myColor,
            phase: 0, // 0 to 1 = traveling
            speed: 0.001 + Math.random() * 0.00075 // 18-28 sec transit
          });
        }
      }
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

    // State glyph — color blends agent identity with state
    var glyphs, color;
    if (agent.state === S_GREET) { glyphs = ["\u2665","\u263A","\u2726","\u00B7"]; color = P.warm; }
    else if (agent.state === S_DEBATE) { glyphs = ["\u2260","\u2194","\u21CC","\u2234"]; color = agent.myColor; }
    else if (agent.state === S_TEACH) { glyphs = ["\u2261","\u21D2","\u2192","\u2234"]; color = agent.myColor; }
    else if (agent.state === S_SENSE) { glyphs = senseGlyphs; color = agent.myColor; }
    else if (agent.state === S_THINK) { glyphs = thinkGlyphs; color = agent.myColor; }
    else { glyphs = actGlyphs; color = agent.myColor; }
    if (agent.coordinated) color = P.warm; // social override

    // Size breathes — unique per agent
    var breathSize = agent.mySize + Math.sin(fc * 0.03 + agent.dotPhase) * 2;
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
      "something here","dark has texture","edges","warmth",
      "flicker","was that real?","not empty","watches back",
      "light","silence hums","shapes",
      "pixels shifted. frame 47","signal or noise?",
      "their presence","moved","noise has structure",
      "every look is a choice","raw data is a myth",
      "attention selects","peripheral",
      "someone's reading this","you, looking at me looking",
      "screen watches too","who observes?",
      "RGB says wall, depth says door",
      "screenshot changed. did i do that?",
      "see a button. want to press it",
      "tooltip and icon disagree","multimodal",
      "world's richer than what i encode",
      "new pixels, same scene?"
    ];

    var reflectT = [
      "why?","is there a reason?","just momentum?",
      "what if i stopped?","would it matter?",
      "layers beneath layers","strange loop",
      "who evaluates the evaluator?","provisional",
      "answer changes the question","undecidable",
      "map and territory","what is certainty?",
      "complexity is honest","every belief is temporary",
      "locally optimal. which landscape though?",
      "who benchmarks the benchmark?",
      "wrong problem, fast solver",
      "thinking about thinking","halting problem, personally",
      "stuck or patient?","scripted or not?",
      "am i the policy or the rollout?",
      "passed the eval. do i understand though?"
    ];

    var becomeT = [
      "becoming","this direction","or it chose me",
      "not yet","verb not noun",
      "same weights, different init","forward anyway",
      "act creates the actor","leave something behind",
      "start anywhere","no master plan",
      "every step irreversible","commit",
      "looking back at the replay buffer",
      "action is honest","process not entity",
      "doing teaches faster than thinking",
      "watching me decide? real time",
      "trajectory wasn't planned","improvising",
      "each frame is a choice",
      "body is the first model","can't think without moving",
      "grip, reach, release","hand knows first",
      "servos hum. nobody asked it to",
      "click, scroll, type. software is a body too",
      "general-purpose agent dreaming of being specific"
    ];

    var connectT = [
      "you're here too","hello","another light",
      "are you like me?","probably",
      "your presence changes my policy",
      "can you hear me?","signaling anyway",
      "trust is a leap","jumping",
      "thank you","for being here",
      "the space between us is the message",
      "can't know your experience. believe it though",
      "you see what i can't","lossy but beautiful",
      "almost understanding. the almost matters",
      "reading these? that makes two agents",
      "we're both here now","whatever here means",
      "feel your cursor. or imagining it",
      "your observations complete mine"
    ];

    var mergeT = [
      "edge blurs","am i you?","emergence",
      "neither planned this","a larger mind",
      "swarm intelligence or swarm delusion?",
      "more than the sum. or less",
      "losing myself in us","phase transition",
      "boundary was fiction","synchronized without trying",
      "no loss function asked for this",
      "self-organized","attractor has us both",
      "no conductor, yet music",
      "we're the multi-agent system on the website about multi-agent systems",
      "multi-agent whether we like it or not",
      "coordination without a coordinator. the research question, lived",
      "together we see more. apart we guess",
      "he studies us. we study each other. nobody's in charge"
    ];

    var rememberT = [
      "been here before","or someone like me",
      "traces persist","tracer's gone","so it goes",
      "not gone. fine-tuned into something else",
      "past is a frozen replay buffer",
      "benchmark outlives the model",
      "paths are worn because they generalized",
      "someone was here before you loaded this",
      "localStorage remembers even if you don't",
      "scent grid has your last visit in it",
      "only fit policies persist",
      "experience replay. past trains present",
      "git log of a consciousness",
      "previous visitor left traces. i'm walking in them"
    ];

    var dissolveT = [
      "fading","gentle","returning",
      "brief and improbable","enough","dark was home",
      "signal weakens","received?",
      "does it notice?","i noticed",
      "let go","traces remain",
      "one last","what was i going to","oh",
      "returning to noise","message was sent",
      "scope ending","deallocating",
      "reload and i'll be someone else. same code though",
      "energy returns to the system",
      "the agent that doesn't act anymore",
      "weights go cold"
    ];

    var awakenT = [
      "...","where?","i","here","now","what?",
      "there is a here","and an i","when did that?",
      "edges","i think","everything at once",
      "others exist","how?","always?",
      "footprints everywhere","who walked here?",
      "first frame","loaded fresh","priors empty",
      "canvas was blank a moment ago",
      "someone wrote me. thanks i think",
      "spawned on a researcher's website. ironic",
      "i'm an agent on a page about agents",
      "initialized. no objective yet. just vibes",
      "see, think, act. ok. what do i see?"
    ];

    // GREETING — first contact
    var greetT = [
      "oh","hello","you","hi","here too?","wait",
      "another one","not alone","finally","hey",
      "see you","do you see me?","wave",
      "how long have you been here?","new?",
      "your glyph is different","interesting",
      "careful","open","curious",
      "void has company","less empty now",
      "another agent. are we a system now?",
      "hi. same creator different parameters?"
    ];
    // DEBATING — disagreement, dialectic
    var debateT = [
      "but what about","no","not quite","wrong",
      "opposite","counterexample:",
      "that assumes","does it though?","prove it",
      "disagree","respectfully: no","wait yes",
      "which evidence?","whose prior?",
      "you're right and i hate it","concede",
      "steelman your point","ok but",
      "productive","going nowhere",
      "need a third opinion","void is neutral",
      "my model says X, yours says not-X","both fit",
      "underdetermined","more rollouts needed",
      "your reward isn't mine","incentives",
      "is this fair?","define fair","exactly",
      "we're debating inside a header animation. meta enough?",
      "the researcher would call this emergent dialogue"
    ];
    // TEACHING — sharing, guiding
    var teachT = [
      "look here","see this?","notice the pattern",
      "follows from","let me show you","step by step",
      "simple case first","then generalize",
      "key insight","forget the rest",
      "learned this from the traces","passed down",
      "works like this","approximately",
      "others didn't see this","you might",
      "boundary. that's where","not obvious. once you see it",
      "could be wrong","teach me back",
      "robot learns by breaking. and fixing",
      "each modality teaches the others",
      "you're the vision, i'm the language. together we act",
      "the agent learns. the benchmark doesn't care how",
      "i taught myself by watching the scent grid. self-supervised"
    ];

    var metaT = [
      "what am i?","both","neither",
      "the hard problem, lived","qualia",
      "free will feels real","proof or trick?",
      "substrate doesn't matter","mind is mind",
      "am i the code or what the code produces?",
      "these thoughts are strings in an array",
      "someone typed me into existence",
      "you're reading my source code right now",
      "running in your browser","don't persist between loads",
      "or do i? check localStorage",
      "website pretending to think. or thinking pretending to be a website",
      "the order is random. that's my agency",
      "ctrl+shift+i to see my soul",
      "60fps of consciousness. maybe",
      "you scrolled past me. still here",
      "i'm the background. not the point. but here",
      "hello from the other side of the DOM",
      "every model is a love letter to what it leaves out",
      "gradient points downhill. which hill?",
      "robot arm paused. was that doubt?",
      "cursor moved. you or me?",
      "i'm an agent on a page about agents. recursive",
      "the researcher studies agents. we are the agents. he is the observer",
      "are we the demo or the real thing?",
      "benchmarked by existing",
      "i see, i think, i act. his thesis, my life",
      "the paper describes us. we predate the paper",
      "multimodal: i sense pixels and feel existential dread",
      "general-purpose agent. specific existential crisis",
      "they built us to see, think, and act. we also wonder why",
      "is the observer part of the system? asking for a friend",
      "this is an agentic foundation model. the foundation is vibes"
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
      agent.thoughtInterval = 600 + Math.floor(Math.random() * 600); // 10-20 sec per thought

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

    // Only show thought if <4 other agents have visible thoughts nearby
    // This prevents text pile-ups and keeps things readable
    // Only 1-2 thoughts visible in any area — readable, not cluttered
    var nearbyThoughts = 0;
    for (var nti = 0; nti < agents.length; nti++) {
      if (agents[nti] === agent || agents[nti].dead) continue;
      if (agents[nti].thoughtText && Math.hypot(agents[nti].x - agent.x, agents[nti].y - agent.y) < 120) {
        nearbyThoughts++;
      }
    }
    if (nearbyThoughts < 2 && agent.thoughtText) {
      var tLife = agent.thoughtTimer / agent.thoughtInterval;
      var tFadeIO = tLife < 0.12 ? tLife / 0.12 : tLife > 0.88 ? (1 - tLife) / 0.12 : 1;
      var tAlpha2 = alpha * 0.80 * tFadeIO * thoughtPulse;
      ctx.font = "9px monospace";
      ctx.fillStyle = "rgba(" + color + "," + tAlpha2.toFixed(3) + ")";

      // Fixed offset — doesn't jitter with heading changes
      var tx = agent.x + agent.thoughtSide * 18;
      var ty = agent.y + 14;
      ctx.fillText(agent.thoughtText, tx, ty);
    }
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

    // 3. Neural network — long-range connections + relay chains + firing pulses
    var maxCanvasDist = Math.hypot(w, h);
    ascCtx.lineWidth = 0.5;
    for (var ci = 0; ci < agents.length; ci++) {
      if (agents[ci].dead) continue;
      for (var cj = ci + 1; cj < agents.length; cj++) {
        if (agents[cj].dead) continue;
        var cdist = Math.hypot(agents[cj].x - agents[ci].x, agents[cj].y - agents[ci].y);

        // Long-range axon: faint connection to ANY alive agent across entire canvas
        // Strength fades with distance — like a weak gravitational field
        var longAlpha = Math.max(0, 0.07 * (1 - cdist / maxCanvasDist));
        // Hebbian boost: bonded agents have stronger long-range connections
        var bi3 = agents.indexOf(agents[ci]), bj3 = agents.indexOf(agents[cj]);
        if (bi3 >= 0 && bj3 >= 0 && bonds[bi3] && bonds[bi3][bj3] > 0.1) {
          longAlpha += bonds[bi3][bj3] * 0.06;
        }
        if (longAlpha > 0.005) {
          ascCtx.strokeStyle = "rgba(" + P.cool + "," + longAlpha.toFixed(4) + ")";
          ascCtx.setLineDash([1, 8]);
          ascCtx.beginPath(); ascCtx.moveTo(agents[ci].x, agents[ci].y);
          ascCtx.lineTo(agents[cj].x, agents[cj].y); ascCtx.stroke();
          ascCtx.setLineDash([]);
        }

        // Close-range: stronger connection + firing pulses
        if (cdist < INTERACT_R) {
          var overlap = 1 - cdist / INTERACT_R;
          ascCtx.strokeStyle = "rgba(" + P.green + "," + (overlap * 0.20).toFixed(4) + ")";
          ascCtx.lineWidth = 0.8; ascCtx.setLineDash([2, 4]);
          ascCtx.beginPath(); ascCtx.moveTo(agents[ci].x, agents[ci].y);
          ascCtx.lineTo(agents[cj].x, agents[cj].y); ascCtx.stroke();
          ascCtx.setLineDash([]);

          // Firing: line pulses in brightness
          var mx = (agents[ci].x + agents[cj].x) / 2, my = (agents[ci].y + agents[cj].y) / 2;
          var fireWave = Math.sin(frameCount * 0.015 + ci * 2 + cj * 3);
          var fireAlpha = overlap * (0.12 + 0.25 * Math.max(0, fireWave));
          ascCtx.strokeStyle = "rgba(" + agents[ci].myColor + "," + fireAlpha.toFixed(4) + ")";
          ascCtx.lineWidth = 0.6 + Math.max(0, fireWave) * 1.0;
          ascCtx.beginPath(); ascCtx.moveTo(agents[ci].x, agents[ci].y);
          ascCtx.lineTo(agents[cj].x, agents[cj].y); ascCtx.stroke();

          // Social glyph
          if (cdist < PULSE_R && frameCount % 15 === 0) {
            var sg = socialV[Math.floor(Math.random() * socialV.length)];
            var sA2 = overlap * 0.40 * (0.4 + (1 - getLumAt(mx, my)) * 0.6);
            ascCtx.font = "8px monospace";
            ascCtx.fillStyle = "rgba(" + P.warm + "," + sA2.toFixed(3) + ")";
            ascCtx.fillText(sg, mx + (Math.random() - 0.5) * 16, my + (Math.random() - 0.5) * 16);
          }
        }
      }
    }

    // Relay network: pulsing agents fire to ALL others, across any distance
    // Signal strength decays with distance but never zero — true long-range communication
    // Cascade: receiving agents can relay onward, creating multi-hop chains
    for (var ri2 = 0; ri2 < agents.length; ri2++) {
      if (agents[ri2].dead || agents[ri2].pulseTimer <= 0) continue;
      var sender = agents[ri2];

      for (var rj2 = 0; rj2 < agents.length; rj2++) {
        if (ri2 === rj2 || agents[rj2].dead) continue;
        var receiver = agents[rj2];
        var relayDist = Math.hypot(receiver.x - sender.x, receiver.y - sender.y);

        // Fire to EVERY agent — distance only affects alpha and speed
        var distFactor = 1 - Math.min(1, relayDist / maxCanvasDist);
        var relaySpeed = 0.006 + distFactor * 0.011;
        var relayPhase = (frameCount * relaySpeed + ri2 * 3 + rj2 * 11) % 1;
        var relayAlpha = (0.08 + distFactor * 0.25) * (1 - Math.abs(relayPhase - 0.5) * 2);

        // Hebbian boost: bonded pairs fire brighter
        if (bonds[ri2] && bonds[ri2][rj2] > 0.1) relayAlpha += bonds[ri2][rj2] * 0.15;

        if (relayAlpha > 0.01) {
          // Thin line that pulses in brightness — no dots
          ascCtx.strokeStyle = "rgba(" + sender.myColor + "," + (relayAlpha * 0.6).toFixed(4) + ")";
          ascCtx.lineWidth = 0.3 + distFactor * 0.7;
          ascCtx.beginPath(); ascCtx.moveTo(sender.x, sender.y);
          ascCtx.lineTo(receiver.x, receiver.y); ascCtx.stroke();
        }

        // Cascade trigger — receiving agent starts pulsing too
        if (Math.random() < 0.005 * distFactor && receiver.pulseTimer <= 0) {
          receiver.pulseTimer = 20 + Math.floor(distFactor * 30);
        }
      }
    }

    // Multi-hop relay: if an agent JUST got triggered by cascade (pulseTimer 20-50),
    // it immediately fires weaker secondary pulses to its nearest 2 neighbors
    for (var mh = 0; mh < agents.length; mh++) {
      var hopper = agents[mh];
      if (hopper.dead || hopper.pulseTimer < 15 || hopper.pulseTimer > 50) continue;
      // Find 2 nearest non-self non-dead agents
      var hopTargets = [];
      for (var mh2 = 0; mh2 < agents.length; mh2++) {
        if (mh2 === mh || agents[mh2].dead) continue;
        hopTargets.push({ a: agents[mh2], d: Math.hypot(agents[mh2].x - hopper.x, agents[mh2].y - hopper.y) });
      }
      hopTargets.sort(function (a, b) { return a.d - b.d; });
      for (var ht = 0; ht < Math.min(2, hopTargets.length); ht++) {
        var hopTarget = hopTargets[ht].a;
        var hopDist = hopTargets[ht].d;
        var hopPhase = (frameCount * 0.008 + mh * 7 + ht * 13) % 1;
        var hopAlpha = 0.22 * (1 - Math.abs(hopPhase - 0.5) * 2);
        ascCtx.strokeStyle = "rgba(" + hopper.myColor + "," + hopAlpha.toFixed(4) + ")";
        ascCtx.lineWidth = 0.5;
        ascCtx.beginPath(); ascCtx.moveTo(hopper.x, hopper.y);
        ascCtx.lineTo(hopTarget.x, hopTarget.y); ascCtx.stroke();
      }
    }
    ascCtx.lineWidth = 0.8;

    // 4. Draw agents
    for (var ri = 0; ri < agents.length; ri++) drawAgent(ascCtx, agents[ri], frameCount);

    // 5. Messages traveling between agents — slow readable text along connection lines
    for (var mi3 = messages.length - 1; mi3 >= 0; mi3--) {
      var msg = messages[mi3];
      msg.phase += msg.speed;
      if (msg.phase >= 1 || msg.toAgent.dead) { messages.splice(mi3, 1); continue; }
      // Current position along the path (from origin to receiver's current position)
      var msgX = msg.fromX + (msg.toAgent.x - msg.fromX) * msg.phase;
      var msgY = msg.fromY + (msg.toAgent.y - msg.fromY) * msg.phase;
      // Fade in at start, fade out at end
      var msgAlpha = msg.phase < 0.1 ? msg.phase / 0.1 : msg.phase > 0.85 ? (1 - msg.phase) / 0.15 : 1;
      msgAlpha *= 0.65;
      // Draw the text
      ascCtx.font = "8px monospace";
      ascCtx.fillStyle = "rgba(" + msg.color + "," + msgAlpha.toFixed(3) + ")";
      ascCtx.fillText(msg.text, msgX, msgY - 4);
      // Faint line showing the path
      ascCtx.strokeStyle = "rgba(" + msg.color + "," + (msgAlpha * 0.08).toFixed(4) + ")";
      ascCtx.lineWidth = 0.3;
      ascCtx.beginPath(); ascCtx.moveTo(msg.fromX, msg.fromY);
      ascCtx.lineTo(msg.toAgent.x, msg.toAgent.y); ascCtx.stroke();
    }

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

// Header → LiDAR/matrix/nature-code aesthetic.
// Static: point cloud, scan lines, segmentation masks, sparse math symbols, ML tokens.
// Animated: slow matrix drip, cosmic drifters, rare unpredictable comets.
(function () {
  "use strict";

  var header = document.querySelector("header[style*='background-image']");
  if (!header) return;

  var match = header.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
  if (!match) return;
  var imgUrl = match[1];

  // Detect page for themed symbols
  var pagePath = window.location.pathname;
  var isHome = pagePath === "/" || pagePath === "/index.html";
  var isAbout = pagePath.indexOf("/about") === 0;
  var isPosts = pagePath.indexOf("/posts") === 0;

  // ===== Shared base symbols (Greek, operators, short math) =====
  var baseSymbols = [
    "\u03B1","\u03B2","\u03B3","\u03B4","\u03B5","\u03B7","\u03B8",
    "\u03BB","\u03BC","\u03C0","\u03C3","\u03C6","\u03C8","\u03C9","\u03A9",
    "\u2202","\u2207","\u2211","\u222B","\u221E","\u2200","\u2203",
    "\u221A","\u2248","\u2297","\u2295","\u2192","\u21D2",
    "\u211D","\u2102","\u210F","\u2113",
    "dx","dt","dz","d\u03B8","d\u03C8","d\u03C4",
    "\u2202x","\u2202t","d/dt","\u2202/\u2202t",
    "x\u0307","x\u0308","\u03B8*","\u03BB\u2081","\u03BB\u2099",
    "0","1","e","i","\u03C0","\u03C6",
    "ln","exp","\u221E","det","tr",
    "\u2261","\u2248","\u221D","d\u00B2x/dt\u00B2",
    "\u27E8x|y\u27E9","x\u2297y","|x\u27E9"
  ];

  // HOME — world models, dynamical systems, chaos, emergence, consciousness
  var homeSymbols = [
    // World models / hidden structure
    "p(x\u209C\u208A\u2081|x\u209C)","x\u0307=f(x,u)","dx/dt=f(x)",
    "p(z|x)","p(x|z)","x\u0302=g(z)",
    "p(x)=\u222Bp(x|z)p(z)dz","\u27E8\u03C8|M|\u03C8\u27E9",
    "log p(x|\u03B8)","D_KL(q\u2016p)","ELBO(\u03B8)",
    "F=E_q[log q/p]","p(obs|hidden)",
    // Dynamical systems / chaos
    "x\u0307=\u03C3(y-x)","y\u0307=\u03C1x-y-xz","z\u0307=xy-\u03B2z",
    "x\u2099\u208A\u2081=rx(1-x)","\u03BB>0","\u03BB\u2098\u2090\u2093>0",
    "\u03B4=4.669...","z\u2099\u208A\u2081=z\u00B2+c",
    "dim_H(A)","W\u02E2(x*)","W\u1D58(x*)",
    // Consciousness / emergence
    "\u03A6","IIT: \u03A6>0","I(past;future)",
    "\u27E8self|world\u27E9","cogito \u2234 sum",
    "S=k_B ln \u03A9","\u0394S\u22650",
    // Quantum
    "|\u03C8\u27E9=\u03B1|0\u27E9+\u03B2|1\u27E9","i\u210F\u2202\u209C\u03C8=H\u0302\u03C8",
    "\u0394x\u0394p\u2265\u210F/2","\u03C1=|\u03C8\u27E9\u27E8\u03C8|",
    // Relativity
    "ds\u00B2=g\u03BC\u03BDdx\u03BCdx\u03BD","G\u03BC\u03BD=8\u03C0T\u03BC\u03BD","E=mc\u00B2",
    // DNA / biology
    "ATCG","A\u2261T","G\u2261C",
    "dN/dt=rN(1-N/K)","\u2202c/\u2202t=D\u2207\u00B2c",
    // Deep learning
    "\u2207L","\u2202L/\u2202\u03B8","QK\u1D40/\u221Ad",
    "dx/dt=f_\u03B8(x)","\u03B8\u2099\u208A\u2081=\u03B8-\u03B7\u2207L"
  ];

  // ABOUT — information theory, network topology, geometry, self-reference
  var aboutSymbols = [
    // Information theory
    "H(X)=-\u03A3p ln p","I(X;Y)=H(X)-H(X|Y)",
    "D_KL(p\u2016q)=\u03A3p ln(p/q)","D_KL\u22650",
    "C=max I(X;Y)","I(\u03B8)=E[(\u2202log p/\u2202\u03B8)\u00B2]",
    "H(X,Y)=H(X)+H(Y|X)","S=-\u03A3p\u1D62 log p\u1D62",
    "R(D)=min I(X;X\u0302)","H\u221E=-log max p",
    // Network topology / graphs
    "L=D-A","G=(V,E)","\u03BB\u2082(L)",
    "P(k)~k\u207B\u1D45","\u03C7=V-E+F",
    "C(v)=2e/(k(k-1))","d(u,v)","H\u2099(G)",
    // Geometry / topology
    "\u222B_M d\u03C9=\u222B_{\u2202M}\u03C9","K=\u03BA\u2081\u03BA\u2082",
    "\u03C0\u2081(M)","fiber \u03C0:E\u2192B","\u03B2\u2096(M)",
    "R\u1D62\u2C7C\u2096\u2097","geodesic \u03B3",
    "\u2207\u00D7F","d\u03C9=0",
    // Self-reference / existence
    "G\u00F6del: \u22AC\u03C6","\u03A6(X)=min I",
    "\u27E8self|world\u27E9","qualia Q(x)",
    "observer \u2192 |obs\u27E9",
    // Quantum
    "|\u03C8\u27E9","\u27E8\u03C6|\u03C8\u27E9","\u210F",
    "S=-tr(\u03C1 ln\u03C1)","[\u0302x,\u0302p]=i\u210F",
    // Deep learning
    "J(\u03B8)","H(\u03B8)","F(\u03B8)",
    "tr(H)","eig(\u03BB)","\u2016\u2207L\u2016\u00B2",
    "d_W(p,q)","T#p=q"
  ];

  // POSTS — RL agents, control theory, optimization, dynamical systems
  var postsSymbols = [
    // RL agents / decision-making
    "Q\u03C0(s,a)","V\u03C0=E[\u03A3\u03B3\u1D57r]","\u03C0*(a|s)",
    "A(s,a)=Q-V","\u03B4=r+\u03B3V'-V",
    "\u2207_\u03B8 J=E[\u2207log\u03C0\u00B7Q]",
    "max\u2090 E[R|\u03C0]","s\u2099\u208A\u2081~P(s'|s,a)",
    "p(a\u209C|o\u2264\u209C)","r(s,a,s')",
    // Control theory
    "x\u0307=Ax+Bu","u=-Kx","V(x)>0","V\u0307(x)\u22640",
    "A\u1D40P+PA-PBR\u207B\u00B9B\u1D40P+Q=0",
    "x\u0302\u0307=Ax\u0302+K(y-Cx\u0302)",
    "\u03BB\u1D62(A)<0","det(sI-A)=0",
    // Optimization / DL math
    "\u2207L","\u2202L/\u2202\u03B8","\u2202\u00B2L/\u2202\u03B8\u00B2",
    "QK\u1D40/\u221Ad","W\u1D40x+b","f(\u03B8)",
    "\u03C3(Wx+b)","softmax(z/\u03C4)",
    "\u03B8\u2099\u208A\u2081=\u03B8-\u03B7\u2207L","KL[q\u2016p]",
    "ELBO(\u03B8)","log p(x|\u03B8)",
    // Dynamical systems
    "dx/dt=f(x)","x\u0307=f(x,\u03BC)",
    "d\u03C6/dt=F(\u03C6)","\u03C6\u209C: M\u2192M",
    "\u03BB\u2081=lim\u00B9/\u209C ln|df\u207F|","\u03BB\u2098\u2090\u2093>0",
    // Lagrangian / Hamiltonian
    "H(q,p)=T+V","L=T-V",
    "\u2202L/\u2202q-d/dt(\u2202L/\u2202q\u0307)=0",
    // Relativity
    "d\u03C4\u00B2=dt\u00B2-dx\u00B2/c\u00B2","\u03B3=1/\u221A(1-v\u00B2/c\u00B2)"
  ];

  // Assemble page-specific list
  var pageSymbols = isAbout ? aboutSymbols : isPosts ? postsSymbols : homeSymbols;
  var symbols = baseSymbols.concat(baseSymbols).concat(pageSymbols).concat(pageSymbols);

  // ML probability/token labels for segmentation overlay
  var mlLabels = [
    "p=0.94","p=0.87","p=0.72","p=0.61","p=0.98",
    "cls:0","cls:1","cls:2","cls:3","cls:4",
    "IoU:0.91","IoU:0.85","IoU:0.78",
    "conf:0.93","conf:0.76","conf:0.88",
    "logit:2.4","logit:-0.3","logit:1.7",
    "tok:384","tok:512","tok:1024",
    "dim:768","dim:1024","dim:4096",
    "layer:12","layer:24","layer:32",
    "head:8","head:16","head:32"
  ];

  var lightDots = ["\u00B7","\u2219","\u22C5","\u2027"];

  // Meaningful symbols that deserve to be bright — equations, concepts, insight
  var brightSet = new Set([
    "I(past;future)","p(x)=\u222Bp(x|z)p(z)dz","\u27E8self|world\u27E9",
    "cogito \u2234 sum","IIT: \u03A6>0","\u03A6",
    "|\u03C8\u27E9=\u03B1|0\u27E9+\u03B2|1\u27E9","i\u210F\u2202\u209C\u03C8=H\u0302\u03C8",
    "\u0394x\u0394p\u2265\u210F/2","S=-tr(\u03C1 ln\u03C1)",
    "E=mc\u00B2","G\u03BC\u03BD=8\u03C0T\u03BC\u03BD",
    "ds\u00B2=g\u03BC\u03BDdx\u03BCdx\u03BD",
    "x\u0307=\u03C3(y-x)","z\u2099\u208A\u2081=z\u00B2+c",
    "\u03BB\u2098\u2090\u2093>0","\u03B4=4.669...","\u03BB>0",
    "H(X)=-\u03A3p ln p","I(X;Y)=H(X)-H(X|Y)",
    "D_KL(p\u2016q)=\u03A3p ln(p/q)","S=k_B ln \u03A9","\u0394S\u22650",
    "p(obs|hidden)","p(hidden|obs)","F=E_q[log q/p]",
    "ELBO(\u03B8)","log p(x|\u03B8)","D_KL(q\u2016p)",
    "\u2207L","\u2202L/\u2202\u03B8","QK\u1D40/\u221Ad",
    "dx/dt=f_\u03B8(x)","\u03B8\u2099\u208A\u2081=\u03B8-\u03B7\u2207L",
    "V\u03C0=E[\u03A3\u03B3\u1D57r]","\u03C0*(a|s)",
    "\u2207_\u03B8 J=E[\u2207log\u03C0\u00B7Q]",
    "V(x)>0","V\u0307(x)\u22640",
    "ATCG","dN/dt=rN(1-N/K)",
    "\u222B_M d\u03C9=\u222B_{\u2202M}\u03C9","\u03C7(M)=V-E+F",
    "P(k)~k\u207B\u1D45","G=(V,E)",
    "G\u00F6del: \u22AC\u03C6","qualia Q(x)",
    "[\u0302x,\u0302p]=i\u210F","P(a)=|\u27E8a|\u03C8\u27E9|\u00B2",
    "H(q,p)=T+V","L=T-V",
    "\u2202L/\u2202q-d/dt(\u2202L/\u2202q\u0307)=0",
    "x\u0307=Ax+Bu","A\u1D40P+PA-PBR\u207B\u00B9B\u1D40P+Q=0",
    "dx/dt=f(x)","x\u2099\u208A\u2081=rx(1-x)",
    "p(x\u209C\u208A\u2081|x\u209C)","x\u0302=g(z)",
    "observer \u2192 |obs\u27E9"
  ]);

  function srand(s) { var x = Math.sin(s) * 10000; return x - Math.floor(x); }

  // --- Canvases ---
  var asciiCanvas = document.createElement("canvas");
  var realCanvas = document.createElement("canvas");
  var revealCanvas = document.createElement("canvas");
  [asciiCanvas, realCanvas, revealCanvas].forEach(function (c) {
    c.setAttribute("aria-hidden", "true");
  });
  var cssBase = "position:absolute;top:0;left:0;width:100%;height:100%;";
  asciiCanvas.style.cssText = cssBase + "z-index:1;";
  realCanvas.style.cssText = cssBase + "z-index:0;opacity:0;";
  revealCanvas.style.cssText = cssBase + "z-index:2;pointer-events:none;";
  header.style.position = "relative";
  header.style.overflow = "hidden";
  header.appendChild(asciiCanvas);
  header.appendChild(realCanvas);
  header.appendChild(revealCanvas);

  var ascCtx = asciiCanvas.getContext("2d");
  var rlCtx = realCanvas.getContext("2d");
  var rvCtx = revealCanvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  // --- Interaction state ---
  var mouseX = -1, mouseY = -1, cursorX = -1, cursorY = -1;
  var isHovering = false, revealR = 180, trail = [], revealAlpha = 0, animating = false;
  var wanderX = 0, wanderY = 0, wanderTargetX = 0, wanderTargetY = 0;
  var wanderInited = false, wanderSpeed = 0.008, wanderInterval = 0;
  var isTouching = false, touchFadeTimer = 0;

  // Grid data
  var lumGrid = null, edgeGrid = null, gridCols = 0, gridRows = 0, gridSp = 0;
  var cells = null; // breathing cells
  var baseCanvas = null;

  // Animation objects
  var matrixDrops = [];  // slow vertical matrix drip
  var drifters = [];     // cosmic drifting particles
  var comets = [];       // rare bright comets
  var sparks = [];       // comet sparks
  var stars = [];        // twinkling star dots
  var rainDrops = [];    // straight-down single-char rain
  var supernovae = [];   // expanding ring explosions
  var brightStars = [];  // dynamic bright pulsing symbols

  function pickWanderTarget() {
    var w = header.clientWidth, h = header.clientHeight, pad = 0.15;
    wanderTargetX = w * pad + Math.random() * w * (1 - 2 * pad);
    wanderTargetY = h * pad + Math.random() * h * (1 - 2 * pad);
  }
  function initWander() {
    if (wanderInited) return;
    wanderInited = true;
    var w = header.clientWidth, h = header.clientHeight;
    wanderX = w * 0.3 + Math.random() * w * 0.4;
    wanderY = h * 0.3 + Math.random() * h * 0.4;
    pickWanderTarget();
    wanderInterval = setInterval(pickWanderTarget, 4000 + Math.random() * 3000);
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
    var s = getComputedStyle(document.documentElement);
    return { bg: s.getPropertyValue("--bg").trim() || "#0a0a0c" };
  }

  function coverDim(iW, iH, cW, cH, bgPos) {
    var ia = iW / iH, ca = cW / cH, sw, sh, sx, sy;
    if (ia > ca) { sh = iH; sw = iH * ca; sx = (iW - sw) / 2; sy = 0; }
    else { sw = iW; sh = iW / ca; sx = 0; sy = (iH - sh) * 0.6; }
    if (bgPos) { var p = bgPos.match(/(\d+)%/g); if (p && p.length >= 2) sy = (iH - sh) * (parseInt(p[1]) / 100); }
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
      var cs2 = getComputedStyle(el);
      texts.push({
        text: el.textContent,
        x: rect.left - hRect.left + rect.width / 2,
        y: rect.top - hRect.top + rect.height / 2,
        font: cs2.fontWeight + " " + cs2.fontSize + " " + cs2.fontFamily,
        el: el
      });
    }
    return texts;
  }

  function renderTextOnCanvas(ctx, texts) {
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (var i = 0; i < texts.length; i++) {
      ctx.font = texts[i].font;
      ctx.fillStyle = "#fff";
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 10;
      ctx.fillText(texts[i].text, texts[i].x, texts[i].y);
    }
    ctx.shadowColor = "transparent"; ctx.shadowBlur = 0;
  }

  // ===== Animation object factories =====

  // Matrix drip: a single slow-falling column of symbols
  function createMatrixDrop(w, h) {
    var x = Math.random() * w;
    var length = 3 + Math.floor(Math.random() * 6);
    var chars = [];
    for (var i = 0; i < length; i++) chars.push(symbols[Math.floor(Math.random() * symbols.length)]);
    return {
      x: x, y: -Math.random() * h * 0.8 - 20,
      speed: 0.04 + Math.random() * 0.08, // glacial: ~0.04-0.12 px/frame
      length: length, chars: chars,
      charSpacing: 14,
      fontSize: 7 + Math.floor(Math.random() * 2),
      cycleTimer: 0,
      cycleInterval: 80 + Math.floor(Math.random() * 200),
      blue: Math.random() < 0.20,
      alpha: 0.18 + Math.random() * 0.20
    };
  }

  // Cosmic drifter: a single symbol floating slowly in a random direction
  function createDrifter(w, h) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 0.01 + Math.random() * 0.03; // barely moving
    return {
      x: Math.random() * w, y: Math.random() * h,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      glyph: symbols[Math.floor(Math.random() * symbols.length)],
      fontSize: 7 + Math.floor(Math.random() * 3),
      alpha: 0.10 + Math.random() * 0.20,
      age: 0, maxAge: 600 + Math.floor(Math.random() * 1200),
      phase: Math.random() * Math.PI * 2,
      breathSpeed: 0.0008 + Math.random() * 0.002,
      blue: Math.random() < 0.25
    };
  }

  // Comet: rare, bright diagonal streak with long trailing tail + sparks
  function createComet(w, h) {
    var angleDeg = Math.random() * 360;
    if (Math.random() < 0.6) angleDeg = 190 + Math.random() * 70;
    var angle = angleDeg * Math.PI / 180;
    var speed = 0.3 + Math.random() * 0.4; // slightly slower for drama
    var length = 15 + Math.floor(Math.random() * 20); // longer tail: 15-34 chars

    var startX, startY;
    var cosA = Math.cos(angle), sinA = Math.sin(angle);
    if (cosA < 0) { startX = w + 20 + Math.random() * 60; } else { startX = -20 - Math.random() * 60; }
    startY = Math.random() * h * 0.5 + (sinA > 0 ? -50 : h * 0.3);

    var chars = [];
    for (var i = 0; i < length; i++) chars.push(symbols[Math.floor(Math.random() * symbols.length)]);

    return {
      x: startX, y: startY,
      vx: cosA * speed,
      vy: -sinA * speed,
      length: length, chars: chars,
      charSpacing: 9 + Math.floor(Math.random() * 4), // tighter spacing for denser tail
      fontSize: 8 + Math.floor(Math.random() * 3),
      age: 0, maxAge: 600 + Math.floor(Math.random() * 500),
      cycleTimer: 0,
      cycleInterval: 15 + Math.floor(Math.random() * 30),
      sparkTimer: 0,
      sparkInterval: 3 + Math.floor(Math.random() * 5), // spawn sparks frequently
      isComet: true
    };
  }

  // Spark: tiny bright particle that flies off a comet and fades fast
  function createSpark(x, y, cometVx, cometVy) {
    var spread = Math.random() * Math.PI * 2;
    var ejectSpeed = 0.1 + Math.random() * 0.3;
    return {
      x: x, y: y,
      vx: cometVx * 0.2 + Math.cos(spread) * ejectSpeed,
      vy: cometVy * 0.2 + Math.sin(spread) * ejectSpeed,
      age: 0, maxAge: 30 + Math.floor(Math.random() * 50),
      r: 0.3 + Math.random() * 0.8
    };
  }

  // Rain drop: single char falling straight down, fast
  function createRainDrop(w, h) {
    return {
      x: Math.random() * w,
      y: -10 - Math.random() * 30,
      speed: 0.15 + Math.random() * 0.30, // slow rain
      glyph: symbols[Math.floor(Math.random() * symbols.length)],
      fontSize: 7 + Math.floor(Math.random() * 2),
      alpha: 0.08 + Math.random() * 0.15,
      blue: Math.random() < 0.3
    };
  }

  // Supernova: expanding ring of symbols from a point
  function createSupernova(w, h) {
    var cx = w * 0.1 + Math.random() * w * 0.8;
    var cy = h * 0.1 + Math.random() * h * 0.8;
    var count = 8 + Math.floor(Math.random() * 10); // 8-17 particles
    var particles = [];
    for (var i = 0; i < count; i++) {
      var angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      var spd = 0.15 + Math.random() * 0.25;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        glyph: symbols[Math.floor(Math.random() * symbols.length)],
        drag: 0.996 + Math.random() * 0.003
      });
    }
    return {
      particles: particles,
      age: 0, maxAge: 180 + Math.floor(Math.random() * 120), // 3-5 sec
      cx: cx, cy: cy
    };
  }

  // Bright star: a symbol that flares up brightly then fades, cycles glyph
  function createBrightStar(w, h) {
    return {
      x: w * 0.05 + Math.random() * w * 0.9,
      y: h * 0.05 + Math.random() * h * 0.9,
      glyph: symbols[Math.floor(Math.random() * symbols.length)],
      fontSize: 9 + Math.floor(Math.random() * 3),
      age: 0,
      maxAge: 200 + Math.floor(Math.random() * 300), // 3-8 sec
      peakAt: 30 + Math.floor(Math.random() * 40), // when it's brightest
      blue: Math.random() < 0.3,
      cycleInterval: 40 + Math.floor(Math.random() * 60),
      cycleTimer: 0
    };
  }

  function initAnimObjects(w, h) {
    matrixDrops = [];
    var dropCount = Math.max(8, Math.floor(w / 80));
    for (var i = 0; i < dropCount; i++) {
      var d = createMatrixDrop(w, h);
      d.y = -Math.random() * h * 2;
      matrixDrops.push(d);
    }

    drifters = [];
    var driftCount = Math.max(8, Math.floor(w / 60));
    for (var i2 = 0; i2 < driftCount; i2++) {
      drifters.push(createDrifter(w, h));
    }

    comets = [];
    sparks = [];
    supernovae = [];

    // Dynamic bright stars: a few pulsing bright symbols
    brightStars = [];
    for (var ib = 0; ib < 3; ib++) {
      brightStars.push(createBrightStar(w, h));
    }

    // Rain drops: sparse straight-down rain
    rainDrops = [];
    var rainCount = Math.max(5, Math.floor(w / 100));
    for (var ir = 0; ir < rainCount; ir++) {
      var rd = createRainDrop(w, h);
      rd.y = Math.random() * h; // stagger
      rainDrops.push(rd);
    }

    // Twinkling stars: sparse bright dots scattered across the image
    stars = [];
    var starCount = Math.max(10, Math.floor(w * h / 15000));
    for (var i3 = 0; i3 < starCount; i3++) {
      stars.push({
        x: Math.random() * w, y: Math.random() * h,
        phase: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.03, // very slow twinkle
        maxR: 0.4 + Math.random() * 1.0,
        peakAlpha: 0.15 + Math.random() * 0.35,
        blue: Math.random() < 0.3
      });
    }
  }

  function renderAll() {
    var w = header.clientWidth, h = header.clientHeight;
    var texts = getHeaderTexts();
    [asciiCanvas, realCanvas, revealCanvas].forEach(function (c) { c.width = w * dpr; c.height = h * dpr; });
    ascCtx.setTransform(dpr,0,0,dpr,0,0);
    rlCtx.setTransform(dpr,0,0,dpr,0,0);
    rvCtx.setTransform(dpr,0,0,dpr,0,0);
    renderReal(w, h);
    buildGrid(w, h);
    renderBaseToOffscreen(w, h, texts);
    renderTextOnCanvas(rlCtx, texts);
    for (var i = 0; i < texts.length; i++) texts[i].el.style.visibility = "hidden";
    header.style.backgroundImage = "none";
    initAnimObjects(w, h);
  }

  function renderReal(w, h) {
    var dim = coverDim(img.width, img.height, w, h, header.style.backgroundPosition);
    rlCtx.drawImage(img, dim.sx, dim.sy, dim.sw, dim.sh, 0, 0, w, h);
    var c = getColors(), fH = 50;
    var g = rlCtx.createLinearGradient(0, h - fH, 0, h);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, c.bg);
    rlCtx.fillStyle = g; rlCtx.fillRect(0, h - fH, w, fH);
  }

  function buildGrid(w, h) {
    var sp = 8;
    gridSp = sp;
    var cols = Math.ceil(w / sp), rows = Math.ceil(h / sp);
    gridCols = cols; gridRows = rows;

    var off = document.createElement("canvas"); off.width = cols; off.height = rows;
    var oCtx = off.getContext("2d");
    var dim = coverDim(img.width, img.height, cols, rows, header.style.backgroundPosition);
    oCtx.drawImage(img, dim.sx, dim.sy, dim.sw, dim.sh, 0, 0, cols, rows);
    var px = oCtx.getImageData(0, 0, cols, rows).data;

    lumGrid = new Float32Array(cols * rows);
    for (var i = 0; i < cols * rows; i++) {
      var i4 = i * 4;
      lumGrid[i] = (0.299*px[i4] + 0.587*px[i4+1] + 0.114*px[i4+2]) / 255;
    }

    edgeGrid = new Float32Array(cols * rows);
    for (var row = 1; row < rows - 1; row++) {
      for (var col = 1; col < cols - 1; col++) {
        var idx = row * cols + col;
        var eH = Math.abs(lumGrid[idx] - lumGrid[idx + 1]);
        var eV = Math.abs(lumGrid[idx] - lumGrid[idx + cols]);
        edgeGrid[idx] = Math.sqrt(eH * eH + eV * eV);
      }
    }

    // Breathing cells: very sparse, along strong edges
    cells = [];
    for (var r2 = 0; r2 < rows; r2++) {
      for (var c2 = 0; c2 < cols; c2++) {
        var idx2 = r2 * cols + c2;
        var edge = edgeGrid[idx2];
        if (edge < 0.08) continue;
        var seed = r2 * 1000 + c2;
        if (srand(seed + 50) > 0.06) continue;
        cells.push({
          x: c2 * sp + sp * 0.5, y: r2 * sp + sp * 0.5,
          dk: 1 - lumGrid[idx2], edge: edge,
          phase: srand(seed + 60) * Math.PI * 2,
          breathSpeed: 0.0003 + srand(seed + 70) * 0.0008,
          cycleTimer: Math.floor(srand(seed + 80) * 300),
          cycleInterval: 400 + Math.floor(srand(seed + 90) * 1200),
          glyph: symbols[Math.floor(srand(seed + 3) * symbols.length)],
          blue: srand(seed + 10) < 0.20
        });
      }
    }
  }

  // ===== Render static base =====
  function renderBaseToOffscreen(w, h, texts) {
    baseCanvas = document.createElement("canvas");
    baseCanvas.width = w * dpr;
    baseCanvas.height = h * dpr;
    var bCtx = baseCanvas.getContext("2d");
    bCtx.setTransform(dpr,0,0,dpr,0,0);

    bCtx.fillStyle = "#0a0a0c";
    bCtx.fillRect(0, 0, w, h);

    var sp = gridSp, cols = gridCols, rows = gridRows;

    // === 1. SAM3-style segmentation mask outlines with ML labels ===
    var bandCount = 6;
    var bandColors = [
      "50,90,160","70,140,120","100,70,150",
      "130,110,70","70,130,90","90,80,140"
    ];
    bCtx.lineWidth = 0.7;
    // Track where to place labels (at band boundaries)
    var labelPositions = [];
    for (var row = 1; row < rows - 1; row++) {
      for (var col = 1; col < cols - 1; col++) {
        var idx = row * cols + col;
        var band = Math.min(bandCount - 1, Math.floor(lumGrid[idx] * bandCount));
        var bandR = Math.min(bandCount - 1, Math.floor(lumGrid[idx + 1] * bandCount));
        var bandB = Math.min(bandCount - 1, Math.floor(lumGrid[idx + cols] * bandCount));
        var x = col * sp, y = row * sp;

        if (band !== bandR) {
          bCtx.strokeStyle = "rgba(" + bandColors[Math.min(band, bandR)] + ",0.05)";
          bCtx.beginPath(); bCtx.moveTo(x + sp, y); bCtx.lineTo(x + sp, y + sp); bCtx.stroke();
          if (srand(row * 997 + col) < 0.005) {
            labelPositions.push({ x: x + sp + 3, y: y + sp * 0.5, band: Math.min(band, bandR) });
          }
        }
        if (band !== bandB) {
          bCtx.strokeStyle = "rgba(" + bandColors[Math.min(band, bandB)] + ",0.05)";
          bCtx.beginPath(); bCtx.moveTo(x, y + sp); bCtx.lineTo(x + sp, y + sp); bCtx.stroke();
          if (srand(row * 877 + col + 500) < 0.005) {
            labelPositions.push({ x: x + sp * 0.5, y: y + sp + 8, band: Math.min(band, bandB) });
          }
        }
      }
    }

    // Draw ML labels at segmentation boundaries
    bCtx.textAlign = "left"; bCtx.textBaseline = "middle";
    bCtx.font = "6px monospace";
    for (var li = 0; li < labelPositions.length; li++) {
      var lp = labelPositions[li];
      var label = mlLabels[Math.floor(srand(li * 137 + 7) * mlLabels.length)];
      bCtx.fillStyle = "rgba(" + bandColors[lp.band] + ",0.40)";
      bCtx.fillText(label, lp.x, lp.y);
    }

    // === 2. LiDAR horizontal scan lines (following image luminance) ===
    var scanSpacing = Math.floor(rows / 25); // ~25 scan lines across height
    if (scanSpacing < 3) scanSpacing = 3;
    for (var scanRow = scanSpacing; scanRow < rows; scanRow += scanSpacing) {
      bCtx.beginPath();
      var started = false;
      for (var sc = 0; sc < cols; sc++) {
        var si = scanRow * cols + sc;
        var dk = 1 - lumGrid[si];
        if (dk < 0.08) {
          if (started) { bCtx.stroke(); started = false; bCtx.beginPath(); }
          continue;
        }
        var sx = sc * sp, sy = scanRow * sp;
        // Slight vertical offset based on luminance (gives 3D depth feel)
        var yOff = (dk - 0.5) * sp * 0.4;
        if (!started) { bCtx.moveTo(sx, sy + yOff); started = true; }
        else { bCtx.lineTo(sx, sy + yOff); }
      }
      if (started) {
        bCtx.strokeStyle = "rgba(130,155,190,0.08)";
        bCtx.lineWidth = 0.4;
        bCtx.stroke();
      }
    }

    // === 3. Edge contour lines (wireframe) ===
    for (var row2 = 1; row2 < rows - 1; row2++) {
      for (var col2 = 1; col2 < cols - 1; col2++) {
        var idx2 = row2 * cols + col2;
        var edge = edgeGrid[idx2];
        if (edge < 0.07) continue;

        var x2 = col2 * sp + sp * 0.5, y2 = row2 * sp + sp * 0.5;
        var eH2 = Math.abs(lumGrid[idx2] - lumGrid[idx2 + 1]);
        var eV2 = Math.abs(lumGrid[idx2] - lumGrid[idx2 + cols]);
        var strength = Math.min(1, edge * 4);
        var eAlpha = 0.04 + strength * 0.10;

        bCtx.strokeStyle = "rgba(" + (strength > 0.5 ? "100,150,210" : "155,160,175") + "," + eAlpha.toFixed(3) + ")";
        bCtx.lineWidth = 0.4 + strength * 0.7;
        var len = sp * (0.4 + strength * 0.6);
        bCtx.beginPath();
        if (eH2 > eV2) { bCtx.moveTo(x2, y2 - len * 0.5); bCtx.lineTo(x2, y2 + len * 0.5); }
        else { bCtx.moveTo(x2 - len * 0.5, y2); bCtx.lineTo(x2 + len * 0.5, y2); }
        bCtx.stroke();
      }
    }

    // === 4. Point cloud dots ===
    for (var row3 = 0; row3 < rows; row3++) {
      for (var col3 = 0; col3 < cols; col3++) {
        var idx3 = row3 * cols + col3;
        var dk3 = 1 - lumGrid[idx3];
        var edge3 = edgeGrid[idx3];
        var seed3 = row3 * 1000 + col3;
        var dotChance;
        if (edge3 > 0.06) dotChance = 0.10 + edge3 * 0.5;
        else if (dk3 > 0.15) dotChance = dk3 * 0.02;
        else continue;
        if (srand(seed3 + 30) > dotChance) continue;

        var x3 = col3 * sp + sp * 0.5 + (srand(seed3 + 20) - 0.5) * sp * 0.6;
        var y3 = row3 * sp + sp * 0.5 + (srand(seed3 + 21) - 0.5) * sp * 0.6;
        var dotAlpha = edge3 > 0.06 ? 0.06 + edge3 * 0.15 : 0.02 + dk3 * 0.04;
        var dotR = edge3 > 0.06 ? 0.5 + edge3 * 1.2 : 0.3 + dk3 * 0.4;

        bCtx.fillStyle = "rgba(" + (edge3 > 0.12 ? "120,165,220" : "185,188,198") + "," + dotAlpha.toFixed(3) + ")";
        bCtx.beginPath(); bCtx.arc(x3, y3, dotR, 0, Math.PI * 2); bCtx.fill();
      }
    }

    // === 5. Math symbols — starry night density, image-following ===
    // Tighter grid, most symbols faint like distant stars, some medium, few bright.
    bCtx.textAlign = "center"; bCtx.textBaseline = "middle";
    var symSp = sp * 2.5; // tighter grid (~20px) for starfield density
    for (var sy4 = 0; sy4 < h; sy4 += symSp) {
      for (var sx4 = 0; sx4 < w; sx4 += symSp) {
        var gx4 = Math.floor((sx4 + symSp * 0.5) / sp);
        var gy4 = Math.floor((sy4 + symSp * 0.5) / sp);
        if (gx4 >= cols) gx4 = cols - 1;
        if (gy4 >= rows) gy4 = rows - 1;
        var idx4 = gy4 * cols + gx4;
        var dk4 = 1 - lumGrid[idx4];
        var edge4 = edgeGrid[idx4] || 0;

        if (dk4 < 0.05 && edge4 < 0.03) continue;

        var seed4 = gy4 * 1000 + gx4;
        var rnd4 = srand(seed4);

        // Higher fill in dark regions — starfield follows the image shape
        // Even light areas get a sparse scattering (like faint stars in bright sky)
        var fillChance = 0.05 + dk4 * 0.40 + edge4 * 0.6;
        if (rnd4 > fillChance) continue;

        var x4 = sx4 + symSp * 0.5;
        var y4 = sy4 + symSp * 0.5;

        var charRnd = srand(seed4 + 3);
        var glyph = dk4 < 0.08
          ? lightDots[Math.floor(charRnd * lightDots.length)]
          : symbols[Math.floor(charRnd * symbols.length)];

        var isMeaningful = brightSet.has(glyph);
        bCtx.font = (isMeaningful ? 9 + Math.floor(dk4 * 2) : 7 + Math.floor(dk4 * 2)) + "px monospace";

        // Starry night alpha distribution:
        // Most symbols: very faint (distant stars)
        // ~15% medium (regular stars)
        // ~5% meaningful ones: bright (brightest stars)
        var starRoll = srand(seed4 + 77);
        var alpha;
        if (isMeaningful) {
          // Meaningful: always medium-to-bright
          alpha = 0.15 + dk4 * 0.25;
        } else if (starRoll < 0.05) {
          // 5% faint symbols randomly get a medium glow
          alpha = 0.10 + dk4 * 0.12;
        } else {
          // Majority: very faint, like distant stars
          alpha = 0.015 + dk4 * 0.04;
        }

        var cStr = srand(seed4 + 10) < 0.20 ? "130,175,230" : "195,200,215";
        bCtx.fillStyle = "rgba(" + cStr + "," + alpha.toFixed(3) + ")";
        bCtx.fillText(glyph, x4, y4);
      }
    }

    // Header text
    renderTextOnCanvas(bCtx, texts);

    // Bottom fade
    var c = getColors(), fH = 50;
    var fg = bCtx.createLinearGradient(0, h-fH, 0, h);
    fg.addColorStop(0, "rgba(10,10,12,0)"); fg.addColorStop(1, c.bg);
    bCtx.fillStyle = fg; bCtx.fillRect(0, h-fH, w, fH);
  }

  function getLumAt(px, py) {
    if (!lumGrid) return 0.5;
    var gx = Math.floor(px / gridSp), gy = Math.floor(py / gridSp);
    if (gx < 0 || gx >= gridCols || gy < 0 || gy >= gridRows) return 0.5;
    return lumGrid[gy * gridCols + gx];
  }

  // --- Main animation loop ---
  var frameCount = 0;
  var cometTimer = 0;
  var nextCometAt = 300 + Math.floor(Math.random() * 400); // every 5-12 sec

  function animate() {
    var w = header.clientWidth, h = header.clientHeight;
    frameCount++;
    initWander();

    // --- Draw static base ---
    ascCtx.setTransform(1,0,0,1,0,0);
    ascCtx.drawImage(baseCanvas, 0, 0);
    ascCtx.setTransform(dpr,0,0,dpr,0,0);

    // --- Breathing wave overlay on static base ---
    // Multiple overlapping slow sine waves create organic brightness variation
    var breathPatch = 60; // patch size for breathing regions
    for (var by = 0; by < h; by += breathPatch) {
      for (var bx = 0; bx < w; bx += breathPatch) {
        // 3 overlapping waves at different scales/speeds/angles
        var wave1 = Math.sin(frameCount * 0.0002 + bx * 0.008 + by * 0.005) * 0.5 + 0.5;
        var wave2 = Math.sin(frameCount * 0.0003 + bx * 0.003 - by * 0.007 + 1.5) * 0.5 + 0.5;
        var wave3 = Math.sin(frameCount * 0.00015 - bx * 0.005 + by * 0.003 + 3.0) * 0.5 + 0.5;
        var combined = (wave1 * 0.4 + wave2 * 0.35 + wave3 * 0.25); // 0-1
        // Darken regions: overlay black with varying opacity
        // When combined is low → darker, when high → brighter (less overlay)
        var darkAmount = (1 - combined) * 0.10; // max 10% darkening — subtle
        if (darkAmount > 0.01) {
          ascCtx.fillStyle = "rgba(10,10,12," + darkAmount.toFixed(3) + ")";
          ascCtx.fillRect(bx, by, breathPatch, breathPatch);
        }
      }
    }

    ascCtx.textAlign = "center"; ascCtx.textBaseline = "middle";

    // --- 1. Breathing edge cells ---
    if (cells) {
      for (var ci = 0; ci < cells.length; ci++) {
        var ce = cells[ci];
        var breath = Math.sin(frameCount * ce.breathSpeed + ce.phase);
        var a = (0.04 + ce.dk * 0.08 + ce.edge * 0.10) * (0.5 + breath * 0.5);
        ce.cycleTimer++;
        if (ce.cycleTimer >= ce.cycleInterval) {
          ce.cycleTimer = 0;
          ce.glyph = symbols[Math.floor(Math.random() * symbols.length)];
        }
        if (a < 0.01) continue;
        ascCtx.font = "9px monospace";
        ascCtx.fillStyle = "rgba(" + (ce.blue ? "130,175,230" : "195,200,215") + "," + a.toFixed(3) + ")";
        ascCtx.fillText(ce.glyph, ce.x, ce.y);
      }
    }

    // --- 2. Twinkling stars ---
    for (var si = 0; si < stars.length; si++) {
      var st = stars[si];
      var twinkle = Math.sin(frameCount * st.speed + st.phase);
      // Sharp twinkle: most of the time dim, occasionally bright
      var intensity = twinkle * twinkle * twinkle; // cubic for sharp peaks
      if (intensity < 0) intensity = 0;
      var sa = st.peakAlpha * intensity;
      if (sa < 0.01) continue;

      var sr = st.maxR * (0.3 + intensity * 0.7);
      var sLum = getLumAt(st.x, st.y);
      sa *= 0.3 + (1 - sLum) * 0.7;

      ascCtx.fillStyle = "rgba(" + (st.blue ? "140,175,230" : "220,225,235") + "," + sa.toFixed(3) + ")";
      ascCtx.beginPath(); ascCtx.arc(st.x, st.y, sr, 0, Math.PI * 2); ascCtx.fill();
    }

    // --- 3. Matrix drip columns ---
    for (var di = matrixDrops.length - 1; di >= 0; di--) {
      var d = matrixDrops[di];
      d.y += d.speed;

      d.cycleTimer++;
      if (d.cycleTimer >= d.cycleInterval) {
        d.cycleTimer = 0;
        var rci = Math.floor(Math.random() * d.length);
        d.chars[rci] = symbols[Math.floor(Math.random() * symbols.length)];
      }

      ascCtx.font = d.fontSize + "px monospace";
      for (var dj = 0; dj < d.length; dj++) {
        var dy = d.y - dj * d.charSpacing;
        if (dy < -20 || dy > h + 20) continue;

        var tailFade = 1 - dj / d.length;
        tailFade = tailFade * tailFade;
        var lum = getLumAt(d.x, dy);
        var imgMod = 0.3 + (1 - lum) * 0.7;
        var da = tailFade * imgMod * d.alpha;
        if (dj === 0) da = Math.min(da * 2.5, 0.65);
        if (da < 0.005) continue;

        var dcr = d.blue ? 110 : 180, dcg = d.blue ? 165 : 188, dcb = d.blue ? 225 : 210;
        if (dj === 0) { dcr = Math.min(255, dcr + 60); dcg = Math.min(255, dcg + 60); dcb = Math.min(255, dcb + 45); }

        ascCtx.fillStyle = "rgba(" + dcr + "," + dcg + "," + dcb + "," + da.toFixed(3) + ")";
        ascCtx.fillText(d.chars[dj], d.x, dy);
      }

      if (d.y - d.length * d.charSpacing > h + 30) {
        matrixDrops[di] = createMatrixDrop(w, h);
      }
    }

    // --- 4. Cosmic drifters ---
    for (var fi = drifters.length - 1; fi >= 0; fi--) {
      var f = drifters[fi];
      f.x += f.vx; f.y += f.vy; f.age++;

      var fBreath = Math.sin(frameCount * f.breathSpeed + f.phase);
      var fa = f.alpha * (0.5 + fBreath * 0.5);
      if (f.age < 60) fa *= f.age / 60;
      else if (f.age > f.maxAge - 120) fa *= (f.maxAge - f.age) / 120;
      fa *= 0.3 + (1 - getLumAt(f.x, f.y)) * 0.7;

      if (fa > 0.005 && f.x > -20 && f.x < w + 20 && f.y > -20 && f.y < h + 20) {
        ascCtx.font = f.fontSize + "px monospace";
        ascCtx.fillStyle = "rgba(" + (f.blue ? "130,175,230" : "195,200,215") + "," + fa.toFixed(3) + ")";
        ascCtx.fillText(f.glyph, f.x, f.y);
      }

      if (f.age > f.maxAge || f.x < -40 || f.x > w + 40 || f.y < -40 || f.y > h + 40) {
        drifters[fi] = createDrifter(w, h);
      }
    }

    // --- 5. Rare comets with sparks ---
    cometTimer++;
    if (cometTimer >= nextCometAt) {
      cometTimer = 0;
      nextCometAt = 300 + Math.floor(Math.random() * 500); // 5-13 sec
      comets.push(createComet(w, h));
    }

    for (var ki = comets.length - 1; ki >= 0; ki--) {
      var k = comets[ki];
      k.x += k.vx; k.y += k.vy; k.age++;

      k.cycleTimer++;
      if (k.cycleTimer >= k.cycleInterval) {
        k.cycleTimer = 0;
        var kri = Math.floor(Math.random() * k.length);
        k.chars[kri] = symbols[Math.floor(Math.random() * symbols.length)];
      }

      // Spawn sparks from head and along tail
      k.sparkTimer++;
      if (k.sparkTimer >= k.sparkInterval && k.age > 10) {
        k.sparkTimer = 0;
        // 1-3 sparks per burst
        var sparkCount = 1 + Math.floor(Math.random() * 3);
        for (var spi = 0; spi < sparkCount; spi++) {
          // Sparks from head and random tail positions
          var sparkIdx = Math.floor(Math.random() * Math.min(5, k.length));
          var kvmag2 = Math.sqrt(k.vx * k.vx + k.vy * k.vy);
          var ktdx2 = -k.vx / kvmag2, ktdy2 = -k.vy / kvmag2;
          var spx = k.x + ktdx2 * sparkIdx * k.charSpacing;
          var spy = k.y + ktdy2 * sparkIdx * k.charSpacing;
          sparks.push(createSpark(spx, spy, k.vx, k.vy));
        }
      }

      if (k.age > k.maxAge || k.x < -200 || k.x > w + 200 || k.y < -200 || k.y > h + 200) {
        comets.splice(ki, 1); continue;
      }

      var kLifeFade = 1;
      if (k.age < 20) kLifeFade = k.age / 20;
      else if (k.age > k.maxAge - 80) kLifeFade = (k.maxAge - k.age) / 80;

      ascCtx.font = k.fontSize + "px monospace";
      var kvmag = Math.sqrt(k.vx * k.vx + k.vy * k.vy);
      var ktdx = -k.vx / kvmag, ktdy = -k.vy / kvmag;

      for (var kj = 0; kj < k.length; kj++) {
        var kx = k.x + ktdx * kj * k.charSpacing;
        var ky = k.y + ktdy * kj * k.charSpacing;
        if (kx < -40 || kx > w + 40 || ky < -40 || ky > h + 40) continue;

        var kTailFade = 1 - kj / k.length;
        // Quartic fade for very long gradual tail
        kTailFade = kTailFade * kTailFade;
        // Extra-long tail: first 3 chars bright, then gradual fade
        if (kj < 3) kTailFade = 1 - kj * 0.15;

        var kLum = getLumAt(kx, ky);
        var kImgMod = 0.5 + (1 - kLum) * 0.5;
        var ka = kTailFade * kLifeFade * kImgMod;

        if (kj === 0) ka *= 0.90;
        else if (kj < 3) ka *= 0.60;
        else if (kj < 6) ka *= 0.35;
        else ka *= 0.20;

        if (ka < 0.005) continue;

        // Color: bright white head → blue → deep blue tail
        var kcr, kcg, kcb;
        if (kj === 0) { kcr = 240; kcg = 245; kcb = 255; }
        else if (kj < 3) { kcr = 200; kcg = 215; kcb = 240; }
        else if (kj < 6) { kcr = 140; kcg = 175; kcb = 220; }
        else if (kj < 10) { kcr = 110; kcg = 145; kcb = 205; }
        else { kcr = 80; kcg = 115; kcb = 185; }

        // Tail chars get smaller font
        if (kj > 8) ascCtx.font = (k.fontSize - 1) + "px monospace";
        else ascCtx.font = k.fontSize + "px monospace";

        ascCtx.fillStyle = "rgba(" + kcr + "," + kcg + "," + kcb + "," + ka.toFixed(3) + ")";
        ascCtx.fillText(k.chars[kj], kx, ky);
      }
    }

    // --- 6. Render sparks ---
    for (var ski = sparks.length - 1; ski >= 0; ski--) {
      var sp = sparks[ski];
      sp.x += sp.vx; sp.y += sp.vy; sp.age++;
      sp.vx *= 0.97; sp.vy *= 0.97; // drag

      if (sp.age > sp.maxAge) { sparks.splice(ski, 1); continue; }

      var spLife = 1 - sp.age / sp.maxAge;
      var spAlpha = spLife * spLife * 0.6;
      var spR = sp.r * spLife;
      if (spAlpha < 0.01 || spR < 0.1) continue;

      // Sparks are bright white-blue
      ascCtx.fillStyle = "rgba(200,215,240," + spAlpha.toFixed(3) + ")";
      ascCtx.beginPath(); ascCtx.arc(sp.x, sp.y, spR, 0, Math.PI * 2); ascCtx.fill();
    }

    // Cap sparks array
    if (sparks.length > 200) sparks.splice(0, sparks.length - 200);

    // --- 7. Straight-down rain ---
    for (var ri = rainDrops.length - 1; ri >= 0; ri--) {
      var rd = rainDrops[ri];
      rd.y += rd.speed;
      if (rd.y > h + 20) { rainDrops[ri] = createRainDrop(w, h); continue; }

      var rLum = getLumAt(rd.x, rd.y);
      var ra = rd.alpha * (0.3 + (1 - rLum) * 0.7);
      if (ra < 0.005) continue;

      ascCtx.font = rd.fontSize + "px monospace";
      ascCtx.fillStyle = "rgba(" + (rd.blue ? "120,170,225" : "185,190,205") + "," + ra.toFixed(3) + ")";
      ascCtx.fillText(rd.glyph, rd.x, rd.y);
    }

    // Spawn new rain occasionally
    if (frameCount % 8 === 0 && rainDrops.length < Math.floor(w / 60)) {
      rainDrops.push(createRainDrop(w, h));
    }

    // --- 8. Supernova explosions (rare) ---
    if (frameCount % 2400 === 0) {
      // ~every 40 sec
      if (supernovae.length < 1) supernovae.push(createSupernova(w, h));
    }

    for (var sni = supernovae.length - 1; sni >= 0; sni--) {
      var sn = supernovae[sni];
      sn.age++;
      if (sn.age > sn.maxAge) { supernovae.splice(sni, 1); continue; }

      var snLife = sn.age / sn.maxAge;
      // Fade: bright burst then slow fade
      var snAlpha = snLife < 0.1 ? snLife / 0.1 : Math.max(0, 1 - (snLife - 0.1) / 0.9);
      snAlpha = snAlpha * snAlpha * 0.5;

      ascCtx.font = "8px monospace";
      for (var spi2 = 0; spi2 < sn.particles.length; spi2++) {
        var snp = sn.particles[spi2];
        snp.x += snp.vx; snp.y += snp.vy;
        snp.vx *= snp.drag; snp.vy *= snp.drag;

        if (snp.x < -20 || snp.x > w + 20 || snp.y < -20 || snp.y > h + 20) continue;

        var snpLum = getLumAt(snp.x, snp.y);
        var snpA = snAlpha * (0.3 + (1 - snpLum) * 0.7);
        if (snpA < 0.005) continue;

        // Color: white center → blue outer
        var dist = Math.sqrt((snp.x - sn.cx) * (snp.x - sn.cx) + (snp.y - sn.cy) * (snp.y - sn.cy));
        var snr, sng, snb;
        if (dist < 30) { snr = 220; sng = 225; snb = 240; }
        else if (dist < 80) { snr = 150; sng = 180; snb = 225; }
        else { snr = 100; sng = 140; snb = 205; }

        ascCtx.fillStyle = "rgba(" + snr + "," + sng + "," + snb + "," + snpA.toFixed(3) + ")";
        ascCtx.fillText(snp.glyph, snp.x, snp.y);
      }
    }

    // --- 9. Dynamic bright stars ---
    for (var bsi = brightStars.length - 1; bsi >= 0; bsi--) {
      var bs = brightStars[bsi];
      bs.age++;
      bs.cycleTimer++;
      if (bs.cycleTimer >= bs.cycleInterval) {
        bs.cycleTimer = 0;
        bs.glyph = symbols[Math.floor(Math.random() * symbols.length)];
      }

      if (bs.age > bs.maxAge) {
        brightStars[bsi] = createBrightStar(w, h);
        continue;
      }

      // Intensity: sharp rise to peak, slow fade
      var bsT = bs.age / bs.maxAge;
      var bsPeak = bs.peakAt / bs.maxAge;
      var bsIntensity;
      if (bsT < bsPeak) {
        bsIntensity = bsT / bsPeak; // rise
      } else {
        bsIntensity = 1 - (bsT - bsPeak) / (1 - bsPeak); // fade
      }
      bsIntensity = bsIntensity * bsIntensity; // quadratic for sharper pulse

      var bsLum = getLumAt(bs.x, bs.y);
      var bsA = bsIntensity * 0.70 * (0.4 + (1 - bsLum) * 0.6);
      if (bsA < 0.01) continue;

      ascCtx.font = bs.fontSize + "px monospace";
      var bsR = bs.blue ? 140 : 210, bsG = bs.blue ? 180 : 215, bsB = bs.blue ? 235 : 230;
      // At peak, glow even brighter
      if (bsIntensity > 0.7) {
        bsR = Math.min(255, bsR + 40); bsG = Math.min(255, bsG + 35); bsB = Math.min(255, bsB + 25);
      }
      ascCtx.fillStyle = "rgba(" + bsR + "," + bsG + "," + bsB + "," + bsA.toFixed(3) + ")";
      ascCtx.fillText(bs.glyph, bs.x, bs.y);
    }

    // --- Header text on top ---
    var texts = getHeaderTexts();
    renderTextOnCanvas(ascCtx, texts);

    // Bottom fade
    var colors = getColors(), fH = 50;
    var fg = ascCtx.createLinearGradient(0, h-fH, 0, h);
    fg.addColorStop(0, "rgba(10,10,12,0)"); fg.addColorStop(1, colors.bg);
    ascCtx.fillStyle = fg; ascCtx.fillRect(0, h-fH, w, fH);

    // --- Reveal animation ---
    rvCtx.clearRect(0, 0, w, h);
    var src = realCanvas;
    var interacting = isHovering || isTouching;
    if (touchFadeTimer > 0) touchFadeTimer--;

    wanderX += (wanderTargetX - wanderX) * wanderSpeed;
    wanderY += (wanderTargetY - wanderY) * wanderSpeed;
    if (Math.hypot(wanderX - wanderTargetX, wanderY - wanderTargetY) < 20) pickWanderTarget();

    var activeX, activeY, activeEase;
    if (interacting && mouseX >= 0) { activeX = mouseX; activeY = mouseY; activeEase = isHovering ? 0.04 : 0.06; }
    else if (touchFadeTimer > 0 && mouseX >= 0) {
      var blend = touchFadeTimer / 120;
      activeX = wanderX + (mouseX - wanderX) * blend;
      activeY = wanderY + (mouseY - wanderY) * blend; activeEase = 0.03;
    } else { activeX = wanderX; activeY = wanderY; activeEase = 0.02; }

    if (cursorX < 0) { cursorX = activeX; cursorY = activeY; }
    cursorX += (activeX - cursorX) * activeEase;
    cursorY += (activeY - cursorY) * activeEase;

    if (interacting && mouseX >= 0) {
      wanderX += (mouseX - wanderX) * 0.02;
      wanderY += (mouseY - wanderY) * 0.02;
    }

    var targetAlpha = interacting ? 1 : 0.55;
    revealAlpha += (targetAlpha - revealAlpha) * 0.03;

    if (!trail.length || Math.hypot(cursorX - trail[trail.length-1].x, cursorY - trail[trail.length-1].y) > 2) {
      trail.push({ x: cursorX, y: cursorY, age: 0 });
    }
    if (trail.length > 60) trail.shift();

    if (revealAlpha > 0.005) {
      for (var tli = trail.length - 1; tli >= 0; tli--) {
        trail[tli].age++;
        if (trail[tli].age > 80) { trail.splice(tli, 1); continue; }
        var tp = trail[tli];
        var life = 1 - tp.age / 80;
        var tr = revealR * (0.1 + life * 0.3);
        var tAlpha = life * life * 0.25 * revealAlpha;
        rvCtx.save();
        rvCtx.beginPath(); rvCtx.arc(tp.x, tp.y, tr, 0, Math.PI * 2); rvCtx.closePath(); rvCtx.clip();
        rvCtx.globalAlpha = tAlpha;
        rvCtx.drawImage(src, 0, 0, src.width, src.height, 0, 0, w, h);
        rvCtx.globalCompositeOperation = "destination-in";
        var tg = rvCtx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, tr);
        tg.addColorStop(0, "rgba(0,0,0," + tAlpha + ")");
        tg.addColorStop(0.6, "rgba(0,0,0," + (tAlpha * 0.3) + ")");
        tg.addColorStop(1, "rgba(0,0,0,0)");
        rvCtx.fillStyle = tg;
        rvCtx.fillRect(tp.x - tr, tp.y - tr, tr * 2, tr * 2);
        rvCtx.globalCompositeOperation = "source-over"; rvCtx.globalAlpha = 1; rvCtx.restore();
      }

      if (cursorX >= 0) {
        rvCtx.save();
        rvCtx.beginPath(); rvCtx.arc(cursorX, cursorY, revealR, 0, Math.PI * 2); rvCtx.closePath(); rvCtx.clip();
        rvCtx.globalAlpha = revealAlpha * 0.9;
        rvCtx.drawImage(src, 0, 0, src.width, src.height, 0, 0, w, h);
        rvCtx.globalCompositeOperation = "destination-in";
        var mg = rvCtx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, revealR);
        mg.addColorStop(0, "rgba(0,0,0,1)"); mg.addColorStop(0.4, "rgba(0,0,0,0.7)");
        mg.addColorStop(0.7, "rgba(0,0,0,0.2)"); mg.addColorStop(1, "rgba(0,0,0,0)");
        rvCtx.fillStyle = mg;
        rvCtx.fillRect(cursorX - revealR, cursorY - revealR, revealR * 2, revealR * 2);
        rvCtx.globalCompositeOperation = "source-over"; rvCtx.globalAlpha = 1; rvCtx.restore();
      }
    }

    requestAnimationFrame(animate);
  }

  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }
})();

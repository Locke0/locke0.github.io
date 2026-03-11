// Header image → LiDAR wireframe + Matrix code art
// Always dark: ASCII is default, hover reveals real image beneath.
(function () {
  "use strict";

  var header = document.querySelector("header[style*='background-image']");
  if (!header) return;

  var match = header.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
  if (!match) return;
  var imgUrl = match[1];

  var mathSymbols = [
    "π","∑","∂","∇","∞","φ","λ","Ω","θ","σ",
    "∫","√","≈","△","◇","⊕","∆","ℝ","ε","μ"
  ];

  function srand(s) { var x = Math.sin(s) * 10000; return x - Math.floor(x); }

  // --- Canvases ---
  var asciiCanvas = document.createElement("canvas");
  var realCanvas = document.createElement("canvas");
  var revealCanvas = document.createElement("canvas");
  [asciiCanvas, realCanvas, revealCanvas].forEach(function (c) {
    c.setAttribute("aria-hidden", "true");
  });
  var base = "position:absolute;top:0;left:0;width:100%;height:100%;";
  asciiCanvas.style.cssText = base + "z-index:1;";
  realCanvas.style.cssText = base + "z-index:0;opacity:0;";
  revealCanvas.style.cssText = base + "z-index:2;pointer-events:none;";
  header.style.position = "relative";
  header.style.overflow = "hidden";
  header.appendChild(asciiCanvas);
  header.appendChild(realCanvas);
  header.appendChild(revealCanvas);

  var ascCtx = asciiCanvas.getContext("2d");
  var rlCtx = realCanvas.getContext("2d");
  var rvCtx = revealCanvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  // --- State ---
  var mouseX = -1, mouseY = -1;
  var cursorX = -1, cursorY = -1;
  var isHovering = false;
  var revealR = 180;
  var trail = [];
  var revealAlpha = 0;
  var animating = false;

  header.addEventListener("mouseenter", function () {
    isHovering = true; startAnim();
  });
  header.addEventListener("mouseleave", function () {
    isHovering = false; mouseX = mouseY = -1;
  });
  header.addEventListener("mousemove", function (e) {
    var r = header.getBoundingClientRect();
    mouseX = e.clientX - r.left; mouseY = e.clientY - r.top;
    startAnim();
  });

  function startAnim() { if (!animating) { animating = true; requestAnimationFrame(animate); } }

  // --- Helpers ---
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
  img.onload = function () { renderAll(); window.addEventListener("resize", debounce(renderAll, 200)); };
  img.src = imgUrl;

  // --- Header text → render onto canvases ---
  function getHeaderTexts() {
    var texts = [];
    var els = header.querySelectorAll("h2, aside");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var rect = el.getBoundingClientRect();
      var hRect = header.getBoundingClientRect();
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

  function renderAll() {
    var w = header.clientWidth, h = header.clientHeight;
    var texts = getHeaderTexts();
    [asciiCanvas, realCanvas, revealCanvas].forEach(function (c) { c.width = w * dpr; c.height = h * dpr; });
    ascCtx.setTransform(dpr,0,0,dpr,0,0);
    rlCtx.setTransform(dpr,0,0,dpr,0,0);
    rvCtx.setTransform(dpr,0,0,dpr,0,0);
    renderReal(w, h);
    renderAscii(w, h);
    renderTextOnCanvas(rlCtx, texts);
    renderTextOnCanvas(ascCtx, texts);
    for (var i = 0; i < texts.length; i++) texts[i].el.style.visibility = "hidden";
    header.style.backgroundImage = "none";
  }

  function renderReal(w, h) {
    var dim = coverDim(img.width, img.height, w, h, header.style.backgroundPosition);
    rlCtx.drawImage(img, dim.sx, dim.sy, dim.sw, dim.sh, 0, 0, w, h);
    var c = getColors(), fH = 50;
    var g = rlCtx.createLinearGradient(0, h - fH, 0, h);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, c.bg);
    rlCtx.fillStyle = g; rlCtx.fillRect(0, h - fH, w, fH);
  }

  function renderAscii(w, h) {
    var sp = 10; // larger grid = bigger, more readable characters
    var cols = Math.ceil(w / sp), rows = Math.ceil(h / sp);
    var off = document.createElement("canvas"); off.width = cols; off.height = rows;
    var oCtx = off.getContext("2d");
    var dim = coverDim(img.width, img.height, cols, rows, header.style.backgroundPosition);
    oCtx.drawImage(img, dim.sx, dim.sy, dim.sw, dim.sh, 0, 0, cols, rows);
    var px = oCtx.getImageData(0, 0, cols, rows).data;

    var lumGrid = new Float32Array(cols * rows);
    for (var li = 0; li < cols * rows; li++) {
      var li4 = li * 4;
      lumGrid[li] = (0.299*px[li4] + 0.587*px[li4+1] + 0.114*px[li4+2]) / 255;
    }

    // Characters by density tier
    var lightChars = ["·",".",":","-","~"];
    var midChars = ["0","1","2","3","4","5","6","7","8","9",
                    "a","b","c","d","e","f","x","=","+","/"];
    var heavyChars = ["0x","ff","int","def","var","for",
                      "grad","loss","relu","self","true","null",
                      "π","∂","∇","∑","λ","σ","Ω","θ"];

    ascCtx.fillStyle = "#0a0a0c";
    ascCtx.fillRect(0, 0, w, h);

    // === 1. ViT-style patch grid (vision transformer embedding grid) ===
    var patchSize = Math.round(w / 16); // 16 patches across, like ViT
    ascCtx.strokeStyle = "rgba(255,255,255,0.035)";
    ascCtx.lineWidth = 0.5;
    for (var py = patchSize; py < h; py += patchSize) {
      ascCtx.beginPath(); ascCtx.moveTo(0, py); ascCtx.lineTo(w, py); ascCtx.stroke();
    }
    for (var ppx = patchSize; ppx < w; ppx += patchSize) {
      ascCtx.beginPath(); ascCtx.moveTo(ppx, 0); ascCtx.lineTo(ppx, h); ascCtx.stroke();
    }
    // Patch index labels at intersections
    ascCtx.font = "7px monospace"; ascCtx.textAlign = "left"; ascCtx.textBaseline = "top";
    ascCtx.fillStyle = "rgba(100,120,160,0.06)";
    var pIdx = 0;
    for (var ppy = 0; ppy < h; ppy += patchSize) {
      for (var ppx2 = 0; ppx2 < w; ppx2 += patchSize) {
        ascCtx.fillText("[" + pIdx + "]", ppx2 + 2, ppy + 2);
        pIdx++;
      }
    }

    // === 2. Character fill — luminance-mapped (recognizable image) ===
    ascCtx.textAlign = "center"; ascCtx.textBaseline = "middle";

    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        var lum = lumGrid[row * cols + col];
        var dk = 1 - lum;
        if (dk < 0.04) continue;

        var seed = row * 1000 + col;
        var rnd = srand(seed);
        var x = col * sp + sp * 0.5, y = row * sp + sp * 0.5;

        // Higher fill rate for clearer image. Dark: ~80%, mid: ~40%, light: ~10%
        var fillChance = dk * dk * 0.85;
        if (rnd > fillChance) continue;

        // Character tier by darkness
        var ch;
        var charRnd = srand(seed + 3);
        if (dk < 0.2) {
          ch = lightChars[Math.floor(charRnd * lightChars.length)];
        } else if (dk < 0.5) {
          ch = midChars[Math.floor(charRnd * midChars.length)];
        } else {
          ch = heavyChars[Math.floor(charRnd * heavyChars.length)];
        }

        // Font size: 7-10px (larger, readable)
        var fontSize = 7 + Math.floor(dk * 3);
        ascCtx.font = fontSize + "px monospace";

        // Brighter alpha for clearer image
        var alpha = 0.08 + dk * 0.5;

        // ~10% blue tint
        var hasBlue = srand(seed + 10) < 0.10;
        var cStr = hasBlue ? "110,140,200" : "190,190,195";

        ascCtx.fillStyle = "rgba(" + cStr + "," + alpha + ")";
        ascCtx.fillText(ch, x, y);
      }
    }

    // === 3. LiDAR point cloud dots on strong features ===
    // Adds depth — small bright dots at edge intersections and dark peaks
    for (var row3 = 1; row3 < rows - 1; row3++) {
      for (var col3 = 1; col3 < cols - 1; col3++) {
        var lum3 = lumGrid[row3 * cols + col3];
        var dk3 = 1 - lum3;
        var lumR3 = lumGrid[row3 * cols + col3 + 1];
        var lumB3 = lumGrid[(row3 + 1) * cols + col3];
        var eH3 = Math.abs(lum3 - lumR3);
        var eV3 = Math.abs(lum3 - lumB3);
        var edgeStrength = Math.max(eH3, eV3);

        if (edgeStrength < 0.06 && dk3 < 0.6) continue;

        var x3 = col3 * sp + sp * 0.5, y3 = row3 * sp + sp * 0.5;
        var seed3 = row3 * 1000 + col3;

        // LiDAR dot — brighter at edges, dimmer in flat dark areas
        var dotAlpha = edgeStrength > 0.06
          ? 0.25 + edgeStrength * 0.5
          : 0.05 + dk3 * 0.1;
        var dotR = edgeStrength > 0.06
          ? 1.0 + edgeStrength * 1.5
          : 0.5 + dk3 * 0.5;

        // Slight jitter for organic 3D point cloud feel
        var jx = (srand(seed3 + 20) - 0.5) * 2;
        var jy = (srand(seed3 + 21) - 0.5) * 2;

        var hasBlue3 = edgeStrength > 0.15;
        ascCtx.fillStyle = "rgba(" + (hasBlue3 ? "140,170,220" : "220,220,225") + "," + dotAlpha + ")";
        ascCtx.beginPath();
        ascCtx.arc(x3 + jx, y3 + jy, dotR, 0, Math.PI * 2);
        ascCtx.fill();
      }
    }

    // === 4. Edge contour lines (clean wireframe structure) ===
    for (var row2 = 1; row2 < rows - 1; row2++) {
      for (var col2 = 1; col2 < cols - 1; col2++) {
        var lum2 = lumGrid[row2 * cols + col2];
        var lumR2 = lumGrid[row2 * cols + col2 + 1];
        var lumB2 = lumGrid[(row2 + 1) * cols + col2];
        var eH = Math.abs(lum2 - lumR2);
        var eV = Math.abs(lum2 - lumB2);
        if (eH < 0.08 && eV < 0.08) continue;

        var x2 = col2 * sp + sp * 0.5, y2 = row2 * sp + sp * 0.5;
        var strength = Math.min(1, Math.max(eH, eV) * 3);
        var eAlpha = 0.2 + strength * 0.4;

        ascCtx.strokeStyle = "rgba(" + (strength > 0.5 ? "150,175,215" : "200,200,210") + "," + eAlpha + ")";
        ascCtx.lineWidth = 0.5 + strength * 0.8;

        var len = sp * (0.4 + strength * 0.6);
        ascCtx.beginPath();
        if (eH > eV) { ascCtx.moveTo(x2 - len, y2); ascCtx.lineTo(x2 + len, y2); }
        else { ascCtx.moveTo(x2, y2 - len); ascCtx.lineTo(x2, y2 + len); }
        ascCtx.stroke();
      }
    }

    // === 5. Faint scan lines ===
    ascCtx.globalAlpha = 0.01; ascCtx.strokeStyle = "#fff"; ascCtx.lineWidth = 0.3;
    for (var sl = 0; sl < h; sl += 3) {
      ascCtx.beginPath(); ascCtx.moveTo(0, sl); ascCtx.lineTo(w, sl); ascCtx.stroke();
    }
    ascCtx.globalAlpha = 1;

    // Bottom fade
    var c = getColors();
    var fH = 50;
    var fg = ascCtx.createLinearGradient(0, h-fH, 0, h);
    fg.addColorStop(0, "rgba(10,10,12,0)"); fg.addColorStop(1, c.bg);
    ascCtx.fillStyle = fg; ascCtx.fillRect(0, h-fH, w, fH);
  }

  // --- Animation: hover reveal only, no ripples ---
  function animate() {
    var w = header.clientWidth, h = header.clientHeight;
    rvCtx.clearRect(0, 0, w, h);
    var src = realCanvas; // always reveal real image

    // Smooth fade in/out
    if (isHovering) {
      revealAlpha += (1 - revealAlpha) * 0.04;
    } else {
      revealAlpha *= 0.96;
    }

    // Lag cursor
    if (mouseX >= 0 && isHovering) {
      if (cursorX < 0) { cursorX = mouseX; cursorY = mouseY; }
      cursorX += (mouseX - cursorX) * 0.03;
      cursorY += (mouseY - cursorY) * 0.03;
      if (!trail.length || Math.hypot(cursorX - trail[trail.length-1].x, cursorY - trail[trail.length-1].y) > 2) {
        trail.push({ x: cursorX, y: cursorY, age: 0 });
      }
      if (trail.length > 60) trail.shift();
    } else if (!isHovering && revealAlpha < 0.01) {
      cursorX = -1; cursorY = -1;
      trail.length = 0;
    }

    if (revealAlpha > 0.005 && (cursorX >= 0 || trail.length > 0)) {
      // Wake trail
      for (var i = trail.length - 1; i >= 0; i--) {
        trail[i].age++;
        if (trail[i].age > 80) { trail.splice(i, 1); continue; }
        var tp = trail[i];
        var life = 1 - tp.age / 80;
        var tr = revealR * (0.1 + life * 0.3);
        var tAlpha = life * life * 0.25 * revealAlpha;

        rvCtx.save();
        rvCtx.beginPath();
        rvCtx.arc(tp.x, tp.y, tr, 0, Math.PI * 2);
        rvCtx.closePath();
        rvCtx.clip();
        rvCtx.globalAlpha = tAlpha;
        rvCtx.drawImage(src, 0, 0, src.width, src.height, 0, 0, w, h);
        rvCtx.globalCompositeOperation = "destination-in";
        var tg = rvCtx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, tr);
        tg.addColorStop(0, "rgba(0,0,0," + tAlpha + ")");
        tg.addColorStop(0.6, "rgba(0,0,0," + (tAlpha * 0.3) + ")");
        tg.addColorStop(1, "rgba(0,0,0,0)");
        rvCtx.fillStyle = tg;
        rvCtx.fillRect(tp.x - tr, tp.y - tr, tr * 2, tr * 2);
        rvCtx.globalCompositeOperation = "source-over";
        rvCtx.globalAlpha = 1;
        rvCtx.restore();
      }

      // Main cursor reveal
      if (cursorX >= 0) {
        rvCtx.save();
        rvCtx.beginPath();
        rvCtx.arc(cursorX, cursorY, revealR, 0, Math.PI * 2);
        rvCtx.closePath();
        rvCtx.clip();
        rvCtx.globalAlpha = revealAlpha * 0.9;
        rvCtx.drawImage(src, 0, 0, src.width, src.height, 0, 0, w, h);
        rvCtx.globalCompositeOperation = "destination-in";
        var mg = rvCtx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, revealR);
        mg.addColorStop(0, "rgba(0,0,0,1)");
        mg.addColorStop(0.4, "rgba(0,0,0,0.7)");
        mg.addColorStop(0.7, "rgba(0,0,0,0.2)");
        mg.addColorStop(1, "rgba(0,0,0,0)");
        rvCtx.fillStyle = mg;
        rvCtx.fillRect(cursorX - revealR, cursorY - revealR, revealR * 2, revealR * 2);
        rvCtx.globalCompositeOperation = "source-over";
        rvCtx.globalAlpha = 1;
        rvCtx.restore();
      }
    }

    if (revealAlpha > 0.005) requestAnimationFrame(animate);
    else { animating = false; rvCtx.clearRect(0, 0, w, h); }
  }

  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }
})();

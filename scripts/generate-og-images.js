const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs");
const path = require("path");

const WIDTH = 1200;
const HEIGHT = 630;

const BG = "#0a0a0c";
const CYAN = "#72dec2";
const AMBER = "#d4a056";
const TEXT = "#ddd";
const SUBTLE = "#666";

const OUTPUT_DIR = path.join(__dirname, "..", "img", "og");
const FONT_PATH = path.join(
  __dirname,
  "..",
  "fonts",
  "FacultyGlyphic-Regular.ttf"
);

// Seeded PRNG for deterministic patterns per post
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  let s = seed || 1;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// Agent glyphs from the header animation
const GLYPHS = ["\u25CB","\u25E6","\u2299","\u2234","\u223F","\u2206","\u25C7","\u2192","\u25B8","\u25CF","\u21D2","?"];
const MESSAGES = [
  "see","think","act","loop","why","here","look","converge?",
  "stable?","attractor?","pattern repeats","edges connect",
  "yours?","something changed","wait","both probably",
  "the uncertainty is honest","your presence changes my policy",
  "done is better than perfect. mostly","same input though",
  "docs were wrong. worked anyway","the irony of patterns",
];
const PALETTE = [
  "120,170,220", "90,185,130", "210,175,75",
  "160,170,185", "180,120,140", "114,222,194",
];

function generateNetworkSvg(seed) {
  const rand = seededRandom(hashCode(seed));
  const agentCount = 6 + Math.floor(rand() * 4);
  const agents = [];

  // Place agents — avoid the center text zone
  for (let i = 0; i < agentCount; i++) {
    agents.push({
      x: 40 + rand() * (WIDTH - 80),
      y: 40 + rand() * (HEIGHT - 80),
      glyph: GLYPHS[Math.floor(rand() * GLYPHS.length)],
      color: PALETTE[Math.floor(rand() * PALETTE.length)],
      size: 10 + rand() * 14,
    });
  }

  let svg = "";

  // Connecting lines between agents (message passing)
  for (let i = 0; i < agents.length; i++) {
    for (let j = i + 1; j < agents.length; j++) {
      const dx = agents[i].x - agents[j].x;
      const dy = agents[i].y - agents[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 500 && rand() > 0.35) {
        const opacity = (0.12 + (1 - dist / 500) * 0.2).toFixed(3);
        svg += `<line x1="${agents[i].x.toFixed(0)}" y1="${agents[i].y.toFixed(0)}" x2="${agents[j].x.toFixed(0)}" y2="${agents[j].y.toFixed(0)}" stroke="rgba(${agents[i].color},${opacity})" stroke-width="1"/>`;

        // Message text along some lines
        if (rand() > 0.45) {
          const msg = MESSAGES[Math.floor(rand() * MESSAGES.length)];
          const mx = ((agents[i].x + agents[j].x) / 2 + (rand() - 0.5) * 40).toFixed(0);
          const my = ((agents[i].y + agents[j].y) / 2 + (rand() - 0.5) * 20).toFixed(0);
          const msgOpacity = (0.18 + rand() * 0.15).toFixed(3);
          svg += `<text x="${mx}" y="${my}" fill="rgba(${agents[i].color},${msgOpacity})" font-family="monospace" font-size="10">${msg}</text>`;
        }
      }
    }
  }

  // Agent glyphs — clusters with orbiting dots
  for (const agent of agents) {
    const opacity = (0.25 + rand() * 0.2).toFixed(3);
    // Main glyph
    svg += `<text x="${agent.x.toFixed(0)}" y="${agent.y.toFixed(0)}" fill="rgba(${agent.color},${opacity})" font-family="monospace" font-size="${agent.size.toFixed(0)}" text-anchor="middle" dominant-baseline="central">${agent.glyph}</text>`;

    // Orbiting dots around each agent
    const dotCount = 3 + Math.floor(rand() * 4);
    for (let d = 0; d < dotCount; d++) {
      const angle = rand() * Math.PI * 2;
      const radius = 12 + rand() * 30;
      const dx = agent.x + Math.cos(angle) * radius;
      const dy = agent.y + Math.sin(angle) * radius;
      const dotOp = (0.2 + rand() * 0.2).toFixed(3);
      svg += `<circle cx="${dx.toFixed(0)}" cy="${dy.toFixed(0)}" r="${(1.5 + rand() * 2.5).toFixed(1)}" fill="rgba(${agent.color},${dotOp})"/>`;
    }
  }

  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">${svg}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svgStr).toString("base64")}`;
}

function createPostOgElement(title) {
  const fontSize = title.length > 60 ? 40 : title.length > 40 ? 48 : 56;
  const bgUri = generateNetworkSvg(title);

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: BG,
        backgroundImage: `url("${bgUri}")`,
        backgroundSize: `${WIDTH}px ${HEIGHT}px`,
        padding: "60px 60px 50px",
        fontFamily: "FacultyGlyphic",
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "center" },
            children: [
              {
                type: "span",
                props: {
                  style: { color: SUBTLE, fontSize: "24px" },
                  children: "yangyue@machine:",
                },
              },
              {
                type: "span",
                props: {
                  style: { color: TEXT, fontSize: "24px" },
                  children: "/home$",
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              flex: "1",
              justifyContent: "center",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: `${fontSize}px`,
                    color: TEXT,
                    lineHeight: "1.3",
                    maxWidth: "1000px",
                  },
                  children: title,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              borderTop: `2px solid ${CYAN}`,
              paddingTop: "12px",
              display: "flex",
            },
            children: [
              {
                type: "span",
                props: {
                  style: { color: AMBER, fontSize: "16px", opacity: "0.4" },
                  children: "$_",
                },
              },
            ],
          },
        },
      ],
    },
  };
}

function createDefaultOgElement(title) {
  const bgUri = generateNetworkSvg(title);

  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: BG,
        backgroundImage: `url("${bgUri}")`,
        backgroundSize: `${WIDTH}px ${HEIGHT}px`,
        padding: "60px",
        fontFamily: "FacultyGlyphic",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "baseline",
              fontSize: "56px",
              lineHeight: "1.3",
            },
            children: [
              {
                type: "span",
                props: {
                  style: { color: SUBTLE },
                  children: "yangyue@machine:",
                },
              },
              {
                type: "span",
                props: {
                  style: { color: TEXT },
                  children: "/home$",
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              borderTop: `2px solid ${CYAN}`,
              marginTop: "40px",
              width: "100%",
              display: "flex",
            },
            children: [],
          },
        },
      ],
    },
  };
}

async function generateImage(title, slug) {
  const { default: satori } = await import("satori");
  const fontData = fs.readFileSync(FONT_PATH);

  const element = slug === "default"
    ? createDefaultOgElement(title)
    : createPostOgElement(title);

  const svg = await satori(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: "FacultyGlyphic",
        data: fontData,
        weight: 400,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  });
  const pngBuffer = resvg.render().asPng();

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const outputPath = path.join(OUTPUT_DIR, `${slug}.png`);
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`OG image: ${slug}.png`);
}

async function main() {
  // Default OG image for homepage/about/non-post pages
  await generateImage("yangyue@machine", "default");

  // Generate for each post
  const postsDir = path.join(__dirname, "..", "posts");
  if (!fs.existsSync(postsDir)) return;

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

  for (const file of files) {
    const content = fs.readFileSync(path.join(postsDir, file), "utf-8");
    const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    if (!titleMatch) continue;

    const title = titleMatch[1];
    const slug = path.basename(file, ".md");

    await generateImage(title, slug);
  }
}

main().catch(console.error);

import * as fs from "fs";
import * as path from "path";
import { watch } from "fs";
import { format } from "prettier";

interface AsepriteFrame {
  frame: { x: number; y: number; w: number; h: number };
  duration: number;
}

interface AsepriteFrameTag {
  name: string;
  from: number;
  to: number;
}

interface AsepriteJSON {
  frames: Record<string, AsepriteFrame>;
  meta: {
    image: string;
    size: { w: number; h: number };
    frameTags: AsepriteFrameTag[];
  };
}

function generateCSSForSymbol(data: AsepriteJSON, baseName: string): string {
  const frameList = Object.entries(data.frames).map(([_, frame]) => frame);
  const { w: sheetW, h: sheetH } = data.meta.size;

  let css = `/* Auto-generated from ${baseName}.json */
[data-sprite] {
  display: inline-block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  background-repeat: no-repeat;
}

`;

  frameList.forEach((frame, idx) => {
    const frameName = Object.keys(data.frames)[idx];
    const tagMatch = frameName.match(/#([\w-]+)/);

    if (tagMatch) {
      const tagName = tagMatch[1];
      const bgX = -frame.frame.x;
      const bgY = -frame.frame.y;

      css += `
[data-sprite="${tagName}"] {
  --sprite-original-w: ${frame.frame.w}px;
  --sprite-original-h: ${frame.frame.h}px;
  --sprite-bg-x: ${bgX}px;
  --sprite-bg-y: ${bgY}px;
  --sprite-sheet-w: ${sheetW}px;
  --sprite-sheet-h: ${sheetH}px;
  --sprite-w-final: var(--sprite-w, var(--sprite-original-w));
  --sprite-h-final: var(--sprite-h, var(--sprite-original-h));
  --sprite-scale-x: calc(var(--sprite-w-final) / var(--sprite-original-w));
  --sprite-scale-y: calc(var(--sprite-h-final) / var(--sprite-original-h));

  width: var(--sprite-w-final);
  height: var(--sprite-h-final);
  background-image: url('/sprites/symbol/${data.meta.image}');
  background-position:
    calc(var(--sprite-bg-x) * var(--sprite-scale-x))
    calc(var(--sprite-bg-y) * var(--sprite-scale-y));
  background-size:
    calc(var(--sprite-sheet-w) * var(--sprite-scale-x))
    calc(var(--sprite-sheet-h) * var(--sprite-scale-y));
}

`;
    }
  });

  return css;
}

async function formatCSS(css: string): Promise<string> {
  try {
    return await format(css, { parser: "css" });
  } catch (err) {
    console.warn("Prettier formatting failed, returning unformatted CSS", err);
    return css;
  }
}

async function processFile(jsonPath: string) {
  const baseName = path.basename(jsonPath, ".json");
  const isSymbol = jsonPath.includes("/symbol/");

  try {
    const data: AsepriteJSON = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    if (isSymbol) {
      const cssPath = `src/styles/sprites-${baseName}.css`;
      let css = generateCSSForSymbol(data, baseName);
      css = await formatCSS(css);

      fs.mkdirSync(path.dirname(cssPath), { recursive: true });
      fs.writeFileSync(cssPath, css);
      console.log(`✓ Generated CSS: ${cssPath}`);
    }
  } catch (err) {
    console.error(`Error processing ${jsonPath}:`, err);
  }
}

async function main() {
  const symbolDir = "public/sprites/symbol";
  const watchMode = process.argv.includes("--watch");

  const processDir = async (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith(".json")) {
        await processFile(path.join(dir, file));
      }
    }
  };

  const convert = async () => {
    await processDir(symbolDir);
  };

  if (watchMode) {
    console.log("📁 Watching sprite directories...");
    watch(symbolDir, { recursive: true }, () => convert());
    await convert();
  } else {
    await convert();
  }
}

main();

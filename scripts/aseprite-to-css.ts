import * as fs from "fs";
import * as path from "path";
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
  const frames = Object.entries(data.frames);
  const { w: sheetW, h: sheetH } = data.meta.size;

  let css = `/* Auto-generated from ${baseName}.json */
[data-sprite] {
  display: inline-block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  background-repeat: no-repeat;
}

`;

  for (let idx = 0; idx < frames.length; idx++) {
    const [frameName, frame] = frames[idx];

    const tagFromName = frameName.match(/#([\w-]+)/)?.[1];
    const tagFromMeta = data.meta.frameTags.find(
      (tag) => idx >= tag.from && idx <= tag.to,
    )?.name;
    const tagName = tagFromName ?? tagFromMeta;

    if (!tagName) {
      continue;
    }

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

  return css;
}

async function formatJSON(jsonText: string): Promise<string> {
  try {
    return await format(jsonText, { parser: "json" });
  } catch (err) {
    console.warn("Prettier JSON formatting failed, keeping original JSON", err);
    return jsonText;
  }
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
  const normalizedPath = path.normalize(jsonPath);
  const dirParts = path.dirname(normalizedPath).split(path.sep);
  const isSymbol = dirParts.includes("symbol");

  try {
    const rawJson = fs.readFileSync(jsonPath, "utf-8");
    const data: AsepriteJSON = JSON.parse(rawJson);

    const formattedJson = await formatJSON(rawJson);
    if (formattedJson !== rawJson) {
      fs.writeFileSync(jsonPath, formattedJson);
      console.log("✓ Formatted JSON: " + jsonPath);
    }

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

  await convert();
}

main();

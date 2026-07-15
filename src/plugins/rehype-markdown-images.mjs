import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import sharp from "sharp";

// 同一画像のメタデータ読み取りを避けるためのキャッシュ
const sizeCache = new Map();

// Markdown拡張記法 { .class-a .class-b } を class 配列へ変換する
function parseClassExtension(value) {
  const match = /^\s*\{([^{}]+)\}\s*$/.exec(value);
  if (!match) {
    return [];
  }

  return match[1]
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.startsWith(".") && token.length > 1)
    .map((token) => token.slice(1));
}

// rehype の class/className の揺れを吸収して配列化する
function toClassList(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map(String);
  }

  return String(value)
    .split(/\s+/)
    .map((name) => name.trim())
    .filter(Boolean);
}

// 既存 class と新規 class を重複なくマージする
function mergeClasses(properties, classNames) {
  if (classNames.length === 0) {
    return;
  }

  const current = toClassList(properties.className ?? properties.class);
  const merged = [...new Set([...current, ...classNames])];

  properties.className = merged;
}

// /foo/bar.webp のような public 配下パスのみを対象に正規化する
// クエリやハッシュは除去して実ファイル解決しやすくする
function normalizePublicImagePath(src) {
  if (typeof src !== "string" || !src.startsWith("/")) {
    return null;
  }

  const cleanSrc = src.split("?")[0].split("#")[0];
  if (!cleanSrc) {
    return null;
  }

  return decodeURI(cleanSrc);
}

// public 配下画像の実寸を取得し、失敗時は null を返して処理継続
async function getPublicImageSize(src) {
  if (sizeCache.has(src)) {
    return sizeCache.get(src);
  }

  const filePath = path.join(process.cwd(), "public", src);

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      sizeCache.set(src, null);
      return null;
    }

    const metadata = await sharp(filePath).metadata();
    if (!metadata.width || !metadata.height) {
      sizeCache.set(src, null);
      return null;
    }

    const size = { width: metadata.width, height: metadata.height };
    sizeCache.set(src, size);
    return size;
  } catch {
    sizeCache.set(src, null);
    return null;
  }
}

// ツリーを深さ優先で巡回する共通ヘルパー
function walk(node, visitor, parent = null) {
  visitor(node, parent);

  if (!node || typeof node !== "object" || !Array.isArray(node.children)) {
    return;
  }

  for (const child of node.children) {
    walk(child, visitor, node);
  }
}

// <p><img ... />{ .foo .bar }</p> のような記法を解釈して img に class を付与する
function applyMarkdownImageClassExtensions(tree) {
  walk(tree, (node) => {
    if (!node || node.type !== "element" || node.tagName !== "p") {
      return;
    }

    if (!Array.isArray(node.children) || node.children.length < 2) {
      return;
    }

    const nextChildren = [];

    for (let i = 0; i < node.children.length; i += 1) {
      const child = node.children[i];
      const next = node.children[i + 1];

      if (
        child?.type === "element" &&
        child.tagName === "img" &&
        next?.type === "text"
      ) {
        const classNames = parseClassExtension(next.value ?? "");
        if (classNames.length > 0) {
          const properties = child.properties ?? {};
          mergeClasses(properties, classNames);
          child.properties = properties;
          nextChildren.push(child);
          i += 1;
          continue;
        }
      }

      nextChildren.push(child);
    }

    node.children = nextChildren;
  });
}

// 画像ノードへ共通デフォルトを付与し、必要なら width/height を補完する
async function applyImageDefaults(tree) {
  const tasks = [];

  walk(tree, (node) => {
    if (!node || node.type !== "element" || node.tagName !== "img") {
      return;
    }

    const properties = node.properties ?? {};

    if (!properties.loading) {
      properties.loading = "lazy";
    }

    if (!properties.decoding) {
      properties.decoding = "async";
    }

    node.properties = properties;

    const publicSrc = normalizePublicImagePath(properties.src);
    if (!publicSrc) {
      return;
    }

    if (properties.width && properties.height) {
      return;
    }

    tasks.push(
      getPublicImageSize(publicSrc).then((size) => {
        if (!size) {
          return;
        }

        if (!properties.width) {
          properties.width = size.width;
        }

        if (!properties.height) {
          properties.height = size.height;
        }
      }),
    );
  });

  await Promise.all(tasks);
}

// Markdown 画像向け rehype プラグイン本体
export default function rehypeMarkdownImages() {
  return async function transformer(tree) {
    // クラス拡張を適用
    applyMarkdownImageClassExtensions(tree);
    // loading/decoding とサイズ補完を適用
    await applyImageDefaults(tree);
  };
}

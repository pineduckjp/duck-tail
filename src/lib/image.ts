import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import sharp from "sharp";

// 同じ画像のメタデータを何度も読まないためのキャッシュ
const sizeCache = new Map<string, { width: number; height: number } | null>();

// public 配下として扱える src を正規化する
// 例: /img/a.png?v=1#top -> /img/a.png
function normalizePublicImagePath(src: string): string | null {
  if (!src.startsWith("/")) {
    return null;
  }

  const cleanSrc = src.split("?")[0]?.split("#")[0] ?? "";
  if (!cleanSrc) {
    return null;
  }

  return decodeURI(cleanSrc);
}

// public 配下画像の実寸を取得する
// 取得できない場合は null を返し、呼び出し側で安全にスキップできるようにする
export async function getPublicImageSize(src: string) {
  const normalizedSrc = normalizePublicImagePath(src);
  if (!normalizedSrc) {
    return null;
  }

  if (sizeCache.has(normalizedSrc)) {
    return sizeCache.get(normalizedSrc) ?? null;
  }

  const filePath = path.join(process.cwd(), "public", normalizedSrc);

  try {
    // 画像ファイル以外や存在しないパスを早期に除外
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      sizeCache.set(normalizedSrc, null);
      return null;
    }

    // sharp から画像メタデータを取得し、width/height が揃う場合のみ採用
    const metadata = await sharp(filePath).metadata();
    if (!metadata.width || !metadata.height) {
      sizeCache.set(normalizedSrc, null);
      return null;
    }

    // 成功した結果をキャッシュして再利用
    const size = { width: metadata.width, height: metadata.height };
    sizeCache.set(normalizedSrc, size);
    return size;
  } catch {
    // 読み取り失敗時もキャッシュして同じ失敗の再試行を抑える
    sizeCache.set(normalizedSrc, null);
    return null;
  }
}

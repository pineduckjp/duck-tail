import { getCollection, type CollectionEntry } from "astro:content";

export type TailArticle = CollectionEntry<"tail">;
export type TailCategory = CollectionEntry<"categories">;

// 全ての公開記事を取得
export async function getAllArticles(): Promise<TailArticle[]> {
  const allArticles = (await getCollection("tail")) as TailArticle[];
  const publishedArticles = allArticles
    .filter((article) => article.data.published)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  return publishedArticles;
}

// 全てのカテゴリーを取得
export async function getAllCategories(
  articles: TailArticle[],
): Promise<TailCategory[]> {
  const allCategories = (await getCollection("categories")) as TailCategory[];
  const sortedCategories = allCategories.sort(
    (a, b) => a.data.order - b.data.order,
  );
  const usedCategoryIds = new Set(articles.map((a) => a.data.category.id));
  return sortedCategories.filter((c) => usedCategoryIds.has(c.id));
}

// 記事のURLを取得
export function getTailArticlePath(article: TailArticle): string {
  return "/" + article.data.slug + "/";
}

// slugの重複をチェック
export function checkUniqueTailSlugs(articles: TailArticle[]): void {
  const slugToIds = new Map<string, string[]>();

  for (const article of articles) {
    const slug = article.data.slug;
    const ids = slugToIds.get(slug) ?? [];
    ids.push(article.id);
    slugToIds.set(slug, ids);
  }

  const duplicates = [...slugToIds.entries()].filter(
    ([, ids]) => ids.length > 1,
  );

  if (duplicates.length === 0) return;

  const detail = duplicates
    .map(([slug, ids]) => `- ${slug}: ${ids.join(", ")}`)
    .join("\n");
  throw new Error(`記事のslugが重複しています。すべてのslugはグローバルで一意である必要があります。
------
${detail}
------`);
}

// slugとカテゴリーIDの衝突をチェック
export function checkSlugCategoryConflicts(
  articles: TailArticle[],
  categories: TailCategory[],
): void {
  const categoryIds = new Set(categories.map((category) => category.id));
  const conflicts = articles
    .filter((article) => categoryIds.has(article.data.slug))
    .map((article) => article.data.slug);
  if (conflicts.length === 0) return;

  const detail = conflicts.map((slug) => "- " + slug).join("\n");
  throw new Error(
    `記事slugとカテゴリーIDが衝突しています。以下の値は /slug/ と /category/ で競合します。
------
${detail}
------`,
  );
}

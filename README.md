# アヒルのしっぽ

アヒルのしっぽは、[PineDuck](https://pineduck.jp/)が不定期で更新しているブログです。

- [アヒルのしっぽへ](https://duck-tail.pineduck.jp/)

## 技術仕様

- **ホスティング**: [Cloudflare Workers](https://www.cloudflare.com/products/workers/)
- **フレームワーク**: [Astro](https://astro.build/)
- **言語**: TypeScript, Astro, Markdown
- **パッケージマネージャー**: npm

## 構成

```text
duck-tail/
├── .github/
│   ├── pull_request_template.md
│   ├── workflows/
│   │   ├── test.yml
│   │   ├── deploy-preview.yml
│   │   └── deploy-production.yml
│   └── ISSUE_TEMPLATE/
│       ├── fix.md
│       └── feat.md
├── docs/
|   ├── images/
|   │   └── *.webp
|   └── sprites.md
├── public/
|   ├── favicon.svg
|   ├── fonts/
|   │   └── *.woff2
|   ├── icons/
|   │   └── *.webp
|   ├── images/
│   │   ├── **/*.webp
|   │   └── *.webp
|   └── sprites/
|       └── symbol/
|           ├── *.json
|           └── *.webp
├── scripts/
|   └── aseprite-to-css.ts
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   │   ├── AllArticleListLayout.astro
│   │   ├── CategoryArticleListLayout.astro
│   │   ├── ArticleLayout.astro
│   │   └── NotFoundLayout.astro
│   ├── lib/
│   │   └── tail.ts
│   ├── pages/
│   │   ├── [category]/
│   │   │   └── [...page].astro
│   │   ├── [slug].astro
│   │   ├── 404.astro
│   │   ├── index.astro
│   │   └── rss.xml.js
│   ├── styles/
│   │   ├── all-article-list.css
|   |   ├── article.css
│   │   ├── category-article-list.css
│   │   ├── footer.css
│   │   ├── global.css
│   │   ├── not-found.css
│   │   └── sprites-symbols.css
│   └── types/
│       └── breadcrumb.ts
├── .gitignore
├── .prettierrc.mjs
├── eslint.config.mjs
├── stylelint.config.mjs
├── astro.config.mjs
├── README.md
├── CONTRIBUTING.md
├── package.json
├── tsconfig.json
└── wrangler.jsonc
```

### レイアウト

- `AllArticleList`: 記事一覧ページのレイアウト
- `AllCategoryList`: カテゴリー別記事一覧ページのレイアウト
- `Article`: 記事ページのレイアウト

### カテゴリ

- `pineduck`: PineDuckに関する記事
- `development`: 開発に関する記事
- `art`: 美術に関する記事
- `cooking`: 料理に関する記事
- `farm`: 農に関する記事
- `poem`: その他の考え事などをまとめた記事

## セットアップ

### 必須環境

- Node.js 22.12.0 以上
- npm 10 以上

### インストール

```bash
git clone https://github.com/pineduckjp/duck-tail.git
cd duck-tail
npm install
```

## 開発ワークフロー

### ローカル開発

```bash
npm run dev
```

`http://localhost:4321` でサーバーが起動します。

### ビルド・プレビュー

```bash
# 本番ビルド
npm run build

# デプロイ前確認
npm run preview
```

### CI / CD

- develop 向け PR 作成時に GitHub Actions の `test.yml` が `npm run check` を実行します。
- develop へマージされると `deploy-preview.yml` が `npm run build` の成果物を使って `npx wrangler versions upload` を実行します。
- main へマージされると `deploy-production.yml` が `npm run build` の成果物を使って本番デプロイを実行します。

## コマンド

ルートディレクトリで、以下のコマンドを実行できます。

| Command                   | Action                                        |
| :------------------------ | :-------------------------------------------- |
| `npm install`             | 依存関係をインストール                        |
| `npm run dev`             | `localhost:4321`で開発サーバーを開始          |
| `npm run build`           | ビルド結果を`./dist/`に出力                   |
| `npm run preview`         | デプロイ前にビルド結果をプレビュー            |
| `npm run astro ...`       | `astro add`, `astro check` を実行する時に使用 |
| `npm run astro -- --help` | Astro CLI のヘルプを参照                      |

## 貢献

このプロジェクトへの貢献に興味がある場合は、[CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

## ドキュメント

- [スプライトの使用](./docs/sprites.md)

# 貢献

このドキュメントでは、このプロジェクトへの貢献方法を説明します。

## 大前提

ブランチの`<type>`によって、作業の流れが異なります。

`<type>` は以下のいずれかを指定してください。

- `feat`: 機能追加
- `fix`: バグ修正
- `docs`: ドキュメント関連
- `style`: コードのフォーマット修正・コメント追加・画面の見た目の修正(機能に関わらない変更)
- `refactor`: コード構造の改善
- `config`: 設定ファイルの変更
- `post`: 記事の追加・修正
- `test`: テストコードの追加・修正(存在する場合)
- `ci`: CI/CD 設定の変更

あらかじめ、Milestone を作成してください。Milestone は、機能カテゴリーとして使用します。`<all-article-list>`のように、ハイフン区切りで作成してください。

## 開発の流れ

### 1. Issue 作成（機能追加 / バグ修正）

`<type>` が `feat` または `fix` の場合、Issue を作成してください。それ以外の(機能に関わる編集を行っていない)場合は、Issue 作成は不要です。

Issue 作成時に、テンプレートを使用してください。

- **機能追加**: [feat.md](./.github/ISSUE_TEMPLATE/feat.md)
- **バグ修正**: [fix.md](./.github/ISSUE_TEMPLATE/fix.md)

### 2. 作業開始

1.  ブランチ作成: `<type>/issue-<issue-id>-<milestone-name>`
2.  ブランチへ移動: git checkout `<branch-name>`
3.  コード編集: 時々 `npm run check:quick` を実行して、コードの整合性を確認
4.  ローカルチェック: `npm run check`が通ることを確認
5.  コミット
6.  push

コミットメッセージは、[Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/) を参考にしてください。

```text
<type>: <commit-message>

Issue #<issue-id>
```

このようなコミットメッセージを作成してください。

```text
feat: 全記事一覧レイアウトの作成

Issue #1
```

Issue を作成していない場合は、`Issue #<issue-id>` の記載は不要です。

```text
docs: README.md の更新
```

過去の実装に対する破壊的な変更を行った場合は、`<type>!: <commit-message>` のように、`!` を付与してください。

```text
refactor!: 記事ページのレイアウトを変更
```

### 3. develop ブランチへマージ

1. PR 作成: `Issue #<issue-id>`を記載(Issue を作成していない場合は不要)
2. CIチェック: `npm run check` が通ることを確認
3. レビュー・承認
4. マージ
5. Cloudflare Workers プレビュー自動デプロイ実行

PR 作成時に、テンプレートを使用してください。

- [PR テンプレート](/.github/pull_request_template.md)

### 4. プレビュー確認

1. Cloudflare Workers プレビューを目視で動作確認
2. 問題なし → 次へ

### 5. main ブランチへマージ

1. PR 作成: `Closes #<issue-id>` を記載(Issue を作成していない場合は不要)
2. レビュー・承認
3. マージ
4. Cloudflare Workers 本番自動デプロイ実行

作業ブランチは、マージ後に削除してください。

### 6. 本番確認

1. `https://duck-tail.pineduck.jp` を確認
2. 目視で動作確認
3. Issue 自動クローズ

🎉 完了

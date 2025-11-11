# svelte-template

SvelteKit minimal template with TypeScript, Prettier, ESLint, Vitest, TailwindCSS, and Paraglide (i18n) support.

## 🎯 プロジェクト

このテンプレートには**イベント日程調整ツール**が含まれています：

- 📅 複数の候補日から最適な日程を調整
- 🔗 共有URLで簡単に参加者を招待
- 📊 リアルタイムの集計結果表示
- 💾 Supabase (PostgreSQL + Edge Functions) バックエンド
- 🌐 GitHub Pages でホスティング

詳細なセットアップ手順は [SETUP.md](SETUP.md) を参照してください。

## 🚀 GitHub Pages デプロイ

このプロジェクトはGitHub Pagesで自動デプロイされるように設定されています。

## 📦 自動リリース

このプロジェクトは [Release Please](https://github.com/googleapis/release-please) を使用して、自動バージョニングとCHANGELOG生成を行います。

### 動作の仕組み

1. **Conventional Commits形式でコミット**:
   ```bash
   git commit -m "feat: 新機能を追加"
   git commit -m "fix: バグを修正"
   git commit -m "docs: ドキュメントを更新"
   ```

2. **Release Pleaseが自動的に**:
   - コミットメッセージに基づいてRelease PRを作成
   - `app/package.json`のバージョンを更新
   - `CHANGELOG.md`を生成
   - タグ付きのGitHubリリースを作成

### コミットタイプ

- `feat:` - 新機能（マイナーバージョンアップ）
- `fix:` - バグ修正（パッチバージョンアップ）
- `docs:` - ドキュメント変更
- `style:` - コードスタイル変更
- `refactor:` - リファクタリング
- `test:` - テスト追加・修正
- `chore:` - その他の変更
- `BREAKING CHANGE:` - 破壊的変更（メジャーバージョンアップ）

### GitHubリポジトリ設定が必要

Release Pleaseを有効にするには、リポジトリ設定で以下を設定してください：

1. **Settings** → **Actions** → **General** に移動
2. **Workflow permissions** で：
   - ✅ **Read and write permissions** を選択
   - ✅ **Allow GitHub Actions to create and approve pull requests** にチェック

### セットアップ手順

1. **GitHubリポジトリの設定**
   - リポジトリの Settings > Pages に移動
   - Source を "GitHub Actions" に設定

2. **自動デプロイ**
   - `main` ブランチにプッシュすると自動的にデプロイされます
   - GitHub Actions ワークフローが実行され、ビルドとデプロイが行われます

3. **手動デプロイ**
   - GitHub の Actions タブから "Deploy to GitHub Pages" ワークフローを手動実行できます

## 💻 開発環境のセットアップ

### Dev Container での開発（推奨）

このプロジェクトはDev Container対応済みです。VS CodeとDockerがあれば、すぐに開発を始められます。

```bash
# 1. リポジトリをクローン
git clone https://github.com/[ユーザー名]/svelte-template.git
cd svelte-template

# 2. VS Codeで開く
code .

# 3. VS Codeで「Dev Container: Reopen in Container」を実行
# （コマンドパレット: Ctrl+Shift+P / Cmd+Shift+P）
```

Dev Containerには以下が自動で設定されます：
- Node.js 22
- 必要なVS Code拡張機能（Svelte、Prettier、ESLint、TailwindCSS）
- ポート転送（5173番ポート）

### Supabase Cloud セットアップ

このプロジェクトはバックエンドサービスにSupabase Cloudを使用しています。開発環境をセットアップするには以下の手順に従ってください：

```bash
# 1. 環境設定ファイルをコピー
cd app
cp env.example .env.local

# 2. https://app.supabase.com で新しいSupabaseプロジェクトを作成
# 3. プロジェクトURLとanon keyを .env.local にコピー：
#    VITE_SUPABASE_URL=https://your-project-id.supabase.co
#    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
# 4. Supabaseにログイン（SUPABASE_ACCESS_TOKENが設定されている場合はスキップ）
npx supabase login
# 5. Supabaseプロジェクトをリンク
npx supabase link --project-ref <project_id>
# 6. データベースマイグレーションを適用（appディレクトリから）
npm run supabase:db:push
# 7. Edge Functionsをデプロイ
npm run supabase:functions:deploy
```

### データベース管理

**データのみをリセット（スキーマは保持）:**

スキーマを保持したままデータベースのすべてのデータを削除するには、[Supabase SQL Editor](https://supabase.com/dashboard)で以下のSQLを実行してください：

```sql
TRUNCATE TABLE public.events CASCADE;
```

これにより、すべてのイベント、候補日、参加者、投票、リンクのデータが削除されます。

**スキーマとデータを完全にリセット:**

スキーマを含めてデータベースを完全にリセットするには：

```bash
npm run supabase:db:reset
```

⚠️ これはすべてを削除し、マイグレーションを最初から再適用します。

### ローカル開発

```bash
# 開発サーバーの起動
cd app
pnpm install
pnpm dev

# プロダクションビルド（GitHub Pages用）
pnpm run build:gh-pages
```

**注意**: `pnpm dev`コマンドには`--host 0.0.0.0`が自動で含まれているため、Dev ContainerやDocker環境からでも外部アクセスが可能です。

## 🌐 多言語対応

このプロジェクトはParaglideを使用して多言語対応されています：
- 英語 (en)
- 日本語 (ja)

メッセージファイルの編集：
- `app/messages/en.json` - 英語
- `app/messages/ja.json` - 日本語

デモページ：`/demo/paraglide`

## 🛠️ 技術スタック

- **フレームワーク**: SvelteKit
- **言語**: TypeScript
- **スタイリング**: TailwindCSS
- **国際化**: Paraglide
- **テスト**: Vitest + Playwright
- **リンター**: ESLint + Prettier
- **デプロイ**: GitHub Pages (Static Adapter)

# 日程調整ツール段階的実装

## フェーズ1: 環境準備とSupabase設定

### 1.1 Supabaseクライアント設定
- `@supabase/supabase-js` パッケージのインストール
- 環境変数ファイル（`.env.example`）の作成
- Supabaseクライアントの初期化（`src/lib/supabase.ts`）
- 型定義ファイルの作成（`src/lib/types/database.ts`）

### 1.2 データベーススキーマ
- `supabase/migrations/` ディレクトリの作成
- 初期マイグレーションファイル（`0001_init.sql`）の作成:
  - `events` テーブル
  - `options` テーブル
  - `participants` テーブル
  - `votes` テーブル
  - `links` テーブル
  - 必要なインデックス
  - RLSポリシー

## フェーズ2: フロントエンド基本機能

### 2.1 ルーティング構造
新しいページを `src/routes/scheduler/` 配下に作成:
- `/scheduler/create` - イベント作成ページ
- `/scheduler/s/[shareId]` - 共有ページ（参加者用）
- `/scheduler/e/[eventId]` - 管理ページ

### 2.2 共通コンポーネント
`src/lib/components/scheduler/` 配下に作成:
- `Calendar.svelte` - カレンダーUI（複数日選択）
- `VoteTable.svelte` - 出欠表（◯/△/×トグル）
- `StatsSummary.svelte` - 集計結果表示
- `ParticipantForm.svelte` - 参加者情報入力フォーム

### 2.3 イベント作成機能（`/create`）
- イベント名、メモ入力フォーム
- カレンダーUIで候補日選択（最大7日）
- ローカルストレージでの一時保存
- 作成後に管理URL・共有URLを表示

### 2.4 共有ページ（`/s/[shareId]`）
- イベント情報の表示
- 参加者ニックネーム入力
- 出欠表での投票（◯/△/×）
- 集計結果のリアルタイム表示
- `localStorage` での自己認証（`device_hash`, `participant_token`）
- 再訪時の自動復元と再編集機能

## フェーズ3: バックエンド（Supabase Edge Functions）

### 3.1 Edge Functions セットアップ
`supabase/functions/` ディレクトリの作成と設定:
- `deno.json` 設定ファイル
- 共通ユーティリティ（`_shared/utils.ts`）:
  - ID生成（base62）
  - ハッシュ化（admin_key）
  - エラーハンドリング

### 3.2 API実装
各エンドポイントを個別のEdge Functionとして実装:
- `create-event` - イベント作成
- `get-event` - イベント取得（共有ID経由）
- `upsert-participant` - 参加者登録/更新
- `submit-votes` - 投票送信
- `update-event` - イベント編集（管理者）
- `export-csv` - CSV エクスポート（管理者）

### 3.3 セキュリティ実装
- `admin_key` の Argon2 ハッシュ化
- `device_hash` 検証
- レート制限の設定
- CORS設定

## フェーズ4: 管理機能

### 4.1 管理ページ（`/e/[eventId]`）
- `admin_key` による認証
- イベント情報の編集
- 候補日の追加/削除/並び替え
- 参加者一覧と投票状況の表示
- CSVエクスポート機能
- イベント削除機能

## フェーズ5: CI/CD とデプロイ

### 5.1 GitHub Actions ワークフロー
`.github/workflows/` に追加:
- `db-migrate.yml` - DBマイグレーション
- `functions-deploy.yml` - Edge Functions デプロイ
- `housekeeping.yml` - 古いデータのクリーンアップ（月次）

### 5.2 既存デプロイワークフローの更新
- `deploy.yml` に環境変数の設定を追加
- Supabase情報の注入

### 5.3 シークレット設定ドキュメント
READMEに以下のシークレット設定手順を追加:
- `SUPABASE_PROJECT_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ACCESS_TOKEN`

## フェーズ6: UI/UX改善

### 6.1 スタイリング
- TailwindCSSでのレスポンシブデザイン
- ダークモード対応（オプション）
- アニメーション（トグル、フェードイン等）

### 6.2 アクセシビリティ
- キーボードナビゲーション
- aria属性の追加
- コントラスト比の確保

### 6.3 国際化（i18n）
既存のParaglide設定を活用:
- `messages/ja.json` に日本語メッセージ追加
- `messages/en.json` に英語メッセージ追加

## フェーズ7: テストと最適化

### 7.1 ユニットテスト
- コンポーネントのVitest テスト
- ユーティリティ関数のテスト

### 7.2 E2Eテスト
- Playwrightでの主要フロー確認
- イベント作成〜投票〜結果表示

### 7.3 パフォーマンス最適化
- 画像最適化
- バンドルサイズの確認
- レンダリング最適化

## 重要ファイル

- `app/src/lib/supabase.ts` - Supabaseクライアント
- `app/src/lib/types/database.ts` - DB型定義
- `app/src/routes/scheduler/` - 日程調整ツールのページ
- `app/src/lib/components/scheduler/` - 共通コンポーネント
- `supabase/migrations/0001_init.sql` - DBスキーマ
- `supabase/functions/` - Edge Functions
- `.github/workflows/` - CI/CDワークフロー


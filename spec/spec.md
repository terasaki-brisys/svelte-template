# イベント日程調整ツール（GitHub Actions + Supabase）仕様書

最終更新: 2025-11-07 (Asia/Tokyo)

## 目的

* GitHub Pages でホストする静的フロントエンド + Supabase（Free Tier）を使って、会員登録なしで使える日程調整ツールを“ほぼ運用費ゼロ”で提供する。
* GitHub Actions を用いて CI/CD（ビルド・デプロイ・DB マイグレーション・定期保守）を自動化する。

## 非目標（当面やらない）

* メール通知・外部カレンダー同期（Google/Microsoft 連携）
* SSO/ログイン必須の運用
* 支払い/課金

---

## コア体験（要件）

1. **イベント作成**: イベント名、詳細メモ、候補日（カレンダー UI から複数日）を入力して作成。
2. **URL 発行**: 作成時に、

   * 管理用 URL（編集・削除・エクスポート可）
   * 共有用 URL（参加者がアクセスして出欠入力）
     を同時発行。
3. **出欠入力**: 共有用 URL では、ニックネームを入力し、各候補日に **◯（行ける）/ △（調整可）/ ×（不可）** を選択して送信。
4. **再編集**: 同じブラウザで共有用 URL を再訪すると、自分のニックネームと出欠が復元され、再編集ができる。
5. **結果表示**: 候補日ごとの集計（◯/△/×の人数・割合）と、最適候補のハイライト表示。

---

## システム構成

* **API**: Supabase Edge Functions（Deno）。匿名キーで読み取り、管理操作は Edge Function 経由で実行。
* **DB**: Supabase Postgres + Row Level Security（RLS）
* **ストレージ**: なし（当面不要）
* **CI/CD**: GitHub Actions
* **ドメイン**: `*.github.io` もしくは独自ドメイン（任意）

### URL 体系

* 共有用: `https://<domain>/s/{share_id}`
* 管理用: `https://<domain>/e/{event_id}?k={admin_key}`
* 参加者自己編集（同端末）用: ブラウザ `localStorage` の自己認証トークン `participant_token` を利用

> `admin_key` は推測困難な 128bit 以上のランダム値。`share_id`/`event_id` は短縮 ID（例: base62 8〜10 桁）。

---

## データモデル（RDB）

```mermaid
erDiagram
  events ||--o{ options : has
  events ||--o{ links : has
  options ||--o{ votes : has
  participants ||--o{ votes : has

  events {
    uuid id PK
    text title
    text memo
    text admin_key  // ハッシュ保存
    text share_id   // 公開短縮ID（ユニーク）
    timestamptz created_at
    timestamptz updated_at
  }
  options {
    uuid id PK
    uuid event_id FK
    date date  // 候補日
    int sort_index
    timestamptz created_at
  }
  participants {
    uuid id PK
    uuid event_id FK
    text nickname
    text device_hash // 匿名本人識別用（localStorage で保持）
    timestamptz created_at
    timestamptz updated_at
  }
  votes {
    uuid id PK
    uuid event_id FK
    uuid option_id FK
    uuid participant_id FK
    smallint value // 2=◯,1=△,0=×
    timestamptz created_at
    timestamptz updated_at
    unique(option_id, participant_id)
  }
  links {
    uuid id PK
    uuid event_id FK
    text kind // 'admin' | 'share'
    text token // 実体（admin_key or share_id）
  }
```

### インデックス

* `options(event_id, date)`
* `participants(event_id, device_hash)`
* `votes(event_id, option_id, participant_id)`
* `events(share_id)`

### 代表的制約

* `vote.value ∈ {0,1,2}`
* `participants.nickname` はイベント内ユニーク（重複時は自動で末尾に番号付与）

---

## セキュリティ & RLS 方針

* **匿名読み取り**: `events`/`options`/`votes`/`participants` は `share_id` 指定時のみ読み取り可。
* **書き込み**: すべて Edge Function 経由で行い、**サーバー側**で以下を検証：

  * 管理操作: `admin_key` のハッシュ照合
  * 参加者操作: `device_hash` と `participant_id` の整合性
* **保護**: `admin_key` は DB にはハッシュで保存（Argon2）。

#### 代表的 RLS（概念）

```sql
-- 例: 公開読み取り（共有URL 経由）
create policy "read by share_id" on events
  for select to anon
  using ( exists(
    select 1 from links
    where links.event_id = events.id and links.kind = 'share'
      and links.token = current_setting('request.jwt.claims.share_id', true)
  ));
```

> Edge Function が JWT に `share_id` を埋め込んで **読み取り専用**トークンを発行するアプローチ。

---

## API（Supabase Edge Functions）

**命名**: `/functions/v1/scheduler/*`

### 1) イベント作成 `POST /events`

* 入力: `title`, `memo`, `dates[]: YYYY-MM-DD`
* 出力: `{ event_id, admin_url, share_url }`
* 処理: 乱数生成（`event_id`, `share_id`, `admin_key`）、`admin_key` はハッシュ化して保存。

### 2) イベント取得（共有）`GET /events/:share_id`

* 出力: `event(title, memo, options[], aggregates)`

### 3) 参加者 upsert `POST /events/:share_id/participants`

* 入力: `nickname`, `participant_token?`, `device_hash`
* 出力: `{ participant_id, participant_token }`
* 備考: 同 `device_hash` で既存があれば再利用。ニックネーム衝突はサフィックス付与。

### 4) 投票 upsert `POST /events/:share_id/votes`

* 入力: `{ participant_id, votes: [{option_id, value}] }`
* 処理: `unique(option_id, participant_id)` を保ちながら bulk upsert。

### 5) 管理更新 `PATCH /events/:event_id`

* 認証: `admin_key`（ヘッダ）
* 入力: `title?`, `memo?`, `optionsPatch? (add/remove/reorder)`

### 6) エクスポート `GET /events/:event_id/export.csv`

* 認証: `admin_key`

### 7) 簡易統計 `GET /events/:share_id/stats`

* 出力: 候補日ごとに `sum(value==2) as ok, sum(value==1) as maybe, sum(value==0) as ng`

---

## フロントエンド要件（SPA）

* ページ: `Create`, `Share`, `Admin`, `Vote`
* カレンダー UI: 月表示で複数選択、祝日表示（ローカル計算）
* 出欠表: 行=参加者、列=候補日、3 状態トグル（◯/△/×）。
* 復元: `localStorage` に `{share_id, participant_token, device_hash}` を保存し自己レコードを取得。
* アクセシビリティ: キーボード操作、コントラスト、スクリーンリーダー向け aria。

---

## GitHub Actions（CI/CD）

### シークレット

* `SUPABASE_PROJECT_URL`
* `SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY`
* `SUPABASE_ACCESS_TOKEN`（`supabase functions deploy` 用）

### ワークフロー概要

1. **pages-deploy.yml**: `npm ci` → `build` → GitHub Pages へデプロイ
2. **db-migrate.yml**: `supabase db push`（schema.sql から）
3. **functions-deploy.yml**: Edge Functions を `prod` にデプロイ
4. **housekeeping.yml**: 月次で古いイベント（例: 180 日無操作）をアーカイブ/削除（無料枠節約）

> すべて `on: push` or `workflow_dispatch` or `schedule`。パブリックリポなら無料分で収まる想定。

---

## コスト想定（Free Tier 内）

* Supabase: 月 0 円（DB/帯域が閾値を超えない前提）
* GitHub Pages/Actions: パブリック repo で 0 円
* 独自ドメイン: なし。github pagesデフォルトURL

---

## エッジケース & バリデーション

* 候補日の最大数（例: 7 日）。
* ニックネームの長さ 16文字。
* 同一端末での複数名なりすまし対策: `device_hash` + レート制限（IP + share_id）。
* URL 流出対策: 管理 URL には **明示的に秘密**である旨の警告。
* データ保持: 180 日未更新で自動アーカイブ → さらに 180 日で削除。

---

## 実装スケッチ

* スキーマ定義: `supabase/migrations/0001_init.sql`
* Edge Functions: `functions/scheduler/*`
* Web: `web/` （Vite + Vue/React）

### 例: votes upsert（疑似コード）

```ts
// POST /events/:share_id/votes
const { participant_id, votes } = body
for (const v of votes) {
  upsert('votes', { event_id, option_id: v.option_id, participant_id, value: v.value })
}
return 200
```

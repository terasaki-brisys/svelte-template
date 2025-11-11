
# 🧩 Project Setup (Supabase + Vite)

本プロジェクトは **Supabase Cloud** をバックエンド、**GitHub Pages** をホスティングに利用する構成です。
各開発者は **自分専用の Supabase dev プロジェクト**を作成し、`.env.local` に接続情報を設定してください。

---

## 🚀 1. 前提ツール

| ツール          | バージョン例                    | 備考                     |
| ------------ | ------------------------- | ---------------------- |
| Node.js      | 20.x                      |                        |
| npm / pnpm   | 任意                        |                        |
| Vite         | v5 以降                     |                        |
| Supabase CLI | 最新版 (`npm i -g supabase`) | migration 確認や deploy 用 |

---

## 🧭 2. Supabase dev プロジェクトの作成

1. [Supabase Dashboard](https://app.supabase.com) にログイン
2. 「**New Project**」をクリック
3. 任意の名前（例: `yourname-dev`）を入力し、Regionを選択
4. プロジェクト作成後、以下を確認：

   * `Project URL`
   * `anon public key`

これらを `.env.local` に設定します。

---

## ⚙️ 3. `.env.local` の設定

プロジェクトルートに `.env.local` を作成し、以下を記述：

```env
# Supabase 接続設定
VITE_SUPABASE_URL=https://xxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...

# その他必要に応じて
# VITE_API_URL=https://example.com/api
```

> `.env.local` は Git 管理対象外（`.gitignore` に登録済み）です。
> チームメンバー同士で共有しないでください。

---

## 🧑‍💻 4. 開発環境の起動

```bash
# 依存インストール
npm install

# 開発サーバー起動
npm run dev
```

アクセス: [http://localhost:5173](http://localhost:5173)

---

## 🧪 5. データベース構造・マイグレーション

* Supabase の **SQL Editor** または CLI を使って migration を管理します。
* migration ファイルは `supabase/migrations` に格納されています。

```bash
# 新しいマイグレーションを作成
supabase migration new add_users_table

# ローカルDB（またはCloud dev）に反映
supabase db push
```

> すべての開発者が同じ migration フォルダを共有することで、
> 各自の dev プロジェクトが同一構造になります。

---

## 🔐 6. 認証設定（Auth）

1. Supabase Dashboard → **Authentication → URL Configuration**
2. 以下を Redirect URL に追加

   * `http://localhost:5173`
   * 本番用ドメイン（例: `https://yourname.github.io/yourapp/`）

---

## 🧱 7. 本番デプロイ（GitHub Pages）

```bash
npm run build
```

`dist/` フォルダが生成されます。
これを GitHub Pages にデプロイします（Actions または gh-pagesブランチ経由）。

> 本番用 `.env.production` には **本番Supabase URL / Key** を設定してください。

---

## 📘 8. 環境の使い分け

| 環境          | Supabase プロジェクト      | 用途            |
| ----------- | -------------------- | ------------- |
| local / 開発  | 各自の `yourname-dev`   | 日常開発用         |
| staging（任意） | チーム共通の `project-dev` | 動作確認・OAuth検証用 |
| production  | `project-prod`       | 本番運用          |

---

## 🧹 9. 開発ルール（推奨）

* DB変更は **直接操作せず migration 経由**で管理
* **RLS (Row Level Security)** は常に有効化
* **anon key** のみフロントに埋め込み、**service_role key** は絶対に使わない
* `.env.*` ファイルは Git 管理しない

---

## 📂 ディレクトリ構成例

```
.
├── src/
│   ├── main.ts
│   ├── components/
│   └── pages/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── .env.local
├── .env.production
├── vite.config.ts
└── package.json
```

---

## 💬 補足

* Supabase Cloud の無料枠で 1 プロジェクトまで無料です。
  必要に応じて dev / prod を2つ作成しても低コストで運用可能です。
* 本番リリース前には `.env.production` を見直して、
  認証URL・CORS設定が正しいことを確認してください。


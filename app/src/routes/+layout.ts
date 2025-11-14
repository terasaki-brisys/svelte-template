// すべてのページをプリレンダリングし、SSRを無効にする
// 開発環境ではプリレンダリングを無効にする
export const prerender = process.env.NODE_ENV === 'production';
export const ssr = false;

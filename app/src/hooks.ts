import { deLocalizeUrl, getUrlOrigin } from '$lib/paraglide/runtime';

export const reroute = ({ url }) => {
  // urlは文字列なので、絶対URLに変換してから処理
  const urlObj = typeof url === 'string' ? new URL(url, getUrlOrigin()) : url;
  return deLocalizeUrl(urlObj).pathname;
};

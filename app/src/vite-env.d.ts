/// <reference types="svelte" />
/// <reference types="vite/client" />
/// <reference types="@sveltejs/kit" />

// 念押し：.svelte をモジュールとして扱う宣言
declare module '*.svelte' {
  export { SvelteComponent as default } from 'svelte';
}

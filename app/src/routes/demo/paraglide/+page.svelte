<script lang="ts">
  import { base } from '$app/paths';
  import { setLocale } from '$lib/paraglide/runtime';
  import { m } from '$lib/paraglide/messages.js';
</script>

<div
  class="flex min-h-screen items-center justify-center bg-linear-to-br from-green-50 to-teal-100 p-4"
>
  <div class="mx-auto max-w-3xl">
    <div class="rounded-2xl bg-white p-8 shadow-xl md:p-12">
      <div class="mb-8 text-center">
        <h1 class="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
          🌐 <span class="text-green-600">多言語デモ</span>
        </h1>
        <p class="text-lg leading-relaxed text-gray-600">
          Paraglideを使用した国際化機能のデモンストレーション
        </p>
      </div>

      <div class="space-y-8">
        <!-- メッセージ表示エリア -->
        <div
          class="rounded-xl bg-linear-to-r from-green-500 to-teal-500 p-6 text-center text-white"
        >
          <h2 class="tebg-linear-to-r mb-2">
            {m.hello_world({ name: 'SvelteKit User' })}
          </h2>
          <p class="text-green-100">言語を切り替えてメッセージの変化を確認してください</p>
        </div>

        <!-- 言語切り替えボタン -->
        <div class="rounded-xl bg-gray-50 p-6">
          <h3 class="mb-4 text-center text-xl font-semibold text-gray-800">言語を選択</h3>
          <div class="flex justify-center gap-4">
            <button
              onclick={() => setLocale('en')}
              class="flex items-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-md transition-colors duration-200 hover:bg-blue-700 hover:shadow-lg"
            >
              🇺🇸 English
            </button>
            <button
              onclick={() => setLocale('ja')}
              class="flex items-center rounded-lg bg-red-600 px-6 py-3 font-medium text-white shadow-md transition-colors duration-200 hover:bg-red-700 hover:shadow-lg"
            >
              🇯🇵 日本語
            </button>
          </div>
        </div>

        <!-- 開発者向け情報 -->
        <div class="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
          <div class="flex items-start">
            <div class="shrink-0">
              <svg
                class="h-6 w-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="ml-3">
              <h4 class="mb-2 text-lg font-medium text-yellow-800">💡 開発者向けヒント</h4>
              <p class="leading-relaxed text-yellow-700">
                VSCodeをお使いの場合は、
                <a
                  href="https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension"
                  target="_blank"
                  class="font-medium text-yellow-800 underline hover:text-yellow-900"
                >
                  Sherlock i18n extension
                </a>
                をインストールすると、より良い国際化開発体験が得られます。
              </p>
            </div>
          </div>
        </div>

        <!-- ナビゲーション -->
        <div class="flex items-center justify-between border-t border-gray-200 pt-6">
          <a
            href="{base}/demo"
            class="inline-flex items-center px-4 py-2 text-gray-600 transition-colors duration-200 hover:text-gray-800"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            デモページに戻る
          </a>
          <a
            href="{base}/"
            class="inline-flex items-center px-4 py-2 text-indigo-600 transition-colors duration-200 hover:text-indigo-800"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            ホーム
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

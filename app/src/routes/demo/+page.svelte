<script>
  import { base } from '$app/paths';
</script>

<div
  class="flex min-h-screen items-center justify-center bg-linear-to-br from-purple-50 to-pink-100 p-4"
>
  <div class="mx-auto max-w-2xl text-center">
    <div class="rounded-2xl bg-white p-8 shadow-xl md:p-12">
      <div class="mb-8">
        <h1 class="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
          <span class="text-purple-600">Demo</span> ページ
        </h1>
        <p class="text-lg leading-relaxed text-gray-600">
          SvelteKitの機能をデモンストレーションするページです
        </p>
      </div>

      <div class="space-y-6">
        <div class="rounded-xl bg-linear-to-r from-purple-500 to-pink-500 p-6 text-white">
          <h2 class="mb-3 text-2xl font-semibold">利用可能なデモ</h2>
          <p class="text-purple-100">以下のデモをお試しください</p>
        </div>

        <div class="grid gap-4">
          <a
            href="{base}/demo/paraglide"
            class="group block rounded-xl border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 p-6 transition-all duration-200 hover:border-blue-300 hover:shadow-lg"
          >
            <div class="flex items-center justify-between">
              <div class="text-left">
                <h3 class="text-xl font-semibold text-blue-900 group-hover:text-blue-700">
                  🌐 多言語デモ
                </h3>
                <p class="mt-2 text-blue-600">
                  Paraglideを使用した国際化機能のデモンストレーション
                </p>
              </div>
              <svg
                class="h-6 w-6 text-blue-500 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </a>
        </div>

        <div class="mt-8 border-t border-gray-200 pt-6">
          <a
            href="{base}/"
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
            ホームに戻る
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

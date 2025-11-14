<script lang="ts">
  import { page } from '$app/stores';
  import { base } from '$app/paths';
</script>

<div
  class="flex min-h-screen items-center justify-center bg-linear-to-br from-red-50 to-orange-100 p-4"
>
  <div class="mx-auto max-w-2xl text-center">
    <div class="rounded-2xl bg-white p-8 shadow-xl md:p-12">
      <div class="mb-8">
        <div class="mb-6 flex justify-center">
          <div
            class="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-600"
          >
            <svg
              class="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h1 class="mb-4 text-6xl font-bold text-gray-900">
          {$page.status}
        </h1>
        <h2 class="mb-4 text-2xl font-semibold text-gray-800 md:text-3xl">
          {#if $page.status === 404}
            ページが見つかりません
          {:else}
            エラーが発生しました
          {/if}
        </h2>
        <p class="text-lg leading-relaxed text-gray-600">
          {#if $page.status === 404}
            お探しのページは存在しないか、移動された可能性があります。
          {:else if $page.error?.message}
            {$page.error.message}
          {:else}
            予期しないエラーが発生しました。
          {/if}
        </p>
      </div>

      <div class="space-y-4">
        <a
          href="{base}/"
          class="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white shadow-md transition-colors duration-200 hover:bg-indigo-700 hover:shadow-lg"
        >
          <svg
            class="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          ホームに戻る
        </a>

        <div class="flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="{base}/scheduler"
            class="inline-flex items-center rounded-lg border border-purple-300 px-4 py-2 font-medium text-purple-700 transition-colors duration-200 hover:bg-purple-50"
          >
            Scheduler
          </a>
          <a
            href="{base}/demo"
            class="inline-flex items-center rounded-lg border border-indigo-300 px-4 py-2 font-medium text-indigo-700 transition-colors duration-200 hover:bg-indigo-50"
          >
            デモページ
          </a>
        </div>
      </div>

      <div class="mt-8 border-t border-gray-200 pt-6">
        <p class="text-sm text-gray-500">
          問題が解決しない場合は、管理者にお問い合わせください。
        </p>
      </div>
    </div>
  </div>
</div>


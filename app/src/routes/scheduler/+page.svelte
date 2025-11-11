<script lang="ts">
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { getCreatedEvents, removeCreatedEvent, type CreatedEventStorage } from '$lib/utils/storage';

  let myEvents = $state<CreatedEventStorage[]>([]);

  onMount(() => {
    myEvents = getCreatedEvents();
  });

  const handleRemoveEvent = (eventId: string) => {
    if (confirm('この履歴を削除しますか？（イベント自体は削除されません）')) {
      removeCreatedEvent(eventId);
      myEvents = getCreatedEvents();
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
</script>

<div class="container mx-auto px-4 py-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-4xl font-bold mb-4">日程調整ツール</h1>
    <p class="text-xl text-gray-600 mb-8">
      シンプルで使いやすい日程調整ツールです。
    </p>

    <div class="grid gap-6 md:grid-cols-2 mb-8">
      <a
        href="{base}/scheduler/create"
        class="block p-6 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition"
      >
        <h2 class="text-2xl font-bold mb-2">新しいイベントを作成</h2>
        <p class="text-gray-600">
          日程調整が必要なイベントを作成して、参加者に共有しましょう。
        </p>
      </a>

      <div class="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h2 class="text-2xl font-bold mb-2">使い方</h2>
        <ul class="text-gray-600 space-y-2">
          <li>1. イベント名と候補日を入力</li>
          <li>2. 生成された共有URLを参加者に送信</li>
          <li>3. 参加者が出欠を入力</li>
          <li>4. 最適な日程を確認</li>
        </ul>
      </div>
    </div>

    <!-- My Created Events -->
    {#if myEvents.length > 0}
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
          <span class="text-orange-600">📋</span>
          作成したイベント
        </h2>
        <p class="text-sm text-gray-600 mb-4">
          このブラウザで作成したイベントの一覧です。管理ページへのリンクが表示されます。
        </p>

        <div class="space-y-3">
          {#each myEvents as event (event.eventId)}
            <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-lg truncate">{event.title}</h3>
                <p class="text-sm text-gray-500">
                  作成日: {formatDate(event.createdAt)}
                </p>
              </div>

              <div class="flex gap-2 shrink-0">
                <a
                  href={event.adminUrl}
                  class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm font-medium"
                  title="管理ページを開く"
                >
                  🔐 管理
                </a>
                <a
                  href={event.shareUrl}
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  title="共有ページを開く"
                >
                  📤 共有
                </a>
                <button
                  type="button"
                  onclick={() => handleRemoveEvent(event.eventId)}
                  class="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
                  title="履歴から削除"
                >
                  ×
                </button>
              </div>
            </div>
          {/each}
        </div>

        <p class="text-xs text-gray-500 mt-4">
          ※ この一覧はブラウザのlocalStorageに保存されています。ブラウザのデータを削除すると消えます。
        </p>
      </div>
    {/if}
  </div>
</div>


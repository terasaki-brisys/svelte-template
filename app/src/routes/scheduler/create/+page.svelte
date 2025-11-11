<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import Calendar from '$lib/components/scheduler/Calendar.svelte';
  import { createEvent, type CreateEventResponse } from '$lib/api/scheduler';
  import { saveCreatedEvent } from '$lib/utils/storage';
  import { PUBLIC_USE_MOCK_API } from '$env/static/public';
  
  const useMockApi = PUBLIC_USE_MOCK_API === 'true';
  
  let title = $state('');
  let memo = $state('');
  let selectedDates = $state<string[]>([]);
  let isSubmitting = $state(false);
  let error = $state('');
  let createdEvent = $state<CreateEventResponse | null>(null);
  
  const handleSubmit = async () => {
    error = '';
    
    // Validation
    if (!title.trim()) {
      error = 'イベント名を入力してください';
      return;
    }
    
    if (title.length > 200) {
      error = 'イベント名は200文字以内で入力してください';
      return;
    }
    
    if (selectedDates.length === 0) {
      error = '候補日を1つ以上選択してください';
      return;
    }
    
    if (selectedDates.length > 7) {
      error = '候補日は7日まで選択できます';
      return;
    }
    
    isSubmitting = true;
    
    try {
      const result = await createEvent({
        title: title.trim(),
        memo: memo.trim() || undefined,
        dates: selectedDates
      });
      
      createdEvent = result;
      
      // Save to localStorage for "My Events" list
      saveCreatedEvent({
        eventId: result.event_id,
        shareId: result.share_id,
        adminKey: result.admin_key,
        title: title.trim(),
        adminUrl: result.admin_url,
        shareUrl: result.share_url
      });
    } catch (err) {
      error = err instanceof Error ? err.message : 'イベントの作成に失敗しました';
      isSubmitting = false;
    }
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('URLをコピーしました');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const resetForm = () => {
    title = '';
    memo = '';
    selectedDates = [];
    isSubmitting = false;
    error = '';
    createdEvent = null;
  };
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <!-- Mock Mode Indicator -->
  {#if useMockApi}
    <div class="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-6">
      <p class="text-sm text-yellow-800">
        🧪 <strong>開発モード:</strong> モックAPIを使用しています（PUBLIC_USE_MOCK_API=true）
      </p>
    </div>
  {/if}
  
  {#if !createdEvent}
    <!-- Event Creation Form -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">イベント作成</h1>
      <p class="text-gray-600">日程調整が必要なイベントを作成しましょう</p>
    </div>
    
    <div class="space-y-6">
      <!-- Event Title -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <label for="title" class="block text-lg font-bold mb-2">
          イベント名
          <span class="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          bind:value={title}
          maxlength="200"
          placeholder="例: チーム飲み会"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-required="true"
        />
        <p class="mt-1 text-sm text-gray-500">
          {title.length} / 200 文字
        </p>
      </div>
      
      <!-- Event Memo -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <label for="memo" class="block text-lg font-bold mb-2">
          メモ（任意）
        </label>
        <textarea
          id="memo"
          bind:value={memo}
          rows="4"
          placeholder="例: 新宿駅周辺で、19時頃から"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>
      
      <!-- Date Selection -->
      <div class="bg-white rounded-lg border border-gray-200 p-6">
        <h2 class="text-lg font-bold mb-4">
          候補日を選択
          <span class="text-red-500">*</span>
        </h2>
        <Calendar bind:selectedDates={selectedDates} maxSelection={7} />
      </div>
      
      <!-- Error Message -->
      {#if error}
        <div class="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <p class="text-red-800">{error}</p>
        </div>
      {/if}
      
      <!-- Submit Button -->
      <div class="flex gap-4">
        <button
          type="button"
          onclick={handleSubmit}
          disabled={isSubmitting}
          class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-bold text-lg"
        >
          {isSubmitting ? '作成中...' : 'イベントを作成'}
        </button>
        <a
          href="{base}/scheduler"
          class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-center"
        >
          キャンセル
        </a>
      </div>
    </div>
  {:else}
    <!-- Success Screen -->
    <div class="text-center mb-8">
      <div class="inline-block p-4 bg-green-100 rounded-full mb-4">
        <svg class="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h1 class="text-3xl font-bold mb-2">イベントを作成しました！</h1>
      <p class="text-gray-600">以下のURLを参加者に共有してください</p>
    </div>
    
    <div class="space-y-6">
      <!-- Share URL -->
      <div class="bg-white rounded-lg border-2 border-blue-500 p-6">
        <h2 class="text-lg font-bold mb-2 flex items-center gap-2">
          <span class="text-blue-600">📤</span>
          共有用URL（参加者用）
        </h2>
        <p class="text-sm text-gray-600 mb-3">
          このURLを参加者に送ってください。参加者はこのURLから出欠を入力できます。
        </p>
        <div class="flex gap-2">
          <input
            type="text"
            value={createdEvent.share_url}
            readonly
            class="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
          />
          <button
            type="button"
            onclick={() => copyToClipboard(createdEvent!.share_url)}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
          >
            コピー
          </button>
        </div>
        <a
          href={createdEvent.share_url}
          class="inline-block mt-3 text-blue-600 hover:text-blue-700 text-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          共有ページを開く →
        </a>
      </div>
      
      <!-- Admin URL -->
      <div class="bg-white rounded-lg border-2 border-orange-500 p-6">
        <h2 class="text-lg font-bold mb-2 flex items-center gap-2">
          <span class="text-orange-600">🔐</span>
          管理用URL（あなた専用）
        </h2>
        <p class="text-sm text-gray-600 mb-3">
          このURLからイベントを編集・削除できます。<strong class="text-red-600">他の人に共有しないでください。</strong>
        </p>
        <div class="flex gap-2">
          <input
            type="text"
            value={createdEvent.admin_url}
            readonly
            class="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
          />
          <button
            type="button"
            onclick={() => copyToClipboard(createdEvent!.admin_url)}
            class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition whitespace-nowrap"
          >
            コピー
          </button>
        </div>
        <a
          href={createdEvent.admin_url}
          class="inline-block mt-3 text-orange-600 hover:text-orange-700 text-sm"
        >
          管理ページを開く →
        </a>
      </div>
      
      <!-- Warning -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p class="text-sm text-yellow-800">
          ⚠️ <strong>重要:</strong> 管理用URLはブックマークまたは安全な場所に保存してください。
          このURLを紛失すると、イベントの編集・削除ができなくなります。
        </p>
      </div>
      
      <!-- Actions -->
      <div class="flex gap-4">
        <button
          type="button"
          onclick={resetForm}
          class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          別のイベントを作成
        </button>
        <a
          href="{base}/scheduler"
          class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-center"
        >
          トップに戻る
        </a>
      </div>
    </div>
  {/if}
</div>


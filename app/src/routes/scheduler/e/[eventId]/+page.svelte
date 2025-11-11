<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import VoteTable from '$lib/components/scheduler/VoteTable.svelte';
  import StatsSummary from '$lib/components/scheduler/StatsSummary.svelte';
  import type { GetEventResponse, OptionStats, ParticipantWithVotes } from '$lib/types/database';
  import { VoteValue } from '$lib/types/database';
  import { getEventByEventId, deleteEvent } from '$lib/api/scheduler';
  import { removeCreatedEvent } from '$lib/utils/storage';

  const eventId = $derived($page.params.eventId);
  const adminKey = $derived($page.url.searchParams.get('k'));

  let loading = $state(true);
  let error = $state('');
  let eventData = $state<GetEventResponse | null>(null);
  let isDeleting = $state(false);

  // Load event data
  const loadEvent = async () => {
    if (!adminKey) {
      error = '管理キーが必要です。URLに ?k=<管理キー> を追加してください。';
      loading = false;
      return;
    }

    loading = true;
    error = '';

    try {
      eventData = await getEventByEventId(eventId, adminKey);
    } catch (err) {
      error = err instanceof Error ? err.message : 'イベントの読み込みに失敗しました';
    } finally {
      loading = false;
    }
  };

  // Delete event
  const handleDelete = async () => {
    if (!confirm('このイベントを削除してもよろしいですか？この操作は取り消せません。')) {
      return;
    }

    isDeleting = true;
    error = '';

    try {
      await deleteEvent(eventId, adminKey!);
      // Remove from localStorage
      removeCreatedEvent(eventId);
      alert('イベントを削除しました');
      goto(`${base}/scheduler`);
    } catch (err) {
      error = err instanceof Error ? err.message : 'イベントの削除に失敗しました';
      isDeleting = false;
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!eventData) return;

    // Create CSV content
    const header = ['参加者', ...eventData.options.map(o => {
      const date = new Date(o.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    })];

    const rows = eventData.participants.map(p => {
      const row = [p.nickname];
      eventData.options.forEach(o => {
        const vote = eventData.votes.find(v =>
          v.participant_id === p.id && v.option_id === o.id
        );
        const symbol = vote ?
          (vote.value === 2 ? '◯' : vote.value === 1 ? '△' : '×') :
          '-';
        row.push(symbol);
      });
      return row;
    });

    const csv = [header, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Download
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${eventData.event.title}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Copy share URL
  const copyShareUrl = async () => {
    if (!eventData) return;
    const shareUrl = `${window.location.origin}${base}/scheduler/s/${eventData.event.share_id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('共有URLをコピーしました');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Calculate stats
  const stats = $derived((): OptionStats[] => {
    if (!eventData) return [];

    return eventData.options.map(option => {
      const optionVotes = eventData.votes.filter(v => v.option_id === option.id);
      const yesCount = optionVotes.filter(v => v.value === VoteValue.YES).length;
      const maybeCount = optionVotes.filter(v => v.value === VoteValue.MAYBE).length;
      const noCount = optionVotes.filter(v => v.value === VoteValue.NO).length;

      return {
        option_id: option.id,
        date: option.date,
        yes_count: yesCount,
        maybe_count: maybeCount,
        no_count: noCount,
        total_votes: optionVotes.length
      };
    });
  });

  // Get participants with votes
  const participantsWithVotes = $derived((): ParticipantWithVotes[] => {
    if (!eventData) return [];

    return eventData.participants.map(p => ({
      ...p,
      event_id: eventData.event.id,
      device_hash: '',
      created_at: '',
      updated_at: '',
      votes: eventData.votes.filter(v => v.participant_id === p.id)
    }));
  });

  onMount(() => {
    // Check if admin key is provided
    if (!adminKey) {
      error = '管理キーが必要です';
      loading = false;
      return;
    }

    loadEvent();
  });
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  {#if loading}
    <div class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">読み込み中...</p>
    </div>
  {:else if error && !eventData}
    <div class="bg-red-50 border border-red-200 rounded-lg p-6" role="alert">
      <h2 class="text-lg font-bold text-red-800 mb-2">エラー</h2>
      <p class="text-red-700">{error}</p>
      <a
        href="{base}/scheduler"
        class="inline-block mt-4 text-blue-600 hover:text-blue-700"
      >
        トップに戻る
      </a>
    </div>
  {:else if eventData}
    <!-- Admin Header -->
    <div class="mb-8">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold mb-2 flex items-center gap-2">
            <span class="text-orange-600">🔐</span>
            {eventData.event.title}
          </h1>
          {#if eventData.event.memo}
            <p class="text-gray-600 whitespace-pre-wrap">{eventData.event.memo}</p>
          {/if}
        </div>
      </div>

      <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p class="text-sm text-yellow-800">
          ⚠️ これは管理ページです。イベントの編集・削除ができます。このURLは他の人に共有しないでください。
        </p>
      </div>
    </div>

    <!-- Error Message -->
    {#if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6" role="alert">
        <p class="text-red-800">{error}</p>
      </div>
    {/if}

    <!-- Action Buttons -->
    <div class="grid gap-4 md:grid-cols-3 mb-6">
      <button
        type="button"
        onclick={copyShareUrl}
        class="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
        共有URLをコピー
      </button>

      <button
        type="button"
        onclick={handleExportCSV}
        class="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        CSVエクスポート
      </button>

      <button
        type="button"
        onclick={handleDelete}
        disabled={isDeleting}
        class="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
        {isDeleting ? '削除中...' : 'イベント削除'}
      </button>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Left Column: Statistics -->
      <div class="space-y-6">
        <StatsSummary options={eventData.options} stats={stats()} />

        <!-- Event Info -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-bold mb-4">イベント情報</h3>
          <dl class="space-y-2 text-sm">
            <div class="flex justify-between">
              <dt class="text-gray-600">Share ID:</dt>
              <dd class="font-mono font-medium">{eventData.event.share_id}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">参加者数:</dt>
              <dd class="font-medium">{eventData.participants.length} 人</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">候補日数:</dt>
              <dd class="font-medium">{eventData.options.length} 日</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-600">作成日:</dt>
              <dd class="font-medium">{new Date(eventData.event.created_at).toLocaleString('ja-JP')}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Right Column: Votes Table -->
      <div class="space-y-6">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-bold mb-4">全員の出欠</h3>
          {#if participantsWithVotes().length > 0}
            <VoteTable
              options={eventData.options}
              participants={participantsWithVotes()}
              readonly={true}
            />
          {:else}
            <p class="text-gray-500 text-center py-8">
              まだ参加者がいません
            </p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Back Link -->
    <div class="mt-8 text-center">
      <a
        href="{base}/scheduler"
        class="inline-block text-blue-600 hover:text-blue-700"
      >
        ← トップに戻る
      </a>
    </div>
  {/if}
</div>


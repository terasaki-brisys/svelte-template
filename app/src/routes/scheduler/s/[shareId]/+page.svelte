<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import VoteTable from '$lib/components/scheduler/VoteTable.svelte';
  import StatsSummary from '$lib/components/scheduler/StatsSummary.svelte';
  import ParticipantForm from '$lib/components/scheduler/ParticipantForm.svelte';
  import {
    getEventByShareId,
    upsertParticipant,
    submitVotes,
    type GetEventResponse
  } from '$lib/api/scheduler';
  import {
    loadParticipantData,
    saveParticipantData,
    getOrCreateDeviceHash
  } from '$lib/utils/storage';
  import type { OptionStats, ParticipantWithVotes } from '$lib/types/database';
  import { VoteValue } from '$lib/types/database';
  import { PUBLIC_USE_MOCK_API } from '$env/static/public';

  const shareId = $derived($page.params.shareId);
  const useMockApi = PUBLIC_USE_MOCK_API === 'true';

  let loading = $state(true);
  let error = $state('');
  let eventData = $state<GetEventResponse | null>(null);
  let currentParticipantId = $state<string | null>(null);
  let currentNickname = $state('');
  let votes = $state<Map<string, number>>(new Map());
  let isSubmittingVotes = $state(false);
  let showParticipantForm = $state(true);
  let voteSubmitted = $state(false);

  // Load event data
  const loadEvent = async () => {
    loading = true;
    error = '';

    try {
      const data = await getEventByShareId(shareId);
      eventData = data;

      // Check if user has previously participated
      const storedData = loadParticipantData(shareId);
      if (storedData) {
        currentParticipantId = storedData.participantId;
        currentNickname = storedData.nickname;
        showParticipantForm = false;

        // Load user's current votes from event data
        if (eventData) {
          const userVotes = eventData.votes.filter(v => v.participant_id === storedData.participantId);
          votes = new Map(userVotes.map(v => [v.option_id, v.value]));
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'イベントの読み込みに失敗しました';
    } finally {
      loading = false;
    }
  };

  // Handle participant registration
  const handleParticipantSubmit = async (nickname: string) => {
    error = '';

    try {
      const deviceHash = getOrCreateDeviceHash();

      const result = await upsertParticipant(shareId, {
        nickname,
        device_hash: deviceHash
      });

      currentParticipantId = result.participant_id;
      currentNickname = result.nickname;
      showParticipantForm = false;

      // Save to localStorage
      saveParticipantData({
        shareId,
        participantId: result.participant_id,
        participantToken: result.participant_token,
        deviceHash,
        nickname: result.nickname,
        timestamp: Date.now()
      });
    } catch (err) {
      error = err instanceof Error ? err.message : '参加登録に失敗しました';
    }
  };

  // Handle vote submission
  const handleSubmitVotes = async () => {
    if (!currentParticipantId || isSubmittingVotes) return;

    error = '';
    isSubmittingVotes = true;

    try {
      const votesArray = Array.from(votes.entries()).map(([optionId, value]) => ({
        option_id: optionId,
        value
      }));

      await submitVotes(shareId, {
        participant_id: currentParticipantId,
        votes: votesArray
      });

      voteSubmitted = true;

      // Reload event data to see updated results
      setTimeout(() => {
        voteSubmitted = false;
        loadEvent();
      }, 2000);
    } catch (err) {
      error = err instanceof Error ? err.message : '投票の送信に失敗しました';
      isSubmittingVotes = false;
    } finally {
      // Keep button disabled briefly after success to prevent double-click
      if (!error) {
        setTimeout(() => {
          isSubmittingVotes = false;
        }, 1000);
      }
    }
  };

  // Calculate stats
  const stats = $derived((): OptionStats[] => {
    if (!eventData) return [];

    return eventData.options.map(option => {
      const optionVotes = eventData?.votes.filter(v => v.option_id === option.id) ?? [];
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
      votes: eventData.votes.filter(v => v.participant_id === p.id)
    }));
  });

  onMount(() => {
    loadEvent();
  });
</script>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  <!-- Mock Mode Indicator -->
  {#if useMockApi}
    <div class="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-6">
      <p class="text-sm text-yellow-800">
        🧪 <strong>開発モード:</strong> モックAPIを使用しています（PUBLIC_USE_MOCK_API=true）
      </p>
    </div>
  {/if}

  {#if loading}
    <div class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="mt-4 text-gray-600">読み込み中...</p>
    </div>
  {:else if error && !eventData}
    <div class="bg-red-50 border border-red-200 rounded-lg p-6" role="alert">
      <h2 class="text-lg font-bold text-red-800 mb-2">エラー</h2>
      <p class="text-red-700">{error}</p>
    </div>
  {:else if eventData}
    <!-- Event Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">{eventData.event.title}</h1>
      {#if eventData.event.memo}
        <p class="text-gray-600 whitespace-pre-wrap">{eventData.event.memo}</p>
      {/if}
    </div>

    <!-- Success Message -->
    {#if voteSubmitted}
      <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6" role="alert">
        <p class="text-green-800">✓ 投票を送信しました</p>
      </div>
    {/if}

    <!-- Error Message -->
    {#if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6" role="alert">
        <p class="text-red-800">{error}</p>
      </div>
    {/if}

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Left Column: Participation -->
      <div class="space-y-6">
        {#if showParticipantForm}
          <!-- Participant Form -->
          <ParticipantForm onSubmit={handleParticipantSubmit} />

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="font-bold mb-2">💡 使い方</h3>
            <ol class="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>ニックネームを入力して参加</li>
              <li>各候補日の出欠を選択（◯/△/×）</li>
              <li>投票を送信</li>
              <li>集計結果を確認</li>
            </ol>
          </div>
        {:else}
          <!-- Vote Submission -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h2 class="text-lg font-bold">あなたの出欠</h2>
                <p class="text-sm text-gray-600">参加者: {currentNickname}</p>
              </div>
              <button
                type="button"
                onclick={() => { showParticipantForm = true; currentParticipantId = null; }}
                class="text-sm text-blue-600 hover:text-blue-700"
              >
                別の名前で参加
              </button>
            </div>

            <VoteTable
              options={eventData.options}
              bind:votes={votes}
              currentParticipantId={currentParticipantId}
              readonly={false}
            />

            <button
              type="button"
              onclick={handleSubmitVotes}
              disabled={isSubmittingVotes || votes.size === 0}
              class="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-bold flex items-center justify-center gap-2"
            >
              {#if isSubmittingVotes}
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>送信中...</span>
              {:else}
                <span>投票を送信</span>
              {/if}
            </button>
          </div>
        {/if}
      </div>

      <!-- Right Column: Results -->
      <div class="space-y-6">
        <!-- Stats Summary -->
        <StatsSummary options={eventData.options} stats={stats()} />

        <!-- All Participants Votes -->
        {#if participantsWithVotes().length > 0}
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-bold mb-4">全員の出欠</h3>
            <VoteTable
              options={eventData.options}
              participants={participantsWithVotes()}
              readonly={true}
            />
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>


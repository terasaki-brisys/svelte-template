<script lang="ts">
  import type { Option, ParticipantWithVotes, Vote } from '$lib/types/database';
  import { VoteValue } from '$lib/types/database';
  
  interface Props {
    options: Option[];
    participants?: ParticipantWithVotes[];
    currentParticipantId?: string;
    votes?: Map<string, number>; // optionId -> value
    readonly?: boolean;
    onVoteChange?: (optionId: string, value: number) => void;
  }
  
  let {
    options,
    participants = [],
    currentParticipantId,
    votes = $bindable(new Map()),
    readonly = false,
    onVoteChange
  }: Props = $props();
  
  // Vote symbols
  const voteSymbols = {
    [VoteValue.YES]: '◯',
    [VoteValue.MAYBE]: '△',
    [VoteValue.NO]: '×'
  };
  
  const voteColors = {
    [VoteValue.YES]: 'bg-green-100 text-green-800 hover:bg-green-200',
    [VoteValue.MAYBE]: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    [VoteValue.NO]: 'bg-red-100 text-red-800 hover:bg-red-200'
  };
  
  // Toggle vote value (cycles through YES -> MAYBE -> NO -> unset -> YES...)
  const toggleVote = (optionId: string) => {
    if (readonly) return;
    
    const currentValue = votes.get(optionId);
    let newValue: number | undefined;
    
    if (currentValue === undefined) {
      newValue = VoteValue.YES;
    } else if (currentValue === VoteValue.YES) {
      newValue = VoteValue.MAYBE;
    } else if (currentValue === VoteValue.MAYBE) {
      newValue = VoteValue.NO;
    } else {
      // Remove vote
      votes.delete(optionId);
      votes = new Map(votes);
      if (onVoteChange) onVoteChange(optionId, -1);
      return;
    }
    
    votes.set(optionId, newValue);
    votes = new Map(votes);
    if (onVoteChange) onVoteChange(optionId, newValue);
  };
  
  // Get vote for a participant and option
  const getParticipantVote = (participantId: string, optionId: string): Vote | undefined => {
    const participant = participants.find(p => p.id === participantId);
    return participant?.votes.find(v => v.option_id === optionId);
  };
  
  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month}/${day} (${dayOfWeek})`;
  };
  
  // Get vote class for button
  const getVoteClass = (optionId: string): string => {
    const value = votes.get(optionId);
    if (value !== undefined) {
      return voteColors[value];
    }
    return 'bg-gray-100 hover:bg-gray-200';
  };
  
  // Get vote display
  const getVoteDisplay = (optionId: string): string => {
    const value = votes.get(optionId);
    if (value !== undefined) {
      return voteSymbols[value];
    }
    return '−';
  };
</script>

<div class="vote-table-container overflow-x-auto">
  <table class="w-full border-collapse bg-white rounded-lg overflow-hidden">
    <thead>
      <tr class="bg-gray-50 border-b border-gray-200">
        <th class="px-4 py-3 text-left text-sm font-medium text-gray-700 sticky left-0 bg-gray-50 z-10">
          参加者
        </th>
        {#each options as option}
          <th class="px-4 py-3 text-center text-sm font-medium text-gray-700 min-w-[80px]">
            {formatDate(option.date)}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      <!-- Current user's row (if editing) -->
      {#if !readonly && currentParticipantId}
        <tr class="border-b border-gray-200 bg-blue-50">
          <td class="px-4 py-3 font-medium sticky left-0 bg-blue-50 z-10">
            あなた
          </td>
          {#each options as option}
            <td class="px-4 py-3 text-center">
              <button
                type="button"
                onclick={() => toggleVote(option.id)}
                class="w-12 h-12 rounded-full transition-colors font-bold text-lg {getVoteClass(option.id)}"
                aria-label="{formatDate(option.date)}の出欠"
              >
                {getVoteDisplay(option.id)}
              </button>
            </td>
          {/each}
        </tr>
      {/if}
      
      <!-- Other participants' rows -->
      {#each participants as participant}
        {#if participant.id !== currentParticipantId}
          <tr class="border-b border-gray-200 hover:bg-gray-50">
            <td class="px-4 py-3 sticky left-0 bg-white z-10">
              {participant.nickname}
            </td>
            {#each options as option}
              {@const vote = getParticipantVote(participant.id, option.id)}
              <td class="px-4 py-3 text-center">
                {#if vote}
                  <span class="inline-block w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg {voteColors[vote.value]}">
                    {voteSymbols[vote.value]}
                  </span>
                {:else}
                  <span class="text-gray-400">−</span>
                {/if}
              </td>
            {/each}
          </tr>
        {/if}
      {/each}
      
      {#if participants.length === 0 && readonly}
        <tr>
          <td colspan={options.length + 1} class="px-4 py-8 text-center text-gray-500">
            まだ参加者がいません
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
  
  <!-- Legend -->
  <div class="mt-4 flex items-center gap-4 text-sm text-gray-600">
    <span class="font-medium">記号の意味:</span>
    <span class="inline-flex items-center gap-1">
      <span class="inline-block w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold">
        {voteSymbols[VoteValue.YES]}
      </span>
      行ける
    </span>
    <span class="inline-flex items-center gap-1">
      <span class="inline-block w-6 h-6 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold">
        {voteSymbols[VoteValue.MAYBE]}
      </span>
      調整可
    </span>
    <span class="inline-flex items-center gap-1">
      <span class="inline-block w-6 h-6 rounded-full bg-red-100 text-red-800 flex items-center justify-center font-bold">
        {voteSymbols[VoteValue.NO]}
      </span>
      不可
    </span>
  </div>
</div>

<style>
  .vote-table-container {
    position: relative;
  }
  
  table {
    border-spacing: 0;
  }
  
  /* Sticky header and first column */
  thead th {
    position: sticky;
    top: 0;
    z-index: 20;
  }
  
  thead th:first-child {
    z-index: 30;
  }
</style>


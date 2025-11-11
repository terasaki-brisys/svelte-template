<script lang="ts">
  import type { Option, OptionStats } from '$lib/types/database';
  import { VoteValue } from '$lib/types/database';
  
  interface Props {
    options: Option[];
    stats: OptionStats[];
  }
  
  let { options, stats }: Props = $props();
  
  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];
    return `${month}/${day} (${dayOfWeek})`;
  };
  
  // Get stats for an option
  const getStats = (optionId: string): OptionStats | undefined => {
    return stats.find(s => s.option_id === optionId);
  };
  
  // Calculate percentage
  const getPercentage = (count: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };
  
  // Find best option(s) - most YES votes
  const bestOptions = $derived(() => {
    if (stats.length === 0) return new Set<string>();
    
    const maxYes = Math.max(...stats.map(s => s.yes_count));
    if (maxYes === 0) return new Set<string>();
    
    return new Set(
      stats
        .filter(s => s.yes_count === maxYes)
        .map(s => s.option_id)
    );
  });
  
  const isBestOption = (optionId: string): boolean => {
    return bestOptions().has(optionId);
  };
</script>

<div class="stats-summary bg-white rounded-lg border border-gray-200 p-6">
  <h3 class="text-xl font-bold mb-4">集計結果</h3>
  
  {#if stats.length === 0 || stats.every(s => s.total_votes === 0)}
    <p class="text-gray-500 text-center py-4">
      まだ投票がありません
    </p>
  {:else}
    <div class="space-y-4">
      {#each options as option}
        {@const optionStats = getStats(option.id)}
        {#if optionStats}
          {@const isBest = isBestOption(option.id)}
          <div 
            class="p-4 rounded-lg transition"
            class:bg-green-50={isBest}
            class:border-2={isBest}
            class:border-green-500={isBest}
            class:bg-gray-50={!isBest}
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-bold text-lg">
                {formatDate(optionStats.date)}
                {#if isBest}
                  <span class="text-green-600 text-sm ml-2">🎯 最適候補</span>
                {/if}
              </h4>
              <span class="text-sm text-gray-600">
                {optionStats.total_votes} 人が回答
              </span>
            </div>
            
            <div class="space-y-2">
              <!-- YES votes -->
              <div class="flex items-center gap-2">
                <span class="w-12 text-sm font-medium">◯ 行ける</span>
                <div class="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div 
                    class="bg-green-500 h-full flex items-center justify-end px-2 transition-all"
                    style="width: {getPercentage(optionStats.yes_count, optionStats.total_votes)}%"
                  >
                    {#if optionStats.yes_count > 0}
                      <span class="text-white text-xs font-bold">
                        {optionStats.yes_count}
                      </span>
                    {/if}
                  </div>
                </div>
                <span class="w-12 text-sm text-right">
                  {getPercentage(optionStats.yes_count, optionStats.total_votes)}%
                </span>
              </div>
              
              <!-- MAYBE votes -->
              <div class="flex items-center gap-2">
                <span class="w-12 text-sm font-medium">△ 調整可</span>
                <div class="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div 
                    class="bg-yellow-500 h-full flex items-center justify-end px-2 transition-all"
                    style="width: {getPercentage(optionStats.maybe_count, optionStats.total_votes)}%"
                  >
                    {#if optionStats.maybe_count > 0}
                      <span class="text-white text-xs font-bold">
                        {optionStats.maybe_count}
                      </span>
                    {/if}
                  </div>
                </div>
                <span class="w-12 text-sm text-right">
                  {getPercentage(optionStats.maybe_count, optionStats.total_votes)}%
                </span>
              </div>
              
              <!-- NO votes -->
              <div class="flex items-center gap-2">
                <span class="w-12 text-sm font-medium">× 不可</span>
                <div class="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div 
                    class="bg-red-500 h-full flex items-center justify-end px-2 transition-all"
                    style="width: {getPercentage(optionStats.no_count, optionStats.total_votes)}%"
                  >
                    {#if optionStats.no_count > 0}
                      <span class="text-white text-xs font-bold">
                        {optionStats.no_count}
                      </span>
                    {/if}
                  </div>
                </div>
                <span class="w-12 text-sm text-right">
                  {getPercentage(optionStats.no_count, optionStats.total_votes)}%
                </span>
              </div>
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>


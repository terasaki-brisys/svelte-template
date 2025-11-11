<script lang="ts">
  interface Props {
    selectedDates?: string[];
    maxSelection?: number;
    onDateSelect?: (dates: string[]) => void;
  }
  
  let {
    selectedDates = $bindable([]),
    maxSelection = 7,
    onDateSelect
  }: Props = $props();
  
  let currentYear = $state(new Date().getFullYear());
  let currentMonth = $state(new Date().getMonth());
  
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Format date as YYYY-MM-DD
  const formatDate = (year: number, month: number, day: number): string => {
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  };
  
  // Check if date is selected
  const isSelected = (dateStr: string): boolean => {
    return selectedDates.includes(dateStr);
  };
  
  // Check if date is in the past
  const isPast = (year: number, month: number, day: number): boolean => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  
  // Toggle date selection
  const toggleDate = (year: number, month: number, day: number) => {
    if (isPast(year, month, day)) return;
    
    const dateStr = formatDate(year, month, day);
    const index = selectedDates.indexOf(dateStr);
    
    if (index > -1) {
      // Remove date
      selectedDates = selectedDates.filter(d => d !== dateStr);
    } else {
      // Add date if under max
      if (selectedDates.length < maxSelection) {
        selectedDates = [...selectedDates, dateStr].sort();
      }
    }
    
    if (onDateSelect) {
      onDateSelect(selectedDates);
    }
  };
  
  // Navigation
  const previousMonth = () => {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
  };
  
  const nextMonth = () => {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
  };
  
  // Generate calendar grid
  const calendarDays = $derived(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days: (number | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  });
</script>

<div class="calendar-container bg-white rounded-lg border border-gray-200 p-4">
  <!-- Calendar Header -->
  <div class="flex items-center justify-between mb-4">
    <button
      type="button"
      onclick={previousMonth}
      class="px-3 py-1 rounded hover:bg-gray-100 transition"
      aria-label="前の月"
    >
      ← 前月
    </button>
    <h3 class="text-lg font-bold">
      {currentYear}年 {monthNames[currentMonth]}
    </h3>
    <button
      type="button"
      onclick={nextMonth}
      class="px-3 py-1 rounded hover:bg-gray-100 transition"
      aria-label="次の月"
    >
      次月 →
    </button>
  </div>
  
  <!-- Selection Info -->
  <div class="text-sm text-gray-600 mb-3 text-center">
    {selectedDates.length} / {maxSelection} 日選択中
  </div>
  
  <!-- Day Names -->
  <div class="grid grid-cols-7 gap-1 mb-2">
    {#each dayNames as dayName, index}
      <div 
        class="text-center text-sm font-medium py-1"
        class:text-red-600={index === 0}
        class:text-blue-600={index === 6}
      >
        {dayName}
      </div>
    {/each}
  </div>
  
  <!-- Calendar Grid -->
  <div class="grid grid-cols-7 gap-1">
    {#each calendarDays() as day, index}
      {#if day === null}
        <div class="aspect-square"></div>
      {:else}
        {@const dateStr = formatDate(currentYear, currentMonth, day)}
        {@const selected = isSelected(dateStr)}
        {@const past = isPast(currentYear, currentMonth, day)}
        {@const isToday = dateStr === formatDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())}
        
        <button
          type="button"
          onclick={() => toggleDate(currentYear, currentMonth, day)}
          disabled={past}
          class="aspect-square flex items-center justify-center rounded text-sm transition"
          class:bg-blue-500={selected}
          class:text-white={selected}
          class:hover:bg-blue-600={selected}
          class:bg-gray-100={!selected && !past && isToday}
          class:hover:bg-gray-200={!selected && !past}
          class:text-gray-400={past}
          class:cursor-not-allowed={past}
          class:cursor-pointer={!past}
          class:font-bold={isToday}
          class:text-red-600={index % 7 === 0 && !selected && !past}
          class:text-blue-600={index % 7 === 6 && !selected && !past}
          aria-label="{currentYear}年{currentMonth + 1}月{day}日"
          aria-pressed={selected}
        >
          {day}
        </button>
      {/if}
    {/each}
  </div>
  
  <!-- Selected Dates List -->
  {#if selectedDates.length > 0}
    <div class="mt-4 pt-4 border-t border-gray-200">
      <h4 class="text-sm font-medium mb-2">選択した日付:</h4>
      <div class="flex flex-wrap gap-2">
        {#each selectedDates as date}
          {@const dateObj = new Date(date)}
          <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
            {dateObj.getFullYear()}/{(dateObj.getMonth() + 1).toString().padStart(2, '0')}/{dateObj.getDate().toString().padStart(2, '0')}
            <button
              type="button"
              onclick={() => {
                selectedDates = selectedDates.filter(d => d !== date);
                if (onDateSelect) onDateSelect(selectedDates);
              }}
              class="hover:text-blue-900"
              aria-label="削除"
            >
              ×
            </button>
          </span>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .calendar-container {
    max-width: 400px;
  }
</style>


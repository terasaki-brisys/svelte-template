<script lang="ts">
  interface Props {
    nickname?: string;
    onSubmit?: (nickname: string) => void;
    disabled?: boolean;
  }
  
  let {
    nickname = $bindable(''),
    onSubmit,
    disabled = false
  }: Props = $props();
  
  let error = $state('');
  
  const handleSubmit = () => {
    error = '';
    
    // Validation
    if (!nickname.trim()) {
      error = 'ニックネームを入力してください';
      return;
    }
    
    if (nickname.trim().length > 16) {
      error = 'ニックネームは16文字以内で入力してください';
      return;
    }
    
    if (onSubmit) {
      onSubmit(nickname.trim());
    }
  };
  
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled) {
      handleSubmit();
    }
  };
</script>

<div class="participant-form bg-white rounded-lg border border-gray-200 p-6">
  <h3 class="text-lg font-bold mb-4">参加者情報</h3>
  
  <div class="space-y-4">
    <div>
      <label for="nickname" class="block text-sm font-medium text-gray-700 mb-2">
        ニックネーム
        <span class="text-red-500">*</span>
      </label>
      <input
        id="nickname"
        type="text"
        bind:value={nickname}
        onkeypress={handleKeyPress}
        disabled={disabled}
        maxlength="16"
        placeholder="例: 山田太郎"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        aria-describedby={error ? 'nickname-error' : undefined}
        aria-invalid={error ? 'true' : 'false'}
      />
      {#if error}
        <p id="nickname-error" class="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      {/if}
      <p class="mt-1 text-sm text-gray-500">
        {nickname.length} / 16 文字
      </p>
    </div>
    
    <button
      type="button"
      onclick={handleSubmit}
      disabled={disabled || !nickname.trim()}
      class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
    >
      {disabled ? '処理中...' : '参加する'}
    </button>
  </div>
  
  <p class="mt-4 text-xs text-gray-500">
    ※ ニックネームはこのブラウザに保存され、再訪問時に自動で復元されます。
  </p>
</div>


<script setup lang="ts">
// Side navigation panel that sits on the left side of the screen
// Has a header slot at the top and a content slot below for nav links
</script>

<template>
  <aside class="flex w-60 flex-col border-r bg-gray-50">
    <div class="flex h-14 items-center border-b px-4 font-bold">
      <slot name="header" />
    </div>
    <nav class="flex-1 overflow-auto p-3">
      <slot />
    </nav>
  </aside>
</template>

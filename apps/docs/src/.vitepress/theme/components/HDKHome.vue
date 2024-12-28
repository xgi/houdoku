<script setup lang="ts">
import VPButton from "vitepress/dist/client/theme-default/components/VPButton.vue";

import { ref, onMounted } from 'vue';

const platform = ref<string | undefined>(undefined);

onMounted(() => {
  if (navigator.userAgent.includes('Win')) {
    platform.value = 'Windows';
  } else if (navigator.userAgent.includes('Mac')) {
    platform.value = 'macOS';
  } else if (navigator.userAgent.includes('Linux')) {
    platform.value = 'Linux';
  }
});
</script>

<template>
  <main>
    <div class="container">
      <h1>Free manga reader <br /> for the desktop.</h1>
      <div class="buttons">
        <VPButton href="/download" :text="`${platform ? `Download for ${platform}` : 'Download Houdoku'}`"
          theme="brand" />

        <VPButton href="/guides/getting-started" text="Documentation" theme="alt" />
      </div>
      <div class="screenshot">
        <img src="/screenshot_library_dark.webp" alt="Houdoku screenshot (dark)" class="dark-only" />
        <img src="/screenshot_library_light.webp" alt="Houdoku screenshot (light)" class="light-only" />
        <div />
      </div>
    </div>
  </main>
</template>

<style scoped>
.dark .light-only {
  display: none !important;
}

main {
  margin-top: 2rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;

  >div.container {
    width: 100%;

    @media (min-width: 1024px) {
      max-width: 1024px;
    }

    h1 {
      text-align: center;
      font-weight: 800;
      font-size: 2.25rem;

      @media (min-width: 640px) {
        font-size: 3rem;
      }

      @media (min-width: 1280px) {
        font-size: 3.75rem;
        line-height: 1.125;
      }

      >br {
        @media (max-width: 768px) {
          display: none;
        }
      }
    }

    >div.buttons {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.75rem;
      margin-top: 1rem;

      >a {
        text-decoration: none;
        border-radius: 0.5rem;
        font-size: 1.125rem;
        padding: 0.25rem 1rem;
      }
    }

    >div.screenshot {
      margin-top: 2rem;
      width: 100%;
      background-color: var(--vp-code-bg);
      border-radius: 1rem;

      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;

      background-image: linear-gradient(to top right, #3b82f6, #a855f7, #6366f1);

      >img {
        border-radius: 0.5rem;
        width: 90%;
        height: auto;
        display: inline-block;
        position: absolute;
        vertical-align: middle;
        box-shadow: 0 0 #0000, 0 0 #0000, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      }

      >div {
        width: 100%;
        aspect-ratio: 125 / 90;
      }
    }
  }
}
</style>
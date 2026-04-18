<template>
  <div class="pp-loader">
    <div
      class="pp-loader__mark"
      aria-hidden="true"
    >
      <span class="pp-loader__dot pp-loader__dot--1" />
      <span class="pp-loader__dot pp-loader__dot--2" />
      <span class="pp-loader__dot pp-loader__dot--3" />
    </div>
    <div class="pp-loader__label">Turning the page…</div>
  </div>
</template>

<style lang="scss" scoped>
  .pp-loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.85rem;
    padding: clamp(2rem, 6vw, 3.5rem) 1.5rem;
  }

  .pp-loader__mark {
    display: flex;
    gap: 0.45rem;
  }

  .pp-loader__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--rouge);
    display: inline-block;
    animation: pp-loader-pulse 1.1s var(--ease-ink) infinite;
  }

  .pp-loader__dot--2 {
    animation-delay: 160ms;
    background: var(--gold);
  }

  .pp-loader__dot--3 {
    animation-delay: 320ms;
    background: var(--sage);
  }

  @keyframes pp-loader-pulse {
    0%,
    80%,
    100% {
      transform: scale(0.6);
      opacity: 0.4;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .pp-loader__label {
    font-family: var(--font-serif);
    font-style: italic;
    font-size: 0.95rem;
    color: var(--ink-mute);
    font-variation-settings:
      'opsz' 16,
      'SOFT' 50;
  }
</style>

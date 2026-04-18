<template>
  <q-page class="pp-404">
    <div class="pp-404__inner">
      <div class="pp-404__folio">Nº 404</div>
      <div class="eyebrow">A missing page</div>

      <h1 class="display-xl pp-404__title">
        Nothing to <em>balance</em><br />
        here.
      </h1>

      <p class="pp-404__lede">
        The page you were looking for isn't in the book. It may have been moved, or never written in
        the first place.
      </p>

      <div
        class="dotted-rule pp-404__rule"
        aria-hidden="true"
      />

      <q-btn
        unelevated
        no-caps
        icon-right="arrow_forward"
        label="Back to the home page"
        color="primary"
        class="pp-404__btn"
        to="/"
      />
    </div>

    <div
      class="pp-404__numeral"
      aria-hidden="true"
    >
      404
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
  .pp-404 {
    min-height: 100svh;
    padding: clamp(1.5rem, 4vw, 3rem);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .pp-404__inner {
    position: relative;
    z-index: 1;
    max-width: 620px;
  }

  .pp-404__folio {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    color: var(--rouge);
    text-transform: uppercase;
    margin-bottom: 0.85rem;
  }

  .pp-404__title {
    margin: 0.65rem 0 1rem;
    color: var(--ink);

    em {
      font-style: italic;
      color: var(--rouge);
      font-variation-settings:
        'opsz' 144,
        'SOFT' 80;
    }
  }

  .pp-404__lede {
    margin: 0;
    font-family: var(--font-serif);
    font-size: clamp(1.05rem, 2vw, 1.2rem);
    line-height: 1.55;
    color: var(--ink-soft);
    max-width: 42ch;
    font-variation-settings:
      'opsz' 20,
      'SOFT' 40;
  }

  .pp-404__rule {
    margin: 2rem 0 1.5rem;
    max-width: 24rem;
  }

  :deep(.pp-404__btn) {
    padding: 0.85rem 1.5rem;
  }

  .pp-404__numeral {
    position: absolute;
    right: -3rem;
    bottom: -5rem;
    font-family: var(--font-serif);
    font-style: italic;
    font-size: clamp(18rem, 40vw, 32rem);
    line-height: 1;
    color: var(--rouge);
    opacity: 0.05;
    pointer-events: none;
    z-index: 0;
    font-variation-settings:
      'opsz' 144,
      'SOFT' 100;
  }
</style>

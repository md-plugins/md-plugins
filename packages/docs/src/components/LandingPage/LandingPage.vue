<template>
  <div class="landing-page q-px-lg markdown-brand">Landing Page</div>
</template>

<script setup lang="ts">
//
</script>

<style lang="scss">
@use 'sass:math';

.landing-page {
  .btn-underline {
    border-bottom: 1px solid rgba($color: white, $alpha: 0.54);
  }

  .social-channels-call-to-action {
    // undo margin from q-page
    margin: 0 -24px 0 -24px;
  }

  q {
    display: block;
  }

  .sponsors {
    margin-top: 80px;
    margin-bottom: 208px;

    &__list {
      margin-bottom: 208px;
    }
  }

  .showcase-section {
    margin-top: 258px;
  }

  .intro-section {
    margin-top: 60px;
    margin-bottom: 208px;

    @media screen and (min-height: 980px) {
      margin-top: 100px;

      &__sponsors-heading {
        margin-top: 80px !important;
      }
    }
  }

  h2 {
    line-height: 1.5em;
  }

  // We need a thickness of 2px but the default is 1px, and there's no
  // prop to modify it from within quasar
  .q-btn--outline:before {
    border: 2px solid $brand-accent;
    box-shadow: 0 1px 1px 0 rgba(#000, 0.12);
  }
}
</style>

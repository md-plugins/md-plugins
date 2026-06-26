<template>
  <div class="qpress-layout-example q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <q-card class="qpress-layout-example__panel" flat bordered>
          <q-card-section>
            <q-toggle v-model="showAnnouncement" label="Announcement" />
            <p>Inline preview of a site-wide release notice.</p>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="qpress-layout-example__panel" flat bordered>
          <q-card-section>
            <q-toggle v-model="showPrivacy" label="Privacy prompt" />
            <p>Static-host consent UI with resettable demo storage.</p>
            <q-btn dense flat no-caps label="Reset prompt" @click="resetPrivacyPrompt" />
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="qpress-layout-example__panel" flat bordered>
          <q-card-section>
            <q-toggle v-model="showCampaign" label="Campaign dialog" />
            <p>Route-aware campaign dialog using an immediate demo trigger.</p>
            <q-btn dense flat no-caps label="Open again" @click="openCampaignAgain" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="qpress-layout-example__preview q-mt-md">
      <MarkdownAnnouncement :config="announcementConfig" />
    </div>

    <MarkdownPrivacyConsent :config="privacyConfig" />
    <MarkdownCampaigns :campaigns="campaigns" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MarkdownAnnouncement from '@/.q-press/layouts/MarkdownAnnouncement.vue'
import MarkdownCampaigns from '@/.q-press/layouts/MarkdownCampaigns.vue'
import MarkdownPrivacyConsent from '@/.q-press/layouts/MarkdownPrivacyConsent.vue'
import type {
  AnnouncementBannerConfig,
  CampaignConfig,
  PrivacyConsentConfig,
} from '@/.q-press/types/config'

const showAnnouncement = ref(true)
const showPrivacy = ref(false)
const showCampaign = ref(false)
const privacyCycle = ref(1)
const campaignCycle = ref(1)

const announcementConfig = computed<AnnouncementBannerConfig>(() => ({
  enabled: showAnnouncement.value,
  id: 'qpress-example-announcement',
  message: 'Q-Press can show calm, dismissible site notices from Site Config.',
  tone: 'info',
  dismissible: false,
  action: {
    label: 'Read more',
    link: '/quasar-app-extensions/qpress/site-config',
  },
}))

const privacyConfig = computed<PrivacyConsentConfig>(() => ({
  enabled: showPrivacy.value,
  id: `qpress-example-privacy-${privacyCycle.value}`,
  storageKey: `qpress-example:privacy:${privacyCycle.value}`,
  mode: 'consent',
  title: 'Privacy preferences',
  message: 'Choose whether this demo can enable optional analytics or third-party embeds.',
  policyLink: '/privacy-policy',
  categories: [
    { id: 'necessary', label: 'Necessary', required: true },
    { id: 'analytics', label: 'Analytics' },
    { id: 'embeds', label: 'Embeds' },
  ],
}))

const campaigns = computed<CampaignConfig[]>(() => [
  {
    enabled: showCampaign.value,
    id: `qpress-example-campaign-${campaignCycle.value}`,
    storageKey: `qpress-example:campaign:${campaignCycle.value}`,
    title: 'Support the docs workflow',
    message:
      'Campaigns are opt-in prompts for sponsor messages, release notes, or route-specific calls to action.',
    tone: 'sponsor',
    trigger: { type: 'load' },
    frequency: { strategy: 'always' },
    closeOnEsc: true,
    closeOnBackdrop: true,
    action: {
      label: 'View Site Config',
      link: '/quasar-app-extensions/qpress/site-config',
    },
  },
])

function resetPrivacyPrompt(): void {
  privacyCycle.value += 1
  showPrivacy.value = true
}

function openCampaignAgain(): void {
  campaignCycle.value += 1
  showCampaign.value = true
}
</script>

<style scoped>
.qpress-layout-example {
  color: var(--qpress-text-primary);
}

.qpress-layout-example__panel {
  height: 100%;
  color: var(--qpress-text-primary);
  background: var(--qpress-surface-panel);
  border-color: var(--qpress-border-subtle);
}

.qpress-layout-example__panel p {
  min-height: 2.7em;
  margin: 8px 0 0;
  color: var(--qpress-text-body);
  line-height: 1.35;
}

.qpress-layout-example__preview {
  overflow: hidden;
  border: 1px solid var(--qpress-border-subtle);
  border-radius: 8px;
}

.qpress-layout-example__preview :deep(.qpress-announcement__inner) {
  width: 100%;
  padding: 10px 12px;
}
</style>

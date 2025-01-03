<template>
  <q-card flat bordered>
    <q-card-section v-if="error" class="row no-wrap items-center">
      <q-icon name="warning" size="24px" color="negative" class="q-mr-sm" />
      <div>Cannot connect to GitHub. Try again later.</div>
    </q-card-section>
    <q-card-section v-else-if="loading" class="row no-wrap items-center">
      <q-spinner size="24px" color="primary" class="q-mr-sm" />
      <div>Loading release notes from GitHub</div>
    </q-card-section>
    <template v-else>
      <q-separator />
      <q-tab-panels v-model="currentPackage" animated class="packages-container">
        <q-tab-panel
          v-for="(packageReleases, packageName) in packages"
          :key="packageName"
          :name="packageName"
          class="q-pa-none"
        >
        test: {{ packageName }}
          <!-- <PackageReleases
            :latest-version="String(latestVersions[packageName])"
            :releases="packageReleases"
          /> -->
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { date } from 'quasar'

// import PackageReleases from './PackageReleases.vue'

const { extractDate, formatDate } = date

// Types
interface ReleaseInfo {
  version: string
  date: string
  body: string
  label: string
}

interface PackageReleasesMap {
  [key: string]: ReleaseInfo[]
}

// Reactive state
const packages = ref<PackageReleasesMap>({
  QMarkdown: [],
})
const loading = ref<boolean>(false)
const error = ref<boolean>(false)
const currentPackage = ref<string>('MD-Plugins')
const latestVersions = ref<Record<string, string>>({})

function queryReleases(page = 1): void {
  loading.value = true
  error.value = false

  const xhrQuasar = new XMLHttpRequest()

  xhrQuasar.addEventListener('load', function () {
    const releases = JSON.parse(this.responseText)

    if (!releases || releases.length === 0) {
      error.value = true
      return
    }

    let stopQuery = true

    for (const release of releases) {
      const [name, version] = release.name.split('v')

      if (name.startsWith('@quasar')) {
        continue
      }

      const packageName = currentPackage.value

      if (!version) {
        stopQuery = true
        continue
      }

      if (!packages.value[packageName]) {
        packages.value[packageName] = []
      }

      const releaseInfo: ReleaseInfo = {
        version,
        date: formatDate(extractDate(release.published_at, 'YYYY-MM-DD'), 'YYYY-MM-DD'),
        body: release.body,
        label: version,
      }

      packages.value[packageName].push(releaseInfo)

      if (!latestVersions.value[packageName]) {
        latestVersions.value[packageName] = releaseInfo.label
      }
    }

    if (!stopQuery) {
      queryReleases(page + 1)
    }

    if (packages.value.QMarkdown) {
      packages.value.QMarkdown.sort((a, b) => {
        return parseInt(b.date.replace(/-/g, ''), 10) - parseInt(a.date.replace(/-/g, ''), 10)
      })
    }
  })

  xhrQuasar.addEventListener('error', () => {
    error.value = true
  })

  xhrQuasar.open(
    'GET',
    `https://api.github.com/repos/md-plugins/md-plugins/releases?page=${page}&per_page=100`,
  )
  xhrQuasar.send()
}

onMounted(() => {
  queryReleases()
})
</script>

<style lang="scss">
.packages-container {
  .q-tab-panel {
    padding-right: 0;
    padding-top: 0;
  }
}
</style>

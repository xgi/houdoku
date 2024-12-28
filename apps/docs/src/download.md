---
editLink: false
prev: false
next: false
---

<script setup>
import VPButton from "vitepress/dist/client/theme-default/components/VPButton.vue";
import { data as release } from '@theme/data/release.data'
</script>

# Download

Houdoku version {{ release.version }} was released on {{ release.releaseDateStr }} ({{ release.releaseDaysAgo }} days ago).

<table class="downloadTable">
<thead>
<tr>
  <th>Platform</th>
  <th>Download</th>
  <th>Built</th>
</tr>
</thead>
<tbody>
<tr v-for="asset in release.assets" :key="asset.platform">
  <td>{{ asset.platform }}</td>
  <td><VPButton :href="asset.browser_download_url" :text="asset.name" theme="brand" /></td>
  <td>{{ asset.buildTimeStr }}</td>
</tr>
</tbody>
</table>

> Additional versions are available from the [GitHub releases page](https://github.com/xgi/houdoku/releases).

## Updating

Houdoku checks for updates automatically when the client starts. You will be prompted when an update is available.

## Next steps

Check the [Getting Started](./guides/getting-started) guide.


<style scoped>
.downloadTable {
  a {
    text-decoration: none;
  }
}
</style>
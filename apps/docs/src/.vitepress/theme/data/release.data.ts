interface ReleaseAsset {
  platform: string;
  name: string;
  browser_download_url: string;
  buildTimeStr: string;
}

export interface Release {
  version: string;
  releaseDateStr: string;
  releaseDaysAgo: number;
  assets: ReleaseAsset[];
}

declare const data: Release;
export { data };

export default {
  async load(): Promise<Release> {
    const release = await fetch('https://api.github.com/repos/xgi/houdoku/releases/latest').then(
      (response) => response.json(),
    );

    const date = new Date(release.published_at);
    const assets = {
      windows: release.assets.find((asset) => /Houdoku-Setup-.*\.exe$/.test(asset.name)),
      windowsportable: release.assets.find((asset) => /Houdoku-\d.*exe$/.test(asset.name)),
      mac: release.assets.find((asset) => asset.name.endsWith('.dmg')),
      linux: release.assets.find((asset) => asset.name.endsWith('.AppImage')),
    };

    return {
      version: release.tag_name.replace('v', ''),
      releaseDateStr: date.toLocaleDateString(),
      releaseDaysAgo: Math.round((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24)),
      assets: [
        {
          platform: 'Windows',
          name: assets.windows.name,
          browser_download_url: assets.windows.browser_download_url,
          buildTimeStr: new Date(assets.windows.updated_at).toISOString(),
        },
        // {
        //   platform: 'Windows Portable',
        //   name: assets.windowsportable.name,
        //   browser_download_url: assets.windowsportable.browser_download_url,
        //   buildTimeStr: new Date(assets.windowsportable.updated_at).toISOString(),
        // },
        {
          platform: 'macOS',
          name: assets.mac.name,
          browser_download_url: assets.mac.browser_download_url,
          buildTimeStr: new Date(assets.mac.updated_at).toISOString(),
        },
        {
          platform: 'Linux',
          name: assets.linux.name,
          browser_download_url: assets.linux.browser_download_url,
          buildTimeStr: new Date(assets.linux.updated_at).toISOString(),
        },
      ],
    };
  },
};

[![Houdoku Header](res/houdoku_header.png)](https://houdoku.org)

[![houdoku.org](https://img.shields.io/badge/website-houdoku.org-7048E8?style=flat-square)](https://houdoku.org)
[![GitHub release](https://img.shields.io/github/v/release/xgi/houdoku?style=flat-square)](https://github.com/xgi/houdoku/releases)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/xgi/houdoku/publish.yml?branch=master&style=flat-square)

Houdoku is a free and open source manga reader for the desktop.

---

## Features

- Read manga from popular websites or import ones from your filesystem,
  all in one place.
- Download chapters for offline reading.
- Customizable reader interface with multiple layouts and settings.
- Tagging and filtering support to easily browse and manage large libraries.
- Cross-platform!

---

![Screenshots1](res/screenshots1.png)
![Screenshots2](res/screenshots2.png)

---

## Download

Download Houdoku from [the official website](https://houdoku.org/download).

Alternatively, you can download manually from the
[GitHub releases page](https://github.com/xgi/houdoku/releases).

## Documentation

User guides and documentation are available on
[houdoku.org](https://houdoku.org).

## Development

Install dependencies:

```
pnpm i
```

Start the app in the dev environment:

```
pnpm dev
```

## Stack

**Application**: This is an Electron application. The majority of the functionality is performed in the renderer thread. Exceptions are for cases like accessing the window class (i.e. to support minimizing the window), locating application directories, and for working with extensions. The renderer can invoke these functions through ipc.

**UI**: The interface uses React components. Most base components (text, buttons, links, etc.) use [Radix primitives](https://www.radix-ui.com/primitives) and were designed by [shadcn](https://ui.shadcn.com).

**State**: [Recoil](https://recoiljs.org) is used for state management. Hooks are used for small
non-shared behavior.

**Storage**: Library data and settings are saved with `localStorage`. Thumbnails are stored in
the user-data path.

**Plugins/Extensions**: See the [Tiyo](https://github.com/xgi/tiyo) repo. Dynamic loading is handled by [aki-plugin-manager](https://github.com/xgi/aki-plugin-manager).

## Content Sources

Houdoku allows users to import manga from their filesystem (e.g. as zip files
or folders of images). To read manga from 3rd-party "content sources", the
Tiyo plugin can be installed from the Plugins tab in the client.

To learn about Tiyo or request a new content source, please go to https://github.com/xgi/tiyo

## License

[MIT License](https://github.com/xgi/houdoku/blob/master/LICENSE.txt)

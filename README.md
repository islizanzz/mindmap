# mindmap

A local note-taking app for macOS. Add folders from your Mac as projects, then browse and edit the Markdown and CSV files inside them. Lists in Markdown are drawn as mind maps that you can edit in place.

Your files stay plain `.md` and `.csv` files on disk. mindmap never moves them into a library or database of its own.

> The interface is currently in Simplified Chinese.

## Features

- **Projects are folders.** Pick any folder on your Mac, including folders in iCloud Drive, and give it a project name. Removing a project only removes it from mindmap. The folder and its files are left untouched.
- **Only what matters.** The sidebar shows folders, `.md` files and `.csv` files, nested to any depth, and hides everything else. File names are shown without extensions, and each file type has its own icon.
- **Pins.** Pin any file or folder. Pinned items appear in a 置顶 (Pinned) section at the top of the sidebar, across all projects.
- **Markdown, edited in place.** Click any paragraph or heading to edit it. Changes are saved automatically.
- **Lists become mind maps.** Ordered and unordered lists are drawn as mind maps. Click one to edit it full screen:
  - <kbd>Enter</kbd> adds a sibling topic.
  - <kbd>Tab</kbd> adds a child topic.
  - <kbd>Backspace</kbd> on an empty topic deletes it.
  - <kbd>Esc</kbd> returns to the document.

  Your edits are written back to the list in the `.md` file.
- **CSV tables.** `.csv` files open as read-only tables. mindmap detects the encoding (UTF-8, GBK, UTF-16) and the delimiter (comma, semicolon, tab) automatically.
- **Safe deletes.** Deleted files and folders go to the macOS Trash, so you can restore them.
- **iCloud-friendly.** Browsing the sidebar reads only file names, so it never downloads files from iCloud. A file is downloaded only when you open it, and moving an iCloud file to the Trash doesn't download it first.
- **Stays in sync.** Changes made to your files in other apps show up right away.

## Install

Requirements: macOS 13 or later on Apple silicon.

1. Download the `.dmg` from the [latest release](https://github.com/islizanzz/mindmap/releases/latest).
2. Open it and drag mindmap into Applications.
3. mindmap isn't signed with an Apple Developer ID yet, so macOS may report that the app "is damaged and can't be opened". To allow it, run:

   ```bash
   xattr -dr com.apple.quarantine /Applications/mindmap.app
   ```

After that, mindmap updates itself. It checks for a new version every time it starts, and you can also choose **mindmap › 检查更新…** (Check for Updates) in the menu bar.

## Where your data lives

- **Notes:** Your notes are the files in the folders you add. Edited `.md` files are saved as UTF-8.
- **App settings:** mindmap's own data (the project list and pins) is stored in `~/Library/Application Support/com.lizanzz.mindmap/state.json`. It never writes settings or hidden files into your folders.

## Development

mindmap is built with [Tauri 2](https://tauri.app). It has a Rust backend and a TypeScript frontend, bundled with Vite.

You need [Rust](https://rustup.rs), Node.js 22 or later, and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm tauri dev   # run the macOS app
```

### Project layout

| Path | What it is |
| --- | --- |
| `src-tauri/src/` | Rust backend: projects, folder tree, pins, file operations, Trash, iCloud handling, file watching |
| `src-tauri/src/commands.rs` | Every command the frontend can call |
| `src/api.ts` | Typed wrappers for those commands |
| `src/App.tsx`, `src/Content.tsx` | Sidebar, menus and dialogs; the document view and autosave |
| `public/memo/` | Component bundle exported from the mindmap design system (includes React 18.3.1, exposed as `window.Memo`). When the design system changes, replace these files. |
| `design/app-icon.svg` | Source for the app icon. Regenerate the icon set with `pnpm tauri icon design/app-icon.png`. |

```bash
cd src-tauri && cargo test   # backend unit tests
```

## Releasing

To publish a new version, run:

```bash
pnpm release 0.2.0
```

This updates the version number in `package.json`, `tauri.conf.json` and `Cargo.toml`, commits, tags `v0.2.0` and pushes. The [release workflow](.github/workflows/release.yml) then builds the app and publishes it to GitHub Releases. The release includes the `latest.json` file that installed copies check for updates.

Update packages are signed with the Tauri updater key. Only the key's owner can publish updates:

- The private key lives in the `TAURI_SIGNING_PRIVATE_KEY` repository secret. Never commit it.
- The public key is in `src-tauri/tauri.conf.json`.
- If the private key is lost, installed copies can no longer receive updates.

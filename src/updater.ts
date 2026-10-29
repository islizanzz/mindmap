// 检查更新：启动时在后台静默检查一次；菜单栏「检查更新…」手动检查。
// 新版本发布在 GitHub Releases（见 .github/workflows/release.yml）。
import { listen } from "@tauri-apps/api/event";
import { ask, message } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { check } from "@tauri-apps/plugin-updater";

const TITLE = "mindmap";
let running = false;

/** 写盘前由正文区提供，安装更新、重启之前先把没保存的改动存掉。 */
let beforeRestart: (() => Promise<void>) | null = null;
export function setBeforeRestart(f: (() => Promise<void>) | null) {
  beforeRestart = f;
}

export async function checkForUpdate(manual: boolean) {
  if (running) return;
  running = true;
  try {
    const update = await check();
    if (!update) {
      if (manual) await message("已经是最新版本。", { title: TITLE });
      return;
    }
    const notes = update.body?.trim();
    const ok = await ask(`mindmap ${update.version} 可以更新了，现在的版本是 ${update.currentVersion}。${notes ? `\n\n${notes}` : ""}`, {
      title: TITLE,
      okLabel: "更新",
      cancelLabel: "以后再说",
    });
    if (!ok) return;
    await update.downloadAndInstall();
    await beforeRestart?.();
    await relaunch();
  } catch (e) {
    // 启动时的静默检查失败（比如没联网）不打扰
    if (manual) await message(`检查更新失败：${String(e)}`, { title: TITLE, kind: "error" });
  } finally {
    running = false;
  }
}

export function startUpdater() {
  if (!("__TAURI_INTERNALS__" in window)) return;
  listen("menu-check-update", () => checkForUpdate(true));
  // 开发版不自动检查，免得提示用发布版替换正在开发的版本
  if (!import.meta.env.DEV) checkForUpdate(false);
}

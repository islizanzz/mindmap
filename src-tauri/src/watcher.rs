//! 每个项目一个 FSEvents 监听，外部改动以 `fs-changed` 事件推给前端。

use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    sync::Mutex,
    time::Duration,
};

use notify_debouncer_full::{
    new_debouncer, notify::RecommendedWatcher, notify::RecursiveMode, DebounceEventResult,
    Debouncer, RecommendedCache,
};
use serde::Serialize;
use tauri::{AppHandle, Emitter};

use crate::paths;

pub const FS_CHANGED: &str = "fs-changed";

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct FsChanged {
    project_id: String,
    /// 变动的相对路径；空字符串表示项目根目录本身。
    paths: Vec<String>,
}

#[derive(Default)]
pub struct Watchers(Mutex<HashMap<String, Debouncer<RecommendedWatcher, RecommendedCache>>>);

impl Watchers {
    pub fn watch(&self, app: &AppHandle, project_id: &str, root: &Path) {
        let app = app.clone();
        let id = project_id.to_string();
        let base: PathBuf = root.to_path_buf();
        let handler = move |res: DebounceEventResult| {
            let Ok(events) = res else { return };
            let mut changed: Vec<String> = events
                .iter()
                .flat_map(|e| e.paths.iter())
                .filter_map(|p| paths::to_rel(&base, p))
                // 隐藏文件（含本应用写入时的临时文件）不通知
                .filter(|rel| !rel.split('/').any(|s| s.starts_with('.')))
                .collect();
            changed.sort();
            changed.dedup();
            if !changed.is_empty() {
                let _ = app.emit(
                    FS_CHANGED,
                    FsChanged {
                        project_id: id.clone(),
                        paths: changed,
                    },
                );
            }
        };
        let mut debouncer = match new_debouncer(Duration::from_millis(300), None, handler) {
            Ok(d) => d,
            Err(e) => {
                eprintln!("watch {}: {e}", root.display());
                return;
            }
        };
        if let Err(e) = debouncer.watch(root, RecursiveMode::Recursive) {
            eprintln!("watch {}: {e}", root.display());
            return;
        }
        self.0.lock().unwrap().insert(project_id.into(), debouncer);
    }

    pub fn unwatch(&self, project_id: &str) {
        self.0.lock().unwrap().remove(project_id);
    }
}

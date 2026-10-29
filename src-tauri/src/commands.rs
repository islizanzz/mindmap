//! 前端可调用的命令。所有路径参数都是项目内相对路径（`/` 分隔，"" 为项目根）。

use std::{fs, path::PathBuf, time::UNIX_EPOCH};

use serde::Serialize;
use tauri::{AppHandle, State};

use crate::{
    bookmark,
    error::{Error, Result},
    fs_ops, icloud, paths,
    store::{Pin, Project, Store},
    text,
    tree::{self, Entry, Kind},
    watcher::Watchers,
};

pub struct AppState {
    pub store: Store,
    pub watchers: Watchers,
}

// ---------- 项目 ----------

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectInfo {
    id: String,
    name: String,
    path: String,
    /// 文件夹当前是否可访问（被删除、外接盘未挂载时为 false）。
    available: bool,
}

impl From<&Project> for ProjectInfo {
    fn from(p: &Project) -> Self {
        Self {
            id: p.id.clone(),
            name: p.name.clone(),
            path: p.path.display().to_string(),
            available: p.path.is_dir(),
        }
    }
}

#[tauri::command]
pub fn project_list(app: AppHandle, state: State<AppState>) -> Result<Vec<ProjectInfo>> {
    // 文件夹找不到时，尝试用书签找回被改名或移动后的位置
    let missing = state.store.read(|d| d.projects.iter().any(|p| !p.path.is_dir()));
    if missing {
        let moved = state.store.update(|d| {
            let mut moved = Vec::new();
            for p in d.projects.iter_mut().filter(|p| !p.path.is_dir()) {
                if let Some(new) = p.bookmark.as_deref().and_then(bookmark::resolve) {
                    if new.is_dir() {
                        p.bookmark = bookmark::create(&new);
                        p.path = new;
                        moved.push((p.id.clone(), p.path.clone()));
                    }
                }
            }
            Ok(moved)
        })?;
        for (id, path) in moved {
            state.watchers.unwatch(&id);
            state.watchers.watch(&app, &id, &path);
        }
    }
    Ok(state.store.read(|d| d.projects.iter().map(ProjectInfo::from).collect()))
}

/// `name` 为空时使用文件夹名。
#[tauri::command]
pub fn project_add(
    app: AppHandle,
    state: State<AppState>,
    path: String,
    name: Option<String>,
) -> Result<ProjectInfo> {
    // 规范化路径，与 FSEvents 上报的路径保持一致
    let path = fs::canonicalize(&path)?;
    if !path.is_dir() {
        return Err(Error::InvalidPath(path.display().to_string()));
    }
    let name = match name.as_deref().map(str::trim) {
        Some(n) if !n.is_empty() => n.to_string(),
        _ => path.file_name().unwrap_or_default().to_string_lossy().into_owned(),
    };
    let project = state.store.update(|d| {
        if d.projects.iter().any(|p| p.path == path) {
            return Err(Error::ProjectExists);
        }
        let p = Project {
            id: uuid::Uuid::new_v4().to_string(),
            name,
            bookmark: bookmark::create(&path),
            path: path.clone(),
        };
        d.projects.push(p.clone());
        Ok(p)
    })?;
    state.watchers.watch(&app, &project.id, &project.path);
    Ok(ProjectInfo::from(&project))
}

#[tauri::command]
pub fn project_rename(state: State<AppState>, id: String, name: String) -> Result<()> {
    let name = name.trim();
    if name.is_empty() {
        return Err(Error::InvalidName);
    }
    state.store.update(|d| {
        d.project_mut(&id)?.name = name.to_string();
        Ok(())
    })
}

/// 只从应用中移除，不动磁盘上的文件夹。
#[tauri::command]
pub fn project_remove(state: State<AppState>, id: String) -> Result<()> {
    state.store.update(|d| {
        d.projects.retain(|p| p.id != id);
        d.drop_pins(&id, "");
        Ok(())
    })?;
    state.watchers.unwatch(&id);
    Ok(())
}

/// 按传入的 id 顺序重排；未列出的项目保持原顺序排在后面。
#[tauri::command]
pub fn project_reorder(state: State<AppState>, ids: Vec<String>) -> Result<()> {
    state.store.update(|d| {
        d.projects
            .sort_by_key(|p| ids.iter().position(|i| *i == p.id).unwrap_or(usize::MAX));
        Ok(())
    })
}

// ---------- 目录树与置顶 ----------

#[tauri::command]
pub fn tree_list(state: State<AppState>, project_id: String, dir: String) -> Result<Vec<Entry>> {
    let root = state.store.root(&project_id)?;
    let pins = state.store.read(|d| d.pins_of(&project_id));
    tree::list(&root, &dir, &pins)
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PinnedEntry {
    project_id: String,
    #[serde(flatten)]
    entry: Entry,
}

/// 侧栏顶部「置顶」区的条目，跨所有项目，按置顶顺序。
/// 返回空数组时前端不显示「置顶」区。文件已不存在的置顶会被顺便清掉；
/// 项目暂时不可用（如外接盘未挂载）时保留它的置顶，只是不返回。
#[tauri::command]
pub fn pin_list(state: State<AppState>) -> Result<Vec<PinnedEntry>> {
    let (pins, projects) = state.store.read(|d| (d.pins.clone(), d.projects.clone()));
    let mut out = Vec::new();
    let mut stale = Vec::new();
    for pin in pins {
        let Some(project) = projects.iter().find(|p| p.id == pin.project_id) else {
            stale.push(pin);
            continue;
        };
        if !project.path.is_dir() {
            continue;
        }
        let project_pins: Vec<String> = vec![pin.path.clone()];
        match tree::entry(&project.path, &pin.path, &project_pins) {
            Some(entry) => out.push(PinnedEntry {
                project_id: pin.project_id,
                entry,
            }),
            None => stale.push(pin),
        }
    }
    if !stale.is_empty() {
        state.store.update(|d| {
            d.pins.retain(|p| !stale.contains(p));
            Ok(())
        })?;
    }
    Ok(out)
}

/// 置顶时加到置顶区末尾。
#[tauri::command]
pub fn pin_set(state: State<AppState>, project_id: String, path: String, pinned: bool) -> Result<()> {
    if path.is_empty() {
        return Err(Error::InvalidPath(path));
    }
    state.store.update(|d| {
        d.project_mut(&project_id)?;
        let pin = Pin { project_id, path };
        d.pins.retain(|p| *p != pin);
        if pinned {
            d.pins.push(pin);
        }
        Ok(())
    })
}

/// 按传入顺序重排置顶区；未列出的保持原顺序排在后面。
#[tauri::command]
pub fn pin_reorder(state: State<AppState>, pins: Vec<Pin>) -> Result<()> {
    state.store.update(|d| {
        d.pins
            .sort_by_key(|p| pins.iter().position(|x| x == p).unwrap_or(usize::MAX));
        Ok(())
    })
}

// ---------- 文件与文件夹操作 ----------

fn entry_after(state: &AppState, project_id: &str, rel: &str) -> Result<Entry> {
    let root = state.store.root(project_id)?;
    let pins = state.store.read(|d| d.pins_of(project_id));
    tree::entry(&root, rel, &pins).ok_or(Error::NotFound)
}

/// `name` 不带后缀，后缀由 `kind` 决定。
#[tauri::command]
pub fn entry_create(
    state: State<AppState>,
    project_id: String,
    parent: String,
    name: String,
    kind: Kind,
) -> Result<Entry> {
    let root = state.store.root(&project_id)?;
    let rel = fs_ops::create(&root, &parent, &name, kind)?;
    entry_after(&state, &project_id, &rel)
}

/// `name` 不带后缀，文件保留原后缀。
#[tauri::command]
pub fn entry_rename(state: State<AppState>, project_id: String, path: String, name: String) -> Result<Entry> {
    let root = state.store.root(&project_id)?;
    let new_rel = fs_ops::rename(&root, &path, &name)?;
    state.store.update(|d| {
        d.remap_pins(&project_id, &path, &new_rel);
        Ok(())
    })?;
    entry_after(&state, &project_id, &new_rel)
}

fn removable(state: &AppState, project_id: &str, rel: &str) -> Result<PathBuf> {
    if rel.is_empty() {
        return Err(Error::InvalidPath(rel.into()));
    }
    paths::resolve(&state.store.root(project_id)?, rel)
}

fn forget_pins(state: &AppState, project_id: &str, rel: &str) -> Result<()> {
    state.store.update(|d| {
        d.drop_pins(project_id, rel);
        Ok(())
    })
}

/// 移到废纸篓。失败（code = trashFailed）时由前端确认后再调用 `entry_delete_permanently`。
#[tauri::command]
pub fn entry_trash(state: State<AppState>, project_id: String, path: String) -> Result<()> {
    fs_ops::trash(&removable(&state, &project_id, &path)?)?;
    forget_pins(&state, &project_id, &path)
}

#[tauri::command]
pub fn entry_delete_permanently(state: State<AppState>, project_id: String, path: String) -> Result<()> {
    fs_ops::delete_permanently(&removable(&state, &project_id, &path)?)?;
    forget_pins(&state, &project_id, &path)
}

// ---------- 读写内容 ----------

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FileMeta {
    /// 内容的 SHA-256，写回时作为 `base_hash` 传入以检测外部修改。
    hash: String,
    modified_ms: Option<u64>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TextFile {
    content: String,
    encoding: String,
    #[serde(flatten)]
    meta: FileMeta,
}

fn meta_of(abs: &std::path::Path, bytes: &[u8]) -> FileMeta {
    FileMeta {
        hash: text::hash(bytes),
        modified_ms: fs::metadata(abs)
            .and_then(|m| m.modified())
            .ok()
            .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
            .map(|d| d.as_millis() as u64),
    }
}

fn file_path(state: &AppState, project_id: &str, rel: &str, kind: Kind) -> Result<PathBuf> {
    let abs = paths::resolve(&state.store.root(project_id)?, rel)?;
    if Kind::of(&abs, abs.is_dir()) != Some(kind) {
        return Err(Error::UnsupportedKind);
    }
    Ok(abs)
}

/// 读取 .md。iCloud 中未下载的文件会先下载，期间前端显示加载状态。
#[tauri::command]
pub async fn file_read(state: State<'_, AppState>, project_id: String, path: String) -> Result<TextFile> {
    let abs = file_path(&state, &project_id, &path, Kind::Md)?;
    let bytes = icloud::read(abs.clone()).await?;
    let (content, encoding) = text::decode(&bytes);
    Ok(TextFile {
        content,
        encoding: encoding.into(),
        meta: meta_of(&abs, &bytes),
    })
}

/// 写回 .md（统一 UTF-8）。传入 `base_hash` 时，若磁盘内容已与之不同则返回 conflict，不覆盖。
#[tauri::command]
pub async fn file_write(
    state: State<'_, AppState>,
    project_id: String,
    path: String,
    content: String,
    base_hash: Option<String>,
) -> Result<FileMeta> {
    let abs = file_path(&state, &project_id, &path, Kind::Md)?;
    if let Some(base) = base_hash {
        let current = icloud::read(abs.clone()).await?;
        if text::hash(&current) != base {
            return Err(Error::Conflict);
        }
    }
    let bytes = content.into_bytes();
    fs_ops::write_atomic(&abs, &bytes)?;
    Ok(meta_of(&abs, &bytes))
}

/// 读取 .csv 为二维数组（只读）。自动识别编码和分隔符。
#[tauri::command]
pub async fn csv_read(state: State<'_, AppState>, project_id: String, path: String) -> Result<text::CsvData> {
    let abs = file_path(&state, &project_id, &path, Kind::Csv)?;
    let bytes = icloud::read(abs).await?;
    tauri::async_runtime::spawn_blocking(move || text::parse_csv(&bytes))
        .await
        .map_err(|e| Error::Other(e.to_string()))?
}

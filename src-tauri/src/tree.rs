//! 目录树：只暴露文件夹、.md、.csv，忽略隐藏文件。

use std::{
    fs::{self, Metadata},
    path::Path,
    time::UNIX_EPOCH,
};

use serde::{Deserialize, Serialize};

use crate::{error::Result, icloud, paths};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Kind {
    Folder,
    Md,
    Csv,
}

impl Kind {
    pub fn of(path: &Path, is_dir: bool) -> Option<Kind> {
        if is_dir {
            return Some(Kind::Folder);
        }
        match path.extension()?.to_str()?.to_ascii_lowercase().as_str() {
            "md" => Some(Kind::Md),
            "csv" => Some(Kind::Csv),
            _ => None,
        }
    }

    pub fn ext(self) -> Option<&'static str> {
        match self {
            Kind::Folder => None,
            Kind::Md => Some("md"),
            Kind::Csv => Some("csv"),
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Entry {
    /// 显示名，文件不带后缀。
    pub name: String,
    pub file_name: String,
    /// 项目内相对路径，作为条目的唯一标识。
    pub path: String,
    pub kind: Kind,
    pub pinned: bool,
    /// false 表示 iCloud 文件尚未下载到本地。
    pub downloaded: bool,
    pub modified_ms: Option<u64>,
}

fn build(rel: &str, abs: &Path, meta: &Metadata, pins: &[String]) -> Option<Entry> {
    let file_name = abs.file_name()?.to_string_lossy().into_owned();
    if file_name.starts_with('.') {
        return None;
    }
    let kind = Kind::of(abs, meta.is_dir())?;
    let name = match kind {
        Kind::Folder => file_name.clone(),
        _ => abs.file_stem()?.to_string_lossy().into_owned(),
    };
    Some(Entry {
        name,
        file_name,
        path: rel.to_string(),
        kind,
        pinned: pins.iter().any(|p| p == rel),
        downloaded: !icloud::is_dataless(meta),
        modified_ms: meta
            .modified()
            .ok()
            .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
            .map(|d| d.as_millis() as u64),
    })
}

/// 单个条目；路径不存在或类型不支持时返回 None。
pub fn entry(root: &Path, rel: &str, pins: &[String]) -> Option<Entry> {
    let abs = paths::resolve(root, rel).ok()?;
    let meta = fs::metadata(&abs).ok()?;
    build(rel, &abs, &meta, pins)
}

/// 列出一层目录：文件夹在前，文件在后，各自按自然顺序排列。
pub fn list(root: &Path, rel: &str, pins: &[String]) -> Result<Vec<Entry>> {
    let dir = paths::resolve(root, rel)?;
    let mut out = Vec::new();
    for de in fs::read_dir(&dir)? {
        let de = de?;
        let abs = de.path();
        // 跟随符号链接；断开的链接直接跳过
        let Ok(meta) = fs::metadata(&abs) else { continue };
        let child = paths::join(rel, &de.file_name().to_string_lossy());
        if let Some(e) = build(&child, &abs, &meta, pins) {
            out.push(e);
        }
    }
    out.sort_by(|a, b| {
        (a.kind != Kind::Folder)
            .cmp(&(b.kind != Kind::Folder))
            .then_with(|| natord::compare_ignore_case(&a.name, &b.name))
    });
    Ok(out)
}

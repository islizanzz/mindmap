//! 项目内相对路径：统一用 `/` 分隔，空字符串表示项目根目录。

use std::path::{Component, Path, PathBuf};

use crate::error::{Error, Result};

/// 相对路径转绝对路径，拒绝 `..`、绝对路径等越出项目根目录的写法。
pub fn resolve(root: &Path, rel: &str) -> Result<PathBuf> {
    let mut out = root.to_path_buf();
    for c in Path::new(rel).components() {
        match c {
            Component::Normal(s) => out.push(s),
            Component::CurDir => {}
            _ => return Err(Error::InvalidPath(rel.into())),
        }
    }
    Ok(out)
}

pub fn to_rel(root: &Path, abs: &Path) -> Option<String> {
    let parts: Vec<String> = abs
        .strip_prefix(root)
        .ok()?
        .components()
        .filter_map(|c| match c {
            Component::Normal(s) => Some(s.to_string_lossy().into_owned()),
            _ => None,
        })
        .collect();
    Some(parts.join("/"))
}

pub fn join(parent: &str, name: &str) -> String {
    if parent.is_empty() {
        name.to_string()
    } else {
        format!("{parent}/{name}")
    }
}

pub fn parent(rel: &str) -> &str {
    rel.rsplit_once('/').map_or("", |(p, _)| p)
}

/// `rel` 等于 `ancestor` 或位于其下。
pub fn is_within(rel: &str, ancestor: &str) -> bool {
    ancestor.is_empty()
        || rel == ancestor
        || rel.strip_prefix(ancestor).is_some_and(|r| r.starts_with('/'))
}

/// 用户输入的名称：不能为空、不能以 `.` 开头（会被当成隐藏文件），不能含路径分隔符。
pub fn validate_name(name: &str) -> Result<&str> {
    let n = name.trim();
    if n.is_empty() || n.starts_with('.') || n.contains(['/', ':', '\0']) {
        return Err(Error::InvalidName);
    }
    Ok(n)
}

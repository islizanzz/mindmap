//! 对用户文件的增删改。

use std::{
    fs::{self, File, OpenOptions},
    io::Write,
    os::unix::fs::MetadataExt,
    path::Path,
};

use crate::{
    error::{Error, Result},
    paths,
    tree::Kind,
};

/// 新建文件或文件夹，`name` 不带后缀。返回新条目的相对路径。
pub fn create(root: &Path, parent: &str, name: &str, kind: Kind) -> Result<String> {
    let name = paths::validate_name(name)?;
    let file_name = match kind.ext() {
        Some(ext) => format!("{name}.{ext}"),
        None => name.to_string(),
    };
    let rel = paths::join(parent, &file_name);
    let abs = paths::resolve(root, &rel)?;
    match kind {
        Kind::Folder => fs::create_dir(&abs)?,
        _ => {
            OpenOptions::new().write(true).create_new(true).open(&abs)?;
        }
    }
    Ok(rel)
}

/// 改名，文件保留原后缀。返回新相对路径。
pub fn rename(root: &Path, rel: &str, new_name: &str) -> Result<String> {
    if rel.is_empty() {
        return Err(Error::InvalidPath(rel.into()));
    }
    let name = paths::validate_name(new_name)?;
    let abs = paths::resolve(root, rel)?;
    let meta = fs::metadata(&abs)?;
    let kind = Kind::of(&abs, meta.is_dir()).ok_or(Error::UnsupportedKind)?;
    let file_name = match kind {
        Kind::Folder => name.to_string(),
        _ => format!("{name}.{}", abs.extension().unwrap_or_default().to_string_lossy()),
    };
    rename_to(root, rel, &paths::join(paths::parent(rel), &file_name))
}

fn rename_to(root: &Path, from: &str, to: &str) -> Result<String> {
    if from == to {
        return Ok(to.into());
    }
    let a = paths::resolve(root, from)?;
    let b = paths::resolve(root, to)?;
    // 大小写不敏感的卷上，只改大小写时目标“已存在”，但其实是同一个文件
    if let Ok(mb) = fs::metadata(&b) {
        let ma = fs::metadata(&a)?;
        if (ma.dev(), ma.ino()) != (mb.dev(), mb.ino()) {
            return Err(Error::AlreadyExists);
        }
    }
    fs::rename(&a, &b)?;
    Ok(to.into())
}

/// 移到废纸篓。用 NSFileManager 而不是 Finder：不弹自动化权限、无音效，
/// 且只操作元数据，iCloud 中未下载的文件不会先被下载。
pub fn trash(abs: &Path) -> Result<()> {
    #[allow(unused_mut)]
    let mut ctx = trash::TrashContext::default();
    #[cfg(target_os = "macos")]
    {
        use trash::macos::{DeleteMethod, TrashContextExtMacos};
        ctx.set_delete_method(DeleteMethod::NsFileManager);
    }
    ctx.delete(abs).map_err(|e| Error::TrashFailed(e.to_string()))
}

/// 永久删除，仅在废纸篓不可用（如部分外接盘、网络盘）且用户确认后调用。
pub fn delete_permanently(abs: &Path) -> Result<()> {
    if fs::symlink_metadata(abs)?.is_dir() {
        fs::remove_dir_all(abs)?;
    } else {
        fs::remove_file(abs)?;
    }
    Ok(())
}

/// 先写同目录下的隐藏临时文件再 rename，写到一半崩溃也不会留下半个文件。
pub fn write_atomic(abs: &Path, bytes: &[u8]) -> Result<()> {
    let dir = abs.parent().ok_or_else(|| Error::InvalidPath(abs.display().to_string()))?;
    let name = abs.file_name().unwrap_or_default().to_string_lossy();
    let tmp = dir.join(format!(".{name}.mindmap-tmp"));
    {
        let mut f = File::create(&tmp)?;
        f.write_all(bytes)?;
        f.sync_all()?;
    }
    if let Ok(meta) = fs::metadata(abs) {
        let _ = fs::set_permissions(&tmp, meta.permissions());
    }
    fs::rename(&tmp, abs).inspect_err(|_| {
        let _ = fs::remove_file(&tmp);
    })?;
    Ok(())
}

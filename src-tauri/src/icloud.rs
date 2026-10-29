//! iCloud Drive 的文件可能已「移出本地」，只剩一个 dataless 占位。
//! stat 不会触发下载，所以列目录、判断状态都只看元数据；只有真正读内容时才会下载。

use std::{fs::Metadata, path::PathBuf, time::Duration};

use crate::error::{Error, Result};

const READ_TIMEOUT: Duration = Duration::from_secs(120);

#[cfg(target_os = "macos")]
pub fn is_dataless(meta: &Metadata) -> bool {
    use std::os::macos::fs::MetadataExt;
    const SF_DATALESS: u32 = 0x4000_0000;
    meta.st_flags() & SF_DATALESS != 0
}

#[cfg(not(target_os = "macos"))]
pub fn is_dataless(_meta: &Metadata) -> bool {
    false
}

/// 读取文件内容。dataless 文件会由系统透明下载，读取会阻塞到下载完成，
/// 所以放到阻塞线程池里并加超时，避免离线时卡住命令。
pub async fn read(path: PathBuf) -> Result<Vec<u8>> {
    let task = tauri::async_runtime::spawn_blocking(move || std::fs::read(path));
    match tokio::time::timeout(READ_TIMEOUT, task).await {
        Ok(Ok(r)) => Ok(r?),
        Ok(Err(e)) => Err(Error::Other(e.to_string())),
        Err(_) => Err(Error::IcloudTimeout),
    }
}

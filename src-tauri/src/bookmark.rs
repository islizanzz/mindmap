//! 用 macOS 书签记住项目文件夹，文件夹在 Finder 里被改名或移动后仍能找回。

use std::path::{Path, PathBuf};

#[cfg(target_os = "macos")]
pub fn create(path: &Path) -> Option<Vec<u8>> {
    use objc2_foundation::{NSString, NSURLBookmarkCreationOptions, NSURL};

    let url = NSURL::fileURLWithPath(&NSString::from_str(path.to_str()?));
    let data = url
        .bookmarkDataWithOptions_includingResourceValuesForKeys_relativeToURL_error(
            NSURLBookmarkCreationOptions::empty(),
            None,
            None,
        )
        .ok()?;
    Some(data.to_vec())
}

#[cfg(target_os = "macos")]
pub fn resolve(data: &[u8]) -> Option<PathBuf> {
    use objc2::runtime::Bool;
    use objc2_foundation::{NSData, NSURLBookmarkResolutionOptions, NSURL};

    let data = NSData::with_bytes(data);
    let mut stale = Bool::NO;
    let url = unsafe {
        NSURL::URLByResolvingBookmarkData_options_relativeToURL_bookmarkDataIsStale_error(
            &data,
            NSURLBookmarkResolutionOptions::WithoutUI | NSURLBookmarkResolutionOptions::WithoutMounting,
            None,
            &mut stale,
        )
    }
    .ok()?;
    Some(PathBuf::from(url.path()?.to_string()))
}

#[cfg(not(target_os = "macos"))]
pub fn create(_path: &Path) -> Option<Vec<u8>> {
    None
}

#[cfg(not(target_os = "macos"))]
pub fn resolve(_data: &[u8]) -> Option<PathBuf> {
    None
}

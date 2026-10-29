use serde::{ser::SerializeStruct, Serialize, Serializer};

/// 所有命令统一返回的错误。前端收到 `{ code, message }`，按 code 分支处理。
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("项目不存在")]
    ProjectNotFound,
    #[error("项目文件夹不可用")]
    ProjectUnavailable,
    #[error("项目已添加")]
    ProjectExists,
    #[error("路径无效：{0}")]
    InvalidPath(String),
    #[error("名称无效")]
    InvalidName,
    #[error("不支持的文件类型")]
    UnsupportedKind,
    #[error("已存在同名文件或文件夹")]
    AlreadyExists,
    #[error("文件或文件夹不存在")]
    NotFound,
    #[error("文件已被外部修改")]
    Conflict,
    #[error("iCloud 文件下载超时")]
    IcloudTimeout,
    #[error("无法移到废纸篓：{0}")]
    TrashFailed(String),
    #[error("{0}")]
    Io(std::io::Error),
    #[error("{0}")]
    Other(String),
}

impl From<std::io::Error> for Error {
    fn from(e: std::io::Error) -> Self {
        match e.kind() {
            std::io::ErrorKind::NotFound => Error::NotFound,
            std::io::ErrorKind::AlreadyExists => Error::AlreadyExists,
            _ => Error::Io(e),
        }
    }
}

impl Error {
    fn code(&self) -> &'static str {
        match self {
            Error::ProjectNotFound => "projectNotFound",
            Error::ProjectUnavailable => "projectUnavailable",
            Error::ProjectExists => "projectExists",
            Error::InvalidPath(_) => "invalidPath",
            Error::InvalidName => "invalidName",
            Error::UnsupportedKind => "unsupportedKind",
            Error::AlreadyExists => "alreadyExists",
            Error::NotFound => "notFound",
            Error::Conflict => "conflict",
            Error::IcloudTimeout => "icloudTimeout",
            Error::TrashFailed(_) => "trashFailed",
            Error::Io(_) => "io",
            Error::Other(_) => "other",
        }
    }
}

impl Serialize for Error {
    fn serialize<S: Serializer>(&self, s: S) -> std::result::Result<S::Ok, S::Error> {
        let mut st = s.serialize_struct("Error", 2)?;
        st.serialize_field("code", self.code())?;
        st.serialize_field("message", &self.to_string())?;
        st.end()
    }
}

pub type Result<T> = std::result::Result<T, Error>;

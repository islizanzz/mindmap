//! 应用自身的数据（项目列表、置顶），存在 Application Support 下的 state.json。
//! 不往用户的文件夹里写任何东西。

use std::{
    fs,
    path::{Path, PathBuf},
    sync::Mutex,
};

use serde::{Deserialize, Serialize};

use crate::{
    error::{Error, Result},
    paths,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Project {
    pub id: String,
    pub name: String,
    pub path: PathBuf,
    #[serde(default)]
    pub bookmark: Option<Vec<u8>>,
}

/// 一个置顶项。置顶区在侧栏最上方，跨所有项目，按置顶顺序排列。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Pin {
    pub project_id: String,
    pub path: String,
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct Data {
    #[serde(default)]
    pub projects: Vec<Project>,
    #[serde(default)]
    pub pins: Vec<Pin>,
}

impl Data {
    /// 该项目下被置顶的相对路径。
    pub fn pins_of(&self, project_id: &str) -> Vec<String> {
        self.pins
            .iter()
            .filter(|p| p.project_id == project_id)
            .map(|p| p.path.clone())
            .collect()
    }

    /// 改名后，同步更新该路径及其下的置顶。
    pub fn remap_pins(&mut self, project_id: &str, from: &str, to: &str) {
        for p in self.pins.iter_mut().filter(|p| p.project_id == project_id) {
            if paths::is_within(&p.path, from) {
                p.path = format!("{to}{}", &p.path[from.len()..]);
            }
        }
    }

    /// 删除后，去掉该路径及其下的置顶；`rel` 为 "" 时去掉整个项目的置顶。
    pub fn drop_pins(&mut self, project_id: &str, rel: &str) {
        self.pins
            .retain(|p| p.project_id != project_id || !paths::is_within(&p.path, rel));
    }

    pub fn project_mut(&mut self, id: &str) -> Result<&mut Project> {
        self.projects
            .iter_mut()
            .find(|p| p.id == id)
            .ok_or(Error::ProjectNotFound)
    }
}

pub struct Store {
    file: PathBuf,
    data: Mutex<Data>,
}

impl Store {
    pub fn load(file: PathBuf) -> Self {
        let data = fs::read(&file)
            .ok()
            .and_then(|b| serde_json::from_slice(&b).ok())
            .unwrap_or_default();
        Self {
            file,
            data: Mutex::new(data),
        }
    }

    pub fn read<R>(&self, f: impl FnOnce(&Data) -> R) -> R {
        f(&self.data.lock().unwrap())
    }

    /// 修改并立即落盘；`f` 返回错误时不保存。
    pub fn update<R>(&self, f: impl FnOnce(&mut Data) -> Result<R>) -> Result<R> {
        let mut data = self.data.lock().unwrap();
        let r = f(&mut data)?;
        save(&self.file, &data)?;
        Ok(r)
    }

    pub fn project(&self, id: &str) -> Result<Project> {
        self.read(|d| d.projects.iter().find(|p| p.id == id).cloned())
            .ok_or(Error::ProjectNotFound)
    }

    pub fn root(&self, id: &str) -> Result<PathBuf> {
        let path = self.project(id)?.path;
        if path.is_dir() {
            Ok(path)
        } else {
            Err(Error::ProjectUnavailable)
        }
    }
}

fn save(file: &Path, data: &Data) -> Result<()> {
    let json = serde_json::to_vec_pretty(data).map_err(|e| Error::Other(e.to_string()))?;
    crate::fs_ops::write_atomic(file, &json)
}

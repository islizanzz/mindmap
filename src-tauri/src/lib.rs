mod bookmark;
mod commands;
mod error;
mod fs_ops;
mod icloud;
mod menu;
mod paths;
mod store;
mod text;
mod tree;
mod watcher;

use tauri::Manager;

use commands::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .menu(menu::build)
        .on_menu_event(menu::on_event)
        .setup(|app| {
            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;

            let dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&dir)?;
            let state = AppState {
                store: store::Store::load(dir.join("state.json")),
                watchers: watcher::Watchers::default(),
            };
            for p in state.store.read(|d| d.projects.clone()) {
                if p.path.is_dir() {
                    state.watchers.watch(app.handle(), &p.id, &p.path);
                }
            }
            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::project_list,
            commands::project_add,
            commands::project_rename,
            commands::project_remove,
            commands::project_reorder,
            commands::tree_list,
            commands::pin_list,
            commands::pin_set,
            commands::pin_reorder,
            commands::entry_create,
            commands::entry_rename,
            commands::entry_trash,
            commands::entry_delete_permanently,
            commands::file_read,
            commands::file_write,
            commands::csv_read,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use std::fs;

    use crate::{bookmark, fs_ops, paths, store::{Data, Pin}, text, tree};

    fn tmp(name: &str) -> std::path::PathBuf {
        let d = std::env::temp_dir().join(format!("mindmap-test-{name}-{}", std::process::id()));
        let _ = fs::remove_dir_all(&d);
        fs::create_dir_all(&d).unwrap();
        fs::canonicalize(d).unwrap()
    }

    #[test]
    fn rejects_escaping_paths() {
        let root = std::path::Path::new("/r");
        assert!(paths::resolve(root, "../x").is_err());
        assert!(paths::resolve(root, "/etc").is_err());
        assert_eq!(paths::resolve(root, "a/b.md").unwrap(), root.join("a/b.md"));
    }

    #[test]
    fn pins_follow_rename_and_delete() {
        let pin = |id: &str, path: &str| Pin { project_id: id.into(), path: path.into() };
        let mut d = Data { projects: vec![], pins: vec![pin("1", "a"), pin("2", "a"), pin("1", "a/b.md"), pin("1", "ab.md")] };
        d.remap_pins("1", "a", "z");
        assert_eq!(d.pins_of("1"), ["z", "z/b.md", "ab.md"]);
        assert_eq!(d.pins_of("2"), ["a"]);
        d.drop_pins("1", "z");
        assert_eq!(d.pins, [pin("2", "a"), pin("1", "ab.md")]);
        d.drop_pins("1", "");
        assert_eq!(d.pins, [pin("2", "a")]);
    }

    #[test]
    fn tree_filters_and_sorts() {
        let root = tmp("tree");
        fs::create_dir(root.join("文件夹2")).unwrap();
        fs::create_dir(root.join("文件夹10")).unwrap();
        for f in ["b.md", "a.CSV", "x.txt", ".hidden.md"] {
            fs::write(root.join(f), "").unwrap();
        }
        let list = tree::list(&root, "", &["b.md".into()]).unwrap();
        let names: Vec<_> = list.iter().map(|e| e.name.as_str()).collect();
        assert_eq!(names, ["文件夹2", "文件夹10", "a", "b"]);
        assert!(list[3].pinned && list[3].downloaded);
    }

    #[test]
    fn create_rename_trash() {
        let root = tmp("ops");
        let dir = fs_ops::create(&root, "", "笔记", tree::Kind::Folder).unwrap();
        let f = fs_ops::create(&root, &dir, "想法", tree::Kind::Md).unwrap();
        assert_eq!(f, "笔记/想法.md");
        assert!(fs_ops::create(&root, &dir, "想法", tree::Kind::Md).is_err());
        let f = fs_ops::rename(&root, &f, "灵感").unwrap();
        assert_eq!(f, "笔记/灵感.md");
        assert!(fs_ops::rename(&root, &dir, "a/b").is_err());
        fs_ops::write_atomic(&root.join(&f), "- a\n  - b\n".as_bytes()).unwrap();
        assert_eq!(fs::read_to_string(root.join(&f)).unwrap(), "- a\n  - b\n");
        fs_ops::trash(&root.join(&f)).unwrap();
        assert!(!root.join(&f).exists());
    }

    #[test]
    fn bookmark_finds_moved_folder() {
        let root = tmp("bm");
        let a = root.join("a");
        fs::create_dir(&a).unwrap();
        let bm = bookmark::create(&a).unwrap();
        fs::rename(&a, root.join("b")).unwrap();
        assert_eq!(bookmark::resolve(&bm).unwrap(), root.join("b"));
    }

    #[test]
    fn csv_gbk_and_delimiter() {
        let (gbk, _, _) = encoding_rs::GBK.encode("姓名;年龄\n张三;18\n");
        let d = text::parse_csv(&gbk).unwrap();
        assert_eq!(d.encoding, "GBK");
        assert_eq!(d.delimiter, ";");
        assert_eq!(d.rows, [["姓名", "年龄"], ["张三", "18"]]);
    }
}

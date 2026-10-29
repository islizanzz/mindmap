//! 菜单栏：在系统默认菜单的基础上，给应用菜单加一项「检查更新…」。

use tauri::{
    menu::{Menu, MenuEvent, MenuItem, MenuItemKind},
    AppHandle, Emitter, Runtime,
};

const CHECK_UPDATE: &str = "check-update";

/// 点「检查更新…」时发给前端的事件，由前端完成检查、下载和重启。
pub const CHECK_UPDATE_EVENT: &str = "menu-check-update";

pub fn build<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<Menu<R>> {
    let menu = Menu::default(app)?;
    // macOS 上第一个子菜单是应用菜单（「mindmap」），放在「关于」下面
    if let Some(MenuItemKind::Submenu(app_menu)) = menu.items()?.into_iter().next() {
        let item = MenuItem::with_id(app, CHECK_UPDATE, "检查更新…", true, None::<&str>)?;
        app_menu.insert(&item, 1)?;
    }
    Ok(menu)
}

pub fn on_event<R: Runtime>(app: &AppHandle<R>, event: MenuEvent) {
    if event.id() == CHECK_UPDATE {
        let _ = app.emit(CHECK_UPDATE_EVENT, ());
    }
}

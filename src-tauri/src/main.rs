// 发布版不弹出终端窗口（仅对 Windows 有意义）
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    mindmap_lib::run()
}

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Menu, Submenu, CustomMenuItem};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn open_in_finder(path: String) {
    // macOSのFinderを開く
    let _ = std::process::Command::new("open")
        .arg(path)
        .spawn();
}

fn main() {
    let open_menu = CustomMenuItem::new("open", "プロジェクトを開く");
    let file_menu = Submenu::new(
        "ファイル",
        Menu::new()
            .add_item(open_menu)
    );

    tauri::Builder::default()
        .menu(Menu::new().add_submenu(file_menu))
        .on_menu_event(|event| match event.menu_item_id() {
            "open" => {
                event.window().emit("open", {}).unwrap();
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![open_in_finder])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
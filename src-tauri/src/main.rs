// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Menu, Submenu, CustomMenuItem};

#[tauri::command]
fn open_in_finder(path: String) {
    // macOSのFinderを開く
    let _ = std::process::Command::new("open")
        .arg(&path)
        .spawn();
}

#[tauri::command]
fn install_typescript(path: String) {
    std::env::set_current_dir(&path).expect("Failed to change directory");
    
    let _ = std::process::Command::new("npm")
        .arg("install")
        .args(["typescript", "ts-node"])
        .spawn();
}

#[tauri::command]
fn run_flow(project_path: String, flow_id: String) {
    std::env::set_current_dir(&project_path).expect("Failed to change directory");

    let _ = std::process::Command::new("npm")
        .arg("run")
        .arg("start")
        .arg(format!("./pasta/{}", &flow_id))
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
        .invoke_handler(tauri::generate_handler![
            open_in_finder,
            install_typescript,
            run_flow
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
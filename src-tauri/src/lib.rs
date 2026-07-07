mod handlers;
mod services;
mod platform;
mod database;


use std::sync::Mutex;

use tauri::Manager;
use tauri_plugin_log::Target;

use database::db::*;
use handlers::dns::*;
use handlers::interface::*;
use handlers::config::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .clear_targets()
                .target(Target::new(tauri_plugin_log::TargetKind::LogDir {
                    file_name: Some("out-dns-logs".to_string()),
                }))
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .max_file_size(50_000)
                .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let conn = init_db(&app.handle());
            app.manage(DbState(Mutex::new(conn)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            flush_dns,
            get_interfaces,
            get_dns_from_db,
            remove_dns,
            new_dns,
            set_dns,
            lookup,
            // configs
            get_configs,
            toggle_flush_dns_on_change,
            toggle_autostart,
            toggle_close_to_tray,
            toggle_minimize_to_tray,
            open_log_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

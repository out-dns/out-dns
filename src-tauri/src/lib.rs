mod handlers;

use std::sync::Mutex;

use handlers::database::{init_db, DbState};
use handlers::dns::new_dns;
use handlers::dns::remove_dns;
use handlers::dns::resolve;
use handlers::dns::set_dns;
use handlers::dns::{flush_dns, get_dns_from_db};
use handlers::interface::get_network_interfaces;
// configs
use handlers::config::get_configs;
use handlers::config::open_log_folder;
use handlers::config::set_autostart;
use handlers::config::set_close_to_tray;
use handlers::config::set_flush_dns_on_change;
use handlers::config::set_minimize_to_tray;

use is_elevated::is_elevated;
use tauri::Manager;
use tauri_plugin_log::Target;

#[tauri::command]
fn privilege() -> Result<bool, bool> {
    if !is_elevated() {
        return Err(false);
    }
    Ok(true)
}

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
            privilege,
            flush_dns,
            get_network_interfaces,
            get_dns_from_db,
            remove_dns,
            new_dns,
            set_dns,
            resolve,
            // configs
            get_configs,
            set_flush_dns_on_change,
            set_autostart,
            set_close_to_tray,
            set_minimize_to_tray,
            open_log_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

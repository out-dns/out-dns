mod handlers;

use std::sync::Mutex;

use handlers::network_interfaces::{get_network_interfaces};
use handlers::dns::{clear_cache,get_dns_from_db};
use handlers::database::{DbState, init_db};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let conn = init_db(&app.handle());
            app.manage(DbState(Mutex::new(conn)));
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
                clear_cache,
                get_network_interfaces,
                get_dns_from_db
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

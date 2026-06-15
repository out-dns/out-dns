mod handlers;

use std::sync::Mutex;

use handlers::network_interfaces::{get_network_interfaces};
use handlers::dns::{flush_dns,get_dns_from_db};
use handlers::database::{DbState, init_db};
use handlers::dns::{remove_dns};
use handlers::dns::{new_dns};
use handlers::dns::{set_dns};
use handlers::dns::{resolve};
// configs
use handlers::config::{get_configs};
use handlers::config::{set_flush_dns_on_change};
use handlers::config::{set_run_on_start};
use handlers::config::{set_close_to_tray};
use handlers::config::{set_minimize_to_tray};

use is_elevated::is_elevated;
use tauri::Manager;

#[tauri::command]
fn privilege() -> Result<bool,bool> {
    if !is_elevated(){
        return Err(false);
    }
    Ok(true)
}

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
                set_run_on_start,
                set_close_to_tray,
                set_minimize_to_tray
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use crate::{database::{config_repository::{Configs}, db::DbState}, services::config_service};

#[tauri::command]
pub fn get_configs(state: tauri::State<DbState>) -> Result<Configs, ()> {
    config_service::get_configs(&state)
}

#[tauri::command]
pub fn toggle_flush_dns_on_change(
    value: bool,
    state: tauri::State<DbState>,
) -> Result<(), String> {
    config_service::toggle_flush_dns_on_change(value, &state)
}

#[tauri::command]
pub fn toggle_autostart(value: bool, state: tauri::State<DbState>) -> Result<(), String> {
    config_service::toggle_autostart(value, &state)
}

#[tauri::command]
pub fn toggle_minimize_to_tray(value: bool, state: tauri::State<DbState>) -> Result<(), String> {
    config_service::toggle_minimize_to_tray(value, &state)
}

#[tauri::command]
pub fn toggle_close_to_tray(value: bool, state: tauri::State<DbState>) -> Result<(), String> {
    config_service::toggle_close_to_tray(value, &state)
}

#[tauri::command]
pub fn open_log_folder(app: tauri::AppHandle) -> Result<(), ()> {
    config_service::open_log_folder(&app)
}


use crate::services::interface_service;

#[tauri::command]
pub fn get_interfaces() -> Result<Vec<String>, ()> {
    interface_service::get_interfaces()
}
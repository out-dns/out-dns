
use crate::{database::db::DbState,database::dns_repository::DnsEntries, services::dns_service};

#[tauri::command]
pub fn flush_dns() -> Result<(), String> {
    dns_service::flush_dns()
}

#[tauri::command]
pub fn get_dns_from_db(state: tauri::State<DbState>) -> Result<Vec<DnsEntries>, ()> {
    dns_service::get_dns_from_db(state.inner())
}

#[tauri::command]
pub fn remove_dns(id: i64, state: tauri::State<DbState>) -> Result<(), ()> {
    dns_service::remove_dns(id, state.inner())
}

#[tauri::command]
pub fn new_dns(
    name: &str,
    primary: &str,
    secondary: &str,
    state: tauri::State<DbState>,
) -> Result<(), ()> {
    dns_service::new_dns(name, primary, secondary, state.inner())
}

#[tauri::command]
pub async fn set_dns(
    interface: &str,
    primary: &str,
    secondary: &str,
    state: tauri::State<'_,DbState>
) -> Result<(), String> {
    dns_service::set_dns(interface, primary, secondary, state)
}

#[tauri::command]
pub async fn lookup(ip: &str) -> Result<u128, String> {
    dns_service::lookup(ip).await
}

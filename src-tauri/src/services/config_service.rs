use tauri::AppHandle;
use tauri_plugin_log::log;

use crate::{database::{config_repository::{ConfigTypes, Configs, get, update}, db::DbState}, platform::config};

pub fn get_configs(state: &DbState) -> Result<Configs, ()> {
    get(state)
}

pub fn toggle_flush_dns_on_change(value: bool, state: &DbState) -> Result<(), String>{
    update(&state,ConfigTypes::FlushDnsOnChange, value)
}

pub fn toggle_autostart(value: bool, state: &DbState) -> Result<(), String> {
    config().toggle_autostart(value).map_err(|e| {log::error!("{:?}", e); format!("unable to toggle autostart. {:?}",e)})?;
    update(&state,ConfigTypes::Autostart, value)
}

pub fn toggle_minimize_to_tray(value: bool, state: &DbState) -> Result<(), String> {
    update(&state,ConfigTypes::MinimizeToTray, value)
}

pub fn toggle_close_to_tray(value: bool, state: &DbState) -> Result<(), String> {
    update(&state,ConfigTypes::CloseToTray, value)
}

pub fn open_log_folder(app: &AppHandle) -> Result<(), ()> {
    config().open_log_folder(app)
}
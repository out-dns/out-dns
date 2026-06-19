use crate::handlers::database::DbState;
use serde::{Deserialize, Serialize};
use std::{os::windows::process::CommandExt, process::Command};
use tauri::Manager;
use tauri_plugin_log::log;
#[derive(Serialize, Deserialize)]
pub struct Configs {
    pub id: i32,
    pub flush_dns_on_change: bool,
    pub autostart: bool,
    pub minimize_to_tray: bool,
    pub close_to_tray: bool,
}
#[tauri::command]
pub fn get_configs(state: tauri::State<DbState>) -> Result<Configs, ()> {
    let db = state.0.lock().map_err(|e|{log::error!("{:?}", e)})?;

    let result = db.query_row("
        SELECT id, flush_dns_on_change, autostart, minimize_to_tray, close_to_tray FROM configs WHERE id = 1", 
        [],
        |row| {
        Ok(Configs{
            id:                  row.get(0)?,
            flush_dns_on_change: row.get(1)?,
            autostart:           row.get(2)?,
            minimize_to_tray:    row.get(3)?,
            close_to_tray:       row.get(4)?,
        })
    }).map_err(|e|{log::error!("{:?}", e)})?;

    Ok(result)
}

#[tauri::command]
pub fn set_flush_dns_on_change(
    value: bool,
    state: tauri::State<DbState>,
) -> Result<(), ()> {
    let db = state.0.lock().map_err(|e|{log::error!("{:?}", e)})?;
    db.execute(
        "
        UPDATE configs SET flush_dns_on_change = ?1 WHERE id = 1",
        [value as i32],
    )
    .map_err(|e|{log::error!("{:?}", e)})?;

    Ok(())
}

#[tauri::command]
pub fn set_autostart(value: bool, state: tauri::State<DbState>) -> Result<(), ()> {
    let db = state.0.lock().map_err(|e| log::error!("{:?}" , e))?;
    db.execute(
        "
        UPDATE configs SET autostart = ?1 WHERE id = 1",
        [value],
    )
    .map_err(|e| log::error!("{:?}" , e))?;

    let app_dir: std::path::PathBuf = std::env::current_exe().map_err(|e| log::error!("{:?}" , e))?;
    let tr_arg = format!("\"{}\" --autostart", app_dir.to_string_lossy());
    let output = if value {
        Command::new("schtasks")
            .args([
                "/create", "/tn", "out-dns", "/tr", &tr_arg, "/sc", "onlogon", "/rl", "highest",
                "/f",
            ])
            .creation_flags(0x08000000)
            .output()
            .map_err(|e| log::error!("{:?}" , e))?
    } else {
        Command::new("schtasks")
            .args(["/delete", "/tn", "out-dns", "/f"])
            .creation_flags(0x08000000)
            .output()
            .map_err(|e| log::error!("{:?}" , e))?
    };

    if !output.status.success() {
        return Err(());
    }

    Ok(())
}

#[tauri::command]
pub fn set_minimize_to_tray(value: bool, state: tauri::State<DbState>) -> Result<(), ()> {
    let db = state.0.lock().map_err(|e| log::error!("{:?}" , e))?;
    db.execute(
        "
        UPDATE configs SET minimize_to_tray = ?1 WHERE id = 1",
        [value as i32],
    )
    .map_err(|e| log::error!("{:?}" , e))?;

    Ok(())
}

#[tauri::command]
pub fn set_close_to_tray(value: bool, state: tauri::State<DbState>) -> Result<(), ()> {
    let db = state.0.lock().map_err(|e| log::error!("{:?}" , e))?;
    db.execute(
        "
        UPDATE configs SET close_to_tray = ?1 WHERE id = 1",
        [value as i32],
    )
    .map_err(|e| log::error!("{:?}" , e))?;

    Ok(())
}

#[tauri::command]
pub fn open_log_folder(app: tauri::AppHandle) -> Result<(), ()> {
    let log_dir = app.path().app_log_dir().map_err(|e| log::error!("{:?}", e))?;
    Command::new("explorer")
        .arg(log_dir)
        .output()
        .map_err(|e| log::error!("{:?}", e))?;

    Ok(())
}

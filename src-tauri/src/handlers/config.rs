use serde::{Deserialize, Serialize};

use crate::handlers::database::DbState;

#[derive(Serialize, Deserialize)]
pub struct Configs{
    pub id: i32,
    pub flush_dns_on_change: bool,
    pub run_on_start: bool,
    pub minimize_to_tray: bool,
    pub close_to_tray: bool
}
#[tauri::command]
pub fn get_configs(state: tauri::State<DbState>) -> Result<Configs, String>{
    let db = state.0.lock().map_err(|e|{e.to_string()})?;

    let result = db.query_row("
        SELECT id, flush_dns_on_change, run_on_start, minimize_to_tray, close_to_tray FROM configs WHERE id = 1", 
        [], 
        |row| {
        Ok(Configs{
            id:                  row.get(0)?,
            flush_dns_on_change: row.get(1)?,
            run_on_start:        row.get(2)?,
            minimize_to_tray:    row.get(3)?,
            close_to_tray:       row.get(4)?,
        })
    }).map_err(|e|{e.to_string()})?;

    Ok(result)
}

#[tauri::command]
pub fn set_flush_dns_on_change(value: bool, state: tauri::State<DbState>) -> Result<String, String>{
    let db = state.0.lock().map_err(|e| {e.to_string()})?;
    db.execute("
        UPDATE configs SET flush_dns_on_change = ?1 WHERE id = 1
    ", [value as i32]).map_err(|e|{e.to_string()})?;

    Ok("successful".to_string())
}

#[tauri::command]
pub fn set_run_on_start(value: bool, state: tauri::State<DbState>) -> Result<String, String>{
    let db = state.0.lock().map_err(|e| {e.to_string()})?;
    db.execute("
        UPDATE configs SET run_on_start = ?1 WHERE id = 1
    ", [value as i32]).map_err(|e|{e.to_string()})?;

    Ok("successful".to_string())
}

#[tauri::command]
pub fn set_minimize_to_tray(value: bool, state: tauri::State<DbState>) -> Result<String, String>{
    let db = state.0.lock().map_err(|e| {e.to_string()})?;
    db.execute("
        UPDATE configs SET minimize_to_tray = ?1 WHERE id = 1
    ", [value as i32]).map_err(|e|{e.to_string()})?;

    Ok("successful".to_string())
}

#[tauri::command]
pub fn set_close_to_tray(value: bool, state: tauri::State<DbState>) -> Result<String, String>{
    let db = state.0.lock().map_err(|e| {e.to_string()})?;
    db.execute("
        UPDATE configs SET close_to_tray = ?1 WHERE id = 1
    ", [value as i32]).map_err(|e|{e.to_string()})?;

    Ok("successful".to_string())
}
use serde::{Deserialize, Serialize};
use tauri_plugin_log::log;

use crate::database::db::DbState;

#[derive(Serialize, Deserialize)]
pub struct Configs {
    pub id: i32,
    pub flush_dns_on_change: bool,
    pub autostart: bool,
    pub minimize_to_tray: bool,
    pub close_to_tray: bool,
}

pub enum ConfigTypes {
    FlushDnsOnChange,
    Autostart,
    MinimizeToTray,
    CloseToTray
}
impl ConfigTypes {
    pub fn as_str(&self) -> &'static str {
        match self {
            ConfigTypes::FlushDnsOnChange => "flush_dns_on_change",
            ConfigTypes::Autostart => "autostart",
            ConfigTypes::MinimizeToTray => "minimize_to_tray",
            ConfigTypes::CloseToTray => "close_to_tray",
        }
    }
}

// get all configs list
pub fn get(state: &DbState) -> Result<Configs, ()> {
    let db = state.0.lock().map_err(|e|{log::error!("{e}")})?;

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
    }).map_err(|e|{log::error!("{e}")})?;

    Ok(result)
}
// update an existing record in configs table
pub fn update(state: &DbState, col: ConfigTypes, value: bool) -> Result<(), String> {
    let column = col.as_str();

    let db = state.0.lock().map_err(|e|{log::error!("{e}"); e.to_string()})?;

    let query = format!("UPDATE configs SET {} = ?1 WHERE id = 1", column);

    let row = db.execute(&query,[value as i32]).map_err(|e|{log::error!("{e}"); e.to_string()})?;

    if row == 0 {
        Err(format!("{row} row was updated"))
    }else {
        Ok(())
    }
}

use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri_plugin_log::log::{self};

use crate::database::db::DbState;

#[derive(Serialize, Deserialize)]
pub struct DnsEntries {
    id: i32,
    name: String,
    primary_dns: String,
    secondary_dns: String,
    display_order: i32,
}
// insert new dns record into database
pub fn insert(name: &str, primary: &str, secondary: &str, state: &DbState) -> Result<(), ()>{
    let db = state.0.lock().map_err(|e| log::error!("{}", e))?;
    let mut display_order: i32 = db.query_row("
            SELECT COALESCE(MAX(display_order), 0) FROM dns_entries
            ",[],
            |row| row.get(0),
        )
        .map_err(|e| log::error!("{}", e))?;

    display_order += 1;

    let row_inserted = db.execute("
        INSERT INTO dns_entries (name, primary_dns, secondary_dns, display_order) VALUES(?1, ?2, ?3, ?4)
        ", params![name, primary, secondary, display_order])
    .map_err(|e| log::error!("{}", e))?;

    if row_inserted == 0 {
        return Err(());
    }

    Ok(())
}
// update an existing dns record in database
// pub fn update() -> Result<(), ()>{
//     Ok(())
// }
// delete an existing dns record from database
pub fn delete(id: i64, state: &DbState) -> Result<(), ()>{
    let db = state.0.lock().map_err(|e| log::error!("{}", e))?;
    let row_affected = db
        .execute("DELETE FROM dns_entries WHERE id = ?1", params![id])
        .map_err(|e| log::error!("{}", e))?;

    if row_affected == 0 {
        return Err(());
    }

    Ok(())
}
// get all dns records in database
pub fn get(state: &DbState) -> Result<Vec<DnsEntries>, ()>{
    let db = state.0.lock().map_err(|e| log::error!("{}", e))?;
    let mut stmt = db
        .prepare("SELECT * FROM dns_entries ORDER BY display_order")
        .map_err(|e| log::error!("{}", e))?;

    let result = stmt
        .query_map([], |row| {
            Ok(DnsEntries {
                id: row.get(0)?,
                name: row.get(1)?,
                primary_dns: row.get(2)?,
                secondary_dns: row.get(3)?,
                display_order: row.get(4)?,
            })
        })
        .map_err(|e| log::error!("{}", e))?
        .filter_map(|r| r.ok())
        .collect();

    Ok(result)
}


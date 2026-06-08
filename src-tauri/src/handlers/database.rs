use rusqlite::{Connection};
use tauri::Manager;
use std::sync::Mutex;

pub struct DbState(pub Mutex<Connection>);

pub fn init_db(app: &tauri::AppHandle) -> Connection{
    let mut db_path = app.path().app_data_dir().expect("could not get AppData dir");

    std::fs::create_dir_all(&db_path).expect("could not create app data dir");
    db_path.push("out-dns.db");

    let conn = Connection::open(&db_path).expect("failed to open database");

    conn.execute_batch("
        CREATE TABLE IF NOT EXISTS dns_entries (
            id    INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT    NOT NULL,
            Primary_dns TEXT    NOT NULL,
            Secondary_dns  TEXT    NOT NULL
        );
    ").expect("failed to create tables");

    return conn;
}
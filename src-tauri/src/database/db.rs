use rusqlite::Connection;
use std::sync::Mutex;
use tauri::Manager;

pub struct DbState(pub Mutex<Connection>);

pub fn init_db(app: &tauri::AppHandle) -> Connection {
    let mut db_path = app
        .path()
        .app_data_dir()
        .expect("could not get AppData dir");

    std::fs::create_dir_all(&db_path).expect("could not create app data dir");
    db_path.push("out-dns.db");

    let conn = Connection::open(&db_path).expect("failed to open database");

    conn.execute_batch("
        CREATE TABLE IF NOT EXISTS dns_entries (
            id              INTEGER     PRIMARY     KEY     AUTOINCREMENT,
            name            TEXT        NOT NULL,
            primary_dns     TEXT        NOT NULL,
            secondary_dns   TEXT        NOT NULL,
            display_order           INTEGER     NOT NULL
            );
        CREATE TABLE IF NOT EXISTS configs (
            id                      INTEGER     PRIMARY     KEY     AUTOINCREMENT,
            flush_dns_on_change     INTEGER NOT NULL DEFAULT 1,
            autostart               INTEGER NOT NULL DEFAULT 0,
            minimize_to_tray        INTEGER NOT NULL DEFAULT 0,
            close_to_tray           INTEGER NOT NULL DEFAULT 0
        );
        INSERT OR IGNORE INTO configs (id, flush_dns_on_change, autostart, minimize_to_tray, close_to_tray) VALUES (1, 1, 0, 0, 0);
        INSERT OR IGNORE INTO dns_entries (id, name, primary_dns, secondary_dns, display_order) VALUES (1, 'cloudflare', '1.1.1.1', '1.0.0.1', 1);
        INSERT OR IGNORE INTO dns_entries (id, name, primary_dns, secondary_dns, display_order) VALUES (2, 'google', '8.8.8.8', '8.8.4.4', 2);
    ").expect("failed to configure database");
    conn
}

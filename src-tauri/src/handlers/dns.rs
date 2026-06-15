use std::time::Instant;
use hickory_resolver::{TokioAsyncResolver, config::{NameServerConfigGroup, ResolverConfig, ResolverOpts}};
use rusqlite::params;
use std::os::windows::process::CommandExt;
use serde::{Serialize, Deserialize};
use crate::handlers::database::DbState;

use super::config;
use super::config::Configs;

#[tauri::command]
pub fn flush_dns() -> Result<String, String>{
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("ipconfig")
            .args(["/flushdns"])
            .creation_flags(0x08000000)
            .output()
            .map_err(|e| e.to_string())?;
    }
    
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("systemctl")
        .args(["/restart" , "systemd-resolved"])
        .output()
        .map_err(|e| e.to_string())?;
    }   

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("dscacheutil")
        .args(["-flushcache"])
        .output()
        .map_err(|e| e.to_string())?;

        std::process::Command::new("killall")
        .args(["-HUP", "mDNSResponder"])
        .output()
        .map_err(|e| e.to_string())?;
    }


    Ok("cache cleared successfully".to_string())
}

#[derive(Serialize, Deserialize)]
pub struct DnsEntries{
    id: i32,
    name: String,
    primary_dns: String,
    secondary_dns: String,
    display_order: i32
}
#[tauri::command]
pub fn get_dns_from_db(state: tauri::State<DbState>) -> Result<Vec<DnsEntries>, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = db.prepare("
        SELECT * FROM dns_entries ORDER BY display_order
    ")
    .map_err(|e|{e.to_string()})?;
    
    let result = stmt.query_map([], |row|{
        Ok(DnsEntries{
            id: row.get(0)?,
            name: row.get(1)?,
            primary_dns: row.get(2)?,
            secondary_dns: row.get(3)?,
            display_order: row.get(4)?
        })
    })
    .map_err(|e|{e.to_string()})?
    .filter_map(|r|{r.ok()})
    .collect();

    Ok(result)
}

#[tauri::command]
pub  fn remove_dns(id: i64, state: tauri::State<DbState>) -> Result<String, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    let  row_affected = db.execute("DELETE FROM dns_entries WHERE id = ?1", params![id])
    .map_err(|e|{e.to_string()})?;
    
    if row_affected == 0 {
        return Err(format!("No record found with id {}", id));
    }

    Ok(format!("Deleted record with id {}", id))
}

#[tauri::command]
pub  fn new_dns(name: String, address1: String, address2: String, state: tauri::State<DbState>) -> Result<String, String> {
    let db = state.0.lock().map_err(|e|{e.to_string()})?;
    let mut display_order: i32 = db.query_row("
        SELECT COALESCE(MAX(display_order), 0) FROM dns_entries
    ", [], |row| row.get(0)).map_err(|e|{e.to_string()})?;
    display_order += 1;
    let row_inserted = db.execute("
        INSERT INTO dns_entries (name, primary_dns, secondary_dns, display_order) VALUES(?1, ?2, ?3, ?4)", 
        params![name, address1, address2, display_order])
    .map_err(|e|{e.to_string()})?;

    if row_inserted == 0 {
        return Err("failed to insert".to_string());
    }

    Ok("inserted successfully".to_string())
}

#[tauri::command]
pub fn set_dns(
    state: tauri::State<DbState>,
    interface: String,
    primary: String,
    secondary: String,
    ) -> Result<String, String> {
    if !is_elevated::is_elevated() {
        return Err("admin privilege required!".to_string());
    }
    let output = std::process::Command::new("powershell")
        .args([
            "-Command",
            &format!(
                "Set-DnsClientServerAddress -InterfaceAlias '{}' -ServerAddresses ('{}','{}')",
                interface, primary, secondary
            ),
        ])
        .creation_flags(0x08000000)
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    // flush dns on change based on app configuration
    let configs: Configs = config::get_configs(state)?;
    if configs.flush_dns_on_change{
        flush_dns().map_err(|e| e.to_string())?;
    }
    
    Ok("successful".to_string())
}


#[tauri::command]
pub async fn resolve(dns_server: String) -> Result<u128, String>{
    let dns_port = 53;
    let domain = "www.google.com.";

    let config = ResolverConfig::from_parts(
        None, 
        vec![], 
        NameServerConfigGroup::from_ips_clear(
            &[dns_server.trim().parse().map_err(|_| format!("Invalid DNS Ip Address: {}",dns_server.trim()))?], 
            dns_port, 
            true)
        );
    let mut opts = ResolverOpts::default();
    opts.cache_size = 0;
    opts.timeout = std::time::Duration::from_secs(3);

    let resolver = TokioAsyncResolver::tokio(config, opts);

    let runs: u128 = 5;
    let mut total_ms: u128 = 0;
    let mut failures: u128 = 0;

    for _i in 1..=runs {
        let start = Instant::now();
        match resolver.lookup_ip(domain).await {
            Ok(_) => {
                let ms = start.elapsed().as_millis();
                total_ms += ms;
            }
            Err(_) => {
                failures += 1;
            }
        }
    }

    if failures > 0 {
        return Err(format!("{} failure attempts of {}", failures,runs));
    }else {
        Ok(total_ms / (runs - failures))
    }
}
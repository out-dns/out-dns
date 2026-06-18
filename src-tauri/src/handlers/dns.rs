use super::interface::{get_interface_guid_by_name};
use super::config;
use super::config::Configs;
use crate::handlers::database::DbState;
use crate::handlers::interface::get_network_interfaces;
use hickory_resolver::{
    config::{NameServerConfigGroup, ResolverConfig, ResolverOpts},
    TokioAsyncResolver,
};
use rusqlite::params;
use serde::{Deserialize, Serialize};
use std::os::windows::process::CommandExt;
use std::time::Instant;
use tauri_plugin_log::log;
use windows::Win32::NetworkManagement::IpHelper::{
    SetInterfaceDnsSettings, DNS_INTERFACE_SETTINGS, DNS_INTERFACE_SETTINGS_VERSION1,
    DNS_SETTING_NAMESERVER,
};
use windows::core::{PWSTR};


#[tauri::command]
pub fn flush_dns() -> Result<(), ()> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("ipconfig")
            .args(["/flushdns"])
            .creation_flags(0x08000000)
            .output()
            .map_err(|_| {})?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("systemctl")
            .args(["/restart", "systemd-resolved"])
            .output()
            .map_err(|_| {})?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("dscacheutil")
            .args(["-flushcache"])
            .output()
            .map_err(|_| {})?;

        std::process::Command::new("killall")
            .args(["-HUP", "mDNSResponder"])
            .output()
            .map_err(|_| {})?;
    }

    Ok(())
}

#[derive(Serialize, Deserialize)]
pub struct DnsEntries {
    id: i32,
    name: String,
    primary_dns: String,
    secondary_dns: String,
    display_order: i32,
}
#[tauri::command]
pub fn get_dns_from_db(state: tauri::State<DbState>) -> Result<Vec<DnsEntries>, ()> {
    let db = state.0.lock().map_err(|e| {log::error!("{}", e)})?;
    let mut stmt = db
        .prepare("SELECT * FROM dns_entries ORDER BY display_order")
        .map_err(|e| {log::error!("{}", e)})?;

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
        .map_err(|e| {log::error!("{}", e)})?
        .filter_map(|r| r.ok())
        .collect();

    Ok(result)
}

#[tauri::command]
pub fn remove_dns(id: i64, state: tauri::State<DbState>) -> Result<String, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    let row_affected = db
        .execute("DELETE FROM dns_entries WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;

    if row_affected == 0 {
        return Err(format!("No record found with id {}", id));
    }

    Ok(format!("Deleted record with id {}", id))
}

#[tauri::command]
pub fn new_dns(
    name: String,
    primary: String,
    secondary: String,
    state: tauri::State<'_, DbState>,
) -> Result<bool, bool> {
    let db = state.0.lock().map_err(|_| false)?;
    let mut display_order: i32 = db
        .query_row(
            "
        SELECT COALESCE(MAX(display_order), 0) FROM dns_entries
    ",
            [],
            |row| row.get(0),
        )
        .map_err(|_| false)?;
    display_order += 1;
    let row_inserted = db.execute("
        INSERT INTO dns_entries (name, primary_dns, secondary_dns, display_order) VALUES(?1, ?2, ?3, ?4)
        ", params![name, primary, secondary, display_order])
    .map_err(|_|{false})?;

    if row_inserted == 0 {
        return Err(false);
    }

    Ok(true)
}

#[tauri::command]
pub async fn set_dns(
    interface: &str,
    primary: &str,
    secondary: &str,
    state: tauri::State<'_, DbState>,
) -> Result<(), String> {
    let servers = if primary.is_empty() && secondary.is_empty() {
        String::new()
    } else if secondary.is_empty() {
        primary.to_string()
    } else {
        format!("{},{}", primary, secondary)
    };

    let mut wide: Vec<u16> = servers.encode_utf16().chain(std::iter::once(0)).collect();

    let settings = DNS_INTERFACE_SETTINGS {
        Version: DNS_INTERFACE_SETTINGS_VERSION1,
        Flags: DNS_SETTING_NAMESERVER as u64, // <-- required, or call silently no-ops
        NameServer: PWSTR(wide.as_mut_ptr()),
        ..Default::default()
    };

    let mut failure: Vec<&str> = vec![]; 

    if interface == "All Networks" {
        let interfaces = get_network_interfaces().map_err(|e| {log::error!("{}", e); e})?;
        for i in &interfaces {
            let guid = get_interface_guid_by_name(i).map_err(|e| {log::error!("{}", e); e})?;
            let result = unsafe {
                SetInterfaceDnsSettings(guid, &settings)
            };
            if result.is_err() {
                log::error!("failed to set dns error code: {:?}", result);
                failure.push(i);
            }
        }
        if failure.len() > 0 {
            return Err(format!("set dns failed for {} times on {:?}", failure.len(), failure));
        }
    }else {
        let guid = get_interface_guid_by_name(interface).map_err(|e| {log::error!("{}", e); e})?;
        let result = unsafe {
            SetInterfaceDnsSettings(guid, &settings)
        };
        if result.is_err() {
            log::error!("failed to set dns error code: {:?}", result);
            return Err("failed".to_string());
        }
    }

    // flush dns on change based on app configuration
    let configs: Configs = config::get_configs(state).map_err(|e| {log::error!("{}", e); e})?;
    if configs.flush_dns_on_change {
        flush_dns().map_err(|e| {log::error!("{:?}", e); "failed to flush dns"})?;
    }

    Ok(())
}


#[tauri::command]
pub async fn resolve(dns_server: String) -> Result<u128, String> {
    let dns_port = 53;
    let domain = "www.google.com.";

    let config = ResolverConfig::from_parts(
        None,
        vec![],
        NameServerConfigGroup::from_ips_clear(
            &[dns_server
                .trim()
                .parse()
                .map_err(|_| format!("Invalid DNS Ip Address: {}", dns_server.trim()))?],
            dns_port,
            true,
        ),
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
        return Err(format!("{} failure attempts of {}", failures, runs));
    } else {
        Ok(total_ms / (runs - failures))
    }
}

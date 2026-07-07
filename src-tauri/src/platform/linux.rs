use std::fs;
use std::path::PathBuf;
use std::process::Command;

use tauri::AppHandle;
use tauri::Manager;
use tauri_plugin_log::log;

use crate::database::config_repository::get;
use crate::database::db::DbState;

use super::DnsManager;
use super::ConfigManager;
pub struct LinuxDns;
pub struct LinuxConfig;


#[derive(Debug)]
pub struct DeviceConnection{
    pub device: String,
    pub connection: String,
}
pub fn get_devices_and_connections() -> Result<Vec<DeviceConnection>, String> {
    let output = Command::new("nmcli")
    .args([
        "-t",
        "-f",
        "DEVICE,CONNECTION",
        "device"
    ])
    .output()
    .map_err(|e| {log::error!("{e}"); e.to_string()})?;

    let result = String::from_utf8(output.stdout).map_err(|e| {log::error!("{e}"); e.to_string()})?;
    let mut interface_and_connection = Vec::new();

    for line in result.lines() {
        let (device, connection) = line.split_once(":").ok_or("Invalid nmcli output")?;
        interface_and_connection.push(DeviceConnection{
            device: device.to_string(),
            connection: connection.to_string()
        });
    }

    Ok(interface_and_connection)
}

pub fn modify_dns(connection: &str, dns: &str) -> Result<(), String> {
    let output = if dns.trim().is_empty() {
        Command::new("nmcli")
        .args([
        "connection",
        "modify",
        connection,
        "ipv4.dns",
        "",
        "ipv4.ignore-auto-dns",
        "no",
        ])
        .output()
        .map_err(|e| {log::error!("{e}"); e.to_string()})?
    }else {
        Command::new("nmcli")
        .args([
        "connection",
        "modify",
        connection,
        "ipv4.dns",
        dns,
        "ipv4.ignore-auto-dns",
        "yes",
        "ipv4.method",
        "auto"
        ])
        .output()
        .map_err(|e| {log::error!("{e}"); e.to_string()})?
    };

    
    if !output.status.success() {
        Err(format!("failed to modify dns settings for {connection}"))
    }else {
        Ok(())
    }
}

pub fn set_dns_to_all_via_nmcli(primary: &str, secondary: &str) -> Result<(), String>{
    let device_connection = get_devices_and_connections()?;
    let dns = format!("{primary} {secondary}");

    let mut failure = 0;
    let mut device_len = device_connection.len();

    for d_c in device_connection {
        if d_c.connection.is_empty() {
            device_len -= 1;
            continue;
        }

        if modify_dns(&d_c.connection, &dns).is_err() {
            failure += 1;
            continue;
        }
        if apply_changes(&d_c.device).is_err() {
            failure += 1;
        }
    }

    if failure > 0 {
        Err(format!("{failure} failures out of {device_len} attempts"))
    } else {
        Ok(())
    }

}

pub fn set_dns_via_nmcli(interface: &str, primary: &str, secondary: &str) -> Result<(), String> {
    let device_connection = get_devices_and_connections()?;
    let dns = format!("{primary} {secondary}");

    for d_c in device_connection {
        if d_c.device != interface || d_c.connection.is_empty() {
            continue;
        }
        
        modify_dns(&d_c.connection, &dns)?;

        apply_changes(&d_c.device)?;
        return Ok(())
        
    }

    Err(format!("failed to find proper connection for interface"))
}

pub fn apply_changes(device: &str) -> Result<(), String>{
    let output = Command::new("nmcli")
    .args([
        "device",
        "reapply",
        device
    ])
    .output()
    .map_err(|e| {log::error!("{e}"); e.to_string()})?;

    if !output.status.success() {
        Err(format!("could not reapply configs for {device}"))
    }else {
        Ok(())
    }
}

impl DnsManager for LinuxDns {
    fn flush_dns(&self) -> Result<(), String> {
        let output = std::process::Command::new("systemctl")
            .args(["restart", "systemd-resolved"])
            .output()
            .map_err(|e| {log::error!("{e}"); e.to_string()})?;
    
        if !output.status.success(){
            Err(format!("failed to flush DNS"))
        }
        else {
            Ok(())
        }
    }
    fn set_dns(&self, interface: &str, primary: &str, secondary: &str, state: tauri::State<DbState>) -> Result<(), String> {
        if interface == "All Networks" {
            set_dns_to_all_via_nmcli(primary, secondary)?;
        }else {
            set_dns_via_nmcli(interface, primary, secondary)?;
        }

        let configs = get(&state).map_err(|e| {log::error!("{:?}", e); "failed to fetch configs"})?;
        if configs.flush_dns_on_change {
            self.flush_dns()?;
        }
        Ok(())
    }
}


impl ConfigManager for LinuxConfig {
    fn toggle_autostart(&self, value: bool) -> Result<(), ()> {
        if value {
            enable_autostart()
        }else {
            disable_autostart()
        }
    }
    fn open_log_folder(&self, app: &AppHandle) -> Result<(), ()> {
        let path = app.path().app_log_dir().map_err(|e| log::error!("{}", e))?;

        std::process::Command::new("xdg-open")
        .arg(path)
        .spawn()
        .map_err(|e| log::error!("{}", e))?;
        
        Ok(())
    }
}

// enable and disable autostart for linux
pub fn enable_autostart() -> Result<(), ()> {
    let home = std::env::var("HOME").map_err(|e| log::error!("{}", e))?;
    let mut path = PathBuf::from(home);
    path.push(".config/autostart");

    fs::create_dir_all(&path).map_err(|e| log::error!("{}", e))?;

    path.push("out-dns.desktop");

    let exec_path = std::env::current_exe().map_err(|e| log::error!("{}", e))?
    .display().to_string();

    let content = format!(
        "[Desktop Entry]\n\
        Type=Application\n\
        Name=OutDNS\n\
        Exec={}\n\
        Hidden=false\n\
        X-GNOME-Autostart-enabled=true\n",
        exec_path
    );

    fs::write(path, content).map_err(|e| log::error!("{}", e))?;

    Ok(())
}
pub fn disable_autostart() -> Result<(), ()> {
    let home = std::env::var("HOME").map_err(|e| log::error!("{}", e))?;
    let path = format!("{}/.config/autostart/out-dns.desktop", home);

    if std::path::Path::new(&path).exists() {
        std::fs::remove_file(path).map_err(|e| log::error!("{}", e))?;
    }

    Ok(())
}

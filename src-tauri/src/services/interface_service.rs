use network_interface::{NetworkInterface, NetworkInterfaceConfig};
use tauri_plugin_log::log;

pub fn get_interfaces() -> Result<Vec<String>, ()> {
    let interfaces = NetworkInterface::show().map_err(|e| log::error!("{}", e))?;

    let names = interfaces.iter()
    .filter(|i| i.name != "lo")
    .map(|i| i.name.clone())
    .collect();

    Ok(names)
}
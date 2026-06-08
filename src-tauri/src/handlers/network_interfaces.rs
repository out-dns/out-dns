use network_interface::{NetworkInterface, NetworkInterfaceConfig};

#[tauri::command]
pub fn get_network_interfaces() -> Result<Vec<String>, String> {
    let interfaces = NetworkInterface::show()
        .map_err(|e| e.to_string())?;

    let names = interfaces
        .iter()
        .map(|i| i.name.clone())
        .collect();

    Ok(names)
}

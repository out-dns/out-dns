use std::os::windows::process::CommandExt;
use tauri_plugin_log::log;
use windows::Win32::NetworkManagement::IpHelper::*;
use windows::Win32::Networking::WinSock::AF_UNSPEC;
use windows::Win32::System::Com::CLSIDFromString;
use windows::core::{GUID, PCWSTR};
use network_interface::{NetworkInterface, NetworkInterfaceConfig};


use crate::handlers::config::Configs;
use super::DnsManager;

pub struct WindowsDns;
pub struct WindowsInterface;

impl DnsManager for WindowsDns {
    // flush dns to clear cache
    fn flush_dns(&self) -> Result<(), ()> {
        std::process::Command::new("ipconfig")
            .args(["/flushdns"])
            .creation_flags(0x08000000)
            .output()
            .map_err(|e| log::error!("{}", e))?;
        
            Ok(())
    }
    // set dns using windows api
fn set_dns(&self, interface: &str, primary: &str, secondary: &str, state: tauri::State<DbState>) -> Result<(), String> {
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
            let interfaces = get_network_interfaces().map_err(|e| {log::error!("{:?}", e); "failed to fetch interfaces"})?;
            for i in &interfaces {
                let guid = get_interface_guid_by_name(i).map_err(|e| {log::error!("{}", e); "failed to get interface GUID"})?;
                let result = unsafe { SetInterfaceDnsSettings(guid, &settings) };
                if result.is_err() {
                    log::error!("failed to set dns error code: {}", result);
                    failure.push(i);
                }
            }
            if failure.len() > 0 {
                return Err(format!(
                    "set dns failed for {} times on {}",
                    failure.len(),
                    failure
                ));
            }
        } else {
            let guid = get_interface_guid_by_name(interface).map_err(|e| {log::error!("{}", e); "failed to get interface GUID"})?;
            let result = unsafe { SetInterfaceDnsSettings(guid, &settings) };
            if result.is_err() {
                log::error!("failed to set dns error code: {}", result);
                return Err(format!("failed to set DNS for {}", interface));
            }
        }

        // flush dns on change based on app configuration
        let configs: Configs = config::get_configs(state).map_err(|e| {log::error!("{}", e); "failed to fetch configs"})?;
        if configs.flush_dns_on_change {
            self.flush_dns().map_err(|e| {log::error!("{:?}", e); "failed to flush DNS"})?;
        }

        Ok(())
    }
}

pub fn get_interface_guid_by_name(friendly_name: &str) -> Result<GUID, ()> {
    let mut buf_len: u32 = 15000; // MS-recommended starting size
    let mut buffer: Vec<u8>;

    loop {
        buffer = vec![0u8; buf_len as usize];
        let result = unsafe {
            GetAdaptersAddresses(
                AF_UNSPEC.0 as u32,
                GAA_FLAG_INCLUDE_PREFIX,
                None,
                Some(buffer.as_mut_ptr() as *mut IP_ADAPTER_ADDRESSES_LH),
                &mut buf_len,
            )
        };

        match result {
            0 => break,      // ERROR_SUCCESS
            111 => continue, // ERROR_BUFFER_OVERFLOW, buf_len updated, retry
            err => {
                log::error!("{}", err);
                return Err(());
            }
        }
    }

    let mut current = buffer.as_ptr() as *const IP_ADAPTER_ADDRESSES_LH;

    while !current.is_null() {
        let adapter = unsafe { &*current };

        let name = unsafe { adapter.FriendlyName.to_string() }
            .map_err(|e| log::error!("{}", e))?;

        if name == friendly_name {
            // AdapterName is a null-terminated ASCII string like "{GUID}"
            let guid_str = unsafe { adapter.AdapterName.to_string() }
                .map_err(|e| log::error!("{}", e))?;
            let wide: Vec<u16> = guid_str.encode_utf16().chain(std::iter::once(0)).collect();
            let guid = unsafe { CLSIDFromString(PCWSTR(wide.as_ptr())) }
                .map_err(|e| log::error!("{}", e))?;
            return Ok(guid);
        }

        current = adapter.Next;
    }

    Err(())
}

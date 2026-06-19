use network_interface::{NetworkInterface, NetworkInterfaceConfig};
use windows::core::{GUID, PCWSTR};
use windows::Win32::NetworkManagement::IpHelper::*;
use windows::Win32::Networking::WinSock::AF_UNSPEC;
use windows::Win32::System::Com::CLSIDFromString;

#[tauri::command]
pub fn get_network_interfaces() -> Result<Vec<String>, String> {
    let interfaces = NetworkInterface::show().map_err(|e| e.to_string())?;

    let names = interfaces.iter().map(|i| i.name.clone()).collect();

    Ok(names)
}

pub fn get_interface_guid_by_name(friendly_name: &str) -> Result<GUID, String> {
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
            err => return Err(format!("GetAdaptersAddresses failed: {}", err)),
        }
    }

    let mut current = buffer.as_ptr() as *const IP_ADAPTER_ADDRESSES_LH;

    while !current.is_null() {
        let adapter = unsafe { &*current };

        let name = unsafe { adapter.FriendlyName.to_string() }
            .map_err(|e| format!("name decode error: {}", e))?;

        if name == friendly_name {
            // AdapterName is a null-terminated ASCII string like "{GUID}"
            let guid_str = unsafe { adapter.AdapterName.to_string() }
                .map_err(|e| format!("adapter name decode error: {}", e))?;
            let wide: Vec<u16> = guid_str.encode_utf16().chain(std::iter::once(0)).collect();
            let guid = unsafe { CLSIDFromString(PCWSTR(wide.as_ptr())) }
                .map_err(|e| format!("GUID parse error: {:?}", e))?;
            return Ok(guid);
        }

        current = adapter.Next;
    }

    Err(format!("Interface '{}' not found", friendly_name))
}

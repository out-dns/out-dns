use tauri_plugin_log::log;

use super::DnsManager;

pub struct MacosDns;

impl DnsManager for MacosDns {
    fn flush_dns(&self) -> Result<(), ()> {
        std::process::Command::new("dscacheutil")
            .args(["-flushcache"])
            .output()
            .map_err(|e| log::error!("{}", e))?;

        std::process::Command::new("killall")
            .args(["-HUP", "mDNSResponder"])
            .output()
            .map_err(|e| log::error!("{}", e))?;

        Ok(())
    }
    fn set_dns(&self, interface: &str, primary: &str, secondary: &str) -> Result<(), String> {
        Ok(())
    }
}
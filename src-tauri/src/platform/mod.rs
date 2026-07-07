use tauri::AppHandle;

use crate::database::db::DbState;

#[cfg(target_os = "windows")]
pub mod windows;
#[cfg(target_os = "linux")]
pub mod linux;
#[cfg(target_os = "macos")]
pub mod macos;

pub trait DnsManager{
    fn flush_dns(&self) -> Result<(), String>;
    fn set_dns(&self, interface: &str, primary: &str, secondary: &str, state: tauri::State<DbState>) -> Result<(), String>;
}

pub trait ConfigManager {
    fn toggle_autostart(&self, value: bool) -> Result<(), ()>;
    fn open_log_folder(&self, app: &AppHandle) -> Result<(), ()>;
}

pub fn dns() -> Box<dyn DnsManager> {
    #[cfg(target_os = "windows")]{
        return Box::new(windows::WindowsDns);
    }
    #[cfg(target_os = "linux")]{
        return Box::new(linux::LinuxDns);
    }
    #[cfg(target_os = "macos")]{
        return Box::new(macos::MacosDns);
    }
}

pub fn config() -> Box<dyn ConfigManager> {
    #[cfg(target_os = "windows")]{
        return Box::new(windows::WindowsConfig);
    }
    #[cfg(target_os = "linux")]{
        return Box::new(linux::LinuxConfig);
    }
    #[cfg(target_os = "macos")]{
        return Box::new(macos::MacosConfig);
    }
}
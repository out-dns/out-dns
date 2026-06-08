
use crate::handlers::database::DbState;

#[tauri::command]
pub fn clear_cache() -> Result<String, String>{
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("ipconfig")
            .args(["/flushdns"])
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

#[tauri::command]
pub fn get_dns_from_db(state: tauri::State<DbState>) -> Result<Vec<String>, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = db.prepare("
        SELECT * FROM dns_entries
    ")
    .map_err(|e|{e.to_string()})?;
    
    let result = stmt.query_map([], |row|{
        row.get::<_,String>(0)
    })
    .map_err(|e|{e.to_string()})?
    .filter_map(|r|{r.ok()})
    .collect();

    Ok(result)
}
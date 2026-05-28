use serde::Serialize;

use super::NebulaError;

#[derive(Debug, Serialize)]
pub struct SystemStatus {
    pub platform: String,
    pub arch: String,
    pub debug: bool,
}

#[tauri::command]
pub fn get_system_status() -> Result<SystemStatus, NebulaError> {
    Ok(SystemStatus {
        platform: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        debug: cfg!(debug_assertions),
    })
}

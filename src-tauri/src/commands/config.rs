use crate::core::config::{load_config, save_config as write_config, AppConfig};

use super::NebulaError;

#[tauri::command]
pub fn get_config() -> Result<AppConfig, NebulaError> {
    load_config()
}

#[tauri::command]
pub fn save_config(config: AppConfig) -> Result<AppConfig, NebulaError> {
    write_config(&config)?;
    Ok(config)
}

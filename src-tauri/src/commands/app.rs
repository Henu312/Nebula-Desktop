use serde::Serialize;
use std::process::Command;

use super::NebulaError;

#[derive(Debug, Serialize)]
pub struct AppVersion {
    pub name: String,
    pub version: String,
}

#[tauri::command]
pub fn get_app_version() -> Result<AppVersion, NebulaError> {
    Ok(AppVersion {
        name: "Nebula Desktop".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

#[tauri::command]
pub fn launch_app(path: String) -> Result<(), NebulaError> {
    let trimmed = path.trim();

    if trimmed.is_empty() {
        return Err(NebulaError::with_detail(
            "launch_path_empty",
            "启动路径不能为空",
            "path",
        ));
    }

    Command::new(trimmed).spawn().map_err(|error| {
        NebulaError::with_detail("launch_failed", "启动应用失败", error.to_string())
    })?;

    Ok(())
}

use serde::Serialize;

use crate::core::window::enumerate_running_apps;

use super::NebulaError;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NotificationIndicator {
    pub window_id: String,
    pub process_id: u32,
    pub process_path: Option<String>,
    pub status: NotificationIndicatorStatus,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum NotificationIndicatorStatus {
    Normal,
    Active,
    Attention,
}

#[tauri::command]
pub fn get_notification_indicators() -> Result<Vec<NotificationIndicator>, NebulaError> {
    let apps = enumerate_running_apps()?;

    Ok(apps
        .into_iter()
        .map(|app| NotificationIndicator {
            window_id: app.window_id,
            process_id: app.process_id,
            process_path: app.process_path,
            status: if app.is_minimized {
                NotificationIndicatorStatus::Attention
            } else if app.is_foreground {
                NotificationIndicatorStatus::Active
            } else {
                NotificationIndicatorStatus::Normal
            },
        })
        .collect())
}

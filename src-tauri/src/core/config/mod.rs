//! Config Manager 模块。
//!
//! 负责用户配置读写、默认配置和配置迁移。

use std::{fs, path::PathBuf};

use serde::{Deserialize, Serialize};

use crate::commands::NebulaError;

const CONFIG_DIR_NAME: &str = "Nebula Desktop";
const CONFIG_FILE_NAME: &str = "config.json";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub taskbar_position: TaskbarPosition,
    pub dock_enabled: bool,
    pub blur: bool,
    pub theme: Theme,
    pub launcher_hotkey: String,
    pub taskbar_thickness: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TaskbarPosition {
    Top,
    Bottom,
    Left,
    Right,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum Theme {
    Dark,
    Light,
    System,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            taskbar_position: TaskbarPosition::Top,
            dock_enabled: false,
            blur: true,
            theme: Theme::Dark,
            launcher_hotkey: "Alt+Space".to_string(),
            taskbar_thickness: 56,
        }
    }
}

pub fn load_config() -> Result<AppConfig, NebulaError> {
    let path = config_file_path()?;

    if !path.exists() {
        let config = AppConfig::default();
        save_config(&config)?;
        return Ok(config);
    }

    let content = fs::read_to_string(&path).map_err(|error| {
        NebulaError::with_detail("config_read_failed", "读取配置文件失败", error.to_string())
    })?;

    serde_json::from_str::<AppConfig>(&content).map_err(|error| {
        NebulaError::with_detail("config_parse_failed", "解析配置文件失败", error.to_string())
    })
}

pub fn save_config(config: &AppConfig) -> Result<(), NebulaError> {
    validate_config(config)?;

    let path = config_file_path()?;
    let parent = path.parent().ok_or_else(|| {
        NebulaError::with_detail(
            "config_path_invalid",
            "配置文件路径无效",
            path.display().to_string(),
        )
    })?;

    fs::create_dir_all(parent).map_err(|error| {
        NebulaError::with_detail(
            "config_dir_create_failed",
            "创建配置目录失败",
            error.to_string(),
        )
    })?;

    let content = serde_json::to_string_pretty(config).map_err(|error| {
        NebulaError::with_detail(
            "config_serialize_failed",
            "序列化配置失败",
            error.to_string(),
        )
    })?;

    fs::write(&path, content).map_err(|error| {
        NebulaError::with_detail("config_write_failed", "写入配置文件失败", error.to_string())
    })
}

fn validate_config(config: &AppConfig) -> Result<(), NebulaError> {
    if !(32..=96).contains(&config.taskbar_thickness) {
        return Err(NebulaError::with_detail(
            "config_invalid_taskbar_thickness",
            "Taskbar 厚度必须在 32 到 96 之间",
            config.taskbar_thickness.to_string(),
        ));
    }

    if config.launcher_hotkey.trim().is_empty() {
        return Err(NebulaError::with_detail(
            "config_invalid_launcher_hotkey",
            "Launcher 快捷键不能为空",
            "launcherHotkey",
        ));
    }

    Ok(())
}

fn config_file_path() -> Result<PathBuf, NebulaError> {
    let base = std::env::var_os("APPDATA")
        .or_else(|| std::env::var_os("LOCALAPPDATA"))
        .map(PathBuf::from)
        .ok_or_else(|| {
            NebulaError::with_detail(
                "config_base_dir_missing",
                "无法定位 Windows 用户配置目录",
                "APPDATA and LOCALAPPDATA are missing",
            )
        })?;

    Ok(base.join(CONFIG_DIR_NAME).join(CONFIG_FILE_NAME))
}

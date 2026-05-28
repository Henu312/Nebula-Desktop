//! Tauri Commands 入口。
//!
//! T1.1 开始在这里拆分并注册前后端 IPC 命令。

pub mod app;
pub mod appbar;
pub mod audio;
pub mod config;
mod error;
pub mod notification;
pub mod storage;
pub mod system;
pub mod window;

pub use error::NebulaError;

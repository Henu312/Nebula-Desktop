//! Window Manager 模块。
//!
//! 负责 Win32 窗口枚举、前台窗口、窗口激活和运行应用状态。

use serde::Serialize;
use windows::{
    core::PWSTR,
    Win32::{
        Foundation::{CloseHandle, HWND, LPARAM},
        System::Threading::{
            OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_WIN32,
            PROCESS_QUERY_LIMITED_INFORMATION,
        },
        UI::WindowsAndMessaging::{
            EnumWindows, GetForegroundWindow, GetWindowPlacement, GetWindowTextLengthW,
            GetWindowTextW, GetWindowThreadProcessId, IsIconic, IsWindowVisible,
            SetForegroundWindow, ShowWindow, SW_MINIMIZE, SW_RESTORE, SW_SHOWMINIMIZED,
            WINDOWPLACEMENT,
        },
    },
};

use crate::commands::NebulaError;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RunningApp {
    pub window_id: String,
    pub title: String,
    pub process_id: u32,
    pub process_path: Option<String>,
    pub is_foreground: bool,
    pub is_minimized: bool,
}

struct EnumContext {
    foreground: HWND,
    windows: Vec<RunningApp>,
}

pub fn enumerate_running_apps() -> Result<Vec<RunningApp>, NebulaError> {
    let foreground = unsafe { GetForegroundWindow() };
    let mut context = EnumContext {
        foreground,
        windows: Vec::new(),
    };

    unsafe {
        EnumWindows(
            Some(enum_windows_proc),
            LPARAM((&mut context as *mut EnumContext) as isize),
        )
    }
    .map_err(|error| {
        NebulaError::with_detail("window_enum_failed", "枚举窗口失败", error.to_string())
    })?;

    Ok(context.windows)
}

pub fn get_foreground_running_app() -> Result<Option<RunningApp>, NebulaError> {
    let foreground = unsafe { GetForegroundWindow() };

    if foreground.0.is_null() {
        return Ok(None);
    }

    Ok(app_from_hwnd(foreground, foreground))
}

pub fn activate_window_by_id(window_id: &str) -> Result<(), NebulaError> {
    let hwnd = hwnd_from_id(window_id)?;

    if is_minimized(hwnd) {
        unsafe {
            let _ = ShowWindow(hwnd, SW_RESTORE);
        }
    }

    if !unsafe { SetForegroundWindow(hwnd).as_bool() } {
        return Err(NebulaError::with_detail(
            "window_activate_failed",
            "激活窗口失败",
            window_id,
        ));
    }

    Ok(())
}

pub fn restore_window_by_id(window_id: &str) -> Result<(), NebulaError> {
    let hwnd = hwnd_from_id(window_id)?;

    unsafe {
        let _ = ShowWindow(hwnd, SW_RESTORE);
    }

    let _ = unsafe { SetForegroundWindow(hwnd) };

    Ok(())
}

pub fn minimize_window_by_id(window_id: &str) -> Result<(), NebulaError> {
    let hwnd = hwnd_from_id(window_id)?;

    unsafe {
        let _ = ShowWindow(hwnd, SW_MINIMIZE);
    }

    Ok(())
}

unsafe extern "system" fn enum_windows_proc(hwnd: HWND, lparam: LPARAM) -> windows::core::BOOL {
    let context = unsafe { &mut *(lparam.0 as *mut EnumContext) };

    if let Some(app) = app_from_hwnd(hwnd, context.foreground) {
        context.windows.push(app);
    }

    true.into()
}

fn app_from_hwnd(hwnd: HWND, foreground: HWND) -> Option<RunningApp> {
    if !unsafe { IsWindowVisible(hwnd).as_bool() } {
        return None;
    }

    let title = window_title(hwnd)?;

    if is_noise_title(&title) {
        return None;
    }

    let process_id = window_process_id(hwnd);

    Some(RunningApp {
        window_id: hwnd_to_id(hwnd),
        title,
        process_id,
        process_path: process_path(process_id),
        is_foreground: hwnd == foreground,
        is_minimized: is_minimized(hwnd),
    })
}

fn window_title(hwnd: HWND) -> Option<String> {
    let length = unsafe { GetWindowTextLengthW(hwnd) };

    if length <= 0 {
        return None;
    }

    let mut buffer = vec![0u16; length as usize + 1];
    let copied = unsafe { GetWindowTextW(hwnd, &mut buffer) };

    if copied <= 0 {
        return None;
    }

    let title = String::from_utf16_lossy(&buffer[..copied as usize])
        .trim()
        .to_string();

    if title.is_empty() {
        None
    } else {
        Some(title)
    }
}

fn window_process_id(hwnd: HWND) -> u32 {
    let mut process_id = 0;
    unsafe {
        GetWindowThreadProcessId(hwnd, Some(&mut process_id));
    }
    process_id
}

fn process_path(process_id: u32) -> Option<String> {
    if process_id == 0 {
        return None;
    }

    let handle =
        unsafe { OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, process_id) }.ok()?;
    let mut buffer = vec![0u16; 32768];
    let mut size = buffer.len() as u32;

    let result = unsafe {
        QueryFullProcessImageNameW(
            handle,
            PROCESS_NAME_WIN32,
            PWSTR(buffer.as_mut_ptr()),
            &mut size,
        )
    };
    let _ = unsafe { CloseHandle(handle) };

    result.ok()?;

    Some(String::from_utf16_lossy(&buffer[..size as usize]))
}

fn is_minimized(hwnd: HWND) -> bool {
    let mut placement = WINDOWPLACEMENT {
        length: std::mem::size_of::<WINDOWPLACEMENT>() as u32,
        ..WINDOWPLACEMENT::default()
    };

    if unsafe { GetWindowPlacement(hwnd, &mut placement) }.is_ok() {
        return placement.showCmd == SW_SHOWMINIMIZED.0 as u32;
    }

    unsafe { IsIconic(hwnd).as_bool() }
}

fn hwnd_to_id(hwnd: HWND) -> String {
    format!("{:x}", hwnd.0 as usize)
}

fn hwnd_from_id(window_id: &str) -> Result<HWND, NebulaError> {
    let value = usize::from_str_radix(window_id.trim(), 16).map_err(|error| {
        NebulaError::with_detail("window_id_invalid", "窗口 ID 格式无效", error.to_string())
    })?;

    if value == 0 {
        return Err(NebulaError::with_detail(
            "window_id_invalid",
            "窗口 ID 不能为空",
            window_id,
        ));
    }

    Ok(HWND(value as *mut core::ffi::c_void))
}

fn is_noise_title(title: &str) -> bool {
    matches!(title, "Program Manager" | "Windows 输入体验")
}

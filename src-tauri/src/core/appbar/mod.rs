//! AppBar Manager 模块。
//!
//! 负责 Taskbar 屏幕边缘停靠和工作区预留。

use std::sync::{Mutex, OnceLock};

use serde::Serialize;
use windows::Win32::{
    Foundation::{HWND, LPARAM, RECT},
    Graphics::Gdi::{GetMonitorInfoW, MonitorFromWindow, MONITORINFO, MONITOR_DEFAULTTONEAREST},
    UI::{
        Shell::{
            SHAppBarMessage, ABE_BOTTOM, ABE_LEFT, ABE_RIGHT, ABE_TOP, ABM_NEW, ABM_QUERYPOS,
            ABM_REMOVE, ABM_SETPOS, APPBARDATA,
        },
        WindowsAndMessaging::{SetWindowPos, HWND_TOPMOST, SWP_NOACTIVATE, SWP_SHOWWINDOW},
    },
};

use crate::{commands::NebulaError, core::config::TaskbarPosition};

const APPBAR_CALLBACK_MESSAGE: u32 = 0x8000 + 0x61;

static APPBAR_STATE: OnceLock<Mutex<Option<AppBarRegistration>>> = OnceLock::new();

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppBarStatus {
    pub registered: bool,
    pub hwnd: Option<String>,
    pub position: Option<TaskbarPosition>,
    pub thickness: Option<u32>,
    pub rect: Option<AppBarRect>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppBarRect {
    pub left: i32,
    pub top: i32,
    pub right: i32,
    pub bottom: i32,
}

#[derive(Debug, Clone)]
struct AppBarRegistration {
    hwnd: isize,
    position: TaskbarPosition,
    thickness: u32,
    rect: RECT,
}

pub fn register_appbar(
    hwnd: HWND,
    position: TaskbarPosition,
    thickness: u32,
) -> Result<AppBarStatus, NebulaError> {
    if hwnd.0.is_null() {
        return Err(NebulaError::with_detail(
            "appbar_hwnd_invalid",
            "AppBar 窗口句柄无效",
            "HWND is null",
        ));
    }

    let thickness = thickness.clamp(32, 128);
    let state = appbar_state();

    if let Some(existing) = state
        .lock()
        .map_err(|error| appbar_lock_error(error.to_string()))?
        .take()
    {
        remove_appbar(HWND(existing.hwnd as *mut core::ffi::c_void))?;
    }

    let mut data = appbar_data(hwnd);
    let result = unsafe { SHAppBarMessage(ABM_NEW, &mut data) };

    if result == 0 {
        return Err(NebulaError::with_detail(
            "appbar_register_failed",
            "注册 AppBar 失败",
            "SHAppBarMessage(ABM_NEW) returned 0",
        ));
    }

    let monitor_rect = monitor_rect(hwnd)?;
    data.uEdge = appbar_edge(&position);
    data.rc = requested_rect(monitor_rect, &position, thickness);

    unsafe {
        SHAppBarMessage(ABM_QUERYPOS, &mut data);
    }

    data.rc = adjusted_rect(data.rc, &position, thickness);

    unsafe {
        SHAppBarMessage(ABM_SETPOS, &mut data);
    }

    unsafe {
        SetWindowPos(
            hwnd,
            Some(HWND_TOPMOST),
            data.rc.left,
            data.rc.top,
            data.rc.right - data.rc.left,
            data.rc.bottom - data.rc.top,
            SWP_NOACTIVATE | SWP_SHOWWINDOW,
        )
    }
    .map_err(|error| {
        NebulaError::with_detail(
            "appbar_window_pos_failed",
            "设置 AppBar 窗口位置失败",
            error.to_string(),
        )
    })?;

    let registration = AppBarRegistration {
        hwnd: hwnd.0 as isize,
        position,
        thickness,
        rect: data.rc,
    };

    *state
        .lock()
        .map_err(|error| appbar_lock_error(error.to_string()))? = Some(registration);

    get_appbar_status()
}

pub fn unregister_appbar() -> Result<AppBarStatus, NebulaError> {
    let state = appbar_state();
    let existing = state
        .lock()
        .map_err(|error| appbar_lock_error(error.to_string()))?
        .take();

    if let Some(registration) = existing {
        remove_appbar(HWND(registration.hwnd as *mut core::ffi::c_void))?;
    }

    get_appbar_status()
}

pub fn get_appbar_status() -> Result<AppBarStatus, NebulaError> {
    let state = appbar_state();
    let guard = state
        .lock()
        .map_err(|error| appbar_lock_error(error.to_string()))?;

    let Some(registration) = guard.as_ref() else {
        return Ok(AppBarStatus {
            registered: false,
            hwnd: None,
            position: None,
            thickness: None,
            rect: None,
        });
    };

    Ok(AppBarStatus {
        registered: true,
        hwnd: Some(format!("{:x}", registration.hwnd as usize)),
        position: Some(registration.position.clone()),
        thickness: Some(registration.thickness),
        rect: Some(rect_to_status(registration.rect)),
    })
}

fn remove_appbar(hwnd: HWND) -> Result<(), NebulaError> {
    let mut data = appbar_data(hwnd);
    unsafe {
        SHAppBarMessage(ABM_REMOVE, &mut data);
    }

    Ok(())
}

fn appbar_state() -> &'static Mutex<Option<AppBarRegistration>> {
    APPBAR_STATE.get_or_init(|| Mutex::new(None))
}

fn appbar_data(hwnd: HWND) -> APPBARDATA {
    APPBARDATA {
        cbSize: std::mem::size_of::<APPBARDATA>() as u32,
        hWnd: hwnd,
        uCallbackMessage: APPBAR_CALLBACK_MESSAGE,
        uEdge: ABE_TOP,
        rc: RECT::default(),
        lParam: LPARAM(0),
    }
}

fn monitor_rect(hwnd: HWND) -> Result<RECT, NebulaError> {
    let monitor = unsafe { MonitorFromWindow(hwnd, MONITOR_DEFAULTTONEAREST) };
    let mut info = MONITORINFO {
        cbSize: std::mem::size_of::<MONITORINFO>() as u32,
        ..MONITORINFO::default()
    };

    if !unsafe { GetMonitorInfoW(monitor, &mut info).as_bool() } {
        return Err(NebulaError::with_detail(
            "appbar_monitor_failed",
            "获取显示器信息失败",
            "GetMonitorInfoW returned false",
        ));
    }

    Ok(info.rcMonitor)
}

fn appbar_edge(position: &TaskbarPosition) -> u32 {
    match position {
        TaskbarPosition::Top => ABE_TOP,
        TaskbarPosition::Bottom => ABE_BOTTOM,
        TaskbarPosition::Left => ABE_LEFT,
        TaskbarPosition::Right => ABE_RIGHT,
    }
}

fn requested_rect(mut rect: RECT, position: &TaskbarPosition, thickness: u32) -> RECT {
    let thickness = thickness as i32;

    match position {
        TaskbarPosition::Top => rect.bottom = rect.top + thickness,
        TaskbarPosition::Bottom => rect.top = rect.bottom - thickness,
        TaskbarPosition::Left => rect.right = rect.left + thickness,
        TaskbarPosition::Right => rect.left = rect.right - thickness,
    }

    rect
}

fn adjusted_rect(mut rect: RECT, position: &TaskbarPosition, thickness: u32) -> RECT {
    let thickness = thickness as i32;

    match position {
        TaskbarPosition::Top => rect.bottom = rect.top + thickness,
        TaskbarPosition::Bottom => rect.top = rect.bottom - thickness,
        TaskbarPosition::Left => rect.right = rect.left + thickness,
        TaskbarPosition::Right => rect.left = rect.right - thickness,
    }

    rect
}

fn rect_to_status(rect: RECT) -> AppBarRect {
    AppBarRect {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
    }
}

fn appbar_lock_error(detail: String) -> NebulaError {
    NebulaError::with_detail("appbar_state_lock_failed", "访问 AppBar 状态失败", detail)
}

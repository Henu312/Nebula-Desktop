use serde::Serialize;
use windows::Win32::{
    Media::Audio::{
        eConsole, eRender, Endpoints::IAudioEndpointVolume, IMMDeviceEnumerator, MMDeviceEnumerator,
    },
    System::Com::{
        CoCreateInstance, CoInitializeEx, CoUninitialize, CLSCTX_ALL, COINIT_APARTMENTTHREADED,
    },
};

use super::NebulaError;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VolumeStatus {
    pub value: f32,
}

#[tauri::command]
pub fn get_volume() -> Result<VolumeStatus, NebulaError> {
    with_endpoint_volume(|endpoint| {
        let value = unsafe { endpoint.GetMasterVolumeLevelScalar() }
            .map_err(audio_error("audio_get_volume_failed", "读取系统音量失败"))?;

        Ok(VolumeStatus {
            value: scalar_to_percent(value),
        })
    })
}

#[tauri::command]
pub fn set_volume(value: f32) -> Result<VolumeStatus, NebulaError> {
    let normalized = percent_to_scalar(value);

    with_endpoint_volume(|endpoint| {
        unsafe { endpoint.SetMasterVolumeLevelScalar(normalized, std::ptr::null()) }
            .map_err(audio_error("audio_set_volume_failed", "设置系统音量失败"))?;

        Ok(VolumeStatus {
            value: scalar_to_percent(normalized),
        })
    })
}

fn with_endpoint_volume<T>(
    action: impl FnOnce(&IAudioEndpointVolume) -> Result<T, NebulaError>,
) -> Result<T, NebulaError> {
    let com_initialized = unsafe { CoInitializeEx(None, COINIT_APARTMENTTHREADED).is_ok() };

    let result = (|| {
        let enumerator: IMMDeviceEnumerator =
            unsafe { CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL) }.map_err(
                audio_error("audio_device_enumerator_failed", "创建音频设备枚举器失败"),
            )?;
        let device = unsafe { enumerator.GetDefaultAudioEndpoint(eRender, eConsole) }
            .map_err(audio_error("audio_device_failed", "获取默认音频设备失败"))?;
        let endpoint: IAudioEndpointVolume = unsafe { device.Activate(CLSCTX_ALL, None) }
            .map_err(audio_error("audio_endpoint_failed", "激活音频端点失败"))?;

        action(&endpoint)
    })();

    if com_initialized {
        unsafe { CoUninitialize() };
    }

    result
}

fn percent_to_scalar(value: f32) -> f32 {
    (value / 100.0).clamp(0.0, 1.0)
}

fn scalar_to_percent(value: f32) -> f32 {
    (value.clamp(0.0, 1.0) * 100.0).round()
}

fn audio_error(
    code: &'static str,
    message: &'static str,
) -> impl FnOnce(windows::core::Error) -> NebulaError {
    move |error| NebulaError::with_detail(code, message, error.to_string())
}
